'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Database, Wifi, WifiOff, Clock, Globe } from 'lucide-react';

const categories = ['Government', 'Financial', 'Weather', 'Logistics', 'Health', 'Research', 'News', 'Satellite'];

const dataSources = [
  { name: 'SFDA Food Import', category: 'Government', status: 'online', lastUpdate: '2 min ago', frequency: 'Real-time', records: '2.4M' },
  { name: 'GASTAT Trade', category: 'Government', status: 'online', lastUpdate: '5 min ago', frequency: 'Daily', records: '890K' },
  { name: 'MOF Trade Data', category: 'Government', status: 'online', lastUpdate: '15 min ago', frequency: 'Daily', records: '1.2M' },
  { name: 'SAGIA Investment', category: 'Government', status: 'online', lastUpdate: '1 hour ago', frequency: 'Weekly', records: '45K' },
  { name: 'CBOT Futures', category: 'Financial', status: 'online', lastUpdate: '1 min ago', frequency: 'Real-time', records: '12M' },
  { name: 'ICE Europe', category: 'Financial', status: 'online', lastUpdate: '1 min ago', frequency: 'Real-time', records: '8.5M' },
  { name: 'Bursa Malaysia', category: 'Financial', status: 'online', lastUpdate: '3 min ago', frequency: 'Real-time', records: '6.2M' },
  { name: 'TFEX Thailand', category: 'Financial', status: 'online', lastUpdate: '2 min ago', frequency: 'Real-time', records: '4.1M' },
  { name: 'Frankfurter API', category: 'Financial', status: 'online', lastUpdate: '10 min ago', frequency: 'Hourly', records: '2.8M' },
  { name: 'NOAA Weather', category: 'Weather', status: 'online', lastUpdate: '30 min ago', frequency: 'Hourly', records: '5.6M' },
  { name: 'Open-Meteo', category: 'Weather', status: 'online', lastUpdate: '1 hour ago', frequency: 'Hourly', records: '3.2M' },
  { name: 'NASA POWER', category: 'Weather', status: 'offline', lastUpdate: '2 days ago', frequency: 'Daily', records: '1.8M' },
  { name: 'MarineTraffic', category: 'Logistics', status: 'online', lastUpdate: '5 min ago', frequency: 'Real-time', records: '9.1M' },
  { name: ' vesselfinder', category: 'Logistics', status: 'online', lastUpdate: '8 min ago', frequency: 'Real-time', records: '7.4M' },
  { name: 'OIE/WOAH', category: 'Health', status: 'online', lastUpdate: '4 hours ago', frequency: 'Daily', records: '320K' },
  { name: 'FAO GIEWS', category: 'Research', status: 'online', lastUpdate: '6 hours ago', frequency: 'Daily', records: '780K' },
  { name: 'Reuters News', category: 'News', status: 'online', lastUpdate: '2 min ago', frequency: 'Real-time', records: '45M' },
  { name: 'Bloomberg API', category: 'News', status: 'online', lastUpdate: '3 min ago', frequency: 'Real-time', records: '38M' },
];

export default function DataSourcesPage() {
  const onlineCount = dataSources.filter((s) => s.status === 'online').length;
  const offlineCount = dataSources.filter((s) => s.status === 'offline').length;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
          <Database className="w-5 h-5 text-[#c8a45c] mb-2" />
          <p className="text-2xl font-bold text-white">{dataSources.length}</p>
          <p className="text-xs text-[#94a3b8]">Total Data Sources</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <Wifi className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{onlineCount}</p>
          <p className="text-xs text-[#94a3b8]">Online</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <WifiOff className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-2xl font-bold text-white">{offlineCount}</p>
          <p className="text-xs text-[#94a3b8]">Offline</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <Globe className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">8</p>
          <p className="text-xs text-[#94a3b8]">Categories</p>
        </div>
      </div>

      <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[#94a3b8] border-b border-[#1a2d45]">
                <th className="pb-3 font-medium">Source Name</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Frequency</th>
                <th className="pb-3 font-medium">Last Update</th>
                <th className="pb-3 font-medium">Records</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {dataSources.map((s) => (
                <tr key={s.name} className="border-b border-[#1a2d45]/50 hover:bg-white/5 transition-colors">
                  <td className="py-3 text-white font-medium">{s.name}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded text-xs bg-[#080e1a] text-[#94a3b8]">{s.category}</span>
                  </td>
                  <td className="py-3">
                    <span className={`flex items-center gap-1 text-xs font-medium ${
                      s.status === 'online' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {s.status === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      {s.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-3 text-[#94a3b8]">{s.frequency}</td>
                  <td className="py-3 text-[#94a3b8] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.lastUpdate}
                  </td>
                  <td className="py-3 text-white font-mono">{s.records}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
