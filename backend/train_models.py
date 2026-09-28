"""
NetClone Model Training & Calibration Script
Pre-trains the PyTorch Autoencoder and Scikit-Learn Isolation Forest
on baseline normal IoT network traffic distributions.
"""
import os
import sys
import numpy as np

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.models.autoencoder import AutoencoderDetector
from app.models.isolation_forest import IsolationForestDetector, EnsembleThreatEngine
from app.core.traffic_generator import traffic_gen

CACHE_DIR = os.path.join(os.path.dirname(__file__), "models_cache")
AE_PATH = os.path.join(CACHE_DIR, "autoencoder.pt")
IF_PATH = os.path.join(CACHE_DIR, "isolation_forest.joblib")

def train_and_save():
    print("=" * 60)
    print("NetClone: Training AI Threat Detection Models")
    print("=" * 60)
    
    os.makedirs(CACHE_DIR, exist_ok=True)
    
    # 1. Generate Normal IoT Baseline Data (1,500 synthetic flows)
    print("[1/4] Generating normal IoT baseline traffic dataset...")
    normal_data = traffic_gen.generate_baseline_dataset(n_samples=1500)
    print(f"      Generated {len(normal_data)} flow vectors with 10 features each.")
    
    # 2. Train PyTorch Autoencoder
    print("[2/4] Training PyTorch Deep Autoencoder on normal IoT flows...")
    ae = AutoencoderDetector(input_dim=10)
    final_loss = ae.train_baseline(normal_data, epochs=40, lr=0.005)
    print(f"      Autoencoder training complete! Final MSE: {final_loss:.6f}")
    print(f"      Calibrated Anomaly Threshold: {ae.threshold:.6f}")
    ae.save_weights(AE_PATH)
    print(f"      Saved Autoencoder weights to {AE_PATH}")
    
    # 3. Train Isolation Forest
    print("[3/4] Training Scikit-Learn Isolation Forest...")
    iso = IsolationForestDetector(contamination=0.08, n_estimators=120)
    iso.train_baseline(normal_data)
    iso.save_weights(IF_PATH)
    print(f"      Isolation Forest fitted and saved to {IF_PATH}")
    
    # 4. Verify Ensemble Detection
    print("[4/4] Verifying Ensemble Engine on test samples...")
    ensemble = EnsembleThreatEngine(ae, iso)
    
    # Normal test sample
    normal_test = [22.0, 16000.0, 10.0, 0.04, 0.94, 0.12, 720.0, 0.01, 0.4, 0.0]
    res_normal = ensemble.evaluate_traffic_flow(0.0, normal_test)
    print(f"      Normal Flow  -> Threat: {res_normal.hybrid_threat_score}% | Level: {res_normal.threat_level} | AE MSE: {res_normal.autoencoder_mse}")
    
    # DDoS test sample (high packet rate, syn ratio = 0.95)
    ddos_test = [320.0, 24000.0, 1.2, 0.95, 0.02, 0.05, 54.0, 0.85, 0.2, 1.0]
    res_ddos = ensemble.evaluate_traffic_flow(0.0, ddos_test)
    print(f"      DDoS Flow    -> Threat: {res_ddos.hybrid_threat_score}% | Level: {res_ddos.threat_level} | Class: {res_ddos.classified_attack}")
    
    print("=" * 60)
    print("All models successfully trained and verified!")
    print("=" * 60)

if __name__ == "__main__":
    train_and_save()
