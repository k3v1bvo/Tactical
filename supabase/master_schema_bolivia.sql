-- =========================================================================================
-- TIENDA TÁCTICA BOLIVIA — MASTER DATABASE SCHEMA DEFINITIVO
-- Copia y pega este script completo en el SQL Editor de tu proyecto Supabase
-- Contiene: Tablas, Roles RBAC, RLS, Auditoría, Logística Bolivia (Bs.), Repartidores,
--           Notificaciones Bancarias Android, QRs Fijos y Verificación con IA Gemini
-- =========================================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS Y ENUMS
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'vendor', 'client');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'paid', 'preparing', 'ready', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. ROLES DE USUARIO
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 5. CATEGORÍAS DE PRODUCTO
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id text REFERENCES categories(id) ON DELETE SET NULL,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. PRODUCTOS TÁCTICOS (Imágenes guardadas como enlaces URL de ImgBB)
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric(10,2) NOT NULL,              -- Precio oficial en Bolivianos (Bs.)
  category_id text REFERENCES categories(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',                 -- Array de URLs de ImgBB (la imagen real se aloja en ImgBB)
  stock integer NOT NULL DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  sku text UNIQUE,
  is_active boolean DEFAULT true,
  vendor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. ZONAS DE ENVÍO (BOLIVIA - Tarifas en Bs. y Comisiones de Repartidores)
CREATE TABLE IF NOT EXISTS shipping_zones (
  id text PRIMARY KEY DEFAULT ('zone-' || substr(md5(random()::text), 1, 8)),
  name text NOT NULL,                         -- Ej: 'La Paz — Zona Sur (Calacoto, Achumani)'
  department text,                            -- 'La Paz', 'Santa Cruz', 'Cochabamba', etc.
  city text,
  shipping_cost numeric(10,2) NOT NULL,       -- Cobrado al cliente (Bs.)
  driver_commission numeric(10,2) NOT NULL,   -- Ganancia directa del chofer (Bs.)
  store_profit numeric(10,2) GENERATED ALWAYS AS (shipping_cost - driver_commission) STORED,
  estimated_hours integer DEFAULT 24,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 8. ÓRDENES / VENTAS (Adaptadas a Bolivia con 3 tipos de entrega y pagos 100% vs 50/50)
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,               -- Monto total en Bolivianos (Bs.)
  
  -- Logística Bolivia (3 Modalidades)
  delivery_type text DEFAULT 'delivery',       -- 'pickup' (Almacén Central), 'delivery' (Moto Ciudad), 'national_shipping' (Flota)
  pickup_time text,                           -- Horario seleccionado para recojo en tienda
  pickup_location text,                       -- Dirección central del almacén
  destination_department text,                -- Destino para envíos por flota
  shipping_zone_id text REFERENCES shipping_zones(id) ON DELETE SET NULL,
  shipping_cost numeric(10,2) DEFAULT 0,
  
  -- Finanzas y Modalidad de Pago (100% vs 50/50 vs Contra Entrega)
  payment_mode text DEFAULT 'full_payment',    -- 'full_payment' (100% QR), 'partial_payment' (50/50), 'cash_on_delivery'
  payment_method text DEFAULT 'qr_simple',
  paid_amount numeric(10,2) DEFAULT 0,        -- Pagado anticipado por QR
  pending_amount numeric(10,2) DEFAULT 0,     -- Saldo a cobrar al entregar
  free_gift text,                             -- Regalo táctico sorpresa si pagó 100%
  voucher_url text,                           -- Comprobante alojado en ImgBB
  qr_code_data text,
  
  -- Repartidor Asignado y Tracking
  driver_id text,
  driver_commission numeric(10,2) DEFAULT 0,
  delivered_at timestamptz,
  delivery_notes text,
  
  -- Datos de Contacto del Receptor
  customer_name text,
  customer_phone text,                        -- Teléfono con WhatsApp (+591)
  customer_email text,
  customer_address text,
  internal_notes text,
  
  -- Calificación del Cliente
  customer_rating integer CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. ITEMS DE LA ORDEN
CREATE TABLE IF NOT EXISTS order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,          -- Precio unitario en Bs.
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 10. LIQUIDACIONES DE COMISIONES PARA REPARTIDORES
CREATE TABLE IF NOT EXISTS driver_earnings (
  id text PRIMARY KEY DEFAULT ('earn-' || substr(md5(random()::text), 1, 8)),
  driver_id text NOT NULL,
  order_id text REFERENCES orders(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,              -- Comisión ganada en Bs.
  zone_id text REFERENCES shipping_zones(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',              -- 'pending', 'paid'
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 11. CONFIGURACIÓN DE LA TIENDA (Horarios, Dirección y Regalo Sorpresa)
CREATE TABLE IF NOT EXISTS store_settings (
  id text PRIMARY KEY DEFAULT 'main',
  store_name text DEFAULT 'Tienda Táctica Cochabamba',
  currency text DEFAULT 'BOB',
  currency_symbol text DEFAULT 'Bs.',
  pickup_address text DEFAULT 'Av. Heroínas #560 entre San Martín y 25 de Mayo, Zona Central, Cochabamba',
  pickup_schedule text DEFAULT 'Lunes a Sábado de 09:00 a 19:00 (Horario Continuo)',
  pickup_instructions text DEFAULT 'Presentar carnet de identidad o el código de tu orden al momento del recojo en nuestro almacén central de Cochabamba.',
  free_gift_name text DEFAULT 'Souvenir Táctico Sorpresa Oficial (Edición Especial)',
  free_gift_min_amount numeric(10,2) DEFAULT 0,
  is_gift_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- 12. NOTIFICACIONES BANCARIAS CAPTURADAS POR LA APP ANDROID
CREATE TABLE IF NOT EXISTS bank_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,                    -- 'BNB', 'BCP', 'Banco Unión', 'BMSC', etc.
  raw_text text NOT NULL,                     -- Texto completo de la notificación del celular
  amount numeric(10,2) NOT NULL,              -- Monto en Bs.
  sender_name text,                           -- Nombre del depositante si la notificación lo incluye
  transaction_ref text,                       -- Nro de transacción
  received_at timestamptz DEFAULT now(),
  status text DEFAULT 'unmatched',            -- 'unmatched', 'matched', 'flagged'
  matched_order_id text REFERENCES orders(id) ON DELETE SET NULL,
  confidence_score numeric(5,2) DEFAULT 0,
  device_id text,
  created_at timestamptz DEFAULT now()
);

-- 13. QRs PRE-GENERADOS POR MONTOS ESPECÍFICOS (Subidos por el Dueño)
CREATE TABLE IF NOT EXISTS fixed_amount_qrs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(10,2) NOT NULL,              -- Monto exacto (ej. 15.00, 50.00, 289.99)
  qr_image_url text NOT NULL,                 -- Imagen del QR alojada en ImgBB
  bank_name text DEFAULT 'Simple QR Bolivia',
  account_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 14. VERIFICACIONES DE PAGO CON INTELIGENCIA ARTIFICIAL (GEMINI OCR)
CREATE TABLE IF NOT EXISTS payment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  voucher_url text NOT NULL,                  -- Comprobante del cliente en ImgBB
  gemini_extracted_data jsonb,                -- Datos leídos por Gemini Vision (monto, fecha, banco, ref)
  bank_notification_id uuid REFERENCES bank_notifications(id) ON DELETE SET NULL,
  match_status text DEFAULT 'pending',        -- 'matched_auto', 'discrepancy_amount', 'manual_approved'
  ai_analysis_notes text,
  verified_by text DEFAULT 'gemini_vision',
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 15. ALERTAS DEL SISTEMA (Stock crítico, verificación pendiente)
CREATE TABLE IF NOT EXISTS system_alerts (
  id text PRIMARY KEY DEFAULT ('alt-' || substr(md5(random()::text), 1, 8)),
  severity alert_severity NOT NULL,
  message text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 16. LOGS DE AUDITORÍA
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- =========================================================================================
-- SEMILLAS INICIALES (ZONAS DE BOLIVIA Y CONFIGURACIÓN)
-- =========================================================================================

INSERT INTO store_settings (id, store_name, currency, currency_symbol, pickup_address, pickup_schedule, free_gift_name)
VALUES (
  'main',
  'Tienda Táctica Cochabamba',
  'BOB',
  'Bs.',
  'Av. Heroínas #560 entre San Martín y 25 de Mayo, Zona Central, Cochabamba',
  'Lunes a Sábado de 09:00 a 19:00 (Horario Continuo)',
  'Souvenir Táctico Sorpresa Oficial (Edición Especial)'
)
ON CONFLICT (id) DO UPDATE SET
  currency = EXCLUDED.currency,
  currency_symbol = EXCLUDED.currency_symbol,
  pickup_address = EXCLUDED.pickup_address,
  pickup_schedule = EXCLUDED.pickup_schedule;

INSERT INTO shipping_zones (id, name, department, city, shipping_cost, driver_commission, estimated_hours, is_active)
VALUES
  ('zone-01', 'Cochabamba — Centro / Casco Viejo / Las Cuadras / San Pedro (Delivery)', 'Cochabamba', 'Cochabamba', 12.00, 8.00, 2, true),
  ('zone-02', 'Cochabamba — Zona Norte (Cala Cala, Queru Queru, Av. América, Tupuraya)', 'Cochabamba', 'Cochabamba', 15.00, 10.00, 3, true),
  ('zone-03', 'Cochabamba — Zona Sur (Jaihuayco, Lacma, La Chimba, Albarrancho)', 'Cochabamba', 'Cochabamba', 15.00, 10.00, 3, true),
  ('zone-04', 'Cochabamba Metropolitana — Quillacollo y Colcapirhua (Delivery Express)', 'Cochabamba', 'Quillacollo', 20.00, 15.00, 4, true),
  ('zone-05', 'Cochabamba Metropolitana — Sacaba (Delivery Express)', 'Cochabamba', 'Sacaba', 20.00, 15.00, 4, true),
  ('zone-06', 'Cochabamba Metropolitana — Tiquipaya (Delivery Express)', 'Cochabamba', 'Tiquipaya', 18.00, 13.00, 4, true),
  ('zone-07', 'Envío Nacional Flota — Desde Terminal de Buses Cbba (La Paz, Santa Cruz, Oruro, Sucre, Tarija, Potosí, Beni, Pando)', 'Nacional', 'Terminal Cochabamba', 35.00, 25.00, 24, true),
  ('zone-08', 'Envío Nacional Courier — Shalom / Expreso a Domicilio desde Cochabamba', 'Nacional', 'Bolivia Courier', 40.00, 28.00, 48, true)
ON CONFLICT (id) DO NOTHING;

-- Categorías tácticas de ejemplo
INSERT INTO categories (id, name, slug, description, position, is_active)
VALUES
  ('cat-01', 'Chalecos Balísticos & Porta Placas', 'chalecos-tacticos', 'Chalecos tácticos, porta placas balísticas y chest rigs', 1, true),
  ('cat-02', 'Mochilas & Bolsos Tácticos', 'mochilas-tacticas', 'Mochilas militares, morrales tácticos y bolsas de hidratación', 2, true),
  ('cat-03', 'Calzado & Botas Militares', 'calzado-tactico', 'Botas tácticas policiales, militares y de montaña', 3, true),
  ('cat-04', 'Óptica & Linternas Tácticas', 'optica-e-iluminacion', 'Miras holográficas, linternas tácticas y binoculares', 4, true),
  ('cat-05', 'Protección & Cascos', 'proteccion-personal', 'Cascos balísticos, rodilleras, coderas y guantes tácticos', 5, true),
  ('cat-06', 'Cuchillería & Herramientas EDC', 'cuchilleria', 'Cuchillos tácticos, navajas de rescate y kits de supervivencia', 6, true)
ON CONFLICT (id) DO NOTHING;

-- Productos tácticos iniciales (Precios oficiales en Bs.)
INSERT INTO products (id, name, slug, description, price, category_id, images, stock, low_stock_threshold, is_active)
VALUES
  ('prod-01', 'Plate Carrier Táctico Nivel IV', 'plate-carrier-tactico-nivel-iv', 'Porta-placas táctico con sistema MOLLE completo. Compatible con placas balísticas NIJ IV. Ajuste rápido con velcro y hebillas. Color: Multicam.', 289.99, 'cat-01', '{"https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80"}', 15, 3, true),
  ('prod-02', 'Botas Tácticas Desert Storm', 'botas-tacticas-desert-storm', 'Botas de combate con suela Vibram, membrana impermeable Gore-Tex, puntera reforzada. Altura: 8 pulgadas.', 179.99, 'cat-03', '{"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"}', 22, 5, true),
  ('prod-03', 'Mira Holográfica EOTech XPS3', 'mira-holografica-eotech-xps3', 'Mira holográfica de punto rojo con retícula 68 MOA. Compatible con visión nocturna NV. Sumergible hasta 10 metros.', 599.99, 'cat-04', '{"https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=80"}', 8, 2, true),
  ('prod-04', 'Mochila Táctica 72h Assault Pack', 'mochila-tactica-72h-assault-pack', 'Mochila de asalto 45L con sistema MOLLE integral, compartimento para hidratación 3L y correas de compresión. Cordura 1000D.', 129.99, 'cat-02', '{"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"}', 30, 5, true),
  ('prod-05', 'Guantes Tácticos Oakley SI Assault', 'guantes-tacticos-oakley-si-assault', 'Guantes de operaciones especiales con protección en nudillos de carbono, palma antideslizante con refuerzo Kevlar.', 64.99, 'cat-05', '{"https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&auto=format&fit=crop&q=80"}', 45, 10, true),
  ('prod-06', 'Cuchillo KA-BAR USMC Full Size', 'cuchillo-kabar-usmc-full-size', 'Cuchillo de combate con hoja de acero al carbono 1095 Cro-Van de 7 pulgadas. Incluye funda Kydex de retención positiva.', 89.99, 'cat-06', '{"https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80"}', 18, 3, true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_amount_qrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para catálogo y zonas
CREATE POLICY "Lectura publica categorias" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Gestion admin categorias" ON categories FOR ALL USING (true);

CREATE POLICY "Lectura publica productos" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Gestion admin productos" ON products FOR ALL USING (true);

CREATE POLICY "Lectura publica zonas" ON shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Gestion admin zonas" ON shipping_zones FOR ALL USING (true);

CREATE POLICY "Lectura publica ajustes tienda" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Gestion admin ajustes tienda" ON store_settings FOR ALL USING (true);

CREATE POLICY "Lectura publica QRs fijos" ON fixed_amount_qrs FOR SELECT USING (is_active = true);
CREATE POLICY "Gestion admin QRs fijos" ON fixed_amount_qrs FOR ALL USING (true);

CREATE POLICY "Insertar notificaciones desde app Android" ON bank_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura y gestion notificaciones bancarias" ON bank_notifications FOR ALL USING (true);

CREATE POLICY "Crear ordenes clientes y anonimos" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura general ordenes" ON orders FOR SELECT USING (true);
CREATE POLICY "Actualizar ordenes" ON orders FOR UPDATE USING (true);

CREATE POLICY "Insertar items orden" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura items orden" ON order_items FOR SELECT USING (true);

CREATE POLICY "Lectura y registro comprobantes" ON payment_verifications FOR ALL USING (true);

CREATE POLICY "Lectura publica perfiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Actualizar perfil propio" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Lectura roles usuario" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Gestion admin roles" ON user_roles FOR ALL USING (true);

CREATE POLICY "Lectura comisiones repartidor" ON driver_earnings FOR SELECT USING (true);
CREATE POLICY "Gestion comisiones repartidor" ON driver_earnings FOR ALL USING (true);

-- Trigger para crear automáticamente el perfil al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
