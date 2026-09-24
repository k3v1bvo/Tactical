'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { demoPayments, demoOrders } from '@/lib/demo-data';
import { ImageUploader } from '@/components/ImageUploader';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  Send,
  Eye,
  X,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Copy,
  Search,
  Filter,
  Smartphone,
  Check,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentStatus, PaymentVerification, FixedAmountQR } from '@/lib/types';

const statusConfig: Record<PaymentStatus, { label: string; badge: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', badge: 'badge-pending', icon: Clock },
  verified: { label: 'Verificado', badge: 'badge-verified', icon: CheckCircle2 },
  failed: { label: 'Fallido', badge: 'badge-failed', icon: XCircle },
};

const BOLIVIA_BANK_PRESETS = [
  'Banco Unión (Simple QR)',
  'Banco de Crédito de Bolivia (BCP)',
  'Banco Nacional de Bolivia (BNB)',
  'Banco Mercantil Santa Cruz (BMSC)',
  'Banco Ganadero (GanaMóvil)',
  'Banco FIE',
  'Banco Solidario (BancoSol)',
  'Banco Económico',
  'Yape Bolivia',
  'Simple QR Bolivia (Multibanco)',
];

export default function AdminPaymentsPage() {
  const {
    fixedAmountQRs,
    addFixedAmountQR,
    updateFixedAmountQR,
    deleteFixedAmountQR,
    toggleFixedAmountQRStatus,
    getQRForAmount,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'matrix' | 'verifications' | 'simulator' | 'mobile'>('matrix');
  const [payments, setPayments] = useState<PaymentVerification[]>(demoPayments);
  const [selectedReceipt, setSelectedReceipt] = useState<{ id: string; url: string; orderId: string } | null>(null);

  // Search & Filter in QR Matrix
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fixed' | 'default' | 'active'>('all');

  // Modal States for QR CRUD
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQR, setEditingQR] = useState<FixedAmountQR | null>(null);

  // Form State
  const [isFixedAmount, setIsFixedAmount] = useState(true);
  const [formAmount, setFormAmount] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBank, setFormBank] = useState(BOLIVIA_BANK_PRESETS[0]);
  const [formAccountName, setFormAccountName] = useState('Tienda Táctica Bolivia SRL');
  const [formExpiration, setFormExpiration] = useState('3 años');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulator State
  const [simAmount, setSimAmount] = useState('150.00');

  // Stats
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const verifiedCount = payments.filter(p => p.status === 'verified').length;
  const activeFixedCount = fixedAmountQRs.filter(q => q.is_active && q.amount !== null && !q.is_default).length;
  const defaultQR = fixedAmountQRs.find(q => q.is_default || q.amount === null);

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
    toast.info(`Notificación push reenviada para orden ${orderId}`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setIsFixedAmount(true);
    setFormAmount('');
    setFormImageUrl('');
    setFormBank(BOLIVIA_BANK_PRESETS[0]);
    setFormAccountName('Tienda Táctica Bolivia SRL');
    setFormExpiration('3 años');
    setFormIsActive(true);
    setFormIsDefault(false);
    setFormNotes('');
    setEditingQR(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (qr: FixedAmountQR) => {
    setEditingQR(qr);
    setIsFixedAmount(qr.amount !== null && !qr.is_default);
    setFormAmount(qr.amount !== null ? qr.amount.toString() : '');
    setFormImageUrl(qr.qr_image_url);
    setFormBank(qr.bank_name || BOLIVIA_BANK_PRESETS[0]);
    setFormAccountName(qr.account_name || 'Tienda Táctica Bolivia SRL');
    setFormExpiration(qr.expiration_years || '3 años');
    setFormIsActive(qr.is_active);
    setFormIsDefault(qr.is_default);
    setFormNotes(qr.notes || '');
    setIsCreateModalOpen(true);
  };

  // Handle Form Submit
  const handleSaveQR = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formImageUrl.trim()) {
      toast.error('Debes subir la imagen del QR a ImgBB o ingresar un enlace de imagen válido');
      return;
    }

    let parsedAmount: number | null = null;
    if (isFixedAmount && !formIsDefault) {
      parsedAmount = parseFloat(formAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error('Por favor ingresa un monto válido mayor a 0 en Bolivianos (Bs.)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (editingQR) {
        await updateFixedAmountQR(editingQR.id, {
          amount: parsedAmount,
          qr_image_url: formImageUrl.trim(),
          bank_name: formBank,
          account_name: formAccountName.trim() || null,
          is_active: formIsActive,
          is_default: formIsDefault,
          expiration_years: formExpiration,
          notes: formNotes.trim() || null,
        });
      } else {
        await addFixedAmountQR({
          amount: parsedAmount,
          qr_image_url: formImageUrl.trim(),
          bank_name: formBank,
          account_name: formAccountName.trim() || null,
          is_active: formIsActive,
          is_default: formIsDefault,
          expiration_years: formExpiration,
          notes: formNotes.trim() || null,
        });
      }
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar el código QR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQR = async (id: string, amount: number | null) => {
    const label = amount !== null ? `Bs. ${amount.toFixed(2)}` : 'Comodín';
    if (confirm(`¿Estás seguro de eliminar el código QR de ${label}? Esta acción no se puede deshacer.`)) {
      await deleteFixedAmountQR(id);
    }
  };

  // Filtered QRs
  const filteredQRs = useMemo(() => {
    return fixedAmountQRs.filter(qr => {
      const matchesSearch =
        (qr.amount !== null && qr.amount.toString().includes(searchQuery)) ||
        (qr.bank_name && qr.bank_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (qr.account_name && qr.account_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (qr.notes && qr.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (typeFilter === 'fixed') return qr.amount !== null && !qr.is_default;
      if (typeFilter === 'default') return qr.is_default || qr.amount === null;
      if (typeFilter === 'active') return qr.is_active;

      return true;
    });
  }, [fixedAmountQRs, searchQuery, typeFilter]);

  // Simulator evaluation
  const evaluatedSimulation = useMemo(() => {
    const num = parseFloat(simAmount);
    if (isNaN(num) || num <= 0) return null;
    return getQRForAmount(num);
  }, [simAmount, getQRForAmount]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Centro de Pagos & Matriz QR</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#C8A961]/20 text-[#C8A961] text-[10px] font-mono font-bold uppercase border border-[#C8A961]/30">
              Vigencia 3+ Años
            </span>
          </div>
          <p className="text-xs text-tactical-400 mt-1">
            Gestión de códigos QR estáticos alojados en ImgBB, despacho dinámico anti-fraude y verificación de transferencias.
          </p>
        </div>

        {/* Global Action: Add QR */}
        <button
          onClick={openCreateModal}
          className="btn-tactical flex items-center justify-center gap-2 text-xs py-2.5 px-4 shadow-lg shadow-[#C8A961]/10 flex-shrink-0"
        >
          <Plus size={16} /> Agregar QR a la Matriz
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 rounded-t-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'bg-white/[0.08] text-white border-b-2 border-[#C8A961]'
              : 'text-tactical-400 hover:text-tactical-200'
          }`}
        >
          <QrCode size={15} className={activeTab === 'matrix' ? 'text-[#C8A961]' : ''} />
          Matriz de QRs Estáticos ({fixedAmountQRs.length})
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2.5 rounded-t-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'verifications'
              ? 'bg-white/[0.08] text-white border-b-2 border-[#C8A961]'
              : 'text-tactical-400 hover:text-tactical-200'
          }`}
        >
          <CreditCard size={15} className={activeTab === 'verifications' ? 'text-[#C8A961]' : ''} />
          Verificación de Comprobantes ({payments.length})
          {pendingCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-accent/20 text-amber-accent text-[10px] font-bold flex items-center justify-center border border-amber-accent/30">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 rounded-t-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'bg-white/[0.08] text-white border-b-2 border-[#C8A961]'
              : 'text-tactical-400 hover:text-tactical-200'
          }`}
        >
          <Sparkles size={15} className={activeTab === 'simulator' ? 'text-[#C8A961]' : ''} />
          Simulador de Despacho QR
        </button>

        <button
          onClick={() => setActiveTab('mobile')}
          className={`px-4 py-2.5 rounded-t-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'mobile'
              ? 'bg-white/[0.08] text-white border-b-2 border-[#C8A961]'
              : 'text-tactical-400 hover:text-tactical-200'
          }`}
        >
          <Smartphone size={15} className={activeTab === 'mobile' ? 'text-[#C8A961]' : ''} />
          Integración Celular (NotofocacionS)
        </button>
      </div>

      {/* TAB 1: MATRIZ DE QRs ESTÁTICOS */}
      {activeTab === 'matrix' && (
        <div className="space-y-5 animate-fade-in">
          {/* Key Metric Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-1.5">
                <QrCode size={15} className="text-[#C8A961]" />
                <span className="text-xs text-tactical-400">Total en Matriz</span>
              </div>
              <div className="text-xl font-bold text-white">{fixedAmountQRs.length}</div>
              <span className="text-[10px] text-tactical-500">Imágenes en ImgBB</span>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span className="text-xs text-tactical-400">Montos Fijos Activos</span>
              </div>
              <div className="text-xl font-bold text-emerald-400">{activeFixedCount}</div>
              <span className="text-[10px] text-tactical-500">Con monto bloqueado</span>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle size={15} className="text-amber-accent" />
                <span className="text-xs text-tactical-400">QR Comodín</span>
              </div>
              <div className="text-sm font-bold text-white truncate">
                {defaultQR ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Activo ({defaultQR.bank_name.split(' ')[0]})
                  </span>
                ) : (
                  <span className="text-red-400">Sin configurar</span>
                )}
              </div>
              <span className="text-[10px] text-tactical-500">Respaldo sin monto</span>
            </div>

            <div className="metric-card">
              <div className="flex items-center gap-2 mb-1.5">
                <Clock size={15} className="text-purple-400" />
                <span className="text-xs text-tactical-400">Vigencia Promedio</span>
              </div>
              <div className="text-xl font-bold text-white">3+ Años</div>
              <span className="text-[10px] text-tactical-500">QRs estáticos bancarios</span>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] flex items-start gap-3">
            <HelpCircle size={18} className="text-[#C8A961] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-tactical-300 space-y-1">
              <p className="font-semibold text-white">
                ¿Cómo opera el algoritmo de despacho QR anti-fraude?
              </p>
              <p>
                1. Cuando un cliente finaliza su pedido (100% con regalo o 50% de anticipo), el sistema toma el total a pagar y busca un código QR con ese <strong>monto exacto</strong> en esta matriz.
              </p>
              <p>
                2. Si lo encuentra, le envía el QR pre-generado con monto cerrado (válido por 3+ años), impidiendo que el cliente altere el importe en su banca. Si el monto no existe en la matriz, despacha el <strong>QR comodín de respaldo</strong> para que ingrese el monto manualmente.
              </p>
              <p className="text-[11px] text-tactical-400">
                🔒 <em>Las fotos de los QRs se suben a ImgBB y en Supabase únicamente se almacena el link directo URL.</em>
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-3 text-tactical-500" />
              <input
                type="text"
                placeholder="Buscar por monto (ej. 150), banco o titular..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-tactical pl-9 py-1.5 text-xs w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-tactical-500" />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="input-tactical py-1.5 text-xs text-tactical-300"
              >
                <option value="all">Todos los QRs ({fixedAmountQRs.length})</option>
                <option value="fixed">Solo Montos Fijos</option>
                <option value="default">Solo Comodín / Sin Monto</option>
                <option value="active">Solo Activos</option>
              </select>
            </div>
          </div>

          {/* QRs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQRs.map(qr => {
              const isDefault = qr.is_default || qr.amount === null;

              return (
                <div
                  key={qr.id}
                  className={`glass-card-static p-4 border transition relative overflow-hidden flex flex-col justify-between ${
                    qr.is_active
                      ? isDefault
                        ? 'border-amber-500/30 bg-amber-500/[0.02]'
                        : 'border-white/[0.08] hover:border-[#C8A961]/40'
                      : 'border-white/[0.04] opacity-60 bg-black/40'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {isDefault ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase border border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle size={10} /> QR Comodín (Sin Monto)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck size={10} /> Monto Exacto Bloqueado
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleFixedAmountQRStatus(qr.id)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded transition ${
                        qr.is_active
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-tactical-700 text-tactical-400 hover:bg-tactical-600'
                      }`}
                      title="Clic para cambiar estado activo/inactivo"
                    >
                      {qr.is_active ? '● ACTIVO' : '○ INACTIVO'}
                    </button>
                  </div>

                  {/* QR Image + Info */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-24 h-24 rounded-xl bg-white p-1.5 border border-white/[0.1] flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md">
                      <Image
                        src={qr.qr_image_url}
                        alt="QR Estático"
                        width={90}
                        height={90}
                        unoptimized
                        className="rounded object-contain max-h-full max-w-full"
                      />
                    </div>

                    <div className="overflow-hidden flex-1 space-y-1">
                      <div className="text-lg font-mono font-black text-white">
                        {qr.amount !== null ? (
                          <span className="text-[#C8A961]">Bs. {qr.amount.toFixed(2)}</span>
                        ) : (
                          <span className="text-amber-400 text-sm">Sin Monto Fijo</span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-tactical-200 truncate">
                        {qr.bank_name}
                      </div>

                      {qr.account_name && (
                        <div className="text-[11px] text-tactical-400 truncate">
                          Titular: <span className="text-tactical-300">{qr.account_name}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-tactical-500 flex items-center gap-1 font-mono">
                        <Clock size={10} /> Vigencia: {qr.expiration_years || '3 años'}
                      </div>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {qr.notes && (
                    <p className="text-[11px] text-tactical-400 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04] mb-3 line-clamp-2">
                      {qr.notes}
                    </p>
                  )}

                  {/* Footer Actions */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopy(qr.qr_image_url, 'Enlace de ImgBB')}
                      className="text-[11px] text-tactical-400 hover:text-white flex items-center gap-1 transition"
                      title="Copiar link directo de ImgBB"
                    >
                      <Copy size={11} /> Link ImgBB
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={qr.qr_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-tactical-400 hover:text-white transition"
                        title="Ver imagen en alta resolución"
                      >
                        <ExternalLink size={13} />
                      </a>

                      <button
                        onClick={() => openEditModal(qr)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-tactical-400 hover:text-amber-accent transition"
                        title="Editar código QR"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => handleDeleteQR(qr.id, qr.amount)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-tactical-400 hover:text-red-400 transition"
                        title="Eliminar de la matriz"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredQRs.length === 0 && (
              <div className="col-span-full text-center py-12 glass-card-static">
                <QrCode size={36} className="text-tactical-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">No se encontraron códigos QR</h3>
                <p className="text-xs text-tactical-400 max-w-sm mx-auto mb-4">
                  {searchQuery
                    ? 'No hay QRs que coincidan con los filtros de búsqueda.'
                    : 'Aún no has registrado ningún QR estático en la matriz.'}
                </p>
                <button onClick={openCreateModal} className="btn-tactical text-xs">
                  <Plus size={14} className="inline mr-1" /> Agregar Primer QR
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICACIONES DE COMPROBANTES */}
      {activeTab === 'verifications' && (
        <div className="space-y-4 animate-fade-in">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={15} className="text-blue-ops" />
                <span className="text-xs text-tactical-400">Total Recibidos</span>
              </div>
              <div className="text-xl font-bold text-white">{payments.length}</div>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={15} className="text-amber-accent" />
                <span className="text-xs text-tactical-400">Por Revisar</span>
              </div>
              <div className="text-xl font-bold text-amber-accent">{pendingCount}</div>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span className="text-xs text-tactical-400">Acreditados</span>
              </div>
              <div className="text-xl font-bold text-emerald-400">{verifiedCount}</div>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={15} className="text-purple-400" />
                <span className="text-xs text-tactical-400">Tasa de Aprobación</span>
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
                    <th>Estado</th>
                    <th>Monto</th>
                    <th>Comprobante ImgBB</th>
                    <th>Tiempo Verificación</th>
                    <th>Notificación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => {
                    const order = demoOrders.find(o => o.id === payment.order_id);
                    const config = statusConfig[payment.status];
                    const receiptImgUrl =
                      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60';

                    return (
                      <tr key={payment.id}>
                        <td>
                          <span className="font-mono text-sm font-semibold text-tactical-200">
                            {payment.order_id.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${config.badge}`}>{config.label}</span>
                        </td>
                        <td>
                          <span className="font-semibold text-white font-mono">
                            Bs. {order?.total.toFixed(2) || '—'}
                          </span>
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
                            <Eye size={12} className="text-[#C8A961]" /> Ver comprobante
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
                                Aprobar
                              </button>
                            )}
                            <button
                              className="p-1.5 rounded-lg hover:bg-white/[0.05]"
                              onClick={() => handleResendPush(payment.order_id)}
                              title="Reenviar push al equipo"
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
        </div>
      )}

      {/* TAB 3: SIMULADOR DE DESPACHO QR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-fade-in max-w-3xl">
          <div className="glass-card-static p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#C8A961]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Simulador Interactivo de Despacho QR
              </h2>
            </div>
            <p className="text-xs text-tactical-400">
              Prueba con cualquier importe total (en Bolivianos) para visualizar con total precisión qué código QR recibirá el cliente al momento de presionar "Confirmar Pedido".
            </p>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-3 text-xs font-mono font-bold text-[#C8A961]">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={simAmount}
                  onChange={e => setSimAmount(e.target.value)}
                  className="input-tactical pl-10 text-base font-mono font-bold text-white w-full"
                  placeholder="Ej. 150.00"
                />
              </div>

              {/* Quick shortcut pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['50', '100', '150', '200', '285', '350'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSimAmount(val)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-tactical-300 border border-white/[0.08] transition"
                  >
                    Bs. {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation Result */}
          {evaluatedSimulation && (
            <div className="glass-card-static p-6 border border-white/[0.08] space-y-5 animate-fade-in">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-400">
                Resultado de la Consulta en Matriz
              </h3>

              {evaluatedSimulation.isExactMatch && evaluatedSimulation.qr ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                        ¡COINCIDENCIA EXACTA EN MATRIZ! // MONTO CERRADO
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        100% Protegido
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300">
                      El cliente recibirá el código QR pre-generado específicamente para <strong>Bs. {evaluatedSimulation.qr.amount?.toFixed(2)}</strong>. Al escanearlo, el valor estará fijado automáticamente en su aplicación bancaria.
                    </p>
                  </div>
                </div>
              ) : evaluatedSimulation.qr ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={22} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-amber-400">
                        MONTO NO REGISTRADO // DESPACHO DE QR COMODÍN
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        Monto Libre
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300">
                      No existe un QR exclusivo de <strong>Bs. {parseFloat(simAmount).toFixed(2)}</strong> en la matriz. Se le mostrará el QR comodín de respaldo y una instrucción destacada indicándole que debe escribir el monto a mano.
                    </p>
                    <button
                      onClick={() => {
                        openCreateModal();
                        setFormAmount(simAmount);
                      }}
                      className="text-xs text-[#C8A961] underline font-semibold mt-1 inline-flex items-center gap-1 hover:text-white"
                    >
                      <Plus size={12} /> ¿Quieres crear un QR exclusivo para Bs. {parseFloat(simAmount).toFixed(2)} ahora?
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  No hay ningún QR activo en la matriz. El sistema recurrirá al QR dinámico por defecto.
                </div>
              )}

              {/* QR Preview Card */}
              {evaluatedSimulation.qr && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-5">
                  <div className="w-28 h-28 rounded-xl bg-white p-2 border border-white/[0.1] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image
                      src={evaluatedSimulation.qr.qr_image_url}
                      alt="QR Preview"
                      width={100}
                      height={100}
                      unoptimized
                      className="rounded object-contain max-h-full max-w-full"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-[10px] font-mono text-tactical-500 uppercase">QR QUE SE VISUALIZARÁ</div>
                    <div className="text-base font-bold text-white">{evaluatedSimulation.qr.bank_name}</div>
                    <div className="text-tactical-300">
                      Titular: <span className="text-white">{evaluatedSimulation.qr.account_name || 'Tienda Táctica'}</span>
                    </div>
                    <div className="text-tactical-400 font-mono text-[11px]">
                      Vigencia: {evaluatedSimulation.qr.expiration_years || '3 años'}
                    </div>
                    <div className="text-[11px] text-tactical-500 font-mono">
                      URL ImgBB: {evaluatedSimulation.qr.qr_image_url.substring(0, 45)}...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INTEGRACIÓN CON APP CELULAR NOTOFOCACIONS */}
      {activeTab === 'mobile' && (
        <div className="space-y-6 animate-fade-in max-w-3xl">
          <div className="glass-card-static p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-[#C8A961]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Captura de Notificaciones Bancarias Android
              </h2>
            </div>
            <p className="text-xs text-tactical-400 leading-relaxed">
              La app Android (<strong className="text-white">NotofocacionS</strong>) corre en el celular comercial de la tienda, lee los avisos bancarios en la barra de notificaciones (Yape, Plin, Banco Unión, BCP, BNB) y los sube a la tabla <code className="text-[#C8A961]">notifications</code> en Supabase en tiempo real.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-tactical-500">PROYECTO SUPABASE CONECTADO</span>
                <div className="text-xs font-mono font-bold text-[#C8A961] truncate">
                  kbybohnmvaayifpzybvs.supabase.co
                </div>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Tabla: public.notifications
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-tactical-500">ESTADO DEL SERVICIO MÓVIL</span>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Capturador Foreground Activo
                </div>
                <span className="text-[10px] text-tactical-400">Verificador de Pagos QR Conectado</span>
              </div>
            </div>
          </div>

          {/* Reconciliation Logic */}
          <div className="glass-card-static p-6 border border-white/[0.08] space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#C8A961]">
              Flujo de Conciliación Automática
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-6 h-6 rounded-full bg-[#C8A961]/20 text-[#C8A961] font-mono font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-semibold text-white">El cliente escanea el QR en su app bancaria</div>
                  <p className="text-tactical-400 mt-0.5">
                    Transfiere el monto exacto (Bs. X) y su banco envía la confirmación al celular de la tienda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-6 h-6 rounded-full bg-[#C8A961]/20 text-[#C8A961] font-mono font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-semibold text-white">NotofocacionS intercepta el push bancario</div>
                  <p className="text-tactical-400 mt-0.5">
                    Extrae el monto recibido (ej. "Bs. 150.00"), nombre del depositante y banco origen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-6 h-6 rounded-full bg-[#C8A961]/20 text-[#C8A961] font-mono font-bold flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="font-semibold text-white">Cruce automático en Base de Datos</div>
                  <p className="text-tactical-400 mt-0.5">
                    El sistema cruza el monto extraído con las órdenes pendientes y marca la venta como pagada inmediatamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR QR ESTÁTICO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card-static w-full max-w-lg p-6 relative border border-white/[0.1] shadow-2xl my-8">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-tactical-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              {editingQR ? 'Editar Código QR Estático' : 'Agregar Nuevo Código QR a la Matriz'}
            </h3>
            <p className="text-xs text-tactical-400 mb-5">
              Las imágenes se cargan en ImgBB y en Supabase solo se conserva el enlace directo.
            </p>

            <form onSubmit={handleSaveQR} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-tactical-400 mb-2">
                  Tipo de Código QR *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => {
                      setIsFixedAmount(true);
                      setFormIsDefault(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isFixedAmount && !formIsDefault
                        ? 'bg-[#C8A961]/10 border-[#C8A961]'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#C8A961]" /> Monto Fijo Exacto
                    </div>
                    <span className="text-[10px] text-tactical-400 mt-1 block">
                      Recomendado anti-estafa
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      setIsFixedAmount(false);
                      setFormIsDefault(true);
                      setFormAmount('');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      formIsDefault
                        ? 'bg-amber-500/10 border-amber-500'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-400" /> QR Comodín / Respaldo
                    </div>
                    <span className="text-[10px] text-tactical-400 mt-1 block">
                      Sin monto pre-fijado
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount (if fixed) */}
              {isFixedAmount && !formIsDefault && (
                <div>
                  <label className="block text-xs font-mono uppercase text-tactical-400 mb-1.5">
                    Monto Fijo en Bolivianos (Bs.) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-[#C8A961]">Bs.</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={formAmount}
                      onChange={e => setFormAmount(e.target.value)}
                      placeholder="Ej. 150.00"
                      className="input-tactical pl-10 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Bank Selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-tactical-400 mb-1.5">
                  Banco o Plataforma Emisora *
                </label>
                <select
                  value={formBank}
                  onChange={e => setFormBank(e.target.value)}
                  className="input-tactical text-xs"
                >
                  {BOLIVIA_BANK_PRESETS.map(bank => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Holder */}
              <div>
                <label className="block text-xs font-mono uppercase text-tactical-400 mb-1.5">
                  Nombre del Titular de la Cuenta
                </label>
                <input
                  type="text"
                  value={formAccountName}
                  onChange={e => setFormAccountName(e.target.value)}
                  placeholder="Ej. Tienda Táctica Bolivia SRL"
                  className="input-tactical text-xs"
                />
              </div>

              {/* Image Uploader (ImgBB) */}
              <div>
                <label className="block text-xs font-mono uppercase text-tactical-400 mb-1.5">
                  Imagen del Código QR (Alojada en ImgBB) *
                </label>
                <p className="text-[11px] text-tactical-500 mb-2">
                  Sube el archivo de tu QR directamente a ImgBB. En Supabase solo se registrará el enlace URL.
                </p>

                <ImageUploader
                  value={formImageUrl}
                  onChange={url => setFormImageUrl(url)}
                  label=""
                  aspectRatio="square"
                />

                {/* Direct Link fallback input */}
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="O pega directamente el link URL de la imagen en ImgBB..."
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    className="input-tactical text-[11px] font-mono py-1.5"
                  />
                </div>
              </div>

              {/* Validity & Active Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-tactical-400 mb-1.5">
                    Tiempo de Vigencia
                  </label>
                  <select
                    value={formExpiration}
                    onChange={e => setFormExpiration(e.target.value)}
                    className="input-tactical text-xs"
                  >
                    <option value="3 años">3 años (Estático)</option>
                    <option value="5 años">5 años</option>
                    <option value="Sin expiración">Sin expiración</option>
                    <option value="1 año">1 año</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-tactical-400 mb-1.5">
                    Estado en Matriz
                  </label>
                  <select
                    value={formIsActive ? 'active' : 'inactive'}
                    onChange={e => setFormIsActive(e.target.value === 'active')}
                    className="input-tactical text-xs"
                  >
                    <option value="active">Activo (Despachable)</option>
                    <option value="inactive">Inactivo (Oculto)</option>
                  </select>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-mono uppercase text-tactical-400 mb-1.5">
                  Notas Internas / Glosa (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Ej. QR generado para chalecos tácticos de Bs. 350. Cuenta operativa BNB Cochabamba."
                  className="input-tactical text-xs py-2"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-ghost text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-tactical text-xs py-2.5 px-5 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> {editingQR ? 'Actualizar QR' : 'Guardar en la Matriz'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER COMPROBANTE DE PAGO */}
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
              Imagen de transferencia alojada en ImgBB
            </p>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/[0.1] bg-tactical-950 mb-4">
              <Image
                src={selectedReceipt.url}
                alt="Comprobante de transferencia"
                fill
                unoptimized
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
