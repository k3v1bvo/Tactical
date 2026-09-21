'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AppRole } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, fullName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: AppRole) => void;
}

const roleProfiles: Record<AppRole, { id: string; name: string; email: string }> = {
  admin: { id: 'admin-01', name: 'Comandante Dueño', email: 'admin@tacticos.bo' },
  vendor: { id: 'vendor-01', name: 'Carlos Chofer (Driver)', email: 'driver1@tacticos.bo' },
  client: { id: 'client-01', name: 'Juan Operativo', email: 'cliente@tacticos.bo' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>('client');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<{ id: string; name: string; email: string } | null>(null);

  // Sync Supabase Auth session on mount
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Operador',
          email: session.user.email || '',
        });
        // Check role from user_roles
        client
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.role) {
              setRole(data.role as AppRole);
            }
          });
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Operador',
          email: session.user.email || '',
        });
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string): Promise<boolean> => {
    if (!supabase) {
      toast.error('Supabase no configurado');
      return false;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      toast.error('Error al iniciar sesión', { description: error.message });
      return false;
    }
    toast.success('¡Sesión iniciada con éxito!');
    setIsAuthModalOpen(false);
    return true;
  };

  const signUp = async (email: string, pass: string, fullName: string): Promise<boolean> => {
    if (!supabase) {
      toast.error('Supabase no configurado');
      return false;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) {
      toast.error('Error en el registro', { description: error.message });
      return false;
    }
    toast.success('¡Operador registrado con éxito!');
    setIsAuthModalOpen(false);
    return true;
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setRole('client');
    toast.info('Sesión cerrada');
  };

  const switchDemoRole = (newRole: AppRole) => {
    setRole(newRole);
    setAuthUser(null);
    toast.success(`Modo simulador cambiado a: ${newRole.toUpperCase()}`);
  };

  const currentProfile = authUser || roleProfiles[role];

  return (
    <AuthContext.Provider
      value={{
        role,
        currentRole: role,
        setRole,
        userId: currentProfile.id,
        userName: currentProfile.name,
        userEmail: currentProfile.email,
        user: currentProfile,
        isAdmin: role === 'admin',
        isVendor: role === 'vendor',
        isClient: role === 'client',
        isLoggedIn: !!authUser,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        signIn,
        signUp,
        signOut,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
