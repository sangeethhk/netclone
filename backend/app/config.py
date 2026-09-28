"""
NetClone Configuration Module
Defines IoT profiles, AI thresholds, MLSA security parameters, and defense policies.
"""
from typing import Dict, List, Any

# IoT Device Registry & Baseline Configurations
IOT_DEVICES: Dict[str, Dict[str, Any]] = {
    "dev_cam_01": {
        "id": "dev_cam_01",
        "name": "Smart IP Security Camera",
        "category": "Smart Home / Surveillance",
        "ip": "192.168.1.101",
        "mac": "00:1A:2B:3C:4D:01",
        "open_ports": [80, 554, 8080],
        "protocols": ["TCP", "RTSP", "HTTP"],
        "normal_packet_rate": (10, 30),  # packets per second range
        "normal_byte_rate": (15000, 45000),  # bytes per second
        "telemetry_type": "Video Stream & Motion Detection",
        "status": "NORMAL",
        "firmware": "v2.4.12-sec",
    },
    "dev_therm_02": {
        "id": "dev_therm_02",
        "name": "Smart Climate Thermostat",
        "category": "Smart Home / HVAC",
        "ip": "192.168.1.102",
        "mac": "00:1A:2B:3C:4D:02",
        "open_ports": [1883, 8883],
        "protocols": ["TCP", "MQTT"],
        "normal_packet_rate": (2, 8),
        "normal_byte_rate": (500, 2500),
        "telemetry_type": "Temperature & Humidity Telemetry",
        "status": "NORMAL",
        "firmware": "v1.8.0-iot",
    },
    "dev_plc_03": {
        "id": "dev_plc_03",
        "name": "Industrial SCADA PLC Controller",
        "category": "Industrial IoT (IIoT)",
        "ip": "192.168.1.103",
        "mac": "00:1A:2B:3C:4D:03",
        "open_ports": [502, 102],
        "protocols": ["TCP", "Modbus"],
        "normal_packet_rate": (5, 15),
        "normal_byte_rate": (2000, 8000),
        "telemetry_type": "Actuator State & Conveyor Speed",
        "status": "NORMAL",
        "firmware": "v3.1.4-rtos",
    },
    "dev_health_04": {
        "id": "dev_health_04",
        "name": "Hospital Patient Vital Monitor",
        "category": "Healthcare IoT (IoMT)",
        "ip": "192.168.1.104",
        "mac": "00:1A:2B:3C:4D:04",
        "open_ports": [2575, 5683],
        "protocols": ["TCP", "UDP", "HL7", "CoAP"],
        "normal_packet_rate": (4, 12),
        "normal_byte_rate": (1200, 4000),
        "telemetry_type": "ECG, SpO2 & Arterial Pressure",
        "status": "NORMAL",
        "firmware": "v4.0.1-medsafe",
    },
    "dev_gateway_00": {
        "id": "dev_gateway_00",
        "name": "Central IoT Edge Gateway",
        "category": "Network Infrastructure",
        "ip": "192.168.1.1",
        "mac": "00:1A:2B:3C:4D:00",
        "open_ports": [53, 67, 80, 443],
        "protocols": ["TCP", "UDP", "DNS", "DHCP", "HTTPS"],
        "normal_packet_rate": (30, 80),
        "normal_byte_rate": (35000, 120000),
        "telemetry_type": "Network Packet Routing & State Inspection",
        "status": "NORMAL",
        "firmware": "v5.2.0-core",
    },
}

# AI Detection Parameters
AI_CONFIG = {
    "autoencoder_threshold": 0.045,  # Reconstruction MSE threshold
    "isolation_forest_contamination": 0.08,
    "feature_dimensions": 10,
    "feature_names": [
        "packet_rate",
        "byte_rate",
        "flow_duration",
        "syn_ratio",
        "ack_ratio",
        "port_entropy",
        "avg_payload_size",
        "error_rate",
        "protocol_id",
        "conn_state",
    ],
    "high_threat_threshold": 75.0,  # Combined threat score %
    "suspicious_threat_threshold": 45.0,
}

# Attack Simulation Scenarios
ATTACK_SCENARIOS = {
    "DDOS_SYN_FLOOD": {
        "name": "DDoS / TCP SYN Flood",
        "description": "Floods target device with high-volume TCP SYN packets without completing the 3-way handshake.",
        "target_default": "dev_gateway_00",
        "severity": "CRITICAL",
        "mitre_id": "T1498.001",
    },
    "PORT_SCAN": {
        "name": "Port Scan / Reconnaissance",
        "description": "Probes sequential ports rapidly to identify open services and vulnerabilities.",
        "target_default": "dev_plc_03",
        "severity": "MEDIUM",
        "mitre_id": "T1046",
    },
    "BRUTE_FORCE": {
        "name": "Brute Force Authentication",
        "description": "High-frequency dictionary credential stuffing targeting IoT login endpoints.",
        "target_default": "dev_cam_01",
        "severity": "HIGH",
        "mitre_id": "T1110",
    },
    "MITM_TAMPER": {
        "name": "Man-in-the-Middle & Telemetry Tampering",
        "description": "Intercepts sensor telemetry and injects forged abnormal readings (e.g. vital metrics).",
        "target_default": "dev_health_04",
        "severity": "HIGH",
        "mitre_id": "T1557",
    },
    "MALICIOUS_CMD": {
        "name": "Industrial SCADA Command Injection",
        "description": "Transmits unauthorized actuator overrides and illegal Modbus coil writes.",
        "target_default": "dev_plc_03",
        "severity": "CRITICAL",
        "mitre_id": "T0855",
    },
    "DATA_EXFILTRATION": {
        "name": "Data Exfiltration Over Covert Channel",
        "description": "Stealthily streams bulk proprietary video/medical sensor packets to an unauthorized IP.",
        "target_default": "dev_health_04",
        "severity": "HIGH",
        "mitre_id": "T1048",
    },
}

# MLSA Security Settings
MLSA_CONFIG = {
    "negative_password_vectors": 8,  # Number of negative constraint vector clauses per user
    "pbkdf2_iterations": 100_000,
    "hash_algorithm": "sha256",
    "challenge_timeout_sec": 300,
    "session_token_lifetime_sec": 3600,
}

# Automated Defense Policy
DEFENSE_CONFIG = {
    "auto_mitigation_enabled": True,
    "auto_quarantine_on_critical": True,
    "rate_limit_on_suspicious": True,
    "default_block_duration_sec": 300,
}
