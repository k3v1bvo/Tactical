'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import {
  Shield,
  Crosshair,
  ArrowRight,
  Package,
  Award,
  Truck,
  CheckCircle2,
  Star,
  Search,
  ChevronRight,
  ShoppingCart,
  Radio,
  Lock,
  Cpu,
  Flame,
  Layers,
  Sparkles,
  Store,
  Building,
  Target,
  Zap,
  MapPin,
  Clock,
  Gift,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

// ============ SCROLL ANIMATION HOOK ============
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

// ============ GSAP HERO ANIMATIONS ============
function useHeroAnimation(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    let gsapCtx: any;

    const initGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current) return;

      gsapCtx = gsap.context(() => {
        // Check reduced motion preference
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo('[data-hero-badge]', { opacity: 0, y: -16, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
          .fromTo('[data-hero-h1]', { opacity: 0, y: 32, skewY: 1 }, { opacity: 1, y: 0, skewY: 0, duration: 0.8 }, '-=0.2')
          .fromTo('[data-hero-sub]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
          .fromTo('[data-hero-cta]', { opacity: 0, y: 16, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 }, '-=0.3')
          .fromTo('[data-hero-stats]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.2');

        // Parallax orb
        gsap.to('[data-hero-orb]', {
          yPercent: -25,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });

        // Progress bars animation triggered on scroll
        ScrollTrigger.batch('[data-progress-bar]', {
          onEnter: (elements) => {
            elements.forEach((el: Element) => {
              const target = (el as HTMLElement).dataset.width || '0';
              gsap.fromTo(el, { width: '0%' }, { width: `${target}%`, duration: 1.4, ease: 'power2.out' });
            });
          },
          once: true,
        });

      }, containerRef);
    };

    initGSAP();
    return () => gsapCtx?.revert();
  }, [containerRef]);
}

// ============ MAIN COMPONENT ============
export default function HomePage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { products, categories } = useStore();
  const heroRef = useRef<HTMLElement>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock'>('featured');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Active products
  const activeProducts = useMemo(() => {
    return products.filter(p => p.is_active && !p.deleted_at);
  }, [products]);

  // Featured flagship product
  const flagshipProduct = useMemo(() => {
    return activeProducts.find(p => p.stock > 0) || activeProducts[0];
  }, [activeProducts]);

  // Filtered products for catalog
  const filteredProducts = useMemo(() => {
    let list = [...activeProducts];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter(p => p.category_id === selectedCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'stock':
        list.sort((a, b) => b.stock - a.stock);
        break;
    }

    return list;
  }, [activeProducts, search, selectedCategory, sortBy]);

  // Init animations
  useScrollReveal();
  useHeroAnimation(heroRef);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('Producto agotado');
      return;
    }
    addItem(product, 1);
    toast.success(`"${product.name}" añadido al carrito`, {
      description: `Bs. ${product.price.toFixed(2)}`,
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Ingresa un correo electrónico válido');
      return;
    }
    setNewsletterSubscribed(true);
    toast.success('¡Registro táctico completado!', {
      description: 'Recibirás notificaciones de drops prioritarios.',
    });
  };

  const categoryImages: Record<string, string> = {
    'cat-01': 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80',
    'cat-02': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    'cat-03': 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=80',
    'cat-04': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    'cat-05': 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#F5F5F7] selection:bg-[#C8A961] selection:text-[#050507] overflow-x-hidden">
      <Navbar />

      {/* ================================================================= */}
      {/* HERO — Cinematographic Impact                                      */}
      {/* ================================================================= */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden tactical-grid-bg hero-gradient"
      >
        {/* Ambient glow orbs */}
        <div
          data-hero-orb
          className="glow-orb glow-orb-gold absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-60"
          style={{ animation: 'orbFloat 20s ease-in-out infinite' }}
        />
        <div className="glow-orb absolute bottom-0 right-10 w-[400px] h-[400px] opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(229,72,77,0.12) 0%, transparent 70%)', animation: 'orbFloat 25s ease-in-out infinite reverse' }} />

        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#C8A961]/20 to-transparent"
            style={{ animation: 'scanLine 8s linear infinite', top: 0 }} />
        </div>

        {/* HUD Coordinates */}
        <div className="absolute top-24 left-6 hidden lg:flex flex-col gap-1.5 text-[10px] font-mono text-[#35353E]">
          <span className="flex items-center gap-1.5 text-[#C8A961] opacity-80">
            <Radio size={10} className="animate-pulse" /> SAT-LINK ONLINE · COCHABAMBA
          </span>
          <span>LAT: 17°23&apos;S · LON: 66°09&apos;W · 2,558m</span>
          <span>STANAG 4569 CERTIFIED · BOLIVIA</span>
        </div>

        <div className="absolute top-24 right-6 hidden lg:flex flex-col items-end gap-1.5 text-[10px] font-mono text-[#35353E]">
          <span className="text-[#30A46C] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30A46C] animate-ping" />
            OPERACIONAL 100%
          </span>
          <span>ARSENAL: {activeProducts.length} ÍTEMS ACTIVOS</span>
          <span>ENCRIPTACIÓN AES-256</span>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Badge */}
          <div
            data-hero-badge
            style={{ opacity: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-surface border border-[#C8A961]/20 text-xs mb-10 shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-[#C8A961] animate-pulse" />
            <span className="font-mono text-[11px] text-[#A1A1AA] tracking-widest uppercase">
              Equipamiento Profesional · Cochabamba, Bolivia
            </span>
            <span className="text-[#35353E]">·</span>
            <span className="text-[#C8A961] font-mono text-[11px] font-bold">2026</span>
          </div>

          {/* Main Headline */}
          <h1
            data-hero-h1
            style={{ opacity: 0 }}
            className="text-5xl sm:text-7xl md:text-[88px] font-extrabold tracking-tight text-[#F5F5F7] uppercase font-sans leading-[1.04] mb-6"
          >
            EQUIPO PARA{' '}
            <br />
            <span className="text-glow-gold text-gradient-gold">
              NO DETENERSE
            </span>
          </h1>

          {/* Subtitle */}
          <p
            data-hero-sub
            style={{ opacity: 0 }}
            className="text-base sm:text-lg md:text-xl text-[#7A7A85] max-w-2xl mx-auto mb-12 leading-relaxed font-normal"
          >
            Ingeniería militar, protección balística y ergonomía de precisión.
            Diseñado para operadores tácticos en misiones críticas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              data-hero-cta
              style={{ opacity: 0 }}
              href="#catalogo"
              className="btn-tactical text-sm px-10 py-4 w-full sm:w-auto"
            >
              EXPLORAR CATÁLOGO <ArrowRight size={16} />
            </a>
            <a
              data-hero-cta
              style={{ opacity: 0 }}
              href="#bloque-valor"
              className="btn-outline-gold text-sm px-10 py-4 w-full sm:w-auto"
            >
              ESPECIFICACIONES TÉCNICAS
            </a>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8 border-t border-[#22222A]">
            {[
              { label: 'MIL-SPEC', sub: 'Certificado', color: '#F5F5F7' },
              { label: '< 24h', sub: 'Despacho Express', color: '#C8A961' },
              { label: 'IP68', sub: 'Sumergible & Polvo', color: '#F5F5F7' },
              { label: 'QR PAY', sub: 'Pago Cifrado', color: '#30A46C' },
            ].map((m, i) => (
              <div
                key={i}
                data-hero-stats
                style={{ opacity: 0 }}
                className="p-3 text-center group cursor-default"
              >
                <div
                  className="text-2xl font-bold font-mono transition-all duration-300 group-hover:scale-105"
                  style={{ color: m.color }}
                >
                  {m.label}
                </div>
                <div className="text-[11px] text-[#5E5E68] uppercase tracking-wider mt-0.5 font-mono">
                  {m.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity">
          <span className="text-[10px] font-mono tracking-widest text-[#5E5E68] uppercase">SCROLL</span>
          <div className="w-4 h-7 rounded-full border border-[#35353E] flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-[#C8A961] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* TRUST TICKER                                                        */}
      {/* ================================================================= */}
      <section className="py-3.5 border-y border-[#22222A] bg-[#0A0A0D] overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0A0A0D] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0A0A0D] to-transparent z-10 pointer-events-none" />
        <div className="animate-marquee flex items-center gap-10 text-xs font-mono tracking-widest text-[#5E5E68] uppercase">
          {[1, 2].map(i => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-2.5 hover:text-[#C8A961] transition-colors cursor-default whitespace-nowrap">
                <Store size={13} className="text-[#C8A961] flex-shrink-0" />
                BASE CENTRAL COCHABAMBA · RETIRO GRATUITO
              </span>
              <span className="text-[#22222A] flex-shrink-0">✦</span>
              <span className="flex items-center gap-2.5 hover:text-[#C8A961] transition-colors cursor-default whitespace-nowrap">
                <Truck size={13} className="text-[#C8A961] flex-shrink-0" />
                DELIVERY EXPRESS · CERCADO · SACABA · QUILLACOLLO
              </span>
              <span className="text-[#22222A] flex-shrink-0">✦</span>
              <span className="flex items-center gap-2.5 hover:text-[#C8A961] transition-colors cursor-default whitespace-nowrap">
                <Building size={13} className="text-[#C8A961] flex-shrink-0" />
                FLOTA TERMINAL A TODA BOLIVIA
              </span>
              <span className="text-[#22222A] flex-shrink-0">✦</span>
              <span className="flex items-center gap-2.5 hover:text-[#C8A961] transition-colors cursor-default whitespace-nowrap">
                <Crosshair size={13} className="text-[#C8A961] flex-shrink-0" />
                PAGOS QR · 100% O 50/50 O CONTRAENTREGA
              </span>
              <span className="text-[#22222A] flex-shrink-0">✦</span>
              <span className="flex items-center gap-2.5 hover:text-[#30A46C] transition-colors cursor-default whitespace-nowrap">
                <Gift size={13} className="text-[#30A46C] flex-shrink-0" />
                SOUVENIR SORPRESA AL ABONAR 100%
              </span>
              <span className="text-[#22222A] flex-shrink-0">✦</span>
              <span className="flex items-center gap-2.5 hover:text-[#C8A961] transition-colors cursor-default whitespace-nowrap">
                <Shield size={13} className="text-[#C8A961] flex-shrink-0" />
                GARANTÍA TÁCTICA MIL-SPEC
              </span>
              <span className="text-[#22222A] flex-shrink-0">✦</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* DELIVERY OPTIONS — Nuevas Formas de Entrega                        */}
      {/* ================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 animate-on-scroll">
          <div className="text-xs font-mono text-[#C8A961] tracking-widest uppercase mb-2">LOGÍSTICA TÁCTICA</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            TRES FORMAS DE ENTREGA
          </h2>
          <p className="text-sm text-[#7A7A85] mt-3 max-w-lg mx-auto">
            Retiro en almacén, delivery local o envío interprovincial — tú eliges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
          {/* Retiro en almacén */}
          <div className="glass-card antigravity-glow p-7 flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#C8A961]/10 border border-[#C8A961]/20 flex items-center justify-center text-[#C8A961] group-hover:scale-110 transition-transform duration-300">
              <Store size={24} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C8A961] uppercase tracking-widest block mb-1">OPCIÓN 01</span>
              <h3 className="text-lg font-bold text-white mb-2">Retiro en Almacén</h3>
              <p className="text-xs text-[#7A7A85] leading-relaxed">
                Av. Heroínas — Base Central Cochabamba. Lunes a Sábado en horarios establecidos. <strong className="text-[#A1A1AA]">100% gratis.</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#22222A]">
              <Clock size={13} className="text-[#5E5E68]" />
              <span className="text-[11px] text-[#5E5E68] font-mono">COSTO: Bs. 0 · Horario coordinado</span>
            </div>
          </div>

          {/* Delivery urbano */}
          <div className="glass-card antigravity-glow p-7 flex flex-col gap-4 group border-[#C8A961]/15">
            <div className="w-12 h-12 rounded-xl bg-[#C8A961]/15 border border-[#C8A961]/30 flex items-center justify-center text-[#C8A961] group-hover:scale-110 transition-transform duration-300">
              <Truck size={24} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C8A961] uppercase tracking-widest block mb-1">OPCIÓN 02</span>
              <h3 className="text-lg font-bold text-white mb-2">Delivery Express</h3>
              <p className="text-xs text-[#7A7A85] leading-relaxed">
                Repartidor motorizado a tu puerta en Cercado, Sacaba, Quillacollo y zonas aledañas. <strong className="text-[#A1A1AA]">Costo adicional según zona.</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#22222A]">
              <MapPin size={13} className="text-[#C8A961]" />
              <span className="text-[11px] text-[#C8A961] font-mono">ZONA CBBA METROPOLITANA</span>
            </div>
          </div>

          {/* Envío nacional */}
          <div className="glass-card antigravity-glow p-7 flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] group-hover:scale-110 transition-transform duration-300">
              <Building size={24} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#3b82f6] uppercase tracking-widest block mb-1">OPCIÓN 03</span>
              <h3 className="text-lg font-bold text-white mb-2">Envío Nacional</h3>
              <p className="text-xs text-[#7A7A85] leading-relaxed">
                Despacho diario por flotas de buses desde Terminal Cochabamba. La Paz, Santa Cruz, Oruro y todo Bolivia. <strong className="text-[#A1A1AA]">Contraentrega disponible.</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#22222A]">
              <Building size={13} className="text-[#5E5E68]" />
              <span className="text-[11px] text-[#5E5E68] font-mono">FLOTA TERMINAL CBBA · TODA BOLIVIA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CATEGORÍAS — 3D Hover Cards                                        */}
      {/* ================================================================= */}
      <section className="py-20 border-t border-[#22222A] bg-[#070709]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 animate-on-scroll">
            <div>
              <div className="text-xs font-mono text-[#C8A961] tracking-widest uppercase mb-2">
                SISTEMAS OPERACIONALES
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                CATEGORÍAS DE COMBATE
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7A85] max-w-md">
              Blindaje personal, transporte pesado, óptica de precisión e iluminación táctica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, index) => {
              const count = products.filter(p => p.category_id === cat.id).length;
              const bgImg =
                categoryImages[cat.id] ||
                'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80';

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    const el = document.getElementById('catalogo');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="animate-on-scroll group relative h-80 rounded-2xl overflow-hidden cursor-pointer iso-card"
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  {/* Background Image */}
                  <Image
                    src={bgImg}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 brightness-60"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C8A961]/0 via-transparent to-[#050507]/80 group-hover:from-[#C8A961]/8 transition-all duration-500" />

                  {/* Glassy border frame */}
                  <div className="absolute inset-0 rounded-2xl border border-white/6 group-hover:border-[#C8A961]/30 transition-colors duration-400" />

                  {/* Corner index */}
                  <div className="absolute top-4 right-4 text-[#5E5E68] group-hover:text-[#C8A961] font-mono text-[11px] transition-colors duration-300 tracking-widest">
                    {String(index + 1).padStart(2, '0')} ──
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end">
                    <span className="text-[11px] font-mono text-[#C8A961] uppercase tracking-wider font-semibold mb-1.5">
                      {count} PRODUCTOS
                    </span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2 group-hover:text-[#C8A961] transition-colors duration-300">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#7A7A85] line-clamp-2 mb-4 leading-relaxed">
                      {cat.description || 'Equipamiento de máxima durabilidad y diseño técnico.'}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-bold text-white/60 group-hover:text-[#C8A961] uppercase tracking-wider transition-all duration-300 group-hover:gap-2">
                      EXPLORAR LÍNEA <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* CATÁLOGO — Product Grid                                            */}
      {/* ================================================================= */}
      <section id="catalogo" className="py-24 border-t border-[#22222A] bg-[#050507] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 animate-on-scroll">
            <div>
              <div className="text-xs font-mono text-[#C8A961] tracking-widest uppercase mb-2">
                INVENTARIO EN VIVO
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                CATÁLOGO TÁCTICO
              </h2>
            </div>
            <div className="text-xs font-mono text-[#5E5E68] bg-[#0D0D10] border border-[#22222A] px-3 py-1.5 rounded-lg">
              {filteredProducts.length} / {activeProducts.length} DISPONIBLES
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="glass-card-static p-4 rounded-xl border border-[#22222A] mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between animate-on-scroll">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5E68]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, código o descripción..."
                className="w-full bg-[#0D0D10] border border-[#22222A] text-xs text-[#F5F5F7] rounded-lg pl-10 pr-4 py-2.5 focus:border-[#C8A961]/50 focus:outline-none transition-all placeholder-[#5E5E68]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-[#C8A961] text-[#050507] font-bold shadow-[0_0_15px_rgba(200,169,97,0.3)]'
                    : 'bg-[#0D0D10] text-[#A1A1AA] hover:text-white border border-[#22222A] hover:border-[#35353E]'
                }`}
              >
                TODOS ({activeProducts.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? 'bg-[#C8A961] text-[#050507] font-bold shadow-[0_0_15px_rgba(200,169,97,0.3)]'
                      : 'bg-[#0D0D10] text-[#A1A1AA] hover:text-white border border-[#22222A] hover:border-[#35353E]'
                  }`}
                >
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#0D0D10] border border-[#22222A] text-xs text-[#A1A1AA] rounded-lg px-3 py-2.5 focus:border-[#C8A961]/50 focus:outline-none cursor-pointer"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="stock">Mayor Stock</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product, idx) => {
              const isLow = product.stock <= product.low_stock_threshold && product.stock > 0;
              const isOut = product.stock === 0;

              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/producto/${product.id}`)}
                  className="group bg-[#0D0D10] border border-[#22222A] hover:border-[#C8A961]/25 rounded-xl overflow-hidden flex flex-col justify-between floating-card cursor-pointer animate-on-scroll"
                  style={{ transitionDelay: `${(idx % 8) * 40}ms` }}
                >
                  {/* Image */}
                  <div className="relative aspect-square w-full bg-[#14141A] overflow-hidden">
                    <Image
                      src={product.images[0] || 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050507]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                    {/* Quick view button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="bg-[#050507]/90 text-[#C8A961] text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border border-[#C8A961]/30 backdrop-blur-sm">
                        VER DETALLE
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {isOut ? (
                        <span className="bg-[#E5484D] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          AGOTADO
                        </span>
                      ) : isLow ? (
                        <span className="bg-[#F5A623] text-[#050507] text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          ÚLTIMAS {product.stock} UDS
                        </span>
                      ) : (
                        <span className="bg-[#0D0D10]/85 backdrop-blur-sm text-[#C8A961] border border-[#C8A961]/25 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          MIL-SPEC
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-[#050507]/80 text-[#7A7A85] text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                        {product.category?.name || 'Táctico'}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-[#5E5E68] mb-1">
                        REF-{product.id.slice(-6).toUpperCase()}
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#C8A961] transition-colors duration-200 line-clamp-1 mb-1.5">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#7A7A85] line-clamp-2 leading-relaxed mb-4">
                        {product.description || 'Equipamiento de alto rendimiento balístico y durabilidad probada.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#22222A] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#5E5E68] block font-mono">PRECIO</span>
                        <span className="text-lg font-bold text-white font-mono">
                          Bs. {product.price.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={e => handleQuickAdd(e, product)}
                        disabled={isOut}
                        className={`relative p-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 overflow-hidden ${
                          isOut
                            ? 'bg-[#22222A] text-[#5E5E68] cursor-not-allowed'
                            : 'bg-[#C8A961] text-[#050507] hover:bg-[#DEC07A] active:scale-95 shadow-[0_4px_12px_rgba(200,169,97,0.3)] hover:shadow-[0_6px_20px_rgba(200,169,97,0.45)]'
                        }`}
                        title="Añadir al carrito"
                      >
                        <ShoppingCart size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-24 border border-dashed border-[#22222A] rounded-2xl">
              <Target size={40} className="text-[#5E5E68] mx-auto mb-4" />
              <h3 className="text-base font-bold text-white mb-1">Sin resultados tácticos</h3>
              <p className="text-xs text-[#7A7A85]">Ajusta tu búsqueda o categoría.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory(null); }}
                className="btn-tactical text-xs mt-5"
              >
                Restablecer Filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* VALOR TÁCTICO — Split Screen                                        */}
      {/* ================================================================= */}
      <section id="bloque-valor" className="py-24 border-t border-[#22222A] bg-[#070709]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Features List */}
            <div className="animate-on-scroll">
              <div className="text-xs font-mono text-[#C8A961] tracking-widest uppercase mb-2">
                INGENIERÍA SIN CONCESIONES
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase mb-6 leading-tight">
                ESTÁNDARES SUPERIORES PARA CONDICIONES EXTREMAS
              </h2>
              <p className="text-sm text-[#7A7A85] mb-10 leading-relaxed">
                Cada costura, hebilla y panel balístico sometido a pruebas de resistencia en laboratorio y escenarios reales.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Shield, title: 'Blindaje & Kevlar NIJ-IIIA', desc: 'Detención de fragmentos hasta .44 Magnum con mínima deformación.' },
                  { icon: Layers, title: 'Molle Modular Corte Láser', desc: 'Ranurado en Cordura 1000D. 30% menos peso sin perder tracción.' },
                  { icon: Flame, title: 'Resistencia Térmica IP68', desc: 'Operación entre -40°C y +70°C con sellado hidrofóbico total.' },
                  { icon: Cpu, title: 'Aluminio Aeroespacial 7075-T6', desc: 'Hebillas de liberación rápida que soportan +900 kg de tensión.' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-4 group animate-on-scroll" style={{ transitionDelay: `${i * 80}ms` }}>
                    <div className="w-11 h-11 rounded-xl bg-[#0D0D10] border border-[#22222A] flex items-center justify-center text-[#C8A961] flex-shrink-0 mt-0.5 group-hover:border-[#C8A961]/35 group-hover:bg-[#C8A961]/08 transition-all duration-300">
                      <f.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-1">{f.title}</h4>
                      <p className="text-xs text-[#7A7A85] leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry HUD */}
            <div className="relative glass-card p-8 overflow-hidden tactical-dots-bg animate-on-scroll">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-mono text-[#5E5E68]">
                <Lock size={11} className="text-[#30A46C]" /> TELEMETRÍA CIFRADA
              </div>

              <div className="mb-8">
                <span className="text-[10px] font-mono text-[#C8A961] uppercase">DIAGNÓSTICO TÉCNICO</span>
                <h3 className="text-xl font-bold text-white mt-1.5">MATRIZ DE RESISTENCIA BALÍSTICA</h3>
              </div>

              {/* Radar */}
              <div className="relative w-56 h-56 mx-auto my-6 flex items-center justify-center">
                {/* Concentric rings */}
                {[56, 44, 32].map((size, i) => (
                  <div
                    key={i}
                    className={`absolute border rounded-full flex items-center justify-center ${
                      i === 0 ? 'border-[#35353E]' : i === 1 ? 'border-[#22222A]' : 'border-[#C8A961]/20'
                    }`}
                    style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
                  />
                ))}
                {/* Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#22222A]" />
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#22222A]" />
                {/* Rotating radar line */}
                <div
                  className="absolute w-[1px] h-1/2 bg-gradient-to-t from-[#C8A961]/60 to-transparent origin-bottom animate-radar"
                  style={{ bottom: '50%', left: '50%', transformOrigin: 'bottom center' }}
                />
                <Crosshair size={32} className="text-[#C8A961] relative z-10 animate-pulse" />
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 font-mono text-xs mt-6">
                {[
                  { label: 'DURABILIDAD A LA ABRASIÓN', value: 99.4 },
                  { label: 'DISPERSIÓN DE IMPACTO', value: 96.8 },
                  { label: 'REDUCCIÓN FIRMA INFRARROJA', value: 94.2 },
                ].map((bar, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[#A1A1AA] mb-1.5">
                      <span>{bar.label}</span>
                      <span className="text-[#C8A961]">{bar.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0D0D10] rounded-full overflow-hidden border border-[#22222A]">
                      <div
                        data-progress-bar
                        data-width={bar.value}
                        className="h-full bg-gradient-to-r from-[#C8A961] to-[#DEC07A] rounded-full"
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* PAYMENT METHODS — Métodos de Pago                                  */}
      {/* ================================================================= */}
      <section className="py-20 border-t border-[#22222A] bg-[#050507]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="animate-on-scroll mb-12">
            <div className="text-xs font-mono text-[#C8A961] tracking-widest uppercase mb-2">OPCIONES DE PAGO</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
              PAGA COMO PREFIERAS
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 stagger-children">
            {[
              {
                icon: Zap,
                title: 'Pago Total QR',
                desc: 'Paga el 100% por QR bancario y recibe un SOUVENIR SORPRESA de regalo.',
                color: '#C8A961',
                badge: '🎁 REGALO INCLUIDO',
                badgeColor: '#30A46C',
              },
              {
                icon: Lock,
                title: 'Pago 50/50',
                desc: '50% por QR al confirmar el pedido y el resto contra entrega.',
                color: '#3b82f6',
                badge: 'FLEXIBILIDAD',
                badgeColor: '#3b82f6',
              },
              {
                icon: Package,
                title: 'Contraentrega',
                desc: 'Paga al recibir tu pedido. Disponible para zonas seleccionadas.',
                color: '#A1A1AA',
                badge: 'SEGURO',
                badgeColor: '#5E5E68',
              },
            ].map((method, i) => (
              <div key={i} className="glass-card p-6 text-left group">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${method.color}15`, border: `1px solid ${method.color}25`, color: method.color }}
                >
                  <method.icon size={22} />
                </div>
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-3 inline-block"
                  style={{ background: `${method.badgeColor}15`, color: method.badgeColor, border: `1px solid ${method.badgeColor}25` }}
                >
                  {method.badge}
                </span>
                <h3 className="text-base font-bold text-white mb-2">{method.title}</h3>
                <p className="text-xs text-[#7A7A85] leading-relaxed">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* TESTIMONIOS                                                         */}
      {/* ================================================================= */}
      <section className="py-24 border-t border-[#22222A] bg-[#070709]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-on-scroll">
            <div className="text-xs font-mono text-[#C8A961] tracking-widest uppercase mb-2">
              AVALADO EN EL CAMPO
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
              TESTIMOANIOS DE OPERADORES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                initials: 'MR',
                name: 'Mayor Roberto V.',
                role: 'Unidad de Operaciones Especiales',
                review: '"El chaleco modular Molle resistió 3 semanas continuas de despliegue en bosque húmedo sin una sola costura cedida."',
              },
              {
                initials: 'DC',
                name: 'Dra. Claudia M.',
                role: 'Rescate Alpino & Trauma',
                review: '"La mochila táctica 45L nos permitió cargar 2 desfibriladores y material de trauma sin pérdida de movilidad en ascenso vertical."',
              },
              {
                initials: 'JS',
                name: 'Javier S.',
                role: 'Instructor de Tiro Defensivo',
                review: '"El pago con QR y verificación directa fue inmediata. Recibí el paquete al día siguiente con empaque sellado al vacío."',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="glass-card p-6 flex flex-col justify-between group hover:border-[#C8A961]/20 animate-on-scroll"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div>
                  <div className="flex items-center gap-1 text-[#C8A961] mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} fill="#C8A961" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed italic mb-6">{t.review}</p>
                </div>
                <div className="pt-4 border-t border-[#22222A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D0D10] border border-[#C8A961]/25 flex items-center justify-center font-mono font-bold text-[#C8A961] text-xs group-hover:border-[#C8A961]/40 transition-colors">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {t.name} <CheckCircle2 size={12} className="text-[#30A46C]" />
                    </div>
                    <div className="text-[10px] text-[#5E5E68] font-mono">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FLAGSHIP PRODUCT — Hero Spotlight                                  */}
      {/* ================================================================= */}
      {flagshipProduct && (
        <section className="py-20 border-t border-[#22222A] bg-[#050507] relative overflow-hidden">
          {/* Aurora background */}
          <div className="absolute inset-0 aurora-bg" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div
              className="rounded-3xl border border-[#35353E] p-8 md:p-12 relative overflow-hidden animate-on-scroll"
              style={{
                background: 'linear-gradient(135deg, rgba(17,17,22,0.95) 0%, rgba(22,22,30,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C8A961]/40 to-transparent" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C8A961]/10 text-[#C8A961] border border-[#C8A961]/25 text-xs font-mono font-bold">
                    <Sparkles size={11} /> PRODUCTO INSIGNIA DE TEMPORADA
                  </span>

                  <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase leading-tight">
                    {flagshipProduct.name}
                  </h3>

                  <p className="text-sm text-[#7A7A85] max-w-xl leading-relaxed">
                    {flagshipProduct.description}
                  </p>

                  <div className="flex items-center gap-6 py-2">
                    <div>
                      <div className="text-[10px] text-[#5E5E68] font-mono">PRECIO DIRECTO</div>
                      <div className="text-3xl font-extrabold text-white font-mono text-glow-gold">
                        Bs. {flagshipProduct.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="h-8 w-[1px] bg-[#22222A]" />
                    <div>
                      <div className="text-[10px] text-[#5E5E68] font-mono">ESTADO</div>
                      <div className="text-sm font-bold text-[#30A46C] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#30A46C] animate-pulse" />
                        {flagshipProduct.stock > 0 ? `${flagshipProduct.stock} EN STOCK` : 'AGOTADO'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => { addItem(flagshipProduct, 1); router.push('/checkout'); }}
                      className="btn-tactical text-xs px-8 py-3.5"
                    >
                      COMPRAR AHORA <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => router.push(`/producto/${flagshipProduct.id}`)}
                      className="btn-outline-gold text-xs px-8 py-3.5"
                    >
                      VER ESPECIFICACIONES
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 relative aspect-square rounded-2xl overflow-hidden border border-[#22222A] bg-[#0A0A0D] group">
                  <Image
                    src={flagshipProduct.images[0] || 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80'}
                    alt={flagshipProduct.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  {/* Glare effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================= */}
      {/* NEWSLETTER                                                          */}
      {/* ================================================================= */}
      <section className="py-24 border-t border-[#22222A] bg-[#070709] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-on-scroll">
          <div className="w-14 h-14 rounded-2xl bg-[#C8A961]/10 border border-[#C8A961]/20 flex items-center justify-center text-[#C8A961] mx-auto mb-5 animate-float">
            <Radio size={24} />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase mb-3">
            ÚNETE AL CANAL DE DESPLIEGUE
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7A85] max-w-lg mx-auto mb-8 leading-relaxed">
            Alertas prioritarias de reabastecimiento, prototipos confidenciales y descuentos para operadores acreditados.
          </p>

          {newsletterSubscribed ? (
            <div className="p-4 rounded-xl bg-[#30A46C]/10 border border-[#30A46C]/25 text-[#30A46C] text-xs font-mono font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
              <CheckCircle2 size={16} /> OPERADOR ENLAZADO. COMUNICADOS VÍA CORREO.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="operador@tacticos.com"
                className="flex-1 bg-[#0D0D10] border border-[#22222A] rounded-xl px-5 py-3.5 text-xs text-white placeholder-[#5E5E68] focus:border-[#C8A961]/50 focus:outline-none font-mono transition-all"
              />
              <button type="submit" className="btn-tactical text-xs py-3.5 px-6 whitespace-nowrap">
                ENROLARSE
              </button>
            </form>
          )}

          <div className="text-[10px] text-[#5E5E68] font-mono mt-4">
            SIN SPAM · CANCELA EN CUALQUIER MOMENTO · PROTOCOLO DE PRIVACIDAD MIL-STD
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FOOTER                                                              */}
      {/* ================================================================= */}
      <footer className="border-t border-[#22222A] bg-[#030305] pt-16 pb-10 relative">
        {/* Top gold accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C8A961]/25 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-[#C8A961]" />
                <span className="font-mono font-extrabold text-white text-base tracking-wider">
                  TÁCTICOS<span className="text-[#C8A961]">.PRO</span>
                </span>
              </div>
              <p className="text-xs text-[#5E5E68] leading-relaxed">
                Base central en Cochabamba, Bolivia (Av. Heroínas). Retiro gratuito en almacén, delivery motorizado urbano y despachos por flota a todo el país.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#30A46C] bg-[#0D0D10] px-3 py-1.5 rounded-lg border border-[#22222A] w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30A46C] animate-ping" />
                HQ COCHABAMBA ONLINE
              </div>
            </div>

            {/* Arsenal */}
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">ARSENAL</div>
              <ul className="space-y-2 text-xs text-[#7A7A85]">
                {categories.slice(0, 5).map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-[#C8A961] transition-colors duration-200 text-left"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">SOPORTE</div>
              <ul className="space-y-2 text-xs text-[#7A7A85]">
                <li><Link href="/ordenes" className="hover:text-[#C8A961] transition-colors">Seguimiento de Órdenes</Link></li>
                <li><a href="#bloque-valor" className="hover:text-[#C8A961] transition-colors">Certificados Balísticos</a></li>
                <li><a href="#bloque-valor" className="hover:text-[#C8A961] transition-colors">Guía de Tallas Molle</a></li>
                <li><Link href="/admin/overview" className="hover:text-[#C8A961] transition-colors">Consola de Mando</Link></li>
              </ul>
            </div>

            {/* Pagos */}
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">PAGO CON QR</div>
              <p className="text-xs text-[#5E5E68] mb-3 leading-relaxed">
                Liquidación bancaria instantánea. Sin intermediarios ni cargos ocultos.
              </p>
              <div className="flex flex-wrap gap-2">
                {['BANCO QR', 'POS DIRECT', 'IMGBB'].map(tag => (
                  <span key={tag} className="px-2 py-1 rounded bg-[#0D0D10] border border-[#22222A] text-[10px] font-mono text-[#7A7A85]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#22222A] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5E5E68] font-mono gap-3">
            <div>© 2026 TIENDA TÁCTICA COCHABAMBA · BOLIVIA</div>
            <div className="flex items-center gap-5">
              <span>STANAG 4569</span>
              <span>CORDURA® VERIFIED</span>
              <span>AES-256 SSL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
