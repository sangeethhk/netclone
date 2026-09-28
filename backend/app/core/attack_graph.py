"""
NetClone Attack Graph & Lateral Movement Kill-Chain Engine
Models the cyber-physical IoT network as a directed attack graph to track lateral progression,
vulnerability exposure, and automated defense cut-points (Slide 19).
"""
from typing import List, Dict, Optional, Any
from app.models.schemas import AttackGraphNode, AttackGraphEdge, AttackGraphResponse
from app.core.cyber_twin import cyber_twin
from app.core.defense_engine import defense_engine
from app.core.attack_simulator import attack_sim
from app.core import database

class AttackGraphEngine:
    def __init__(self):
        # Crown jewel assets that must be safeguarded
        self.crown_jewels = ["dev_plc_03", "dev_health_04"]
        # Common initial access entrypoints
        self.entrypoints = ["dev_cam_01", "dev_therm_02"]

    def compute_attack_graph(self) -> AttackGraphResponse:
        """
        Builds the active attack graph, evaluates lateral movement kill chains,
        and identifies where dynamic firewall rules severed the attack path.
        """
        nodes: List[AttackGraphNode] = []
        edges: List[AttackGraphEdge] = []
        
        # 1. Build Nodes from Cyber Twin Devices
        for dev_id, dev in cyber_twin.devices.items():
            is_entry = dev_id in self.entrypoints or dev.category.startswith("Smart Home")
            is_crown = dev_id in self.crown_jewels or "Healthcare" in dev.category or "Industrial" in dev.category
            
            # Vulnerability score: higher if unpatched or under attack
            vuln_score = 4.2
            if dev.status == "ATTACKED":
                vuln_score = 9.4
            elif dev.status == "QUARANTINED":
                vuln_score = 1.0  # Isolated
            elif is_crown:
                vuln_score = 8.8
                
            nodes.append(AttackGraphNode(
                id=dev.id,
                label=dev.name,
                category=dev.category,
                ip=dev.ip,
                is_entrypoint=is_entry,
                is_crown_jewel=is_crown,
                status=dev.status,
                vulnerability_score=vuln_score
            ))

        # 2. Build Feasible Lateral Movement Edges
        raw_edges = [
            ("dev_cam_01", "dev_gateway_00", "HTTP", 80, "T1078 Valid Accounts / RTSP Auth Bypass"),
            ("dev_therm_02", "dev_gateway_00", "MQTT", 1883, "T1059 MQTT Command Injection"),
            ("dev_gateway_00", "dev_plc_03", "Modbus", 502, "T0855 Unauthorized Modbus Command"),
            ("dev_gateway_00", "dev_health_04", "HL7", 2575, "T1557 Telemetry Spoofing / Tampering"),
            ("dev_cam_01", "dev_plc_03", "TCP", 502, "T1021 Remote Subnet Pivot"),
        ]

        active_firewalls = database.get_active_firewall_rules()
        blocked_ips = [r["destination_ip"] for r in active_firewalls] + [r["source_ip"] for r in active_firewalls]
        
        target_under_attack = attack_sim.target_device_id if attack_sim.is_active else None
        defense_severed_at = None
        kill_chain = []
        crown_compromised = False
        
        for src, dst, proto, port, technique in raw_edges:
            edge_status = "ACTIVE"
            
            # Check if source or destination is quarantined
            src_dev = cyber_twin.devices.get(src)
            dst_dev = cyber_twin.devices.get(dst)
            
            is_quarantined = (src_dev and src_dev.status == "QUARANTINED") or (dst_dev and dst_dev.status == "QUARANTINED")
            is_firewalled = any(
                (src_dev and src_dev.ip in blocked_ips) or (dst_dev and dst_dev.ip in blocked_ips)
                for _ in [1]
            )
            
            if is_quarantined or is_firewalled:
                edge_status = "SEVERED_BY_DEFENSE"
                if not defense_severed_at:
                    defense_severed_at = f"{src} ──X──► {dst} (Blocked by Automated Defense)"
            elif target_under_attack and (src == target_under_attack or dst == target_under_attack):
                edge_status = "EXPLOITED"
                if src not in kill_chain:
                    kill_chain.append(src)
                if dst not in kill_chain:
                    kill_chain.append(dst)
                if dst in self.crown_jewels:
                    crown_compromised = True
                    
            edges.append(AttackGraphEdge(
                source=src,
                target=dst,
                protocol=proto,
                port=port,
                status=edge_status,
                exploit_technique=technique
            ))
            
        return AttackGraphResponse(
            nodes=nodes,
            edges=edges,
            active_kill_chain=kill_chain,
            defense_severed_at=defense_severed_at,
            crown_jewel_compromised=crown_compromised
        )

# Global singleton
attack_graph_engine = AttackGraphEngine()
