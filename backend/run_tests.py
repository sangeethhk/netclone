"""
Automated Test Runner for NetClone Backend
Runs all unit and integration tests and prints clear diagnostic output.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from tests.test_netclone import (
    test_database_init,
    test_autoencoder_reconstruction,
    test_isolation_forest_scoring,
    test_mlsa_negative_passwords,
    test_attack_simulation_and_packets,
    test_automated_defense_quarantine,
    test_real_device_crud_and_persistence,
    test_real_telemetry_ingestion,
    test_network_scanner_subnet,
    test_attack_graph_engine,
    test_xai_attribution_engine,
    test_breach_benchmark_simulator,
    test_api_endpoints
)

def run_all():
    print("=" * 65)
    print("       NETCLONE EXTENDED BACKEND AUTOMATED TEST SUITE")
    print("=" * 65)
    
    tests = [
        ("Database Initialization & Persistence", test_database_init),
        ("PyTorch Autoencoder Reconstruction Loss & Anomaly Threshold", test_autoencoder_reconstruction),
        ("Scikit-Learn Isolation Forest Outlier Partitioning", test_isolation_forest_scoring),
        ("MLSA Encrypted Negative Passwords & Crypto Validation", test_mlsa_negative_passwords),
        ("Attack Simulator & Malicious Packet Injection", test_attack_simulation_and_packets),
        ("Automated Defense, Dynamic Firewall & Node Quarantine", test_automated_defense_quarantine),
        ("Real Physical IoT Device CRUD & SQLite Persistence", test_real_device_crud_and_persistence),
        ("Real Hardware Telemetry Ingestion Gateway", test_real_telemetry_ingestion),
        ("Local Network Subnet Auto-Discovery Prober", test_network_scanner_subnet),
        ("Directed Attack Graph & Lateral Movement Kill-Chain", test_attack_graph_engine),
        ("Explainable AI (XAI) Attribution & Forensic Rationale", test_xai_attribution_engine),
        ("MLSA vs Positive Hash Database Breach Bench", test_breach_benchmark_simulator),
        ("FastAPI REST Endpoints & Advanced Intelligence Routing", test_api_endpoints),
    ]
    
    passed = 0
    for name, fn in tests:
        try:
            print(f"[*] Running: {name} ...", end=" ", flush=True)
            fn()
            print("PASSED")
            passed += 1
        except Exception as e:
            print(f"FAILED: {e}")
            import traceback
            traceback.print_exc()
            
    print("=" * 65)
    print(f"Test Results: {passed}/{len(tests)} Subsystems Passed Successfully")
    print("=" * 65)
    return passed == len(tests)

if __name__ == "__main__":
    success = run_all()
    sys.exit(0 if success else 1)
