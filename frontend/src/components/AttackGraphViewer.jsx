import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Crown, 
  Lock, 
  ArrowRight,
  RefreshCw,
  Scissors,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function AttackGraphViewer() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const data = await api.getAttackGraph();
      setGraphData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
    const interval = setInterval(fetchGraph, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Directed Cyber Attack Graph & Lateral Movement Model
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              MITRE ATT&CK Kill-Chain (Slide 19)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates multi-hop lateral propagation from untrusted IoT perimeters to critical Crown Jewel infrastructure and identifies automated defense cut-points.
          </p>
        </div>

        <button
          onClick={fetchGraph}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          title="Refresh Attack Graph"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Kill Chain Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cyber-card rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Active Adversary Progression</span>
          <div className="flex items-center gap-2">
            {graphData?.active_kill_chain?.length > 0 ? (
              <span className="text-sm font-bold font-mono text-red-400 flex items-center gap-1.5 animate-pulse">
                <Flame className="w-4 h-4 text-red-500" />
                {graphData.active_kill_chain.join(' → ')}
              </span>
            ) : (
              <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> NO ACTIVE LATERAL PROPAGATION
              </span>
            )}
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Automated Defense Cut-Point</span>
          <div className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-1.5 truncate">
            <Scissors className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{graphData?.defense_severed_at || 'Perimeter Secure (Standby)'}</span>
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Crown Jewel Asset Integrity</span>
          <div className="text-sm font-bold font-mono flex items-center gap-1.5">
            <Crown className={`w-4 h-4 ${graphData?.crown_jewel_compromised ? 'text-red-500 animate-bounce' : 'text-amber-400'}`} />
            <span className={graphData?.crown_jewel_compromised ? 'text-red-400' : 'text-emerald-400'}>
              {graphData?.crown_jewel_compromised ? 'CRITICAL: COMPROMISED' : 'PROTECTED & AIR-GAPPED'}
            </span>
          </div>
        </div>
      </div>

      {/* Graph Visual Canvas & Node Threat Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Graph Schema (2 cols) */}
        <div className="lg:col-span-2 cyber-card rounded-2xl p-6 min-h-[420px] flex flex-col justify-between cyber-grid-bg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Directed Lateral Attack Paths</h3>
            <span className="text-xs font-mono text-slate-500">Node Trust & Feasible Pivot Graph</span>
          </div>

          {/* Visual Lateral Movement Path View */}
          <div className="py-6 space-y-4">
            {graphData?.edges?.map((edge, idx) => {
              const isExploited = edge.status === 'EXPLOITED';
              const isSevered = edge.status === 'SEVERED_BY_DEFENSE';

              return (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isExploited 
                      ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-500/20' 
                      : isSevered 
                      ? 'bg-cyan-950/30 border-cyan-500/60 border-dashed'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-950 text-white border border-slate-800">
                      {edge.source}
                    </span>
                    <ArrowRight className={`w-4 h-4 ${isExploited ? 'text-red-400 animate-pulse' : isSevered ? 'text-cyan-400' : 'text-slate-600'}`} />
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-950 text-white border border-slate-800">
                      {edge.target}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      :{edge.port} ({edge.protocol})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-mono hidden md:inline truncate max-w-xs">
                      {edge.exploit_technique}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      isExploited ? 'bg-red-900 text-red-200' :
                      isSevered ? 'bg-cyan-900 text-cyan-200 flex items-center gap-1' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {isSevered && <Scissors className="w-3 h-3 inline mr-1" />}
                      {edge.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800 text-center font-mono">
            Automated defense dynamically severs edges when Autoencoder / Isolation Forest flags anomalous pivots.
          </div>
        </div>

        {/* Node Vulnerability & Crown Jewels Deck */}
        <div className="cyber-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white">Asset Exposure Scores</h3>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>

            <div className="space-y-3">
              {graphData?.nodes?.map((node) => (
                <div key={node.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {node.is_crown_jewel && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      <span className="text-xs font-bold text-white">{node.label}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      CVSS {node.vulnerability_score.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                    <span>{node.category.split('/')[0]}</span>
                    <span className={`font-bold ${
                      node.status === 'ATTACKED' ? 'text-red-400' :
                      node.status === 'QUARANTINED' ? 'text-cyan-300' :
                      'text-emerald-400'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
