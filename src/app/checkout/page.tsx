'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  ShieldCheck,
  ArrowLeft,
  Truck,
  Phone,
  User,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Copy,
  Clock,
  Sparkles,
  CheckCircle2,
  Navigation,
  Store,
  Gift,
  Building,
  CalendarCheck
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import QRCode from 'qrcode';
import { ImageUploader } from '@/components/ImageUploader';
import type { DeliveryType, PaymentMode } from '@/lib/types';

const BOLIVIA_DEPARTMENTS = [
  'La Paz',
  'Santa Cruz',
  'Cochabamba',
  'Oruro',
  'Potosí',
  'Chuquisaca (Sucre)',
  'Tarija',
  'Beni',
  'Pando',
];

const PICKUP_TIME_SLOTS = [
  'Hoy: 10:00 - 13:00 (Mañana)',
  'Hoy: 14:00 - 16:30 (Tarde)',
  'Hoy: 16:30 - 19:00 (Fin de jornada)',
  'Mañana: 09:30 - 13:00 (Mañana)',
  'Mañana: 14:00 - 19:00 (Tarde)',
  'Sábado: 09:00 - 18:00',
];

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { shippingZones, storeSettings, createOrder } = useStore();
  const router = useRouter();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // 3 Delivery Types
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    shippingZones[0]?.id || 'zone-01'
  );
  const [pickupSlot, setPickupSlot] = useState<string>(PICKUP_TIME_SLOTS[0]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Santa Cruz');

  // 3 Payment Modes
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('full_payment');

  // Confirmation state
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [receiptUploaded, setReceiptUploaded] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial calculations in Bolivianos (Bs.)
  const activeZone = shippingZones.find(z => z.id === selectedZoneId) || shippingZones[0];

  let shippingCost = 0;
  if (deliveryType === 'delivery') {
    shippingCost = activeZone ? activeZone.shipping_cost : 15;
  } else if (deliveryType === 'national_shipping') {
    shippingCost = 35.00; // Flota nacional interdepartamental
  } else {
    shippingCost = 0; // Recojo en tienda es gratis
  }

  const grandTotal = totalPrice + shippingCost;

  // Split calculation
  const amountToPayNow =
    paymentMode === 'full_payment'
      ? grandTotal
      : paymentMode === 'partial_payment'
      ? Math.round((grandTotal / 2) * 100) / 100
      : 0;

  const amountToPayLater =
    paymentMode === 'full_payment'
      ? 0
      : paymentMode === 'partial_payment'
      ? Math.round((grandTotal - amountToPayNow) * 100) / 100
      : grandTotal;

  // Generate QR if paying now (100% or 50%)
  useEffect(() => {
    if (createdOrder && amountToPayNow > 0) {
      const qrPayload = JSON.stringify({
        store: 'TIENDA TACTICA BOLIVIA',
        order_id: createdOrder.id,
        amount: amountToPayNow,
        currency: 'BOB',
        mode: paymentMode === 'full_payment' ? 'PAGO_100_CON_REGALO' : 'ANTICIPO_50_PORCIENTO',
        whatsapp: customerPhone,
        timestamp: new Date().toISOString(),
      });

      QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0A0A0B',
          light: '#FFFFFF',
        },
      })
        .then((url: string) => setQrDataUrl(url))
        .catch((err: unknown) => {
          console.error('Error generando QR:', err);
        });
    }
  }, [createdOrder, amountToPayNow, paymentMode, customerPhone]);

  useEffect(() => {
    if (items.length === 0 && !createdOrder) {
      router.push('/carrito');
    }
  }, [items.length, createdOrder, router]);

  if (items.length === 0 && !createdOrder) {
    return null;
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Por favor ingresa tu nombre y apellido');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      toast.error('Ingresa un número de WhatsApp de Bolivia válido (ej. 71234567)');
      return;
    }

    if (deliveryType !== 'pickup' && !customerAddress.trim()) {
      toast.error('Por favor ingresa la dirección exacta o terminal para el despacho');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItemsPayload = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      const newOrder = await createOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim().startsWith('+') ? customerPhone.trim() : `+591 ${customerPhone.trim()}`,
        customer_email: customerEmail.trim() || undefined,
        customer_address: deliveryType === 'pickup' ? storeSettings.pickupAddress : customerAddress.trim(),
        delivery_notes: deliveryNotes.trim() || undefined,
        delivery_type: deliveryType,
        shipping_zone_id: deliveryType === 'delivery' ? selectedZoneId : undefined,
        pickup_time: deliveryType === 'pickup' ? pickupSlot : undefined,
        destination_department: deliveryType === 'national_shipping' ? selectedDepartment : undefined,
        payment_mode: paymentMode,
        payment_method: paymentMode === 'cash_on_delivery' ? 'cash_on_delivery' : 'qr',
        items: orderItemsPayload,
        subtotal: totalPrice,
      });

      setCreatedOrder(newOrder);

      // Send Order Confirmation via Google SMTP if email provided
      if (customerEmail && customerEmail.includes('@')) {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerEmail,
            subject: `Orden Confirmada #${newOrder.id} — Tienda Táctica Bolivia`,
            title: `ORDEN REGISTRADA #${newOrder.id}`,
            message: `Estimado(a) ${customerName}, tu pedido ha sido registrado con éxito en nuestro centro de comando en Cochabamba (Av. Heroínas #560). Tu paquete está en fase de preparación y precinto de seguridad.`,
            orderId: newOrder.id,
            total: newOrder.total,
            freeGift: newOrder.free_gift ? true : false,
          }),
        }).catch(e => console.warn('Could not send confirmation email:', e));
      }

      if (paymentMode === 'cash_on_delivery') {
        toast.success('¡Orden táctica registrada contra entrega!', {
          description: `Pagarás Bs. ${grandTotal.toFixed(2)} al momento de recibir.`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error al procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderId = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.id);
      toast.info('Código de orden copiado al portapapeles');
    }
  };

  const handleConfirmReceipt = () => {
    if (!receiptUrl) {
      toast.error('Por favor sube la captura de tu transferencia QR');
      return;
    }
    setReceiptUploaded(true);
    toast.success('¡Comprobante QR registrado!', {
      description: 'El comando de almacén validará la acreditación bancaria.',
    });
  };

  // POST-CREATION / CONFIRMATION VIEW
  if (createdOrder) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
          <div className="glass-card-static p-6 sm:p-8 border border-[#C8A961]/40 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>

            <span className="text-[11px] font-mono tracking-widest text-[#C8A961] uppercase block mb-1">
              OPERACIÓN TÁCTICA REGISTRADA // BOLIVIA
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              ¡Misión Confirmada, {customerName}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-6">
              Tu orden ha ingresado al centro de comando logístico. A continuación tienes los detalles y accesos de tu pedido.
            </p>

            {/* SOUVENIR GIFT BANNER IF 100% PAID */}
            {paymentMode === 'full_payment' && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#C8A961]/20 via-amber-500/10 to-[#C8A961]/20 border border-[#C8A961] text-left mb-6 relative overflow-hidden shadow-lg shadow-[#C8A961]/10 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C8A961] flex items-center justify-center text-black font-black flex-shrink-0">
                    <Gift size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-[#C8A961] font-bold tracking-wider">
                      ¡REGALO TÁCTICO SORPRESA ADJUDICADO!
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      Souvenir Táctico Sorpresa Oficial (Edición Exclusiva)
                    </div>
                    <p className="text-[11px] text-neutral-300 mt-1">
                      Por abonar el 100% mediante QR anticipado, un regalo táctico secreto y exclusivo está incluido completamente <strong>GRATIS</strong> dentro de tu paquete. ¡Descúbrelo al recibir tu pedido!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ORDER CODE */}
            <div className="bg-[#141416] p-4 rounded-xl border border-white/[0.08] flex items-center justify-between gap-3 max-w-md mx-auto mb-6">
              <div className="text-left">
                <div className="text-[10px] font-mono text-neutral-500 uppercase">CÓDIGO DE ORDEN</div>
                <div className="text-base font-mono font-bold text-[#C8A961]">{createdOrder.id.toUpperCase()}</div>
              </div>
              <button
                onClick={handleCopyOrderId}
                className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 transition"
                title="Copiar código"
              >
                <Copy size={16} />
              </button>
            </div>

            {/* IF QR PAYMENT (100% OR 50%) */}
            {amountToPayNow > 0 && (
              <div className="mb-6">
                <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl border-4 border-[#C8A961]/40 mb-3">
                  {qrDataUrl ? (
                    <Image
                      src={qrDataUrl}
                      alt="Código QR de Pago Bolivia"
                      width={220}
                      height={220}
                      className="rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="w-52 h-52 bg-neutral-900 flex items-center justify-center text-xs text-neutral-400">
                      Generando QR oficial...
                    </div>
                  )}
                </div>

                <div className="text-xl font-bold text-white mb-1">
                  Monto a Transferir por QR: <span className="text-[#C8A961]">Bs. {amountToPayNow.toFixed(2)}</span>
                </div>

                {paymentMode === 'partial_payment' && (
                  <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg max-w-md mx-auto border border-amber-500/20 mb-3">
                    <strong>Anticipo del 50%:</strong> Abonar Bs. {amountToPayNow.toFixed(2)} ahora. El saldo restante de <strong className="text-white">Bs. {amountToPayLater.toFixed(2)}</strong> lo pagas al momento de recibir tu pedido.
                  </div>
                )}

                <p className="text-xs text-neutral-400 mb-6">
                  Escanea con tu aplicación bancaria (BNB, BCP, Banco Unión, GanaMóvil, Fassil o billetera QR Simple) para validar la acreditación.
                </p>

                {/* Upload proof */}
                <div className="glass-card-static p-5 text-left border border-white/[0.08] mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-[#C8A961]" />
                    <span className="text-sm font-semibold text-white">Comprobante de Transferencia Bancaria</span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-3">
                    Sube la captura de tu pago QR para acelerar la preparación de tu orden en almacén.
                  </p>

                  <ImageUploader
                    value={receiptUrl}
                    onChange={(url) => {
                      setReceiptUrl(url);
                      setReceiptUploaded(false);
                    }}
                    label=""
                    aspectRatio="video"
                  />

                  {receiptUrl && !receiptUploaded && (
                    <button
                      type="button"
                      onClick={handleConfirmReceipt}
                      className="btn-tactical w-full mt-3 flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle2 size={16} /> Enviar Comprobante para Verificación
                    </button>
                  )}

                  {receiptUploaded && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 size={16} /> Comprobante registrado. El comando validará la acreditación.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* IF CASH ON DELIVERY */}
            {paymentMode === 'cash_on_delivery' && (
              <div className="p-4 rounded-xl bg-[#C8A961]/10 border border-[#C8A961]/30 text-left mb-6 flex items-start gap-3">
                <DollarSign size={24} className="text-[#C8A961] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-[#C8A961]">Pago 100% Contra Entrega Habilitado</div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Ten listos exactamente <strong className="text-white">Bs. {grandTotal.toFixed(2)}</strong> (en efectivo o QR). El repartidor o encargado de tienda te cobrará al entregarte el equipamiento.
                  </p>
                </div>
              </div>
            )}

            {/* Delivery instructions banner */}
            <div className="bg-[#141416] p-4 rounded-xl border border-white/[0.06] text-left text-xs space-y-2 mb-6">
              <div className="flex items-center gap-2 text-neutral-300 font-semibold">
                {deliveryType === 'pickup' ? (
                  <>
                    <Store size={14} className="text-[#C8A961]" /> Modalidad: Retiro en Almacén Central (Gratis)
                  </>
                ) : deliveryType === 'national_shipping' ? (
                  <>
                    <Building size={14} className="text-[#C8A961]" /> Modalidad: Envío Nacional Interdepartamental
                  </>
                ) : (
                  <>
                    <Truck size={14} className="text-[#C8A961]" /> Modalidad: Delivery en la Ciudad
                  </>
                )}
              </div>

              {deliveryType === 'pickup' ? (
                <div className="space-y-1 text-neutral-400">
                  <div>
                    <strong className="text-white">Punto de Retiro: </strong>{storeSettings.pickupAddress}
                  </div>
                  <div>
                    <strong className="text-white">Horario Estimado de Retiro: </strong>
                    <span className="text-[#C8A961]">{pickupSlot}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Horario de atención general: {storeSettings.pickupSchedule}
                  </div>
                </div>
              ) : deliveryType === 'national_shipping' ? (
                <div className="space-y-1 text-neutral-400">
                  <div>
                    <strong className="text-white">Departamento de Destino: </strong>{selectedDepartment}
                  </div>
                  <div>
                    <strong className="text-white">Destino / Terminal: </strong>{customerAddress}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Se despacha por Flota interdepartamental con guía de encomienda.
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-neutral-400">
                  <div>
                    <strong className="text-white">Dirección de Entrega: </strong>{customerAddress}
                  </div>
                  <div>
                    <strong className="text-white">Zona: </strong>{activeZone?.name}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Repartidor motorizado se comunicará vía WhatsApp: <strong className="text-white">{customerPhone}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/ordenes/${createdOrder.id}`}
                onClick={() => clearCart()}
                className="btn-tactical flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold"
              >
                <Navigation size={16} /> Ver Seguimiento en Vivo
              </Link>
              <Link
                href="/"
                onClick={() => clearCart()}
                className="btn-outline-gold flex-1 flex items-center justify-center gap-2 py-3 text-sm"
              >
                Volver a la Tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT INPUT FORM
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-24">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Volver al Carrito
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Forms */}
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-[#C8A961] uppercase block mb-1">
                BOLIVIA // OPERACIONES DE DESPACHO
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Finalizar Pedido Táctico
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                Configura tu modalidad de entrega y elige si deseas aprovechar el <strong>Souvenir Táctico Sorpresa de Regalo</strong> abonando el 100%.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} id="checkout-form" className="space-y-6">
              {/* SECTION 1: DATOS PERSONALES */}
              <div className="glass-card-static p-5 border border-white/[0.08] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                  <User size={18} className="text-[#C8A961]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    1. Datos del Comprador
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Ej. Rodrigo Banzer"
                      className="input-tactical pl-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#C8A961] mb-1.5 flex items-center justify-between">
                      <span>WhatsApp en Bolivia *</span>
                      <span className="text-[10px] text-neutral-500">+591</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="71234567"
                        className="input-tactical pl-9 border-emerald-500/30 focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      El repartidor o almacén coordinará por WhatsApp contigo.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                      Correo Electrónico (Opcional)
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="tu-correo@gmail.com"
                        className="input-tactical pl-9"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Recibirás acceso a tu cuenta táctica por email SMTP.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 3 MODALIDADES DE ENTREGA */}
              <div className="glass-card-static p-5 border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-[#C8A961]" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      2. Modalidad de Entrega (3 Opciones)
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-[#C8A961] uppercase font-bold">
                    SELECCIONA 1
                  </span>
                </div>

                {/* The 3 delivery cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Pickup */}
                  <div
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      deliveryType === 'pickup'
                        ? 'bg-[#C8A961]/10 border-[#C8A961] shadow-lg shadow-[#C8A961]/10'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Store size={22} className={deliveryType === 'pickup' ? 'text-[#C8A961]' : 'text-neutral-500'} />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                          GRATIS
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">Recojo en Tienda</div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Pasa a retirar por almacén central en horarios establecidos.
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-mono font-bold text-emerald-400">
                      Bs. 0.00
                    </div>
                  </div>

                  {/* Option 2: Local Delivery */}
                  <div
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      deliveryType === 'delivery'
                        ? 'bg-[#C8A961]/10 border-[#C8A961] shadow-lg shadow-[#C8A961]/10'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Truck size={22} className={deliveryType === 'delivery' ? 'text-[#C8A961]' : 'text-neutral-500'} />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C8A961]/20 text-[#C8A961] font-bold">
                          URBANO
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">Delivery Cochabamba</div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Motorizado en Cercado, Cala Cala, Sacaba, Quillacollo, etc.
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-mono font-bold text-[#C8A961]">
                      Desde Bs. 12.00
                    </div>
                  </div>

                  {/* Option 3: National Shipping */}
                  <div
                    onClick={() => setDeliveryType('national_shipping')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      deliveryType === 'national_shipping'
                        ? 'bg-[#C8A961]/10 border-[#C8A961] shadow-lg shadow-[#C8A961]/10'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Building size={22} className={deliveryType === 'national_shipping' ? 'text-[#C8A961]' : 'text-neutral-500'} />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                          NACIONAL
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">Envío por Flota</div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Despacho desde Terminal de Buses Cochabamba al resto del país.
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-mono font-bold text-blue-400">
                      Bs. 35.00
                    </div>
                  </div>
                </div>

                {/* DYNAMIC SUBSECTION DEPENDING ON DELIVERY TYPE */}

                {/* Sub-form A: Recojo en Tienda */}
                {deliveryType === 'pickup' && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <Store size={18} className="text-[#C8A961] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Almacén Central de Retiro:</div>
                        <div className="text-xs text-neutral-300 font-medium">{storeSettings.pickupAddress}</div>
                        <div className="text-[11px] text-[#C8A961] flex items-center gap-1 mt-1">
                          <Clock size={12} /> Horario de Atención: {storeSettings.pickupSchedule}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5 flex items-center gap-1">
                        <CalendarCheck size={13} className="text-[#C8A961]" /> Elige tu Horario Estimado de Recojo:
                      </label>
                      <select
                        value={pickupSlot}
                        onChange={e => setPickupSlot(e.target.value)}
                        className="input-tactical text-xs"
                      >
                        {PICKUP_TIME_SLOTS.map(slot => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Sub-form B: Delivery en la Ciudad */}
                {deliveryType === 'delivery' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                        Zona de Cobertura en Cochabamba y Alrededores *
                      </label>
                      <div className="space-y-2">
                        {shippingZones.filter(z => !z.name.toLowerCase().includes('nacional')).map(zone => {
                          const isSelected = selectedZoneId === zone.id;
                          return (
                            <div
                              key={zone.id}
                              onClick={() => setSelectedZoneId(zone.id)}
                              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#C8A961]/10 border-[#C8A961]'
                                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-[#C8A961]' : 'border-neutral-600'
                                  }`}
                                >
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#C8A961]" />}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-white">{zone.name}</div>
                                  <div className="text-[10px] text-neutral-400">~{zone.estimated_hours} hrs entrega</div>
                                </div>
                              </div>
                              <div className="text-xs font-mono font-bold text-[#C8A961]">
                                +Bs. {zone.shipping_cost.toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                        Dirección Exacta de Entrega *
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-neutral-500" />
                        <textarea
                          required
                          rows={2}
                          value={customerAddress}
                          onChange={e => setCustomerAddress(e.target.value)}
                          placeholder="Calle, avenida, número, condominio, piso o referencia..."
                          className="input-tactical pl-9 py-2.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form C: Envío Nacional por Flota */}
                {deliveryType === 'national_shipping' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                        Departamento de Destino (Bolivia) *
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={e => setSelectedDepartment(e.target.value)}
                        className="input-tactical text-xs"
                      >
                        {BOLIVIA_DEPARTMENTS.map(dep => (
                          <option key={dep} value={dep}>
                            {dep} (Envío Flota / Terminal — Bs. 35.00)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                        Destino: Terminal de Buses / Nombre de Empresa de Flota o Dirección *
                      </label>
                      <div className="relative">
                        <Building size={16} className="absolute left-3 top-3 text-neutral-500" />
                        <textarea
                          required
                          rows={2}
                          value={customerAddress}
                          onChange={e => setCustomerAddress(e.target.value)}
                          placeholder="Ej. Retiro en Terminal de Buses Santa Cruz / Flota El Dorado a nombre de..."
                          className="input-tactical pl-9 py-2.5 text-xs"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        Te enviaremos la foto de la guía de encomienda por WhatsApp al momento del despacho.
                      </span>
                    </div>
                  </div>
                )}

                {/* Indicaciones para conductor */}
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                    Instrucciones Especiales o Referencias (Opcional)
                  </label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-neutral-500" />
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={e => setDeliveryNotes(e.target.value)}
                      placeholder="Ej. Dejar con el portero, llamar antes de salir de almacén..."
                      className="input-tactical pl-9 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: MODALIDADES DE PAGO (100% REGALO vs 50/50 vs CONTRA ENTREGA) */}
              <div className="glass-card-static p-5 border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-[#C8A961]" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      3. Modalidad de Pago
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Option 1: 100% Full Payment with Gift Souvenir */}
                  <div
                    onClick={() => setPaymentMode('full_payment')}
                    className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                      paymentMode === 'full_payment'
                        ? 'bg-[#C8A961]/10 border-[#C8A961] shadow-lg shadow-[#C8A961]/10'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            paymentMode === 'full_payment' ? 'border-[#C8A961]' : 'border-neutral-600'
                          }`}
                        >
                          {paymentMode === 'full_payment' && <div className="w-2.5 h-2.5 rounded-full bg-[#C8A961]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">
                              Pagar el 100% con QR (Pago Completo Anticipado)
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#C8A961] text-black font-black text-[9px] uppercase tracking-wider flex items-center gap-1 animate-pulse">
                              <Gift size={10} /> REGALO INCLUIDO
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 mt-1">
                            Abonas la totalidad mediante código QR bancario.
                          </p>

                          {/* Souvenir alert */}
                          <div className="mt-2.5 p-2.5 rounded-lg bg-black/40 border border-[#C8A961]/40 flex items-center gap-2">
                            <Sparkles size={16} className="text-[#C8A961] flex-shrink-0" />
                            <span className="text-[11px] text-[#C8A961] font-semibold">
                              ¡BENEFICIO EXCLUSIVO!: Incluye un Souvenir Táctico Sorpresa oficial completamente GRATIS dentro de tu paquete (¡Descúbrelo al recibir tu pedido!).
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-mono font-black text-[#C8A961]">
                          Bs. {grandTotal.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-neutral-500">Monto total</span>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: 50% Advance + 50% upon delivery */}
                  <div
                    onClick={() => setPaymentMode('partial_payment')}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      paymentMode === 'partial_payment'
                        ? 'bg-[#C8A961]/10 border-[#C8A961]'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            paymentMode === 'partial_payment' ? 'border-[#C8A961]' : 'border-neutral-600'
                          }`}
                        >
                          {paymentMode === 'partial_payment' && <div className="w-2.5 h-2.5 rounded-full bg-[#C8A961]" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            Pagar el 50% de Anticipo con QR (50% Ahora + 50% al Recibir)
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">
                            Abonas la mitad para confirmar y preparar tu pedido. El 50% restante lo pagas en mano al repartidor o al retirar en tienda.
                          </p>
                          <div className="mt-2 text-xs text-neutral-300 flex items-center gap-3 font-mono">
                            <span>Abonas hoy: <strong className="text-white">Bs. {Math.round((grandTotal / 2) * 100) / 100}</strong></span>
                            <span>·</span>
                            <span>Saldo al recibir: <strong className="text-white">Bs. {Math.round((grandTotal - Math.round((grandTotal / 2) * 100) / 100) * 100) / 100}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-mono font-bold text-white">
                          Bs. {(Math.round((grandTotal / 2) * 100) / 100).toFixed(2)}
                        </div>
                        <span className="text-[10px] text-neutral-500">Anticipo QR</span>
                      </div>
                    </div>
                  </div>

                  {/* Option 3: 100% Contra Entrega */}
                  <div
                    onClick={() => setPaymentMode('cash_on_delivery')}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      paymentMode === 'cash_on_delivery'
                        ? 'bg-[#C8A961]/10 border-[#C8A961]'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            paymentMode === 'cash_on_delivery' ? 'border-[#C8A961]' : 'border-neutral-600'
                          }`}
                        >
                          {paymentMode === 'cash_on_delivery' && <div className="w-2.5 h-2.5 rounded-full bg-[#C8A961]" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            Pagar el 100% Contra Entrega (Pagas al Recibir)
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">
                            Pagas la totalidad del pedido en efectivo o QR al repartidor al momento exacto de recibir el paquete.
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-mono font-bold text-white">
                          Bs. {grandTotal.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-neutral-500">Al recibir</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="glass-card-static p-5 border border-white/[0.08] sticky top-28 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#C8A961]">
                RESUMEN DE MISION // BS.
              </h3>

              {/* Items List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-start text-xs">
                    <div className="pr-2">
                      <div className="text-neutral-200 font-medium line-clamp-1">{product.name}</div>
                      <span className="text-neutral-500 text-[10px]">Cantidad: {quantity}</span>
                    </div>
                    <span className="text-white font-mono font-semibold">
                      Bs. {(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Gift notification preview */}
              {paymentMode === 'full_payment' && (
                <div className="p-2.5 rounded-lg bg-[#C8A961]/15 border border-[#C8A961]/30 flex items-center gap-2 text-xs">
                  <Gift size={15} className="text-[#C8A961] flex-shrink-0" />
                  <span className="text-[11px] text-neutral-200">
                    <strong>+ Regalo: </strong> Souvenir Táctico Sorpresa (Bs. 0.00)
                  </span>
                </div>
              )}

              <div className="border-t border-white/[0.06] pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-mono text-neutral-200">Bs. {totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Truck size={12} />
                    {deliveryType === 'pickup'
                      ? 'Retiro en Tienda'
                      : deliveryType === 'national_shipping'
                      ? 'Envío Flota'
                      : 'Delivery'}
                  </span>
                  <span className="font-mono text-[#C8A961]">
                    {shippingCost === 0 ? 'GRATIS' : `+Bs. ${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-white/[0.06] pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Total Orden</span>
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-[#C8A961]">
                      Bs. {grandTotal.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-neutral-500">Moneda Oficial de Bolivia</span>
                  </div>
                </div>

                {/* Amount breakdown if partial */}
                {paymentMode === 'partial_payment' && (
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
                    <div className="flex justify-between text-[#C8A961] font-bold">
                      <span>Pagar Ahora (50% QR):</span>
                      <span>Bs. {amountToPayNow.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400 text-[11px]">
                      <span>Saldo al Recibir (50%):</span>
                      <span>Bs. {amountToPayLater.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="btn-tactical w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#C8A961]/10"
              >
                <ShieldCheck size={18} />
                {isSubmitting
                  ? 'Procesando Misión...'
                  : paymentMode === 'full_payment'
                  ? `Confirmar con Regalo · Bs. ${grandTotal.toFixed(2)}`
                  : paymentMode === 'partial_payment'
                  ? `Pagar Anticipo 50% · Bs. ${amountToPayNow.toFixed(2)}`
                  : `Confirmar Contra Entrega · Bs. ${grandTotal.toFixed(2)}`}
              </button>

              <div className="text-[10px] text-neutral-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-[#C8A961]" /> Operación Oficial Bolivia · QR Simple Bancario
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
