'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Package,
  Filter,
  Phone,
  MessageCircle,
  MapPin,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Star,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';

export default function DriverOrdersPage() {
  const {
    orders,
    shippingZones,
    driverAcceptOrder,
    driverPickupOrder,
    driverInTransit,
    driverDeliverOrder,
    isDriverAvailable
  } = useStore();

  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Tab 1: Available orders ready for pickup
  const availableOrders = orders.filter(o => o.status === 'ready');

  // Tab 2: Orders currently assigned to this driver in progress
  const activeDeliveries = orders.filter(
    o => ['assigned', 'picked_up', 'in_transit'].includes(o.status)
  );

  // Tab 3: Completed delivered orders
  const deliveredHistory = orders.filter(o => o.status === 'delivered');

  // Filter current tab by search and zone
  const getFilteredOrders = () => {
    let list = activeTab === 'available'
      ? availableOrders
      : activeTab === 'active'
      ? activeDeliveries
      : deliveredHistory;

    if (zoneFilter !== 'all') {
      list = list.filter(o => o.shipping_zone_id === zoneFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        o =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_address?.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filtered = getFilteredOrders();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#C8A961] uppercase block mb-1">
            TERMINAL DE REPARTO // OPERATIVO
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Control de Envíos & Mi Ruta
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Acepta pedidos preparados en almacén y gestiona el despacho puerta a puerta.
          </p>
        </div>

        {/* Status notice */}
        {!isDriverAvailable && (
          <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertTriangle size={14} /> Modo "En Descanso" — No recibirás alertas de nuevos pedidos.
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-white/[0.08] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'available'
              ? 'border-[#C8A961] text-[#C8A961]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Package size={14} />
          Pedidos Disponibles ({availableOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-[#C8A961] text-[#C8A961]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Truck size={14} />
          En Curso / Mi Ruta ({activeDeliveries.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-[#C8A961] text-[#C8A961]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <CheckCircle2 size={14} />
          Historial Entregados ({deliveredHistory.length})
        </button>
      </div>

      {/* Filters bar */}
      <div className="glass-card-static p-4 flex flex-wrap gap-3 items-center justify-between border border-white/[0.06]">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por orden, cliente o dirección..."
            className="input-tactical pl-9 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-neutral-400" />
          <select
            value={zoneFilter}
            onChange={e => setZoneFilter(e.target.value)}
            className="input-tactical py-2 text-xs w-auto"
          >
            <option value="all">Todas las zonas de envío</option>
            {shippingZones.map(z => (
              <option key={z.id} value={z.id}>
                {z.name} (Bs. {z.driver_commission.toFixed(2)} com.)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List for Current Tab */}
      <div className="space-y-4">
        {filtered.map(order => {
          const zone = shippingZones.find(z => z.id === order.shipping_zone_id);
          const commission = order.driver_commission || zone?.driver_commission || 10;
          const cleanPhone = (order.customer_phone || '').replace(/[^0-9]/g, '');
          const waMessage = encodeURIComponent(
            `¡Hola ${order.customer_name || 'estimado'}! Soy el repartidor de Tienda Táctica en camino con tu orden #${order.id.toUpperCase()}.`
          );
          const waLink = `https://wa.me/${cleanPhone}?text=${waMessage}`;

          return (
            <div
              key={order.id}
              className={`glass-card-static p-5 border transition ${
                activeTab === 'available'
                  ? 'border-purple-500/30 hover:border-[#C8A961]/50'
                  : activeTab === 'active'
                  ? 'border-[#C8A961]/40'
                  : 'border-white/[0.06]'
              }`}
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#C8A961] flex-shrink-0">
                    {order.status === 'ready' ? (
                      <Package size={20} />
                    ) : order.status === 'delivered' ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : (
                      <Truck size={20} className="text-[#C8A961]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">
                        #{order.id.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          order.status === 'ready'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : order.status === 'assigned'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : order.status === 'picked_up'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : order.status === 'in_transit'
                            ? 'bg-[#C8A961]/20 text-[#C8A961] border-[#C8A961]'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 block mt-0.5">
                      Zona: <strong className="text-white">{zone?.name || 'Zona General'}</strong>
                    </span>
                  </div>
                </div>

                {/* Financial highlight */}
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                      TU COMISIÓN
                    </span>
                    <div className="text-lg font-mono font-black text-[#C8A961]">
                      +Bs. {commission.toFixed(2)}
                    </div>
                  </div>

                  {/* Accept Order Action (Tab 1) */}
                  {activeTab === 'available' && (
                    <button
                      onClick={() => driverAcceptOrder(order.id)}
                      className="btn-tactical text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-lg shadow-[#C8A961]/20"
                    >
                      <Navigation size={14} /> ACEPTAR PEDIDO
                    </button>
                  )}
                </div>
              </div>

              {/* Destination & Recipient Info */}
              <div className="py-3.5 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-neutral-300">
                  <MapPin size={15} className="text-[#C8A961] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-semibold">{order.customer_name || 'Cliente'}</span>
                    <div className="text-neutral-400">{order.customer_address || 'Sin dirección registrada'}</div>
                  </div>
                </div>

                {order.delivery_notes && (
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-neutral-400 ml-6">
                    <strong className="text-neutral-300">Indicaciones: </strong>{order.delivery_notes}
                  </div>
                )}
              </div>

              {/* Amount to collect alert */}
              {order.pending_amount !== undefined && order.pending_amount > 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-amber-400 flex-shrink-0" />
                    <span>
                      <strong>COBRAR AL ENTREGAR: </strong> Cobrar exactamente{' '}
                      <strong className="text-white font-mono">Bs. {order.pending_amount.toFixed(2)}</strong> al cliente en mano o QR (saldo restante).
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 mb-3">
                  <CheckCircle2 size={15} />
                  <span>
                    <strong>ORDEN PAGADA AL 100%: </strong> No cobrar nada al cliente al momento de la entrega.
                  </span>
                </div>
              )}

              {/* Active Tab Actions & Communication */}
              {activeTab === 'active' && (
                <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* WhatsApp and Phone direct contact */}
                  <div className="flex items-center gap-2">
                    {order.customer_phone ? (
                      <>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <MessageCircle size={14} /> WhatsApp Cliente
                        </a>
                        <a
                          href={`tel:${cleanPhone}`}
                          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-neutral-300 transition"
                          title="Llamar"
                        >
                          <Phone size={14} />
                        </a>
                      </>
                    ) : (
                      <span className="text-[11px] text-neutral-500 italic">Sin teléfono registrado</span>
                    )}
                  </div>

                  {/* State Progression Buttons */}
                  <div className="flex items-center gap-2">
                    {order.status === 'assigned' && (
                      <button
                        onClick={() => driverPickupOrder(order.id)}
                        className="btn-tactical text-xs py-2 px-3.5 flex items-center gap-1.5"
                      >
                        <Package size={14} /> MARCAR COMO RECOGIDO EN TIENDA
                      </button>
                    )}

                    {order.status === 'picked_up' && (
                      <button
                        onClick={() => driverInTransit(order.id)}
                        className="btn-tactical text-xs py-2 px-3.5 flex items-center gap-1.5"
                      >
                        <Truck size={14} /> INICIAR RUTA (EN CAMINO)
                      </button>
                    )}

                    {order.status === 'in_transit' && (
                      <button
                        onClick={() => driverDeliverOrder(order.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle2 size={14} /> CONFIRMAR ENTREGA AL CLIENTE
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Rating received */}
              {activeTab === 'history' && order.customer_rating && (
                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    Calificación del cliente:{' '}
                    <strong className="text-amber-400 flex items-center gap-0.5">
                      <Star size={12} fill="currentColor" /> {order.customer_rating} Estrellas
                    </strong>
                  </span>
                  {order.customer_review && (
                    <span className="italic text-neutral-500 max-w-sm truncate">
                      "{order.customer_review}"
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 glass-card-static border border-white/[0.06] text-neutral-500 text-xs">
            No se encontraron pedidos en la pestaña <strong className="text-neutral-300 capitalize">{activeTab}</strong> con los filtros actuales.
          </div>
        )}
      </div>
    </div>
  );
}
