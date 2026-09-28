import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Printer
} from 'lucide-react';
import { api } from '../services/api';

export default function SecurityLogs() {
  const [alerts, setAlerts] = useState([]);
  const [report, setReport] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const alertData = await api.getAlerts();
      const reportData = await api.getIncidentReport();
      setAlerts(alertData);
      setReport(reportData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExportJSON = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NetClone_Security_Report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSev = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesSearch = searchTerm === '' || 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.source_device.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="cyber-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Security Audit Logs & Executive Incident Reports
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              Audit Trail
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable forensic audit records of simulated IoT attacks, AI anomaly scoring, MLSA authentication checks, and automated mitigations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" /> Export Report (JSON)
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      {report && (
        <div className="cyber-card rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-900/60">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Executive Incident & Defense Briefing
            </span>
            <span className="text-xs font-mono text-slate-500">
              Generated: {new Date(report.generated_at * 1000).toLocaleTimeString()}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
            {report.executive_summary}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[11px]">Threats Detected</span>
              <span className="text-lg font-bold text-red-400">{report.total_threats_detected}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[11px]">Attack Packets Injected</span>
              <span className="text-lg font-bold text-amber-400">{report.attacks_simulated}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[11px]">Enacted Firewall Rules</span>
              <span className="text-lg font-bold text-cyan-400">{report.firewall_rules_enacted}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block text-[11px]">Enrolled MLSA Identities</span>
              <span className="text-lg font-bold text-emerald-400">{report.mlsa_negative_db_inspections}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event, device, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                filterSeverity === sev
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Security Alerts Stream */}
      <div className="cyber-card rounded-2xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Incident Title</th>
                <th className="py-2.5 px-3">Source & Target</th>
                <th className="py-2.5 px-3">AI Score</th>
                <th className="py-2.5 px-3">Automated Defense Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No matching alerts found in current filter.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/30 text-slate-300">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400 font-bold">{alert.id}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        alert.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                        alert.severity === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white max-w-xs truncate" title={alert.description}>
                      {alert.title}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs">
                      <span className="text-slate-400">{alert.source_device}</span>
                      <span className="text-slate-600 mx-1">→</span>
                      <span className="text-cyan-300">{alert.target_device || 'Broadcast'}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-red-400">
                      {alert.threat_score?.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-400 max-w-sm truncate" title={alert.remediation_action}>
                      {alert.defense_applied ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" /> {alert.remediation_action}
                        </span>
                      ) : (
                        <span className="text-slate-500">{alert.remediation_action || 'Monitoring'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
