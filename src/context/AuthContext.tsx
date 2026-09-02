// ============================================================
// MittiMitra AI — Auth Context
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Farmer } from '../types';
import { DEMO_FARMER } from '../data/farms';

interface AuthState {
  isAuthenticated: boolean;
  farmer: Farmer | null;
  isDemo: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  loginAsDemo: () => void;
  logout: () => void;
  register: (farmer: Partial<Farmer>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = sessionStorage.getItem('mm_auth');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* empty */ }
    }
    return { isAuthenticated: false, farmer: null, isDemo: false };
  });

  const persist = (s: AuthState) => {
    setState(s);
    sessionStorage.setItem('mm_auth', JSON.stringify(s));
  };

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // MVP: accept any non-empty credentials
    if (!email.trim()) return false;
    const farmer: Farmer = {
      id: 'user-1',
      name: email.split('@')[0] || 'Farmer',
      phone: '',
      preferredLanguage: 'en',
      state: 'Rajasthan',
      district: 'Jaipur',
      createdAt: new Date().toISOString(),
    };
    persist({ isAuthenticated: true, farmer, isDemo: false });
    return true;
  }, []);

  const loginAsDemo = useCallback(() => {
    persist({ isAuthenticated: true, farmer: DEMO_FARMER, isDemo: true });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('mm_auth');
    setState({ isAuthenticated: false, farmer: null, isDemo: false });
  }, []);

  const register = useCallback(async (data: Partial<Farmer>): Promise<boolean> => {
    const farmer: Farmer = {
      id: `farmer-${Date.now()}`,
      name: data.name ?? 'Farmer',
      phone: data.phone ?? '',
      preferredLanguage: data.preferredLanguage ?? 'en',
      state: data.state ?? '',
      district: data.district ?? '',
      createdAt: new Date().toISOString(),
    };
    persist({ isAuthenticated: true, farmer, isDemo: false });
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, loginAsDemo, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
