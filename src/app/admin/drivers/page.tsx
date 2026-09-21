'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { demoDrivers } from '@/lib/demo-data';
import {
  Truck,
  DollarSign,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Ban,
  Wallet,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDriversPage() {
  const { orders, driverEarnings, isDriverAvailable, settleDriverEarnings } = useStore();
  const [selectedDriverId, setSelectedDriverId] = useState<string>('vendor-01');

  // Stats calculation
  const pendingEarnings = driverEarnings
    .filter(e => e.status === 'pending')
    .reduce((acc, e) => acc + Number(e.amount), 0);

  const totalPaidOut = driverEarnings
    .filter(e => e.status === 'paid')
    .reduce((acc, e) => acc + Number(e.amount), 0);

  const completedDeliveries = orders.filter(o => o.status === 'delivered');

  const handleSettleAll = () => {
    const pending = driverEarnings.filter(e => e.status === 'pending');
    if (pending.length === 0) {
      toast.info('No hay comisiones pendientes de liquidación');
      return;
    }

    pending.forEach(e => {
      settleDriverEarnings(e.id);
    });

    toast.success(`¡Se liquidaron ${pending.length} comisiones pendientes con éxito!`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#C8A961] uppercase block mb-1">
            GESTIÓN DE FLOTA // REPARTIDORES
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Repartidores & Liquidación de Comisiones
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Supervisa el desempeño del personal de entrega, liquida pagos y monitorea calificaciones.
          </p>
        </div>

        {pendingEarnings > 0 && (
          <button
            onClick={handleSettleAll}
            className="btn-tactical text-xs px-4 py-2.5 flex items-center gap-2 shadow-lg shadow-[#C8A961]/20"
          >
            <Wallet size={16} /> Liquidar Saldo Total (Bs. {pendingEarnings.toFixed(2)})
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card-static p-5 border border-[#C8A961]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-neutral-400">Total Pendiente Por Pagar</span>
            <div className="w-8 h-8 rounded-lg bg-[#C8A961]/10 flex items-center justify-center text-[#C8A961]">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-[#C8A961]">
            Bs. {pendingEarnings.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Saldo acumulado por repartidores a liquidar
          </span>
        </div>

        <div className="glass-card-static p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-neutral-400">Comisiones Pagadas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-emerald-400">
            Bs. {totalPaidOut.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Total histórico liquidado
          </span>
        </div>

        <div className="glass-card-static p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-neutral-400">Envíos Completados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Truck size={16} />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-white">
            {completedDeliveries.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Entregas puerta a puerta exitosas
          </span>
        </div>
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Drivers */}
        <div className="lg:col-span-2 glass-card-static border border-white/[0.06] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#C8A961]">
              DIRECTORIO DE REPARTIDORES ACTIVOS
            </h2>
            <span className="text-xs text-neutral-500">{demoDrivers.length} Conductores</span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-tactical w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-neutral-400 uppercase font-mono">
                  <th className="py-3 px-4">Conductor</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Entregas</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Por Liquidar</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {demoDrivers.map(driver => {
                  const driverDelivered = orders.filter(
                    o => o.status === 'delivered' && (o.driver_id === driver.id || driver.id === 'vendor-01')
                  );
                  const driverPending = driverEarnings
                    .filter(e => e.status === 'pending' && (e.driver_id === driver.id || driver.id === 'vendor-01'))
                    .reduce((acc, e) => acc + Number(e.amount), 0);

                  const isAvailable = driver.id === 'vendor-01' ? isDriverAvailable : true;

                  return (
                    <tr
                      key={driver.id}
                      onClick={() => setSelectedDriverId(driver.id)}
                      className={`hover:bg-white/[0.02] cursor-pointer transition ${
                        selectedDriverId === driver.id ? 'bg-[#C8A961]/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#C8A961]/10 flex items-center justify-center text-[#C8A961] font-bold">
                            {driver.full_name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{driver.full_name}</div>
                            <div className="text-neutral-500 text-[11px]">{driver.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            isAvailable
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {isAvailable ? 'Disponible' : 'Descanso'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {driverDelivered.length}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                          <Star size={12} fill="currentColor" /> 4.9
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#C8A961]">
                        Bs. {driverPending.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {driverPending > 0 ? (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleSettleAll();
                            }}
                            className="px-2.5 py-1 rounded bg-[#C8A961]/20 hover:bg-[#C8A961]/30 text-[#C8A961] font-mono text-[10px] font-bold transition"
                          >
                            PAGAR
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-500">Al día</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Individual Driver Earnings Breakdown */}
        <div className="glass-card-static p-5 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#C8A961]">
              HISTORIAL DE COMISIONES
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">POR CONDUCTOR</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {driverEarnings.map(earning => (
              <div
                key={earning.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-mono font-semibold text-white">
                    Orden #{earning.order_id.split('-')[1] || earning.order_id}
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {new Date(earning.created_at).toLocaleDateString('es-BO')} ·{' '}
                    <span
                      className={
                        earning.status === 'paid' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'
                      }
                    >
                      {earning.status === 'paid' ? 'PAGADA' : 'PENDIENTE'}
                    </span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-[#C8A961] text-sm">
                    +${Number(earning.amount).toFixed(2)}
                  </span>
                  {earning.status === 'pending' && (
                    <button
                      onClick={() => settleDriverEarnings(earning.id)}
                      className="block mt-1 text-[10px] text-[#C8A961] hover:underline"
                    >
                      Liquidar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
