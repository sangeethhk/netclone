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

from app.config import (
    APP_NAME, APP_VERSION, APP_DESCRIPTION,
    ADMIN_DEFAULT_USERNAME, ADMIN_DEFAULT_PASSWORD,
    OPERATOR_DEFAULT_USERNAME, OPERATOR_DEFAULT_PASSWORD
)
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
    print(f"[{APP_NAME}] Initializing persistent database...")
    database.init_db()
    
    # 2. Seed Default MLSA Users for demonstration (configurable via environment)
    if not database.get_user(ADMIN_DEFAULT_USERNAME):
        print(f"[{APP_NAME}] Enrolling default MLSA administrative identity...")
        mlsa_engine.register_user(
            username=ADMIN_DEFAULT_USERNAME,
            password=ADMIN_DEFAULT_PASSWORD,
            role="security_admin",
            device_id="dev_gateway_00"
        )
    if not database.get_user(OPERATOR_DEFAULT_USERNAME):
        print(f"[{APP_NAME}] Enrolling default MLSA field operator...")
        mlsa_engine.register_user(
            username=OPERATOR_DEFAULT_USERNAME,
            password=OPERATOR_DEFAULT_PASSWORD,
            role="field_operator",
            device_id="dev_plc_03"
        )
        
    # 3. Load or Initialize AI Threat Detection Models
    print(f"[{APP_NAME}] Initializing AI Threat Detection Engine...")
    ae = AutoencoderDetector(input_dim=10)
    iso = IsolationForestDetector()
    
    if os.path.exists(AE_PATH) and os.path.exists(IF_PATH):
        print(f"[{APP_NAME}] Loading pre-trained models from {CACHE_DIR}...")
        ae.load_weights(AE_PATH)
        iso.load_weights(IF_PATH)
    else:
        print(f"[{APP_NAME}] Training baseline AI models on normal IoT distributions...")
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
    print(f"[{APP_NAME}] AI Ensemble ready (Autoencoder + Isolation Forest active).")
    
    # 4. Start Background Telemetry & Simulation Loop
    bg_task = asyncio.create_task(telemetry_background_loop())
    print(f"[{APP_NAME}] Background telemetry & Cyber Twin loop started.")
    
    yield
    
    bg_task.cancel()
    print(f"[{APP_NAME}] Server shutting down cleanly.")

app = FastAPI(
    title=f"{APP_NAME} Cyber Twin Framework API",
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    lifespan=lifespan
)

# Dynamic CORS Configuration from Environment
cors_env = os.getenv("CORS_ORIGINS", "*")
if cors_env.strip() == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
        "framework": APP_NAME,
        "description": APP_DESCRIPTION,
        "version": APP_VERSION,
        "status": "OPERATIONAL"
    }

if __name__ == "__main__":
    import uvicorn
    from app.config import HOST, PORT
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
