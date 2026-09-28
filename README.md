# NetClone: An AI-Driven Cyber Twin Framework with Multi-Layer Security Authentication for Real-Time IoT Threat Simulation and Automated Defense

**Project Guide:** Nihala UK  
**Group 6:**
- Adil (KCEET23CC002)
- Ishan (KCEET23CC007)
- Sanjay (KCEET23CC019)
- Sree Karthik (KCEET23CC021)
- Sangeeth (LKCEET23CC027)

---

## 1. Overview & Key Capabilities

NetClone is an advanced, full-stack Cyber-Physical IoT security framework that combines:
1. **Real Physical IoT Device Fleet Management & LAN Discovery**: Connect real hardware (Raspberry Pi, ESP32, IP cameras) or virtual twins, probe live socket reachability, and auto-discover local WiFi/Ethernet devices.
2. **Real-Time Telemetry Ingestion Gateway (`POST /api/twin/ingest`)**: Real physical IoT devices stream live JSON sensor data, which mirrors in the Cyber Twin and feeds into live AI models.
3. **Standalone Python IoT Agent (`agent/netclone_iot_agent.py`)**: Zero-dependency script to run on real hardware or laptops to stream live metrics.
4. **AI Threat Detection Engine**: PyTorch Deep Autoencoder (reconstruction MSE) + Scikit-Learn Isolation Forest ensemble.
5. **Explainable AI (XAI) Forensic Engine**: Dimension-wise reconstruction error attribution breakdown and plain-English threat rationales (Slide 19).
6. **Directed Cyber Attack Graph**: Hop-by-hop lateral propagation kill-chain modeling from entrypoint IoT nodes to Crown Jewel assets, showing automated defense cut-points (Slide 19).
7. **MLSA Multi-Layer Authentication & Negative Password Database**: Complement space representation $U \setminus \{P\}$ preventing credential exposure in database leaks, paired with a live **Breach & Crack Benchmark** arena.
8. **Automated Dynamic Defense**: Synthesizes iptables-grade firewall rules and microsegments/isolates compromised Cyber Twin nodes.
9. **Interactive React 18 Command Center**: 11 dedicated functional views including topology canvas, live throughput charts, attack deck, fleet manager, attack graph, XAI inspector, and breach benchmark.

---

## 2. System Architecture

```
[Physical IoT Hardware] (Raspberry Pi, ESP32, Real IP Cams)
             │
             ▼ (Live Telemetry via /api/twin/ingest)
[NetClone Cyber Twin] ◄─── [Attack Simulation Module]
 (Synchronized Mirror)       (DDoS, Port Scan, Brute Force, MitM, Exfil)
             │
             ▼
[10-Feature Sliding Window Preprocessor]
 (Packet Velocity, Byte Rate, SYN/ACK Ratio, Shannon Entropy, etc.)
             │
             ▼
[Ensemble AI Threat Engine]
 (PyTorch Autoencoder + Isolation Forest)
             │
             ├──────────────────────────┐
             ▼                          ▼
[Explainable AI (XAI)]       [Directed Attack Graph]
 (Feature Attributions)       (Lateral Kill-Chain & Cut-Points)
             │                          │
             ▼                          ▼
[MLSA Multi-Layer Auth]      [Automated Defense Engine]
 (Negative Passwords + HMAC)  (Dynamic Firewall & Node Quarantine)
             │                          │
             └──────────────┬───────────┘
                            ▼
          [Interactive React Command Center]
```

---

## 3. Quickstart & Usage

### Single-Command Unified Launch:
From the project root directory, run:
```powershell
python run_netclone.py
```
This automatically:
1. Verifies/trains AI models in `backend/models_cache/`.
2. Starts the FastAPI backend at `http://127.0.0.1:8000`.
3. Starts the Vite React dashboard at `http://localhost:5173`.
4. Opens your browser directly to the NetClone command center.

### Running Real Physical IoT Client Agent:
Run the standalone agent on any real computer, Raspberry Pi, or Linux board on your network:
```powershell
# Nominal live sensor streaming
python agent/netclone_iot_agent.py --server http://127.0.0.1:8000 --device-id dev_my_pi_01 --name "Lab Raspberry Pi"

# Simulate an attack/anomaly from the real physical node
python agent/netclone_iot_agent.py --server http://127.0.0.1:8000 --device-id dev_my_pi_01 --simulate-anomaly
```

### Running Backend Automated Tests:
```powershell
cd backend
python run_tests.py
```
Outputs passing verification for all 13 subsystems:
- `Database Initialization & Persistence`
- `PyTorch Autoencoder Reconstruction Loss & Anomaly Threshold`
- `Scikit-Learn Isolation Forest Outlier Partitioning`
- `MLSA Encrypted Negative Passwords & Crypto Validation`
- `Attack Simulator & Malicious Packet Injection`
- `Automated Defense, Dynamic Firewall & Node Quarantine`
- `Real Physical IoT Device CRUD & SQLite Persistence`
- `Real Hardware Telemetry Ingestion Gateway`
- `Local Network Subnet Auto-Discovery Prober`
- `Directed Attack Graph & Lateral Movement Kill-Chain`
- `Explainable AI (XAI) Attribution & Forensic Rationale`
- `MLSA vs Positive Hash Database Breach Bench`
- `FastAPI REST Endpoints & Advanced Intelligence Routing`
