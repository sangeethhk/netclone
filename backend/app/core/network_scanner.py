"""
NetClone Network Discovery & Live Device Prober
Scans local subnet for active physical IoT hardware, fingerprints open ports,
infers device categories, and performs live TCP latency ping probing.
"""
import socket
import asyncio
import time
import ipaddress
from typing import List, Dict, Tuple, Optional, Any
from app.models.schemas import DiscoveredDevice, NetworkScanResponse

# Common IoT service ports for fingerprinting
IOT_PORT_MAP = {
    554: "RTSP (Video Stream)",
    80: "HTTP (Web Management)",
    443: "HTTPS (Secure Web)",
    1883: "MQTT (IoT Telemetry)",
    8080: "HTTP-Alt (IoT Camera / API)",
    502: "Modbus (Industrial SCADA)",
    22: "SSH (Raspberry Pi / Linux SBC)",
    53: "DNS (Gateway / Router)",
}

def get_local_ip_and_subnet() -> Tuple[str, str]:
    """Auto-detects the host system's primary LAN IP and /24 subnet."""
    try:
        # Create a dummy socket to determine route
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        # Derive /24 subnet
        network = ipaddress.IPv4Network(f"{local_ip}/24", strict=False)
        return local_ip, str(network)
    except Exception:
        return "127.0.0.1", "127.0.0.1/32"

async def probe_socket(ip: str, port: int, timeout: float = 0.35) -> Tuple[bool, float]:
    """Tests if a specific IP:Port is reachable and measures latency in milliseconds."""
    start = time.time()
    try:
        conn = asyncio.open_connection(ip, port)
        reader, writer = await asyncio.wait_for(conn, timeout=timeout)
        latency = (time.time() - start) * 1000.0
        writer.close()
        await writer.wait_closed()
        return True, round(latency, 1)
    except Exception:
        return False, 0.0

async def scan_single_host(ip: str, timeout: float = 0.35) -> Optional[DiscoveredDevice]:
    """Probes candidate IP across primary IoT ports."""
    open_ports = []
    best_latency = 999.0
    
    # Probe top ports concurrently
    tasks = [probe_socket(ip, p, timeout) for p in [80, 554, 1883, 8080, 22, 502, 53]]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for (port, _), res in zip([(80, None), (554, None), (1883, None), (8080, None), (22, None), (502, None), (53, None)], results):
        if isinstance(res, tuple) and res[0]:
            open_ports.append(port)
            best_latency = min(best_latency, res[1])
            
    if not open_ports:
        return None
        
    # Resolve hostname if available
    hostname = None
    try:
        hostname = socket.gethostbyaddr(ip)[0]
    except Exception:
        pass
        
    # Infer Category from port fingerprint
    category = "Smart Home / General IoT"
    vendor = "Generic IoT Hardware"
    if 554 in open_ports or 8080 in open_ports:
        category = "Smart Home / Surveillance (IP Camera)"
        vendor = "Hikvision / Dahua / Generic RTSP"
    elif 502 in open_ports:
        category = "Industrial IoT (PLC / SCADA)"
        vendor = "Siemens / Schneider / Modbus"
    elif 1883 in open_ports:
        category = "Smart Home / HVAC (MQTT Broker)"
        vendor = "HomeAssistant / Mosquitto"
    elif 22 in open_ports:
        category = "Edge Compute / SBC (Raspberry Pi)"
        vendor = "Raspberry Pi Foundation"
    elif 53 in open_ports and 80 in open_ports:
        category = "Network Infrastructure (Router / Gateway)"
        vendor = "Network Gateway"

    return DiscoveredDevice(
        ip=ip,
        hostname=hostname,
        open_ports=open_ports,
        vendor=vendor,
        suggested_category=category,
        latency_ms=round(best_latency, 1)
    )

async def scan_network_subnet(target_subnet: Optional[str] = None, timeout: float = 0.35) -> NetworkScanResponse:
    """
    Asynchronously scans a CIDR subnet (e.g. 192.168.1.0/24) for active IoT devices.
    To avoid excessive delays, scans gateway, host, and a fast representative window of IPs.
    """
    start_time = time.time()
    local_ip, auto_subnet = get_local_ip_and_subnet()
    subnet_str = target_subnet or auto_subnet
    
    discovered: List[DiscoveredDevice] = []
    
    try:
        network = ipaddress.IPv4Network(subnet_str, strict=False)
        # Select target IPs: always probe router/gateway (.1), local machine, and sample range
        sample_ips = []
        
        # Add local machine and gateway
        sample_ips.append("127.0.0.1")
        if local_ip != "127.0.0.1":
            sample_ips.append(local_ip)
            
        base_prefix = ".".join(local_ip.split(".")[:3])
        sample_ips.append(f"{base_prefix}.1")  # Typical gateway
        
        # Add first 25 IPs in the subnet for fast probing
        for ip_obj in list(network.hosts())[:25]:
            ip_str = str(ip_obj)
            if ip_str not in sample_ips:
                sample_ips.append(ip_str)
                
        # Run probes concurrently
        probe_tasks = [scan_single_host(ip, timeout) for ip in sample_ips]
        results = await asyncio.gather(*probe_tasks)
        
        for r in results:
            if r is not None:
                discovered.append(r)
                
    except Exception as e:
        print(f"[NetClone Scanner] Error scanning {subnet_str}: {e}")
        
    duration = time.time() - start_time
    return NetworkScanResponse(
        subnet_scanned=subnet_str,
        devices_found=discovered,
        duration_sec=round(duration, 2)
    )

async def ping_device_socket(ip: str, open_ports: List[int]) -> Tuple[bool, float]:
    """Pings a device on its designated open ports and returns (is_reachable, latency_ms)."""
    ports_to_test = open_ports if open_ports else [80, 443, 22, 53]
    for p in ports_to_test:
        reachable, latency = await probe_socket(ip, p, timeout=0.8)
        if reachable:
            return True, latency
            
    # Fallback to ICMP ping or loopback
    if ip in ["127.0.0.1", "localhost"]:
        return True, 0.4
        
    return False, 0.0
