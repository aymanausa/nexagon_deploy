'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { InsightsPanel } from './InsightsPanel';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/risk-heatmap': 'Risk Heatmap',
  '/alerts': 'Alert Center',
  '/commodities': 'Commodity Prices',
  '/suppliers': 'Supplier Map',
  '/stock-levels': 'Stock Levels',
  '/demand': 'Demand Forecast',
  '/procurement': 'Procurement Optimizer',
  '/scenarios': 'Scenario Simulator',
  '/ai-assistant': 'AI Assistant',
  '/reports': 'Reports',
  '/data-sources': 'Data Sources',
  '/live-data': 'Live Data',
  '/news': 'Live News Feed',
  '/monitoring': 'System Monitoring',
  '/initiatives': 'Strategic Initiatives',
  '/users': 'User Management',
  '/settings': 'Settings',
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Nexagon';
  const context = pathname.replace(/^\//, '') || 'dashboard'; // e.g. "/commodities" -> "commodities"

  return (
    <div className="flex min-h-screen bg-[#080e1a]">
      <Sidebar />
      <div className="flex-1 ml-64 flex">
        <div className="flex-1 min-w-0">
          <Header />
          <main className="p-6">
            <div className="mb-6">
              <h1 className="font-orbitron text-2xl font-bold text-white tracking-wide">{title}</h1>
              <div className="h-0.5 w-24 bg-[#c8a45c] mt-2 rounded-full" />
            </div>
            {children}
          </main>
        </div>
        <InsightsPanel context={context} />
      </div>
    </div>
  );
}
