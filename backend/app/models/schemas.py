"""
NetClone Pydantic Data Models & Schemas
Provides strict validation and API serialization for Cyber Twin, AI Threat Detection,
Real IoT Hardware Ingestion, Explainable AI (XAI), Attack Graph, and MLSA Breach Simulator.
"""
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, field_validator
import time

# --- Cyber Twin & IoT Devices ---

class IoTDevice(BaseModel):
    id: str
    name: str
    category: str
    ip: str
    mac: str
    open_ports: List[int]
    protocols: List[str]
    status: str = "NORMAL"  # NORMAL, SUSPICIOUS, ATTACKED, QUARANTINED, OFFLINE
    telemetry_type: str
    firmware: str
    cpu_usage: float = 12.5
    memory_usage: float = 28.0
    packet_count: int = 0
    threat_level: float = 0.0  # 0 to 100%
    last_seen: float = Field(default_factory=time.time)
    mode: str = "VIRTUAL"  # "PHYSICAL" or "VIRTUAL"
    is_live_reachable: bool = True
    ping_latency_ms: Optional[float] = None
    polling_url: Optional[str] = None
    auth_token: Optional[str] = None

class TwinTopology(BaseModel):
    devices: List[IoTDevice]
    gateway: IoTDevice
    total_active_links: int
    system_health_pct: float
    quarantined_count: int
    physical_count: int = 0

class DeviceCreateRequest(BaseModel):
    id: Optional[str] = None
    name: str
    category: str = "Smart Home / IoT"
    ip: str
    mac: Optional[str] = None
    open_ports: List[int] = [80]
    protocols: List[str] = ["TCP", "HTTP"]
    mode: str = "PHYSICAL"
    telemetry_type: str = "Sensor Readings & Metrics"
    firmware: str = "v1.0.0-real"
    polling_url: Optional[str] = None

    @field_validator('ip')
    @classmethod
    def sanitize_ip(cls, v: str) -> str:
        val = v.strip()
        parts = val.split('.')
        if len(parts) == 4 and parts[3] == '':
            return f"{parts[0]}.{parts[1]}.{parts[2]}.105"
        if len(parts) == 3 and not val.endswith('.'):
            return f"{val}.105"
        return val

class DeviceUpdateRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    ip: Optional[str] = None
    mac: Optional[str] = None
    open_ports: Optional[List[int]] = None
    protocols: Optional[List[str]] = None
    telemetry_type: Optional[str] = None
    firmware: Optional[str] = None

class RealDeviceIngestPayload(BaseModel):
    device_id: str
    auth_token: Optional[str] = None
    telemetry: Dict[str, Any]
    cpu_usage: Optional[float] = None
    memory_usage: Optional[float] = None
    packet_size: Optional[int] = 128
    protocol: Optional[str] = "HTTP"

class NetworkScanRequest(BaseModel):
    subnet: Optional[str] = None
    timeout_sec: float = 0.5

class DiscoveredDevice(BaseModel):
    ip: str
    hostname: Optional[str] = None
    open_ports: List[int] = []
    vendor: str = "Generic IoT"
    suggested_category: str = "Smart Home / Sensor"
    latency_ms: float = 0.0

class NetworkScanResponse(BaseModel):
    subnet_scanned: str
    devices_found: List[DiscoveredDevice]
    duration_sec: float

# --- Network Traffic & Telemetry ---

class TrafficPacket(BaseModel):
    id: str
    timestamp: float
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    length: int
    flags: str
    is_malicious: bool = False
    attack_label: Optional[str] = None
    payload_preview: str = ""

class TrafficTelemetry(BaseModel):
    timestamp: float
    packet_rate: float
    byte_rate: float
    tcp_count: int
    udp_count: int
    mqtt_count: int
    http_count: int
    other_count: int
    anomaly_flag: bool
    recent_packets: List[TrafficPacket] = []

# --- Attack Simulation ---

class AttackLaunchRequest(BaseModel):
    scenario_key: str
    target_device_id: str
    intensity: float = 1.0  # 0.2 (low) to 3.0 (high)
    duration_sec: int = 60

class AttackStatus(BaseModel):
    is_active: bool
    active_scenario: Optional[str] = None
    target_device_id: Optional[str] = None
    elapsed_seconds: float = 0.0
    packets_generated: int = 0
    detected_by_ai: bool = False
    defense_triggered: bool = False

# --- AI Threat Detection & XAI ---

class ThreatDetectionResult(BaseModel):
    timestamp: float
    autoencoder_mse: float
    autoencoder_threshold: float
    autoencoder_flag: bool
    isolation_forest_score: float  # -1 to 1
    isolation_forest_flag: bool
    hybrid_threat_score: float  # 0 to 100%
    threat_level: str  # NORMAL, SUSPICIOUS, CRITICAL
    classified_attack: Optional[str] = None
    confidence_pct: float
    feature_vector: List[float] = []

class AIModelMetrics(BaseModel):
    autoencoder_loss: float
    total_samples_analyzed: int
    true_positives: int
    false_positives: int
    detection_latency_ms: float
    is_trained: bool

class XAIAttribution(BaseModel):
    feature_name: str
    feature_value: float
    attribution_pct: float
    is_driver: bool
    explanation: str

class XAIReport(BaseModel):
    timestamp: float
    hybrid_threat_score: float
    threat_level: str
    classified_attack: Optional[str] = None
    is_zero_day: bool
    primary_driver: str
    attributions: List[XAIAttribution]
    analyst_summary: str

# --- Attack Graph & Lateral Movement ---

class AttackGraphNode(BaseModel):
    id: str
    label: str
    category: str
    ip: str
    is_entrypoint: bool
    is_crown_jewel: bool
    status: str
    vulnerability_score: float

class AttackGraphEdge(BaseModel):
    source: str
    target: str
    protocol: str
    port: int
    status: str  # "ACTIVE", "EXPLOITED", "SEVERED_BY_DEFENSE"
    exploit_technique: str

class AttackGraphResponse(BaseModel):
    nodes: List[AttackGraphNode]
    edges: List[AttackGraphEdge]
    active_kill_chain: List[str]
    defense_severed_at: Optional[str] = None
    crown_jewel_compromised: bool

# --- MLSA Authentication & Breach Bench ---

class MLSARegisterRequest(BaseModel):
    username: str
    password: str
    device_id: str
    role: str = "iot_operator"

class MLSALoginRequest(BaseModel):
    username: str
    password: str
    device_id: str
    client_nonce: Optional[str] = None

class NegativeVectorView(BaseModel):
    index: int
    rule_mask: str
    negative_hash_prefix: str
    entropy_score: float

class MLSAAuthResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    message: str
    username: str
    role: str
    negative_database_verified: bool
    crypto_layers_passed: List[str]
    risk_level: str
    execution_time_ms: float
    negative_vectors_sampled: List[NegativeVectorView] = []

class RiskChallengeRequest(BaseModel):
    username: str
    device_id: str
    challenge_token: str
    response_code: str

class BreachBenchResult(BaseModel):
    target_username: str
    target_password: str
    sha256_hash: str
    sha256_cracked: bool
    sha256_time_ms: float
    sha256_recovered_plaintext: Optional[str] = None
    negative_rules_count: int
    negative_db_cracked: bool
    negative_db_time_ms: float
    negative_db_recovered_plaintext: Optional[str] = None
    math_resistance_proof: str

# --- Automated Defense ---

class FirewallRule(BaseModel):
    rule_id: str
    source_ip: str
    destination_ip: str
    port: Optional[int] = None
    protocol: str = "ALL"
    action: str  # DROP, REJECT, RATE_LIMIT, QUARANTINE
    reason: str
    created_at: float = Field(default_factory=time.time)
    expires_at: Optional[float] = None
    is_active: bool = True
    mitre_attack_id: Optional[str] = None

class FirewallRuleCreate(BaseModel):
    source_ip: str
    destination_ip: str = "ANY"
    port: Optional[int] = None
    protocol: str = "ALL"
    action: str = "DROP"
    reason: str

class AutomatedDefenseState(BaseModel):
    auto_defense_active: bool
    active_rules_count: int
    quarantined_nodes: List[str]
    total_mitigations_executed: int
    firewall_rules: List[FirewallRule]

# --- Logs & Alerts ---

class SecurityAlert(BaseModel):
    id: str
    timestamp: float
    severity: str  # INFO, WARNING, CRITICAL
    title: str
    description: str
    source_device: str
    target_device: Optional[str] = None
    threat_score: float
    defense_applied: bool = False
    remediation_action: Optional[str] = None

class IncidentReport(BaseModel):
    generated_at: float
    total_threats_detected: int
    attacks_simulated: int
    firewall_rules_enacted: int
    quarantined_devices: List[str]
    mlsa_negative_db_inspections: int
    alerts: List[SecurityAlert]
    executive_summary: str
