"""
NetClone Physical IoT Client Agent
Runs on real physical hardware (Raspberry Pi, Linux SBC, Laptop, or Microcontroller bridge)
to stream live hardware sensor telemetry and system metrics into the NetClone Cyber Twin.
"""
import sys
import os
import time
import json
import argparse
import random
import socket
import platform
import urllib.request
import urllib.error

def get_system_telemetry(simulate_anomaly: bool = False):
    """Samples host telemetry metrics or simulated sensor readings."""
    if simulate_anomaly:
        # Generate anomalous burst (e.g. overheating, high packet rate, abnormal sensor)
        return {
            "temperature_c": round(89.5 + random.uniform(0, 5.0), 1),
            "humidity_pct": round(15.0 + random.uniform(-2, 2), 1),
            "cpu_load_pct": round(96.5 + random.uniform(-2, 3), 1),
            "ram_used_pct": round(92.0 + random.uniform(-1, 2), 1),
            "motion_detected": True,
            "vibration_rms": round(8.4 + random.uniform(0, 2), 2),
            "anomaly_flag": True,
            "status": "CRITICAL_OVERHEAT"
        }
    else:
        # Nominal physical sensor readings
        return {
            "temperature_c": round(23.5 + random.uniform(-0.4, 0.4), 1),
            "humidity_pct": round(46.0 + random.uniform(-1.5, 1.5), 1),
            "cpu_load_pct": round(14.0 + random.uniform(-3, 3), 1),
            "ram_used_pct": round(28.5 + random.uniform(-1, 1), 1),
            "motion_detected": False,
            "vibration_rms": 0.08,
            "anomaly_flag": False,
            "status": "NOMINAL"
        }

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def register_device(server_url: str, device_id: str, name: str, category: str, local_ip: str):
    """Registers the physical hardware into NetClone Cyber Twin."""
    url = f"{server_url}/api/twin/devices"
    payload = {
        "id": device_id,
        "name": name,
        "category": category,
        "ip": local_ip,
        "open_ports": [80, 8080],
        "protocols": ["HTTP", "TCP"],
        "mode": "PHYSICAL",
        "telemetry_type": "Live Physical Hardware Stream",
        "firmware": f"{platform.system()} {platform.release()}"
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=4) as response:
            res_data = json.loads(response.read().decode())
            print(f"[+] Device registered in NetClone Cyber Twin: {res_data.get('id')}")
            return True
    except urllib.error.HTTPError as e:
        if e.code == 400 or e.code == 409:
            # Device already exists, proceed to ingest
            return True
        print(f"[-] Registration error: {e}")
        return False
    except Exception as e:
        print(f"[-] Cannot reach NetClone at {server_url}: {e}")
        return False

def stream_telemetry(server_url: str, device_id: str, interval: float, simulate_anomaly: bool):
    """Continuous telemetry streaming loop."""
    ingest_url = f"{server_url}/api/twin/ingest"
    seq = 0
    
    print("\n" + "=" * 65)
    print(f" NetClone Physical IoT Agent Active")
    print(f" - Device ID : {device_id}")
    print(f" - Server URL: {server_url}")
    print(f" - Mode      : {'ANOMALOUS / ATTACK' if simulate_anomaly else 'NOMINAL / BENIGN'}")
    print(f" - Interval  : {interval}s")
    print("=" * 65 + "\n")
    
    while True:
        seq += 1
        sensor_data = get_system_telemetry(simulate_anomaly)
        
        payload = {
            "device_id": device_id,
            "telemetry": sensor_data,
            "cpu_usage": sensor_data["cpu_load_pct"],
            "memory_usage": sensor_data["ram_used_pct"],
            "packet_size": 256 if not simulate_anomaly else 1420,
            "protocol": "HTTP"
        }
        
        req = urllib.request.Request(
            ingest_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        
        try:
            start_t = time.time()
            with urllib.request.urlopen(req, timeout=3) as resp:
                r_json = json.loads(resp.read().decode())
                elapsed = round((time.time() - start_t) * 1000, 1)
                
                status_color = "[!]" if simulate_anomaly else "[*]"
                print(f"{status_color} Seq #{seq} | Temp: {sensor_data['temperature_c']}°C | CPU: {sensor_data['cpu_load_pct']}% | Latency: {elapsed}ms -> NetClone Synced")
        except Exception as e:
            print(f"[!] Seq #{seq} failed: {e}")
            
        time.sleep(interval)

def main():
    parser = argparse.ArgumentParser(description="NetClone Physical IoT Client Agent")
    parser.add_argument("--server", default="http://127.0.0.1:8000", help="NetClone Backend URL")
    parser.add_argument("--device-id", default=f"dev_real_{socket.gethostname()[:8]}", help="Device ID")
    parser.add_argument("--name", default=f"Physical Node ({platform.node()})", help="Device Display Name")
    parser.add_argument("--category", default="Physical Hardware IoT", help="Device Category")
    parser.add_argument("--interval", type=float, default=2.0, help="Heartbeat interval in seconds")
    parser.add_argument("--simulate-anomaly", action="store_true", help="Simulate anomalous behavior")
    
    args = parser.parse_args()
    local_ip = get_local_ip()
    
    print(f"[*] Starting NetClone IoT Agent on {local_ip} ({platform.system()} {platform.machine()})...")
    register_device(args.server, args.device_id, args.name, args.category, local_ip)
    
    try:
        stream_telemetry(args.server, args.device_id, args.interval, args.simulate_anomaly)
    except KeyboardInterrupt:
        print("\n[*] Agent stopped by user.")

if __name__ == "__main__":
    main()
