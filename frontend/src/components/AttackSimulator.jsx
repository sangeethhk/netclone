import React, { useState } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  Play, 
  Square, 
  Radio, 
  AlertTriangle, 
  Sliders, 
  Clock, 
  Zap, 
  Crosshair,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/branding';

export default function AttackSimulator({ 
  scenarios, 
  attackStatus, 
  devices, 
  onStartAttack, 
  onStopAttack 
}) {
  const [selectedScenario, setSelectedScenario] = useState('DDOS_SYN_FLOOD');
  const [selectedTarget, setSelectedTarget] = useState('dev_cam_01');
  const [intensity, setIntensity] = useState(1.5);
  const [duration, setDuration] = useState(45);

  const scenarioList = Object.entries(scenarios || {}).map(([key, data]) => ({
    key,
    ...data
  }));

  const activeScenarioMeta = scenarios?.[attackStatus?.active_scenario];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="cyber-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              {BRAND_CONFIG.name} Attack Simulation Deck
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950 text-red-400 border border-red-800">
              Safe Isolated Cyber Twin Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inject realistic, controlled multi-vector cyberattacks against virtualized IoT devices without risking physical operational hardware.
          </p>
        </div>

        {/* Live Attack Status Pill */}
        {attackStatus?.is_active ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-950/80 border border-red-500/50 shadow-lg shadow-red-500/20">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <div>
              <span className="text-xs font-bold text-red-300 block">
                ATTACK IN PROGRESS: {activeScenarioMeta?.name || attackStatus.active_scenario}
              </span>
              <span className="text-[11px] font-mono text-red-400">
                Elapsed: {attackStatus.elapsed_seconds}s | Injected: {attackStatus.packets_generated} pkts
              </span>
            </div>
            <button
              onClick={onStopAttack}
              className="ml-3 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" /> Stop Attack
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SANDBOX QUIET / READY</span>
          </div>
        )}
      </div>

      {/* Main Grid: Attack Vector Selection Cards + Launch Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenarios Catalog (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Select Controlled Attack Vector
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenarioList.map((sc) => {
              const isSelected = selectedScenario === sc.key;
              const isCurrentlyRunning = attackStatus?.is_active && attackStatus.active_scenario === sc.key;

              return (
                <div
                  key={sc.key}
                  onClick={() => !attackStatus?.is_active && setSelectedScenario(sc.key)}
                  className={`p-4 rounded-xl cyber-card cursor-pointer transition-all border ${
                    isCurrentlyRunning
                      ? 'border-red-500 shadow-lg shadow-red-500/30 bg-red-950/40'
                      : isSelected
                      ? 'border-cyan-500 shadow-md shadow-cyan-500/20 bg-slate-900'
                      : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{sc.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      sc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      sc.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {sc.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {sc.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                    <span>MITRE: {sc.mitre_id}</span>
                    <span className="text-cyan-400">Target: {sc.target_default}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attack Execution Control Panel */}
        <div className="cyber-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Crosshair className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-bold text-white">Simulation Controls</h3>
            </div>

            {/* Target Device Selector */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                Target Cyber Twin Node
              </label>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                disabled={attackStatus?.is_active}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {devices?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ip})
                  </option>
                ))}
              </select>
            </div>

            {/* Attack Intensity */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Injection Rate Intensity</span>
                <span className="font-mono text-red-400 font-bold">{intensity}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.5"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                disabled={attackStatus?.is_active}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.5x (Stealth)</span>
                <span>1.5x (Standard)</span>
                <span>3.5x (Flooding)</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Simulation Duration</span>
                <span className="font-mono text-cyan-400 font-bold">{duration} seconds</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                disabled={attackStatus?.is_active}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Attack Feedback Card */}
            {attackStatus?.is_active && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Anomaly Flag:</span>
                  <span className={`font-bold ${attackStatus.detected_by_ai ? 'text-red-400' : 'text-slate-400'}`}>
                    {attackStatus.detected_by_ai ? 'DETECTED' : 'ANALYZING...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Automated Defense:</span>
                  <span className={`font-bold ${attackStatus.defense_triggered ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {attackStatus.defense_triggered ? 'MITIGATION ACTIVE' : 'STANDBY'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            {attackStatus?.is_active ? (
              <button
                onClick={onStopAttack}
                className="w-full py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Square className="w-4 h-4" /> Stop Attack Simulation
              </button>
            ) : (
              <button
                onClick={() => onStartAttack({
                  scenario_key: selectedScenario,
                  target_device_id: selectedTarget,
                  intensity,
                  duration_sec: duration
                })}
                className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
              >
                <Play className="w-4 h-4 fill-white" /> Launch Attack on Cyber Twin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
