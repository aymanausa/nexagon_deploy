'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Cross-component selection for the AI Insights panel: pages set a focus (a clicked
// card / chart), the panel reads it and drills into that specific thing.
export interface InsightsFocus {
  context: string; // insights context, e.g. 'commodities' or 'self-sufficiency'
  key: string; // entity id passed to the API, e.g. a commodity name
  label: string; // human label for the panel header
}

interface Ctx {
  focus: InsightsFocus | null;
  setFocus: (f: InsightsFocus | null) => void;
}

const InsightsFocusContext = createContext<Ctx>({ focus: null, setFocus: () => {} });

export function InsightsFocusProvider({ children }: { children: ReactNode }) {
  const [focus, setFocus] = useState<InsightsFocus | null>(null);
  const pathname = usePathname();
  // clear the drill-in when navigating to another page
  useEffect(() => { setFocus(null); }, [pathname]);
  return <InsightsFocusContext.Provider value={{ focus, setFocus }}>{children}</InsightsFocusContext.Provider>;
}

export const useInsightsFocus = () => useContext(InsightsFocusContext);
