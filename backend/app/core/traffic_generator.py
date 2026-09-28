"""
IoT Traffic Generator & 10-Feature Sliding Window Preprocessor
Simulates realistic baseline IoT packets and extracts structured feature vectors
for AI threat detection according to the NetClone Dataset/Input Design.
"""
import time
import random
import math
import numpy as np
from typing import List, Dict, Tuple, Optional
from collections import deque
from app.config import IOT_DEVICES
from app.models.schemas import TrafficPacket, TrafficTelemetry

class TrafficGenerator:
    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.packet_history: deque = deque(maxlen=window_size)
        self.packet_counter = 0

    def generate_normal_packet(self) -> TrafficPacket:
        """Generates a realistic benign IoT network packet based on active devices."""
        self.packet_counter += 1
        now = time.time()
        
        # Pick random source device (excluding gateway)
        src_keys = ["dev_cam_01", "dev_therm_02", "dev_plc_03", "dev_health_04"]
        chosen_key = random.choice(src_keys)
        dev = IOT_DEVICES[chosen_key]
        
        src_ip = dev["ip"]
        dst_ip = IOT_DEVICES["dev_gateway_00"]["ip"]
        src_port = random.randint(1024, 65535)
        dst_port = random.choice(dev["open_ports"])
        protocol = random.choice(dev["protocols"])
        
        # Realistic payloads based on device category
        if "cam" in chosen_key:
            length = random.randint(800, 1460)
            flags = "ACK,PSH"
            preview = f"RTSP/1.0 RTP-H264-FRAME seq={self.packet_counter % 65535} len={length}"
        elif "therm" in chosen_key:
            length = random.randint(64, 180)
            flags = "ACK"
            temp = round(21.5 + random.uniform(-0.5, 0.5), 1)
            humidity = round(48.0 + random.uniform(-2, 2), 1)
            preview = f"MQTT PUB topic='home/hvac/telemetry' payload={{'t':{temp},'h':{humidity}}}"
        elif "plc" in chosen_key:
            length = random.randint(90, 260)
            flags = "ACK,PSH"
            preview = f"MODBUS/TCP Req: Read Holding Regs Unit=1 Addr=0x0020 Count=8"
        elif "health" in chosen_key:
            length = random.randint(120, 320)
            flags = "ACK"
            hr = random.randint(70, 78)
            spo2 = random.randint(97, 99)
            preview = f"HL7/CoAP Vitals HR={hr}bpm SpO2={spo2}% BP=118/76 Status=STABLE"
        else:
            length = random.randint(64, 512)
            flags = "ACK"
            preview = "TCP Data"

        packet = TrafficPacket(
            id=f"pkt_{self.packet_counter}_{int(now*1000)%10000}",
            timestamp=now,
            src_ip=src_ip,
            dst_ip=dst_ip,
            src_port=src_port,
            dst_port=dst_port,
            protocol=protocol,
            length=length,
            flags=flags,
            is_malicious=False,
            payload_preview=preview
        )
        
        self.packet_history.append(packet)
        return packet

    def record_packet(self, packet: TrafficPacket):
        """Records an external/attack packet into sliding window history."""
        self.packet_history.append(packet)

    def extract_feature_vector(self) -> Tuple[List[float], Dict[str, Any]]:
        """
        Extracts 10-dimensional feature vector from recent sliding window:
        1. packet_rate (pkts/sec)
        2. byte_rate (bytes/sec)
        3. flow_duration (sec)
        4. syn_ratio (0.0 to 1.0)
        5. ack_ratio (0.0 to 1.0)
        6. port_entropy (0.0 to 1.0)
        7. avg_payload_size (bytes)
        8. error_rate (0.0 to 1.0)
        9. protocol_id (0.1 to 1.0)
        10. conn_state (0.0=normal, 1.0=half-open, 2.0=anomaly)
        """
        if len(self.packet_history) < 2:
            # Baseline placeholder vector
            return [20.0, 15000.0, 5.0, 0.05, 0.90, 0.15, 750.0, 0.01, 0.5, 0.0], {}
            
        packets = list(self.packet_history)
        n = len(packets)
        time_span = max(packets[-1].timestamp - packets[0].timestamp, 0.1)
        
        packet_rate = n / time_span
        total_bytes = sum(p.length for p in packets)
        byte_rate = total_bytes / time_span
        flow_duration = min(time_span, 60.0)
        
        syn_count = sum(1 for p in packets if "SYN" in p.flags)
        ack_count = sum(1 for p in packets if "ACK" in p.flags)
        syn_ratio = syn_count / n
        ack_ratio = ack_count / n
        
        # Calculate destination port Shannon entropy
        port_counts = {}
        for p in packets:
            port_counts[p.dst_port] = port_counts.get(p.dst_port, 0) + 1
        entropy = 0.0
        for count in port_counts.values():
            p_i = count / n
            entropy -= p_i * math.log2(p_i)
        max_possible_entropy = math.log2(n) if n > 1 else 1.0
        normalized_port_entropy = entropy / max(max_possible_entropy, 1.0)
        
        avg_payload_size = total_bytes / n
        error_count = sum(1 for p in packets if "RST" in p.flags or p.is_malicious)
        error_rate = error_count / n
        
        # Protocol encoding (TCP=0.2, UDP=0.4, MQTT=0.6, RTSP=0.8, Modbus=1.0)
        proto_map = {"TCP": 0.2, "UDP": 0.4, "MQTT": 0.6, "RTSP": 0.8, "Modbus": 1.0, "HL7": 0.5}
        proto_id = float(np.mean([proto_map.get(p.protocol, 0.3) for p in packets]))
        
        conn_state = 1.0 if syn_ratio > 0.4 else (2.0 if error_rate > 0.4 else 0.0)
        
        feature_vector = [
            float(packet_rate),
            float(byte_rate),
            float(flow_duration),
            float(syn_ratio),
            float(ack_ratio),
            float(normalized_port_entropy),
            float(avg_payload_size),
            float(error_rate),
            float(proto_id),
            float(conn_state)
        ]
        
        telemetry_meta = {
            "packet_rate": round(packet_rate, 1),
            "byte_rate": round(byte_rate, 1),
            "total_bytes": total_bytes,
            "sample_count": n,
            "port_entropy": round(normalized_port_entropy, 3)
        }
        
        return feature_vector, telemetry_meta

    def generate_baseline_dataset(self, n_samples: int = 1200) -> np.ndarray:
        """
        Generates clean synthetic normal baseline IoT traffic vectors
        for pre-training the Autoencoder and Isolation Forest models.
        """
        data = []
        for _ in range(n_samples):
            pkt_rate = random.uniform(15.0, 45.0)
            byte_rate = pkt_rate * random.uniform(400, 1100)
            flow_duration = random.uniform(5.0, 50.0)
            syn_ratio = random.uniform(0.01, 0.08)
            ack_ratio = random.uniform(0.85, 0.98)
            port_entropy = random.uniform(0.05, 0.25)
            avg_payload = byte_rate / pkt_rate
            error_rate = random.uniform(0.00, 0.03)
            proto_id = random.choice([0.2, 0.4, 0.6, 0.8])
            conn_state = 0.0
            
            vec = [
                pkt_rate, byte_rate, flow_duration, syn_ratio, ack_ratio,
                port_entropy, avg_payload, error_rate, proto_id, conn_state
            ]
            data.append(vec)
            
        return np.array(data, dtype=np.float32)

# Global traffic generator singleton
traffic_gen = TrafficGenerator()
