'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrainCircuit, Play, AlertTriangle, ShieldAlert, TrendingUp, Anchor } from 'lucide-react';
import { useState } from 'react';

const scenarios = [
  { id: 1, name: 'Trade Route Blockade', category: 'Strategic', severity: 'Critical', probability: 'Medium', impact: 'SAR 12.5B', description: 'Closure of Red Sea/Suez Canal route forcing circumnavigation via Cape of Good Hope.' },
  { id: 2, name: 'Export Ban Cascade', category: 'Strategic', severity: 'Critical', probability: 'High', impact: 'SAR 8.2B', description: 'Multiple major exporters simultaneously restrict grain/food exports.' },
  { id: 3, name: 'Currency Devaluation', category: 'Strategic', severity: 'High', probability: 'Medium', impact: 'SAR 6.8B', description: 'SAR significant devaluation increasing import costs by 20-35%.' },
  { id: 4, name: 'Climate Collapse', category: 'Strategic', severity: 'High', probability: 'Medium', impact: 'SAR 5.5B', description: 'Simultaneous drought in 3+ supplier regions reducing global output.' },
  { id: 5, name: 'Pandemic Disruption', category: 'Strategic', severity: 'High', probability: 'Low', impact: 'SAR 4.1B', description: 'Labor shortages at ports, processing plants, and transport networks.' },
  { id: 6, name: 'Cyber Attack', category: 'Strategic', severity: 'Medium', probability: 'Medium', impact: 'SAR 2.3B', description: 'Attack on port/logistics IT systems disrupting customs and tracking.' },
  { id: 7, name: 'Regional Conflict', category: 'Strategic', severity: 'Critical', probability: 'Medium', impact: 'SAR 9.7B', description: 'Conflict in supplier region disrupting production and shipping lanes.' },
  { id: 8, name: 'Port Congestion', category: 'Operational', severity: 'Medium', probability: 'High', impact: 'SAR 890M', description: 'Severe delays at Jeddah/ Dammam ports affecting clearance times.' },
  { id: 9, name: 'Supplier Default', category: 'Operational', severity: 'High', probability: 'Medium', impact: 'SAR 1.2B', description: 'Major supplier fails to deliver contracted volumes.' },
  { id: 10, name: 'Quality Contamination', category: 'Operational', severity: 'High', probability: 'Medium', impact: 'SAR 760M', description: 'SFDA detects contamination in large inbound shipment requiring destruction.' },
  { id: 11, name: 'Storage Failure', category: 'Operational', severity: 'Medium', probability: 'Low', impact: 'SAR 450M', description: 'Climate control failure at strategic reserve facility.' },
  { id: 12, name: 'Labor Strike', category: 'Operational', severity: 'Medium', probability: 'Medium', impact: 'SAR 320M', description: 'Strike at port or logistics provider halting operations.' },
  { id: 13, name: 'IT System Outage', category: 'Operational', severity: 'Low', probability: 'High', impact: 'SAR 180M', description: 'EWS or customs platform outage delaying data and clearance.' },
  { id: 14, name: 'Fuel Price Spike', category: 'Operational', severity: 'Medium', probability: 'High', impact: 'SAR 2.1B', description: 'Sudden increase in shipping fuel costs raising import prices.' },
];

const severityConfig: Record<string, { color: string; icon: any }> = {
  Critical: { color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: ShieldAlert },
  High: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', icon: AlertTriangle },
  Medium: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: TrendingUp },
  Low: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: Anchor },
};

export default function ScenariosPage() {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
          <BrainCircuit className="w-5 h-5 text-[#c8a45c] mb-2" />
          <p className="text-2xl font-bold text-white">15</p>
          <p className="text-xs text-[#94a3b8]">Active Scenarios</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <ShieldAlert className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-xs text-[#94a3b8]">Critical Severity</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-white">SAR 54.8B</p>
          <p className="text-xs text-[#94a3b8]">Total Potential Impact</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scenarios.map((s) => {
          const config = severityConfig[s.severity];
          const Icon = config.icon;
          const isActive = activeScenario === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setActiveScenario(isActive ? null : s.id)}
              className={`bg-[#0f1d2f] border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.01] ${
                isActive ? 'border-[#c8a45c] ring-1 ring-[#c8a45c]/20' : 'border-[#1a2d45]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-[#94a3b8]">{s.category} Scenario</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${config.color}`}>{s.severity}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#94a3b8] mb-3">
                <span>Probability: <span className="text-white font-medium">{s.probability}</span></span>
                <span>Impact: <span className="text-[#c8a45c] font-bold">{s.impact}</span></span>
              </div>

              {isActive && (
                <div className="mt-3 pt-3 border-t border-[#1a2d45]">
                  <p className="text-sm text-[#94a3b8] mb-3">{s.description}</p>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#c8a45c] text-[#0B1628] rounded-lg text-sm font-semibold hover:bg-[#d4b76a] transition-colors">
                    <Play className="w-4 h-4" /> Run Simulation
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
