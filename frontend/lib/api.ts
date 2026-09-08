const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('ews-token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (res.status === 401 && !path.includes('/auth/login')) {
    // expired/invalid session — clear it and send the user back to log in
    localStorage.removeItem('ews-token');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: any) =>
    apiFetch('/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiFetch('/v1/auth/me'),
};

export const dashboardApi = {
  getKpis: () => apiFetch('/v1/dashboard/kpis'),
  getLatestPrices: () => apiFetch('/v1/dashboard/prices/latest'),
  getRecentAlerts: () => apiFetch('/v1/dashboard/alerts/recent'),
};

export const alertsApi = {
  list: (params?: string) => apiFetch(`/v1/alerts${params || ''}`),
  count: () => apiFetch('/v1/alerts/count'),
  acknowledge: (id: string, by: string) =>
    apiFetch(`/v1/alerts/${id}/acknowledge`, { method: 'POST', body: JSON.stringify({ acknowledgedBy: by }) }),
  markRead: (id: string) =>
    apiFetch(`/v1/alerts/${id}/read`, { method: 'POST' }),
};

export const commoditiesApi = {
  getPrices: (commodity?: string, source?: string) => {
    const q = new URLSearchParams();
    if (commodity) q.set('commodity', commodity);
    if (source) q.set('source', source);
    const qs = q.toString();
    return apiFetch(`/v1/commodities/prices${qs ? `?${qs}` : ''}`);
  },
  getAvailable: () => apiFetch('/v1/commodities/available'),
};

export const insightsApi = {
  get: (context: string, focus?: string) => {
    const q = new URLSearchParams({ context });
    if (focus) q.set('focus', focus);
    return apiFetch(`/v1/insights?${q.toString()}`);
  },
};

export const liveDataApi = {
  list: () => apiFetch('/v1/live-data'),
};

export const selfSufficiencyApi = {
  list: () => apiFetch('/v1/self-sufficiency'),
};

export const stockLevelsApi = {
  list: () => apiFetch('/v1/stock-levels'),
  getThresholds: () => apiFetch('/v1/stock-levels/thresholds'),
  setThresholds: (adequateDays: number, watchDays: number) =>
    apiFetch('/v1/stock-levels/thresholds', { method: 'PUT', body: JSON.stringify({ adequateDays, watchDays }) }),
};

export const suppliersApi = {
  list: () => apiFetch('/v1/suppliers'),
};

export const foodIndexApi = {
  get: () => apiFetch('/v1/food-index'),
  recompute: () => apiFetch('/v1/food-index/recompute', { method: 'POST' }),
};

export const newsApi = {
  get: () => apiFetch('/v1/news'),
};

export const demandApi = {
  get: () => apiFetch('/v1/demand'),
  getAssumptions: () => apiFetch('/v1/demand/assumptions'),
  setAssumptions: (a: { ramadanUpliftPct: number; hajjUpliftPct: number; populationGrowthPct: number }) =>
    apiFetch('/v1/demand/assumptions', { method: 'PUT', body: JSON.stringify(a) }),
};

export const procurementApi = {
  get: () => apiFetch('/v1/procurement'),
};

export const simulationApi = {
  templates: () => apiFetch('/v1/simulation/templates'),
  run: (key: string) => apiFetch('/v1/simulation/run', { method: 'POST', body: JSON.stringify({ key }) }),
};

export const catalogApi = {
  list: () => apiFetch('/v1/commodities/catalog'),
  refresh: () => apiFetch('/v1/commodities/catalog/refresh', { method: 'POST' }),
  setShow: (id: string, showOnDashboard: boolean) =>
    apiFetch(`/v1/commodities/catalog/${id}`, { method: 'PATCH', body: JSON.stringify({ showOnDashboard }) }),
};

// which commodities the user chose to show on the dashboard (localStorage-backed)
export const DASHBOARD_COMMODITIES_KEY = 'ews-dashboard-commodities';
export function getSelectedCommodities(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DASHBOARD_COMMODITIES_KEY);
    return raw ? JSON.parse(raw) : null; // null = not set yet → show all
  } catch {
    return null;
  }
}
export function setSelectedCommodities(list: string[]) {
  localStorage.setItem(DASHBOARD_COMMODITIES_KEY, JSON.stringify(list));
}

export const chatApi = {
  ask: (message: string) =>
    apiFetch('/v1/ai-chat/ask', { method: 'POST', body: JSON.stringify({ message }) }),
  suggestions: () => apiFetch('/v1/ai-chat/suggested-questions'),
};
