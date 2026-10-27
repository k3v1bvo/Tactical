'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  X,
  Shield,
  Bell,
  ChevronDown,
  Compass,
  Package,
  User,
  LogIn,
  Boxes,
  Truck,
  CheckCheck,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { MobileBottomBar } from './MobileBottomBar';
import { toast } from 'sonner';
import type { AppRole } from '@/lib/types';

export function Navbar() {
  const { totalItems } = useCart();
  const { role, setRole, userName, openAuthModal, isLoggedIn } = useAuth();
  const {
    categories,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Initialize demo mode and listen for shortcut Ctrl + Shift + D
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isParamDemo = urlParams.get('demo') === '1' || urlParams.get('demo') === 'true';
      const storedDemo = localStorage.getItem('tacticos_demo_mode') === 'true';
      if (isParamDemo || storedDemo) {
        setDemoMode(true);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDemoMode(prev => {
          const next = !prev;
          localStorage.setItem('tacticos_demo_mode', String(next));
          toast.info(next ? '🛡️ Modo Simulador Demo ACTIVADO' : '🔒 Modo Producción Limpio ACTIVADO');
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMilSpecClick = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setDemoMode(d => {
          const toggled = !d;
          localStorage.setItem('tacticos_demo_mode', String(toggled));
          toast.info(toggled ? '🛡️ Modo Simulador Demo ACTIVADO' : '🔒 Modo Producción Limpio ACTIVADO');
          return toggled;
        });
        return 0;
      }
      return next;
    });
  };

  // Filter notifications specifically by current profile role
  const roleNotifications = notifications.filter(
    n => !n.target_role || n.target_role === role || n.target_role === 'all'
  );
  const unreadCount = roleNotifications.filter(n => !n.read).length;

  // Scroll-aware navbar: activates frosted glass mode after 80px
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const roles: { value: AppRole; label: string; color: string; desc: string }[] = [
    { value: 'admin', label: 'Admin', color: '#E5484D', desc: 'Control general & finanzas' },
    { value: 'warehouse', label: 'Almacén', color: '#F5A623', desc: 'Encargada de alistado & costos base' },
    { value: 'vendor', label: 'Vendedor', color: '#3b82f6', desc: 'Entregas, GPS & comisiones' },
    { value: 'client', label: 'Cliente', color: '#30A46C', desc: 'Catálogo & mis compras' },
  ];

  const currentRole = roles.find(r => r.value === role) || roles[0];

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/#catalogo', label: `Catálogo (${categories.length})` },
    { href: '/ordenes', label: 'Mis Pedidos' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('#')[0]) && href.split('#')[0] !== '/';
  };

  const formatTimeAgo = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Ahora mismo';
      if (mins < 60) return `Hace ${mins} min`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `Hace ${hours} h`;
      const days = Math.floor(hours / 24);
      return `Hace ${days} d`;
    } catch {
      return 'Reciente';
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-[#030305]/96 backdrop-blur-2xl border-b border-[#C8A961]/15 shadow-[0_4px_40px_rgba(0,0,0,0.7)]'
            : 'bg-[#0A0A0B]/85 backdrop-blur-xl border-b border-[#22222A]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
              <div className="relative shrink-0">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#C8A961] to-[#7A5C2C] p-[1px] transition-all duration-500 ${
                  scrolled ? 'shadow-[0_0_25px_rgba(200,169,97,0.35)]' : 'shadow-[0_0_15px_rgba(200,169,97,0.15)]'
                } group-hover:shadow-[0_0_35px_rgba(200,169,97,0.5)]`}>
                  <div className="w-full h-full bg-[#050507] rounded-[7px] flex items-center justify-center">
                    <Shield
                      size={18}
                      className="text-[#C8A961] group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                {scrolled && (
                  <span className="absolute inset-0 rounded-lg ring-1 ring-[#C8A961]/20 animate-ping" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-lg font-extrabold tracking-wider text-[#F5F5F7] font-mono truncate">
                    TÁCTICOS<span className="text-[#C8A961]">.PRO</span>
                  </span>
                  <span
                    onClick={handleMilSpecClick}
                    title="Control de Sistema (Triple clic para demo)"
                    className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#C8A961]/12 text-[#C8A961] border border-[#C8A961]/25 cursor-pointer select-none"
                  >
                    MIL-SPEC
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] hidden xs:block text-[#5E5E68] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-medium truncate">
                  Cochabamba · Bolivia
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-[#C8A961] bg-[#C8A961]/08'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-[#C8A961] to-transparent" />
                  )}
                </Link>
              ))}

              {/* Warehouse Role Link */}
              {(role === 'warehouse' || role === 'admin') && (
                <Link
                  href="/almacen"
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    pathname === '/almacen'
                      ? 'bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/40'
                      : 'text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20 hover:bg-[#F5A623]/18'
                  }`}
                  title="Panel de Encargada de Almacén (Preparar & Costos Base)"
                >
                  <Boxes size={14} /> Almacén
                </Link>
              )}

              {/* Vendor Role Link */}
              {(role === 'vendor' || role === 'admin') && (
                <Link
                  href="/vendor/orders"
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    pathname.startsWith('/vendor')
                      ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40'
                      : 'text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/18'
                  }`}
                  title="Entregas, Mapa GPS y Ganancias de Vendedor"
                >
                  <Truck size={14} /> Reparto &amp; GPS
                </Link>
              )}

              {/* Admin Link */}
              {role === 'admin' && (
                <Link
                  href="/admin/overview"
                  className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#C8A961] bg-[#C8A961]/10 border border-[#C8A961]/25 hover:bg-[#C8A961]/18 transition-all flex items-center gap-1.5"
                >
                  <Compass size={14} /> Admin
                </Link>
              )}
            </div>

            {/* Right Action Icons (Optimized for Mobile Touch) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

              {/* Iniciar Sesión / Mi Cuenta Button */}
              <button
                onClick={openAuthModal}
                className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-[#C8A961]/35 hover:border-[#C8A961] bg-[#C8A961]/10 text-[#C8A961] hover:bg-[#C8A961]/20 text-xs font-mono font-bold transition-all shadow-sm min-h-[38px] min-w-[38px]"
                title="Iniciar sesión / Mi Cuenta"
              >
                {isLoggedIn ? <User size={15} /> : <LogIn size={15} />}
                <span className="hidden sm:inline">{isLoggedIn ? 'MI CUENTA' : 'INGRESAR'}</span>
              </button>

              {/* Role Switcher & Notifications (Solo visibles en Modo Demo o con credenciales de Operador) */}
              {(demoMode || role !== 'client') && (
                <>
                  {/* Role Switcher */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setRoleDropdown(!roleDropdown);
                        setNotificationsOpen(false);
                      }}
                      className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#22222A] hover:border-[#35353E] bg-[#0D0D10] transition-all text-xs group min-h-[38px]"
                      title="Cambiar Perfil Operativo (Admin / Almacén / Vendedor / Cliente)"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_6px_currentColor]"
                        style={{ background: currentRole.color }}
                      />
                      <span className="text-[#A1A1AA] hidden lg:inline max-w-[100px] truncate">{userName}</span>
                      <span
                        className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all"
                        style={{ background: `${currentRole.color}18`, color: currentRole.color }}
                      >
                        {currentRole.label.toUpperCase()}
                      </span>
                      <ChevronDown
                        size={12}
                        className={`text-[#5E5E68] transition-transform duration-200 ${roleDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {roleDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-64 glass-deep rounded-xl p-2 shadow-2xl z-50 animate-slide-down border border-[#22222A]">
                        <div className="px-3 py-1.5 border-b border-[#22222A] mb-1">
                          <p className="text-[10px] text-[#5E5E68] font-mono font-semibold uppercase tracking-wider">
                            Cambiar Perfil de Operación
                          </p>
                        </div>
                        {roles.map(r => (
                          <button
                            key={r.value}
                            onClick={() => {
                              setRole(r.value);
                              setRoleDropdown(false);
                            }}
                            className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs transition-all ${
                              role === r.value ? 'bg-[#1C1C22] text-white font-semibold' : 'text-[#A1A1AA] hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: r.color }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white">{r.label}</span>
                                {role === r.value && (
                                  <span className="text-[9px] text-[#C8A961] font-mono font-bold">● ACTIVO</span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#71717A] mt-0.5 line-clamp-1">{r.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Role-Based Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setRoleDropdown(false);
                      }}
                      className="relative p-2 rounded-lg hover:bg-white/[0.04] text-[#A1A1AA] hover:text-white transition-all duration-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title={`Notificaciones para rol ${currentRole.label}`}
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <>
                          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E5484D] rounded-full animate-ping" />
                          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#E5484D] text-white rounded-full text-[9px] font-black font-mono flex items-center justify-center shadow-[0_0_8px_rgba(229,72,77,0.7)]">
                            {unreadCount}
                          </span>
                        </>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-deep rounded-2xl p-3.5 shadow-2xl z-50 animate-slide-down border border-[#22222A]">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-[#22222A] mb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: currentRole.color }} />
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                              Buzón · {currentRole.label}
                            </span>
                            {unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/30">
                                {unreadCount} nuevas
                              </span>
                            )}
                          </div>

                          {unreadCount > 0 && (
                            <button
                              onClick={() => markAllNotificationsAsRead(role)}
                              className="text-[10px] font-mono text-[#C8A961] hover:underline flex items-center gap-1 transition-all"
                            >
                              <CheckCheck size={12} /> Marcar leídas
                            </button>
                          )}
                        </div>

                        {/* Notification list */}
                        {roleNotifications.length === 0 ? (
                          <div className="py-6 text-center">
                            <Bell size={24} className="mx-auto text-[#3A3A44] mb-2 opacity-50" />
                            <p className="text-xs text-[#71717A] font-mono">
                              Sin notificaciones para {currentRole.label.toLowerCase()}.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                            {roleNotifications.map(item => (
                              <div
                                key={item.id}
                                className={`p-3 rounded-xl border transition-all text-xs ${
                                  !item.read
                                    ? 'bg-[#15151A] border-[#C8A961]/30 shadow-sm'
                                    : 'bg-[#0D0D10] border-[#22222A] opacity-75'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    {!item.read && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8A961] shrink-0" />
                                    )}
                                    <span className="font-bold text-white text-[12px]">
                                      {item.title}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono text-[#5E5E68] shrink-0 flex items-center gap-0.5">
                                    <Clock size={10} /> {formatTimeAgo(item.created_at)}
                                  </span>
                                </div>

                                <p className="text-[#A1A1AA] text-[11px] mt-1 leading-relaxed">
                                  {item.message || item.body}
                                </p>

                                {/* Direct Action Link */}
                                <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                                  {item.order_id && (
                                    <span className="text-[9px] font-mono text-[#71717A]">
                                      Orden: <span className="text-[#C8A961]">{item.order_id}</span>
                                    </span>
                                  )}

                                  <div className="ml-auto flex items-center gap-2">
                                    {item.link && (
                                      <Link
                                        href={item.link}
                                        onClick={() => {
                                          markNotificationAsRead(item.id);
                                          setNotificationsOpen(false);
                                        }}
                                        className="text-[10px] font-mono font-bold text-[#C8A961] hover:underline flex items-center gap-1"
                                      >
                                        Ver detalle <ArrowRight size={11} />
                                      </Link>
                                    )}

                                    {!item.read && (
                                      <button
                                        onClick={() => markNotificationAsRead(item.id)}
                                        className="text-[10px] text-[#71717A] hover:text-white"
                                        title="Marcar como leída"
                                      >
                                        ✓
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Cart Icon */}
              <Link
                href="/carrito"
                className="relative p-2 rounded-lg hover:bg-white/[0.04] text-[#A1A1AA] hover:text-white transition-all duration-200 group min-h-[38px] min-w-[38px] flex items-center justify-center"
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
                className="md:hidden p-2 rounded-lg hover:bg-white/[0.04] text-[#A1A1AA] transition-all min-h-[38px] min-w-[38px] flex items-center justify-center"
                aria-label="Abrir menú de navegación"
              >
                {mobileMenuOpen ? <X size={22} className="text-[#C8A961]" /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#22222A] glass-deep px-4 py-4 space-y-2 animate-slide-down max-h-[85vh] overflow-y-auto">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.06]"
              >
                <span>{link.label}</span>
                <span className="text-[10px] font-mono text-[#5E5E68]">→</span>
              </Link>
            ))}

            {/* Warehouse Panel (Mobile) */}
            {(role === 'warehouse' || role === 'admin') && (
              <Link
                href="/almacen"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm text-[#F5A623] font-bold bg-[#F5A623]/12 border border-[#F5A623]/30 shadow-md"
              >
                <span className="flex items-center gap-2"><Boxes size={16} /> Almacén (Preparar &amp; Costos)</span>
                <span className="text-xs font-mono">ENTRAR →</span>
              </Link>
            )}

            {/* Vendor Orders & GPS (Mobile) */}
            {(role === 'vendor' || role === 'admin') && (
              <Link
                href="/vendor/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm text-[#3b82f6] font-bold bg-[#3b82f6]/12 border border-[#3b82f6]/30 shadow-md"
              >
                <span className="flex items-center gap-2"><Truck size={16} /> Reparto &amp; Ruta GPS</span>
                <span className="text-xs font-mono">MAPA →</span>
              </Link>
            )}

            {/* Admin Overview (Mobile) */}
            {role === 'admin' && (
              <Link
                href="/admin/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm text-[#C8A961] font-bold bg-[#C8A961]/12 border border-[#C8A961]/30 shadow-md"
              >
                <span className="flex items-center gap-2"><Compass size={16} /> Panel Administrador</span>
                <span className="text-xs font-mono">ACCEDER →</span>
              </Link>
            )}

            {/* Quick Mobile Auth Button */}
            <div className="pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold font-mono uppercase bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all"
              >
                {isLoggedIn ? <User size={15} className="text-emerald-400" /> : <LogIn size={15} className="text-[#C8A961]" />}
                {isLoggedIn ? `Mi Cuenta (${userName})` : 'Iniciar Sesión / Registro'}
              </button>
            </div>
          </div>
        )}

        {/* Click-away overlay */}
        {(roleDropdown || notificationsOpen) && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => {
              setRoleDropdown(false);
              setNotificationsOpen(false);
            }}
          />
        )}
      </nav>

      {/* Global Mobile Bottom Navigation Bar */}
      <MobileBottomBar />
    </>
  );
}

