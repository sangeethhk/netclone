"""
NetClone Cyber Twin Engine
Maintains the virtual mirrored representation of the IoT network topology, device states,
connections, telemetry counters, quarantine controls, and real hardware synchronization.
"""
import time
import uuid
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from app.models.schemas import IoTDevice, TwinTopology, DeviceCreateRequest, RealDeviceIngestPayload, TrafficPacket
from app.core import database
from app.core.network_scanner import ping_device_socket
from app.core.traffic_generator import traffic_gen

class CyberTwin:
    def __init__(self):
        self.devices: Dict[str, IoTDevice] = {}
        database.init_db()
        self.load_from_db()

    def load_from_db(self):
        """Loads all devices (physical hardware and virtual twins) from SQLite database."""
        db_devices = database.get_all_devices()
        self.devices.clear()
        
        for dev in db_devices:
            self.devices[dev["id"]] = IoTDevice(
                id=dev["id"],
                name=dev["name"],
                category=dev["category"],
                ip=dev["ip"],
                mac=dev.get("mac", "00:00:00:00:00:00"),
                open_ports=dev.get("open_ports", [80]),
                protocols=dev.get("protocols", ["TCP"]),
                status=dev.get("status", "NORMAL"),
                telemetry_type=dev.get("telemetry_type", "Telemetry"),
                firmware=dev.get("firmware", "v1.0.0"),
                cpu_usage=dev.get("cpu_usage", 12.0),
                memory_usage=dev.get("memory_usage", 25.0),
                packet_count=dev.get("packet_count", 0),
                threat_level=dev.get("threat_level", 0.0),
                last_seen=dev.get("last_seen", time.time()),
                mode=dev.get("mode", "VIRTUAL"),
                is_live_reachable=bool(dev.get("is_live_reachable", True)),
                ping_latency_ms=dev.get("ping_latency_ms", 2.0),
                polling_url=dev.get("polling_url"),
                auth_token=dev.get("auth_token")
            )

    def get_topology(self) -> TwinTopology:
        """Returns the current Cyber Twin network state."""
        device_list = [d for d_id, d in self.devices.items() if d_id != "dev_gateway_00"]
        gateway = self.devices.get("dev_gateway_00")
        
        # If gateway doesn't exist, create a fallback
        if not gateway:
            gateway = IoTDevice(
                id="dev_gateway_00",
                name="Central IoT Edge Gateway",
                category="Network Infrastructure",
                ip="192.168.1.1",
                mac="00:1A:2B:3C:4D:00",
                open_ports=[53, 67, 80, 443],
                protocols=["TCP", "UDP", "DNS", "DHCP", "HTTPS"],
                status="NORMAL",
                telemetry_type="Network Packet Routing",
                firmware="v5.2.0-core"
            )
            
        quarantined = [d for d in self.devices.values() if d.status == "QUARANTINED"]
        active_links = sum(1 for d in device_list if d.status != "QUARANTINED" and d.status != "OFFLINE")
        physical_count = sum(1 for d in self.devices.values() if d.mode == "PHYSICAL")
        
        # Calculate overall system health
        avg_threat = sum(d.threat_level for d in self.devices.values()) / max(len(self.devices), 1)
        system_health = max(0.0, min(100.0, 100.0 - avg_threat))
        
        return TwinTopology(
            devices=device_list,
            gateway=gateway,
            total_active_links=active_links,
            system_health_pct=round(system_health, 1),
            quarantined_count=len(quarantined),
            physical_count=physical_count
        )

    def add_device(self, req: DeviceCreateRequest) -> IoTDevice:
        """Registers a new physical IoT device or virtual twin into the Cyber Twin."""
        dev_id = req.id or f"dev_{req.mode.lower()}_{uuid.uuid4().hex[:6]}"
        mac_addr = req.mac or f"02:00:{uuid.uuid4().hex[:2]}:{uuid.uuid4().hex[:2]}:{uuid.uuid4().hex[:2]}:{uuid.uuid4().hex[:2]}"
        
        device_dict = {
            "id": dev_id,
            "name": req.name,
            "category": req.category,
            "ip": req.ip,
            "mac": mac_addr,
            "open_ports": req.open_ports,
            "protocols": req.protocols,
            "mode": req.mode.upper(),
            "status": "NORMAL",
            "telemetry_type": req.telemetry_type,
            "firmware": req.firmware,
            "cpu_usage": 10.0,
            "memory_usage": 20.0,
            "packet_count": 0,
            "threat_level": 0.0,
            "ping_latency_ms": 1.5 if req.mode == "PHYSICAL" else None,
            "is_live_reachable": True,
            "polling_url": req.polling_url,
            "auth_token": f"token_{uuid.uuid4().hex[:12]}"
        }
        
        database.insert_or_update_device(device_dict)
        new_dev = IoTDevice(**device_dict)
        self.devices[dev_id] = new_dev
        database.log_audit("CYBER_TWIN", "DEVICE_ADDED", f"Device {req.name} ({dev_id}, {req.mode}) added.")
        return new_dev

    def remove_device(self, device_id: str) -> bool:
        """Removes a device from the Cyber Twin and database."""
        if device_id in self.devices and device_id != "dev_gateway_00":
            del self.devices[device_id]
            database.delete_device(device_id)
            database.log_audit("CYBER_TWIN", "DEVICE_REMOVED", f"Device {device_id} deleted.")
            return True
        return False

    async def ping_device(self, device_id: str) -> Tuple[bool, float]:
        """Performs live TCP reachability test on physical or virtual device."""
        if device_id not in self.devices:
            return False, 0.0
            
        dev = self.devices[device_id]
        reachable, latency = await ping_device_socket(dev.ip, dev.open_ports)
        
        dev.is_live_reachable = reachable
        dev.ping_latency_ms = latency
        dev.last_seen = time.time()
        
        database.update_device_reachability_db(device_id, reachable, latency)
        return reachable, latency

    def ingest_real_telemetry(self, payload: RealDeviceIngestPayload) -> Dict[str, Any]:
        """
        Ingests real live sensor telemetry from physical IoT hardware (e.g. Raspberry Pi, ESP32),
        mirrors state in Cyber Twin, and feeds real packet into sliding-window AI feature extractor.
        """
        dev = self.devices.get(payload.device_id)
        now = time.time()
        
        if not dev:
            # Auto-register newly discovered physical device
            dev_req = DeviceCreateRequest(
                id=payload.device_id,
                name=f"Physical IoT Device ({payload.device_id})",
                category="Real IoT Hardware",
                ip="192.168.1.150",
                mode="PHYSICAL",
                telemetry_type="Live Sensor Stream"
            )
            dev = self.add_device(dev_req)
            
        # Update metrics
        dev.packet_count += 1
        dev.last_seen = now
        dev.is_live_reachable = True
        if payload.cpu_usage is not None:
            dev.cpu_usage = round(float(payload.cpu_usage), 1)
        if payload.memory_usage is not None:
            dev.memory_usage = round(float(payload.memory_usage), 1)
            
        # Construct real traffic packet
        packet = TrafficPacket(
            id=f"real_pkt_{dev.packet_count}_{int(now*1000)%10000}",
            timestamp=now,
            src_ip=dev.ip,
            dst_ip=self.devices.get("dev_gateway_00", dev).ip,
            src_port=54321,
            dst_port=dev.open_ports[0] if dev.open_ports else 80,
            protocol=payload.protocol or "HTTP",
            length=payload.packet_size or 128,
            flags="ACK,PSH",
            is_malicious=False,
            payload_preview=f"[REAL HARDWARE {dev.id}] {str(payload.telemetry)[:70]}"
        )
        
        # Inject into feature extraction sliding window
        traffic_gen.record_packet(packet)
        database.update_device_metrics_db(dev.id, packet_delta=1, cpu=dev.cpu_usage, memory=dev.memory_usage)
        
        return {
            "status": "ACCEPTED",
            "device_id": dev.id,
            "packets_total": dev.packet_count,
            "twin_synced": True,
            "timestamp": now
        }

    def update_device_metrics(
        self,
        device_id: str,
        packet_delta: int = 1,
        cpu_load: Optional[float] = None,
        threat_level: Optional[float] = None,
        status: Optional[str] = None
    ):
        """Updates real-time device telemetry inside the Cyber Twin."""
        if device_id in self.devices:
            dev = self.devices[device_id]
            dev.packet_count += packet_delta
            dev.last_seen = time.time()
            if cpu_load is not None:
                dev.cpu_usage = round(float(cpu_load), 1)
            if threat_level is not None:
                dev.threat_level = round(float(threat_level), 1)
            if status is not None:
                if dev.status == "QUARANTINED" and status != "NORMAL":
                    pass
                else:
                    dev.status = status

    def quarantine_device(self, device_id: str, reason: str = "Automated Defense Mitigation") -> bool:
        """Isolates a compromised device inside the Cyber Twin to prevent lateral movement."""
        if device_id in self.devices:
            self.devices[device_id].status = "QUARANTINED"
            self.devices[device_id].threat_level = 95.0
            database.update_device_metrics_db(device_id, packet_delta=0, threat=95.0, status="QUARANTINED")
            return True
        return False

    def restore_device(self, device_id: str) -> bool:
        """Restores a quarantined device back to NORMAL state."""
        if device_id in self.devices:
            self.devices[device_id].status = "NORMAL"
            self.devices[device_id].threat_level = 0.0
            self.devices[device_id].cpu_usage = 12.0
            database.update_device_metrics_db(device_id, packet_delta=0, threat=0.0, status="NORMAL")
            return True
        return False

    def reset_all(self):
        """Resets all Cyber Twin devices to default baseline."""
        self.load_from_db()
        for dev in self.devices.values():
            dev.status = "NORMAL"
            dev.threat_level = 0.0

# Global cyber twin instance
cyber_twin = CyberTwin()
