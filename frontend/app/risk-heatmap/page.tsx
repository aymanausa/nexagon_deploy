'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertTriangle, Shield, Info } from 'lucide-react';

const riskDomains = [
  { id: 1, domain: 'Import Dependency', score: 82, level: 'CRITICAL', owner: 'SALIC', trend: 'up' },
  { id: 2, domain: 'Climate & Water', score: 76, level: 'HIGH', owner: 'MEWA', trend: 'up' },
  { id: 3, domain: 'Geopolitical', score: 71, level: 'HIGH', owner: 'MOFA', trend: 'stable' },
  { id: 4, domain: 'Supply Chain', score: 68, level: 'HIGH', owner: 'SALIC', trend: 'up' },
  { id: 5, domain: 'Price Volatility', score: 65, level: 'MEDIUM', owner: 'SAGIA', trend: 'down' },
  { id: 6, domain: 'Food Safety', score: 58, level: 'MEDIUM', owner: 'SFDA', trend: 'stable' },
  { id: 7, domain: 'Infrastructure', score: 52, level: 'MEDIUM', owner: 'MOT', trend: 'down' },
  { id: 8, domain: 'Strategic Reserves', score: 48, level: 'LOW', owner: 'SALIC', trend: 'stable' },
  { id: 9, domain: 'Local Production', score: 45, level: 'LOW', owner: 'MEWA', trend: 'down' },
  { id: 10, domain: 'Maritime Security', score: 73, level: 'HIGH', owner: 'MOD', trend: 'up' },
  { id: 11, domain: 'Cybersecurity', score: 62, level: 'MEDIUM', owner: 'NCSA', trend: 'up' },
  { id: 12, domain: 'Livestock Disease', score: 55, level: 'MEDIUM', owner: 'MEWA', trend: 'stable' },
];

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-red-500';
  if (score >= 60) return 'bg-orange-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-red-500/10 border-red-500/30';
  if (score >= 60) return 'bg-orange-500/10 border-orange-500/30';
  if (score >= 40) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-emerald-500/10 border-emerald-500/30';
}

export default function RiskHeatmapPage() {
  return (
    <DashboardLayout>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400 font-semibold">Critical</span>
          </div>
          <p className="text-3xl font-bold text-white">1</p>
          <p className="text-xs text-[#94a3b8]">Domain requires immediate action</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-orange-400 font-semibold">High</span>
          </div>
          <p className="text-3xl font-bold text-white">4</p>
          <p className="text-xs text-[#94a3b8]">Domains need attention</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-amber-400 font-semibold">Medium</span>
          </div>
          <p className="text-3xl font-bold text-white">4</p>
          <p className="text-xs text-[#94a3b8]">Domains being monitored</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-semibold">Low</span>
          </div>
          <p className="text-3xl font-bold text-white">3</p>
          <p className="text-xs text-[#94a3b8]">Domains stable</p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">12-Domain Risk Assessment Matrix</h3>
        <div className="space-y-3">
          {riskDomains.sort((a, b) => b.score - a.score).map((domain) => (
            <div
              key={domain.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${getScoreBg(domain.score)} transition-all hover:scale-[1.01]`}
            >
              <div className="w-12 h-12 rounded-lg bg-[#080e1a] flex items-center justify-center">
                <span className="text-lg font-bold text-white">{domain.score}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{domain.domain}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    domain.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    domain.level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                    domain.level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {domain.level}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-[#94a3b8]">
                  <span>Owner: {domain.owner}</span>
                  <span>Trend: {domain.trend === 'up' ? 'Rising' : domain.trend === 'down' ? 'Improving' : 'Stable'}</span>
                </div>
              </div>
              <div className="w-32">
                <div className="h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                  <div className={`h-full ${getScoreColor(domain.score)} rounded-full`} style={{ width: `${domain.score}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
