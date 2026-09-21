'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, User, X, CheckCircle2, ArrowRight, Key, Sparkles } from 'lucide-react';
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

  // Close on Escape key and prevent background scroll
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        tacticalAudio.playBlip();
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-2xl animate-fade-in transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          tacticalAudio.playBlip();
          closeAuthModal();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Centered Modal Card: Flawlessly centered on PC, Tablet, and Mobile */}
      <div
        className="relative w-full max-w-[440px] my-auto rounded-3xl border border-[#C8A961]/35 bg-[#0B0B10]/98 text-left shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(200,169,97,0.18)] max-h-[92dvh] flex flex-col overflow-hidden"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Top laser accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C8A961] to-transparent" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#22222A] bg-gradient-to-b from-[#14141C] to-[#0B0B10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C8A961]/15 border border-[#C8A961]/30 flex items-center justify-center text-[#C8A961] shadow-inner">
              <Shield size={20} />
            </div>
            <div>
              <div className="text-[9px] font-mono text-[#C8A961] tracking-widest uppercase font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30A46C] animate-pulse" />
                ACCESO SEGURO MIL-SPEC
              </div>
              <h3 id="auth-modal-title" className="text-base sm:text-lg font-extrabold text-white uppercase tracking-tight">
                PORTAL DE OPERADORES
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              tacticalAudio.playBlip();
              closeAuthModal();
            }}
            aria-label="Cerrar modal"
            className="w-10 h-10 rounded-xl bg-[#14141A] border border-[#22222A] text-[#7A7A85] hover:text-white hover:border-[#C8A961]/40 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {/* If user is already logged in */}
          {isLoggedIn ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-[#30A46C]/10 border border-[#30A46C]/25 text-left">
                <div className="flex items-center gap-2 text-xs font-mono text-[#30A46C] font-bold mb-1">
                  <CheckCircle2 size={16} /> OPERADOR AUTENTICADO
                </div>
                <div className="text-sm font-bold text-white">{userName}</div>
                <div className="text-xs text-[#7A7A85] font-mono">{userEmail}</div>
                <div className="mt-2 text-[10px] font-mono text-[#C8A961] uppercase">
                  ROL ASIGNADO: <strong className="text-white">{role.toUpperCase()}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  signOut();
                  closeAuthModal();
                }}
                className="btn-outline-gold w-full min-h-[48px] text-xs font-bold py-3 flex items-center justify-center"
              >
                CERRAR SESIÓN DEL DISPOSITIVO
              </button>
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#121218] border border-[#22222A] font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    tacticalAudio.playBlip();
                    setTab('login');
                  }}
                  className={`min-h-[42px] rounded-xl font-bold transition-all ${
                    tab === 'login'
                      ? 'bg-[#C8A961] text-black shadow-md'
                      : 'text-[#7A7A85] hover:text-white'
                  }`}
                >
                  INICIAR SESIÓN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    tacticalAudio.playBlip();
                    setTab('register');
                  }}
                  className={`min-h-[42px] rounded-xl font-bold transition-all ${
                    tab === 'register'
                      ? 'bg-[#C8A961] text-black shadow-md'
                      : 'text-[#7A7A85] hover:text-white'
                  }`}
                >
                  REGISTRO
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {tab === 'register' && (
                  <div>
                    <label className="block text-[10px] font-mono text-[#A1A1AA] uppercase mb-1.5 font-semibold">
                      NOMBRE COMPLETO
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7A85]" />
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej. Roberto Vargas"
                        className="w-full min-h-[48px] bg-[#14141C] border border-[#262632] text-xs text-white rounded-xl pl-10 pr-4 py-3 focus:border-[#C8A961] focus:ring-1 focus:ring-[#C8A961]/40 focus:outline-none font-sans transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono text-[#A1A1AA] uppercase mb-1.5 font-semibold">
                    CORREO ELECTRÓNICO
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7A85]" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operador@tacticos.bo"
                      className="w-full min-h-[48px] bg-[#14141C] border border-[#262632] text-xs text-white rounded-xl pl-10 pr-4 py-3 focus:border-[#C8A961] focus:ring-1 focus:ring-[#C8A961]/40 focus:outline-none font-sans transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#A1A1AA] uppercase mb-1.5 font-semibold">
                    CONTRASEÑA
                  </label>
                  <div className="relative">
                    <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7A85]" />
                    <input
                      type="password"
                      required
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full min-h-[48px] bg-[#14141C] border border-[#262632] text-xs text-white rounded-xl pl-10 pr-4 py-3 focus:border-[#C8A961] focus:ring-1 focus:ring-[#C8A961]/40 focus:outline-none font-sans transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-tactical w-full min-h-[48px] text-xs font-bold py-3.5 mt-2 flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  <span>{loading ? 'VERIFICANDO ENLACE...' : tab === 'login' ? 'INGRESAR AL SISTEMA' : 'CREAR CUENTA MILITAR'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </>
          )}

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-[#22222A]">
            <div className="text-[10px] font-mono text-[#7A7A85] uppercase text-center mb-2.5 flex items-center justify-center gap-1.5">
              <Sparkles size={11} className="text-[#C8A961]" />
              <span>CAMBIO DE ROL INMEDIATO (MODO SIMULADOR)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSwitch('admin')}
                className="min-h-[42px] px-2 py-2 rounded-xl bg-[#14141C] border border-[#E5484D]/30 hover:border-[#E5484D] text-[#E5484D] text-[10px] font-mono font-bold transition-all hover:bg-[#E5484D]/10"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleDemoSwitch('vendor')}
                className="min-h-[42px] px-2 py-2 rounded-xl bg-[#14141C] border border-[#3b82f6]/30 hover:border-[#3b82f6] text-[#3b82f6] text-[10px] font-mono font-bold transition-all hover:bg-[#3b82f6]/10"
              >
                CHOFER MOTO
              </button>
              <button
                type="button"
                onClick={() => handleDemoSwitch('client')}
                className="min-h-[42px] px-2 py-2 rounded-xl bg-[#14141C] border border-[#30A46C]/30 hover:border-[#30A46C] text-[#30A46C] text-[10px] font-mono font-bold transition-all hover:bg-[#30A46C]/10"
              >
                CLIENTE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
