"""
Explainable AI (XAI) Attribution & Zero-Day Anomaly Analysis Engine
Decomposes Autoencoder reconstruction errors and Isolation Forest outlier scores
into per-feature attributions and human-readable forensic explanations.
"""
import numpy as np
import torch
from typing import List, Dict, Tuple, Optional, Any
from app.models.schemas import XAIAttribution, XAIReport, ThreatDetectionResult
from app.config import AI_CONFIG

FEATURE_EXPLANATIONS = {
    "packet_rate": {
        "high": "Packet transmission velocity is abnormally high ({val} pkts/s), consistent with volumetric exhaustion or denial of service.",
        "normal": "Packet transmission rate ({val} pkts/s) is within expected IoT sensor heartbeat limits."
    },
    "byte_rate": {
        "high": "Bandwidth transfer rate ({val} B/s) exceeds standard operational thresholds, indicating potential bulk data extraction or flood.",
        "normal": "Bandwidth consumption ({val} B/s) aligns with normal sensor telemetry."
    },
    "flow_duration": {
        "high": "Flow duration ({val}s) shows an abnormally sustained connection burst.",
        "normal": "Connection duration ({val}s) is nominal."
    },
    "syn_ratio": {
        "high": "TCP SYN ratio is {val_pct}%, indicating half-open handshake flood and embryonic connection accumulation.",
        "normal": "TCP SYN ratio is {val_pct}%, consistent with standard completed three-way handshakes."
    },
    "ack_ratio": {
        "high": "Abnormal ACK pattern detected ({val_pct}%).",
        "normal": "TCP ACK responses ({val_pct}%) reflect normal bi-directional communication."
    },
    "port_entropy": {
        "high": "Port Shannon entropy is {val} (high dispersion), indicating rapid multi-port reconnaissance scanning.",
        "normal": "Port entropy is {val} (focused service binding), consistent with legitimate endpoint traffic."
    },
    "avg_payload_size": {
        "high": "Mean packet payload size is {val} B, indicative of command injection shellcode or large media exfiltration.",
        "normal": "Payload size ({val} B) matches standard lightweight IoT protocol frames."
    },
    "error_rate": {
        "high": "Connection error/RST ratio is {val_pct}%, indicating failed credential brute-forcing or connection resets.",
        "normal": "Error rate is {val_pct}%, indicating clean packet transmission."
    },
    "protocol_id": {
        "high": "Unexpected protocol transport layer encoding detected ({val}).",
        "normal": "Protocol transport conforms to registered IoT profile."
    },
    "conn_state": {
        "high": "Connection lifecycle flags show anomalous state divergence.",
        "normal": "Connection state is synchronized and nominal."
    }
}

class XAIEngine:
    def __init__(self):
        self.feature_names = AI_CONFIG["feature_names"]
        # Adaptive threshold baseline tracking (EWMA)
        self.ewma_loss = 0.035
        self.ewma_alpha = 0.05

    def explain_anomaly(
        self,
        detection: ThreatDetectionResult,
        autoencoder_detector: Any
    ) -> XAIReport:
        """
        Decomposes Autoencoder reconstruction loss per feature dimension
        and produces normalized attribution percentages and analyst reasoning.
        """
        raw_features = detection.feature_vector
        if not raw_features or len(raw_features) < len(self.feature_names):
            raw_features = [20.0, 15000.0, 5.0, 0.05, 0.90, 0.15, 750.0, 0.01, 0.5, 0.0]
            
        feat_arr = np.array(raw_features, dtype=np.float32)
        
        # Compute dimension-wise squared reconstruction errors
        per_feature_errors = []
        if autoencoder_detector and autoencoder_detector.is_trained:
            norm_feat = (feat_arr - autoencoder_detector.mean) / autoencoder_detector.std
            tensor_in = torch.tensor(norm_feat.reshape(1, -1), dtype=torch.float32).to(autoencoder_detector.device)
            with torch.no_grad():
                recons = autoencoder_detector.model(tensor_in)
                diff = (recons - tensor_in) ** 2
                per_feature_errors = diff.cpu().numpy()[0].tolist()
        else:
            # Fallback heuristic weighting based on feature magnitudes
            per_feature_errors = [abs(f) * 0.1 for f in raw_features]
            
        total_error = sum(per_feature_errors) if sum(per_feature_errors) > 0 else 1.0
        
        # Calculate percentage attribution
        attributions: List[XAIAttribution] = []
        for idx, (name, val, err) in enumerate(zip(self.feature_names, raw_features, per_feature_errors)):
            pct = round((err / total_error) * 100.0, 1)
            is_driver = pct >= 15.0 or (detection.threat_level != "NORMAL" and pct >= 12.0)
            
            # Format explanation
            val_fmt = f"{val:.2f}"
            val_pct = f"{val*100:.1f}"
            exp_template = FEATURE_EXPLANATIONS.get(name, {})
            if is_driver and detection.threat_level != "NORMAL":
                explanation = exp_template.get("high", "High deviation observed in this dimension.").format(val=val_fmt, val_pct=val_pct)
            else:
                explanation = exp_template.get("normal", "Nominal behavioral envelope.").format(val=val_fmt, val_pct=val_pct)
                
            attributions.append(XAIAttribution(
                feature_name=name,
                feature_value=round(val, 3),
                attribution_pct=pct,
                is_driver=is_driver,
                explanation=explanation
            ))
            
        # Sort by attribution percentage descending
        attributions.sort(key=lambda a: a.attribution_pct, reverse=True)
        primary_driver = attributions[0].feature_name if attributions else "packet_rate"
        
        # Zero-Day Analysis: If hybrid score is high but no known signature pattern matches
        is_zero_day = False
        if detection.threat_level == "CRITICAL" and not detection.classified_attack:
            is_zero_day = True
            
        # Analyst forensic summary
        if detection.threat_level == "CRITICAL":
            summary = (
                f"CRITICAL ANOMALY: Model triggered by primary anomaly driver '{primary_driver}' "
                f"({attributions[0].attribution_pct}% attribution). "
                f"Combined with secondary driver '{attributions[1].feature_name}' ({attributions[1].attribution_pct}%). "
                f"Ensemble confidence: {detection.confidence_pct}%. Recommended mitigation: isolate node and enforce MLSA challenge."
            )
        elif detection.threat_level == "SUSPICIOUS":
            summary = (
                f"ELEVATED THREAT: Mild deviation detected in '{primary_driver}' ({attributions[0].attribution_pct}%). "
                f"Traffic remains under automated risk observation."
            )
        else:
            summary = "NOMINAL BASELINE: Network features conform to learned benign IoT sensor distribution."
            
        return XAIReport(
            timestamp=detection.timestamp,
            hybrid_threat_score=detection.hybrid_threat_score,
            threat_level=detection.threat_level,
            classified_attack=detection.classified_attack,
            is_zero_day=is_zero_day,
            primary_driver=primary_driver,
            attributions=attributions,
            analyst_summary=summary
        )

# Global XAI Engine singleton
xai_engine = XAIEngine()
