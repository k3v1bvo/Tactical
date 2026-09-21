'use client';

import React, { useState } from 'react';
import { Shield, Lock, Mail, User, X, CheckCircle2, ArrowRight, Radio, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { tacticalAudio } from '@/lib/tactical-audio';
import type { AppRole } from '@/lib/types';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signIn,
    signUp,
    isLoggedIn,
    userName,
    userEmail,
    role,
    signOut,
    switchDemoRole,
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    tacticalAudio.playLockOn();

    if (tab === 'login') {
      await signIn(email, password);
    } else {
      await signUp(email, password, fullName);
    }
    setLoading(false);
  };

  const handleDemoSwitch = (r: AppRole) => {
    tacticalAudio.playBlip();
    switchDemoRole(r);
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-3xl border border-[#C8A961]/30 bg-[#0c0c10] p-7 shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 40px rgba(200, 169, 97, 0.15)',
        }}
      >
        {/* Top laser accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C8A961] to-transparent" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#14141a] border border-[#22222A] text-[#7A7A85] hover:text-white hover:border-[#C8A961]/40 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#C8A961]/15 border border-[#C8A961]/30 flex items-center justify-center text-[#C8A961]">
            <Shield size={22} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#C8A961] tracking-widest uppercase font-bold">
              AUTENTICACIÓN SUPABASE
            </div>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">
              PORTAL DE ACCESO TÁCTICO
            </h3>
          </div>
        </div>

        {/* If user is already logged in, show status & logout */}
        {isLoggedIn ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-[#30A46C]/10 border border-[#30A46C]/25 text-left">
              <div className="flex items-center gap-2 text-xs font-mono text-[#30A46C] font-bold mb-1">
                <CheckCircle2 size={15} /> OPERADOR AUTENTICADO
              </div>
              <div className="text-sm font-bold text-white">{userName}</div>
              <div className="text-xs text-[#7A7A85] font-mono">{userEmail}</div>
              <div className="mt-2 text-[10px] font-mono text-[#C8A961] uppercase">
                ROL: <strong>{role.toUpperCase()}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                signOut();
                closeAuthModal();
              }}
              className="btn-outline-gold w-full text-xs py-3"
            >
              CERRAR SESIÓN
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#14141a] border border-[#22222A] mb-5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`py-2 rounded-lg font-bold transition-all ${
                  tab === 'login'
                    ? 'bg-[#C8A961] text-black shadow-md'
                    : 'text-[#7A7A85] hover:text-white'
                }`}
              >
                INICIAR SESIÓN
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`py-2 rounded-lg font-bold transition-all ${
                  tab === 'register'
                    ? 'bg-[#C8A961] text-black shadow-md'
                    : 'text-[#7A7A85] hover:text-white'
                }`}
              >
                REGISTRO
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-[10px] font-mono text-[#7A7A85] uppercase mb-1">
                    NOMBRE COMPLETO
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5E68]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Roberto Vargas"
                      className="w-full bg-[#14141a] border border-[#22222A] text-xs text-white rounded-xl pl-10 pr-4 py-3 focus:border-[#C8A961]/50 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-[#7A7A85] uppercase mb-1">
                  CORREO ELECTRÓNICO
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5E68]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@tacticos.bo"
                    className="w-full bg-[#14141a] border border-[#22222A] text-xs text-white rounded-xl pl-10 pr-4 py-3 focus:border-[#C8A961]/50 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#7A7A85] uppercase mb-1">
                  CONTRASEÑA CIFRADA
                </label>
                <div className="relative">
                  <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5E68]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#14141a] border border-[#22222A] text-xs text-white rounded-xl pl-10 pr-4 py-3 focus:border-[#C8A961]/50 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-tactical w-full text-xs py-3.5 mt-2 flex items-center justify-center gap-2 shadow-xl"
              >
                <span>{loading ? 'AUTENTICANDO...' : tab === 'login' ? 'INGRESAR AL SISTEMA' : 'CREAR CUENTA'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </>
        )}

        {/* Quick Demo Operator Roles (For Instant Testing) */}
        <div className="mt-6 pt-5 border-t border-[#22222A]">
          <div className="text-[10px] font-mono text-[#5E5E68] uppercase text-center mb-3">
            ACCESO RÁPIDO DE PRUEBA (CAMBIO DE ROL INMEDIATO)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoSwitch('admin')}
              className="px-2 py-2 rounded-xl bg-[#14141a] border border-[#E5484D]/30 hover:border-[#E5484D] text-[#E5484D] text-[10px] font-mono font-bold transition-colors"
            >
              ADMIN
            </button>
            <button
              onClick={() => handleDemoSwitch('vendor')}
              className="px-2 py-2 rounded-xl bg-[#14141a] border border-[#3b82f6]/30 hover:border-[#3b82f6] text-[#3b82f6] text-[10px] font-mono font-bold transition-colors"
            >
              CHOFER MOTO
            </button>
            <button
              onClick={() => handleDemoSwitch('client')}
              className="px-2 py-2 rounded-xl bg-[#14141a] border border-[#30A46C]/30 hover:border-[#30A46C] text-[#30A46C] text-[10px] font-mono font-bold transition-colors"
            >
              CLIENTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
