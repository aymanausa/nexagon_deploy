'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Activity, CheckCircle, AlertTriangle, Cpu, HardDrive, Wifi } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const systemMetrics = [
  { label: 'API Uptime', value: '99.97%', status: 'good', icon: Wifi },
  { label: 'Avg Response', value: '142ms', status: 'good', icon: Activity },
  { label: 'CPU Usage', value: '34%', status: 'good', icon: Cpu },
  { label: 'Memory', value: '62%', status: 'warning', icon: HardDrive },
  { label: 'Disk', value: '68%', status: 'warning', icon: HardDrive },
  { label: 'Active Connections', value: '1,247', status: 'good', icon: Wifi },
];

const responseTimeData = [
  { time: '00:00', ms: 120 }, { time: '04:00', ms: 98 }, { time: '08:00', ms: 210 },
  { time: '12:00', ms: 185 }, { time: '16:00', ms: 156 }, { time: '20:00', ms: 134 },
];

const services = [
  { name: 'NestJS API', status: 'running', uptime: '45d 12h' },
  { name: 'PostgreSQL', status: 'running', uptime: '45d 12h' },
  { name: 'Redis Cache', status: 'running', uptime: '45d 12h' },
  { name: 'WebSocket', status: 'running', uptime: '30d 8h' },
  { name: 'Bull Queue', status: 'running', uptime: '45d 12h' },
  { name: 'Prisma ORM', status: 'running', uptime: '45d 12h' },
];

export default function MonitoringPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {systemMetrics.map((m) => (
          <div key={m.label} className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
            <m.icon className={`w-5 h-5 mb-2 ${m.status === 'good' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <p className="text-xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-[#94a3b8]">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">API Response Time (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d45" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0f1d2f', border: '1px solid #1a2d45', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="ms" stroke="#c8a45c" strokeWidth={2} dot={{ r: 4, fill: '#c8a45c' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Service Status</h3>
          <div className="space-y-3">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-[#080e1a] border border-[#1a2d45]">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-white font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400">{s.status}</span>
                  <span className="text-xs text-[#94a3b8]">Uptime: {s.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Recent System Events</h3>
        <div className="space-y-2">
          {[
            { time: '08:30:15', event: 'Wheat price spike alert generated', level: 'warning' },
            { time: '08:15:00', event: 'Daily data sync completed', level: 'info' },
            { time: '07:45:22', event: 'Redis cache refreshed', level: 'info' },
            { time: '06:00:00', event: 'Scheduled report generation started', level: 'info' },
            { time: '05:32:10', event: 'WebSocket connection pool expanded', level: 'info' },
            { time: '03:15:00', event: 'Backup completed successfully', level: 'success' },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-4 p-2 rounded hover:bg-white/5">
              <span className="text-xs text-[#94a3b8] font-mono w-20">{e.time}</span>
              <span className={`w-2 h-2 rounded-full ${
                e.level === 'warning' ? 'bg-amber-400' : e.level === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
              }`} />
              <span className="text-sm text-[#e2e8f0]">{e.event}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
