"""
NetClone Real-Time WebSocket Telemetry & Simulation Loop
Streams live IoT packet telemetry, Cyber Twin node states, AI threat metrics,
and automated defense events to connected dashboard clients.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import asyncio
import json
import time

from app.core.traffic_generator import traffic_gen
from app.core.cyber_twin import cyber_twin
from app.core.attack_simulator import attack_sim
from app.core.defense_engine import defense_engine
from app.api.detection_routes import detector_holder
from app.core import database

router = APIRouter(tags=["WebSocket Telemetry"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        data_text = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(data_text)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep-alive receive (dashboard can also send commands over WS)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


async def telemetry_background_loop():
    """
    Continuous background loop simulating physical/virtual network heartbeat,
    processing attack bursts, running AI inference, and broadcasting telemetry.
    """
    last_tick = time.time()
    
    while True:
        try:
            now = time.time()
            dt = max(now - last_tick, 0.5)
            last_tick = now
            
            recent_packets = []
            
            # 1. Generate normal background IoT traffic
            # Normal devices send 2-4 packets per tick
            for _ in range(3):
                pkt = traffic_gen.generate_normal_packet()
                recent_packets.append(pkt)
                
            # 2. Check and generate attack simulation traffic
            if attack_sim.is_active:
                attack_pkts = attack_sim.generate_attack_burst()
                recent_packets.extend(attack_pkts)
                
            # 3. Extract 10-D sliding window feature vector
            feature_vector, telemetry_meta = traffic_gen.extract_feature_vector()
            
            # 4. Run AI Threat Detection
            ensemble = detector_holder.get("ensemble")
            ai_result = None
            if ensemble:
                ai_result = ensemble.evaluate_traffic_flow(now, feature_vector)
                detector_holder["total_evaluated"] += 1
                
                # Check if attack was detected
                if ai_result.threat_level != "NORMAL":
                    detector_holder["threats_detected"] += 1
                    if attack_sim.is_active:
                        attack_sim.detected_by_ai = True
                        
                    # 5. Automated Defense Trigger
                    defense_res = defense_engine.process_threat_assessment(
                        assessment=ai_result,
                        target_device_id=attack_sim.target_device_id
                    )
                    if defense_res and defense_res.get("defense_triggered"):
                        attack_sim.defense_triggered = True
                        
            # 6. Aggregate Protocol Counts for Dashboard
            history = list(traffic_gen.packet_history)
            tcp_cnt = sum(1 for p in history if p.protocol == "TCP")
            udp_cnt = sum(1 for p in history if p.protocol == "UDP")
            mqtt_cnt = sum(1 for p in history if p.protocol == "MQTT")
            http_cnt = sum(1 for p in history if p.protocol in ["HTTP", "RTSP"])
            other_cnt = len(history) - (tcp_cnt + udp_cnt + mqtt_cnt + http_cnt)
            
            # 7. Construct Live Broadcast Payload
            payload = {
                "timestamp": now,
                "telemetry": {
                    "packet_rate": telemetry_meta.get("packet_rate", 20.0),
                    "byte_rate": telemetry_meta.get("byte_rate", 15000.0),
                    "tcp_count": tcp_cnt,
                    "udp_count": udp_cnt,
                    "mqtt_count": mqtt_cnt,
                    "http_count": http_cnt,
                    "other_count": max(other_cnt, 0),
                    "total_packets": len(history),
                    "recent_packets": [p.dict() for p in recent_packets[-8:]]
                },
                "topology": cyber_twin.get_topology().dict(),
                "ai_detection": ai_result.dict() if ai_result else {
                    "autoencoder_mse": 0.02,
                    "autoencoder_threshold": 0.045,
                    "autoencoder_flag": False,
                    "isolation_forest_score": 0.15,
                    "isolation_forest_flag": False,
                    "hybrid_threat_score": 5.0,
                    "threat_level": "NORMAL",
                    "classified_attack": None,
                    "confidence_pct": 95.0,
                    "feature_vector": feature_vector
                },
                "attack": attack_sim.get_status().dict(),
                "defense": {
                    "auto_defense_active": defense_engine.auto_defense_enabled,
                    "active_rules_count": len(database.get_active_firewall_rules()),
                    "total_mitigations": defense_engine.total_mitigations,
                    "quarantined_count": len([d for d in cyber_twin.devices.values() if d.status == "QUARANTINED"])
                }
            }
            
            # 8. Broadcast to all connected frontend dashboards
            if manager.active_connections:
                await manager.broadcast(payload)
                
        except Exception as e:
            # Keep the background loop resilient
            pass
            
        await asyncio.sleep(0.8)
