"""
NetClone Backend Application Entrypoint
FastAPI application orchestrating Cyber Twin, AI Threat Detection,
MLSA Multi-Layer Authentication, Automated Defense, and WebSocket telemetry.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import os
import sys

from app.core import database
from app.core.mlsa_auth import mlsa_engine
from app.models.autoencoder import AutoencoderDetector
from app.models.isolation_forest import IsolationForestDetector, EnsembleThreatEngine
from app.api.detection_routes import detector_holder
from app.api.twin_routes import router as twin_router
from app.api.attack_routes import router as attack_router
from app.api.detection_routes import router as detection_router
from app.api.mlsa_routes import router as mlsa_router
from app.api.defense_routes import router as defense_router
from app.api.advanced_routes import router as advanced_router
from app.api.websocket import router as ws_router, telemetry_background_loop

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models_cache")
AE_PATH = os.path.join(CACHE_DIR, "autoencoder.pt")
IF_PATH = os.path.join(CACHE_DIR, "isolation_forest.joblib")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite Database
    print("[NetClone] Initializing persistent database...")
    database.init_db()
    
    # 2. Seed Default MLSA Users for demonstration
    if not database.get_user("admin"):
        print("[NetClone] Enrolling default MLSA administrative identity...")
        mlsa_engine.register_user(
            username="admin",
            password="AdminPassword#2026",
            role="security_admin",
            device_id="dev_gateway_00"
        )
    if not database.get_user("iot_engineer"):
        print("[NetClone] Enrolling default MLSA field operator...")
        mlsa_engine.register_user(
            username="iot_engineer",
            password="SmartSensor$77",
            role="field_operator",
            device_id="dev_plc_03"
        )
        
    # 3. Load or Initialize AI Threat Detection Models
    print("[NetClone] Initializing AI Threat Detection Engine...")
    ae = AutoencoderDetector(input_dim=10)
    iso = IsolationForestDetector()
    
    if os.path.exists(AE_PATH) and os.path.exists(IF_PATH):
        print(f"[NetClone] Loading pre-trained models from {CACHE_DIR}...")
        ae.load_weights(AE_PATH)
        iso.load_weights(IF_PATH)
    else:
        print("[NetClone] Training baseline AI models on normal IoT distributions...")
        from app.core.traffic_generator import traffic_gen
        normal_data = traffic_gen.generate_baseline_dataset(n_samples=1000)
        ae.train_baseline(normal_data, epochs=30)
        iso.train_baseline(normal_data)
        ae.save_weights(AE_PATH)
        iso.save_weights(IF_PATH)
        
    ensemble = EnsembleThreatEngine(ae, iso)
    detector_holder["autoencoder"] = ae
    detector_holder["iso_forest"] = iso
    detector_holder["ensemble"] = ensemble
    print("[NetClone] AI Ensemble ready (Autoencoder + Isolation Forest active).")
    
    # 4. Start Background Telemetry & Simulation Loop
    bg_task = asyncio.create_task(telemetry_background_loop())
    print("[NetClone] Background telemetry & Cyber Twin loop started.")
    
    yield
    
    bg_task.cancel()
    print("[NetClone] Server shutting down cleanly.")

app = FastAPI(
    title="NetClone Cyber Twin Framework API",
    description="AI-Driven Cyber Twin with Multi-Layer Security Authentication (MLSA) & Automated Defense",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite default port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(twin_router)
app.include_router(attack_router)
app.include_router(detection_router)
app.include_router(mlsa_router)
app.include_router(defense_router)
app.include_router(advanced_router)
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "framework": "NetClone",
        "description": "AI-Driven Cyber Twin Framework with MLSA & Automated Defense",
        "version": "2.0.0",
        "status": "OPERATIONAL"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
