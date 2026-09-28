import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Plus, 
  Search, 
  Radio, 
  Wifi, 
  Activity, 
  Trash2, 
  Terminal, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { api } from '../services/api';

export default function DeviceFleetManager({ onRefreshTopology }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedDeviceForCode, setSelectedDeviceForCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Add Device Form State
  const [name, setName] = useState('');
  const [ip, setIp] = useState('192.168.1.');
  const [mac, setMac] = useState('B8:27:EB:');
  const [category, setCategory] = useState('Smart Home / Surveillance (IP Camera)');
  const [portsStr, setPortsStr] = useState('80, 554');
  const [protocolsStr, setProtocolsStr] = useState('HTTP, RTSP');
  const [mode, setMode] = useState('PHYSICAL');
  const [telemetryType, setTelemetryType] = useState('Live Hardware Video & Motion Stream');

  // Network Scan State
  const [scanning, setScanning] = useState(false);
  const [scanSubnet, setScanSubnet] = useState('');
  const [scanResults, setScanResults] = useState(null);

  // Ping tracking
  const [pingingId, setPingingId] = useState(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await api.getAllDevices();
      setDevices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const ports = portsStr.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
      const protocols = protocolsStr.split(',').map(p => p.trim()).filter(Boolean);
      
      await api.addDevice({
        name,
        ip,
        mac,
        category,
        open_ports: ports.length > 0 ? ports : [80],
        protocols: protocols.length > 0 ? protocols : ['TCP'],
        mode,
        telemetry_type: telemetryType
      });

      setShowAddModal(false);
      setName('');
      fetchDevices();
      if (onRefreshTopology) onRefreshTopology();
    } catch (err) {
      alert(`Failed to add device: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete device ${id} from NetClone Cyber Twin?`)) return;
    try {
      await api.deleteDevice(id);
      fetchDevices();
      if (onRefreshTopology) onRefreshTopology();
    } catch (err) {
      alert(`Error deleting device: ${err.message}`);
    }
  };

  const handlePing = async (id) => {
    setPingingId(id);
    try {
      const res = await api.pingDevice(id);
      setDevices(prev => prev.map(d => d.id === id ? {
        ...d,
        is_live_reachable: res.is_reachable,
        ping_latency_ms: res.latency_ms
      } : d));
    } catch (err) {
      console.error(err);
    } finally {
      setPingingId(null);
    }
  };

  const handleScanSubnet = async () => {
    setScanning(true);
    try {
      const res = await api.scanNetwork({ subnet: scanSubnet || null, timeout_sec: 0.35 });
      setScanResults(res);
    } catch (err) {
      alert(`Network scan failed: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  const handleImportDiscovered = async (disc) => {
    try {
      await api.addDevice({
        name: disc.hostname || `LAN IoT Node (${disc.ip})`,
        ip: disc.ip,
        category: disc.suggested_category,
        open_ports: disc.open_ports.length > 0 ? disc.open_ports : [80],
        protocols: disc.open_ports.includes(554) ? ['RTSP', 'TCP'] : ['HTTP', 'TCP'],
        mode: 'PHYSICAL',
        telemetry_type: `Discovered via Subnet Probe (${disc.vendor})`
      });
      alert(`Imported ${disc.ip} into NetClone as a Physical Device!`);
      fetchDevices();
      if (onRefreshTopology) onRefreshTopology();
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  };

  const physicalCount = devices.filter(d => d.mode === 'PHYSICAL').length;
  const virtualCount = devices.filter(d => d.mode !== 'PHYSICAL').length;
  const reachableCount = devices.filter(d => d.is_live_reachable).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="cyber-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Physical IoT Fleet & Device Manager
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                Cyber-Physical Synchronization
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Add real physical hardware (Raspberry Pi, ESP32, IP cameras), auto-discover local WiFi/LAN devices, and stream live sensor telemetry.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScanModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors shadow-sm"
          >
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> Scan Local Network
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Add Real IoT Device
          </button>

          <button
            onClick={() => {
              setSelectedDeviceForCode(devices[0]);
              setShowCodeModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/80 transition-colors"
          >
            <Terminal className="w-4 h-4 text-purple-400" /> IoT Agent Scripts
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total IoT Fleet</span>
            <span className="text-2xl font-bold font-mono text-white">{devices.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <Layers className="w-5 h-5 text-slate-300" />
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Real Physical Hardware</span>
            <span className="text-2xl font-bold font-mono text-cyan-400">{physicalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center">
            <Laptop className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Virtual Digital Twins</span>
            <span className="text-2xl font-bold font-mono text-purple-400">{virtualCount}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Online & Reachable</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{reachableCount}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Fleet Inventory Table */}
      <div className="cyber-card rounded-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Registered IoT Hardware & Digital Twins</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">Persistent SQLite Device Registry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Device ID & Name</th>
                <th className="py-2.5 px-3">IP & MAC Address</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Live Reachability</th>
                <th className="py-2.5 px-3">Open Sockets</th>
                <th className="py-2.5 px-3">Ingested Packets</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {devices.map((dev) => {
                const isPhysical = dev.mode === 'PHYSICAL';
                const isGateway = dev.id === 'dev_gateway_00';

                return (
                  <tr key={dev.id} className="hover:bg-slate-800/30 text-slate-300">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 font-sans font-semibold text-white">
                        <span>{dev.name}</span>
                        {isGateway && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 font-mono">
                            GATEWAY
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block">{dev.id} • {dev.category}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-200 font-bold block">{dev.ip}</span>
                      <span className="text-slate-500 text-[10px]">{dev.mac}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPhysical 
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' 
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}>
                        {isPhysical ? 'PHYSICAL HARDWARE' : 'VIRTUAL TWIN'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {dev.is_live_reachable ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ONLINE ({dev.ping_latency_ms?.toFixed(1) || '1.0'}ms)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          <span>UNREACHABLE</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-cyan-400">
                      {dev.open_ports.join(', ')} ({dev.protocols.join('/')})
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {dev.packet_count} pkts
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePing(dev.id)}
                          disabled={pingingId === dev.id}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-sans transition-colors"
                          title="Ping hardware socket"
                        >
                          {pingingId === dev.id ? 'Pinging...' : 'Ping'}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDeviceForCode(dev);
                            setShowCodeModal(true);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-400 text-[11px] font-sans transition-colors"
                          title="View code snippets for this device"
                        >
                          Code
                        </button>

                        {!isGateway && (
                          <button
                            onClick={() => handleDelete(dev.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Delete device"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Real Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-card rounded-2xl p-6 max-w-md w-full border border-cyan-500/50 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">Add Real Physical IoT Device</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter connection specifications for physical hardware on your local network.
            </p>

            <form onSubmit={handleAddDevice} className="space-y-3 text-xs font-sans">
              <div>
                <label className="text-slate-400 block mb-1">Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Living Room Raspberry Pi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">IP Address</label>
                  <input
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">MAC Address</label>
                  <input
                    type="text"
                    value={mac}
                    onChange={(e) => setMac(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Smart Home / Surveillance (IP Camera)">Smart IP Camera</option>
                  <option value="Edge Compute / SBC (Raspberry Pi)">Raspberry Pi / Linux SBC</option>
                  <option value="Microcontroller (ESP32 / ESP8266)">ESP32 / Arduino Microcontroller</option>
                  <option value="Smart Home / HVAC & Climate">Smart Thermostat / Climate</option>
                  <option value="Healthcare IoT (IoMT)">Patient Vital Monitor</option>
                  <option value="Industrial IoT (SCADA / PLC)">Industrial PLC Controller</option>
                  <option value="Smart City / Custom Sensor">Smart City / Energy Meter</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Open Ports (comma-separated)</label>
                  <input
                    type="text"
                    value={portsStr}
                    onChange={(e) => setPortsStr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-cyan-400"
                  >
                    <option value="PHYSICAL">PHYSICAL HARDWARE</option>
                    <option value="VIRTUAL">VIRTUAL DIGITAL TWIN</option>
                  </select>
                </div>
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
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Register in Cyber Twin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Network Subnet Scanner Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-card rounded-2xl p-6 max-w-xl w-full border border-cyan-500/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Local Network Subnet Discovery</h3>
              </div>
              <button onClick={() => setShowScanModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Scans your local WiFi or Ethernet network to find active physical IoT devices and fingerprint open ports (HTTP, RTSP, MQTT, Modbus, SSH).
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Subnet CIDR (Leave blank for auto-detection)"
                value={scanSubnet}
                onChange={(e) => setScanSubnet(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleScanSubnet}
                disabled={scanning}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Scanning...' : 'Scan Subnet'}
              </button>
            </div>

            {/* Results */}
            {scanResults && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                <div className="text-[11px] font-mono text-cyan-400">
                  Scanned {scanResults.subnet_scanned} in {scanResults.duration_sec}s — Found {scanResults.devices_found.length} active endpoints
                </div>

                {scanResults.devices_found.map((disc) => (
                  <div key={disc.ip} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-white block">{disc.ip}</span>
                      <span className="text-slate-400 text-[11px] block">{disc.suggested_category} • {disc.vendor}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Ports: {disc.open_ports.join(', ')} | Latency: {disc.latency_ms}ms</span>
                    </div>
                    <button
                      onClick={() => handleImportDiscovered(disc)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-colors"
                    >
                      + Import Twin
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code Snippets & IoT Agent Drawer Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-card rounded-2xl p-6 max-w-2xl w-full border border-purple-500/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Physical Hardware Integration Agent</h3>
              </div>
              <button onClick={() => setShowCodeModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Run this ready-to-use Python client agent on your <strong>Raspberry Pi</strong>, laptop, or physical device to stream real live telemetry into NetClone:
            </p>

            {/* Python Agent Command */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 relative mb-4">
              <pre className="overflow-x-auto">
{`# 1. Run the standalone agent on your real hardware:
python agent/netclone_iot_agent.py --server http://${window.location.hostname}:8000 --device-id ${selectedDeviceForCode?.id || 'dev_real_01'}`}
              </pre>
            </div>

            {/* cURL Webhook Tester */}
            <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Direct cURL Telemetry Webhook (One-liner):
            </span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto mb-4">
              <code>
{`curl -X POST http://${window.location.hostname}:8000/api/twin/ingest \\
  -H "Content-Type: application/json" \\
  -d '{"device_id":"${selectedDeviceForCode?.id || 'dev_cam_01'}","telemetry":{"temp":24.5,"motion":true},"cpu_usage":18.2,"protocol":"HTTP"}'`}
              </code>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
