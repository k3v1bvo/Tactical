'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  MapPin,
  Phone,
  MessageCircle,
  AlertTriangle,
  Gift,
  Boxes,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';

export default function WarehousePage() {
  const {
    orders,
    products,
    warehouseStartPreparing,
    warehouseMarkReady,
    warehouseHandoverToVendor,
  } = useStore();
  const { role, switchDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready' | 'picked_up' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Toggle checklist for picking
  const toggleItemCheck = (key: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter orders for warehouse
  const pendingOrders = orders.filter(
    o => (o.status === 'paid' || o.status === 'pending') && (!o.warehouse_status || o.warehouse_status === 'pending')
  );
  const preparingOrders = orders.filter(
    o => o.status === 'preparing' || o.warehouse_status === 'preparing'
  );
  const readyOrders = orders.filter(
    o => o.status === 'ready' || o.warehouse_status === 'ready'
  );
  const handedOverOrders = orders.filter(
    o => o.warehouse_status === 'picked_up' || ['picked_up', 'in_transit', 'delivered'].includes(o.status)
  );

  const getFilteredList = () => {
    let list = orders;
    if (activeTab === 'pending') list = pendingOrders;
    else if (activeTab === 'preparing') list = preparingOrders;
    else if (activeTab === 'ready') list = readyOrders;
    else if (activeTab === 'picked_up') list = handedOverOrders;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        o =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.toLowerCase().includes(q) ||
          o.customer_address?.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const filteredOrders = getFilteredList();

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 space-y-6">
        {/* Role Banner if not in warehouse role */}
        {role !== 'warehouse' && role !== 'admin' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400 shrink-0" />
              <span>
                Estás visualizando el Almacén con perfil <strong>{role.toUpperCase()}</strong>. Cambia al rol de la Encargada de Almacén para simular todas las acciones de despacho.
              </span>
            </div>
            <button
              onClick={() => switchDemoRole('warehouse')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-[11px] font-mono shrink-0 hover:bg-amber-400 transition"
            >
              CAMBIAR A ROL ALMACÉN
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623] px-2 py-0.5 rounded bg-[#F5A623]/15 border border-[#F5A623]/30">
                BASE HEROÍNAS #560 // OPERACIONES
              </span>
              <span className="text-xs text-neutral-500 font-mono">Cochabamba</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
              <Boxes className="text-[#F5A623]" size={28} />
              Centro de Alistamiento & Almacén
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Encargada de Almacén: Visualiza los pedidos confirmados, verifica ítems a precio base y entrégalos al vendedor para entrega final.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">ENCARGADA EN TURNO</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Sofía Almacén
              </span>
            </div>
          </div>
        </div>

        {/* Warehouse Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => setActiveTab('pending')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10'
                : 'glass-card-static border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Package size={20} className="text-amber-400" />
              <span className="text-xl sm:text-2xl font-mono font-black text-amber-400">
                {pendingOrders.length}
              </span>
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Por Alistar</div>
            <p className="text-[10px] text-neutral-400 mt-0.5">Pagados listos para empaque</p>
          </div>

          <div
            onClick={() => setActiveTab('preparing')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              activeTab === 'preparing'
                ? 'bg-blue-500/15 border-blue-500 shadow-lg shadow-blue-500/10'
                : 'glass-card-static border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="text-blue-400" />
              <span className="text-xl sm:text-2xl font-mono font-black text-blue-400">
                {preparingOrders.length}
              </span>
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">En Preparación</div>
            <p className="text-[10px] text-neutral-400 mt-0.5">Actualmente en empaquetado</p>
          </div>

          <div
            onClick={() => setActiveTab('ready')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              activeTab === 'ready'
                ? 'bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'glass-card-static border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
                {readyOrders.length}
              </span>
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Listos para Retiro</div>
            <p className="text-[10px] text-neutral-400 mt-0.5">Esperando al vendedor</p>
          </div>

          <div
            onClick={() => setActiveTab('picked_up')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              activeTab === 'picked_up'
                ? 'bg-purple-500/15 border-purple-500 shadow-lg shadow-purple-500/10'
                : 'glass-card-static border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Truck size={20} className="text-purple-400" />
              <span className="text-xl sm:text-2xl font-mono font-black text-purple-400">
                {handedOverOrders.length}
              </span>
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Traspasados</div>
            <p className="text-[10px] text-neutral-400 mt-0.5">Entregados a vendedor / ruta</p>
          </div>
        </div>

        {/* Filter bar and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'pending', label: `Por Alistar (${pendingOrders.length})` },
              { id: 'preparing', label: `En Preparación (${preparingOrders.length})` },
              { id: 'ready', label: `Listos (${readyOrders.length})` },
              { id: 'picked_up', label: `Entregados a Vendedor (${handedOverOrders.length})` },
              { id: 'all', label: `Todos (${orders.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-[#C8A961] text-black shadow-md'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por orden, cliente, dirección..."
              className="w-full bg-[#121218] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C8A961] transition"
            />
          </div>
        </div>

        {/* Orders List for Packing */}
        {filteredOrders.length === 0 ? (
          <div className="glass-card-static p-12 text-center rounded-2xl border border-white/[0.08] space-y-3">
            <Package size={48} className="mx-auto text-neutral-600" />
            <div className="text-base font-bold text-white">No hay pedidos en esta sección de almacén</div>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Cuando los clientes realicen compras o abonen por Simple QR, aparecerán aquí para su inspección física y empaque con precinto.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const isGiftUnlocked = !!order.free_gift;
              const costTotal = order.cost_subtotal || Math.round(order.total * 0.65);
              const retailTotal = order.total;
              const vendorProfit = Math.max(0, retailTotal - costTotal);

              return (
                <div
                  key={order.id}
                  className="glass-card-static p-5 rounded-2xl border border-white/[0.08] hover:border-[#C8A961]/35 transition-all space-y-4"
                >
                  {/* Order Card Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded-lg bg-[#C8A961]/15 border border-[#C8A961]/30 text-[#C8A961] font-mono text-xs font-bold">
                        #{order.id.toUpperCase()}
                      </div>

                      {/* Warehouse status badge */}
                      {order.warehouse_status === 'preparing' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Clock size={11} /> EN PREPARACIÓN
                        </span>
                      ) : order.warehouse_status === 'ready' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} /> ALISTADO / LISTO
                        </span>
                      ) : order.warehouse_status === 'picked_up' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Truck size={11} /> ENTREGADO A VENDEDOR
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Package size={11} /> POR ALISTAR
                        </span>
                      )}

                      {/* Delivery type indicator */}
                      <span className="text-[11px] font-mono text-neutral-400">
                        {order.delivery_type === 'pickup'
                          ? '🏬 Recojo en Tienda'
                          : order.delivery_type === 'national_shipping'
                          ? '🚌 Flota Interdepartamental'
                          : '🛵 Delivery Local Cochabamba'}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-neutral-400">
                      Fecha: {new Date(order.created_at).toLocaleString('es-BO')}
                    </div>
                  </div>

                  {/* Customer Information & Delivery PIN details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-neutral-400">DATOS DEL DESTINATARIO</div>
                      <div className="font-bold text-white text-sm">{order.customer_name || 'Cliente'}</div>
                      <div className="flex items-center gap-3 pt-1">
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="flex items-center gap-1 text-[#C8A961] hover:underline font-mono"
                        >
                          <Phone size={12} /> {order.customer_phone || 'Sin teléfono'}
                        </a>
                        {order.customer_phone && (
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-400 hover:underline font-mono"
                          >
                            <MessageCircle size={12} /> WhatsApp
                          </a>
                        )}
                      </div>
                      <div className="text-neutral-400 pt-1">
                        <strong>Dirección:</strong> {order.customer_address || 'Entrega en Base Central'}
                      </div>
                      {order.delivery_notes && (
                        <div className="text-amber-300/80 bg-amber-500/10 p-1.5 rounded text-[11px] mt-1">
                          <strong>Referencia:</strong> {order.delivery_notes}
                        </div>
                      )}
                    </div>

                    {/* Delivery Map PIN Card */}
                    <div className="p-3.5 rounded-xl bg-[#0A0A0E] border border-[#C8A961]/25 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-[#C8A961] font-bold flex items-center gap-1">
                            <MapPin size={12} /> UBICACIÓN DE ENTREGA EN MAPA
                          </span>
                          {order.delivery_lat && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                              PIN GPS CONFIRMADO
                            </span>
                          )}
                        </div>

                        {order.delivery_lat && order.delivery_lng ? (
                          <div className="space-y-1">
                            <div className="text-xs font-mono text-white flex items-center gap-1.5">
                              <Compass size={14} className="text-[#C8A961]" />
                              <span>Lat: {order.delivery_lat.toFixed(5)}, Lng: {order.delivery_lng.toFixed(5)}</span>
                            </div>
                            <p className="text-[11px] text-neutral-400">
                              {order.delivery_pin_address || order.customer_address}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-400">
                            Dirección de referencia escrita por el cliente para el vendedor.
                          </p>
                        )}
                      </div>

                      {/* Navigation buttons for delivery driver/vendor */}
                      {order.delivery_map_url && (
                        <div className="flex items-center gap-2 pt-3">
                          <a
                            href={order.delivery_map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white transition"
                          >
                            <ExternalLink size={12} /> Google Maps
                          </a>
                          {order.delivery_lat && order.delivery_lng && (
                            <a
                              href={`https://waze.com/ul?ll=${order.delivery_lat},${order.delivery_lng}&navigate=yes`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-mono text-cyan-400 transition"
                            >
                              <Truck size={12} /> Ruta Waze
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Picking Checklist (Products with Base Cost Price) */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-400 pb-1">
                      <span>CHECKLIST DE PRODUCTOS A ALISTAR</span>
                      <span>PRECIO BASE ALMACÉN (COSTO)</span>
                    </div>

                    <div className="space-y-2">
                      {order.items?.map((item, idx) => {
                        const prod = products.find(p => p.id === item.product_id);
                        const itemKey = `${order.id}-${item.product_id || idx}`;
                        const isChecked = checkedItems[itemKey] || order.warehouse_status === 'ready' || order.warehouse_status === 'picked_up';
                        const unitCost = prod?.cost_price !== undefined ? Number(prod.cost_price) : Math.round(item.unit_price * 0.65);
                        const subtotalCost = unitCost * item.quantity;
                        const imgSrc = (prod?.images && prod.images[0]) || '/products/prod-08-zephyr-boots.webp';

                        return (
                          <div
                            key={itemKey}
                            onClick={() => toggleItemCheck(itemKey)}
                            className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-950/20 border-emerald-500/30'
                                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Checkbox */}
                              <div
                                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition ${
                                  isChecked
                                    ? 'bg-emerald-500 border-emerald-500 text-black'
                                    : 'border-white/20 bg-black/40'
                                }`}
                              >
                                {isChecked && <CheckCircle2 size={14} strokeWidth={3} />}
                              </div>

                              {/* Product Thumbnail */}
                              <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden relative shrink-0">
                                <Image
                                  src={imgSrc}
                                  alt={prod?.name || 'Producto'}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>

                              <div>
                                <div className={`text-xs font-bold ${isChecked ? 'text-emerald-200 line-through opacity-80' : 'text-white'}`}>
                                  {prod?.name || 'Producto Táctico'}
                                </div>
                                <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                                  Cantidad requerida: <strong className="text-[#C8A961]">{item.quantity} ud(s)</strong>
                                </div>
                              </div>
                            </div>

                            {/* Base Price Readout */}
                            <div className="text-right font-mono">
                              <div className="text-xs font-black text-amber-400">
                                Bs. {subtotalCost.toFixed(2)}
                              </div>
                              <span className="text-[10px] text-neutral-500 block">
                                Base: Bs. {unitCost.toFixed(2)} c/u
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gift Souvenir Alert */}
                  {isGiftUnlocked && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#C8A961]/15 to-transparent border border-[#C8A961]/40 flex items-center gap-3 text-xs">
                      <Gift size={20} className="text-[#C8A961] shrink-0 animate-bounce" />
                      <div>
                        <span className="font-extrabold text-[#C8A961] block">
                          🎁 REGALO TÁCTICO SORPRESA (PAGO 100% CONFIRMADO)
                        </span>
                        <span className="text-neutral-300 text-[11px]">
                          Empacar el souvenir exclusivo de regalo con precinto dentro de este paquete.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Financial Settlement & Handover Bar */}
                  <div className="p-4 rounded-xl bg-[#030305] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">PRECIO BASE ALMACÉN</span>
                        <span className="text-base font-black text-amber-400">Bs. {costTotal.toFixed(2)}</span>
                      </div>
                      <div className="h-6 w-px bg-white/10" />
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">PRECIO VENTA CLIENTE</span>
                        <span className="text-base font-black text-white">Bs. {retailTotal.toFixed(2)}</span>
                      </div>
                      <div className="h-6 w-px bg-white/10" />
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">GANANCIA VENDEDOR</span>
                        <span className="text-base font-black text-emerald-400">+Bs. {vendorProfit.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Workflow Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {order.warehouse_status === 'pending' || !order.warehouse_status ? (
                        <button
                          onClick={() => warehouseStartPreparing(order.id, 'Sofía Almacén')}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                        >
                          <Clock size={14} /> COMENZAR A ALISTAR
                        </button>
                      ) : order.warehouse_status === 'preparing' ? (
                        <button
                          onClick={() => warehouseMarkReady(order.id)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#C8A961] hover:bg-[#b59855] text-black font-mono font-black text-xs transition shadow-md flex items-center justify-center gap-2"
                        >
                          <ShieldCheck size={16} /> EMPACADO Y LISTO
                        </button>
                      ) : order.warehouse_status === 'ready' ? (
                        <button
                          onClick={() => warehouseHandoverToVendor(order.id, 'vendor-01')}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs transition shadow-md flex items-center justify-center gap-2"
                        >
                          <Truck size={16} /> TRASPASAR A VENDEDOR CARLOS
                        </button>
                      ) : (
                        <span className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> ENTREGADO A VENDEDOR
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
