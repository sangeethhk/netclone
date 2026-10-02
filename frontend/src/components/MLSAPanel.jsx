import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  Database, 
  Layers, 
  Fingerprint, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  UserPlus,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { BRAND_CONFIG } from '../config/branding';

export default function MLSAPanel({ activeThreatLevel }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPassword#2026');
  const [deviceId, setDeviceId] = useState('dev_gateway_00');
  const [authResult, setAuthResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [negativeVectors, setNegativeVectors] = useState([]);

  // Registration modal state
  const [showRegister, setShowRegister] = useState(false);
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regDev, setRegDev] = useState('dev_cam_01');
  const [regRole, setRegRole] = useState('iot_operator');
  const [regMessage, setRegMessage] = useState('');

  // Load negative DB view for current user
  const loadNegativeDB = async (user) => {
    try {
      const data = await api.inspectNegativeDB(user);
      setNegativeVectors(data);
    } catch (e) {
      setNegativeVectors([]);
    }
  };

  useEffect(() => {
    loadNegativeDB(username);
  }, [username]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setAuthResult(null);
    try {
      const res = await api.mlsaLogin({
        username,
        password,
        device_id: deviceId
      });
      setAuthResult(res);
      if (res.negative_vectors_sampled?.length > 0) {
        setNegativeVectors(res.negative_vectors_sampled);
      }
    } catch (err) {
      setAuthResult({
        success: false,
        message: err.message,
        crypto_layers_passed: [],
        risk_level: 'REJECTED'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateWrongPassword = async () => {
    setLoading(true);
    try {
      const res = await api.mlsaLogin({
        username,
        password: 'IncorrectPassword!999',
        device_id: deviceId
      });
      setAuthResult(res);
    } catch (err) {
      setAuthResult({
        success: false,
        message: err.message,
        crypto_layers_passed: [],
        risk_level: 'CRITICAL_VIOLATION'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.mlsaRegister({
        username: regUser,
        password: regPass,
        device_id: regDev,
        role: regRole
      });
      setRegMessage(`Enrolled ${regUser} with ${res.data.negative_rules_count} negative constraints.`);
      setUsername(regUser);
      setPassword(regPass);
      setShowRegister(false);
      loadNegativeDB(regUser);
    } catch (err) {
      setRegMessage(`Registration failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="cyber-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Multi-Layer Security Algorithm (MLSA)
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Negative Database + Multi-Layer Crypto
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Eliminates credential exposure in database leaks by storing complement non-password representations and adaptive threat triggers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRegister(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" /> Enroll New Identity
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Authentication + Negative DB Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Authentication Interactive Tester */}
        <div className="cyber-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">MLSA Access Terminal</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Live Device Gate</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="Enter identity"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('admin');
                      setPassword('AdminPassword#2026');
                    }}
                    className="px-2.5 py-1 text-[11px] rounded bg-slate-800 text-slate-400 hover:text-white"
                    title="Load admin defaults"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('iot_engineer');
                      setPassword('SmartSensor$77');
                    }}
                    className="px-2.5 py-1 text-[11px] rounded bg-slate-800 text-slate-400 hover:text-white"
                    title="Load operator defaults"
                  >
                    Operator
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">
                  Authentication Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Origin Device Target</label>
                <select
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="dev_gateway_00">Central Edge Gateway (192.168.1.1)</option>
                  <option value="dev_cam_01">Smart IP Security Camera (192.168.1.101)</option>
                  <option value="dev_plc_03">Industrial SCADA PLC (192.168.1.103)</option>
                  <option value="dev_health_04">Patient Vital Monitor (192.168.1.104)</option>
                </select>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" /> {loading ? 'Verifying...' : 'Verify MLSA'}
                </button>

                <button
                  type="button"
                  onClick={handleSimulateWrongPassword}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-xs font-medium bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/80 transition-colors flex items-center justify-center gap-1.5"
                  title="Simulate invalid dictionary brute force against negative database"
                >
                  <XCircle className="w-4 h-4" /> Test Bad Pass
                </button>
              </div>
            </form>
          </div>

          {/* Real-Time Layer Result Card */}
          {authResult && (
            <div className={`mt-4 p-4 rounded-xl border text-xs space-y-2.5 ${
              authResult.success 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                : 'bg-red-950/40 border-red-500/50 text-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  {authResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span>{authResult.success ? 'AUTHENTICATION SUCCESSFUL' : 'ACCESS DENIED'}</span>
                </div>
                <span className="font-mono text-[11px] opacity-80">{authResult.execution_time_ms}ms</span>
              </div>

              <p className="text-[11px] leading-relaxed">{authResult.message}</p>

              {/* Passed Crypto Layers Checklist */}
              {authResult.crypto_layers_passed?.length > 0 && (
                <div className="pt-2 border-t border-emerald-800/50 space-y-1 font-mono text-[10px]">
                  {authResult.crypto_layers_passed.map((layer) => (
                    <div key={layer} className="flex items-center gap-1.5 text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{layer}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Negative Database Matrix Visualizer (2 cols) */}
        <div className="lg:col-span-2 cyber-card rounded-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Encrypted Negative Password Database (NDB)
                </h3>
                <span className="text-xs text-slate-400">
                  Complement space representation for user: <strong className="text-cyan-300 font-mono">{username}</strong>
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              {negativeVectors.length} Negative Rules Active
            </span>
          </div>

          <div className="space-y-4">
            {/* Theory Explanation Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-cyan-400 block flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> How Negative Password Storage Prevents Database Breach Leaks:
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                In conventional databases, leaking positive hashes like <code>MD5/SHA256(P)</code> allows attackers to crack credentials using GPU dictionary attacks.
                {BRAND_CONFIG.name}'s MLSA represents credentials in the <em>negative domain</em>, storing complement clauses <code>U \ &#123;P&#125;</code> and negative digest masks. Reconstructing positive passwords from this negative constraint space is computationally intractable (NP-hard).
              </p>
            </div>

            {/* Negative Vector Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Rule #</th>
                    <th className="py-2.5 px-3">Negative Complement Mask</th>
                    <th className="py-2.5 px-3">Negative Hash Digest Prefix</th>
                    <th className="py-2.5 px-3">Shannon Entropy</th>
                    <th className="py-2.5 px-3">Security Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {negativeVectors.map((r) => (
                    <tr key={r.index} className="hover:bg-slate-800/30 text-slate-300">
                      <td className="py-2 px-3 text-cyan-400 font-bold">V-{r.index}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-bold text-yellow-300">
                          {r.rule_mask}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        <code>{r.negative_hash_prefix}...</code>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-emerald-400 font-bold">{r.entropy_score} bits</span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">
                        Disallows matching subspace
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Multi-Layer Cryptographic Workflow Steps */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-500 block mb-2">
                4-Stage MLSA Cryptographic Pipeline
              </span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">Layer 1: NDB Check</span>
                  <span className="text-slate-400 text-[11px]">Evaluates against negative constraint space</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-blue-400 font-bold block mb-1">Layer 2: PBKDF2-100k</span>
                  <span className="text-slate-400 text-[11px]">Salted 100,000-round HMAC-SHA256 key stretch</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-purple-400 font-bold block mb-1">Layer 3: HMAC Token</span>
                  <span className="text-slate-400 text-[11px]">Time-bounded dynamic cryptographic session</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">Layer 4: Risk Trigger</span>
                  <span className="text-slate-400 text-[11px]">AI threat-score driven step-up verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enroll Identity Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-card rounded-2xl p-6 max-w-md w-full border border-cyan-500/50 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">Enroll New MLSA Identity</h3>
            <p className="text-xs text-slate-400 mb-4">
              Generates negative database vector masks and cryptographic verifier for the identity.
            </p>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Username</label>
                <input
                  type="text"
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Password (min 6 chars)</label>
                <input
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Associated Device</label>
                <select
                  value={regDev}
                  onChange={(e) => setRegDev(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="dev_cam_01">Smart IP Camera</option>
                  <option value="dev_therm_02">Smart Thermostat</option>
                  <option value="dev_plc_03">Industrial PLC</option>
                  <option value="dev_health_04">Patient Vital Monitor</option>
                </select>
              </div>

              {regMessage && (
                <div className="p-2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px]">
                  {regMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Generate Negative DB & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
