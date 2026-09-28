import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Activity, Radio, ArrowUpRight, ShieldAlert, Cpu } from 'lucide-react';

const PROTO_COLORS = {
  TCP: '#06b6d4',
  UDP: '#3b82f6',
  MQTT: '#10b981',
  HTTP: '#8b5cf6',
  OTHER: '#64748b'
};

export default function TrafficMonitor({ telemetry, history = [] }) {
  const pieData = [
    { name: 'TCP', value: telemetry?.tcp_count || 10, color: PROTO_COLORS.TCP },
    { name: 'UDP', value: telemetry?.udp_count || 5, color: PROTO_COLORS.UDP },
    { name: 'MQTT', value: telemetry?.mqtt_count || 8, color: PROTO_COLORS.MQTT },
    { name: 'HTTP/RTSP', value: telemetry?.http_count || 12, color: PROTO_COLORS.HTTP },
    { name: 'OTHER', value: telemetry?.other_count || 2, color: PROTO_COLORS.OTHER },
  ].filter(d => d.value > 0);

  // Format chart time-series data
  const chartData = history.slice(-20).map((item, idx) => ({
    time: item.time || `${idx}s`,
    packetRate: item.packet_rate || 20,
    byteRateKB: Math.round((item.byte_rate || 15000) / 1024),
  }));

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Packet Throughput</span>
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {telemetry?.packet_rate?.toFixed(1) || '0.0'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">pkts/sec</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Bandwidth Usage</span>
            <span className="text-2xl font-bold font-mono text-blue-400">
              {((telemetry?.byte_rate || 0) / 1024).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">KB/s</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Active Protocol Flows</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {pieData.length}
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">distinct types</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Packets In Buffer</span>
            <span className="text-2xl font-bold font-mono text-purple-400">
              {telemetry?.total_packets || 100}
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">window size</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Charts: Real-Time Throughput + Protocol Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Throughput Area Chart */}
        <div className="lg:col-span-2 cyber-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Live Traffic Velocity & Bandwidth</h3>
              <p className="text-xs text-slate-400">Streaming 10-feature sliding window packet telemetry</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
              Live Buffer: 20s
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="byteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="packetRate" 
                  name="Packets/sec"
                  stroke="#06b6d4" 
                  fillOpacity={1} 
                  fill="url(#rateGradient)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="byteRateKB" 
                  name="Bandwidth (KB/s)"
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#byteGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocol Composition Donut */}
        <div className="cyber-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">IoT Protocol Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Traffic classification by network transport</p>
            
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-400 font-medium">{p.name}:</span>
                <span className="font-mono text-slate-200">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Packet Stream Table */}
      <div className="cyber-card rounded-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live Ingress Packet Telemetry</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Real-time deep packet inspector</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Packet ID</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Destination IP</th>
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">Flags</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3">Payload Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {telemetry?.recent_packets?.slice(-7).reverse().map((pkt) => (
                <tr 
                  key={pkt.id} 
                  className={`transition-colors ${
                    pkt.is_malicious 
                      ? 'bg-red-950/40 text-red-300 hover:bg-red-950/60' 
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <td className="py-2 px-3 font-semibold">{pkt.id}</td>
                  <td className="py-2 px-3">{pkt.src_ip}</td>
                  <td className="py-2 px-3">{pkt.dst_ip}</td>
                  <td className="py-2 px-3 text-cyan-400">{pkt.dst_port}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pkt.protocol === 'TCP' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                      pkt.protocol === 'MQTT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      pkt.protocol === 'UDP' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                      'bg-purple-950 text-purple-400 border border-purple-800'
                    }`}>
                      {pkt.protocol}
                    </span>
                  </td>
                  <td className="py-2 px-3">{pkt.flags}</td>
                  <td className="py-2 px-3">{pkt.length} B</td>
                  <td className="py-2 px-3 truncate max-w-xs text-slate-400" title={pkt.payload_preview}>
                    {pkt.is_malicious && (
                      <span className="mr-1.5 px-1.5 py-0.2 rounded bg-red-600 text-white font-sans text-[10px] font-bold">
                        MALICIOUS
                      </span>
                    )}
                    {pkt.payload_preview}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
