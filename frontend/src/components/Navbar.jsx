import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Zap, 
  Lock, 
  FileText, 
  RotateCcw,
  Wifi,
  WifiOff,
  Flame,
  HardDrive,
  BrainCircuit,
  GitFork,
  Database
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  wsConnected, 
  threatLevel, 
  autoDefense, 
  onToggleDefense,
  onResetTwin,
  quarantinedCount
}) {
  const tabs = [
    { id: 'topology', label: 'Cyber Twin Topology', icon: Cpu },
    { id: 'fleet', label: 'IoT Fleet & Real Devices', icon: HardDrive },
    { id: 'telemetry', label: 'Traffic Telemetry', icon: Activity },
    { id: 'ai', label: 'AI Threat Engine', icon: ShieldCheck },
    { id: 'xai', label: 'Explainable AI (XAI)', icon: BrainCircuit },
    { id: 'attack', label: 'Attack Simulator', icon: Flame },
    { id: 'attack_graph', label: 'Directed Attack Graph', icon: GitFork },
    { id: 'mlsa', label: 'MLSA Authentication', icon: Lock },
    { id: 'breach_bench', label: 'Breach Benchmark', icon: Database },
    { id: 'defense', label: 'Automated Defense', icon: ShieldAlert },
    { id: 'logs', label: 'Audit Logs & Reports', icon: FileText },
  ];

  const getThreatBadge = () => {
    switch (threatLevel) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            THREAT: CRITICAL
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            THREAT: SUSPICIOUS
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            SYS HEALTH: NOMINAL
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">NetClone</h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                v2.0 Cyber Twin
              </span>
            </div>
            <p className="text-xs text-slate-400">AI-Driven Threat Simulation & MLSA Defense</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-400">
            {wsConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="font-mono text-cyan-400">LIVE SYNC</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-mono text-rose-400">DISCONNECTED</span>
              </>
            )}
          </div>

          {/* Threat Badge */}
          {getThreatBadge()}

          {/* Quarantined Nodes Counter */}
          {quarantinedCount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Quarantined: {quarantinedCount}
            </span>
          )}

          {/* Auto-Defense Toggle */}
          <button
            onClick={onToggleDefense}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoDefense
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle autonomous incident response and dynamic firewall mitigation"
          >
            <Zap className={`w-3.5 h-3.5 ${autoDefense ? 'text-emerald-400' : 'text-slate-500'}`} />
            Auto-Defense: {autoDefense ? 'ON' : 'OFF'}
          </button>

          {/* Reset Sandbox */}
          <button
            onClick={onResetTwin}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            title="Reset Cyber Twin to baseline physical network state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 overflow-x-auto">
        <nav className="flex space-x-1 py-1.5" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
