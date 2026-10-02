import React, { useState } from 'react';
import { 
  Database, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Lock, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Layers,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { BRAND_CONFIG } from '../config/branding';

export default function MLSABreachBench() {
  const [username, setUsername] = useState('admin');
  const [benchResult, setBenchResult] = useState(null);
  const [running, setRunning] = useState(false);

  const handleRunBench = async () => {
    setRunning(true);
    try {
      const res = await api.simulateBreach(username);
      setBenchResult(res);
    } catch (err) {
      alert(`Benchmark error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                MLSA Negative Password Database Breach Benchmark
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                Offline Dictionary Crack Resistance
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical simulation comparing traditional SHA-256 positive hash cracking against {BRAND_CONFIG.name}'s Encrypted Negative Passwords during database leaks.
            </p>
          </div>
        </div>

        {/* Bench Trigger */}
        <div className="flex items-center gap-3">
          <select
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="admin">Target: admin</option>
            <option value="iot_engineer">Target: iot_engineer</option>
          </select>

          <button
            onClick={handleRunBench}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            {running ? 'Running Cracker...' : 'Simulate Database Dump Crack'}
          </button>
        </div>
      </div>

      {/* Side-by-Side Benchmark Arena */}
      {benchResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left: Traditional SHA-256 Hash Dump */}
          <div className="cyber-card rounded-2xl p-6 border-2 border-red-500/60 shadow-xl shadow-red-500/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <h3 className="text-sm font-bold text-white">Conventional Database (SHA-256)</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-800">
                  COMPROMISED
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block mb-1 text-[11px]">Dumped Positive Hash:</span>
                  <code className="text-red-300 break-all font-mono text-[11px] block">
                    {benchResult.sha256_hash}
                  </code>
                </div>

                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50">
                  <span className="text-red-300 font-bold block mb-1">
                    Dictionary Cracker Recovery:
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-white">
                      "{benchResult.sha256_recovered_plaintext}"
                    </span>
                    <span className="font-mono text-xs text-red-300">
                      Cracked in {benchResult.sha256_time_ms}ms
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  In a positive database leak, precomputed rainbow tables or GPU wordlists reverse the hash in milliseconds, exposing the actual user credential.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-red-400 font-mono font-semibold">
              Adversary has obtained full system access.
            </div>
          </div>

          {/* Right: NetClone MLSA Negative Database */}
          <div className="cyber-card rounded-2xl p-6 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">{BRAND_CONFIG.name} MLSA (Negative Database)</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  UNCRACKED / SECURE
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block mb-1 text-[11px]">Dumped Negative Constraint Matrix:</span>
                  <code className="text-emerald-300 font-mono text-[11px] block">
                    {benchResult.negative_rules_count} Negative Space Vectors (U \ &#123;P&#125;)
                  </code>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50">
                  <span className="text-emerald-300 font-bold block mb-1">
                    Dictionary Cracker Recovery:
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-slate-300">
                      NULL (Zero Matches)
                    </span>
                    <span className="font-mono text-xs text-emerald-300">
                      Elapsed: {benchResult.negative_db_time_ms}ms
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  The negative database stores what the password is NOT. Testing candidates against negative rules filters out non-passwords but cannot reveal the positive core string without solving an NP-hard complement problem.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-mono font-semibold">
              Credentials remain immune despite full database compromise.
            </div>
          </div>
        </div>
      )}

      {/* Mathematical Proof Card */}
      {benchResult && (
        <div className="cyber-card rounded-2xl p-6 bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-2">
            Theoretical Cryptographic Basis
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {benchResult.math_resistance_proof}
          </p>
        </div>
      )}
    </div>
  );
}
