// =============================================
// Demo / Seed Data — Works without Supabase
// Rich tactical product catalog for demo mode
// =============================================

import type {
  Product, Category, Order, OrderItem, Profile,
  AuditLog, SystemAlert, PaymentVerification, Notification,
  DailySalesSummary, ProductSalesSummary, CategorySalesSummary,
  ShippingZone, DriverEarning, DriverAvailability
} from './types';

// ============ CATEGORIES ============
export const demoCategories: Category[] = [
  { id: 'cat-01', name: 'Chalecos Tácticos', slug: 'chalecos-tacticos', description: 'Chalecos antibalas, porta-placas y plate carriers de grado militar', parent_id: null, position: 1, is_active: true, created_at: '2026-01-15T10:00:00Z' },
  { id: 'cat-02', name: 'Calzado Táctico', slug: 'calzado-tactico', description: 'Botas militares, de combate y operativas de alto rendimiento', parent_id: null, position: 2, is_active: true, created_at: '2026-01-15T10:00:00Z' },
  { id: 'cat-03', name: 'Óptica & Linternas', slug: 'optica-linternas', description: 'Miras holográficas, telescópicas, linternas tácticas y visión nocturna', parent_id: null, position: 3, is_active: true, created_at: '2026-01-15T10:00:00Z' },
  { id: 'cat-04', name: 'Mochilas & Bolsos', slug: 'mochilas-bolsos', description: 'Mochilas militares, bolsos MOLLE y fundas de transporte', parent_id: null, position: 4, is_active: true, created_at: '2026-01-15T10:00:00Z' },
  { id: 'cat-05', name: 'Accesorios Tácticos', slug: 'accesorios-tacticos', description: 'Guantes, rodilleras, cinturones, fundas y accesorios MOLLE', parent_id: null, position: 5, is_active: true, created_at: '2026-01-15T10:00:00Z' },
  { id: 'cat-06', name: 'Cuchillería', slug: 'cuchilleria', description: 'Cuchillos tácticos, navajas y herramientas de supervivencia', parent_id: null, position: 6, is_active: true, created_at: '2026-01-15T10:00:00Z' },
  { id: 'cat-07', name: 'Comunicaciones', slug: 'comunicaciones', description: 'Radios, auriculares tácticos y sistemas de comunicación', parent_id: null, position: 7, is_active: true, created_at: '2026-01-15T10:00:00Z' },
  { id: 'cat-08', name: 'Vestimenta Táctica', slug: 'vestimenta-tactica', description: 'Uniformes, pantalones cargo, camisetas y ropa táctica', parent_id: null, position: 8, is_active: true, created_at: '2026-01-15T10:00:00Z' },
];

// ============ DEFAULT STORE SETTINGS (COCHABAMBA, BOLIVIA) ============
export const defaultStoreSettings = {
  storeName: 'Tienda Táctica Cochabamba',
  currency: 'BOB',
  currencySymbol: 'Bs.',
  pickupAddress: 'Av. Heroínas #560 entre San Martín y 25 de Mayo, Zona Central, Cochabamba',
  pickupSchedule: 'Lunes a Sábado de 09:00 a 19:00 (Horario Continuo)',
  pickupInstructions: 'Presentar carnet de identidad o el código de tu orden al momento del recojo en nuestro almacén central de Cochabamba.',
  freeGiftName: 'Pack de Stickers Tácticos Exclusivos (Edición Especial — ¡Descúbrelos al recibir tu paquete!)',
  freeGiftValue: 35.00,
};

// ============ SHIPPING ZONES (COCHABAMBA & NACIONAL) ============
export const demoShippingZones: ShippingZone[] = [
  { id: 'zone-01', name: 'Cochabamba — Centro / Casco Viejo / Las Cuadras / San Pedro (Delivery)', department: 'Cochabamba', city: 'Cochabamba', shipping_cost: 12.00, driver_commission: 8.00, store_profit: 4.00, estimated_hours: 2, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'zone-02', name: 'Cochabamba — Zona Norte (Cala Cala, Queru Queru, Av. América, Tupuraya)', department: 'Cochabamba', city: 'Cochabamba', shipping_cost: 15.00, driver_commission: 10.00, store_profit: 5.00, estimated_hours: 3, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'zone-03', name: 'Cochabamba — Zona Sur (Jaihuayco, Lacma, La Chimba, Albarrancho)', department: 'Cochabamba', city: 'Cochabamba', shipping_cost: 15.00, driver_commission: 10.00, store_profit: 5.00, estimated_hours: 3, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'zone-04', name: 'Cochabamba Metropolitana — Quillacollo y Colcapirhua (Delivery Express)', department: 'Cochabamba', city: 'Quillacollo', shipping_cost: 20.00, driver_commission: 15.00, store_profit: 5.00, estimated_hours: 4, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'zone-05', name: 'Cochabamba Metropolitana — Sacaba (Delivery Express)', department: 'Cochabamba', city: 'Sacaba', shipping_cost: 20.00, driver_commission: 15.00, store_profit: 5.00, estimated_hours: 4, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'zone-06', name: 'Cochabamba Metropolitana — Tiquipaya (Delivery Express)', department: 'Cochabamba', city: 'Tiquipaya', shipping_cost: 18.00, driver_commission: 13.00, store_profit: 5.00, estimated_hours: 4, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'zone-07', name: 'Envío Nacional Flota — Desde Terminal de Buses Cbba (La Paz, Santa Cruz, Oruro, Sucre, Tarija, Potosí, Beni, Pando)', department: 'Nacional', city: 'Terminal Cochabamba', shipping_cost: 35.00, driver_commission: 25.00, store_profit: 10.00, estimated_hours: 24, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'zone-08', name: 'Envío Nacional Courier — Shalom / Expreso a Domicilio desde Cochabamba', department: 'Nacional', city: 'Bolivia Courier', shipping_cost: 40.00, driver_commission: 28.00, store_profit: 12.00, estimated_hours: 48, is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

// ============ DEMO PROFILES (ADMIN, DRIVERS, CLIENTS - BOLIVIA) ============
export const demoAdmin: Profile = {
  id: 'admin-01', email: 'admin@tacticos.bo', full_name: 'Comandante Dueño', phone: '+591 71234567', avatar_url: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
};

export const demoVendor: Profile = {
  id: 'vendor-01', email: 'driver1@tacticos.bo', full_name: 'Carlos Mendoza (Driver Táctico)', phone: '+591 76543210', avatar_url: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
};

export const demoDrivers: Profile[] = [
  demoVendor,
  { id: 'driver-02', email: 'driver2@tacticos.bo', full_name: 'Marcos Rivas (Motorizado Alfa)', phone: '+591 79876543', avatar_url: null, created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
];

export const demoClient: Profile = {
  id: 'client-01', email: 'cliente@tacticos.bo', full_name: 'Juan Operativo', phone: '+591 75512345', avatar_url: null, created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z'
};

// ============ PRODUCTS ============
export const demoProducts: Product[] = [
  {
    id: 'prod-01', name: 'Plate Carrier Táctico Nivel IV', description: 'Porta-placas táctico con sistema MOLLE completo. Compatible con placas balísticas NIJ IV. Ajuste rápido con velcro y hebillas. Color: Multicam. Ideal para operaciones de alto riesgo y entrenamiento avanzado.',
    price: 289.99, stock: 15, low_stock_threshold: 3, category_id: 'cat-01', images: ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-09-15T10:00:00Z', deleted_at: null, category: demoCategories[0]
  },
  {
    id: 'prod-02', name: 'Botas Tácticas Desert Storm', description: 'Botas de combate con suela Vibram, membrana impermeable Gore-Tex, puntera reforzada. Altura: 8 pulgadas. Color: Arena. Perfectas para terrenos desérticos y operaciones prolongadas.',
    price: 179.99, stock: 22, low_stock_threshold: 5, category_id: 'cat-02', images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-03-05T10:00:00Z', updated_at: '2026-09-10T10:00:00Z', deleted_at: null, category: demoCategories[1]
  },
  {
    id: 'prod-03', name: 'Mira Holográfica EOTech XPS3', description: 'Mira holográfica de punto rojo con retícula 68 MOA. Compatible con visión nocturna NV. Sumergible hasta 10 metros. Batería CR123A incluida. Construcción de aluminio aeronáutico.',
    price: 599.99, stock: 8, low_stock_threshold: 2, category_id: 'cat-03', images: ['https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-03-10T10:00:00Z', updated_at: '2026-09-12T10:00:00Z', deleted_at: null, category: demoCategories[2]
  },
  {
    id: 'prod-04', name: 'Mochila Táctica 72h Assault Pack', description: 'Mochila de asalto 45L con sistema MOLLE integral, compartimento para hidratación 3L, múltiples bolsillos organizadores y correas de compresión. Color: OD Green. Cordura 1000D.',
    price: 129.99, stock: 30, low_stock_threshold: 5, category_id: 'cat-04', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-03-15T10:00:00Z', updated_at: '2026-09-08T10:00:00Z', deleted_at: null, category: demoCategories[3]
  },
  {
    id: 'prod-05', name: 'Guantes Tácticos Oakley SI Assault', description: 'Guantes de operaciones especiales con protección en nudillos de carbono, palma antideslizante con refuerzo Kevlar y compatibilidad con pantalla táctil. Tallas: M a XL.',
    price: 64.99, stock: 45, low_stock_threshold: 10, category_id: 'cat-05', images: ['https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-04-01T10:00:00Z', updated_at: '2026-09-05T10:00:00Z', deleted_at: null, category: demoCategories[4]
  },
  {
    id: 'prod-06', name: 'Cuchillo KA-BAR USMC Full Size', description: 'Cuchillo de combate USMC legendario con hoja de acero al carbono 1095 Cro-Van de 7 pulgadas. Mango de cuero apilado. Incluye funda Kydex de retención positiva.',
    price: 89.99, stock: 18, low_stock_threshold: 3, category_id: 'cat-06', images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-04-10T10:00:00Z', updated_at: '2026-09-01T10:00:00Z', deleted_at: null, category: demoCategories[5]
  },
  {
    id: 'prod-07', name: 'Radio Baofeng UV-5R Tactical Kit', description: 'Radio bidireccional dual-band VHF/UHF con 128 canales programables, batería Li-ion 1800mAh y alcance operativo hasta 5km. Incluye auricular táctico de tubo acústico y antena extendida.',
    price: 39.99, stock: 50, low_stock_threshold: 10, category_id: 'cat-07', images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-04-15T10:00:00Z', updated_at: '2026-08-28T10:00:00Z', deleted_at: null, category: demoCategories[6]
  },
  {
    id: 'prod-08', name: 'Pantalón Cargo Táctico Ripstop', description: 'Pantalón de combate con tela ripstop reforzada 65/35 poly-cotton, rodilleras integradas removibles, 8 bolsillos cargo con cierre silencioso y cintura ajustable. Color: Khaki.',
    price: 54.99, stock: 60, low_stock_threshold: 10, category_id: 'cat-08', images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-04-20T10:00:00Z', updated_at: '2026-08-25T10:00:00Z', deleted_at: null, category: demoCategories[7]
  },
  {
    id: 'prod-09', name: 'Linterna Táctica SureFire G2X Pro', description: 'Linterna LED de 600 lúmenes con cuerpo de polímero Nitrolon, 2 modos (alto 600lm / bajo 15lm), bisel de acero inoxidable con corona táctica. 2x CR123A.',
    price: 79.99, stock: 4, low_stock_threshold: 5, category_id: 'cat-03', images: ['https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-05-01T10:00:00Z', updated_at: '2026-09-18T10:00:00Z', deleted_at: null, category: demoCategories[2]
  },
  {
    id: 'prod-10', name: 'Cinturón Táctico Rigger D-Ring', description: 'Cinturón de servicio con hebilla de liberación rápida V-Ring certificado para rappel, refuerzo interno rígido Scuba Webbing y sistema MOLLE. Ancho: 1.75". Color: Coyote Brown.',
    price: 44.99, stock: 35, low_stock_threshold: 5, category_id: 'cat-05', images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-05-05T10:00:00Z', updated_at: '2026-08-20T10:00:00Z', deleted_at: null, category: demoCategories[4]
  },
  {
    id: 'prod-11', name: 'Chaleco Táctico Ligero MOLLE', description: 'Chaleco táctico ligero con sistema MOLLE completo frontal y posterior, ventilación mesh interior, bolsillos para 6 cargadores y panel de administración con velcro.',
    price: 69.99, stock: 40, low_stock_threshold: 8, category_id: 'cat-01', images: ['https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-05-10T10:00:00Z', updated_at: '2026-08-15T10:00:00Z', deleted_at: null, category: demoCategories[0]
  },
  {
    id: 'prod-12', name: 'Kit de Supervivencia Táctico 15-en-1', description: 'Kit compacto con pedernal, brújula de orientación, sierra de cable, manta térmica aluminizada, silbato de emergencia, linterna mini y 10 herramientas más en estuche MOLLE.',
    price: 34.99, stock: 2, low_stock_threshold: 10, category_id: 'cat-06', images: ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80'], vendor_id: 'vendor-01', is_active: true, created_at: '2026-05-15T10:00:00Z', updated_at: '2026-09-19T10:00:00Z', deleted_at: null, category: demoCategories[5]
  },
];

// ============ ORDERS ============
const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export const demoDriverEarnings: DriverEarning[] = [
  { id: 'earn-01', driver_id: 'vendor-01', order_id: 'ord-001', amount: 10.00, zone_id: 'zone-01', status: 'paid', paid_at: daysAgo(20), created_at: daysAgo(24) },
  { id: 'earn-02', driver_id: 'vendor-01', order_id: 'ord-002', amount: 10.00, zone_id: 'zone-01', status: 'paid', paid_at: daysAgo(15), created_at: daysAgo(21) },
  { id: 'earn-03', driver_id: 'vendor-01', order_id: 'ord-006', amount: 15.00, zone_id: 'zone-02', status: 'pending', paid_at: null, created_at: daysAgo(6) },
];

export const demoOrders: Order[] = [
  {
    id: 'ord-001',
    user_id: 'client-01',
    vendor_id: 'vendor-01',
    driver_id: 'vendor-01',
    shipping_zone_id: 'zone-01',
    shipping_cost: 12.00,
    driver_commission: 8.00,
    status: 'delivered',
    total: 366.98,
    payment_method: 'qr',
    qr_code_data: null,
    created_at: daysAgo(28),
    paid_at: daysAgo(28),
    delivered_at: daysAgo(24),
    cancelled_at: null,
    cancellation_reason: null,
    internal_notes: null,
    customer_name: 'Juan Operativo',
    customer_phone: '+591 75512345',
    customer_email: 'cliente@tacticos.bo',
    customer_address: 'Av. América Este #820 esq. Pando, Edif. Torre Norte Dpto 4B, Cala Cala, Cochabamba',
    delivery_notes: 'Dejar en recepción del edificio a nombre de Juan.',
    customer_rating: 5,
    customer_review: '¡Entrega táctica impecable y súper rápida en Cala Cala! El repartidor fue muy amable.'
  },
  {
    id: 'ord-002',
    user_id: 'client-01',
    vendor_id: 'vendor-01',
    driver_id: 'vendor-01',
    shipping_zone_id: 'zone-01',
    shipping_cost: 12.00,
    driver_commission: 8.00,
    status: 'delivered',
    total: 611.99,
    payment_method: 'qr',
    qr_code_data: null,
    created_at: daysAgo(25),
    paid_at: daysAgo(25),
    delivered_at: daysAgo(21),
    cancelled_at: null,
    cancellation_reason: null,
    internal_notes: null,
    customer_name: 'Juan Operativo',
    customer_phone: '+591 75512345',
    customer_email: 'cliente@tacticos.bo',
    customer_address: 'Calle Baptista #340 esq. Mayor Rocha, Zona Central, Cochabamba',
    delivery_notes: null,
    customer_rating: 5,
    customer_review: 'Todo excelente, paquete blindado y bien protegido.'
  },
  {
    id: 'ord-003',
    user_id: 'client-01',
    vendor_id: 'vendor-01',
    driver_id: 'vendor-01',
    shipping_zone_id: 'zone-04',
    shipping_cost: 20.00,
    driver_commission: 15.00,
    status: 'in_transit',
    total: 214.98,
    payment_method: 'cash_on_delivery',
    qr_code_data: null,
    created_at: daysAgo(1),
    paid_at: null,
    delivered_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    internal_notes: 'Repartidor en ruta hacia Quillacollo.',
    customer_name: 'Santiago Bravo',
    customer_phone: '+591 76598765',
    customer_email: 'santiago@tacticos.bo',
    customer_address: 'Av. Blanco Galindo Km 11, acera sur, Quillacollo, Cochabamba',
    delivery_notes: 'Cobrar Bs. 214.98 en efectivo o QR al entregar.',
    customer_rating: null,
    customer_review: null
  },
  {
    id: 'ord-004',
    user_id: 'client-01',
    vendor_id: 'vendor-01',
    driver_id: 'vendor-01',
    shipping_zone_id: 'zone-02',
    shipping_cost: 15.00,
    driver_commission: 10.00,
    status: 'picked_up',
    total: 144.99,
    payment_method: 'qr',
    qr_code_data: null,
    created_at: daysAgo(2),
    paid_at: daysAgo(2),
    delivered_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    internal_notes: 'Pedido recogido de almacén central de Av. Heroínas por Carlos.',
    customer_name: 'Renzo Palacios',
    customer_phone: '+591 78911223',
    customer_email: 'renzo@gmail.com',
    customer_address: 'Av. Libertador Bolívar #1420, Condominio Sarco, Cochabamba',
    delivery_notes: 'Llamar al número antes de ingresar al condominio.',
    customer_rating: null,
    customer_review: null
  },
  {
    id: 'ord-005',
    user_id: 'client-01',
    vendor_id: null,
    driver_id: null,
    shipping_zone_id: 'zone-01',
    shipping_cost: 12.00,
    driver_commission: 8.00,
    status: 'ready',
    total: 101.99,
    payment_method: 'qr',
    qr_code_data: null,
    created_at: daysAgo(1),
    paid_at: daysAgo(1),
    delivered_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    internal_notes: 'Empacado y listo para retiro en centro de distribución Heroínas.',
    customer_name: 'Carlos Villarroel',
    customer_phone: '+591 71133557',
    customer_email: 'carlos.v@tacticos.bo',
    customer_address: 'Av. Heroínas #560 entre San Martín y 25 de Mayo (Retiro en Tienda), Cochabamba',
    delivery_notes: 'Retira personalmente en almacén central de Cochabamba.',
    customer_rating: null,
    customer_review: null
  },
  {
    id: 'ord-006',
    user_id: 'client-01',
    vendor_id: 'vendor-01',
    driver_id: 'vendor-01',
    shipping_zone_id: 'zone-05',
    shipping_cost: 20.00,
    driver_commission: 15.00,
    status: 'delivered',
    total: 264.97,
    payment_method: 'qr',
    qr_code_data: null,
    created_at: daysAgo(10),
    paid_at: daysAgo(10),
    delivered_at: daysAgo(6),
    cancelled_at: null,
    cancellation_reason: null,
    internal_notes: null,
    customer_name: 'Juan Operativo',
    customer_phone: '+591 75512345',
    customer_email: 'cliente@tacticos.bo',
    customer_address: 'Av. Villazón Km 3, Huayllani, Sacaba, Cochabamba',
    delivery_notes: null,
    customer_rating: 4,
    customer_review: 'Buen servicio motorizado a Sacaba, llegó puntual.'
  },
  {
    id: 'ord-007',
    user_id: 'client-01',
    vendor_id: null,
    driver_id: null,
    shipping_zone_id: 'zone-07',
    shipping_cost: 35.00,
    driver_commission: 25.00,
    status: 'preparing',
    total: 504.98,
    payment_method: 'qr',
    qr_code_data: null,
    created_at: daysAgo(0),
    paid_at: daysAgo(0),
    delivered_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    internal_notes: 'En empaque de equipo especial para despacho por Flota a Santa Cruz.',
    customer_name: 'Fernando Paz',
    customer_phone: '+591 72244668',
    customer_email: 'fernando@tacticos.bo',
    customer_address: 'Terminal Bimodal Santa Cruz de la Sierra (Despacho desde Terminal Cbba)',
    delivery_notes: 'Enviar guía de encomienda escaneada por WhatsApp.',
    customer_rating: null,
    customer_review: null
  },
  {
    id: 'ord-008',
    user_id: 'client-01',
    vendor_id: null,
    driver_id: null,
    shipping_zone_id: 'zone-06',
    shipping_cost: 18.00,
    driver_commission: 13.00,
    status: 'pending',
    total: 177.98,
    payment_method: 'qr',
    qr_code_data: 'QR-SESSION-008',
    created_at: daysAgo(0),
    paid_at: null,
    delivered_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    internal_notes: null,
    customer_name: 'Juan Operativo',
    customer_phone: '+591 75512345',
    customer_email: 'cliente@tacticos.bo',
    customer_address: 'Av. Ecológica #450, Tiquipaya, Cochabamba',
    delivery_notes: null,
    customer_rating: null,
    customer_review: null
  },
];

export const demoOrderItems: OrderItem[] = [
  { id: 'oi-001', order_id: 'ord-001', product_id: 'prod-01', quantity: 1, unit_price: 289.99, subtotal: 289.99 },
  { id: 'oi-002', order_id: 'ord-001', product_id: 'prod-05', quantity: 1, unit_price: 64.99, subtotal: 64.99 },
  { id: 'oi-003', order_id: 'ord-002', product_id: 'prod-03', quantity: 1, unit_price: 599.99, subtotal: 599.99 },
  { id: 'oi-004', order_id: 'ord-003', product_id: 'prod-04', quantity: 1, unit_price: 129.99, subtotal: 129.99 },
  { id: 'oi-005', order_id: 'ord-003', product_id: 'prod-05', quantity: 1, unit_price: 64.99, subtotal: 64.99 },
  { id: 'oi-006', order_id: 'ord-004', product_id: 'prod-04', quantity: 1, unit_price: 129.99, subtotal: 129.99 },
  { id: 'oi-007', order_id: 'ord-006', product_id: 'prod-02', quantity: 1, unit_price: 179.99, subtotal: 179.99 },
  { id: 'oi-008', order_id: 'ord-006', product_id: 'prod-05', quantity: 1, unit_price: 64.99, subtotal: 64.99 },
  { id: 'oi-009', order_id: 'ord-007', product_id: 'prod-01', quantity: 1, unit_price: 289.99, subtotal: 289.99 },
  { id: 'oi-010', order_id: 'ord-007', product_id: 'prod-02', quantity: 1, unit_price: 179.99, subtotal: 179.99 },
  { id: 'oi-011', order_id: 'ord-008', product_id: 'prod-09', quantity: 2, unit_price: 79.99, subtotal: 159.98 },
  { id: 'oi-012', order_id: 'ord-009', product_id: 'prod-01', quantity: 1, unit_price: 289.99, subtotal: 289.99 },
  { id: 'oi-013', order_id: 'ord-009', product_id: 'prod-10', quantity: 1, unit_price: 44.99, subtotal: 44.99 },
  { id: 'oi-014', order_id: 'ord-010', product_id: 'prod-05', quantity: 1, unit_price: 64.99, subtotal: 64.99 },
];

// ============ PAYMENT VERIFICATIONS ============
export const demoPayments: PaymentVerification[] = [
  { id: 'pv-001', order_id: 'ord-001', qr_session_id: 'qs-001', device_id: 'mobile-vendor', status: 'verified', verified_at: daysAgo(28), notification_sent_at: daysAgo(28), notification_error: null, verified_by: 'vendor-01', created_at: daysAgo(28) },
  { id: 'pv-002', order_id: 'ord-002', qr_session_id: 'qs-002', device_id: 'mobile-vendor', status: 'verified', verified_at: daysAgo(25), notification_sent_at: daysAgo(25), notification_error: null, verified_by: 'vendor-01', created_at: daysAgo(25) },
  { id: 'pv-003', order_id: 'ord-003', qr_session_id: 'qs-003', device_id: 'mobile-vendor', status: 'verified', verified_at: daysAgo(20), notification_sent_at: daysAgo(20), notification_error: null, verified_by: 'vendor-01', created_at: daysAgo(20) },
  { id: 'pv-004', order_id: 'ord-004', qr_session_id: 'qs-004', device_id: 'mobile-vendor', status: 'verified', verified_at: daysAgo(15), notification_sent_at: daysAgo(15), notification_error: null, verified_by: 'vendor-01', created_at: daysAgo(15) },
  { id: 'pv-005', order_id: 'ord-006', qr_session_id: 'qs-006', device_id: 'mobile-vendor', status: 'verified', verified_at: daysAgo(10), notification_sent_at: daysAgo(10), notification_error: null, verified_by: 'vendor-01', created_at: daysAgo(10) },
  { id: 'pv-006', order_id: 'ord-007', qr_session_id: 'qs-007', device_id: 'mobile-vendor', status: 'verified', verified_at: daysAgo(5), notification_sent_at: daysAgo(5), notification_error: null, verified_by: 'vendor-01', created_at: daysAgo(5) },
  { id: 'pv-007', order_id: 'ord-008', qr_session_id: 'qs-008', device_id: null, status: 'pending', verified_at: null, notification_sent_at: null, notification_error: null, verified_by: null, created_at: daysAgo(2) },
  { id: 'pv-008', order_id: 'ord-009', qr_session_id: 'qs-009', device_id: null, status: 'pending', verified_at: null, notification_sent_at: null, notification_error: null, verified_by: null, created_at: daysAgo(1) },
  { id: 'pv-009', order_id: 'ord-010', qr_session_id: 'qs-010', device_id: null, status: 'pending', verified_at: null, notification_sent_at: null, notification_error: null, verified_by: null, created_at: daysAgo(0) },
];

// ============ AUDIT LOGS ============
export const demoAuditLogs: AuditLog[] = [
  { id: 'al-001', user_id: 'admin-01', action: 'INSERT', entity: 'products', entity_id: 'prod-01', before: null, after: { name: 'Plate Carrier Táctico Nivel IV', price: 289.99 }, ip: '192.168.1.10', user_agent: 'Mozilla/5.0', created_at: daysAgo(30) },
  { id: 'al-002', user_id: 'vendor-01', action: 'UPDATE', entity: 'products', entity_id: 'prod-09', before: { stock: 25 }, after: { stock: 4 }, ip: '192.168.1.15', user_agent: 'Mozilla/5.0', created_at: daysAgo(5) },
  { id: 'al-003', user_id: 'vendor-01', action: 'UPDATE', entity: 'orders', entity_id: 'ord-003', before: { status: 'paid' }, after: { status: 'shipped' }, ip: '192.168.1.15', user_agent: 'Expo/Mobile', created_at: daysAgo(18) },
  { id: 'al-004', user_id: 'admin-01', action: 'UPDATE', entity: 'user_roles', entity_id: 'vendor-01', before: { role: 'client' }, after: { role: 'vendor' }, ip: '192.168.1.10', user_agent: 'Mozilla/5.0', created_at: daysAgo(60) },
  { id: 'al-005', user_id: 'vendor-01', action: 'UPDATE', entity: 'payment_verifications', entity_id: 'pv-006', before: { status: 'pending' }, after: { status: 'verified' }, ip: '192.168.1.15', user_agent: 'Expo/Mobile', created_at: daysAgo(5) },
];

// ============ SYSTEM ALERTS ============
export const demoAlerts: SystemAlert[] = [
  { id: 'sa-001', type: 'low_stock', severity: 'critical', message: 'Kit de Supervivencia Táctico — Stock crítico: 2 unidades en almacén Cbba', resolved: false, resolved_by: null, created_at: daysAgo(1), resolved_at: null },
  { id: 'sa-002', type: 'low_stock', severity: 'warning', message: 'Linterna SureFire G2X Pro — Stock bajo: 4 unidades (umbral: 5)', resolved: false, resolved_by: null, created_at: daysAgo(2), resolved_at: null },
  { id: 'sa-003', type: 'pending_payment', severity: 'warning', message: 'Orden ORD-008 sin verificar por más de 48 horas', resolved: false, resolved_by: null, created_at: daysAgo(0), resolved_at: null },
  { id: 'sa-004', type: 'low_stock', severity: 'info', message: 'Botas Desert Storm restockeadas exitosamente en almacén Central', resolved: true, resolved_by: 'admin-01', created_at: daysAgo(10), resolved_at: daysAgo(10) },
];

// ============ NOTIFICATIONS ============
export const demoNotifications: Notification[] = [
  { id: 'not-001', user_id: 'admin-01', title: 'Nuevo pedido recibido', body: 'Orden #ORD-010 por Bs. 64.99 — Juan Táctico (Cochabamba)', type: 'order', read: false, link: '/admin/sales', created_at: daysAgo(0) },
  { id: 'not-002', user_id: 'admin-01', title: 'Stock bajo', body: 'Kit de Supervivencia Táctico tiene solo 2 unidades', type: 'alert', read: false, link: '/admin/products', created_at: daysAgo(1) },
  { id: 'not-003', user_id: 'admin-01', title: 'Pago verificado', body: 'Orden #ORD-007 verificada — Bs. 504.98 (Envío a Terminal)', type: 'payment', read: true, link: '/admin/payments', created_at: daysAgo(5) },
];

// ============ METRICS ============
export const demoDailySales: DailySalesSummary[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(now.getTime() - (29 - i) * 86400000).toISOString().split('T')[0],
  total_sales: Math.round((Math.random() * 800 + 200) * 100) / 100,
  order_count: Math.floor(Math.random() * 8 + 1),
  avg_ticket: Math.round((Math.random() * 200 + 50) * 100) / 100,
  unique_customers: Math.floor(Math.random() * 6 + 1),
}));

export const demoProductSales: ProductSalesSummary[] = demoProducts.map(p => ({
  product_id: p.id,
  product_name: p.name,
  category_id: p.category_id || '',
  total_sold: Math.floor(Math.random() * 50 + 5),
  total_revenue: Math.round((Math.random() * 5000 + 500) * 100) / 100,
  order_count: Math.floor(Math.random() * 30 + 3),
})).sort((a, b) => b.total_revenue - a.total_revenue);

export const demoCategorySales: CategorySalesSummary[] = demoCategories.map(c => ({
  category_id: c.id,
  category_name: c.name,
  total_sales: Math.round((Math.random() * 10000 + 1000) * 100) / 100,
  order_count: Math.floor(Math.random() * 40 + 5),
}));
