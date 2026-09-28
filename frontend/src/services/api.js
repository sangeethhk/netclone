/**
 * NetClone REST API Client Service
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || 'Network request failed');
  }
  return response.json();
}

export const api = {
  // Cyber Twin & Device Fleet
  getTopology: () => request('/api/twin/topology'),
  getAllDevices: () => request('/api/twin/devices'),
  getDeviceDetails: (id) => request(`/api/twin/device/${id}`),
  addDevice: (data) => request('/api/twin/devices', { method: 'POST', body: JSON.stringify(data) }),
  deleteDevice: (id) => request(`/api/twin/devices/${id}`, { method: 'DELETE' }),
  pingDevice: (id) => request(`/api/twin/devices/${id}/ping`, { method: 'POST' }),
  scanNetwork: (params = {}) => request('/api/twin/scan-network', { method: 'POST', body: JSON.stringify(params) }),
  ingestTelemetry: (payload) => request('/api/twin/ingest', { method: 'POST', body: JSON.stringify(payload) }),
  resetCyberTwin: () => request('/api/twin/reset', { method: 'POST' }),

  // Attack Simulation
  getAttackScenarios: () => request('/api/attack/scenarios'),
  getAttackStatus: () => request('/api/attack/status'),
  startAttack: (data) => request('/api/attack/start', { method: 'POST', body: JSON.stringify(data) }),
  stopAttack: () => request('/api/attack/stop', { method: 'POST' }),

  // AI Detection
  getAIMetrics: () => request('/api/detection/metrics'),
  evaluateVector: (vector) => request('/api/detection/evaluate', { method: 'POST', body: JSON.stringify(vector) }),

  // Advanced Intelligence (Attack Graph, XAI Attribution, Breach Simulator)
  getAttackGraph: () => request('/api/advanced/attack-graph'),
  getXAIAttribution: () => request('/api/advanced/xai-attribution'),
  simulateBreach: (username = 'admin') => request(`/api/advanced/simulate-breach?username=${encodeURIComponent(username)}`, { method: 'POST' }),

  // MLSA Authentication
  mlsaRegister: (data) => request('/api/mlsa/register', { method: 'POST', body: JSON.stringify(data) }),
  mlsaLogin: (data) => request('/api/mlsa/login', { method: 'POST', body: JSON.stringify(data) }),
  inspectNegativeDB: (username) => request(`/api/mlsa/negative-db/${username}`),

  // Automated Defense
  getDefenseStatus: () => request('/api/defense/status'),
  toggleAutoDefense: (enabled) => request(`/api/defense/toggle?enabled=${enabled}`, { method: 'POST' }),
  createFirewallRule: (rule) => request('/api/defense/rules', { method: 'POST', body: JSON.stringify(rule) }),
  deleteFirewallRule: (ruleId) => request(`/api/defense/rules/${ruleId}`, { method: 'DELETE' }),
  quarantineNode: (deviceId) => request(`/api/defense/quarantine/${deviceId}`, { method: 'POST' }),
  restoreNode: (deviceId) => request(`/api/defense/restore/${deviceId}`, { method: 'POST' }),
  getAlerts: () => request('/api/defense/alerts'),
  getIncidentReport: () => request('/api/defense/report'),
};
