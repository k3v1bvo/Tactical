'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { ShoppingCart, Minus, Plus, ArrowLeft, Shield, Package, AlertTriangle, Check, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { products } = useStore();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-tactical-900">
        <Navbar />
        <div className="pt-24 text-center">
          <h1 className="text-2xl font-bold text-tactical-300">Producto no encontrado</h1>
          <button onClick={() => router.push('/')} className="btn-tactical mt-4">Volver al catálogo</button>
        </div>
      </div>
    );
  }

  const isLowStock = product.stock <= product.low_stock_threshold;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    toast.success(`${product.name} agregado al carrito`, {
      description: `Bs. ${product.price.toFixed(2)} × ${quantity} = Bs. ${(product.price * quantity).toFixed(2)}`,
    });
  };

  const features = [
    { icon: Shield, text: 'Calidad militar certificada' },
    { icon: Truck, text: 'Envío seguro y discreto' },
    { icon: Package, text: 'Garantía de satisfacción' },
  ];

  return (
    <div className="min-h-screen bg-tactical-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Breadcrumb */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-tactical-400 hover:text-tactical-200 transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="glass-card-static overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={product.images[0] || '/placeholder-tactical.svg'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-tactical-900/70 flex items-center justify-center">
                  <span className="badge badge-cancelled text-base px-4 py-2"><Package size={16} /> Agotado</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="animate-fade-in-up">
            {product.category && (
              <span className="text-xs font-semibold text-amber-accent tracking-wider uppercase">{product.category.name}</span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-4">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-white">Bs. {product.price.toFixed(2)}</span>
              {/* Stock indicator */}
              <span className={`badge ${isOutOfStock ? 'badge-cancelled' : isLowStock ? 'badge-warning' : 'badge-delivered'}`}>
                {isOutOfStock ? 'Sin stock' : isLowStock ? `Últimas ${product.stock} unidades` : `${product.stock} en stock`}
              </span>
            </div>

            {/* Description */}
            <p className="text-tactical-300 text-sm leading-relaxed mb-8">{product.description}</p>

            {/* Quantity & Add to Cart */}
            {!isOutOfStock && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border border-white/[0.1] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-white/[0.05] transition-colors"
                  >
                    <Minus size={16} className="text-tactical-400" />
                  </button>
                  <span className="px-5 py-3 text-white font-semibold min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-white/[0.05] transition-colors"
                  >
                    <Plus size={16} className="text-tactical-400" />
                  </button>
                </div>

                <button onClick={handleAddToCart} className="btn-tactical flex items-center justify-center gap-2 flex-1 py-3.5 text-base">
                  <ShoppingCart size={20} />
                  Agregar al carrito — Bs. {(product.price * quantity).toFixed(2)}
                </button>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3 pt-6 border-t border-white/[0.06]">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-tactical-300">
                  <div className="w-8 h-8 rounded-lg bg-green-tactical/10 flex items-center justify-center">
                    <f.icon size={16} className="text-green-tactical" />
                  </div>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
