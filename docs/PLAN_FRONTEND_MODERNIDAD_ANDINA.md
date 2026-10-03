# 🎨 Plan de Implementación Frontend — Paseo Aranjuez "Modernidad Andina"

> **Rama de desarrollo:** `feature/modernidad-andina`  
> **Enfoque:** 100% Frontend, Experiencia Visual "WOW", Micro-animaciones, Identidad Cochabambina.  
> **Stack:** Next.js 16 · Tailwind CSS v4 · Framer Motion / GSAP · Lucide Icons · Google Fonts (Montserrat & Inter).

---

## 🏛️ 1. Identidad Visual: "Modernidad Andina"

### Paleta de Colores Oficial
* **Naranja Vesubio (Primario):** `#B84D0B` — Color institucional cálido, acentos principales y CTAs.
* **Naranja Brillante (Resplandor):** `#FF6B1A` — Hovers, destellos LED y gradientes.
* **Negro Perla (Fondo Principal):** `#061734` — Elegancia oscura, headers y tarjetas premium.
* **Negro Profundo (Contraste):** `#030B1A` — Fondo base de máxima profundidad.
* **Blanco Puro:** `#FFFFFF` — Textos de alta legibilidad y contrastes limpios.

### Colores de Apoyo y Gamificación
* **Dorado Andino (Nivel Oro):** `#D4A24C`
* **Verde Oliva (Sostenibilidad):** `#7A8B5C`
* **Plata (Nivel Plata):** `#C0C7D1`
* **Bronce (Nivel Bronce):** `#A9714B`
* **Platino (Nivel Platino):** `#8E9AAF`
* **Verde Éxito:** `#22C55E`
* **Rojo Alerta:** `#EF4444`

### Efectos Signature
1. **Luces LED de Fachada (`.led-effect`):** Gradiente animado continuo que emula la iluminación exterior de la torre.
2. **Resplandor Pulsante QR (`.pulse-qr`):** Efecto de respiración lumínica para facilitar lectura en escáneres.
3. **Patrón Andino Tiahuanacota:** Textura geométrica SVG sutil inspirada en la Puerta del Sol (opacidad 3-5%).
4. **Glassmorphism Cálido (`.glass-andino`):** `backdrop-filter: blur(20px)` con borde micro-reflectante.

---

## 📋 2. Lista de Tareas Paso a Paso (Checklist)

### 🧱 FASE 1: Design System & Tokens Base
- [x] **1.1. Tipografía Google Fonts:** Configurar Montserrat (Títulos/Display) e Inter (Cuerpo) en `layout.tsx`.
- [ ] **1.2. Tokens en `globals.css`:** Registrar paleta Modernidad Andina, gradientes y utilidades en `@theme`.
- [ ] **1.3. Animaciones Core en CSS:** Crear keyframes para `@keyframes led-glow`, `@keyframes pulse-qr` y `@keyframes float-orb`.
- [ ] **1.4. Textura Andina SVG:** Crear el patrón geométrico escalonado para fondos y separadores.

---

### ✨ FASE 2: Componentes WOW Signature
- [ ] **2.1. Orbe de Jarvis Interactivo (`JarvisOrb.tsx`):**
  - Orbe de partículas que reacciona a interacciones (Idle, Escuchando, Pensando, Hablando).
  - Ondas de voz circulares y gradiente naranja vesubio/dorado.
- [ ] **2.2. Modal de Mi QR con Brillo Pulsante (`QrPulsanteModal.tsx`):**
  - QR con marco luminoso animado y PIN de respaldo de 6 dígitos.
  - Botón "Aumentar Brillo" para lectura fácil en caja.
  - Nivel del usuario (Bronce/Plata/Oro) y puntos disponibles en vivo.
- [ ] **2.3. Contador de Puntos Animado (`PointsCounterWidget.tsx`):**
  - Conteo numérico animado (`count-up`) con tipografía Montserrat 900.
  - Efecto de destello de partículas doradas al incrementar saldo.
- [ ] **2.4. Animación de Confetti / Canje de Premio:**
  - Explosión de partículas al simular el canje de un beneficio.

---

### 🛍️ FASE 3: Módulos del Ecosistema
- [ ] **3.1. Navegación Principal (`NavbarPaseo.tsx`):**
  - Logo estilizado Paseo Aranjuez con línea LED inferior.
  - Enlaces rápidos: *PaseoYa (Marketplace)*, *Jarvis IA*, *Paseo Points*, *Cultura*.
  - Botón de acceso directo a "Mi QR" y selector de tema.
- [ ] **3.2. Hero Section "Modernidad Andina" (`AndeanHero.tsx`):**
  - Título con Montserrat 900 y gradiente signature.
  - Badge: *"Cochabamba, Bolivia · Ecosistema Digital Unificado"*.
  - Acciones principales: *"Explorar Tiendas"* y *"Hablar con Jarvis"*.
  - Tarjetas flotantes interactivas de los 3 pilares.
- [ ] **3.3. Showcase PaseoYa (`PaseoYaShowcase.tsx`):**
  - Selector de pisos: Piso 1, Piso 2 y Terraza Gastronómica.
  - Cards de productos con retiro Click & Collect (precio en Bs, ubicación de local físico).
  - Carrito flotante con cálculo de puntos a ganar.
- [ ] **3.4. Showcase Paseo Points (`PaseoPointsShowcase.tsx`):**
  - Barra de progreso de nivel (Bronce ➔ Plata ➔ Oro ➔ Platino).
  - Retos del mes (ej: *"Visita 3 tiendas = +200 pts"*).
  - Grid de recompensas canjeables con botón de prueba.
- [ ] **3.5. Asistente Jarvis Integrado (`JarvisChatWidget.tsx`):**
  - Widget flotante o modal embebido con chips de preguntas rápidas (*"¿Dónde comer?", "Buscar regalo"*).
  - Respuestas enriquecidas con tarjetas de tiendas y mapa de piso.
- [ ] **3.6. Sección Cultural y Arquitectura (`CulturalSection.tsx`):**
  - Narrativa visual: Inspiración Tiahuanacota, Muro de Sal y Fachada LED.
- [ ] **3.7. Footer Andino (`FooterPaseo.tsx`):**
  - Enlaces organizados, horarios de atención del mall y créditos de diseño.

---

### 📱 FASE 4: Pulido, Responsive y Experiencia Móvil
- [ ] **4.1. Mobile Navigation:** Bottom Nav bar para celulares (Inicio, Puntos, Jarvis, Tiendas, QR).
- [ ] **4.2. Micro-interacciones:** Hovers tipo scale (1.02), retroalimentación táctil de botones y loaders esqueleto.
- [ ] **4.3. Validación de Rendimiento:** Asegurar 60fps en animaciones CSS y verificar en pantalla móvil.

---
