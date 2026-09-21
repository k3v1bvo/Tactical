'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  Category,
  Product,
  SystemAlert,
  Order,
  ShippingZone,
  DriverEarning,
  OrderStatus,
  DeliveryType,
  PaymentMode,
} from '@/lib/types';
import {
  demoCategories,
  demoProducts,
  demoAlerts,
  demoOrders,
  demoShippingZones,
  demoDriverEarnings,
  demoVendor,
  defaultStoreSettings,
} from '@/lib/demo-data';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export interface StoreSettings {
  storeName: string;
  currency: string;
  currencySymbol: string;
  pickupAddress: string;
  pickupSchedule: string;
  pickupInstructions: string;
  freeGiftName: string;
  freeGiftValue: number;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_phone: string; // WhatsApp
  customer_email?: string;
  customer_address?: string;
  delivery_notes?: string;
  delivery_type: DeliveryType; // 'pickup' | 'delivery' | 'national_shipping'
  shipping_zone_id?: string;
  pickup_time?: string;
  destination_department?: string;
  payment_mode: PaymentMode; // 'full_payment' | 'partial_payment' | 'cash_on_delivery'
  payment_method: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
  subtotal: number;
}

interface StoreContextType {
  categories: Category[];
  products: Product[];
  alerts: SystemAlert[];
  orders: Order[];
  shippingZones: ShippingZone[];
  driverEarnings: DriverEarning[];
  isDriverAvailable: boolean;
  storeSettings: StoreSettings;

  // Store Settings (Admin)
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;

  // Category CRUD
  addCategory: (cat: { name: string; description?: string }) => Category;
  updateCategory: (id: string, cat: { name?: string; description?: string }) => void;
  deleteCategory: (id: string) => boolean;

  // Product CRUD
  addProduct: (prod: {
    name: string;
    description: string;
    price: number;
    stock: number;
    low_stock_threshold: number;
    category_id: string;
    image: string;
  }) => Product;
  updateProduct: (
    id: string,
    prod: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
      low_stock_threshold: number;
      category_id: string;
      image: string;
      is_active: boolean;
    }>
  ) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;

  // Shipping Zones CRUD (Admin)
  addShippingZone: (zone: {
    name: string;
    department?: string;
    city?: string;
    shipping_cost: number;
    driver_commission: number;
    estimated_hours: number;
  }) => ShippingZone;
  updateShippingZone: (id: string, data: Partial<ShippingZone>) => void;
  deleteShippingZone: (id: string) => boolean;
  resetShippingZonesToDefaults: () => void;

  // Order Lifecycle & Logistics
  createOrder: (input: CreateOrderInput) => Order;
  adminSetOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  adminAssignDriver: (orderId: string, driverId: string) => void;
  driverAcceptOrder: (orderId: string, driverId?: string) => boolean;
  driverPickupOrder: (orderId: string) => void;
  driverInTransit: (orderId: string) => void;
  driverDeliverOrder: (orderId: string) => void;
  rateDriver: (orderId: string, rating: number, review: string) => void;
  cancelOrder: (orderId: string, reason?: string) => boolean;

  // Driver & Earnings
  toggleDriverAvailability: () => void;
  settleDriverEarnings: (earningId: string) => void;

  // Alerts & Maintenance
  resolveAlert: (id: string) => void;
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [alerts, setAlerts] = useState<SystemAlert[]>(demoAlerts);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(demoShippingZones);
  const [driverEarnings, setDriverEarnings] = useState<DriverEarning[]>(demoDriverEarnings);
  const [isDriverAvailable, setIsDriverAvailable] = useState<boolean>(true);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCats = localStorage.getItem('tacticos_store_categories');
      if (savedCats) setCategories(JSON.parse(savedCats));

      const savedProds = localStorage.getItem('tacticos_store_products');
      if (savedProds) setProducts(JSON.parse(savedProds));

      const savedAlerts = localStorage.getItem('tacticos_store_alerts');
      if (savedAlerts) setAlerts(JSON.parse(savedAlerts));

      const savedOrders = localStorage.getItem('tacticos_store_orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        const hasLegacyAddresses = parsedOrders.some(
          (o: any) =>
            (o.customer_address && (o.customer_address.includes('Lima') || o.customer_address.includes('Miraflores') || o.customer_address.includes('San Isidro'))) ||
            (o.customer_phone && o.customer_phone.includes('+51'))
        );
        if (hasLegacyAddresses) {
          setOrders(demoOrders);
          localStorage.setItem('tacticos_store_orders', JSON.stringify(demoOrders));
        } else {
          setOrders(parsedOrders);
        }
      }

      const savedZones = localStorage.getItem('tacticos_store_shipping_zones');
      if (savedZones) {
        const parsedZones = JSON.parse(savedZones);
        const isLegacyOrNotCbba =
          !Array.isArray(parsedZones) ||
          parsedZones.length === 0 ||
          !parsedZones.some((z: any) => z.name && z.name.toLowerCase().includes('cochabamba'));

        if (isLegacyOrNotCbba) {
          setShippingZones(demoShippingZones);
          localStorage.setItem('tacticos_store_shipping_zones', JSON.stringify(demoShippingZones));
        } else {
          setShippingZones(parsedZones);
        }
      }

      const savedEarnings = localStorage.getItem('tacticos_store_driver_earnings');
      if (savedEarnings) setDriverEarnings(JSON.parse(savedEarnings));

      const savedAvailability = localStorage.getItem('tacticos_driver_available');
      if (savedAvailability !== null) setIsDriverAvailable(JSON.parse(savedAvailability));

      const savedSettings = localStorage.getItem('tacticos_store_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        const isLegacySettings =
          !parsedSettings.pickupAddress ||
          !parsedSettings.pickupAddress.toLowerCase().includes('cochabamba');

        if (isLegacySettings) {
          setStoreSettings(defaultStoreSettings);
          localStorage.setItem('tacticos_store_settings', JSON.stringify(defaultStoreSettings));
        } else {
          setStoreSettings(parsedSettings);
        }
      }
      // Live Supabase sync
      const client = supabase;
      if (client) {
        // 1. Categories
        client.from('categories').select('*').order('position', { ascending: true }).then(({ data }) => {
          if (data && data.length > 0) setCategories(data);
        });

        // 2. Products
        client.from('products').select('*').eq('is_active', true).then(({ data }) => {
          if (data && data.length > 0) {
            const mappedProducts: Product[] = data.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              description: p.description || '',
              price: parseFloat(p.price) || 0,
              category_id: p.category_id,
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80'],
              stock: p.stock ?? 0,
              low_stock_threshold: p.low_stock_threshold ?? 5,
              sku: p.sku || '',
              is_active: p.is_active ?? true,
              vendor_id: p.vendor_id || null,
              created_at: p.created_at || new Date().toISOString(),
              updated_at: p.updated_at || new Date().toISOString(),
              deleted_at: null,
            }));
            setProducts(mappedProducts);
          }
        });

        // 3. Shipping Zones
        client.from('shipping_zones').select('*').eq('is_active', true).then(({ data }) => {
          if (data && data.length > 0) {
            setShippingZones(data.map((z: any) => ({
              ...z,
              shipping_cost: parseFloat(z.shipping_cost) || 0,
              driver_commission: parseFloat(z.driver_commission) || 0,
              store_profit: parseFloat(z.store_profit) || 0,
            })));
          }
        });

        // 4. Store Settings
        client.from('store_settings').select('*').eq('id', 'main').single().then(({ data }) => {
          if (data) {
            setStoreSettings({
              storeName: data.store_name || defaultStoreSettings.storeName,
              currency: data.currency || defaultStoreSettings.currency,
              currencySymbol: data.currency_symbol || defaultStoreSettings.currencySymbol,
              pickupAddress: data.pickup_address || defaultStoreSettings.pickupAddress,
              pickupSchedule: data.pickup_schedule || defaultStoreSettings.pickupSchedule,
              pickupInstructions: data.pickup_instructions || defaultStoreSettings.pickupInstructions,
              freeGiftName: data.free_gift_name || defaultStoreSettings.freeGiftName,
              freeGiftValue: parseFloat(data.free_gift_min_amount) || defaultStoreSettings.freeGiftValue,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Error reading from storage or Supabase:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('tacticos_store_categories', JSON.stringify(categories));
    } catch (e) {
      console.warn('Error saving categories:', e);
    }
  }, [categories, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('tacticos_store_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Error saving products:', e);
    }
  }, [products, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('tacticos_store_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.warn('Error saving alerts:', e);
    }
  }, [alerts, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('tacticos_store_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Error saving orders:', e);
    }
  }, [orders, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('tacticos_store_shipping_zones', JSON.stringify(shippingZones));
    } catch (e) {
      console.warn('Error saving shipping zones:', e);
    }
  }, [shippingZones, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('tacticos_store_driver_earnings', JSON.stringify(driverEarnings));
    } catch (e) {
      console.warn('Error saving driver earnings:', e);
    }
  }, [driverEarnings, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('tacticos_driver_available', JSON.stringify(isDriverAvailable));
    } catch (e) {
      console.warn('Error saving driver availability:', e);
    }
  }, [isDriverAvailable, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('tacticos_store_settings', JSON.stringify(storeSettings));
    } catch (e) {
      console.warn('Error saving store settings:', e);
    }
  }, [storeSettings, isInitialized]);

  // SETTINGS ACTIONS
  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
    toast.success('Configuración y horarios actualizados con éxito');
  };

  // CATEGORY ACTIONS
  const addCategory = ({ name, description }: { name: string; description?: string }): Category => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const newCategory: Category = {
      id: `cat-${Date.now().toString(36)}`,
      name: name.trim(),
      slug,
      description: description || '',
      parent_id: null,
      position: categories.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setCategories(prev => [...prev, newCategory]);
    toast.success(`Categoría "${name}" creada con éxito`);
    return newCategory;
  };

  const updateCategory = (id: string, data: { name?: string; description?: string }) => {
    setCategories(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updatedName = data.name ? data.name.trim() : c.name;
          const updatedSlug = data.name ? updatedName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : c.slug;
          return {
            ...c,
            name: updatedName,
            slug: updatedSlug,
            description: data.description !== undefined ? data.description : c.description,
          };
        }
        return c;
      })
    );
    toast.success('Categoría actualizada con éxito');
  };

  const deleteCategory = (id: string): boolean => {
    const hasProducts = products.some(p => p.category_id === id);
    if (hasProducts) {
      toast.error('No se puede eliminar: existen productos asociados a esta categoría.');
      return false;
    }

    setCategories(prev => prev.filter(c => c.id !== id));
    toast.info('Categoría eliminada');
    return true;
  };

  // PRODUCT ACTIONS
  const addProduct = (prod: {
    name: string;
    description: string;
    price: number;
    stock: number;
    low_stock_threshold: number;
    category_id: string;
    image: string;
  }): Product => {
    const categoryObj = categories.find(c => c.id === prod.category_id);
    const newProduct: Product = {
      id: `prod-${Date.now().toString(36)}`,
      name: prod.name.trim(),
      slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: prod.description,
      price: Number(prod.price),
      stock: Number(prod.stock),
      low_stock_threshold: Number(prod.low_stock_threshold),
      category_id: prod.category_id,
      category: categoryObj,
      images: prod.image ? [prod.image] : ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=60'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProducts(prev => [newProduct, ...prev]);

    if (newProduct.stock <= newProduct.low_stock_threshold) {
      const newAlert: SystemAlert = {
        id: `alt-${Date.now().toString(36)}`,
        type: 'stock',
        severity: newProduct.stock === 0 ? 'critical' : 'warning',
        message: `Nuevo producto "${newProduct.name}" registrado con stock crítico (${newProduct.stock} uds).`,
        resolved: false,
        resolved_by: null,
        created_at: new Date().toISOString(),
        resolved_at: null,
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    const client = supabase;
    if (client) {
      client.from('products').insert({
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        price: newProduct.price,
        category_id: newProduct.category_id,
        images: newProduct.images,
        stock: newProduct.stock,
        low_stock_threshold: newProduct.low_stock_threshold,
        is_active: true,
      }).then(({ error }) => {
        if (error) console.error('Error inserting product in Supabase:', error);
      });
    }

    toast.success(`Producto "${prod.name}" añadido al catálogo`);
    return newProduct;
  };

  const updateProduct = (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
      low_stock_threshold: number;
      category_id: string;
      image: string;
      is_active: boolean;
    }>
  ) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const categoryObj = data.category_id
            ? categories.find(c => c.id === data.category_id)
            : p.category;

          const updatedStock = data.stock !== undefined ? Number(data.stock) : p.stock;
          const updatedThreshold = data.low_stock_threshold !== undefined ? Number(data.low_stock_threshold) : p.low_stock_threshold;

          if (updatedStock <= updatedThreshold && p.stock > updatedThreshold) {
            const newAlert: SystemAlert = {
              id: `alt-${Date.now().toString(36)}`,
              type: 'stock',
              severity: updatedStock === 0 ? 'critical' : 'warning',
              message: `El producto "${p.name}" ha caído a ${updatedStock} unidades (umbral: ${updatedThreshold}).`,
              resolved: false,
              resolved_by: null,
              created_at: new Date().toISOString(),
              resolved_at: null,
            };
            setAlerts(a => [newAlert, ...a]);
          }

          return {
            ...p,
            name: data.name !== undefined ? data.name : p.name,
            description: data.description !== undefined ? data.description : p.description,
            price: data.price !== undefined ? Number(data.price) : p.price,
            stock: updatedStock,
            low_stock_threshold: updatedThreshold,
            category_id: data.category_id !== undefined ? data.category_id : p.category_id,
            category: categoryObj,
            images: data.image ? [data.image] : p.images,
            is_active: data.is_active !== undefined ? data.is_active : p.is_active,
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    const client = supabase;
    if (client) {
      client.from('products').update({
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.low_stock_threshold !== undefined && { low_stock_threshold: data.low_stock_threshold }),
        ...(data.category_id && { category_id: data.category_id }),
        ...(data.image && { images: [data.image] }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      }).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating product in Supabase:', error);
      });
    }

    toast.success('Producto actualizado');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    const client = supabase;
    if (client) {
      client.from('products').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting product in Supabase:', error);
      });
    }
    toast.error('Producto eliminado del catálogo');
  };

  const updateStock = (id: string, newStock: number) => {
    updateProduct(id, { stock: newStock });
  };

  // SHIPPING ZONES (ADMIN)
  const addShippingZone = (zoneData: {
    name: string;
    department?: string;
    city?: string;
    shipping_cost: number;
    driver_commission: number;
    estimated_hours: number;
  }): ShippingZone => {
    const storeProfit = Number(zoneData.shipping_cost) - Number(zoneData.driver_commission);
    const newZone: ShippingZone = {
      id: `zone-${Date.now().toString(36)}`,
      name: zoneData.name.trim(),
      department: zoneData.department || null,
      city: zoneData.city || null,
      shipping_cost: Number(zoneData.shipping_cost),
      driver_commission: Number(zoneData.driver_commission),
      store_profit: storeProfit,
      estimated_hours: Number(zoneData.estimated_hours),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setShippingZones(prev => [...prev, newZone]);
    toast.success(`Zona "${zoneData.name}" configurada con éxito`);
    return newZone;
  };

  const updateShippingZone = (id: string, data: Partial<ShippingZone>) => {
    setShippingZones(prev =>
      prev.map(z => {
        if (z.id === id) {
          const shipping_cost = data.shipping_cost !== undefined ? Number(data.shipping_cost) : z.shipping_cost;
          const driver_commission = data.driver_commission !== undefined ? Number(data.driver_commission) : z.driver_commission;
          return {
            ...z,
            ...data,
            shipping_cost,
            driver_commission,
            store_profit: shipping_cost - driver_commission,
          };
        }
        return z;
      })
    );
    toast.success('Zona de envío actualizada');
  };

  const deleteShippingZone = (id: string): boolean => {
    setShippingZones(prev => prev.filter(z => z.id !== id));
    toast.info('Zona de envío eliminada');
    return true;
  };

  const resetShippingZonesToDefaults = () => {
    setShippingZones(demoShippingZones);
    localStorage.setItem('tacticos_store_shipping_zones', JSON.stringify(demoShippingZones));
    toast.success('Zonas de Cochabamba y Nacionales restablecidas a valores oficiales');
  };

  // ORDER CREATION & LOGISTICS (BOLIVIA - 3 DELIVERY TYPES + 50/50 + REGALO TÁCTICO)
  const createOrder = (input: CreateOrderInput): Order => {
    let shippingCost = 0;
    let driverCommission = 0;
    let selectedZone: ShippingZone | undefined = undefined;

    if (input.delivery_type === 'pickup') {
      shippingCost = 0;
      driverCommission = 0;
    } else if (input.delivery_type === 'delivery') {
      selectedZone = shippingZones.find(z => z.id === input.shipping_zone_id);
      shippingCost = selectedZone ? selectedZone.shipping_cost : 15;
      driverCommission = selectedZone ? selectedZone.driver_commission : 10;
    } else if (input.delivery_type === 'national_shipping') {
      selectedZone = shippingZones.find(z => z.id === input.shipping_zone_id) || shippingZones.find(z => z.id === 'zone-06');
      shippingCost = selectedZone ? selectedZone.shipping_cost : 35;
      driverCommission = selectedZone ? selectedZone.driver_commission : 25;
    }

    const total = input.subtotal + shippingCost;
    const orderId = `ord-${Date.now().toString(36)}`;

    // Payment amounts and gift calculation
    let paid_amount = 0;
    let pending_amount = total;
    let free_gift: string | null = null;

    if (input.payment_mode === 'full_payment') {
      paid_amount = total;
      pending_amount = 0;
      free_gift = storeSettings.freeGiftName; // 🎉 100% pago obtiene souvenir de regalo
    } else if (input.payment_mode === 'partial_payment') {
      paid_amount = Math.round((total / 2) * 100) / 100; // 50% anticipo por QR
      pending_amount = Math.round((total - paid_amount) * 100) / 100; // 50% al recibir
      free_gift = null;
    } else {
      // cash_on_delivery: 0 anticipo, 100% al recibir
      paid_amount = 0;
      pending_amount = total;
      free_gift = null;
    }

    // Orders are considered 'paid' (confirmed) if advance was paid or if confirmed by client
    const initialStatus: OrderStatus = 'paid';

    const newOrder: Order = {
      id: orderId,
      user_id: 'client-01',
      vendor_id: null,
      driver_id: null,
      shipping_zone_id: input.shipping_zone_id || null,
      shipping_cost: shippingCost,
      driver_commission: driverCommission,
      status: initialStatus,
      total,
      paid_amount,
      pending_amount,
      payment_method: input.payment_method,
      payment_mode: input.payment_mode,
      delivery_type: input.delivery_type,
      free_gift,
      pickup_time: input.pickup_time || (input.delivery_type === 'pickup' ? storeSettings.pickupSchedule : null),
      pickup_location: input.delivery_type === 'pickup' ? storeSettings.pickupAddress : null,
      destination_department: input.destination_department || null,
      qr_code_data: input.payment_mode !== 'cash_on_delivery' ? `QR-${orderId.toUpperCase()}` : null,
      created_at: new Date().toISOString(),
      paid_at: paid_amount > 0 ? new Date().toISOString() : null,
      delivered_at: null,
      cancelled_at: null,
      cancellation_reason: null,
      internal_notes: input.delivery_notes || null,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email || 'cliente@tacticos.bo',
      customer_address: input.customer_address || (input.delivery_type === 'pickup' ? storeSettings.pickupAddress : ''),
      delivery_notes: input.delivery_notes || null,
      customer_rating: null,
      customer_review: null,
      items: input.items.map((item, idx) => ({
        id: `oi-${orderId}-${idx}`,
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })),
      shipping_zone: selectedZone,
      customer: {
        name: input.customer_name,
        phone: input.customer_phone,
        email: input.customer_email || 'cliente@tacticos.bo',
        address: input.customer_address || storeSettings.pickupAddress,
      },
    };

    setOrders(prev => [newOrder, ...prev]);

    // Live Supabase sync for order
    const client = supabase;
    if (client) {
      client
        .from('orders')
        .insert({
          id: newOrder.id,
          status: newOrder.status,
          subtotal: Number(input.subtotal),
          total: Number(newOrder.total),
          delivery_type: newOrder.delivery_type,
          pickup_time: newOrder.pickup_time,
          pickup_location: newOrder.pickup_location,
          destination_department: newOrder.destination_department,
          shipping_zone_id: newOrder.shipping_zone_id,
          shipping_cost: Number(newOrder.shipping_cost),
          payment_mode: newOrder.payment_mode,
          payment_method: newOrder.payment_method,
          paid_amount: Number(newOrder.paid_amount),
          pending_amount: Number(newOrder.pending_amount),
          free_gift: newOrder.free_gift,
          driver_commission: Number(newOrder.driver_commission),
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email,
          customer_address: newOrder.customer_address,
          delivery_notes: newOrder.delivery_notes,
        })
        .then(({ error }) => {
          if (error) console.error('Error inserting order in Supabase:', error);
        });

      if (newOrder.items && newOrder.items.length > 0) {
        client
          .from('order_items')
          .insert(
            newOrder.items.map(item => ({
              id: item.id,
              order_id: newOrder.id,
              product_id: item.product_id,
              product_name: products.find(p => p.id === item.product_id)?.name || 'Producto Táctico',
              quantity: item.quantity,
              unit_price: Number(item.unit_price),
              total_price: Number(item.subtotal),
            }))
          )
          .then(({ error }) => {
            if (error) console.error('Error inserting order items in Supabase:', error);
          });
      }
    }

    // Subtract stock
    input.items.forEach(item => {
      const prod = products.find(p => p.id === item.product_id);
      if (prod) {
        const newStock = Math.max(0, prod.stock - item.quantity);
        updateStock(prod.id, newStock);
      }
    });

    // Notify about gift if unlocked
    if (free_gift) {
      toast.success('🎁 ¡REGALO TÁCTICO SORPRESA ADJUDICADO!', {
        description: '¡Por pagar el 100% con QR, un Souvenir Táctico Sorpresa exclusivo viaja dentro de tu paquete!',
      });
    }

    if (input.customer_email) {
      toast.success('¡Cuenta generada automáticamente!', {
        description: `Se enviaron tus credenciales y tracking por correo SMTP a ${input.customer_email}`,
      });
    }

    toast.success(`¡Orden ${orderId.toUpperCase()} creada con éxito!`);
    return newOrder;
  };

  // ADMIN ACTIONS
  const adminSetOrderStatus = (orderId: string, status: OrderStatus, notes?: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            internal_notes: notes ? `${o.internal_notes || ''} [Admin: ${notes}]` : o.internal_notes,
            delivered_at: status === 'delivered' ? (o.delivered_at || new Date().toISOString()) : o.delivered_at,
            paid_at: status === 'paid' ? (o.paid_at || new Date().toISOString()) : o.paid_at,
          };
        }
        return o;
      })
    );
    toast.success(`Orden ${orderId.toUpperCase()} actualizada a "${status}"`);
  };

  const adminAssignDriver = (orderId: string, driverId: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            driver_id: driverId,
            status: o.status === 'ready' ? 'assigned' : o.status,
            driver: demoVendor,
          };
        }
        return o;
      })
    );
    toast.success(`Repartidor asignado a la orden ${orderId.toUpperCase()}`);
  };

  // DRIVER LOGISTICS
  const driverAcceptOrder = (orderId: string, driverId: string = 'vendor-01'): boolean => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) {
      toast.error('Orden no encontrada');
      return false;
    }

    if (targetOrder.status !== 'ready') {
      toast.error('Esta orden ya fue aceptada por otro conductor o aún no está lista');
      return false;
    }

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            driver_id: driverId,
            status: 'assigned',
            driver: demoVendor,
          };
        }
        return o;
      })
    );

    toast.success(`¡Has aceptado la orden ${orderId.toUpperCase()}! Asignada a tu ruta.`);
    return true;
  };

  const driverPickupOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'picked_up',
            internal_notes: `${o.internal_notes || ''} [Recogido en punto de origen]`,
          };
        }
        return o;
      })
    );
    toast.success(`Orden ${orderId.toUpperCase()} marcada como RECOGIDA.`);
  };

  const driverInTransit = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'in_transit',
            internal_notes: `${o.internal_notes || ''} [Repartidor en camino al destino]`,
          };
        }
        return o;
      })
    );
    toast.info(`Orden ${orderId.toUpperCase()} en camino al cliente.`);
  };

  const driverDeliverOrder = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const deliveryTime = new Date().toISOString();

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'delivered',
            delivered_at: deliveryTime,
            paid_amount: o.total, // Fully collected upon delivery
            pending_amount: 0,
            paid_at: o.paid_at || deliveryTime,
          };
        }
        return o;
      })
    );

    // Auto-create driver commission earning
    const newEarning: DriverEarning = {
      id: `earn-${Date.now().toString(36)}`,
      driver_id: targetOrder.driver_id || 'vendor-01',
      order_id: targetOrder.id,
      amount: targetOrder.driver_commission,
      zone_id: targetOrder.shipping_zone_id || null,
      status: 'pending',
      paid_at: null,
      created_at: deliveryTime,
      zone: shippingZones.find(z => z.id === targetOrder.shipping_zone_id),
      order: targetOrder,
    };

    setDriverEarnings(prev => [newEarning, ...prev]);

    toast.success(`¡Entrega de orden ${orderId.toUpperCase()} completada!`, {
      description: `Comisión registrada: +Bs. ${targetOrder.driver_commission.toFixed(2)}`,
    });
  };

  const rateDriver = (orderId: string, rating: number, review: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            customer_rating: rating,
            customer_review: review,
          };
        }
        return o;
      })
    );
    toast.success('¡Gracias por calificar la entrega de tu pedido!');
  };

  const cancelOrder = (orderId: string, reason?: string): boolean => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    if (order.status !== 'pending') {
      toast.error('Solo puedes cancelar pedidos en estado "Pendiente"');
      return false;
    }

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: reason || 'Cancelado por el cliente',
          };
        }
        return o;
      })
    );

    toast.info(`Orden ${orderId.toUpperCase()} cancelada`);
    return true;
  };

  const toggleDriverAvailability = () => {
    setIsDriverAvailable(prev => {
      const next = !prev;
      toast.info(next ? 'Estado: DISPONIBLE para recibir repartos' : 'Estado: EN DESCANSO');
      return next;
    });
  };

  const settleDriverEarnings = (earningId: string) => {
    setDriverEarnings(prev =>
      prev.map(e => (e.id === earningId ? { ...e, status: 'paid', paid_at: new Date().toISOString() } : e))
    );
    toast.success('Comisión de reparto liquidada con éxito');
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, resolved: true, resolved_at: new Date().toISOString() } : a))
    );
    toast.success('Alerta resuelta');
  };

  const resetToDefaults = () => {
    setCategories(demoCategories);
    setProducts(demoProducts);
    setAlerts(demoAlerts);
    setOrders(demoOrders);
    setShippingZones(demoShippingZones);
    setDriverEarnings(demoDriverEarnings);
    setIsDriverAvailable(true);
    setStoreSettings(defaultStoreSettings);
    localStorage.removeItem('tacticos_store_categories');
    localStorage.removeItem('tacticos_store_products');
    localStorage.removeItem('tacticos_store_alerts');
    localStorage.removeItem('tacticos_store_orders');
    localStorage.removeItem('tacticos_store_shipping_zones');
    localStorage.removeItem('tacticos_store_driver_earnings');
    localStorage.removeItem('tacticos_driver_available');
    localStorage.removeItem('tacticos_store_settings');
    toast.info('Datos restaurados a valores de fábrica para Bolivia');
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        products,
        alerts,
        orders,
        shippingZones,
        driverEarnings,
        isDriverAvailable,
        storeSettings,
        updateStoreSettings,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        addShippingZone,
        updateShippingZone,
        deleteShippingZone,
        resetShippingZonesToDefaults,
        createOrder,
        adminSetOrderStatus,
        adminAssignDriver,
        driverAcceptOrder,
        driverPickupOrder,
        driverInTransit,
        driverDeliverOrder,
        rateDriver,
        cancelOrder,
        toggleDriverAvailability,
        settleDriverEarnings,
        resolveAlert,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
