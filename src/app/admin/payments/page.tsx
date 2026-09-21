'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { demoPayments, demoOrders } from '@/lib/demo-data';
import { CreditCard, Clock, CheckCircle2, XCircle, QrCode, Send, Eye, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentStatus, PaymentVerification } from '@/lib/types';

const statusConfig: Record<PaymentStatus, { label: string; badge: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', badge: 'badge-pending', icon: Clock },
  verified: { label: 'Verificado', badge: 'badge-verified', icon: CheckCircle2 },
  failed: { label: 'Fallido', badge: 'badge-failed', icon: XCircle },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentVerification[]>(demoPayments);
  const [selectedReceipt, setSelectedReceipt] = useState<{ id: string; url: string; orderId: string } | null>(null);

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const verifiedCount = payments.filter(p => p.status === 'verified').length;

  const getTimeBetween = (start: string, end: string | null) => {
    if (!end) return '—';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const handleVerify = (paymentId: string, orderId: string) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'verified',
            verified_at: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    toast.success(`Pago de orden ${orderId.toUpperCase()} verificado con éxito`, {
      description: 'Estado sincronizado con Supabase y notificaciones activas.',
    });
  };

  const handleResendPush = (orderId: string) => {
    toast.info(`Notificación push reenviada al vendor para orden ${orderId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-xl font-bold text-white">Pagos & Verificaciones QR</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-blue-ops" />
            <span className="text-xs text-tactical-500">Total pagos</span>
          </div>
          <div className="text-xl font-bold text-white">{payments.length}</div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-accent" />
            <span className="text-xs text-tactical-500">Pendientes</span>
          </div>
          <div className="text-xl font-bold text-amber-accent">{pendingCount}</div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-tactical" />
            <span className="text-xs text-tactical-500">Verificados</span>
          </div>
          <div className="text-xl font-bold text-green-tactical">{verifiedCount}</div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <QrCode size={16} className="text-purple-400" />
            <span className="text-xs text-tactical-500">Tasa éxito</span>
          </div>
          <div className="text-xl font-bold text-white">
            {((verifiedCount / Math.max(payments.length, 1)) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-tactical">
            <thead>
              <tr>
                <th>Orden</th>
                <th>QR Session</th>
                <th>Estado</th>
                <th>Monto</th>
                <th>Comprobante (ImgBB)</th>
                <th>Tiempo verificación</th>
                <th>Notificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => {
                const order = demoOrders.find(o => o.id === payment.order_id);
                const config = statusConfig[payment.status];
                // Demo receipt URL fallback (ImgBB / Unsplash voucher)
                const receiptImgUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60';

                return (
                  <tr key={payment.id}>
                    <td>
                      <span className="font-mono text-sm font-semibold text-tactical-200">
                        {payment.order_id.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-[11px] text-tactical-500">
                        {payment.qr_session_id.substring(0, 8)}...
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${config.badge}`}>{config.label}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-white">${order?.total.toFixed(2) || '—'}</span>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          setSelectedReceipt({
                            id: payment.id,
                            url: receiptImgUrl,
                            orderId: payment.order_id,
                          })
                        }
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-tactical-300 border border-white/[0.08] transition"
                      >
                        <Eye size={12} className="text-amber-accent" /> Ver comprobante
                      </button>
                    </td>
                    <td className="text-xs text-tactical-400">
                      {payment.status === 'verified' ? (
                        getTimeBetween(payment.created_at, payment.verified_at)
                      ) : payment.status === 'pending' ? (
                        <span className="text-amber-accent font-medium">Esperando revisión...</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {payment.notification_sent_at ? (
                        <span className="badge badge-delivered text-[10px]">Enviada</span>
                      ) : payment.notification_error ? (
                        <span className="badge badge-failed text-[10px]">Error</span>
                      ) : (
                        <span className="text-tactical-600 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {payment.status === 'pending' && (
                          <button
                            className="btn-tactical text-[11px] px-2.5 py-1"
                            onClick={() => handleVerify(payment.id, payment.order_id)}
                          >
                            Verificar
                          </button>
                        )}
                        <button
                          className="p-1.5 rounded-lg hover:bg-white/[0.05]"
                          onClick={() => handleResendPush(payment.order_id)}
                          title="Reenviar push al vendor"
                        >
                          <Send size={13} className="text-tactical-400 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ver Comprobante */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card-static w-full max-w-md p-5 relative border border-white/[0.1] shadow-2xl">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 text-tactical-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Comprobante de Pago — Orden {selectedReceipt.orderId.toUpperCase()}
            </h3>
            <p className="text-xs text-tactical-400 mb-4">
              Imagen verificada y alojada en ImgBB
            </p>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/[0.1] bg-tactical-950 mb-4">
              <Image
                src={selectedReceipt.url}
                alt="Comprobante de transferencia"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
              <a
                href={selectedReceipt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs flex items-center gap-1.5"
              >
                <ExternalLink size={14} /> Abrir original
              </a>
              <button
                type="button"
                onClick={() => {
                  handleVerify(selectedReceipt.id, selectedReceipt.orderId);
                  setSelectedReceipt(null);
                }}
                className="btn-tactical text-xs"
              >
                Aprobar y Verificar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

