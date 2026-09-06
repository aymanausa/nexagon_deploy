"use client";
import { create } from 'zustand';

interface AuthState {
  user: any | null;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: { fullName: 'Dr. Ayman Al-Ali', role: 'INSTITUTION_ADMIN', institution: 'SALIC' },
  token: 'mock-token',
  login: (user, token) => { localStorage.setItem('ews-token', token); set({ user, token }); },
  logout: () => { localStorage.removeItem('ews-token'); set({ user: null, token: null }); },
}));
