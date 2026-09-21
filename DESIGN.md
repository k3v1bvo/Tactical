# DESIGN SYSTEM — TIENDA TÁCTICA PRO

Sistema de diseño integral, técnico y cinematográfico para e-commerce táctico militar de nivel de agencia internacional (estilo Arc'teryx, 5.11 Tactical, TAD Gear, Linear).

---

## 1. Tokens de Color

```css
:root {
  /* Fondos y Superficies */
  --color-bg-primary: #0A0A0B;        /* Negro casi puro, base cinematográfica */
  --color-bg-secondary: #141416;      /* Superficies elevadas y panels */
  --color-bg-tertiary: #1C1C1F;       /* Cards, modales y drop-downs */

  /* Bordes */
  --color-border: #26262A;            /* Bordes técnicos sutiles (1px) */
  --color-border-strong: #3A3A40;     /* Bordes destacados y hover states */

  /* Tipografía */
  --color-text-primary: #F5F5F7;      /* Blanco roto de alto contraste */
  --color-text-secondary: #A1A1AA;    /* Gris técnico secundario */
  --color-text-muted: #6B6B72;        /* Texto terciario y placeholders */

  /* Acento Primario — Dorado Mate Táctico */
  --color-accent: #C8A961;            /* Dorado mate táctico premium */
  --color-accent-hover: #D9BC78;      /* Dorado más luminoso al interactuar */
  --color-accent-dim: rgba(200, 169, 97, 0.15); /* Glow y badges sutiles */

  /* Estados Funcionales */
  --color-danger: #E5484D;            /* Rojo alerta táctica / stock agotado */
  --color-success: #30A46C;           /* Verde verificación / pago confirmado */
  --color-warning: #F5A623;           /* Ámbar aviso / stock crítico */
}
```

---

## 2. Tipografía y Jerarquía

- **Display / Titulares**: `'Space Grotesk'`, `'Inter'`, sans-serif. Estilo técnico, uppercase, tracking ajustado (`letter-spacing: -0.02em` o `0.05em`).
- **Cuerpo de Texto**: `'Inter'`, sans-serif con pesos 400 (regular), 500 (medium) y 600 (semibold). `line-height: 1.6`.
- **Códigos, Telemetría y Precios**: `'JetBrains Mono'`, `'Fira Code'`, monospace. Para IDs de órdenes, coordenadas, seriales militares y datos técnicos.

---

## 3. Espaciado y Ritmo

- **Escala base de 4px**: `4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px, 128px`.
- **Secciones Landing**: Padding vertical mínimo de `96px` en desktop y `64px` en móvil.
- **Ancho Máximo**: `1280px` centrado con padding horizontal de seguridad (`16px` a `32px`).

---

## 4. Sombras, Profundidad y Acabados

- **Glassmorphism**: `backdrop-filter: blur(16px)` con fondos semi-transparentes `rgba(20, 20, 22, 0.75)` y borde `1px solid rgba(255, 255, 255, 0.07)`.
- **HUD Reticular**: Malla milimétrica técnica de fondo (`grid-pattern`) con acento tenue dorado.
- **Elevación de Cards**: `translateY(-4px)` y borde intensificado `--color-border-strong` en hover.
- **Radios**:
  - `4px` (small): Badges técnicos y tags.
  - `8px` (medium): Botones, inputs y selectores.
  - `16px` (large): Cards de producto, contenedores y modales.
  - `9999px` (pill): Status badges y switches.
