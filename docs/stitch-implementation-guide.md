# Stitch Redesign Implementation Guide

> Guia completa para convertir los diseños de Stitch (HTML + Tailwind) en React inline styles.
> Creada por el agente UX/UI para que DEV pueda implementar sin ambigüedades.

---

## A. Design Tokens — CSS Custom Properties

Reemplazar TODAS las variables en `web/src/index.css`. Los nombres antiguos (`--bg`, `--surface`, etc.) se eliminan y se reemplazan por el sistema de tokens de Stitch.

### A.1 Colores

```css
:root {
  /* === Surface System (Material Design 3) === */
  --bg: #10131a;
  --surface: #10131a;
  --surface-dim: #10131a;
  --surface-bright: #363941;
  --surface-container-lowest: #0b0e15;
  --surface-container-low: #191b23;
  --surface-container: #1d2027;
  --surface-container-high: #272a31;
  --surface-container-highest: #32353c;
  --surface-variant: #32353c;

  /* === Text Colors === */
  --on-surface: #e0e2ec;
  --on-surface-variant: #c2c6d6;
  --on-background: #e0e2ec;
  --outline: #8c909f;
  --outline-variant: #424753;

  /* === Primary (Blue) === */
  --primary: #adc6ff;
  --on-primary: #002e6a;
  --primary-container: #4d8eff;
  --on-primary-container: #00285d;
  --primary-fixed: #d8e2ff;
  --primary-fixed-dim: #adc6ff;

  /* === Secondary (Lavender) === */
  --secondary: #c0c1ff;
  --on-secondary: #292b5e;
  --secondary-container: #424479;
  --on-secondary-container: #b2b3f0;

  /* === Tertiary (Orange) === */
  --tertiary: #ffb786;
  --on-tertiary: #502501;
  --tertiary-container: #c28255;

  /* === Error === */
  --error: #ffb4ab;
  --on-error: #690005;
  --error-container: #93000a;

  /* === Semantic (Stock Status) === */
  --success: #50d890;
  --success-bg: rgba(80, 216, 144, 0.1);
  --success-border: rgba(80, 216, 144, 0.2);
  --warning: #ffb786;
  --warning-bg: rgba(255, 183, 134, 0.1);
  --danger: #ffb4ab;
  --danger-bg: rgba(255, 180, 171, 0.1);
  --danger-border: rgba(255, 180, 171, 0.2);

  /* === Legacy aliases (mantener compatibilidad temporal) === */
  --text: #e0e2ec;
  --text-muted: #c2c6d6;
  --border: #424753;
}
```

### A.2 Tipografía

```css
:root {
  /* === Font Families === */
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-data: 'Geist Mono', 'SF Mono', 'Fira Code', monospace;

  /* === Font Sizes (Display) === */
  --text-display-lg: 40px;
  --line-display-lg: 48px;

  /* === Font Sizes (Headline) === */
  --text-headline-md: 24px;
  --line-headline-md: 32px;
  --text-headline-sm: 20px;
  --line-headline-sm: 28px;

  /* === Font Sizes (Body) === */
  --text-body-md: 16px;
  --line-body-md: 24px;
  --text-body-sm: 14px;
  --line-body-sm: 20px;

  /* === Font Sizes (Data — Geist Mono) === */
  --text-data-lg: 18px;
  --line-data-lg: 24px;
  --text-data-md: 14px;
  --line-data-md: 20px;
  --text-data-sm: 12px;
  --line-data-sm: 16px;

  /* === Font Sizes (Labels) === */
  --text-label-caps: 11px;
  --line-label-caps: 16px;
  --tracking-label: 0.05em;
}
```

### A.3 Spacing

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --gutter: 24px;
  --margin-mobile: 16px;
  --margin-desktop: 32px;
}
```

### A.4 Border Radius

```css
:root {
  --radius-sm: 4px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

### A.5 Shadows & Elevation

```css
:root {
  --shadow-card: none; /* Stitch usa tonal layering, no sombras */
  --shadow-modal: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-glow-primary: 0 0 15px rgba(173, 198, 255, 0.3);
  --shadow-glow-success: 0 0 20px rgba(80, 216, 144, 0.2);
}
```

---

## B. Global CSS — `web/src/index.css` completo

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* === Design Tokens === */
:root {
  /* Surface System */
  --bg: #10131a;
  --surface: #10131a;
  --surface-dim: #10131a;
  --surface-bright: #363941;
  --surface-container-lowest: #0b0e15;
  --surface-container-low: #191b23;
  --surface-container: #1d2027;
  --surface-container-high: #272a31;
  --surface-container-highest: #32353c;
  --surface-variant: #32353c;

  /* Text */
  --on-surface: #e0e2ec;
  --on-surface-variant: #c2c6d6;
  --on-background: #e0e2ec;
  --outline: #8c909f;
  --outline-variant: #424753;

  /* Primary */
  --primary: #adc6ff;
  --on-primary: #002e6a;
  --primary-container: #4d8eff;
  --on-primary-container: #00285d;

  /* Secondary */
  --secondary: #c0c1ff;
  --on-secondary: #292b5e;
  --secondary-container: #424479;
  --on-secondary-container: #b2b3f0;

  /* Tertiary */
  --tertiary: #ffb786;
  --on-tertiary: #502501;

  /* Error */
  --error: #ffb4ab;
  --on-error: #690005;

  /* Semantic */
  --success: #50d890;
  --success-bg: rgba(80, 216, 144, 0.1);
  --success-border: rgba(80, 216, 144, 0.2);
  --warning: #ffb786;
  --warning-bg: rgba(255, 183, 134, 0.1);
  --danger: #ffb4ab;
  --danger-bg: rgba(255, 180, 171, 0.1);

  /* Typography */
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-data: 'Geist Mono', 'SF Mono', monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --gutter: 24px;
  --margin-mobile: 16px;
  --margin-desktop: 32px;

  /* Radius */
  --radius-sm: 4px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-modal: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);

  /* Transitions */
  --transition: 0.15s ease;

  /* Legacy aliases */
  --text: #e0e2ec;
  --text-muted: #c2c6d6;
  --border: #424753;
  --surface-hover: #252932;
}

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--on-surface);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

#root {
  min-height: 100vh;
  display: flex;
}

button {
  cursor: pointer;
  font-family: inherit;
  border: none;
  background: none;
}

input, select, textarea {
  font-family: var(--font-body);
  background: var(--surface);
  color: var(--on-surface);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius);
  padding: 8px 12px;
  font-size: 14px;
  line-height: 20px;
  transition: border-color var(--transition), box-shadow var(--transition);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-container);
  box-shadow: 0 0 0 1px var(--primary-container);
}

a {
  color: var(--primary);
  text-decoration: none;
}

/* === Custom Scrollbar === */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg);
}

::-webkit-scrollbar-thumb {
  background: var(--surface-variant);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--outline-variant);
}

/* === Glass Panel Effect === */
.glass-panel {
  background: rgba(29, 32, 39, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(66, 71, 84, 0.5);
}

/* === Animations === */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slideOutRight {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## C. Mapeo de Componentes por Página

### C.1 Layout (Sidebar + Header + Mobile Nav)

#### Sidebar — Cambios vs Actual

**Ancho:** 220px → **240px**

**Sidebar nuevo (`Layout.tsx`):**

```tsx
// Estructura del sidebar
<aside style={{
  height: '100vh',
  width: 240,
  display: 'none', // hidden md:flex → se maneja con isMobile
  flexDirection: 'column',
  background: 'var(--surface-container)', // #1d2027
  borderRight: '1px solid rgba(66, 71, 84, 0.5)',
  padding: 'var(--space-lg) var(--space-md)', // py-lg px-md
  flexShrink: 0,
}}>
```

**Logo/Header del sidebar:**

```tsx
<div style={{ marginBottom: 'var(--space-xl)', paddingLeft: 'var(--space-sm)', paddingRight: 'var(--space-sm)' }}>
  <h1 style={{
    fontFamily: 'var(--font-body)',
    fontSize: 24, // text-headline-md
    lineHeight: 32,
    fontWeight: 700,
    color: 'var(--primary)', // #adc6ff
    letterSpacing: '-0.01em',
  }}>TUSTOCK</h1>
  <p style={{
    fontFamily: 'var(--font-body)',
    fontSize: 14, // text-body-sm
    lineHeight: 20,
    color: 'var(--on-surface-variant)',
  }}>Gestión Minorista</p>
</div>
```

**Nav items — Estilo inactive:**

```tsx
// Cada nav item (inactive)
<a style={{
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)', // 16px
  padding: 'var(--space-sm) var(--space-md)', // 8px 16px
  borderRadius: 'var(--radius)', // 8px
  color: 'var(--on-surface-variant)',
  fontFamily: 'var(--font-body)',
  fontSize: 16, // text-body-md
  lineHeight: 24,
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'background var(--transition)',
}}>

// Nav item — Active state
<a style={{
  ...sameAsAbove,
  color: 'var(--primary)',
  fontWeight: 700,
  borderRight: '2px solid var(--primary)',
  background: 'var(--surface-container-highest)', // #32353c
}}>
```

**Nav icons:** Usar Material Symbols Outlined (via CSS `font-variation-settings`):

```tsx
// Icono en nav item
<span className="material-symbols-outlined" style={{ fontSize: 24 }}>
  dashboard
</span>

// Icono activo (filled)
<span className="material-symbols-outlined" style={{
  fontSize: 24,
  fontVariationSettings: "'FILL' 1",
}}>payments</span>
```

> **Nota sobre Material Symbols:** El `className="material-symbols-outlined"` requiere que el font esté cargado en `index.html`:
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
> ```
> Y en CSS global:
> ```css
> .material-symbols-outlined {
>   font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
>   vertical-align: middle;
> }
> ```

**Separador + Bottom items:**

```tsx
// Separador
<div style={{
  borderTop: '1px solid rgba(66, 71, 84, 0.3)',
  marginTop: 'var(--space-lg)',
  paddingTop: 'var(--space-md)',
}}>
```

**User Profile widget (nuevo):**

```tsx
<div style={{
  padding: 'var(--space-sm)',
  background: 'var(--surface-container-low)',
  borderRadius: 'var(--radius-xl)', // 24px
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
}}>
  <div style={{
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    objectFit: 'cover',
    border: '1px solid var(--outline-variant)',
  }}>
    {/* Avatar image */}
  </div>
  <div style={{ overflow: 'hidden' }}>
    <p style={{
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--on-surface)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }}>Nombre</p>
    <p style={{
      fontSize: 10,
      color: 'var(--on-surface-variant)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    }}>Administrador</p>
  </div>
</div>
```

#### Header (Top Bar) — Nuevo

**Altura:** 52px → **64px (h-16)**

```tsx
<header style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  height: 64,
  paddingLeft: 'var(--margin-mobile)', // 16px mobile
  paddingRight: 'var(--margin-mobile)',
  // En desktop: paddingLeft/Right: 'var(--margin-desktop)' (32px)
  position: 'sticky',
  top: 0,
  zIndex: 40,
  background: 'rgba(16, 19, 26, 0.8)', // bg/80
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(66, 71, 84, 0.5)',
}}>
```

**Search bar en header (Desktop):**

```tsx
<div style={{
  display: 'flex',
  background: 'var(--surface-container)',
  borderRadius: 'var(--radius-full)',
  paddingLeft: 'var(--space-md)',
  paddingRight: 'var(--space-md)',
  paddingTop: 'var(--space-xs)',
  paddingBottom: 'var(--space-xs)',
  border: '1px solid var(--outline-variant)',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  minWidth: 320,
}}>
  <span className="material-symbols-outlined" style={{ color: 'var(--outline)', fontSize: 20 }}>search</span>
  <input
    placeholder="Buscá productos, ventas o clientes..."
    style={{
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'var(--on-surface)',
      fontSize: 14,
      fontFamily: 'var(--font-body)',
      width: '100%',
    }}
  />
</div>
```

**Header actions (right side):**

```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
  {/* Notification bell */}
  <button style={{
    padding: 'var(--space-sm)',
    color: 'var(--on-surface-variant)',
    borderRadius: 'var(--radius-full)',
    transition: 'all var(--transition)',
  }}>
    <span className="material-symbols-outlined">notifications</span>
  </button>

  {/* CTA Button */}
  <button style={{
    background: 'var(--primary-container)', // #4d8eff
    color: 'var(--on-primary-container)',
    paddingLeft: 'var(--space-lg)',
    paddingRight: 'var(--space-lg)',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    borderRadius: 'var(--radius-full)',
    fontWeight: 700,
    fontSize: 14,
    transition: 'all var(--transition)',
    boxShadow: '0 4px 12px rgba(77, 142, 255, 0.2)',
  }}>Nueva Venta</button>
</div>
```

#### Mobile Bottom Nav (Nuevo)

```tsx
<nav style={{
  display: 'flex', // solo en mobile: md:hidden
  justifyContent: 'space-around',
  alignItems: 'center',
  width: '100%',
  height: 64,
  paddingLeft: 'var(--margin-mobile)',
  paddingRight: 'var(--margin-mobile)',
  background: 'var(--surface-container)',
  borderTop: '1px solid rgba(66, 71, 84, 0.5)',
  position: 'fixed',
  bottom: 0,
  zIndex: 50,
}}>
  {/* Nav items: Dashboard, Productos, [FAB], Ventas, Ajustes */}
  {/* El FAB central: */}
  <div style={{ position: 'relative', top: -16 }}>
    <button style={{
      width: 56,
      height: 56,
      background: 'var(--primary-container)',
      color: 'var(--on-primary-container)',
      borderRadius: 'var(--radius-full)',
      boxShadow: '0 4px 16px rgba(77, 142, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.15s ease',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 32 }}>add</span>
    </button>
  </div>
</nav>
```

**Mobile bottom nav items:**

```tsx
// Cada item del bottom nav
<a style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
  textDecoration: 'none',
}}>
  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>dashboard</span>
  <span style={{
    fontSize: 10,
    fontWeight: isActive ? 700 : 500,
  }}>Dashboard</span>
</a>
```

---

### C.2 Dashboard.tsx

#### Estructura general

```
flex h-screen
├── Sidebar (240px)
└── Main content (flex-1, flex-col, overflow-hidden)
    ├── Header (64px, sticky)
    └── Content scrollable (flex-1, overflow-y-auto, padding 16px mobile / 32px desktop)
        └── max-w 1400px, mx-auto, space-y 32px
            ├── Welcome section
            ├── KPI Grid (4 cols)
            └── Content Grid (8/4 split)
                ├── Low Stock Table (8 cols)
                └── Quick Actions + Chart (4 cols)
```

#### Welcome Section (Nuevo)

```tsx
<section style={{ marginBottom: 'var(--space-xl)' }}>
  <h2 style={{
    fontFamily: 'var(--font-body)',
    fontSize: 40, // display-lg
    lineHeight: '48px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--on-surface)',
    marginBottom: 'var(--space-xs)',
  }}>Buen día, {userName}</h2>
  <p style={{
    fontFamily: 'var(--font-body)',
    fontSize: 16, // body-md
    lineHeight: 24,
    color: 'var(--on-surface-variant)',
  }}>Revisá el rendimiento de hoy y gestioná tu inventario.</p>
</section>
```

#### KPI Cards (Rediseño completo)

**Grid:** `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` con gap 24px. En desktop: `repeat(4, 1fr)`.

```tsx
// KPI Grid wrapper
<section style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)', // mobile
  gap: 'var(--gutter)', // 24px
  // En sm: repeat(2, 1fr)
  // En lg: repeat(4, 1fr)
}}>
```

**Cada KPI Card:**

```tsx
<div style={{
  background: 'var(--surface-container)', // #1d2027
  padding: 'var(--space-lg)', // 24px
  borderRadius: 'var(--radius-lg)', // 16px
  border: '1px solid rgba(66, 71, 84, 0.5)',
  position: 'relative',
  overflow: 'hidden',
}}>
  {/* Icon overlay — top right, 20% opacity */}
  <div style={{
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 'var(--space-md)',
    opacity: 0.2,
  }}>
    <span className="material-symbols-outlined" style={{
      color: 'var(--primary)', // var(--secondary), var(--tertiary), var(--outline) según KPI
      fontSize: 40, // text-4xl equiv
    }}>payments</span>
  </div>

  {/* Label */}
  <p style={{
    fontFamily: 'var(--font-body)',
    fontSize: 11, // label-caps
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--on-surface-variant)',
    marginBottom: 'var(--space-xs)',
  }}>VENTAS HOY</p>

  {/* Value */}
  <h3 style={{
    fontFamily: 'var(--font-data)', // Geist Mono
    fontSize: 40, // display-lg size for KPI values
    lineHeight: '48px',
    fontWeight: 700,
    color: 'var(--primary)', // secondary, tertiary, on-surface según KPI
  }}>$ 142.500</h3>

  {/* Trend indicator */}
  <div style={{
    marginTop: 'var(--space-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--success)', // #50d890 para positivo, error para negativo, on-surface-variant para neutral
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
    12.5% vs ayer
  </div>
</div>
```

**Colores por KPI:**
| KPI | Icon color | Value color | Trend color |
|-----|-----------|-------------|-------------|
| Ventas Hoy | `var(--primary)` | `var(--primary)` | `var(--success)` (positivo) |
| Transacciones | `var(--secondary)` | `var(--secondary)` | `var(--on-surface-variant)` (neutral) |
| Artículos | `var(--tertiary)` | `var(--tertiary)` | `var(--success)` (positivo) |
| Ticket Promedio | `var(--outline)` | `var(--on-surface)` | `var(--error)` (negativo) |

#### Low Stock Table (Rediseñada)

```tsx
// Table wrapper
<div style={{
  background: 'var(--surface-container)',
  borderRadius: 'var(--radius-lg)', // 16px
  border: '1px solid rgba(66, 71, 84, 0.5)',
  overflow: 'hidden',
}}>
  {/* Table header */}
  <thead>
    <tr style={{
      borderBottom: '1px solid rgba(66, 71, 84, 0.3)',
      background: 'rgba(39, 42, 49, 0.5)', // surface-container-high/50
    }}>
      <th style={tableHeaderStyle}>PRODUCTO</th>
      <th style={tableHeaderStyle}>CATEGORÍA</th>
      <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>STOCK ACTUAL</th>
      <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>ESTADO</th>
      <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>ACCIÓN</th>
    </tr>
  </thead>
</div>

const tableHeaderStyle: React.CSSProperties = {
  padding: 'var(--space-md)',
  fontFamily: 'var(--font-body)',
  fontSize: 11,
  lineHeight: 16,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--on-surface-variant)',
  textAlign: 'left',
}
```

**Table row (hover state):**

```tsx
<tr style={{
  borderBottom: '1px solid rgba(66, 71, 84, 0.3)',
  transition: 'background var(--transition)',
}}
onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-highest)'}
onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
>
```

**Product cell with thumbnail:**

```tsx
<td style={{ padding: 'var(--space-md)' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
    {/* Thumbnail placeholder */}
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-container-low)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(66, 71, 84, 0.5)',
    }}>
      <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>image</span>
    </div>
    <div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>
        {product.name}
      </p>
      <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
        SKU: {product.code}
      </p>
    </div>
  </div>
</td>
```

**Category tag:**

```tsx
<span style={{
  paddingLeft: 'var(--space-sm)',
  paddingRight: 'var(--space-sm)',
  paddingTop: 2,
  paddingBottom: 2,
  background: 'rgba(66, 68, 121, 0.3)', // secondary-container/30
  color: 'var(--secondary)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
}}>{category}</span>
```

**Stock status badges:**

```tsx
// Stock Bajo
<span style={{
  paddingLeft: 'var(--space-md)',
  paddingRight: 'var(--space-md)',
  paddingTop: 'var(--space-xs)',
  paddingBottom: 'var(--space-xs)',
  borderRadius: 'var(--radius-full)',
  fontSize: 11,
  fontWeight: 700,
  background: 'rgba(255, 183, 134, 0.1)', // tertiary/10
  color: 'var(--tertiary)',
}}>Stock Bajo</span>

// Agotado
<span style={{
  ...same,
  background: 'rgba(255, 180, 171, 0.1)', // error/10
  color: 'var(--error)',
}}>Agotado</span>
```

**Stock value typography (Geist Mono):**

```tsx
<td style={{
  padding: 'var(--space-md)',
  fontFamily: 'var(--font-data)',
  fontSize: 14, // data-md
  lineHeight: 20,
  fontWeight: 500,
  textAlign: 'right',
  color: isLow ? 'var(--tertiary)' : isOut ? 'var(--error)' : 'var(--on-surface)',
}}>{quantity}</td>
```

#### Quick Actions Panel (Rediseñado)

```tsx
// Quick action button — Primary (Nueva Venta)
<button style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--space-lg)',
  background: 'rgba(173, 198, 255, 0.1)', // primary/10
  border: '1px solid rgba(173, 198, 255, 0.3)', // primary/30
  borderRadius: 'var(--radius-lg)',
  transition: 'all var(--transition)',
  cursor: 'pointer',
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
    <div style={{
      width: 48,
      height: 48,
      background: 'var(--primary-container)', // #4d8eff
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius)', // 12px
      boxShadow: '0 4px 12px rgba(77, 142, 255, 0.2)',
    }}>
      <span className="material-symbols-outlined" style={{ color: 'var(--on-primary-container)' }}>add_shopping_cart</span>
    </div>
    <div style={{ textAlign: 'left' }}>
      <p style={{ fontWeight: 700, color: 'var(--primary)' }}>Nueva venta</p>
      <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Cargá una operación rápida</p>
    </div>
  </div>
  <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>chevron_right</span>
</button>

// Quick action button — Standard (otros)
<button style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--space-lg)',
  background: 'var(--surface-container)',
  border: '1px solid rgba(66, 71, 84, 0.5)',
  borderRadius: 'var(--radius-lg)',
  transition: 'all var(--transition)',
  cursor: 'pointer',
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
    <div style={{
      width: 48,
      height: 48,
      background: 'var(--surface-container-highest)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius)',
      border: '1px solid rgba(66, 71, 84, 0.5)',
    }}>
      <span className="material-symbols-outlined" style={{ color: 'var(--on-surface)' }}>add_box</span>
    </div>
    <div style={{ textAlign: 'left' }}>
      <p style={{ fontWeight: 700, color: 'var(--on-surface)' }}>Agregá producto</p>
      <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Ingresá stock al catálogo</p>
    </div>
  </div>
  <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>chevron_right</span>
</button>
```

#### Mini Chart Card (Nuevo)

```tsx
<div style={{
  background: 'var(--surface-container)',
  padding: 'var(--space-lg)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid rgba(66, 71, 84, 0.5)',
  marginTop: 'var(--space-xl)',
}}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
    <h5 style={{
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      lineHeight: 16,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: 'var(--on-surface-variant)',
    }}>TENDENCIA DE VENTAS</h5>
    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>+12%</span>
  </div>

  {/* Bar chart */}
  <div style={{
    height: 128,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'var(--space-xs)',
  }}>
    {[40, 60, 30, 80, 50, 90, 100].map((height, i) => (
      <div key={i} style={{
        flex: 1,
        background: i === 6 ? 'var(--primary-container)' : 'rgba(173, 198, 255, 0.2)',
        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
        height: `${height}%`,
        boxShadow: i === 6 ? '0 0 15px rgba(173, 198, 255, 0.3)' : 'none',
        transition: 'all 0.3s ease',
      }} />
    ))}
  </div>

  <p style={{
    marginTop: 'var(--space-md)',
    fontSize: 10,
    textAlign: 'center',
    color: 'var(--on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  }}>Últimos 7 días</p>
</div>
```

---

### C.3 Products.tsx

#### Page Header (con breadcrumb)

```tsx
<div style={{
  display: 'flex',
  flexDirection: 'column', // mobile
  // En md: flexDirection: 'row', alignItems: 'end'
  justifyContent: 'space-between',
  gap: 'var(--space-lg)',
  marginBottom: 'var(--space-xl)',
}}>
  <div>
    {/* Breadcrumb */}
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-xs)',
      color: 'var(--outline)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      marginBottom: 'var(--space-xs)',
    }}>
      <span>INVENTARIO</span>
      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>chevron_right</span>
      <span style={{ color: 'var(--primary-fixed-dim)' }}>PRODUCTOS</span>
    </nav>

    <h2 style={{
      fontFamily: 'var(--font-body)',
      fontSize: 40,
      lineHeight: 48,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--on-surface)',
    }}>Gestión de Productos</h2>
  </div>

  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-md)' }}>
    {/* Toggle "Ver inactivos" */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      background: 'var(--surface-container-low)',
      padding: 'var(--space-xs)',
      borderRadius: 'var(--radius)',
      border: '1px solid rgba(66, 71, 84, 0.3)',
    }}>
      <span style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginLeft: 'var(--space-sm)' }}>Ver inactivos</span>
      {/* Toggle switch */}
      <button
        onClick={() => setShowInactive(!showInactive)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          height: 24,
          width: 44,
          alignItems: 'center',
          borderRadius: 'var(--radius-full)',
          background: showInactive ? 'var(--primary-container)' : 'var(--surface-container-highest)',
          transition: 'background var(--transition)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{
          display: 'inline-block',
          height: 16,
          width: 16,
          borderRadius: 'var(--radius-full)',
          background: showInactive ? 'var(--on-primary-container)' : 'var(--outline)',
          transition: 'transform var(--transition), background var(--transition)',
          transform: showInactive ? 'translateX(24px)' : 'translateX(4px)',
        }} />
      </button>
    </div>

    {/* "Nuevo producto" button */}
    <button style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      background: 'var(--primary-container)',
      color: 'var(--on-primary-container)',
      paddingLeft: 'var(--space-lg)',
      paddingRight: 'var(--space-lg)',
      paddingTop: 'var(--space-sm)',
      paddingBottom: 'var(--space-sm)',
      borderRadius: 'var(--radius)', // 8px
      fontWeight: 700,
      boxShadow: '0 4px 12px rgba(77, 142, 255, 0.2)',
      transition: 'all var(--transition)',
    }}>
      <span className="material-symbols-outlined">add</span>
      <span>Nuevo producto</span>
    </button>
  </div>
</div>
```

#### Filters & Stats Bento Row

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr', // mobile: 1 col
  // En md: gridTemplateColumns: '8fr 4fr'
  gap: 'var(--gutter)',
  marginBottom: 'var(--space-xl)',
}}>
  {/* Search & Filters */}
  <div style={{
    background: 'var(--surface-container)',
    border: '1px solid rgba(66, 71, 84, 0.5)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    // En md: flexDirection: 'row'
    gap: 'var(--space-lg)',
    alignItems: 'center',
  }}>
    {/* Search input */}
    <div style={{ position: 'relative', flex: 1, width: '100%' }}>
      <span className="material-symbols-outlined" style={{
        position: 'absolute',
        left: 'var(--space-md)',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--outline)',
        fontSize: 20,
      }}>search</span>
      <input
        placeholder="Filtrá por descripción, marca o EAN..."
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid rgba(66, 71, 84, 0.5)',
          borderRadius: 'var(--radius)',
          paddingLeft: 44,
          paddingRight: 'var(--space-md)',
          paddingTop: 'var(--space-sm)',
          paddingBottom: 'var(--space-sm)',
          color: 'var(--on-surface)',
          fontSize: 14,
          fontFamily: 'var(--font-body)',
          transition: 'border-color var(--transition), box-shadow var(--transition)',
        }}
      />
    </div>

    {/* Category select */}
    <select style={{
      width: '100%',
      // En md: width: 256
      background: 'var(--surface)',
      border: '1px solid rgba(66, 71, 84, 0.5)',
      borderRadius: 'var(--radius)',
      paddingLeft: 'var(--space-md)',
      paddingRight: 'var(--space-md)',
      paddingTop: 'var(--space-sm)',
      paddingBottom: 'var(--space-sm)',
      color: 'var(--on-surface)',
      fontSize: 14,
      appearance: 'none',
      cursor: 'pointer',
    }}>
      <option>Todas las categorías</option>
    </select>

    {/* "Más filtros" button */}
    <button style={{
      width: '100%',
      // En md: width: auto
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-sm)',
      outline: '1px solid var(--outline-variant)',
      color: 'var(--secondary-fixed-dim)',
      paddingLeft: 'var(--space-lg)',
      paddingRight: 'var(--space-lg)',
      paddingTop: 'var(--space-sm)',
      paddingBottom: 'var(--space-sm)',
      borderRadius: 'var(--radius)',
      fontWeight: 500,
      transition: 'background var(--transition)',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>filter_list</span>
      <span>Más filtros</span>
    </button>
  </div>

  {/* Quick Stats */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-md)',
  }}>
    <div style={{
      background: 'var(--surface-container)',
      border: '1px solid rgba(66, 71, 84, 0.5)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-md)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 'var(--space-xs)' }}>
        TOTAL ITEMS
      </span>
      <span style={{
        fontFamily: 'var(--font-data)',
        fontSize: 18, // data-lg
        lineHeight: 24,
        fontWeight: 600,
        color: 'var(--on-surface)',
      }}>{totalProducts}</span>
    </div>

    <div style={{
      background: 'var(--surface-container)',
      border: '1px solid rgba(66, 71, 84, 0.5)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-md)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--error)', marginBottom: 'var(--space-xs)' }}>
        SIN STOCK
      </span>
      <span style={{
        fontFamily: 'var(--font-data)',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: 600,
        color: 'var(--error)',
      }}>{outOfStockCount}</span>
    </div>
  </div>
</div>
```

#### Products Table — New Patterns

**Table container:**

```tsx
<div style={{
  background: 'var(--surface-container)',
  border: '1px solid rgba(66, 71, 84, 0.5)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
}}>
```

**Table header row:**

```tsx
<tr style={{
  borderBottom: '1px solid rgba(66, 71, 84, 0.5)',
  background: 'var(--surface-container-high)',
}}>
  <th style={productThStyle}>Barcode</th>
  <th style={productThStyle}>Producto / Descripción</th>
  <th style={productThStyle}>Precio</th>
  <th style={{ ...productThStyle, textAlign: 'center' }}>Stock</th>
  <th style={{ ...productThStyle, textAlign: 'center' }}>Estado</th>
  <th style={{ ...productThStyle, textAlign: 'right' }}>Acciones</th>
</tr>

const productThStyle: React.CSSProperties = {
  paddingLeft: 'var(--space-lg)',
  paddingRight: 'var(--space-lg)',
  paddingTop: 'var(--space-md)',
  paddingBottom: 'var(--space-md)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--outline)',
  textAlign: 'left',
}
```

**Barcode cell:**

```tsx
<td style={{ padding: '0 var(--space-lg)' }}>
  <div style={{
    width: 64,
    height: 40,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-xs)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(66, 71, 84, 0.2)',
    overflow: 'hidden',
  }}>
    <img src={`/api/products/${id}/barcode.png`} style={{
      height: '100%',
      objectFit: 'contain',
      mixBlendMode: 'screen',
      opacity: 0.8,
    }} />
  </div>
</td>
```

**Product name cell (two-line):**

```tsx
<td style={{ padding: '0 var(--space-lg)' }}>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span style={{
      color: 'var(--on-surface)',
      fontWeight: 600,
      fontFamily: 'var(--font-body)',
      fontSize: 16,
      lineHeight: 24,
    }}>{product.name}</span>
    <span style={{
      color: 'var(--outline)',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      lineHeight: 20,
    }}>{product.category} · {product.brand}</span>
  </div>
</td>
```

**Price (Geist Mono, green):**

```tsx
<td style={{ padding: '0 var(--space-lg)' }}>
  <span style={{
    fontFamily: 'var(--font-data)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    color: 'var(--success)', // #50d890
  }}>$ {price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
</td>
```

**Stock value (large Geist Mono):**

```tsx
<td style={{ padding: '0 var(--space-lg)', textAlign: 'center' }}>
  <span style={{
    fontFamily: 'var(--font-data)',
    fontSize: 18, // data-lg
    lineHeight: 24,
    fontWeight: 600,
    color: isOut ? 'var(--error)' : isLow ? 'var(--tertiary)' : 'var(--on-surface)',
  }}>{String(quantity).padStart(2, '0')}</span>
</td>
```

**Status badge (pill):**

```tsx
// EN STOCK
<span style={{
  display: 'inline-flex',
  alignItems: 'center',
  paddingLeft: 'var(--space-sm)',
  paddingRight: 'var(--space-sm)',
  paddingTop: 'var(--space-xs)',
  paddingBottom: 'var(--space-xs)',
  borderRadius: 'var(--radius-full)',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  background: 'rgba(80, 216, 144, 0.1)',
  color: 'var(--success)',
}}>EN STOCK</span>

// STOCK BAJO
<span style={{
  ...same,
  background: 'rgba(255, 183, 134, 0.1)',
  color: 'var(--tertiary)',
}}>STOCK BAJO</span>

// SIN STOCK
<span style={{
  ...same,
  background: 'rgba(255, 180, 171, 0.1)',
  color: 'var(--error)',
}}>SIN STOCK</span>
```

**Action buttons (inline in table):**

```tsx
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
  {/* Stock -1 */}
  <button style={{
    padding: 'var(--space-xs)',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(66, 71, 84, 0.5)',
    background: 'transparent',
    color: 'var(--on-surface-variant)',
    transition: 'all var(--transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>remove</span>
  </button>

  {/* Stock +1 */}
  <button style={{ ...sameAsAbove }}>
    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
  </button>

  {/* Edit */}
  <button style={{
    padding: 'var(--space-xs)',
    borderRadius: 'var(--radius)',
    background: 'var(--surface-container-highest)',
    color: 'var(--primary)',
    transition: 'all var(--transition)',
    marginLeft: 'var(--space-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
  </button>
</div>
```

#### Pagination Footer (Nuevo)

```tsx
<div style={{
  background: 'var(--surface-container-high)',
  paddingLeft: 'var(--space-lg)',
  paddingRight: 'var(--space-lg)',
  paddingTop: 'var(--space-md)',
  paddingBottom: 'var(--space-md)',
  borderTop: '1px solid rgba(66, 71, 84, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}}>
  <span style={{
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--on-surface-variant)',
  }}>Mostrando {from} de {total} productos</span>

  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
    <button style={paginationBtnStyle}>Anterior</button>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
      <button style={{ ...paginationBtnNum, background: 'var(--primary-container)', color: 'var(--on-primary-container)', fontWeight: 700 }}>1</button>
      <button style={paginationBtnNum}>2</button>
      <button style={paginationBtnNum}>3</button>
      <span style={{ color: 'var(--outline)', padding: '0 var(--space-xs)' }}>...</span>
      <button style={paginationBtnNum}>{totalPages}</button>
    </div>
    <button style={paginationBtnStyle}>Siguiente</button>
  </div>
</div>

const paginationBtnStyle: React.CSSProperties = {
  paddingLeft: 'var(--space-md)',
  paddingRight: 'var(--space-md)',
  paddingTop: 'var(--space-xs)',
  paddingBottom: 'var(--space-xs)',
  borderRadius: 'var(--radius)',
  border: '1px solid rgba(66, 71, 84, 0.5)',
  color: 'var(--on-surface-variant)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  lineHeight: 20,
  transition: 'background var(--transition)',
}

const paginationBtnNum: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 'var(--radius)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-data)',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--on-surface-variant)',
  transition: 'background var(--transition)',
}
```

---

### C.4 Sales.tsx (POS)

#### Layout general — Two-panel POS

```
flex h-screen overflow-hidden
├── Sidebar (240px)
└── Main (flex-1, flex-col)
    ├── Header (64px, with tab buttons)
    └── Content (flex-1, flex overflow-hidden)
        ├── Left: POS Main (flex-1, flex-col, p-lg, gap-lg, overflow-y-auto)
        │   ├── Scanner Input
        │   └── Cart Table
        └── Right: Summary Panel (w-400px, bg-surface-container-high, border-l)
```

#### Scanner Input Section (Nuevo)

```tsx
<div style={{
  background: 'var(--surface-container-low)',
  padding: 'var(--space-lg)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid rgba(66, 71, 84, 0.4)',
  transition: 'box-shadow 0.3s ease',
}}>
  <label style={{
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--on-surface-variant)',
    marginBottom: 'var(--space-sm)',
  }}>Escaneá o ingresá el código</label>

  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
    <span className="material-symbols-outlined" style={{
      position: 'absolute',
      left: 'var(--space-md)',
      color: 'var(--primary)',
      fontSize: 28,
    }}>barcode_scanner</span>

    <input
      placeholder="Código de barras, SKU o nombre del producto..."
      style={{
        width: '100%',
        background: 'var(--surface)',
        border: '2px solid var(--outline-variant)',
        borderRadius: 'var(--radius-lg)',
        paddingLeft: 60,
        paddingRight: 'var(--space-md)',
        paddingTop: 'var(--space-lg)',
        paddingBottom: 'var(--space-lg)',
        fontFamily: 'var(--font-data)',
        fontSize: 18, // data-lg
        lineHeight: 24,
        fontWeight: 600,
        color: 'var(--on-surface)',
        outline: 'none',
        transition: 'border-color var(--transition), box-shadow var(--transition)',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary-container)'
        e.currentTarget.parentElement!.parentElement!.style.boxShadow = '0 0 20px rgba(77, 142, 255, 0.15)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--outline-variant)'
        e.currentTarget.parentElement!.parentElement!.style.boxShadow = 'none'
      }}
    />

    {/* Keyboard shortcut hint */}
    <kbd style={{
      position: 'absolute',
      right: 'var(--space-md)',
      background: 'var(--surface-container-highest)',
      paddingLeft: 'var(--space-sm)',
      paddingRight: 'var(--space-sm)',
      paddingTop: 4,
      paddingBottom: 4,
      borderRadius: 'var(--radius-sm)',
      fontSize: 12,
      fontFamily: 'var(--font-data)',
      fontWeight: 500,
      color: 'var(--outline)',
      border: '1px solid rgba(66, 71, 84, 0.3)',
    }}>Enter</kbd>
  </div>
</div>
```

#### Cart Table

```tsx
<div style={{
  flex: 1,
  background: 'var(--surface-container)',
  padding: 'var(--space-lg)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid rgba(66, 71, 84, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
}}>
  {/* Header */}
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
    <h3 style={{
      fontFamily: 'var(--font-body)',
      fontSize: 20,
      lineHeight: 28,
      fontWeight: 600,
      color: 'var(--on-surface)',
    }}>Carrito actual</h3>
    <span style={{
      fontSize: 14,
      fontFamily: 'var(--font-body)',
      color: 'var(--on-surface-variant)',
    }}>{cart.length} items seleccionados</span>
  </div>

  {/* Scrollable table */}
  <div style={{ flex: 1, overflowY: 'auto', paddingRight: 'var(--space-sm)' }}>
    {/* Sticky header */}
    <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-container)', zIndex: 10 }}>
      <tr style={{ borderBottom: '1px solid rgba(66, 71, 84, 0.5)' }}>
        <th style={cartThStyle}>Producto</th>
        <th style={{ ...cartThStyle, textAlign: 'center' }}>Cant.</th>
        <th style={{ ...cartThStyle, textAlign: 'right' }}>Precio Unit.</th>
        <th style={{ ...cartThStyle, textAlign: 'right' }}>Subtotal</th>
        <th style={{ ...cartThStyle, width: 48 }}></th>
      </tr>
    </thead>
  </div>
</div>

const cartThStyle: React.CSSProperties = {
  paddingBottom: 'var(--space-md)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--on-surface-variant)',
  textAlign: 'left',
}
```

**Cart row with quantity controls (round buttons):**

```tsx
<tr style={{
  borderBottom: '1px solid rgba(66, 71, 84, 0.2)',
  transition: 'background var(--transition)',
}}
onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(50, 53, 60, 0.5)'}
onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
>
  <td style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-md)' }}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 24, fontWeight: 600, color: 'var(--on-surface)' }}>
        {item.name}
      </span>
      <span style={{ fontFamily: 'var(--font-data)', fontSize: 12, lineHeight: 16, fontWeight: 500, color: 'var(--outline)' }}>
        SKU: {item.code}
      </span>
    </div>
  </td>

  <td style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-md)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)' }}>
      <button style={{
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--outline-variant)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--on-surface)',
        transition: 'background var(--transition)',
      }}>-</button>
      <span style={{
        fontFamily: 'var(--font-data)',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: 500,
        width: 32,
        textAlign: 'center',
      }}>{item.quantity}</span>
      <button style={{ ...sameRoundBtn }}>+</button>
    </div>
  </td>

  <td style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-md)', textAlign: 'right', fontFamily: 'var(--font-data)', fontSize: 14, lineHeight: 20, fontWeight: 500 }}>
    ${item.unit_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
  </td>

  <td style={{ ...same, textAlign: 'right', color: 'var(--primary)' }}>
    ${(item.quantity * item.unit_price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
  </td>

  <td style={{ ...same, textAlign: 'right' }}>
    <button style={{
      color: 'rgba(255, 180, 171, 0.4)',
      padding: 'var(--space-sm)',
      transition: 'color var(--transition)',
    }}
    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 180, 171, 0.4)'}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
    </button>
  </td>
</tr>
```

#### Summary Panel (Right sidebar — 400px)

```tsx
<aside style={{
  width: 400,
  background: 'var(--surface-container-high)',
  borderLeft: '1px solid rgba(66, 71, 84, 0.5)',
  padding: 'var(--space-lg)',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 'var(--shadow-lg)',
  position: 'relative',
  zIndex: 10,
}}>
```

**Total display:**

```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)' }}>
  <span style={{
    fontFamily: 'var(--font-body)',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 600,
    color: 'var(--on-surface)',
  }}>TOTAL</span>
  <span style={{
    fontFamily: 'var(--font-body)',
    fontSize: 40,
    lineHeight: 48,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--primary-container)', // #4d8eff
  }}>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
</div>
```

**Payment method grid (2x2):**

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
  {/* Selected payment method */}
  <button style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--primary)',
    background: 'rgba(77, 142, 255, 0.1)',
    color: 'var(--primary)',
    transition: 'all var(--transition)',
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: 32 }}>payments</span>
    <span style={{ fontSize: 14, fontWeight: 600 }}>Efectivo</span>
  </button>

  {/* Unselected payment method */}
  <button style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--outline-variant)',
    background: 'transparent',
    color: 'var(--on-surface-variant)',
    transition: 'all var(--transition)',
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: 32 }}>credit_card</span>
    <span style={{ fontSize: 14, fontWeight: 600 }}>Tarjeta</span>
  </button>
</div>
```

**"Paga con" / "Vuelto" section:**

```tsx
<div style={{
  marginTop: 'var(--space-xl)',
  padding: 'var(--space-md)',
  background: 'var(--surface-container)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid rgba(66, 71, 84, 0.2)',
}}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
    <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Paga con:</span>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'var(--bg)',
      paddingLeft: 'var(--space-md)',
      paddingRight: 'var(--space-md)',
      paddingTop: 'var(--space-xs)',
      paddingBottom: 'var(--space-xs)',
      borderRadius: 'var(--radius)',
      border: '1px solid rgba(66, 71, 84, 0.3)',
    }}>
      <span style={{ fontFamily: 'var(--font-data)', fontSize: 14, lineHeight: 20, fontWeight: 500, color: 'var(--on-surface)', marginRight: 'var(--space-xs)' }}>$</span>
      <input style={{
        width: 64,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontFamily: 'var(--font-data)',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: 500,
        color: 'var(--on-surface)',
        padding: 0,
      }} />
    </div>
  </div>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Vuelto:</span>
    <span style={{
      fontFamily: 'var(--font-data)',
      fontSize: 18,
      lineHeight: 24,
      fontWeight: 600,
      color: 'var(--success)',
    }}>${change.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
  </div>
</div>
```

**"Cobrar Venta" button (full-width, green):**

```tsx
<button style={{
  width: '100%',
  paddingTop: 'var(--space-lg)',
  paddingBottom: 'var(--space-lg)',
  borderRadius: 'var(--radius-lg)',
  background: 'var(--success)', // #50d890
  color: 'var(--bg)', // dark text on green
  fontWeight: 700,
  fontSize: 20,
  lineHeight: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-md)',
  transition: 'all var(--transition)',
  boxShadow: '0 4px 12px rgba(80, 216, 144, 0.2)',
}}>
  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
  Cobrar Venta
</button>
```

---

### C.5 Customers.tsx

#### Stats Bento Grid (Nuevo)

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)', // mobile
  // En md: repeat(3, 1fr)
  // En lg: repeat(4, 1fr)  — el cuarto item ocupa 2 cols
  gap: 'var(--space-lg)',
  marginBottom: 'var(--space-xl)',
}}>
  {/* Total Clientes — glass panel */}
  <div className="glass-panel" style={{
    padding: 'var(--space-lg)',
    borderRadius: 'var(--radius-xl)', // 24px
  }}>
    <p style={{ color: 'var(--on-surface-variant)', fontSize: 14, fontWeight: 500, marginBottom: 'var(--space-sm)' }}>
      Total Clientes
    </p>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
      <span style={{
        fontFamily: 'var(--font-data)',
        fontSize: 40,
        lineHeight: 48,
        fontWeight: 700,
        color: 'var(--primary)',
      }}>{totalClients}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center' }}>
        +4% <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
      </span>
    </div>
  </div>

  {/* Saldo Pendiente — glass panel */}
  <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)' }}>
    <p style={{ color: 'var(--on-surface-variant)', fontSize: 14, fontWeight: 500, marginBottom: 'var(--space-sm)' }}>
      Saldo Pendiente Total
    </p>
    <span style={{
      fontFamily: 'var(--font-data)',
      fontSize: 40,
      lineHeight: 48,
      fontWeight: 700,
      color: 'var(--error)',
    }}>$ {totalDebt.toLocaleString()}</span>
  </div>

  {/* Clientes Premium — glass panel with gradient decoration */}
  <div className="glass-panel" style={{
    padding: 'var(--space-lg)',
    borderRadius: 'var(--radius-xl)',
    gridColumn: 'span 2', // en lg
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{ position: 'relative', zIndex: 10 }}>
      <p style={{ color: 'var(--on-surface-variant)', fontSize: 14, fontWeight: 500, marginBottom: 'var(--space-sm)' }}>
        Clientes Premium
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
        <span style={{
          fontFamily: 'var(--font-data)',
          fontSize: 40,
          lineHeight: 48,
          fontWeight: 700,
          color: 'var(--tertiary)',
        }}>{premiumCount}</span>
        <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', opacity: 0.6 }}>
          Frecuencia de compra alta
        </p>
      </div>
    </div>
    {/* Decorative gradient */}
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      height: '100%',
      width: 128,
      background: 'linear-gradient(to left, rgba(255, 183, 134, 0.1), transparent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span className="material-symbols-outlined" style={{
        color: 'var(--tertiary)',
        opacity: 0.3,
        fontSize: 64,
        transform: 'rotate(12deg)',
        fontVariationSettings: "'wght' 200",
      }}>star</span>
    </div>
  </div>
</div>
```

#### Customer Table — New Patterns

**Table container with header bar:**

```tsx
<div style={{
  background: 'var(--surface-container)',
  border: '1px solid rgba(66, 71, 84, 0.5)',
  borderRadius: 'var(--radius-xl)', // 24px — más redondeado que antes
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
}}>
  {/* Table title bar */}
  <div style={{
    paddingLeft: 'var(--space-lg)',
    paddingRight: 'var(--space-lg)',
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    borderBottom: '1px solid rgba(66, 71, 84, 0.5)',
    background: 'var(--surface-container-high)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
      <h3 style={{ fontSize: 20, lineHeight: 28, fontWeight: 600 }}>Listado General</h3>
      <span style={{
        background: 'var(--surface)',
        paddingLeft: 'var(--space-md)',
        paddingRight: 'var(--space-md)',
        paddingTop: 'var(--space-xs)',
        paddingBottom: 'var(--space-xs)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--outline-variant)',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--on-surface-variant)',
      }}>Filtrado: Recientes</span>
    </div>

    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
      <button style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius)', transition: 'background var(--transition)', color: 'var(--on-surface-variant)' }}>
        <span className="material-symbols-outlined">filter_list</span>
      </button>
      <button style={{ ...same }}>
        <span className="material-symbols-outlined">download</span>
      </button>
    </div>
  </div>
```

**Customer row with avatar initials:**

```tsx
<tr style={{ borderBottom: '1px solid rgba(66, 71, 84, 0.2)', cursor: 'pointer', transition: 'background var(--transition)' }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252932'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
>
  <td style={{ paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)', paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-lg)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
      {/* Avatar with initials */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 'var(--radius-lg)', // 16px
        background: 'rgba(173, 198, 255, 0.1)', // primary/10
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        fontWeight: 700,
        fontSize: 14,
      }}>
        {initials}
      </div>
      <div>
        <p style={{
          fontWeight: 600,
          color: 'var(--on-surface)',
          transition: 'color var(--transition)',
        }}>{customer.name}</p>
        <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{customer.email}</p>
      </div>
    </div>
  </td>

  <td style={{ ...cellPadding, fontFamily: 'var(--font-data)', fontSize: 14, lineHeight: 20, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
    {customer.dni}
  </td>

  <td style={{ ...cellPadding }}>
    <span style={{
      fontFamily: 'var(--font-data)',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 700,
      color: customer.balance > 0 ? 'var(--error)' : 'var(--success)',
    }}>$ {Math.abs(customer.balance).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
  </td>

  <td style={{ ...cellPadding }}>
    <span style={{
      paddingLeft: 'var(--space-md)',
      paddingRight: 'var(--space-md)',
      paddingTop: 4,
      paddingBottom: 4,
      borderRadius: 'var(--radius-full)',
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      ...statusBadgeStyle,
    }}>{statusLabel}</span>
  </td>

  <td style={{ ...cellPadding, textAlign: 'right' }}>
    <span className="material-symbols-outlined" style={{
      color: 'var(--outline)',
      transition: 'color var(--transition)',
    }}>chevron_right</span>
  </td>
</tr>
```

**Avatar color by status:**
- Deuda: `background: rgba(255, 180, 171, 0.1); color: var(--error)`
- Activo: `background: rgba(173, 198, 255, 0.1); color: var(--primary)`
- Inactivo: `background: rgba(194, 198, 214, 0.1); color: var(--on-surface-variant)`

**Status badge styles:**

```tsx
const statusBadges: Record<string, React.CSSProperties> = {
  Activo: {
    background: 'rgba(80, 216, 144, 0.1)',
    color: 'var(--success)',
    border: '1px solid rgba(80, 216, 144, 0.2)',
  },
  Deudor: {
    background: 'rgba(255, 180, 171, 0.1)',
    color: 'var(--error)',
    border: '1px solid rgba(255, 180, 171, 0.2)',
  },
  Inactivo: {
    background: 'var(--surface-container-highest)',
    color: 'var(--on-surface-variant)',
    border: '1px solid var(--outline-variant)',
  },
}
```

#### Customer Detail Drawer (Nuevo — Slide-in panel)

```tsx
// Overlay
<div style={{
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  zIndex: 40,
  opacity: isOpen ? 1 : 0,
  transition: 'opacity 0.3s ease',
  pointerEvents: isOpen ? 'auto' : 'none',
}} onClick={onClose} />

// Drawer panel
<div style={{
  position: 'fixed',
  inset: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: '100%',
  maxWidth: 448, // max-w-md
  background: 'var(--surface-container-high)',
  boxShadow: 'var(--shadow-lg)',
  zIndex: 50,
  transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.3s ease',
  borderLeft: '1px solid var(--outline-variant)',
  display: 'flex',
  flexDirection: 'column',
}}>
  <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)' }}>
    {/* Drawer content */}
  </div>
</div>
```

**Drawer avatar (large, rounded-3xl):**

```tsx
<div style={{
  width: 96,
  height: 96,
  borderRadius: 'var(--radius-xl)', // 24px
  background: 'rgba(173, 198, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--primary)',
  fontSize: 40,
  fontWeight: 700,
  marginBottom: 'var(--space-md)',
  border: '2px solid rgba(173, 198, 255, 0.3)',
}}>{initials}</div>
```

**Drawer info rows:**

```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
  <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>mail</span>
  <div style={{ flex: 1 }}>
    <p style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: 'var(--on-surface-variant)' }}>Email</p>
    <p style={{ fontSize: 14 }}>{customer.email}</p>
  </div>
</div>
```

**Drawer activity items:**

```tsx
<div style={{
  background: 'var(--surface)',
  padding: 'var(--space-sm)',
  borderRadius: 'var(--radius)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 12,
}}>
  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 16 }}>shopping_bag</span>
    <span>Compra #V-8942</span>
  </div>
  <span style={{ fontFamily: 'var(--font-data)', fontSize: 12, fontWeight: 500, color: 'var(--primary)' }}>$ 1.250</span>
</div>
```

---

## D. Componentes UI — Actualizaciones

### D.1 Button.tsx — Cambios

**Variant mappings actualizados:**

```tsx
const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--primary-container)', // #4d8eff
    color: 'var(--on-primary-container)',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--secondary-fixed-dim)', // #c0c1ff
    border: '1px solid var(--outline-variant)',
  },
  danger: {
    background: 'var(--error)',
    color: 'var(--on-error)',
    border: 'none',
  },
  success: {
    background: 'var(--success)', // #50d890
    color: 'var(--bg)', // dark text on green
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--on-surface-variant)',
    border: '1px solid transparent',
  },
}
```

**Size mappings actualizados:**

```tsx
const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 14, borderRadius: 'var(--radius)' },
  md: { padding: '8px 16px', fontSize: 14, borderRadius: 'var(--radius)' },
  lg: { padding: '10px 24px', fontSize: 14, borderRadius: 'var(--radius)' },
}
```

**Hover effect:** Agregar `onMouseEnter` / `onMouseLeave` para `active:scale-95`:

```tsx
onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
```

### D.2 Card.tsx — Cambios

```tsx
style={{
  background: 'var(--surface-container)', // #1d2027
  border: '1px solid rgba(66, 71, 84, 0.5)',
  borderRadius: 'var(--radius-lg)', // 16px
  padding: paddingMap[padding],
  transition: 'border-color var(--transition)',
  ...override,
}}
```

### D.3 Badge.tsx — Cambios

**Colores actualizados al sistema Stitch:**

```tsx
const colorMap: Record<string, { bg: string; fg: string; border?: string }> = {
  success: {
    bg: 'rgba(80, 216, 144, 0.1)',
    fg: 'var(--success)',
    border: '1px solid rgba(80, 216, 144, 0.2)',
  },
  warning: {
    bg: 'rgba(255, 183, 134, 0.1)',
    fg: 'var(--tertiary)',
    border: '1px solid rgba(255, 183, 134, 0.2)',
  },
  danger: {
    bg: 'rgba(255, 180, 171, 0.1)',
    fg: 'var(--error)',
    border: '1px solid rgba(255, 180, 171, 0.2)',
  },
  info: {
    bg: 'rgba(77, 142, 255, 0.1)',
    fg: 'var(--primary-container)',
    border: '1px solid rgba(77, 142, 255, 0.2)',
  },
  neutral: {
    bg: 'var(--surface-container-highest)',
    fg: 'var(--on-surface-variant)',
    border: '1px solid var(--outline-variant)',
  },
}
```

**Estilo base actualizado:**

```tsx
<span style={{
  display: 'inline-flex',
  alignItems: 'center',
  paddingLeft: 'var(--space-md)',
  paddingRight: 'var(--space-md)',
  paddingTop: 'var(--space-xs)',
  paddingBottom: 'var(--space-xs)',
  borderRadius: 'var(--radius-full)',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: c.bg,
  color: c.fg,
  border: c.border,
  whiteSpace: 'nowrap',
}}>
```

### D.4 Modal.tsx — Cambios

```tsx
// Overlay
style={{
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
}}

// Modal panel
style={{
  background: 'var(--surface-container)', // #1d2027
  border: '1px solid rgba(66, 71, 84, 0.5)',
  borderRadius: 'var(--radius-lg)', // 16px
  boxShadow: 'var(--shadow-modal)',
  maxWidth: sizeMap[size],
}}
```

### D.5 DataTable.tsx — Cambios

```tsx
// Container
style={{
  background: 'var(--surface-container)',
  border: '1px solid rgba(66, 71, 84, 0.5)',
  borderRadius: 'var(--radius-lg)', // 16px
  overflow: 'hidden',
}}

// Header
style={{
  background: 'var(--surface-container-high)',
  borderBottom: '1px solid rgba(66, 71, 84, 0.5)',
}}

// Row hover
onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-highest)'}
onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
```

---

## E. Componentes Nuevos Requeridos

### E.1 MaterialSymbolsIcon — Wrapper para Material Symbols

```tsx
// components/ui/MaterialIcon.tsx
interface MaterialIconProps {
  name: string
  filled?: boolean
  size?: number
  color?: string
  style?: React.CSSProperties
}

export default function MaterialIcon({ name, filled = false, size = 24, color, style }: MaterialIconProps) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        color,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {name}
    </span>
  )
}
```

### E.2 KPICard — KPI card con icon overlay y trend

```tsx
interface KPICardProps {
  label: string
  value: string | number
  iconName: string
  iconColor: string
  valueColor: string
  trend?: { value: string; direction: 'up' | 'down' | 'neutral'; color: string }
}
```

### E.3 QuickAction — Botón de acción con icon box

```tsx
interface QuickActionProps {
  label: string
  subtitle: string
  iconName: string
  href: string
  variant?: 'primary' | 'standard'
}
```

### E.4 MiniBarChart — Gráfico de barras mini

```tsx
interface MiniBarChartProps {
  data: number[]
  highlightLast?: boolean
  height?: number
}
```

### E.5 GlassPanel — Panel con efecto glass

```tsx
// Simplemente usar className="glass-panel" en cualquier div,
// o crear un wrapper:
interface GlassPanelProps {
  children: ReactNode
  style?: React.CSSProperties
}

export default function GlassPanel({ children, style }: GlassPanelProps) {
  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-lg)',
      ...style,
    }}>
      {children}
    </div>
  )
}
```

### E.6 CustomerDrawer — Panel lateral de detalle de cliente

```tsx
interface CustomerDrawerProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
}
```

### E.7 Toggle Switch — Switch personalizado

```tsx
interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}
```

---

## F. Cambios en Layout.tsx — Resumen de Estructura

### F.1 Desktop Layout

```
ANTES:                              DESPUÉS:
┌──────┬─────────────────┐         ┌────────┬──────────────────────┐
│      │  Header (52px)  │         │        │  Header (64px)       │
│ Side │─────────────────│         │  240px │  con search bar      │
│ bar  │                 │         │        │──────────────────────│
│ 220  │  Main content   │         │ Side   │                     │
│  px  │  (padding 24)   │         │ bar    │  Main content       │
│      │                 │         │        │  (padding 32)        │
│      │                 │         │        │                     │
└──────┴─────────────────┘         └────────┴──────────────────────┘
```

**Cambios clave:**
1. Sidebar width: 220 → 240px
2. Sidebar background: `var(--surface)` → `var(--surface-container)` (#1d2027)
3. Sidebar border: `var(--border)` → `rgba(66, 71, 84, 0.5)`
4. Header height: 52 → 64px
5. Header now has: backdrop blur, search bar, notifications, CTA button
6. Main padding: 24 → 32px (desktop)
7. Nav items now use Material Symbols instead of emojis
8. Active nav: right border + background highlight (not just color change)
9. User profile widget at bottom of sidebar
10. "Nueva Venta" button in sidebar (Products page only, not all pages)

### F.2 Mobile Layout

```
ANTES:                              DESPUÉS:
┌──────────────────┐               ┌──────────────────┐
│ Header (52px)    │               │ Header (64px)    │
│ ☰ TUSTOCK ●      │               │ ☰ search...  🔔  │
├──────────────────┤               ├──────────────────┤
│                  │               │                  │
│  Main content    │               │  Main content    │
│  (padding 16)    │               │  (padding 16)    │
│                  │               │                  │
│                  │               │                  │
├──────────────────┤               ├──────────────────┤
│ Bottom nav bar   │               │ Bottom nav bar   │
│ (h=48)           │               │ (h=64) + FAB     │
└──────────────────┘               └──────────────────┘
```

**Cambios clave:**
1. Mobile header height: 52 → 64px
2. Bottom nav height: 48 → 64px
3. Bottom nav has floating action button (FAB) in center
4. Search bar in mobile header (collapsible or hamburger menu)

---

## G. Icons — Material Symbols Outlined

**Reemplazar TODOS los emojis por Material Symbols.** Mapeo de iconos por sección:

### Sidebar Nav

| Sección | Icono | Material Symbol |
|---------|-------|----------------|
| Dashboard | 📊 | `dashboard` |
| Productos | 📦 | `inventory_2` |
| Ventas | 💰 | `payments` |
| Clientes | 👥 | `group` |
| Pedidos | 📝 | `shopping_cart` |
| Presupuestos | 📋 | `description` |
| Auditorías | 🔍 | `history_edu` |
| Informes | 📊 | `analytics` |
| Vendedores | 👤 | `badge` |
| Scanner | 📱 | `barcode_scanner` |
| Planes | ⭐ | `workspace_premium` |
| Ajustes | ⚙️ | `settings` |

### Acciones

| Acción | Material Symbol |
|--------|----------------|
| Nueva venta | `add_shopping_cart` |
| Agregar producto | `add_box` |
| Nuevo cliente | `person_add` |
| Imprimir etiquetas | `print` |
| Buscar | `search` |
| Notificaciones | `notifications` |
| Editar | `edit` |
| Eliminar | `delete` |
| Agregar stock | `add` |
| Quitar stock | `remove` |
| Refresh | `refresh` |
| Filtrar | `filter_list` |
| Descargar | `download` |
| Chevron right | `chevron_right` |
| Escanear | `barcode_scanner` |
| Confirmar venta | `task_alt` |
| Trending up | `trending_up` |
| Trending down | `trending_down` |
| Star | `star` |

---

## H. Responsive Breakpoints

```tsx
// Mobile-first approach
// Usar matchMedia o container queries

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
}

// En React, usar un hook:
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

// Uso:
const isDesktop = useMediaQuery('(min-width: 768px)')
```

**Grid responsive patterns:**

```tsx
// KPI Grid: 1 col → 2 cols → 4 cols
gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : isTablet ? 'repeat(2, 1fr)' : '1fr'

// Content Grid: 1 col → 8/4 split
gridTemplateColumns: isDesktop ? '8fr 4fr' : '1fr'

// Products bento: 1 col → 8/4 split
gridTemplateColumns: isDesktop ? '8fr 4fr' : '1fr'
```

---

## I. Animations & Micro-interactions

### I.1 Page entrance

```tsx
// Agregar a cada página principal:
<div style={{
  animation: 'slideUp 0.3s ease forwards',
}}>
```

### I.2 Button press

```tsx
// En todo botón:
onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
```

### I.3 Row click flash

```tsx
// En filas de tabla clickeables:
onClick={(e) => {
  e.currentTarget.style.background = 'rgba(173, 198, 255, 0.05)'
  setTimeout(() => { e.currentTarget.style.background = '' }, 300)
  // ... original onClick handler
}}
```

### I.4 Quick action chevron

```tsx
// Chevron se mueve a la derecha en hover:
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateX(4px)'
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateX(0)'
}}
```

### I.5 KPI icon reveal

```tsx
// El icono de fondo pasa de opacity 0.2 a 1 en hover del card:
onMouseEnter={(e) => {
  const icon = e.currentTarget.querySelector('.kpi-icon') as HTMLElement
  if (icon) icon.style.opacity = '1'
}}
onMouseLeave={(e) => {
  const icon = e.currentTarget.querySelector('.kpi-icon') as HTMLElement
  if (icon) icon.style.opacity = '0.2'
}}
```

### I.6 Star rotation en Customers

```tsx
// El icono de estrella rota en hover del card premium:
onMouseEnter={(e) => {
  const star = e.currentTarget.querySelector('.star-icon') as HTMLElement
  if (star) star.style.transform = 'rotate(0deg)'
}}
onMouseLeave={(e) => {
  const star = e.currentTarget.querySelector('.star-icon') as HTMLElement
  if (star) star.style.transform = 'rotate(12deg)'
}}
```

---

## J. Copy en Voseo — Textos de UI

Todos los textos de interfaz deben usar argentino voseo. Mapeo de textos comunes:

| Acción | Texto Stitch (voseo) | Texto actual (a reemplazar) |
|--------|---------------------|---------------------------|
| Buscar placeholder | "Buscá productos, ventas o clientes..." | "Buscar..." |
| Empty products | "No tenés productos cargados" | "No se encontraron productos" |
| Empty cart | "Carrito vacío - Escaneá o escribí un código" | "Carrito vacío" |
| Quick action | "Cargá una operación rápida" | (nuevo) |
| Quick action | "Ingresá stock al catálogo" | (nuevo) |
| Quick action | "Registrá un nuevo contacto" | (nuevo) |
| Quick action | "Generá códigos de barra" | (nuevo) |
| Button | "Nuevo producto" | (igual) |
| Button | "Nuevo cliente" | (igual) |
| Button | "Cobrar Venta" | (igual) |
| Scanner | "Escaneá o ingresá el código" | (nuevo) |
| Toggle | "Ver inactivos" | "Ver inactivos" |
| Filters | "Filtrá por descripción, marca o EAN..." | "Buscar por nombre o código..." |
| Category | "Todas las categorías" | (igual) |
| Pagination | "Mostrando X de Y productos" | (nuevo) |
| Dashboard greeting | "Buen día, {nombre}" | (nuevo) |
| Dashboard subtitle | "Revisá el rendimiento de hoy y gestioná tu inventario." | (nuevo) |
| Customer subtitle | "Gestioná tu base de datos de clientes, controlá cuentas corrientes..." | (nuevo) |
| Low stock header | "Productos con stock bajo" | (igual) |
| Quick actions header | "Acciones rápidas" | (igual) |

---

## K. Checklist de Implementación para DEV

### Fase 0: Preparación
- [ ] Agregar Google Fonts (Inter + Geist Mono) en `index.html`
- [ ] Agregar Material Symbols Outlined en `index.html`
- [ ] Reemplazar todas las CSS custom properties en `index.css`
- [ ] Agregar `.glass-panel` class y animaciones en `index.css`
- [ ] Agregar `.material-symbols-outlined` base style en `index.css`

### Fase 1: Componentes Base
- [ ] Crear `MaterialIcon.tsx` wrapper
- [ ] Actualizar `Button.tsx` con nuevos variant styles
- [ ] Actualizar `Card.tsx` con nuevos colors
- [ ] Actualizar `Badge.tsx` con nuevos colors
- [ ] Actualizar `Modal.tsx` con nuevos colors
- [ ] Actualizar `DataTable.tsx` con nuevos colors
- [ ] Crear `KPICard.tsx`
- [ ] Crear `QuickAction.tsx`
- [ ] Crear `MiniBarChart.tsx`
- [ ] Crear `GlassPanel.tsx`
- [ ] Crear `Toggle.tsx`
- [ ] Crear `CustomerDrawer.tsx`

### Fase 2: Layout
- [ ] Actualizar `Layout.tsx` — sidebar (240px, nav icons, profile widget)
- [ ] Actualizar `Layout.tsx` — header (64px, search bar, CTA button)
- [ ] Actualizar `Layout.tsx` — mobile bottom nav (64px, FAB)
- [ ] Agregar responsive breakpoints hook

### Fase 3: Páginas
- [ ] Actualizar `Dashboard.tsx` — welcome, KPI cards, low stock table, quick actions, mini chart
- [ ] Actualizar `Products.tsx` — breadcrumb, bento filters, table, pagination
- [ ] Actualizar `Sales.tsx` — scanner input, cart with round qty buttons, summary panel, payment grid
- [ ] Actualizar `Customers.tsx` — stats bento, table with avatars, detail drawer

### Fase 4: Responsive
- [ ] Test mobile layout (320px–767px)
- [ ] Test tablet layout (768px–1023px)
- [ ] Test desktop layout (1024px+)
- [ ] Verify bottom nav FAB doesn't overlap content
- [ ] Verify sidebar collapses on mobile

### Fase 5: Polish
- [ ] All animations working (fade-in, slide-up, scale, chevron, star)
- [ ] Hover states on all interactive elements
- [ ] Focus states with ring for accessibility
- [ ] Custom scrollbar styled correctly
- [ ] Glass panel blur effect working
- [ ] All copy in voseo
- [ ] All emojis replaced with Material Symbols

---

*Guía creada por agente UX/UI — TUSTOCK — 14 de Julio de 2026*
