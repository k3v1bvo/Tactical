'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Check,
  ExternalLink,
  Search,
  Crosshair,
  Layers,
  Info,
  ShieldCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export interface DeliveryLocation {
  lat: number;
  lng: number;
  address: string;
  reference?: string;
  googleMapsUrl: string;
  wazeUrl: string;
}

interface DeliveryMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  initialReference?: string;
  onConfirm: (loc: DeliveryLocation) => void;
  onCancel?: () => void;
}

// Preset landmarks in Cochabamba metropolitan area
const COCHABAMBA_PRESETS = [
  { name: 'Base Central (Heroínas #560)', lat: -17.3935, lng: -66.1570, desc: 'Av. Heroínas entre San Martín y 25 de Mayo' },
  { name: 'Cala Cala / Av. América', lat: -17.3752, lng: -66.1605, desc: 'Zona Norte, Plaza de las Banderas y Av. América' },
  { name: 'Sarco / Libertador', lat: -17.3750, lng: -66.1685, desc: 'Av. Libertador Bolívar, Condominios Sarco' },
  { name: 'La Cancha / San Antonio', lat: -17.4032, lng: -66.1558, desc: 'Zona Sur, Mercado San Antonio / Pulacayo' },
  { name: 'Quillacollo (Blanco Galindo)', lat: -17.3980, lng: -66.2800, desc: 'Av. Blanco Galindo Km 11, Quillacollo' },
  { name: 'Sacaba (Av. Villazón)', lat: -17.4042, lng: -66.0415, desc: 'Av. Villazón Km 3, Huayllani, Sacaba' },
  { name: 'Tiquipaya (Ecológica)', lat: -17.3385, lng: -66.2175, desc: 'Av. Ecológica y Cruce Chilimarca, Tiquipaya' },
];

export function DeliveryMapPicker({
  initialLat = -17.3935,
  initialLng = -66.1570,
  initialAddress = '',
  initialReference = '',
  onConfirm,
  onCancel,
}: DeliveryMapPickerProps) {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [address, setAddress] = useState<string>(initialAddress);
  const [reference, setReference] = useState<string>(initialReference);
  const [isLocating, setIsLocating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [searchQuery, setSearchQuery] = useState('');

  const googleMapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat.toFixed(6)},${lng.toFixed(6)}&navigate=yes`;

  // Detect GPS
  const handleDetectGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización GPS');
      return;
    }

    setIsLocating(true);
    toast.info('Buscando satélites GPS...', { duration: 2500 });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        setIsLocating(false);
        toast.success('🎯 ¡Ubicación GPS detectada con éxito!');
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS error:', err);
        toast.error('No se pudo obtener el GPS actual. Selecciona el PIN manualmente.', {
          description: err.message || 'Verifica permisos de ubicación en tu navegador.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSelectPreset = (p: typeof COCHABAMBA_PRESETS[0]) => {
    setLat(p.lat);
    setLng(p.lng);
    if (!address.trim()) {
      setAddress(p.desc);
    }
    toast.info(`PIN centrado en: ${p.name}`);
  };

  // Adjust coordinate with micro steps (d-pad controls for precision delivery pinpointing)
  const adjustCoord = (dLat: number, dLng: number) => {
    setLat((prev) => Number((prev + dLat).toFixed(6)));
    setLng((prev) => Number((prev + dLng).toFixed(6)));
  };

  // Search filter for presets
  const filteredPresets = COCHABAMBA_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = () => {
    onConfirm({
      lat,
      lng,
      address: address.trim() || `Punto GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      reference: reference.trim(),
      googleMapsUrl,
      wazeUrl,
    });
  };

  // Generate bounding box for OpenStreetMap embed
  const delta = 0.007; // Zoom box span
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="bg-[#0A0A0E] border border-[#C8A961]/30 rounded-2xl p-4 sm:p-6 shadow-2xl text-white space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#C8A961]/15 border border-[#C8A961]/35 flex items-center justify-center text-[#C8A961]">
            <MapPin size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              SELECCIONAR PUNTO EXACTO DE ENTREGA
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C8A961]/15 text-[#C8A961] border border-[#C8A961]/30">
                GPS COCHABAMBA
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Mueve el PIN o usa el GPS para que el repartidor llegue directo a tu puerta.
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
            title="Cerrar mapa"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Quick Action Toolbar: GPS & Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#C8A961] hover:bg-[#b59855] text-black font-extrabold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <Crosshair size={15} className={isLocating ? 'animate-spin' : ''} />
          {isLocating ? 'Detectando GPS...' : '🎯 USAR MI UBICACIÓN ACTUAL'}
        </button>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-neutral-300 font-mono transition-all"
        >
          <ExternalLink size={13} />
          <span>Ver en Google Maps</span>
        </a>

        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-cyan-400 font-mono transition-all"
        >
          <Navigation size={13} />
          <span>Ruta Waze</span>
        </a>
      </div>

      {/* Preset zone pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          Zonas Frecuentes de Cochabamba:
        </span>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {COCHABAMBA_PRESETS.map((p) => {
            const isSelected = Math.abs(lat - p.lat) < 0.005 && Math.abs(lng - p.lng) < 0.005;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#C8A961]/20 border-[#C8A961] text-[#C8A961] font-bold shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.2]'
                }`}
              >
                📍 {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative rounded-xl overflow-hidden border border-[#C8A961]/25 bg-[#030305] shadow-inner h-[260px] sm:h-[320px]">
        {/* OpenStreetMap Real-Time Tile Embed */}
        <iframe
          title="Mapa de Entrega Cochabamba"
          width="100%"
          height="100%"
          src={embedUrl}
          className="w-full h-full border-0 filter contrast-125 brightness-95"
          loading="lazy"
        />

        {/* Tactical Crosshair Center Indicator */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative -mt-6 flex flex-col items-center">
            {/* Pulsing Tactical Pin Badge */}
            <div className="px-2 py-0.5 rounded-full bg-[#050507]/90 border border-[#C8A961] text-[10px] font-mono text-[#C8A961] font-bold shadow-lg mb-1 flex items-center gap-1 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              DESTINO DE ENTREGA
            </div>
            <div className="relative">
              <MapPin size={38} className="text-[#E5484D] drop-shadow-[0_4px_12px_rgba(229,72,77,0.7)]" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/60 rounded-full blur-[1px]" />
            </div>
          </div>
        </div>

        {/* Micro-Adjustment Tactical D-PAD Controls (Allows adjusting coordinates with single finger taps) */}
        <div className="absolute bottom-3 right-3 bg-[#050507]/90 backdrop-blur-md border border-white/10 rounded-xl p-1.5 flex flex-col items-center gap-1 shadow-2xl">
          <button
            type="button"
            onClick={() => adjustCoord(0.001, 0)}
            className="w-7 h-7 rounded bg-white/10 hover:bg-[#C8A961] hover:text-black text-xs font-bold transition-all flex items-center justify-center"
            title="Mover PIN hacia el Norte"
          >
            ▲
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => adjustCoord(0, -0.001)}
              className="w-7 h-7 rounded bg-white/10 hover:bg-[#C8A961] hover:text-black text-xs font-bold transition-all flex items-center justify-center"
              title="Mover PIN hacia el Oeste"
            >
              ◀
            </button>
            <div className="w-7 h-7 rounded bg-[#C8A961]/20 border border-[#C8A961]/40 flex items-center justify-center text-[9px] font-mono font-black text-[#C8A961]">
              PIN
            </div>
            <button
              type="button"
              onClick={() => adjustCoord(0, 0.001)}
              className="w-7 h-7 rounded bg-white/10 hover:bg-[#C8A961] hover:text-black text-xs font-bold transition-all flex items-center justify-center"
              title="Mover PIN hacia el Este"
            >
              ▶
            </button>
          </div>
          <button
            type="button"
            onClick={() => adjustCoord(-0.001, 0)}
            className="w-7 h-7 rounded bg-white/10 hover:bg-[#C8A961] hover:text-black text-xs font-bold transition-all flex items-center justify-center"
            title="Mover PIN hacia el Sur"
          >
            ▼
          </button>
        </div>

        {/* Live Coordinate readout badge */}
        <div className="absolute top-3 left-3 bg-[#050507]/90 backdrop-blur-md border border-[#C8A961]/30 rounded-lg px-2.5 py-1 text-[11px] font-mono text-[#C8A961] flex items-center gap-1.5 shadow-lg">
          <Compass size={13} className="text-[#C8A961]" />
          <span>
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        </div>
      </div>

      {/* Manual Input Fields: Address & Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
            Dirección / Calle / Número:
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej. Calle Baptista #340 esq. Mayor Rocha"
            className="w-full bg-[#121218] border border-white/10 focus:border-[#C8A961] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
            Referencia de Fachada / Timbre (Opcional):
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Ej. Portón negro de 2 pisos, frente a la farmacia"
            className="w-full bg-[#121218] border border-white/10 focus:border-[#C8A961] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Confirmation Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-neutral-400 font-mono transition-all"
          >
            CANCELAR
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A961] to-[#9E8240] text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#C8A961]/20 hover:scale-[1.02] active:scale-95"
        >
          <Check size={16} strokeWidth={3} />
          CONFIRMAR PUNTO DE ENTREGA
        </button>
      </div>
    </div>
  );
}
