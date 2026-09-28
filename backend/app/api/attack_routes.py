"""
Attack Simulation API Routes
Endpoints to configure, trigger, and halt controlled cyberattacks inside the Cyber Twin.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.config import ATTACK_SCENARIOS
from app.models.schemas import AttackLaunchRequest, AttackStatus
from app.core.attack_simulator import attack_sim

router = APIRouter(prefix="/api/attack", tags=["Attack Simulation"])

@router.get("/scenarios")
def get_attack_scenarios():
    """Lists all available cyberattack scenarios with MITRE mappings and descriptions."""
    return ATTACK_SCENARIOS

@router.post("/start", response_model=AttackStatus)
def start_attack(req: AttackLaunchRequest):
    """Launches an attack scenario against a target Cyber Twin node."""
    try:
        status = attack_sim.start_attack(
            scenario_key=req.scenario_key,
            target_device_id=req.target_device_id,
            intensity=req.intensity,
            duration_sec=req.duration_sec
        )
        return status
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/stop", response_model=AttackStatus)
def stop_attack():
    """Stops the ongoing cyberattack simulation."""
    return attack_sim.stop_attack()

@router.get("/status", response_model=AttackStatus)
def get_attack_status():
    """Returns current active attack simulation state."""
    return attack_sim.get_status()
