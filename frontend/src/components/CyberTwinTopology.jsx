import React, { useState } from 'react';
import { 
  Camera, 
  Thermometer, 
  Cpu, 
  HeartPulse, 
  Router, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  Radio,
  Lock,
  RefreshCw,
  ExternalLink,
  ShieldBan
} from 'lucide-react';

export default function CyberTwinTopology({ 
  topology, 
  activeAttack, 
  onQuarantine, 
  onRestore, 
  onInspectMLSA 
}) {
  const [selectedDevice, setSelectedDevice] = useState(null);

  const getDeviceIcon = (category) => {
    if (category.includes('Camera') || category.includes('Surveillance')) return Camera;
    if (category.includes('HVAC') || category.includes('Thermostat')) return Thermometer;
    if (category.includes('Industrial') || category.includes('IIoT')) return Cpu;
    if (category.includes('Healthcare') || category.includes('IoMT')) return HeartPulse;
    return Router;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ATTACKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> UNDER ATTACK
          </span>
        );
      case 'QUARANTINED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
            <ShieldBan className="w-3 h-3" /> QUARANTINED
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/50">
            <Radio className="w-3 h-3" /> SUSPICIOUS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <ShieldCheck className="w-3 h-3" /> SYNCHRONIZED
          </span>
        );
    }
  };

  const allDevices = topology ? [topology.gateway, ...topology.devices] : [];
  const currentDevice = selectedDevice || (topology ? topology.devices[0] : null);

  return (
    <div className="space-y-6">
      {/* Top Banner & Cyber Twin Metainfo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl cyber-card gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide">NetClone Cyber Twin Topology</h2>
            <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Safe Sandbox Environment
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Replicating physical IoT device states, network sockets, telemetry streams, and dynamic defense actions in software.
          </p>
        </div>

        {/* Global Twin Health Bar */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-400">Twin Health Index</span>
            <div className="text-lg font-bold font-mono text-cyan-400">
              {topology ? `${topology.system_health_pct}%` : '100%'}
            </div>
          </div>
          <div className="w-32 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-500 ${
                (topology?.system_health_pct || 100) > 75 
                  ? 'bg-emerald-500' 
                  : (topology?.system_health_pct || 100) > 40 
                  ? 'bg-amber-500' 
                  : 'bg-red-500'
              }`}
              style={{ width: `${topology?.system_health_pct || 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Graph + Device Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Visual Network Topology Map */}
        <div className="lg:col-span-2 cyber-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[460px] cyber-grid-bg">
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Mirrored Cyber Twin Mesh (1 Gateway : {topology?.devices?.length || 4} IoT Endpoints)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Attacked
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Quarantined
              </span>
            </div>
          </div>

          {/* SVG Animated Topology Diagram */}
          <div className="relative w-full h-[360px] flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="linkNormal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2"/>
                </linearGradient>
                <linearGradient id="linkAttack" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.4"/>
                </linearGradient>
                <linearGradient id="linkQuarantine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#64748b" stopOpacity="0.1"/>
                </linearGradient>
              </defs>

              {/* Connecting lines from Center Gateway to each Device Node */}
              {/* Positions: Center (50%, 50%), Dev1 Top-Left (20%, 25%), Dev2 Top-Right (80%, 25%), Dev3 Bottom-Left (20%, 75%), Dev4 Bottom-Right (80%, 75%) */}
              <line 
                x1="50%" y1="50%" x2="20%" y2="25%" 
                stroke={topology?.devices?.[0]?.status === 'ATTACKED' ? 'url(#linkAttack)' : topology?.devices?.[0]?.status === 'QUARANTINED' ? 'url(#linkQuarantine)' : 'url(#linkNormal)'} 
                strokeWidth={topology?.devices?.[0]?.status === 'ATTACKED' ? "3" : "1.5"} 
                strokeDasharray={topology?.devices?.[0]?.status === 'QUARANTINED' ? "4 4" : "none"} 
              />
              <line 
                x1="50%" y1="50%" x2="80%" y2="25%" 
                stroke={topology?.devices?.[1]?.status === 'ATTACKED' ? 'url(#linkAttack)' : topology?.devices?.[1]?.status === 'QUARANTINED' ? 'url(#linkQuarantine)' : 'url(#linkNormal)'} 
                strokeWidth={topology?.devices?.[1]?.status === 'ATTACKED' ? "3" : "1.5"} 
                strokeDasharray={topology?.devices?.[1]?.status === 'QUARANTINED' ? "4 4" : "none"}
              />
              <line 
                x1="50%" y1="50%" x2="20%" y2="75%" 
                stroke={topology?.devices?.[2]?.status === 'ATTACKED' ? 'url(#linkAttack)' : topology?.devices?.[2]?.status === 'QUARANTINED' ? 'url(#linkQuarantine)' : 'url(#linkNormal)'} 
                strokeWidth={topology?.devices?.[2]?.status === 'ATTACKED' ? "3" : "1.5"} 
                strokeDasharray={topology?.devices?.[2]?.status === 'QUARANTINED' ? "4 4" : "none"}
              />
              <line 
                x1="50%" y1="50%" x2="80%" y2="75%" 
                stroke={topology?.devices?.[3]?.status === 'ATTACKED' ? 'url(#linkAttack)' : topology?.devices?.[3]?.status === 'QUARANTINED' ? 'url(#linkQuarantine)' : 'url(#linkNormal)'} 
                strokeWidth={topology?.devices?.[3]?.status === 'ATTACKED' ? "3" : "1.5"} 
                strokeDasharray={topology?.devices?.[3]?.status === 'QUARANTINED' ? "4 4" : "none"}
              />
            </svg>

            {/* Center Node: Edge Gateway */}
            {topology?.gateway && (
              <button
                onClick={() => setSelectedDevice(topology.gateway)}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 group flex flex-col items-center focus:outline-none`}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950 border-2 border-cyan-500 flex items-center justify-center shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition-all">
                  <Router className="w-8 h-8 text-cyan-400" />
                </div>
                <span className="mt-2 text-xs font-mono font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                  {topology.gateway.name}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">{topology.gateway.ip}</span>
              </button>
            )}

            {/* Peripheral Nodes */}
            {topology?.devices?.map((dev, idx) => {
              const DevIcon = getDeviceIcon(dev.category);
              const isSelected = currentDevice?.id === dev.id;
              const isAttacked = dev.status === 'ATTACKED';
              const isQuarantined = dev.status === 'QUARANTINED';

              // Positioning corners
              const posStyles = [
                { left: '12%', top: '15%' },
                { right: '12%', top: '15%' },
                { left: '12%', bottom: '15%' },
                { right: '12%', bottom: '15%' },
              ][idx % 4];

              return (
                <button
                  key={dev.id}
                  onClick={() => setSelectedDevice(dev)}
                  style={posStyles}
                  className={`absolute z-20 group flex flex-col items-center focus:outline-none transition-all`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isAttacked 
                      ? 'bg-red-950/80 border-2 border-red-500 shadow-red-500/40 animate-bounce' 
                      : isQuarantined
                      ? 'bg-cyan-950/80 border-2 border-cyan-400 shadow-cyan-400/20 opacity-75'
                      : isSelected
                      ? 'bg-slate-900 border-2 border-cyan-400 shadow-cyan-400/30 scale-110'
                      : 'bg-slate-900/90 border border-slate-700 hover:border-slate-500'
                  }`}>
                    <DevIcon className={`w-6 h-6 ${
                      isAttacked ? 'text-red-400' : isQuarantined ? 'text-cyan-300' : 'text-slate-300'
                    }`} />
                  </div>
                  <span className="mt-1.5 text-xs font-medium text-slate-200 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                    {dev.name.split(' ')[0]} {dev.name.split(' ')[1]}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{dev.ip}</span>
                  <div className="mt-0.5">{getStatusBadge(dev.status)}</div>
                </button>
              );
            })}
          </div>

          <div className="text-center text-xs text-slate-500 mt-2 z-10">
            Click any IoT node to inspect twin telemetry, open sockets, or apply defense controls.
          </div>
        </div>

        {/* Device Deep Inspector Drawer */}
        <div className="cyber-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                  {currentDevice && React.createElement(getDeviceIcon(currentDevice.category), { className: "w-5 h-5 text-cyan-400" })}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{currentDevice?.name || 'Device Overview'}</h3>
                  <p className="text-xs text-slate-400">{currentDevice?.category}</p>
                </div>
              </div>
              {currentDevice && getStatusBadge(currentDevice.status)}
            </div>

            {/* Spec Matrix */}
            {currentDevice && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-slate-500 block">IP Address</span>
                    <span className="font-mono text-slate-200 font-semibold">{currentDevice.ip}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-slate-500 block">MAC Address</span>
                    <span className="font-mono text-slate-200 font-semibold">{currentDevice.mac}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-slate-500 block">Open Ports</span>
                    <span className="font-mono text-cyan-400 font-semibold">
                      {currentDevice.open_ports.join(', ')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-slate-500 block">Protocols</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {currentDevice.protocols.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-500 block">Telemetry Type</span>
                  <span className="text-xs text-slate-300 font-medium">{currentDevice.telemetry_type}</span>
                </div>

                {/* Telemetry Meters */}
                <div className="space-y-2 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Twin CPU Utilization</span>
                      <span className="font-mono text-slate-200">{currentDevice.cpu_usage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${currentDevice.cpu_usage > 70 ? 'bg-red-500' : 'bg-cyan-500'}`}
                        style={{ width: `${currentDevice.cpu_usage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Packets Ingested</span>
                      <span className="font-mono text-slate-200">{currentDevice.packet_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Defense Actions for this Node */}
          {currentDevice && currentDevice.id !== 'dev_gateway_00' && (
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">
                Node Mitigation Controls
              </span>
              <div className="grid grid-cols-2 gap-2">
                {currentDevice.status === 'QUARANTINED' ? (
                  <button
                    onClick={() => onRestore(currentDevice.id)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Restore Node
                  </button>
                ) : (
                  <button
                    onClick={() => onQuarantine(currentDevice.id)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-rose-600/90 hover:bg-rose-500 text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldBan className="w-3.5 h-3.5" /> Isolate Node
                  </button>
                )}

                <button
                  onClick={() => onInspectMLSA(currentDevice)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" /> MLSA Challenge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
