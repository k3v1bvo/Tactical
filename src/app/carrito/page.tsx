'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-tactical-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-28 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-tactical-500" />
          </div>
          <h1 className="text-2xl font-bold text-tactical-200 mb-2">Tu carrito está vacío</h1>
          <p className="text-tactical-500 mb-6">Explora nuestro catálogo y agrega productos tácticos.</p>
          <Link href="/" className="btn-tactical inline-flex items-center gap-2">
            Explorar catálogo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tactical-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Carrito de Compras</h1>
          <button onClick={() => { clearCart(); toast.info('Carrito vaciado'); }} className="btn-ghost text-xs">
            <Trash2 size={14} className="mr-1" /> Vaciar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="glass-card-static p-4 flex gap-4 animate-fade-in">
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-tactical-800">
                  <Image
                    src={product.images[0] || '/placeholder-tactical.svg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/producto/${product.id}`} className="text-sm font-semibold text-tactical-100 hover:text-amber-accent transition-colors line-clamp-1">
                    {product.name}
                  </Link>
                  {product.category && (
                    <span className="text-[11px] text-tactical-500">{product.category.name}</span>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-white/[0.08] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 hover:bg-white/[0.05] transition-colors"
                      >
                        <Minus size={14} className="text-tactical-400" />
                      </button>
                      <span className="px-3 text-sm font-semibold text-white">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1.5 hover:bg-white/[0.05] transition-colors"
                      >
                        <Plus size={14} className="text-tactical-400" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">Bs. {(product.price * quantity).toFixed(2)}</span>
                      <button
                        onClick={() => { removeItem(product.id); toast.info(`${product.name} eliminado`); }}
                        className="p-1.5 rounded-lg hover:bg-red-alert/10 transition-colors group"
                      >
                        <Trash2 size={14} className="text-tactical-500 group-hover:text-red-alert transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card-static p-5 sticky top-24">
              <h3 className="text-sm font-semibold text-tactical-300 uppercase tracking-wider mb-4">Resumen del pedido</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-tactical-400">
                  <span>Productos ({totalItems})</span>
                  <span className="font-mono text-white">Bs. {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-tactical-400">
                  <span>Envío</span>
                  <span className="text-[#C8A961] text-xs font-medium">Recojo gratis / Delivery</span>
                </div>
                <div className="border-t border-white/[0.06] pt-3 flex justify-between items-baseline">
                  <span className="text-base font-semibold text-white">Subtotal</span>
                  <span className="text-xl font-bold text-[#C8A961] font-mono">Bs. {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-tactical w-full flex items-center justify-center gap-2 mt-5 py-3">
                Proceder al Checkout <ArrowRight size={16} />
              </Link>

              <div className="flex items-center gap-2 mt-4 text-[11px] text-tactical-500 justify-center">
                <ShieldCheck size={14} className="text-green-tactical" />
                Pago seguro con verificación QR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
