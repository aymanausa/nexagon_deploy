'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { Filter, CheckCircle, Eye, Bell, AlertTriangle, ShieldAlert } from 'lucide-react';

const mockAlerts = [
  { id: 'ALT-001', level: 'CRITICAL', category: 'Price Spike', title: 'Wheat futures surged 8.3% in 48 hours', source: 'CBOT', time: '2026-07-01T08:30:00Z', read: false, acknowledged: false },
  { id: 'ALT-002', level: 'HIGH', category: 'Supply Chain', title: 'Brazil soybean shipment delayed 14 days', source: 'SANTOS_PORT', time: '2026-07-01T07:15:00Z', read: false, acknowledged: false },
  { id: 'ALT-003', level: 'HIGH', category: 'Geopolitical', title: 'Red Sea trade route disruption continues', source: 'REUTERS', time: '2026-07-01T06:00:00Z', read: true, acknowledged: false },
  { id: 'ALT-004', level: 'MEDIUM', category: 'Weather', title: 'Drought warning: Australian wheat belt', source: 'NOAA', time: '2026-07-01T04:30:00Z', read: true, acknowledged: true },
  { id: 'ALT-005', level: 'MEDIUM', category: 'Policy', title: 'India extends rice export restrictions', source: 'GOI', time: '2026-07-01T03:00:00Z', read: true, acknowledged: true },
  { id: 'ALT-006', level: 'CRITICAL', category: 'Disease', title: 'Avian influenza outbreak in Eastern Europe', source: 'OIE', time: '2026-07-01T02:00:00Z', read: false, acknowledged: false },
  { id: 'ALT-007', level: 'LOW', category: 'Market', title: 'EU dairy quota increase announced', source: 'EU_COMMISSION', time: '2026-07-01T01:00:00Z', read: true, acknowledged: true },
  { id: 'ALT-008', level: 'HIGH', category: 'Climate', title: 'El Nino conditions strengthening', source: 'NASA', time: '2026-06-30T22:00:00Z', read: false, acknowledged: false },
];

const levelConfig: Record<string, { color: string; bg: string; icon: any }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: ShieldAlert },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: Bell },
  LOW: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: Bell },
};

export default function AlertsPage() {
  const [filter, setFilter] = useState('ALL');
  const [alerts, setAlerts] = useState(mockAlerts);

  const filtered = filter === 'ALL' ? alerts : alerts.filter((a) => a.level === filter);

  const acknowledge = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  return (
    <DashboardLayout>
      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-[#c8a45c]" />
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-[#c8a45c] text-[#0B1628]'
                : 'bg-[#0f1d2f] text-[#94a3b8] border border-[#1a2d45] hover:text-white'
            }`}
          >
            {f === 'ALL' ? 'All Alerts' : f}
          </button>
        ))}
        <span className="ml-auto text-sm text-[#94a3b8]">{filtered.length} alerts</span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const config = levelConfig[alert.level];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={`bg-[#0f1d2f] border rounded-xl p-5 ${config.bg} ${!alert.read ? 'ring-1 ring-[#c8a45c]/20' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-[#080e1a] ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#94a3b8]">{alert.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${config.color} bg-[#080e1a]`}>
                      {alert.level}
                    </span>
                    <span className="text-xs text-[#94a3b8]">{alert.category}</span>
                  </div>
                  <p className={`text-base ${!alert.read ? 'text-white font-semibold' : 'text-[#94a3b8]'}`}>
                    {alert.title}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[#94a3b8]">
                    <span>Source: {alert.source}</span>
                    <span>{new Date(alert.time).toLocaleString('en-SA')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!alert.read && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="p-2 rounded-lg bg-[#080e1a] text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors"
                      title="Mark as read"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className="p-2 rounded-lg bg-[#080e1a] text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Acknowledge"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {alert.acknowledged && (
                    <span className="px-2 py-1 rounded text-xs text-emerald-400 bg-emerald-500/10">Acknowledged</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
