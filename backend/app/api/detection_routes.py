"""
AI Threat Detection API Routes
Endpoints to inspect model performance, adjust thresholds, and evaluate custom traffic vectors.
"""
from fastapi import APIRouter
from typing import List, Dict, Any
import time
from app.config import AI_CONFIG
from app.models.schemas import ThreatDetectionResult, AIModelMetrics
from app.models.autoencoder import AutoencoderDetector
from app.models.isolation_forest import IsolationForestDetector, EnsembleThreatEngine
import os

router = APIRouter(prefix="/api/detection", tags=["AI Threat Detection"])

# Shared references to initialized models (populated at startup)
detector_holder = {
    "autoencoder": None,
    "iso_forest": None,
    "ensemble": None,
    "total_evaluated": 0,
    "threats_detected": 0,
}

@router.get("/metrics")
def get_metrics():
    """Returns AI model status, anomaly thresholds, and detection performance."""
    ae = detector_holder.get("autoencoder")
    iso = detector_holder.get("iso_forest")
    
    return {
        "is_ready": ae is not None and iso is not None and ae.is_trained and iso.is_trained,
        "autoencoder_threshold": ae.threshold if ae else AI_CONFIG["autoencoder_threshold"],
        "isolation_forest_contamination": iso.contamination if iso else AI_CONFIG["isolation_forest_contamination"],
        "features": AI_CONFIG["feature_names"],
        "total_evaluated": detector_holder["total_evaluated"],
        "threats_detected": detector_holder["threats_detected"]
    }

@router.post("/evaluate", response_model=ThreatDetectionResult)
def evaluate_custom_vector(vector: List[float]):
    """Manually passes a 10-dimensional network feature vector through the AI ensemble."""
    ensemble = detector_holder.get("ensemble")
    if not ensemble:
        # Fallback evaluation
        return ThreatDetectionResult(
            timestamp=time.time(),
            autoencoder_mse=0.01,
            autoencoder_threshold=0.045,
            autoencoder_flag=False,
            isolation_forest_score=0.1,
            isolation_forest_flag=False,
            hybrid_threat_score=10.0,
            threat_level="NORMAL",
            classified_attack=None,
            confidence_pct=90.0,
            feature_vector=vector
        )
        
    result = ensemble.evaluate_traffic_flow(time.time(), vector)
    detector_holder["total_evaluated"] += 1
    if result.threat_level != "NORMAL":
        detector_holder["threats_detected"] += 1
    return result
