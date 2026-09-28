"""
Isolation Forest & Ensemble Threat Detection Engine for NetClone
Combines PyTorch Autoencoder reconstruction loss with Scikit-Learn Isolation Forest
to produce calibrated hybrid anomaly scores and attack classification.
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Tuple, List, Dict, Optional, Any
import joblib
import os
from app.models.autoencoder import AutoencoderDetector
from app.models.schemas import ThreatDetectionResult

class IsolationForestDetector:
    def __init__(self, contamination: float = 0.08, n_estimators: int = 100):
        self.contamination = contamination
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.is_trained = False

    def train_baseline(self, normal_samples: np.ndarray) -> None:
        """Trains Isolation Forest on scaled normal feature vectors."""
        scaled_samples = self.scaler.fit_transform(normal_samples)
        self.model.fit(scaled_samples)
        self.is_trained = True

    def score_sample(self, feature_vector: List[float]) -> Tuple[float, bool]:
        """
        Scores a single network flow vector.
        Returns: (raw_anomaly_score, is_outlier)
        Negative scores in scikit-learn mean outlier/anomaly.
        """
        if not self.is_trained:
            return 0.0, False
            
        scaled_vector = self.scaler.transform([feature_vector])
        # score_samples: lower score means more anomalous
        score = float(self.model.score_samples(scaled_vector)[0])
        # predict: -1 for outlier, 1 for inlier
        prediction = self.model.predict(scaled_vector)[0]
        is_outlier = bool(prediction == -1)
        
        return score, is_outlier

    def save_weights(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({"model": self.model, "scaler": self.scaler, "is_trained": self.is_trained}, path)

    def load_weights(self, path: str) -> bool:
        if not os.path.exists(path):
            return False
        data = joblib.load(path)
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.is_trained = data.get("is_trained", True)
        return True


class EnsembleThreatEngine:
    """
    Ensemble decision engine merging Autoencoder and Isolation Forest
    with heuristic attack signature classification.
    """
    def __init__(self, autoencoder: AutoencoderDetector, iso_forest: IsolationForestDetector):
        self.autoencoder = autoencoder
        self.iso_forest = iso_forest

    def evaluate_traffic_flow(self, timestamp: float, feature_vector: List[float]) -> ThreatDetectionResult:
        """
        Evaluates a 10-dimensional network feature vector through both AI models,
        calculates hybrid threat confidence score, and determines attack classification.
        """
        # Feature Indices:
        # 0: packet_rate, 1: byte_rate, 2: flow_duration, 3: syn_ratio, 4: ack_ratio,
        # 5: port_entropy, 6: avg_payload_size, 7: error_rate, 8: protocol_id, 9: conn_state
        
        ae_mse, ae_flag = self.autoencoder.score_sample(feature_vector)
        if_score, if_flag = self.iso_forest.score_sample(feature_vector)
        
        # Normalize Autoencoder MSE to 0-100% scale
        # If MSE equals threshold -> ~50% threat. If MSE is 3x threshold -> ~95% threat.
        ae_threat_ratio = (ae_mse / max(self.autoencoder.threshold, 0.001))
        ae_threat_norm = 1.0 / (1.0 + np.exp(-2.5 * (ae_threat_ratio - 1.0)))  # Sigmoid around threshold
        
        # Normalize Isolation Forest score to 0-100% scale
        # Standard IF score ranges roughly from -0.7 (severe anomaly) to +0.2 (very normal)
        # We invert and map to [0, 1]
        if_threat_norm = float(np.clip(0.5 - (if_score / 0.7), 0.0, 1.0))
        
        # Ensemble Fusion: Weighted combination (60% Autoencoder, 40% Isolation Forest)
        hybrid_score = (0.60 * ae_threat_norm + 0.40 * if_threat_norm) * 100.0
        hybrid_score = float(np.clip(hybrid_score, 0.0, 100.0))
        
        # Determine Threat Level
        if hybrid_score >= 70.0 or (ae_flag and if_flag):
            threat_level = "CRITICAL"
        elif hybrid_score >= 40.0 or ae_flag or if_flag:
            threat_level = "SUSPICIOUS"
        else:
            threat_level = "NORMAL"
            
        # Classify Attack Type based on feature signatures when threat is detected
        classified_attack = None
        if threat_level in ["SUSPICIOUS", "CRITICAL"]:
            pkt_rate = feature_vector[0]
            byte_rate = feature_vector[1]
            syn_ratio = feature_vector[3]
            port_entropy = feature_vector[5]
            payload_size = feature_vector[6]
            error_rate = feature_vector[7]
            
            if syn_ratio > 0.65 or pkt_rate > 150:
                classified_attack = "DDOS_SYN_FLOOD"
            elif port_entropy > 0.75:
                classified_attack = "PORT_SCAN"
            elif error_rate > 0.60:
                classified_attack = "BRUTE_FORCE"
            elif byte_rate > 250000:
                classified_attack = "DATA_EXFILTRATION"
            elif payload_size > 800 and error_rate > 0.3:
                classified_attack = "MALICIOUS_CMD"
            else:
                classified_attack = "MITM_TAMPER"
                
        confidence = float(np.clip(hybrid_score if threat_level != "NORMAL" else (100.0 - hybrid_score), 50.0, 99.8))
        
        return ThreatDetectionResult(
            timestamp=timestamp,
            autoencoder_mse=round(ae_mse, 6),
            autoencoder_threshold=round(self.autoencoder.threshold, 6),
            autoencoder_flag=ae_flag,
            isolation_forest_score=round(if_score, 4),
            isolation_forest_flag=if_flag,
            hybrid_threat_score=round(hybrid_score, 2),
            threat_level=threat_level,
            classified_attack=classified_attack,
            confidence_pct=round(confidence, 1),
            feature_vector=[round(float(v), 4) for v in feature_vector],
        )
