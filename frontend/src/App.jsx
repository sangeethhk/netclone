import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CyberTwinTopology from './components/CyberTwinTopology';
import TrafficMonitor from './components/TrafficMonitor';
import AIDetectionPanel from './components/AIDetectionPanel';
import AttackSimulator from './components/AttackSimulator';
import MLSAPanel from './components/MLSAPanel';
import AutomatedDefense from './components/AutomatedDefense';
import SecurityLogs from './components/SecurityLogs';
import DeviceFleetManager from './components/DeviceFleetManager';
import AttackGraphViewer from './components/AttackGraphViewer';
import XAIPanel from './components/XAIPanel';
import MLSABreachBench from './components/MLSABreachBench';
import { api } from './services/api';
import { AlertOctagon, ShieldAlert, X } from 'lucide-react';
import { BRAND_CONFIG } from './config/branding';

export default function App() {
  const [activeTab, setActiveTab] = useState('topology');
  const [wsConnected, setWsConnected] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [topology, setTopology] = useState(null);
  const [aiDetection, setAiDetection] = useState(null);
  const [attackStatus, setAttackStatus] = useState(null);
  const [defenseState, setDefenseState] = useState(null);
  const [scenarios, setScenarios] = useState({});
  const [toastDismissed, setToastDismissed] = useState(false);

  const wsRef = useRef(null);

  // Initial REST fetch for baseline topology, scenarios, defense status
  const loadInitialData = async () => {
    try {
      const [topData, scData, defData] = await Promise.all([
        api.getTopology().catch(() => null),
        api.getAttackScenarios().catch(() => ({})),
        api.getDefenseStatus().catch(() => null),
      ]);
      if (topData) setTopology(topData);
      if (scData) setScenarios(scData);
      if (defData) setDefenseState(defData);
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Setup WebSocket connection with auto-reconnect
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const defaultWsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
      const wsUrl = import.meta.env.VITE_WS_URL || defaultWsUrl;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.telemetry) {
            setTelemetry(data.telemetry);
            setTelemetryHistory((prev) => {
              const nowTime = new Date().toLocaleTimeString().slice(3, 8);
              const next = [...prev, {
                time: nowTime,
                packet_rate: data.telemetry.packet_rate,
                byte_rate: data.telemetry.byte_rate
              }];
              return next.slice(-25);
            });
          }

          if (data.topology) {
            setTopology(data.topology);
          }

          if (data.ai_detection) {
            setAiDetection(data.ai_detection);
          }

          if (data.attack) {
            setAttackStatus(data.attack);
          }

          if (data.defense) {
            setDefenseState((prev) => ({
              ...prev,
              ...data.defense
            }));
          }
        } catch (err) {
          console.error('WS Parse Error:', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Top-level Action Handlers
  const handleToggleDefense = async () => {
    try {
      const targetState = !defenseState?.auto_defense_active;
      const res = await api.toggleAutoDefense(targetState);
      setDefenseState((prev) => ({ ...prev, auto_defense_active: res.auto_defense_enabled }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetTwin = async () => {
    try {
      await api.resetCyberTwin();
      loadInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartAttack = async (req) => {
    try {
      const status = await api.startAttack(req);
      setAttackStatus(status);
      setToastDismissed(false);
    } catch (e) {
      alert(`Attack failed to launch: ${e.message}`);
    }
  };

  const handleStopAttack = async () => {
    try {
      const status = await api.stopAttack();
      setAttackStatus(status);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuarantineNode = async (deviceId) => {
    try {
      await api.quarantineNode(deviceId);
      loadInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreNode = async (deviceId) => {
    try {
      await api.restoreNode(deviceId);
      loadInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshDefense = async () => {
    try {
      const def = await api.getDefenseStatus();
      setDefenseState(def);
    } catch (e) {
      console.error(e);
    }
  };

  const threatLevel = aiDetection?.threat_level || 'NORMAL';
  const isCriticalAttack = attackStatus?.is_active && aiDetection?.threat_level === 'CRITICAL';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wsConnected={wsConnected}
        threatLevel={threatLevel}
        autoDefense={defenseState?.auto_defense_active ?? true}
        onToggleDefense={handleToggleDefense}
        onResetTwin={handleResetTwin}
        quarantinedCount={topology?.quarantined_count || 0}
      />

      {/* Main Tab View Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 contain-layout">
        {activeTab === 'topology' && (
          <CyberTwinTopology
            topology={topology}
            activeAttack={attackStatus}
            onQuarantine={handleQuarantineNode}
            onRestore={handleRestoreNode}
            onInspectMLSA={(dev) => setActiveTab('mlsa')}
          />
        )}

        {activeTab === 'fleet' && (
          <DeviceFleetManager
            onRefreshTopology={loadInitialData}
          />
        )}

        {activeTab === 'telemetry' && (
          <TrafficMonitor
            telemetry={telemetry}
            history={telemetryHistory}
          />
        )}

        {activeTab === 'ai' && (
          <AIDetectionPanel
            aiDetection={aiDetection}
          />
        )}

        {activeTab === 'xai' && (
          <XAIPanel />
        )}

        {activeTab === 'attack' && (
          <AttackSimulator
            scenarios={scenarios}
            attackStatus={attackStatus}
            devices={topology?.devices || []}
            onStartAttack={handleStartAttack}
            onStopAttack={handleStopAttack}
          />
        )}

        {activeTab === 'attack_graph' && (
          <AttackGraphViewer />
        )}

        {activeTab === 'mlsa' && (
          <MLSAPanel
            activeThreatLevel={threatLevel}
          />
        )}

        {activeTab === 'breach_bench' && (
          <MLSABreachBench />
        )}

        {activeTab === 'defense' && (
          <AutomatedDefense
            defenseState={defenseState}
            devices={topology?.devices || []}
            onToggleDefense={handleToggleDefense}
            onQuarantine={handleQuarantineNode}
            onRestore={handleRestoreNode}
            onRefreshRules={handleRefreshDefense}
          />
        )}

        {activeTab === 'logs' && (
          <SecurityLogs />
        )}
      </main>

      {/* Bottom Live Threat Alert Banner Toast */}
      {isCriticalAttack && !toastDismissed && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md w-full bg-red-950/95 border-2 border-red-500 rounded-2xl p-4 shadow-2xl shadow-red-500/40 backdrop-blur-md animate-bounce">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase bg-red-900 px-2 py-0.5 rounded text-white font-bold">
                  HIGH THREAT EVENT DETECTED
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {aiDetection?.classified_attack?.replace(/_/g, ' ') || 'IoT Flood Attack'}
                </h4>
                <p className="text-xs text-red-200">
                  Threat: {aiDetection?.hybrid_threat_score}% | Auto-Mitigation Active
                </p>
              </div>
            </div>

            <button
              onClick={() => setToastDismissed(true)}
              className="p-1 text-red-300 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setActiveTab('defense')}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-white text-red-950 hover:bg-slate-200 transition-colors"
            >
              View Defense Rules
            </button>
            <button
              onClick={handleStopAttack}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900 hover:bg-red-800 text-white transition-colors"
            >
              Halt Attack
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500 font-mono">
        {BRAND_CONFIG.footerText}
      </footer>
    </div>
  );
}
