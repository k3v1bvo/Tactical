'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppRole } from '@/lib/types';

interface AuthContextType {
  role: AppRole;
  currentRole: AppRole;
  setRole: (role: AppRole) => void;
  userId: string;
  userName: string;
  userEmail: string;
  user: { id: string; name: string; email: string };
  isAdmin: boolean;
  isVendor: boolean;
  isClient: boolean;
}

const roleProfiles: Record<AppRole, { id: string; name: string; email: string }> = {
  admin: { id: 'admin-01', name: 'Comandante Admin', email: 'admin@tacticos.com' },
  vendor: { id: 'vendor-01', name: 'Carlos Operador', email: 'vendor@tacticos.com' },
  client: { id: 'client-01', name: 'Juan Táctico', email: 'cliente@tacticos.com' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>('admin');

  const profile = roleProfiles[role];

  return (
    <AuthContext.Provider value={{
      role,
      currentRole: role,
      setRole,
      userId: profile.id,
      userName: profile.name,
      userEmail: profile.email,
      user: profile,
      isAdmin: role === 'admin',
      isVendor: role === 'vendor',
      isClient: role === 'client',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
