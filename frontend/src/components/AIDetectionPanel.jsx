import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  BrainCircuit, 
  Cpu, 
  Sliders, 
  Zap, 
  Activity, 
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export default function AIDetectionPanel({ aiDetection, onCustomClassify }) {
  const [testFeatures, setTestFeatures] = useState({
    packet_rate: 35.0,
    byte_rate: 22000.0,
    flow_duration: 15.0,
    syn_ratio: 0.05,
    ack_ratio: 0.95,
    port_entropy: 0.15,
    avg_payload_size: 650.0,
    error_rate: 0.01,
    protocol_id: 0.5,
    conn_state: 0.0
  });

  const [customResult, setCustomResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const featureNames = [
    { key: 'packet_rate', label: 'Packet Rate', unit: 'pkts/s', min: 1, max: 500 },
    { key: 'byte_rate', label: 'Byte Rate', unit: 'B/s', min: 500, max: 400000 },
    { key: 'flow_duration', label: 'Flow Duration', unit: 's', min: 1, max: 60 },
    { key: 'syn_ratio', label: 'TCP SYN Ratio', unit: '', min: 0.0, max: 1.0, step: 0.01 },
    { key: 'ack_ratio', label: 'TCP ACK Ratio', unit: '', min: 0.0, max: 1.0, step: 0.01 },
    { key: 'port_entropy', label: 'Port Shannon Entropy', unit: '', min: 0.0, max: 1.0, step: 0.01 },
    { key: 'avg_payload_size', label: 'Avg Payload Size', unit: 'B', min: 40, max: 1500 },
    { key: 'error_rate', label: 'Error / RST Ratio', unit: '', min: 0.0, max: 1.0, step: 0.01 },
    { key: 'protocol_id', label: 'Protocol ID', unit: '', min: 0.1, max: 1.0, step: 0.1 },
    { key: 'conn_state', label: 'Connection State', unit: '', min: 0.0, max: 2.0, step: 1.0 },
  ];

  const handleTestInference = async () => {
    setEvaluating(true);
    try {
      const vector = [
        testFeatures.packet_rate,
        testFeatures.byte_rate,
        testFeatures.flow_duration,
        testFeatures.syn_ratio,
        testFeatures.ack_ratio,
        testFeatures.port_entropy,
        testFeatures.avg_payload_size,
        testFeatures.error_rate,
        testFeatures.protocol_id,
        testFeatures.conn_state,
      ];
      const res = await api.evaluateVector(vector);
      setCustomResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const setPreset = (type) => {
    if (type === 'NORMAL') {
      setTestFeatures({
        packet_rate: 25.0,
        byte_rate: 18000.0,
        flow_duration: 12.0,
        syn_ratio: 0.03,
        ack_ratio: 0.96,
        port_entropy: 0.12,
        avg_payload_size: 720.0,
        error_rate: 0.01,
        protocol_id: 0.4,
        conn_state: 0.0
      });
    } else if (type === 'SYN_FLOOD') {
      setTestFeatures({
        packet_rate: 340.0,
        byte_rate: 21000.0,
        flow_duration: 2.0,
        syn_ratio: 0.94,
        ack_ratio: 0.02,
        port_entropy: 0.05,
        avg_payload_size: 54.0,
        error_rate: 0.78,
        protocol_id: 0.2,
        conn_state: 1.0
      });
    } else if (type === 'PORT_SCAN') {
      setTestFeatures({
        packet_rate: 110.0,
        byte_rate: 6800.0,
        flow_duration: 5.0,
        syn_ratio: 0.45,
        ack_ratio: 0.10,
        port_entropy: 0.92,
        avg_payload_size: 60.0,
        error_rate: 0.65,
        protocol_id: 0.2,
        conn_state: 1.0
      });
    } else if (type === 'DATA_EXFIL') {
      setTestFeatures({
        packet_rate: 180.0,
        byte_rate: 280000.0,
        flow_duration: 40.0,
        syn_ratio: 0.05,
        ack_ratio: 0.92,
        port_entropy: 0.08,
        avg_payload_size: 1450.0,
        error_rate: 0.02,
        protocol_id: 0.2,
        conn_state: 0.0
      });
    }
  };

  const activeResult = customResult || aiDetection;
  const isAnomalous = activeResult?.threat_level !== 'NORMAL';

  return (
    <div className="space-y-6">
      {/* Top AI Decision Card */}
      <div className={`p-6 rounded-2xl cyber-card border-2 transition-all ${
        activeResult?.threat_level === 'CRITICAL'
          ? 'border-red-500/60 shadow-xl shadow-red-500/20'
          : activeResult?.threat_level === 'SUSPICIOUS'
          ? 'border-amber-500/60 shadow-xl shadow-amber-500/20'
          : 'border-emerald-500/40 shadow-xl shadow-emerald-500/10'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              activeResult?.threat_level === 'CRITICAL'
                ? 'bg-red-950/80 text-red-400 border border-red-500'
                : activeResult?.threat_level === 'SUSPICIOUS'
                ? 'bg-amber-950/80 text-amber-400 border border-amber-500'
                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500'
            }`}>
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">Ensemble AI Classification</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeResult?.threat_level === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : activeResult?.threat_level === 'SUSPICIOUS'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {activeResult?.threat_level || 'NORMAL'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {activeResult?.classified_attack 
                  ? `Active Threat: ${activeResult.classified_attack.replace(/_/g, ' ')}` 
                  : 'Normal IoT Behavior Profile'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                PyTorch Deep Autoencoder + Scikit-Learn Isolation Forest Ensemble
              </p>
            </div>
          </div>

          {/* Probability & Confidence Meters */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Hybrid Threat Probability</span>
              <span className={`text-3xl font-extrabold font-mono ${
                (activeResult?.hybrid_threat_score || 0) > 70 
                  ? 'text-red-400' 
                  : (activeResult?.hybrid_threat_score || 0) > 40 
                  ? 'text-amber-400' 
                  : 'text-emerald-400'
              }`}>
                {activeResult?.hybrid_threat_score?.toFixed(1) || '0.0'}%
              </span>
            </div>

            <div className="text-right border-l border-slate-800 pl-6">
              <span className="text-xs text-slate-400 block">Model Confidence</span>
              <span className="text-3xl font-extrabold font-mono text-cyan-400">
                {activeResult?.confidence_pct?.toFixed(1) || '95.0'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Model Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Model 1: Autoencoder Reconstruction Error */}
        <div className="cyber-card rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">PyTorch Autoencoder (DL)</h3>
                <span className="text-xs text-slate-400">Latent Compression Anomaly Reconstruction</span>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
              activeResult?.autoencoder_flag 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {activeResult?.autoencoder_flag ? 'ANOMALY DETECTED' : 'NORMAL LOSS'}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Reconstruction MSE</span>
                <span className={`text-lg font-mono font-bold ${activeResult?.autoencoder_flag ? 'text-red-400' : 'text-slate-200'}`}>
                  {activeResult?.autoencoder_mse?.toFixed(5) || '0.00000'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Anomaly Threshold</span>
                <span className="text-lg font-mono font-bold text-cyan-400">
                  {activeResult?.autoencoder_threshold?.toFixed(5) || '0.04500'}
                </span>
              </div>
            </div>

            {/* Error vs Threshold Ratio Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Loss vs Threshold Ratio</span>
                <span className="font-mono">
                  {((activeResult?.autoencoder_mse || 0) / Math.max(activeResult?.autoencoder_threshold || 1, 0.001)).toFixed(2)}x
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    activeResult?.autoencoder_flag ? 'bg-red-500' : 'bg-cyan-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, ((activeResult?.autoencoder_mse || 0) / Math.max(activeResult?.autoencoder_threshold || 1, 0.001)) * 50)}%` 
                  }}
                />
              </div>
            </div>
            
            <p className="text-xs text-slate-500">
              When network telemetry deviates from normal IoT sensor distributions, deep layers fail to reconstruct the feature vector, driving MSE spikes.
            </p>
          </div>
        </div>

        {/* Model 2: Isolation Forest */}
        <div className="cyber-card rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Isolation Forest (ML)</h3>
                <span className="text-xs text-slate-400">Multi-Dimensional Tree Outlier Isolation</span>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
              activeResult?.isolation_forest_flag 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {activeResult?.isolation_forest_flag ? 'OUTLIER DETECTED' : 'INLIER'}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Raw Decision Score</span>
                <span className={`text-lg font-mono font-bold ${activeResult?.isolation_forest_flag ? 'text-red-400' : 'text-slate-200'}`}>
                  {activeResult?.isolation_forest_score?.toFixed(4) || '0.0000'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Contamination Rate</span>
                <span className="text-lg font-mono font-bold text-purple-400">0.08 (8%)</span>
              </div>
            </div>

            {/* Score Visual Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Anomaly Depth Distance</span>
                <span className="font-mono">
                  {activeResult?.isolation_forest_flag ? 'High Outlier Risk' : 'Typical Cluster'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    activeResult?.isolation_forest_flag ? 'bg-red-500' : 'bg-purple-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.max(10, (0.5 - (activeResult?.isolation_forest_score || 0)) * 100))}%` 
                  }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Evaluates tree-branch partitioning depth. Anomalous traffic vectors require significantly fewer random splits to isolate than normal patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive AI Sandbox: Tweak 10 Features and Run Inference */}
      <div className="cyber-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Interactive 10-Feature Inference Sandbox</h3>
              <p className="text-xs text-slate-400">
                Manually perturb feature vectors or inject attack signatures to test the ensemble live
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Presets:</span>
            <button
              onClick={() => setPreset('NORMAL')}
              className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Normal
            </button>
            <button
              onClick={() => setPreset('SYN_FLOOD')}
              className="px-2.5 py-1 text-xs rounded bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-800/80 font-medium"
            >
              SYN Flood
            </button>
            <button
              onClick={() => setPreset('PORT_SCAN')}
              className="px-2.5 py-1 text-xs rounded bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 font-medium"
            >
              Port Scan
            </button>
            <button
              onClick={() => setPreset('DATA_EXFIL')}
              className="px-2.5 py-1 text-xs rounded bg-purple-950/80 hover:bg-purple-900/80 text-purple-300 border border-purple-800/80 font-medium"
            >
              Exfiltration
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          {featureNames.map((feat) => (
            <div key={feat.key} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-medium">{feat.label}</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {testFeatures[feat.key]} {feat.unit}
                </span>
              </div>
              <input
                type="range"
                min={feat.min}
                max={feat.max}
                step={feat.step || 1}
                value={testFeatures[feat.key]}
                onChange={(e) => setTestFeatures({
                  ...testFeatures,
                  [feat.key]: parseFloat(e.target.value)
                })}
                className="w-full accent-cyan-500 cursor-pointer mt-2"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleTestInference}
            disabled={evaluating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {evaluating ? 'Evaluating Ensemble...' : 'Pass Vector Through Ensemble'}
          </button>
        </div>
      </div>
    </div>
  );
}
