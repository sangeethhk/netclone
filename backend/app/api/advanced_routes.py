"""
NetClone Advanced Intelligence API Routes
Endpoints for Attack-Graph Kill Chains, Explainable AI (XAI) Attribution,
and MLSA Database Breach Simulator Benchmarks.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
import time
from app.models.schemas import AttackGraphResponse, XAIReport, BreachBenchResult
from app.core.attack_graph import attack_graph_engine
from app.models.xai_engine import xai_engine
from app.core.breach_simulator import breach_sim
from app.api.detection_routes import detector_holder
from app.core.traffic_generator import traffic_gen

router = APIRouter(prefix="/api/advanced", tags=["Advanced Security & XAI"])

@router.get("/attack-graph", response_model=AttackGraphResponse)
def get_attack_graph():
    """
    Returns the dynamic Directed Cyber Attack Graph:
    Evaluates feasible lateral movement paths from entrypoints to Crown Jewel assets,
    and identifies where dynamic firewall rules or quarantines severed the kill chain.
    """
    return attack_graph_engine.compute_attack_graph()

@router.get("/xai-attribution", response_model=XAIReport)
def get_xai_attribution():
    """
    Returns real-time Explainable AI (XAI) feature attribution:
    Decomposes Autoencoder reconstruction loss into dimension-wise contributions
    and plain-English forensic rationales.
    """
    feature_vec, _ = traffic_gen.extract_feature_vector()
    ensemble = detector_holder.get("ensemble")
    ae = detector_holder.get("autoencoder")
    
    if ensemble:
        detection = ensemble.evaluate_traffic_flow(time.time(), feature_vec)
    else:
        from app.models.schemas import ThreatDetectionResult
        detection = ThreatDetectionResult(
            timestamp=time.time(),
            autoencoder_mse=0.02,
            autoencoder_threshold=0.045,
            autoencoder_flag=False,
            isolation_forest_score=0.1,
            isolation_forest_flag=False,
            hybrid_threat_score=10.0,
            threat_level="NORMAL",
            classified_attack=None,
            confidence_pct=95.0,
            feature_vector=feature_vec
        )
        
    return xai_engine.explain_anomaly(detection, ae)

@router.post("/simulate-breach", response_model=BreachBenchResult)
def simulate_database_breach(username: str = "admin"):
    """
    Runs an empirical benchmark comparing traditional SHA-256 positive hash cracking
    against NetClone's MLSA Encrypted Negative Password complement database during a leak.
    """
    return breach_sim.simulate_breach_attack(username)
