"""
Comprehensive Automated Test Suite for NetClone Framework
Tests AI Autoencoder, Isolation Forest, MLSA Negative Password Engine,
Cyber Twin state sync, Attack Simulation, Automated Defense, Real Hardware Ingestion,
Subnet Scanning, Attack Graph, Explainable AI, and Breach Simulator.
"""
import numpy as np
import os
import sys
import asyncio

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import ADMIN_DEFAULT_PASSWORD
from app.models.autoencoder import AutoencoderDetector
from app.models.isolation_forest import IsolationForestDetector, EnsembleThreatEngine
from app.core.cyber_twin import cyber_twin
from app.core.traffic_generator import traffic_gen
from app.core.attack_simulator import attack_sim
from app.core.mlsa_auth import mlsa_engine
from app.core.defense_engine import defense_engine
from app.core import database
from app.models.schemas import DeviceCreateRequest, RealDeviceIngestPayload
from app.core.attack_graph import attack_graph_engine
from app.models.xai_engine import xai_engine
from app.core.breach_simulator import breach_sim
from app.core.network_scanner import get_local_ip_and_subnet, scan_network_subnet
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_database_init():
    """Verifies SQLite tables creation and accessibility."""
    database.init_db()
    database.seed_default_devices(force=False)
    cyber_twin.reset_all()
    conn = database.get_connection()
    tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    conn.close()
    assert "users" in tables
    assert "devices" in tables
    assert "firewall_rules" in tables
    assert "security_alerts" in tables

def test_autoencoder_reconstruction():
    """Verifies that PyTorch Autoencoder detects anomalies with higher reconstruction MSE."""
    ae = AutoencoderDetector(input_dim=10)
    normal_data = traffic_gen.generate_baseline_dataset(n_samples=200)
    ae.train_baseline(normal_data, epochs=15)
    
    normal_sample = normal_data[0].tolist()
    normal_mse, is_anom_norm = ae.score_sample(normal_sample)
    
    anomaly_sample = [500.0, 100000.0, 0.5, 0.99, 0.01, 0.95, 20.0, 0.9, 0.2, 2.0]
    anomaly_mse, is_anom_bad = ae.score_sample(anomaly_sample)
    
    assert anomaly_mse > normal_mse
    assert is_anom_bad is True

def test_isolation_forest_scoring():
    """Verifies Isolation Forest flags anomalous vectors as outliers."""
    iso = IsolationForestDetector(contamination=0.1, n_estimators=50)
    normal_data = traffic_gen.generate_baseline_dataset(n_samples=200)
    iso.train_baseline(normal_data)
    
    normal_sample = normal_data[5].tolist()
    score_norm, is_out_norm = iso.score_sample(normal_sample)
    
    anomaly_sample = [600.0, 250000.0, 0.2, 0.98, 0.02, 0.99, 1200.0, 0.8, 0.9, 2.0]
    score_bad, is_out_bad = iso.score_sample(anomaly_sample)
    
    assert score_bad < score_norm
    assert is_out_bad is True

def test_mlsa_negative_passwords():
    """Tests MLSA registration, negative constraint validation, and authentication."""
    username = "test_user_7"
    password = "StrongPassword#2026"
    
    reg_res = mlsa_engine.register_user(username, password, "test_role", "dev_cam_01")
    assert reg_res["negative_rules_count"] == 8
    
    auth_valid = mlsa_engine.authenticate(username, password, "dev_cam_01")
    assert auth_valid.success is True
    assert auth_valid.negative_database_verified is True
    assert "LAYER_1_NEGATIVE_PASSWORD_CLEAR" in auth_valid.crypto_layers_passed
    assert len(auth_valid.negative_vectors_sampled) > 0
    
    auth_invalid = mlsa_engine.authenticate(username, "WrongPassword!99", "dev_cam_01")
    assert auth_invalid.success is False

def test_attack_simulation_and_packets():
    """Tests triggering attack simulation and generating malicious packet flows."""
    database.seed_default_devices(force=False)
    cyber_twin.reset_all()
    attack_sim.stop_attack()
    status = attack_sim.start_attack("DDOS_SYN_FLOOD", "dev_cam_01", intensity=1.5, duration_sec=30)
    assert status.is_active is True
    assert status.active_scenario == "DDOS_SYN_FLOOD"
    
    pkts = attack_sim.generate_attack_burst()
    assert len(pkts) > 0
    assert pkts[0].is_malicious is True
    assert pkts[0].flags == "SYN"
    
    dev = cyber_twin.devices.get("dev_cam_01")
    assert dev is not None
    assert dev.status == "ATTACKED"
    assert dev.threat_level > 50.0
    
    attack_sim.stop_attack()
    assert attack_sim.is_active is False

def test_automated_defense_quarantine():
    """Tests dynamic firewall rule creation and Cyber Twin device quarantine/restoration."""
    device_id = "dev_plc_03"
    
    success = defense_engine.manual_quarantine(device_id)
    assert success is True
    assert cyber_twin.devices[device_id].status == "QUARANTINED"
    
    rule = defense_engine.manual_add_rule({
        "source_ip": "192.168.1.200",
        "destination_ip": "192.168.1.103",
        "port": 502,
        "protocol": "TCP",
        "action": "DROP",
        "reason": "Test Industrial Protection Rule"
    })
    assert rule["rule_id"].startswith("FW-MAN-")
    
    assert defense_engine.remove_rule(rule["rule_id"]) is True
    
    restore_success = defense_engine.manual_restore(device_id)
    assert restore_success is True
    assert cyber_twin.devices[device_id].status == "NORMAL"

def test_real_device_crud_and_persistence():
    """Tests registering, querying, and deleting a real physical IoT hardware device."""
    dev_req = DeviceCreateRequest(
        id="dev_real_pi_test",
        name="Laboratory Raspberry Pi 4B",
        category="Edge Compute (Raspberry Pi)",
        ip="192.168.1.144",
        mac="B8:27:EB:12:34:56",
        open_ports=[22, 8080],
        protocols=["TCP", "HTTP"],
        mode="PHYSICAL",
        telemetry_type="Temperature, CPU & Camera Frames"
    )
    
    added_dev = cyber_twin.add_device(dev_req)
    assert added_dev.id == "dev_real_pi_test"
    assert added_dev.mode == "PHYSICAL"
    assert "dev_real_pi_test" in cyber_twin.devices
    
    # Verify in DB
    db_dev = database.get_device("dev_real_pi_test")
    assert db_dev is not None
    assert db_dev["ip"] == "192.168.1.144"
    assert db_dev["mode"] == "PHYSICAL"
    
    # Delete device
    deleted = cyber_twin.remove_device("dev_real_pi_test")
    assert deleted is True
    assert "dev_real_pi_test" not in cyber_twin.devices
    assert database.get_device("dev_real_pi_test") is None

def test_real_telemetry_ingestion():
    """Tests live sensor telemetry ingestion from physical hardware webhook."""
    payload = RealDeviceIngestPayload(
        device_id="dev_esp32_sensor",
        telemetry={"temperature_c": 28.4, "humidity_pct": 52.0, "status": "ONLINE"},
        cpu_usage=18.5,
        memory_usage=32.0,
        protocol="HTTP",
        packet_size=128
    )
    
    res = cyber_twin.ingest_real_telemetry(payload)
    assert res["status"] == "ACCEPTED"
    assert res["twin_synced"] is True
    assert "dev_esp32_sensor" in cyber_twin.devices
    assert cyber_twin.devices["dev_esp32_sensor"].mode == "PHYSICAL"
    
    # Clean up test device
    cyber_twin.remove_device("dev_esp32_sensor")

def test_network_scanner_subnet():
    """Tests local subnet prober utility and IP calculation."""
    local_ip, subnet = get_local_ip_and_subnet()
    assert isinstance(local_ip, str)
    assert "." in local_ip
    assert "/" in subnet
    
    # Quick probe of loopback
    res = asyncio.run(scan_network_subnet(target_subnet="127.0.0.1/32", timeout=0.5))
    assert res.subnet_scanned == "127.0.0.1/32"
    assert isinstance(res.devices_found, list)

def test_attack_graph_engine():
    """Tests dynamic directed attack graph kill chain calculation."""
    database.seed_default_devices(force=False)
    cyber_twin.reset_all()
    graph_res = attack_graph_engine.compute_attack_graph()
    assert len(graph_res.nodes) >= 4
    assert len(graph_res.edges) > 0
    assert isinstance(graph_res.crown_jewel_compromised, bool)

def test_xai_attribution_engine():
    """Tests Explainable AI attribution decomposing anomaly into dimension contributions."""
    feature_vec = [800.0, 150000.0, 0.4, 0.98, 0.02, 0.99, 1400.0, 0.85, 0.1, 2.0]
    ae = AutoencoderDetector(input_dim=10)
    iso = IsolationForestDetector()
    normal_data = traffic_gen.generate_baseline_dataset(n_samples=150)
    ae.train_baseline(normal_data, epochs=10)
    iso.train_baseline(normal_data)
    
    ensemble = EnsembleThreatEngine(ae, iso)
    detection = ensemble.evaluate_traffic_flow(0.0, feature_vec)
    
    report = xai_engine.explain_anomaly(detection, ae)
    assert len(report.attributions) == 10
    assert len(report.analyst_summary) > 0
    assert report.primary_driver in [a.feature_name for a in report.attributions]

def test_breach_benchmark_simulator():
    """Tests offline cracking benchmark: SHA-256 cracked vs MLSA Negative DB uncracked."""
    bench = breach_sim.simulate_breach_attack("admin")
    assert bench.sha256_cracked is True
    assert bench.sha256_recovered_plaintext == ADMIN_DEFAULT_PASSWORD
    assert bench.negative_db_cracked is False
    assert bench.negative_db_recovered_plaintext is None
    assert "MATHEMATICAL RESISTANCE PROOF" in bench.math_resistance_proof

def test_api_endpoints():
    """Tests core FastAPI endpoints including new real device, scan, and advanced intelligence routes."""
    database.seed_default_devices(force=False)
    cyber_twin.reset_all()
    # 1. Root
    resp = client.get("/")
    assert resp.status_code == 200
    
    # 2. Topology
    resp = client.get("/api/twin/topology")
    assert resp.status_code == 200
    data = resp.json()
    assert "devices" in data
    
    # 3. List devices
    resp = client.get("/api/twin/devices")
    assert resp.status_code == 200
    assert len(resp.json()) >= 4
    
    # 4. Attack Graph
    resp = client.get("/api/advanced/attack-graph")
    assert resp.status_code == 200
    assert "nodes" in resp.json()
    
    # 5. XAI Attribution
    resp = client.get("/api/advanced/xai-attribution")
    assert resp.status_code == 200
    assert "attributions" in resp.json()
    
    # 6. Breach Benchmark
    resp = client.post("/api/advanced/simulate-breach?username=admin")
    assert resp.status_code == 200
    assert resp.json()["sha256_cracked"] is True
    assert resp.json()["negative_db_cracked"] is False
