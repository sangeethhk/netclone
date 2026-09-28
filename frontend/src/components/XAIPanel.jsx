import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  HelpCircle, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Fingerprint, 
  Flame,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function XAIPanel() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchXAI = async () => {
    setLoading(true);
    try {
      const data = await api.getXAIAttribution();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXAI();
    const interval = setInterval(fetchXAI, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Explainable AI (XAI) Forensic Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                Model Transparency & Zero-Day Drift (Slide 19)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Decomposes PyTorch Autoencoder reconstruction loss into dimension-wise attribution percentages and plain-English threat rationales.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {report?.is_zero_day && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-500/50 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
              NOVEL / ZERO-DAY PATTERN DETECTED
            </span>
          )}

          <button
            onClick={fetchXAI}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh XAI Attribution"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Forensic Summary Card */}
      {report && (
        <div className="cyber-card rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-cyan-900/60">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Automated Forensic Attribution Rationale
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Primary Anomaly Driver: <strong className="text-red-400">{report.primary_driver}</strong>
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {report.analyst_summary}
          </p>
        </div>
      )}

      {/* 10-Feature Attribution Breakdown */}
      <div className="cyber-card rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-white">Dimension-Wise Reconstruction Loss Attribution</h3>
          <span className="text-xs font-mono text-slate-500">Sorted by Anomaly Contribution %</span>
        </div>

        <div className="space-y-3.5">
          {report?.attributions?.map((attr) => {
            const isHighDriver = attr.is_driver;

            return (
              <div 
                key={attr.feature_name}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHighDriver 
                    ? 'bg-red-950/30 border-red-500/50 shadow-sm shadow-red-500/10' 
                    : 'bg-slate-900/60 border-slate-800/80'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{attr.feature_name}</span>
                    <span className="font-mono text-slate-400 text-[11px]">(Val: {attr.feature_value})</span>
                    {isHighDriver && (
                      <span className="px-1.5 py-0.2 rounded bg-red-900 text-white font-sans text-[10px] font-bold">
                        PRIMARY DRIVER
                      </span>
                    )}
                  </div>
                  <span className={`font-mono font-extrabold ${isHighDriver ? 'text-red-400' : 'text-cyan-400'}`}>
                    {attr.attribution_pct}%
                  </span>
                </div>

                {/* Contribution Visual Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isHighDriver ? 'bg-gradient-to-r from-red-600 to-rose-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.max(attr.attribution_pct, 4)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {attr.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
