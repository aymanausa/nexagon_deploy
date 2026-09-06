import type { Metadata } from 'next';
import './globals.css';
import { InsightsFocusProvider } from '@/hooks/useInsightsFocus';

export const metadata: Metadata = {
  title: 'Nexagon — Food Security Intelligence',
  description: 'Nexagon: Saudi food security intelligence & early-warning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-rajdhani antialiased bg-[#080e1a] text-[#e2e8f0]">
        <InsightsFocusProvider>{children}</InsightsFocusProvider>
      </body>
    </html>
  );
}
