# NetClone: AI-Driven Cyber Twin Framework & Autonomous IoT Threat Defense

[![Version](https://img.shields.io/badge/version-2.0.0-cyan.svg)](https://github.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue.svg)](https://vitejs.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Uvicorn-009688.svg)](https://fastapi.tiangolo.com)
[![AI-Ensemble](https://img.shields.io/badge/AI-PyTorch%20%2B%20Scikit--Learn-EE4C2C.svg)](https://pytorch.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Commercial%20Template-success.svg)](LICENSE)

**NetClone** is a production-grade, commercial digital code template designed for security engineers, enterprise IT teams, IoT platform developers, and software vendors. It provides a turnkey, full-stack **Cyber-Physical Digital Twin** platform that emulates local IoT networks in software, ingests real physical sensor telemetry, detects multi-vector zero-day attacks using an ensemble AI engine, produces dimension-wise Explainable AI (XAI) forensic rationales, models lateral progression kill-chains via directed attack graphs, and automates dynamic firewall response in sub-second latency.

---

## Table of Contents

1. [Key Features & Capabilities](#key-features--capabilities)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Step-by-Step Local Setup Guide](#step-by-step-local-setup-guide)
6. [Single-Command Unified Launch](#single-command-unified-launch)
7. [Physical Hardware Integration Agent](#physical-hardware-integration-agent)
8. [Automated Test Suite & Verification](#automated-test-suite--verification)
9. [Directory Structure](#directory-structure)
10. [Customization Guide](#customization-guide)
    - [Branding & Application Name](#1-branding--application-name)
    - [Color Palette & Theme](#2-color-palette--theme)
    - [IoT Device Fleet & Network Profiles](#3-iot-device-fleet--network-profiles)
    - [AI Thresholds & Detection Sensitivity](#4-ai-thresholds--detection-sensitivity)
    - [Attack Simulation Scenarios](#5-attack-simulation-scenarios)
11. [Environment Variables & Security](#environment-variables--security)
12. [Commercial Template License](#commercial-template-license)

---

## Key Features & Capabilities

- **1. Cyber Twin Virtualization Sandbox**: Mirrors connected IoT devices (IP security cameras, smart thermostats, SCADA PLCs, patient vital monitors, edge gateways) in safe software states without putting physical equipment at risk.
- **2. Real Hardware Fleet Manager & LAN Subnet Prober**: Discover active devices on your local WiFi/Ethernet subnet via asynchronous multi-port fingerprinting (RTSP, HTTP, MQTT, Modbus, SSH, DNS) and register physical hardware.
- **3. Standalone Client IoT Agent (`agent/netclone_iot_agent.py`)**: Zero-dependency Python agent that runs on any Raspberry Pi, Linux single-board computer, or laptop to stream real hardware telemetry into the twin.
- **4. Hybrid Ensemble AI Threat Engine**: Combines a PyTorch Deep Autoencoder (10-dimensional input compressed through a 4-dimensional latent bottleneck) with a Scikit-Learn Isolation Forest to detect volumetric, protocol, and behavioral anomalies.
- **5. Explainable AI (XAI) Forensic Engine**: Breaks down reconstruction loss dimension-by-dimension, attributing anomaly percentages to specific features (packet velocity, byte rate, entropy, SYN ratio) with semantic analyst summaries.
- **6. Directed Cyber Attack Graph**: Computes feasible lateral movement paths from edge IoT entrypoints to Crown Jewel assets (SCADA PLCs and Healthcare Monitors) and visualizes automated defense cut-points.
- **7. MLSA Multi-Layer Authentication & Negative Password Database**: Represents credentials in the negative complement domain ($\mathcal{U} \setminus \{P\}$) so that exfiltrated database dumps remain mathematically uncrackable against offline dictionary attacks.
- **8. Live Breach & Offline Crack Benchmark Arena**: Real-time side-by-side demonstration comparing conventional SHA-256 hash cracking against NetClone negative database resilience.
- **9. Autonomous Dynamic Defense & Dynamic Firewall**: Synthesizes iptables-grade firewall rules in real time and automatically isolates or rate-limits compromised Cyber Twin nodes.
- **10. Low-Latency WebSocket Telemetry**: Bi-directional event bus streaming live network packets, device health statuses, and threat metrics directly to the user interface.
- **11. 11-View Modular Command Center**: Includes Cyber Twin Topology, IoT Fleet Manager, Traffic Telemetry, AI Threat Engine, Explainable AI Inspector, Attack Simulation Deck, Directed Attack Graph, MLSA Authentication, Breach Benchmark, Automated Defense, and Audit Logs.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NETCLONE SYSTEM ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────┘

 [Physical IoT Hardware] (Raspberry Pi, ESP32, Cameras)
           │
           ▼ (Live Telemetry via POST /api/twin/ingest)
 ┌──────────────────────┐             ┌─────────────────────────┐
 │ NetClone             │ ◄────────── │ Attack Simulator        │
 │ Cyber Twin Mirror    │             │ (DDoS, MitM, Exfil, etc)│
 └──────────┬───────────┘             └─────────────────────────┘
            │
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ 10-Feature Sliding Window Preprocessor                       │
 │ (Packet Rate, Byte Rate, Flow Duration, SYN/ACK Ratio, etc.) │
 └──────────┬───────────────────────────────────────────────────┘
            │
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ Hybrid Ensemble AI Threat Engine                             │
 │ ├─ PyTorch Deep Autoencoder (10D -> 4D Latent Bottleneck)    │
 │ └─ Scikit-Learn Isolation Forest (Partitioning Outliers)     │
 └──────────┬─────────────────────────────┬─────────────────────┘
            │                             │
            ▼                             ▼
 ┌──────────────────────┐      ┌────────────────────────────────┐
 │ Explainable AI (XAI) │      │ Directed Cyber Attack Graph    │
 │ Feature Attributions │      │ Lateral Kill-Chain & Cut-Points│
 └──────────┬───────────┘      └──────────┬─────────────────────┘
            │                             │
            ▼                             ▼
 ┌──────────────────────┐      ┌────────────────────────────────┐
 │ MLSA Authentication  │      │ Automated Defense Engine       │
 │ Negative Password DB │      │ Dynamic Firewall & Quarantine  │
 └──────────┬───────────┘      └──────────┬─────────────────────┘
            │                             │
            └──────────────┬──────────────┘
                           │
                           ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ NetClone React 18 Command Center (Vite + Tailwind CSS)       │
 └──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) (Functional components, hooks, custom state management)
- **Build Tool**: [Vite 5](https://vitejs.dev/) (Instant HMR, optimized production rollup bundling)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) (Cyber-security dark theme, glassmorphic cards, responsive grid)
- **Icons**: [Lucide React](https://lucide.dev/) (Modern, clean SVG icons)
- **Data Visualization**: [Recharts 2](https://recharts.org/) (Real-time telemetry line charts, area charts, bar charts)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance asynchronous Python web framework)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (Lightning-fast ASGI production server)
- **Deep Learning**: [PyTorch](https://pytorch.org/) (Deep Autoencoder anomaly detector, CPU/GPU accelerated)
- **Machine Learning**: [Scikit-Learn](https://scikit-learn.org/) (Isolation Forest outlier detection)
- **Scientific Computing**: NumPy & Pandas (Feature normalization and sliding window statistics)
- **Database**: SQLite3 (Zero-configuration persistent SQL storage for devices, firewall rules, and MLSA users)
- **Real-Time Streaming**: Native WebSockets (`websockets` / FastAPI WebSocket API)

---

## Prerequisites

Before setting up the project, ensure you have the following installed on your machine:

1. **Python 3.10+** (Python 3.11 recommended):
   ```bash
   python --version
   ```
2. **Node.js 18+** & **npm 9+**:
   ```bash
   node --version
   npm --version
   ```
3. **Git**:
   ```bash
   git --version
   ```

---

## Step-by-Step Local Setup Guide

### 1. Clone the Repository
```bash
git clone <your-repository-url> netclone
cd netclone
```

### 2. Configure Environment Variables
Copy the example environment file to `.env`:
```bash
# On Linux / macOS:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

Review the values in `.env`. By default, `.env` contains secure local development defaults ready out-of-the-box:
```dotenv
APP_NAME=NetClone
PORT=8000
HOST=127.0.0.1
DATABASE_PATH=netclone.db
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/telemetry
```

### 3. Setup Python Backend
Create and activate a virtual environment:
```bash
# On Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# On Windows PowerShell:
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

Pre-train and calibrate the AI models (only needed once, cached in `backend/models_cache/`):
```bash
python train_models.py
cd ..
```

### 4. Setup Frontend Dashboard
```bash
cd frontend
npm install
cd ..
```

---

## Single-Command Unified Launch

From the project root directory, run the unified orchestrator:

```bash
python run_netclone.py
```

This single command will automatically:
1. Verify the PyTorch and Scikit-Learn model weights in `backend/models_cache/` (training them if missing).
2. Boot the FastAPI backend server on `http://127.0.0.1:8000`.
3. Boot the Vite React dashboard on `http://localhost:5173`.
4. Open your default web browser to the NetClone Command Center.
5. Provide coordinated, graceful shutdown when you press `Ctrl+C`.

---

## Physical Hardware Integration Agent

NetClone includes a standalone, zero-dependency client script to stream live telemetry from physical devices on your network:

```bash
# Nominal sensor telemetry from a real Raspberry Pi or laptop:
python agent/netclone_iot_agent.py --server http://127.0.0.1:8000 --device-id dev_my_pi --name "Lab Raspberry Pi"

# Simulate an attack/anomaly originating from a physical hardware node:
python agent/netclone_iot_agent.py --server http://127.0.0.1:8000 --device-id dev_my_pi --simulate-anomaly
```

### Direct HTTP Ingestion Webhook (One-Liner):
Physical microcontrollers or third-party webhooks can push telemetry directly via cURL:
```bash
curl -X POST http://127.0.0.1:8000/api/twin/ingest \
  -H "Content-Type: application/json" \
  -d '{"device_id":"dev_cam_01","telemetry":{"temperature":24.5,"motion":true},"cpu_usage":18.2,"protocol":"HTTP"}'
```

---

## Automated Test Suite & Verification

The codebase includes an automated test suite verifying all 13 subsystems end-to-end:

```bash
cd backend
python run_tests.py
```

### Verified Subsystems:
- `[PASS]` Database Initialization & SQLite Persistence
- `[PASS]` PyTorch Autoencoder Reconstruction Loss & Anomaly Threshold
- `[PASS]` Scikit-Learn Isolation Forest Outlier Partitioning
- `[PASS]` MLSA Encrypted Negative Passwords & Cryptographic Validation
- `[PASS]` Attack Simulator Deck & Controlled Malicious Packet Injection
- `[PASS]` Automated Defense, Dynamic Firewall & Cyber Twin Quarantine
- `[PASS]` Physical IoT Device CRUD & Schema Persistence
- `[PASS]` Real Hardware Telemetry Ingestion Gateway
- `[PASS]` Local Network Subnet Auto-Discovery Prober
- `[PASS]` Directed Attack Graph & Lateral Movement Kill-Chain
- `[PASS]` Explainable AI (XAI) Attribution & Forensic Analyst Rationale
- `[PASS]` MLSA vs Positive Hash Database Breach Benchmark
- `[PASS]` FastAPI REST Endpoints & WebSocket Telemetry Routing

---

## Directory Structure

```
netclone/
├── .env.example                     # Master environment template with clear comments
├── .gitignore                       # Git exclusions (.env, databases, caches, modules)
├── README.md                        # Commercial digital template documentation
├── run_netclone.py                  # Single-command unified application orchestrator
│
├── agent/
│   └── netclone_iot_agent.py        # Standalone physical hardware IoT streaming agent
│
├── backend/
│   ├── Dockerfile                   # Production container definition
│   ├── Procfile                     # Cloud hosting process definition
│   ├── requirements.txt             # Locked Python backend dependencies
│   ├── run_tests.py                 # Automated 13-subsystem test runner
│   ├── train_models.py              # AI model calibration & pre-training script
│   ├── models_cache/                # Cached PyTorch (.pt) and Joblib (.joblib) weights
│   │   ├── autoencoder.pt
│   │   └── isolation_forest.joblib
│   ├── tests/
│   │   └── test_netclone.py         # Comprehensive unit & integration test suite
│   └── app/
│       ├── config.py                # IoT profiles, AI thresholds, security policies
│       ├── main.py                  # FastAPI application entrypoint & middleware
│       ├── api/
│       │   ├── advanced_routes.py   # Attack graph, XAI attribution, breach benchmark
│       │   ├── attack_routes.py     # Attack scenario simulation endpoints
│       │   ├── defense_routes.py    # Firewall rules, quarantine, incident audit
│       │   ├── detection_routes.py  # AI metrics and feature vector evaluation
│       │   ├── mlsa_routes.py       # Negative database registration and auth
│       │   ├── twin_routes.py       # Cyber Twin topology, devices, LAN scanner
│       │   └── websocket.py         # Real-time WebSocket telemetry broadcast
│       ├── core/
│       │   ├── attack_graph.py      # Directed graph lateral movement kill-chain engine
│       │   ├── attack_simulator.py  # Multi-vector packet generator
│       │   ├── breach_simulator.py  # Offline dictionary crack benchmark
│       │   ├── cyber_twin.py        # Mirrored digital twin state management
│       │   ├── database.py          # SQLite database schema and persistence layer
│       │   ├── defense_engine.py    # Dynamic firewall rule synthesis & isolation
│       │   ├── mlsa_auth.py         # Encrypted Negative Password algorithm engine
│       │   ├── network_scanner.py   # Asynchronous subnet socket prober
│       │   └── traffic_generator.py # 10-feature sliding window preprocessor
│       └── models/
│           ├── autoencoder.py       # PyTorch Deep Autoencoder model
│           ├── isolation_forest.py  # Scikit-Learn Isolation Forest & Ensemble
│           ├── schemas.py           # Pydantic data validation schemas
│           └── xai_engine.py        # Explainable AI feature attribution engine
│
├── frontend/
│   ├── index.html                   # HTML template with clean SVG shield favicon
│   ├── package.json                 # Frontend dependencies and Vite scripts
│   ├── tailwind.config.js           # Tailwind design tokens and animations
│   ├── vite.config.js               # Vite build and proxy configuration
│   └── src/
│       ├── main.jsx                 # React root renderer
│       ├── App.jsx                  # Main dashboard layout and notification center
│       ├── index.css                # Global cyber dark styles and glassmorphism
│       ├── config/
│       │   └── branding.js          # Centralized brand configuration
│       ├── services/
│       │   └── api.js               # REST API client service
│       └── components/
│           ├── AIDetectionPanel.jsx     # AI model metrics and live threshold gauges
│           ├── AttackGraphViewer.jsx    # Interactive lateral movement kill-chain graph
│           ├── AttackSimulator.jsx      # Attack simulation deck & packet controls
│           ├── AutomatedDefense.jsx     # Dynamic firewall manager & isolation controls
│           ├── CyberTwinTopology.jsx    # Mirrored network canvas & device inspection
│           ├── DeviceFleetManager.jsx   # Hardware device registry & LAN subnet prober
│           ├── MLSABreachBench.jsx      # SHA-256 vs Negative Password crack arena
│           ├── MLSAPanel.jsx            # Multi-layer authentication inspector
│           ├── Navbar.jsx               # Navigation bar, brand badge, threat level
│           ├── SecurityLogs.jsx         # Searchable audit logs & JSON report exporter
│           ├── TrafficMonitor.jsx       # Real-time packet throughput charts
│           └── XAIPanel.jsx             # Explainable AI residual decomposition
│
└── report/
    └── netclone_architecture_specification.tex  # Enterprise technical whitepaper
```

---

## Customization Guide

### 1. Branding & Application Name
To rebrand the application, edit `frontend/src/config/branding.js` or set the environment variables in `.env`:
```dotenv
VITE_APP_NAME="NetClone"
VITE_APP_TAGLINE="Next-Gen Autonomous Cyber Defense"
APP_NAME="NetClone"
```
All header banners, titles, navigation pills, and audit reports will automatically adapt.

### 2. Color Palette & Theme
The user interface styles are configured via Tailwind CSS in `frontend/tailwind.config.js` and `frontend/src/index.css`:
- **Card Backgrounds**: `#0d131f` / `#090d16` (customizable via `cyber-card` in `src/index.css`).
- **Primary Cyber Accent**: `#00f2fe` (`cyan-400` / `cyan-500`).
- **Alert Colors**: Critical (`#ef4444` red), Suspicious (`#f59e0b` amber), Nominal (`#10b981` emerald).

### 3. IoT Device Fleet & Network Profiles
To add or modify default devices mirrored in the Cyber Twin, edit `backend/app/config.py`:
```python
IOT_DEVICES["dev_custom_05"] = {
    "id": "dev_custom_05",
    "name": "Industrial Smart Inverter",
    "category": "Renewable Energy IoT",
    "ip": "192.168.1.105",
    "mac": "00:1A:2B:3C:4D:05",
    "open_ports": [502, 80],
    "protocols": ["Modbus", "TCP", "HTTP"],
    "normal_packet_rate": (8, 20),
    "normal_byte_rate": (3000, 10000),
    "telemetry_type": "Solar Inverter KW/h Output",
    "status": "NORMAL",
    "firmware": "v1.2.0-solar",
}
```

### 4. AI Thresholds & Detection Sensitivity
To tune the anomaly detection engine, adjust `AI_CONFIG` in `backend/app/config.py`:
```python
AI_CONFIG = {
    "autoencoder_threshold": 0.045,          # MSE reconstruction threshold
    "isolation_forest_contamination": 0.08,  # Expected outlier ratio
    "high_threat_threshold": 75.0,           # High-threat score %
    "suspicious_threat_threshold": 45.0,     # Suspicious score %
}
```

### 5. Attack Simulation Scenarios
To introduce new cyberattack scenarios, add entries to `ATTACK_SCENARIOS` in `backend/app/config.py`:
```python
ATTACK_SCENARIOS["FIRMWARE_TAMPER"] = {
    "name": "Malicious Firmware Injection",
    "description": "Attempts unauthorized OTA binary flashing via insecure HTTP port.",
    "target_default": "dev_cam_01",
    "severity": "CRITICAL",
    "mitre_id": "T1542",
}
```

---

## Environment Variables & Security

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `NetClone` | Backend application branding and log prefix |
| `VITE_APP_NAME` | `NetClone` | Frontend dashboard brand title and header name |
| `VITE_APP_TAGLINE` | `AI-Driven Threat Simulation...` | Header subtitle in navigation and meta tags |
| `HOST` | `127.0.0.1` | Local IP address for Uvicorn ASGI server |
| `PORT` | `8000` | Port for FastAPI REST & WebSocket server |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allowed CORS origins for browser security |
| `DATABASE_PATH` | `netclone.db` | Local SQLite database file path |
| `MLSA_MASTER_KEY` | `netclone_mlsa_master_key...` | Cryptographic secret for signing MLSA session tokens |
| `ADMIN_DEFAULT_PASSWORD` | `AdminPassword#2026` | Initial password seeded for default admin identity |
| `OPERATOR_DEFAULT_PASSWORD`| `SmartSensor$77` | Initial password seeded for field operator identity |

---

## Commercial Template License

This codebase is licensed for commercial use as a digital software template. You are permitted to:
- Use this template to build commercial web platforms, IoT dashboards, and cyber security software for clients or internal operations.
- Modify and rebrand all source code, components, logos, and styling.
- Bundle and distribute as part of your proprietary solution.

*(Note: Redistribution or resale of this raw repository as an unmodified competing code template on digital marketplaces is strictly prohibited under standard digital marketplace terms).*
