"""
NetClone Automated Defense Module
Generates dynamic firewall rules, coordinates incident response, isolates compromised nodes
inside the Cyber Twin, and triggers MLSA step-up security.
"""
import time
import uuid
from typing import Dict, List, Optional, Any
from app.config import DEFENSE_CONFIG, ATTACK_SCENARIOS
from app.models.schemas import FirewallRule, ThreatDetectionResult, SecurityAlert
from app.core import database
from app.core.cyber_twin import cyber_twin

class AutomatedDefenseEngine:
    def __init__(self):
        self.auto_defense_enabled = DEFENSE_CONFIG["auto_mitigation_enabled"]
        self.total_mitigations = 0

    def toggle_auto_defense(self, enabled: bool) -> bool:
        """Toggles autonomous incident response on/off."""
        self.auto_defense_enabled = enabled
        database.log_audit("DEFENSE", "TOGGLE_AUTO_DEFENSE", f"Autonomous defense set to: {enabled}")
        return self.auto_defense_enabled

    def process_threat_assessment(
        self,
        assessment: ThreatDetectionResult,
        target_device_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates real-time AI threat assessment and triggers automated defensive actions
        when threats cross policy thresholds.
        """
        if assessment.threat_level == "NORMAL":
            return None
            
        mitigations = []
        target_dev = cyber_twin.devices.get(target_device_id) if target_device_id else None
        target_ip = target_dev.ip if target_dev else "192.168.1.1"
        target_name = target_dev.name if target_dev else "Central Gateway"
        
        scenario_meta = ATTACK_SCENARIOS.get(assessment.classified_attack, {})
        mitre_id = scenario_meta.get("mitre_id", "T1000")
        
        # Determine defensive action
        if assessment.threat_level == "CRITICAL" and self.auto_defense_enabled:
            # 1. Generate Dynamic Firewall Rule
            rule_id = f"FW-{uuid.uuid4().hex[:6].upper()}"
            attack_type = assessment.classified_attack or "ANOMALOUS_TRAFFIC"
            
            src_ip = "198.51.100.0/24" if "DDOS" in attack_type else "ANY_SUSPICIOUS"
            rule = {
                "rule_id": rule_id,
                "source_ip": src_ip,
                "destination_ip": target_ip,
                "port": None if "DDOS" in attack_type else 80,
                "protocol": "TCP",
                "action": "DROP",
                "reason": f"AI Detected {attack_type} (MSE={assessment.autoencoder_mse}, Threat={assessment.hybrid_threat_score}%)",
                "created_at": time.time(),
                "expires_at": time.time() + 600,
                "is_active": True,
                "mitre_attack_id": mitre_id
            }
            database.add_firewall_rule(rule)
            mitigations.append(f"Dynamic firewall rule [{rule_id}] applied: DROP from {src_ip}")
            
            # 2. Isolate compromised node in Cyber Twin (Quarantine)
            if target_device_id and target_device_id != "dev_gateway_00":
                quarantined = cyber_twin.quarantine_device(target_device_id)
                if quarantined:
                    mitigations.append(f"Cyber Twin Node [{target_name}] isolated into QUARANTINE status")
                    
            # 3. Record Security Alert
            alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
            alert = {
                "id": alert_id,
                "timestamp": time.time(),
                "severity": "CRITICAL",
                "title": f"Autonomous Mitigation: {scenario_meta.get('name', attack_type)} Blocked",
                "description": f"AI ensemble detected malicious pattern with {assessment.confidence_pct}% confidence. Automated firewall and quarantine enacted.",
                "source_device": src_ip,
                "target_device": target_name,
                "threat_score": assessment.hybrid_threat_score,
                "defense_applied": True,
                "remediation_action": " | ".join(mitigations)
            }
            database.add_alert(alert)
            self.total_mitigations += 1
            
            return {
                "defense_triggered": True,
                "action_summary": " | ".join(mitigations),
                "firewall_rule_id": rule_id,
                "alert_id": alert_id,
                "quarantined_node": target_device_id
            }
            
        elif assessment.threat_level == "SUSPICIOUS":
            # Generate rate-limiting alert
            alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
            alert = {
                "id": alert_id,
                "timestamp": time.time(),
                "severity": "WARNING",
                "title": f"Elevated Threat Warning: {assessment.classified_attack or 'Unusual Network Drift'}",
                "description": f"Isolation Forest score={assessment.isolation_forest_score}, Autoencoder MSE={assessment.autoencoder_mse}. Traffic flagged under scrutiny.",
                "source_device": "Internal / Ingress",
                "target_device": target_name,
                "threat_score": assessment.hybrid_threat_score,
                "defense_applied": False,
                "remediation_action": "MLSA Step-Up Monitoring Enabled"
            }
            database.add_alert(alert)
            return {
                "defense_triggered": False,
                "action_summary": "Elevated Threat Monitoring Activated",
                "alert_id": alert_id
            }
            
        return None

    def manual_add_rule(self, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Manually injects an administrator firewall rule."""
        rule_id = f"FW-MAN-{uuid.uuid4().hex[:6].upper()}"
        rule_dict = {
            "rule_id": rule_id,
            "source_ip": rule_data.get("source_ip", "ANY"),
            "destination_ip": rule_data.get("destination_ip", "ANY"),
            "port": rule_data.get("port"),
            "protocol": rule_data.get("protocol", "ALL"),
            "action": rule_data.get("action", "DROP"),
            "reason": f"Admin manual rule: {rule_data.get('reason', 'Security Policy')}",
            "created_at": time.time(),
            "expires_at": None,
            "is_active": True,
            "mitre_attack_id": None
        }
        database.add_firewall_rule(rule_dict)
        database.log_audit("DEFENSE", "MANUAL_RULE_CREATED", f"Rule {rule_id} created by admin.")
        return rule_dict

    def remove_rule(self, rule_id: str) -> bool:
        """Removes a dynamic firewall rule."""
        deleted = database.delete_firewall_rule(rule_id)
        if deleted:
            database.log_audit("DEFENSE", "RULE_REMOVED", f"Rule {rule_id} removed.")
        return deleted

    def manual_quarantine(self, device_id: str) -> bool:
        """Admin manual quarantine of Cyber Twin device."""
        success = cyber_twin.quarantine_device(device_id, "Admin Manual Action")
        if success:
            database.log_audit("DEFENSE", "MANUAL_QUARANTINE", f"Device {device_id} manually quarantined.")
        return success

    def manual_restore(self, device_id: str) -> bool:
        """Admin manual restoration of Cyber Twin device."""
        success = cyber_twin.restore_device(device_id)
        if success:
            database.log_audit("DEFENSE", "DEVICE_RESTORED", f"Device {device_id} restored to NORMAL.")
        return success

# Global defense engine singleton
defense_engine = AutomatedDefenseEngine()
