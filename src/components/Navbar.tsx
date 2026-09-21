'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Shield, Bell, ChevronDown, Compass, Package, ShieldAlert, User, LogIn } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { AuthModal } from '@/components/AuthModal';
import type { AppRole } from '@/lib/types';

export function Navbar() {
  const { totalItems } = useCart();
  const { role, setRole, userName, openAuthModal, isLoggedIn } = useAuth();
  const { categories, alerts } = useStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const activeAlerts = alerts.filter(a => !a.resolved);

  // Scroll-aware navbar: activates frosted glass mode after 80px
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const roles: { value: AppRole; label: string; color: string }[] = [
    { value: 'admin', label: 'Admin', color: '#E5484D' },
    { value: 'vendor', label: 'Vendor', color: '#3b82f6' },
    { value: 'client', label: 'Cliente', color: '#30A46C' },
  ];

  const currentRole = roles.find(r => r.value === role) || roles[0];

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/#catalogo', label: `Catálogo (${categories.length})` },
    { href: '/ordenes', label: 'Mis Órdenes' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('#')[0]) && href.split('#')[0] !== '/';
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#030305]/96 backdrop-blur-2xl border-b border-[#C8A961]/10 shadow-[0_4px_40px_rgba(0,0,0,0.6)]'
          : 'bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-[#22222A]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[#C8A961] to-[#7A5C2C] p-[1px] transition-all duration-500 ${
                scrolled ? 'shadow-[0_0_25px_rgba(200,169,97,0.35)]' : 'shadow-[0_0_15px_rgba(200,169,97,0.15)]'
              } group-hover:shadow-[0_0_35px_rgba(200,169,97,0.5)]`}>
                <div className="w-full h-full bg-[#050507] rounded-[7px] flex items-center justify-center">
                  <Shield
                    size={20}
                    className="text-[#C8A961] group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              {/* Pulse ring on scroll */}
              {scrolled && (
                <span className="absolute inset-0 rounded-lg ring-1 ring-[#C8A961]/20 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-wider text-[#F5F5F7] font-mono">
                  TÁCTICOS<span className="text-[#C8A961]">.PRO</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#C8A961]/12 text-[#C8A961] border border-[#C8A961]/25">
                  MIL-SPEC
                </span>
              </div>
              <span className="text-[10px] block text-[#5E5E68] tracking-[0.25em] uppercase font-medium">
                Equipment &amp; Tactical Gear
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-[#C8A961] bg-[#C8A961]/08'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
                {/* Active indicator underline */}
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-3.5 right-3.5 h-[1px] bg-gradient-to-r from-transparent via-[#C8A961] to-transparent" />
                )}
              </Link>
            ))}

            {role === 'admin' && (
              <Link
                href="/admin/overview"
                className="ml-1 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#C8A961] bg-[#C8A961]/10 border border-[#C8A961]/20 hover:bg-[#C8A961]/18 hover:border-[#C8A961]/35 transition-all flex items-center gap-1.5"
              >
                <Compass size={13} /> Panel Admin
              </Link>
            )}

            {role === 'vendor' && (
              <Link
                href="/vendor/dashboard"
                className="ml-1 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/18 transition-all flex items-center gap-1.5"
              >
                <Package size={13} /> Portal Repartidor
              </Link>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">

            {/* Iniciar Sesión / Mi Cuenta Button */}
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C8A961]/35 hover:border-[#C8A961] bg-[#C8A961]/10 text-[#C8A961] hover:bg-[#C8A961]/20 text-xs font-mono font-bold transition-all shadow-sm"
              title="Iniciar sesión / Mi Cuenta"
            >
              {isLoggedIn ? <User size={13} /> : <LogIn size={13} />}
              <span className="hidden sm:inline">{isLoggedIn ? 'MI CUENTA' : 'INICIAR SESIÓN'}</span>
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdown(!roleDropdown)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#22222A] hover:border-[#35353E] bg-[#0D0D10] transition-all text-xs group"
              >
                <div
                  className="w-2 h-2 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_6px_currentColor]"
                  style={{ background: currentRole.color }}
                />
                <span className="text-[#A1A1AA] hidden lg:inline">{userName}</span>
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all"
                  style={{ background: `${currentRole.color}18`, color: currentRole.color }}
                >
                  {currentRole.label.toUpperCase()}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-[#5E5E68] transition-transform duration-200 ${roleDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {roleDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-deep rounded-xl p-2 shadow-2xl z-50 animate-slide-down border border-[#22222A]">
                  <p className="text-[10px] text-[#5E5E68] px-3 py-1 font-mono font-semibold uppercase tracking-wider">
                    Cambiar Perfil
                  </p>
                  {roles.map(r => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setRole(r.value);
                        setRoleDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                        role === r.value ? 'bg-[#1C1C22] text-white font-semibold' : 'text-[#A1A1AA] hover:bg-white/[0.035]'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                      <span>{r.label}</span>
                      {role === r.value && (
                        <span className="ml-auto text-[10px] text-[#C8A961] font-mono">● ACTIVO</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* System Alerts */}
            <div className="relative">
              <button
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="relative p-2 rounded-lg hover:bg-white/[0.04] text-[#A1A1AA] hover:text-white transition-all duration-200"
                title="Alertas del sistema"
              >
                <Bell size={18} />
                {activeAlerts.length > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E5484D] rounded-full animate-ping" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E5484D] rounded-full" />
                  </>
                )}
              </button>

              {alertsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 glass-deep rounded-xl p-3 shadow-2xl z-50 animate-slide-down border border-[#22222A]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#22222A] mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-[#C8A961]" /> Alertas Operativas
                    </span>
                    <span className="text-[10px] font-mono text-[#5E5E68]">{activeAlerts.length} activas</span>
                  </div>
                  {activeAlerts.length === 0 ? (
                    <p className="text-xs text-[#5E5E68] py-4 text-center font-mono">Sin alertas pendientes.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {activeAlerts.slice(0, 4).map(a => (
                        <div key={a.id} className="p-2.5 rounded-lg bg-[#0D0D10] border border-[#22222A] text-xs">
                          <span className={`text-[10px] font-bold uppercase font-mono ${
                            a.severity === 'critical' ? 'text-[#E5484D]' : 'text-[#F5A623]'
                          }`}>
                            {a.severity}
                          </span>
                          <p className="text-[#A1A1AA] text-[11px] mt-0.5 line-clamp-2">{a.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              href="/carrito"
              className="relative p-2 rounded-lg hover:bg-white/[0.04] text-[#A1A1AA] hover:text-white transition-all duration-200 group"
              title="Carrito de compra"
            >
              <ShoppingCart size={19} className="group-hover:scale-105 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#C8A961] text-[#050507] rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-[0_0_16px_rgba(200,169,97,0.6)] font-mono">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/[0.04] text-[#A1A1AA] transition-all"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#22222A] glass-deep px-4 py-4 space-y-1 animate-slide-down">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-all"
            >
              {link.label}
            </Link>
          ))}
          {role === 'admin' && (
            <Link
              href="/admin/overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm text-[#C8A961] font-bold bg-[#C8A961]/10 border border-[#C8A961]/20"
            >
              Panel Administrador →
            </Link>
          )}
          {role === 'vendor' && (
            <Link
              href="/vendor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm text-[#3b82f6] font-bold bg-[#3b82f6]/10 border border-[#3b82f6]/20"
            >
              Portal Repartidor →
            </Link>
          )}
        </div>
      )}

      {/* Click-away overlay */}
      {(roleDropdown || alertsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setRoleDropdown(false);
            setAlertsOpen(false);
          }}
        />
      {/* Tactical Authentication Modal */}
      <AuthModal />
    </nav>
  );
}
