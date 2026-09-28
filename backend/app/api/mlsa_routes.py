"""
MLSA Authentication API Routes
Endpoints for user registration, multi-layer negative password authentication,
and negative database inspection.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.models.schemas import (
    MLSARegisterRequest, MLSALoginRequest, MLSAAuthResponse,
    NegativeVectorView, RiskChallengeRequest
)
from app.core.mlsa_auth import mlsa_engine
from app.core import database
from app.core.attack_simulator import attack_sim

router = APIRouter(prefix="/api/mlsa", tags=["MLSA Authentication"])

@router.post("/register")
def register_user(req: MLSARegisterRequest):
    """Registers a user or device with Encrypted Negative Password rules."""
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
    result = mlsa_engine.register_user(
        username=req.username,
        password=req.password,
        role=req.role,
        device_id=req.device_id
    )
    return {
        "status": "SUCCESS",
        "message": f"User '{req.username}' enrolled into MLSA negative database.",
        "data": result
    }

@router.post("/login", response_model=MLSAAuthResponse)
def login_user(req: MLSALoginRequest):
    """
    Executes MLSA multi-layer authentication:
    1. Negative Database constraint validation
    2. Salted PBKDF2-HMAC-SHA256 (100k rounds)
    3. Dynamic token issuance
    4. Risk-Adaptive assessment
    """
    current_threat = "CRITICAL" if (attack_sim.is_active and attack_sim.detected_by_ai) else (
        "SUSPICIOUS" if attack_sim.is_active else "NORMAL"
    )
    
    response = mlsa_engine.authenticate(
        username=req.username,
        password=req.password,
        device_id=req.device_id,
        current_threat_level=current_threat
    )
    return response

@router.get("/negative-db/{username}", response_model=List[NegativeVectorView])
def inspect_negative_db(username: str):
    """
    Inspects the Encrypted Negative Password rules stored for a user,
    demonstrating how complement vectors protect against database breach exposure.
    """
    user = database.get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    negative_rules = user.get("negative_rules", [])
    return [
        NegativeVectorView(
            index=r["index"],
            rule_mask=r["rule_mask"],
            negative_hash_prefix=r["negative_hash_prefix"],
            entropy_score=r["entropy_score"]
        ) for r in negative_rules
    ]
