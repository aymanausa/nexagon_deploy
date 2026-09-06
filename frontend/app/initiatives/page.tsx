'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClipboardList, Target, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const initiatives = [
  { id: 1, name: 'Strategic Reserve Expansion', owner: 'SALIC', status: 'In Progress', progress: 68, category: 'Resilience', deadline: 'Q4 2026', impact: 'High' },
  { id: 2, name: 'Local Wheat Production Boost', owner: 'MEWA', status: 'In Progress', progress: 45, category: 'Local Production', deadline: 'Q2 2027', impact: 'High' },
  { id: 3, name: 'Supplier Diversification', owner: 'SALIC', status: 'In Progress', progress: 72, category: 'Trade', deadline: 'Q1 2027', impact: 'High' },
  { id: 4, name: 'Cold Chain Modernization', owner: 'SFDA', status: 'Planning', progress: 23, category: 'Infrastructure', deadline: 'Q4 2027', impact: 'Medium' },
  { id: 5, name: 'AI Prediction Enhancement', owner: 'SALIC', status: 'In Progress', progress: 55, category: 'Technology', deadline: 'Q3 2026', impact: 'High' },
  { id: 6, name: 'Youth Agriculture Training', owner: 'MEWA', status: 'Active', progress: 82, category: 'Human Capital', deadline: 'Q2 2026', impact: 'Medium' },
  { id: 7, name: 'Food Loss Reduction Program', owner: 'SFDA', status: 'In Progress', progress: 38, category: 'Efficiency', deadline: 'Q1 2027', impact: 'Medium' },
  { id: 8, name: 'Bilateral Trade Agreements', owner: 'MOFA', status: 'In Progress', progress: 60, category: 'Trade', deadline: 'Q4 2026', impact: 'High' },
  { id: 9, name: 'Water Efficiency in Agriculture', owner: 'MEWA', status: 'Planning', progress: 15, category: 'Sustainability', deadline: 'Q2 2028', impact: 'High' },
  { id: 10, name: 'Emergency Response Protocol', owner: 'NESA', status: 'In Progress', progress: 90, category: 'Resilience', deadline: 'Q3 2026', impact: 'High' },
];

const statusConfig: Record<string, { color: string; icon: any }> = {
  'Active': { color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  'In Progress': { color: 'text-blue-400 bg-blue-500/10', icon: TrendingUp },
  'Planning': { color: 'text-amber-400 bg-amber-500/10', icon: Clock },
  'Delayed': { color: 'text-red-400 bg-red-500/10', icon: AlertCircle },
};

export default function InitiativesPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
          <ClipboardList className="w-5 h-5 text-[#c8a45c] mb-2" />
          <p className="text-2xl font-bold text-white">{initiatives.length}</p>
          <p className="text-xs text-[#94a3b8]">Total Initiatives</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <TrendingUp className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">6</p>
          <p className="text-xs text-[#94a3b8]">In Progress</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">1</p>
          <p className="text-xs text-[#94a3b8]">Active/Complete</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <Target className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-xs text-[#94a3b8]">In Planning</p>
        </div>
      </div>

      <div className="space-y-4">
        {initiatives.map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          return (
            <div key={item.id} className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-[#94a3b8]">Owner: {item.owner} • Category: {item.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>{item.status}</span>
                  <span className="text-xs text-[#94a3b8]">Due: {item.deadline}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.progress >= 80 ? 'bg-emerald-500' : item.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-white w-12 text-right">{item.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
