"""
NetClone Attack Simulation Module
Generates realistic, controlled multi-vector cyberattack flows inside the Cyber Twin sandbox
without impacting physical IoT hardware.
"""
import time
import random
from typing import Dict, List, Optional, Any
from app.config import ATTACK_SCENARIOS, IOT_DEVICES
from app.models.schemas import TrafficPacket, AttackStatus
from app.core.traffic_generator import traffic_gen
from app.core.cyber_twin import cyber_twin

class AttackSimulator:
    def __init__(self):
        self.is_active = False
        self.current_scenario: Optional[str] = None
        self.target_device_id: Optional[str] = None
        self.intensity: float = 1.0
        self.duration_sec: int = 60
        self.start_time: float = 0.0
        self.packets_generated: int = 0
        self.detected_by_ai = False
        self.defense_triggered = False

    def start_attack(
        self,
        scenario_key: str,
        target_device_id: str,
        intensity: float = 1.0,
        duration_sec: int = 60
    ) -> AttackStatus:
        """Starts a controlled attack simulation targeting a Cyber Twin node."""
        if scenario_key not in ATTACK_SCENARIOS:
            raise ValueError(f"Unknown attack scenario: {scenario_key}")
            
        if target_device_id not in IOT_DEVICES and target_device_id not in cyber_twin.devices:
            target_device_id = ATTACK_SCENARIOS[scenario_key]["target_default"]
            
        self.is_active = True
        self.current_scenario = scenario_key
        self.target_device_id = target_device_id
        self.intensity = max(0.2, min(5.0, float(intensity)))
        self.duration_sec = duration_sec
        self.start_time = time.time()
        self.packets_generated = 0
        self.detected_by_ai = False
        self.defense_triggered = False
        
        # Mark target device under attack in Cyber Twin
        cyber_twin.update_device_metrics(
            device_id=target_device_id,
            cpu_load=random.uniform(75.0, 98.0),
            threat_level=85.0,
            status="ATTACKED"
        )
        
        return self.get_status()

    def stop_attack(self) -> AttackStatus:
        """Halts the active attack simulation."""
        if self.is_active and self.target_device_id:
            # Revert device status if not quarantined by automated defense
            dev = cyber_twin.devices.get(self.target_device_id)
            if dev and dev.status != "QUARANTINED":
                cyber_twin.update_device_metrics(
                    device_id=self.target_device_id,
                    cpu_load=15.0,
                    threat_level=0.0,
                    status="NORMAL"
                )
                
        self.is_active = False
        self.current_scenario = None
        return self.get_status()

    def get_status(self) -> AttackStatus:
        """Returns the current state of the attack simulation engine."""
        elapsed = time.time() - self.start_time if self.is_active else 0.0
        return AttackStatus(
            is_active=self.is_active,
            active_scenario=self.current_scenario,
            target_device_id=self.target_device_id,
            elapsed_seconds=round(elapsed, 1),
            packets_generated=self.packets_generated,
            detected_by_ai=self.detected_by_ai,
            defense_triggered=self.defense_triggered
        )

    def generate_attack_burst(self) -> List[TrafficPacket]:
        """
        Generates simulated malicious attack packets according to the active attack vector.
        Injected directly into the Cyber Twin telemetry stream.
        """
        if not self.is_active or not self.current_scenario or not self.target_device_id:
            return []
            
        # Check timeout
        if time.time() - self.start_time > self.duration_sec:
            self.stop_attack()
            return []
            
        target_dev = IOT_DEVICES.get(self.target_device_id, IOT_DEVICES["dev_gateway_00"])
        target_ip = target_dev["ip"]
        now = time.time()
        packets = []
        
        # Determine number of attack packets to generate this tick based on intensity
        if self.current_scenario == "DDOS_SYN_FLOOD":
            burst_size = int(random.randint(18, 40) * self.intensity)
            for _ in range(burst_size):
                spoofed_src = f"198.51.100.{random.randint(2, 254)}"
                pkt = TrafficPacket(
                    id=f"atk_ddos_{random.randint(10000, 99999)}",
                    timestamp=now,
                    src_ip=spoofed_src,
                    dst_ip=target_ip,
                    src_port=random.randint(1024, 65535),
                    dst_port=80,
                    protocol="TCP",
                    length=random.randint(40, 60),
                    flags="SYN",
                    is_malicious=True,
                    attack_label="DDOS_SYN_FLOOD",
                    payload_preview=f"[ATTACK] TCP SYN Flood seq={random.randint(100000, 999999)} win=1024"
                )
                packets.append(pkt)
                traffic_gen.record_packet(pkt)
                
        elif self.current_scenario == "PORT_SCAN":
            burst_size = int(random.randint(8, 20) * self.intensity)
            scanner_ip = "192.168.1.189"
            for _ in range(burst_size):
                probe_port = random.randint(1, 1024)
                pkt = TrafficPacket(
                    id=f"atk_scan_{random.randint(10000, 99999)}",
                    timestamp=now,
                    src_ip=scanner_ip,
                    dst_ip=target_ip,
                    src_port=random.randint(40000, 60000),
                    dst_port=probe_port,
                    protocol="TCP",
                    length=54,
                    flags="SYN,RST",
                    is_malicious=True,
                    attack_label="PORT_SCAN",
                    payload_preview=f"[ATTACK] Stealth SYN Port Scan probe port {probe_port}"
                )
                packets.append(pkt)
                traffic_gen.record_packet(pkt)
                
        elif self.current_scenario == "BRUTE_FORCE":
            burst_size = int(random.randint(5, 12) * self.intensity)
            attacker_ip = "192.168.1.205"
            common_passwords = ["admin123", "password", "root", "toor", "camera_pass", "12345678"]
            for _ in range(burst_size):
                pwd = random.choice(common_passwords)
                pkt = TrafficPacket(
                    id=f"atk_bf_{random.randint(10000, 99999)}",
                    timestamp=now,
                    src_ip=attacker_ip,
                    dst_ip=target_ip,
                    src_port=random.randint(1024, 65535),
                    dst_port=80,
                    protocol="HTTP",
                    length=random.randint(350, 480),
                    flags="ACK,PSH",
                    is_malicious=True,
                    attack_label="BRUTE_FORCE",
                    payload_preview=f"[ATTACK] POST /api/v1/auth/login user='admin' pass='{pwd}' [401 Unauthorized]"
                )
                packets.append(pkt)
                traffic_gen.record_packet(pkt)
                
        elif self.current_scenario == "MITM_TAMPER":
            burst_size = int(random.randint(4, 8) * self.intensity)
            rogue_ip = "192.168.1.220"
            for _ in range(burst_size):
                pkt = TrafficPacket(
                    id=f"atk_mitm_{random.randint(10000, 99999)}",
                    timestamp=now,
                    src_ip=rogue_ip,
                    dst_ip=target_ip,
                    src_port=random.randint(1024, 65535),
                    dst_port=5683,
                    protocol="CoAP",
                    length=280,
                    flags="ACK,PSH",
                    is_malicious=True,
                    attack_label="MITM_TAMPER",
                    payload_preview=f"[ATTACK] ARP Spoof Tampered Telemetry HR=220bpm SpO2=62% (CRITICAL FORGED)"
                )
                packets.append(pkt)
                traffic_gen.record_packet(pkt)
                
        elif self.current_scenario == "MALICIOUS_CMD":
            burst_size = int(random.randint(4, 10) * self.intensity)
            c2_ip = "203.0.113.88"
            for _ in range(burst_size):
                pkt = TrafficPacket(
                    id=f"atk_cmd_{random.randint(10000, 99999)}",
                    timestamp=now,
                    src_ip=c2_ip,
                    dst_ip=target_ip,
                    src_port=44818,
                    dst_port=502,
                    protocol="Modbus",
                    length=840,
                    flags="ACK,PSH",
                    is_malicious=True,
                    attack_label="MALICIOUS_CMD",
                    payload_preview=f"[ATTACK] Modbus Force Write Coil 0x0001=0xFF (Emergency Shutdown Override)"
                )
                packets.append(pkt)
                traffic_gen.record_packet(pkt)
                
        elif self.current_scenario == "DATA_EXFILTRATION":
            burst_size = int(random.randint(8, 16) * self.intensity)
            exfil_ip = "198.51.100.99"
            for _ in range(burst_size):
                pkt = TrafficPacket(
                    id=f"atk_exfil_{random.randint(10000, 99999)}",
                    timestamp=now,
                    src_ip=target_ip,
                    dst_ip=exfil_ip,
                    src_port=random.randint(40000, 60000),
                    dst_port=8443,
                    protocol="TCP",
                    length=1460,
                    flags="ACK,PSH",
                    is_malicious=True,
                    attack_label="DATA_EXFILTRATION",
                    payload_preview=f"[ATTACK] Encrypted binary data chunk exfiltration to unauthorized remote C2"
                )
                packets.append(pkt)
                traffic_gen.record_packet(pkt)

        self.packets_generated += len(packets)
        cyber_twin.update_device_metrics(self.target_device_id, packet_delta=len(packets))
        return packets

# Global attack simulator singleton
attack_sim = AttackSimulator()
