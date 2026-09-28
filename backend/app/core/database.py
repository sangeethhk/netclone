"""
NetClone Database Layer (SQLite)
Manages storage for MLSA credentials, negative password records, persistent IoT devices
(physical and virtual), dynamic firewall rules, alerts, and incident logs.
"""
import sqlite3
import json
import os
import time
from typing import List, Dict, Optional, Any
from app.config import IOT_DEVICES

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "netclone.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. IoT Devices Registry (Physical Hardware & Virtual Twins)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        ip TEXT NOT NULL,
        mac TEXT NOT NULL,
        open_ports_json TEXT NOT NULL,
        protocols_json TEXT NOT NULL,
        mode TEXT NOT NULL DEFAULT 'VIRTUAL',
        status TEXT NOT NULL DEFAULT 'NORMAL',
        telemetry_type TEXT NOT NULL,
        firmware TEXT NOT NULL,
        cpu_usage REAL NOT NULL DEFAULT 12.0,
        memory_usage REAL NOT NULL DEFAULT 25.0,
        packet_count INTEGER NOT NULL DEFAULT 0,
        threat_level REAL NOT NULL DEFAULT 0.0,
        ping_latency_ms REAL,
        is_live_reachable INTEGER NOT NULL DEFAULT 1,
        polling_url TEXT,
        auth_token TEXT,
        last_seen REAL NOT NULL,
        created_at REAL NOT NULL
    )
    """)

    # 2. MLSA Users & Negative Password Credentials
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        device_id TEXT NOT NULL,
        salt TEXT NOT NULL,
        encrypted_token TEXT NOT NULL,
        negative_rules_json TEXT NOT NULL,
        created_at REAL NOT NULL,
        last_login REAL
    )
    """)
    
    # 3. Dynamic Firewall Rules
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS firewall_rules (
        rule_id TEXT PRIMARY KEY,
        source_ip TEXT NOT NULL,
        destination_ip TEXT NOT NULL,
        port INTEGER,
        protocol TEXT NOT NULL,
        action TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at REAL NOT NULL,
        expires_at REAL,
        is_active INTEGER NOT NULL DEFAULT 1,
        mitre_attack_id TEXT
    )
    """)
    
    # 4. Real-Time Security Alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS security_alerts (
        id TEXT PRIMARY KEY,
        timestamp REAL NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        source_device TEXT NOT NULL,
        target_device TEXT,
        threat_score REAL NOT NULL,
        defense_applied INTEGER NOT NULL DEFAULT 0,
        remediation_action TEXT
    )
    """)
    
    # 5. Audit Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp REAL NOT NULL,
        module TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL
    )
    """)
    
    conn.commit()

    # Seed baseline devices if empty
    cursor.execute("SELECT count(*) FROM devices")
    if cursor.fetchone()[0] == 0:
        now = time.time()
        for dev_id, cfg in IOT_DEVICES.items():
            cursor.execute("""
            INSERT INTO devices (
                id, name, category, ip, mac, open_ports_json, protocols_json, mode,
                status, telemetry_type, firmware, cpu_usage, memory_usage, packet_count,
                threat_level, ping_latency_ms, is_live_reachable, polling_url, auth_token,
                last_seen, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cfg["id"], cfg["name"], cfg["category"], cfg["ip"], cfg["mac"],
                json.dumps(cfg["open_ports"]), json.dumps(cfg["protocols"]),
                "VIRTUAL", cfg.get("status", "NORMAL"), cfg["telemetry_type"],
                cfg["firmware"], 12.0, 25.0, 0, 0.0, 2.4 if cfg["id"] != "dev_gateway_00" else 0.5,
                1, None, None, now, now
            ))
        conn.commit()
        
    conn.close()

# Device Helper Functions

def insert_or_update_device(dev: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    now = time.time()
    cursor.execute("""
    INSERT OR REPLACE INTO devices (
        id, name, category, ip, mac, open_ports_json, protocols_json, mode,
        status, telemetry_type, firmware, cpu_usage, memory_usage, packet_count,
        threat_level, ping_latency_ms, is_live_reachable, polling_url, auth_token,
        last_seen, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        dev["id"], dev["name"], dev["category"], dev["ip"], dev.get("mac", "00:00:00:00:00:00"),
        json.dumps(dev.get("open_ports", [80])), json.dumps(dev.get("protocols", ["TCP"])),
        dev.get("mode", "VIRTUAL"), dev.get("status", "NORMAL"), dev.get("telemetry_type", "Telemetry"),
        dev.get("firmware", "v1.0.0"), dev.get("cpu_usage", 12.0), dev.get("memory_usage", 25.0),
        dev.get("packet_count", 0), dev.get("threat_level", 0.0), dev.get("ping_latency_ms"),
        1 if dev.get("is_live_reachable", True) else 0, dev.get("polling_url"), dev.get("auth_token"),
        dev.get("last_seen", now), dev.get("created_at", now)
    ))
    conn.commit()
    conn.close()

def get_all_devices() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM devices ORDER BY created_at ASC")
    rows = cursor.fetchall()
    conn.close()
    devices = []
    for r in rows:
        d = dict(r)
        d["open_ports"] = json.loads(d["open_ports_json"])
        d["protocols"] = json.loads(d["protocols_json"])
        d["is_live_reachable"] = bool(d["is_live_reachable"])
        devices.append(d)
    return devices

def get_device(device_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM devices WHERE id = ?", (device_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        d["open_ports"] = json.loads(d["open_ports_json"])
        d["protocols"] = json.loads(d["protocols_json"])
        d["is_live_reachable"] = bool(d["is_live_reachable"])
        return d
    return None

def delete_device(device_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM devices WHERE id = ?", (device_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def update_device_metrics_db(device_id: str, packet_delta: int = 1, cpu: Optional[float] = None, memory: Optional[float] = None, threat: Optional[float] = None, status: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    now = time.time()
    updates = ["last_seen = ?, packet_count = packet_count + ?"]
    params = [now, packet_delta]
    if cpu is not None:
        updates.append("cpu_usage = ?")
        params.append(cpu)
    if memory is not None:
        updates.append("memory_usage = ?")
        params.append(memory)
    if threat is not None:
        updates.append("threat_level = ?")
        params.append(threat)
    if status is not None:
        updates.append("status = ?")
        params.append(status)
    params.append(device_id)
    query = f"UPDATE devices SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(query, tuple(params))
    conn.commit()
    conn.close()

def update_device_reachability_db(device_id: str, reachable: bool, latency_ms: Optional[float]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE devices SET is_live_reachable = ?, ping_latency_ms = ?, last_seen = ? WHERE id = ?
    """, (1 if reachable else 0, latency_ms, time.time(), device_id))
    conn.commit()
    conn.close()

# User / MLSA Helpers

def add_user(username: str, role: str, device_id: str, salt: str, encrypted_token: str, negative_rules: List[Dict]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO users (username, role, device_id, salt, encrypted_token, negative_rules_json, created_at, last_login)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (username, role, device_id, salt, encrypted_token, json.dumps(negative_rules), time.time(), time.time()))
    conn.commit()
    conn.close()

def get_user(username: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        d["negative_rules"] = json.loads(d["negative_rules_json"])
        return d
    return None

# Firewall Helpers

def add_firewall_rule(rule: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO firewall_rules (rule_id, source_ip, destination_ip, port, protocol, action, reason, created_at, expires_at, is_active, mitre_attack_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rule["rule_id"], rule["source_ip"], rule.get("destination_ip", "ANY"),
        rule.get("port"), rule.get("protocol", "ALL"), rule["action"],
        rule["reason"], rule.get("created_at", time.time()), rule.get("expires_at"),
        1 if rule.get("is_active", True) else 0, rule.get("mitre_attack_id")
    ))
    conn.commit()
    conn.close()

def get_active_firewall_rules() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM firewall_rules WHERE is_active = 1 ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_firewall_rule(rule_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM firewall_rules WHERE rule_id = ?", (rule_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# Alert & Audit Helpers

def add_alert(alert: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO security_alerts (id, timestamp, severity, title, description, source_device, target_device, threat_score, defense_applied, remediation_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        alert["id"], alert["timestamp"], alert["severity"], alert["title"],
        alert["description"], alert["source_device"], alert.get("target_device"),
        alert["threat_score"], 1 if alert.get("defense_applied", False) else 0,
        alert.get("remediation_action")
    ))
    conn.commit()
    conn.close()

def get_recent_alerts(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM security_alerts ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def log_audit(module: str, action: str, details: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO audit_logs (timestamp, module, action, details)
    VALUES (?, ?, ?, ?)
    """, (time.time(), module, action, details))
    conn.commit()
    conn.close()
