"""
Cyber Twin API Routes
Endpoints to query topology, inspect/add/delete devices, run live reachability pings,
execute LAN subnet discovery, and ingest live physical IoT hardware telemetry.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List, Optional
from app.core.cyber_twin import cyber_twin
from app.core.network_scanner import scan_network_subnet
from app.models.schemas import (
    TwinTopology, IoTDevice, DeviceCreateRequest, RealDeviceIngestPayload,
    NetworkScanRequest, NetworkScanResponse
)

router = APIRouter(prefix="/api/twin", tags=["Cyber Twin & IoT Fleet"])

@router.get("/topology", response_model=TwinTopology)
def get_topology():
    """Returns current Cyber Twin network nodes, gateway, active links, and health."""
    return cyber_twin.get_topology()

@router.get("/devices", response_model=List[IoTDevice])
def list_devices():
    """Lists all registered physical hardware and virtual digital twin devices."""
    return list(cyber_twin.devices.values())

@router.post("/devices", response_model=IoTDevice)
def add_device(req: DeviceCreateRequest):
    """Registers a new physical IoT device or virtual twin."""
    return cyber_twin.add_device(req)

@router.delete("/devices/{device_id}")
def delete_device(device_id: str):
    """Deletes a device from the Cyber Twin and database."""
    if device_id == "dev_gateway_00":
        raise HTTPException(status_code=400, detail="Cannot delete central edge gateway")
    success = cyber_twin.remove_device(device_id)
    if not success:
        raise HTTPException(status_code=404, detail="Device not found")
    return {"status": "SUCCESS", "message": f"Device {device_id} removed."}

@router.post("/devices/{device_id}/ping")
async def ping_device(device_id: str):
    """Executes live TCP socket probe to verify reachability and latency of physical hardware."""
    if device_id not in cyber_twin.devices:
        raise HTTPException(status_code=404, detail="Device not found")
    reachable, latency = await cyber_twin.ping_device(device_id)
    return {
        "device_id": device_id,
        "is_reachable": reachable,
        "latency_ms": latency
    }

@router.post("/scan-network", response_model=NetworkScanResponse)
async def scan_network(req: NetworkScanRequest):
    """
    Asynchronously scans local network subnet (WiFi/Ethernet) for active physical IoT hardware.
    Fingerprints open ports (80, 554, 1883, 8080, 502, 22) and returns discovered devices.
    """
    res = await scan_network_subnet(target_subnet=req.subnet, timeout=req.timeout_sec)
    return res

@router.post("/ingest")
def ingest_hardware_telemetry(payload: RealDeviceIngestPayload):
    """
    Real IoT Hardware Ingestion Gateway:
    Physical microcontrollers (Raspberry Pi, ESP32, Arduino) push live sensor JSON telemetry.
    Updates the Cyber Twin state and feeds packet directly into AI Threat Detection models.
    """
    result = cyber_twin.ingest_real_telemetry(payload)
    return result

@router.get("/device/{device_id}", response_model=IoTDevice)
def get_device_details(device_id: str):
    """Retrieves deep telemetry and configuration for a specific Cyber Twin device."""
    if device_id not in cyber_twin.devices:
        raise HTTPException(status_code=404, detail="IoT device not found in Cyber Twin")
    return cyber_twin.devices[device_id]

@router.post("/reset")
def reset_cyber_twin():
    """Resets all devices and connection states back to default physical mirror baseline."""
    cyber_twin.reset_all()
    return {"status": "SUCCESS", "message": "Cyber Twin reset to baseline state."}
