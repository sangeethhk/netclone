import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  Zap, 
  Radio, 
  ShieldBan, 
  RefreshCw, 
  Cpu, 
  AlertTriangle,
  Lock,
  Flame
} from 'lucide-react';
import { api } from '../services/api';

export default function AutomatedDefense({ 
  defenseState, 
  devices, 
  onToggleDefense, 
  onQuarantine, 
  onRestore, 
  onRefreshRules 
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [srcIp, setSrcIp] = useState('198.51.100.0/24');
  const [dstIp, setDstIp] = useState('ANY');
  const [port, setPort] = useState('80');
  const [protocol, setProtocol] = useState('TCP');
  const [action, setAction] = useState('DROP');
  const [reason, setReason] = useState('Anomalous flood mitigation policy');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createFirewallRule({
        source_ip: srcIp,
        destination_ip: dstIp,
        port: port ? parseInt(port) : null,
        protocol,
        action,
        reason
      });
      setShowAddModal(false);
      onRefreshRules();
    } catch (err) {
      alert(`Error creating rule: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.deleteFirewallRule(ruleId);
      onRefreshRules();
    } catch (err) {
      alert(`Error deleting rule: ${err.message}`);
    }
  };

  const rules = defenseState?.firewall_rules || [];
  const quarantinedNodes = defenseState?.quarantined_nodes || [];

  return (
    <div className="space-y-6">
      {/* Top Defense Header */}
      <div className="cyber-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center border border-emerald-400/40 shadow-lg shadow-emerald-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                NetClone Automated Defense & Dynamic Firewall Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                Autonomous Incident Response
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuously converts AI threat detections into iptables-grade firewall rules and isolates compromised Cyber Twin nodes.
            </p>
          </div>
        </div>

        {/* Global Auto-Mitigation Toggle Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleDefense}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              defenseState?.auto_defense_active
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Zap className={`w-4 h-4 ${defenseState?.auto_defense_active ? 'text-emerald-200' : 'text-slate-400'}`} />
            {defenseState?.auto_defense_active ? 'Autonomous Defense: ACTIVE' : 'Manual Approval Mode'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Active Dynamic Rules</span>
            <span className="text-2xl font-bold font-mono text-cyan-400">{rules.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total Mitigations Executed</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {defenseState?.total_mitigations_executed || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Quarantined IoT Endpoints</span>
            <span className="text-2xl font-bold font-mono text-red-400">{quarantinedNodes.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center">
            <ShieldBan className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Dynamic Firewall Rules Table */}
      <div className="cyber-card rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Active Dynamic Firewall Table</h3>
              <p className="text-xs text-slate-400">Enforcing packet filtering across Cyber Twin interfaces</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500">Iptables Virtual Filter Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Rule ID</th>
                <th className="py-2.5 px-3">Source Pattern</th>
                <th className="py-2.5 px-3">Target Endpoint</th>
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">AI Trigger Reason</th>
                <th className="py-2.5 px-3 text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No active firewall rules. System perimeter operating with default baseline policy.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.rule_id} className="hover:bg-slate-800/30 text-slate-300">
                    <td className="py-2.5 px-3 font-bold text-cyan-400">{rule.rule_id}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{rule.source_ip}</td>
                    <td className="py-2.5 px-3 text-slate-300">{rule.destination_ip}</td>
                    <td className="py-2.5 px-3 text-cyan-300">{rule.port || 'ANY'}</td>
                    <td className="py-2.5 px-3">{rule.protocol}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.action === 'DROP' ? 'bg-red-950 text-red-400 border border-red-800' :
                        rule.action === 'RATE_LIMIT' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate" title={rule.reason}>
                      {rule.mitre_attack_id && (
                        <span className="mr-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-sans">
                          {rule.mitre_attack_id}
                        </span>
                      )}
                      {rule.reason}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteRule(rule.rule_id)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cyber Twin Node Quarantine Strip */}
      <div className="cyber-card rounded-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Cyber Twin Node Isolation Manager</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Microsegmentation & Air-Gapping</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {devices?.map((dev) => {
            const isQuarantined = dev.status === 'QUARANTINED';
            return (
              <div 
                key={dev.id} 
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isQuarantined 
                    ? 'bg-red-950/20 border-red-500/50 shadow-md shadow-red-500/10' 
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">{dev.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isQuarantined ? 'bg-red-900 text-red-200' : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {dev.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block">{dev.ip}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">{dev.category}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {isQuarantined ? (
                    <button
                      onClick={() => onRestore(dev.id)}
                      className="w-full py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reconnect Node
                    </button>
                  ) : (
                    <button
                      onClick={() => onQuarantine(dev.id)}
                      className="w-full py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-red-950/80 hover:text-red-300 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShieldBan className="w-3.5 h-3.5" /> Isolate Node
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-card rounded-2xl p-6 max-w-md w-full border border-cyan-500/50 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">Create Dynamic Firewall Rule</h3>
            <p className="text-xs text-slate-400 mb-4">
              Inject custom filtering rules directly into the NetClone automated defense layer.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Source IP / CIDR</label>
                <input
                  type="text"
                  value={srcIp}
                  onChange={(e) => setSrcIp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Destination IP</label>
                <input
                  type="text"
                  value={dstIp}
                  onChange={(e) => setDstIp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. 80"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Action</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="DROP">DROP</option>
                    <option value="REJECT">REJECT</option>
                    <option value="RATE_LIMIT">RATE_LIMIT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason / Policy Tag</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Enforce Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
