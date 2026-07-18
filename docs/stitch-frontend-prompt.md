# TUSTOCK Frontend — Stitch Redesign Prompt

> **Purpose:** This document is a complete, self-contained design specification for redesigning the TUSTOCK React frontend (`web/src/`) using the Stitch design system. It is intended to be fed directly to an AI code generator (Stitch, Cursor, Copilot, etc.) to produce the entire redesigned frontend without follow-up questions.

> **Design Reference:** Based on the Stitch DESIGN.md and the existing Monitor Cloud / Landing Page redesigns that the user rated as excellent. The current React frontend is "too subtle" — this prompt aims for a BOLD, dramatic visual overhaul.

---

## Table of Contents

1. [Design Tokens & CSS Custom Properties](#1-design-tokens--css-custom-properties)
2. [Global Styles (index.css)](#2-global-styles-indexcss)
3. [Component Library (web/src/components/ui/)](#3-component-library)
4. [Layout & Navigation](#4-layout--navigation)
5. [Page: Dashboard](#5-page-dashboard)
6. [Page: Products](#6-page-products)
7. [Page: Sales (POS)](#7-page-sales-pos)
8. [Page: Customers](#8-page-customers)
9. [Page: Pedidos (Pending Orders)](#9-page-pedidos-pending-orders)
10. [Page: Presupuestos (Budgets)](#10-page-presupuestos-budgets)
11. [Page: Audits](#11-page-audits)
12. [Page: Reports](#12-page-reports)
13. [Page: Vendors](#13-page-vendors)
14. [Page: Upgrade](#14-page-upgrade)
15. [Page: Settings](#15-page-settings)
16. [Page: ScannerConnect](#16-page-scannerconnect)
17. [Global Components (Banners, Modal, Toast)](#17-global-components)
18. [Animations & Transitions](#18-animations--transitions)
19. [Mobile-First Responsive Strategy](#19-mobile-first-responsive-strategy)
20. [Copy & Language Guidelines](#20-copy--language-guidelines)

---

## 1. Design Tokens & CSS Custom Properties

Replace ALL existing CSS custom properties in `index.css` with the Stitch palette. The old palette (#0f172a bg, #1e293b surface) is replaced entirely.

### 1.1 Color Tokens

```css
:root {
  /* ── Core Palette ── */
  --stitch-bg: #10131a;
  --stitch-surface: #1d2027;
  --stitch-surface-high: #272a31;
  --stitch-surface-highest: #32353c;
  --stitch-surface-dim: #0b0e15;

  /* ── Primary (Soft Blue) ── */
  --stitch-primary: #adc6ff;
  --stitch-primary-container: #4d8eff;
  --stitch-on-primary: #002e6a;
  --stitch-on-primary-container: #00285d;

  /* ── Secondary (Lavender) ── */
  --stitch-secondary: #c0c1ff;
  --stitch-secondary-container: #3131c0;

  /* ── Tertiary (Orange) ── */
  --stitch-tertiary: #ffb786;
  --stitch-tertiary-container: #df7412;

  /* ── Text Hierarchy ── */
  --stitch-text: #e1e2ec;
  --stitch-text-secondary: #c2c6d6;
  --stitch-text-muted: #8c909f;

  /* ── Outlines & Borders ── */
  --stitch-outline: #8c909f;
  --stitch-outline-variant: #424754;
  --stitch-border-subtle: rgba(255, 255, 255, 0.06);

  /* ── Functional ── */
  --stitch-error: #ffb4ab;
  --stitch-error-container: #93000a;
  --stitch-on-error: #690005;
  --stitch-success: #50d890;
  --stitch-success-container: rgba(80, 216, 144, 0.12);
  --stitch-warning: #ffb786;
  --stitch-warning-container: rgba(255, 183, 134, 0.12);

  /* ── Backward-Compatibility Aliases ── */
  /* Keep these so existing inline styles don't break during migration */
  --bg: var(--stitch-bg);
  --surface: var(--stitch-surface);
  --surface-hover: var(--stitch-surface-high);
  --border: var(--stitch-outline-variant);
  --text: var(--stitch-text);
  --text-muted: var(--stitch-text-muted);
  --primary: var(--stitch-primary-container);
  --primary-hover: #3a7aef;
  --danger: var(--stitch-error);
  --warning: var(--stitch-tertiary);
  --success: var(--stitch-success);

  /* ── Spacing ── */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* ── Border Radius ── */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* ── Shadows (subtle, tonal — NOT heavy box-shadows) ── */
  --shadow-card: 0 0 0 1px var(--stitch-outline-variant);
  --shadow-modal: 0 0 0 1px var(--stitch-outline-variant), 0 24px 80px rgba(0, 0, 0, 0.6);
  --shadow-elevated: 0 0 0 1px var(--stitch-outline-variant), 0 8px 32px rgba(0, 0, 0, 0.4);

  /* ── Transitions ── */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 1.2 Typography Scale

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500&display=swap');

:root {
  /* ── Display ── */
  --font-display: 'Inter', system-ui, sans-serif;
  --text-display-xl: 900 48px/56px 'Inter', system-ui, sans-serif;
  --text-display-lg: 800 32px/40px 'Inter', system-ui, sans-serif;

  /* ── Headlines ── */
  --text-headline-lg: 800 24px/32px 'Inter', system-ui, sans-serif;
  --text-headline-md: 700 20px/28px 'Inter', system-ui, sans-serif;

  /* ── Body ── */
  --text-body-lg: 400 18px/28px 'Inter', system-ui, sans-serif;
  --text-body-md: 400 16px/24px 'Inter', system-ui, sans-serif;

  /* ── Labels ── */
  --text-label-md: 600 14px/20px 'Inter', system-ui, sans-serif;
  --text-label-sm: 500 12px/16px 'Inter', system-ui, sans-serif;

  /* ── Data (monospaced) ── */
  --text-mono: 500 14px/20px 'Geist Mono', 'SF Mono', 'Consolas', monospace;
}
```

---

## 2. Global Styles (index.css)

Replace the ENTIRE contents of `web/src/index.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500&display=swap');

/* ══════════════════════════════════════════════
   TUSTOCK — Stitch Design System
   ══════════════════════════════════════════════ */

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Core palette */
  --stitch-bg: #10131a;
  --stitch-surface: #1d2027;
  --stitch-surface-high: #272a31;
  --stitch-surface-highest: #32353c;
  --stitch-surface-dim: #0b0e15;

  /* Primary */
  --stitch-primary: #adc6ff;
  --stitch-primary-container: #4d8eff;
  --stitch-on-primary: #002e6a;

  /* Secondary */
  --stitch-secondary: #c0c1ff;
  --stitch-secondary-container: #3131c0;

  /* Tertiary */
  --stitch-tertiary: #ffb786;
  --stitch-tertiary-container: #df7412;

  /* Text */
  --stitch-text: #e1e2ec;
  --stitch-text-secondary: #c2c6d6;
  --stitch-text-muted: #8c909f;

  /* Borders */
  --stitch-outline: #8c909f;
  --stitch-outline-variant: #424754;
  --stitch-border-subtle: rgba(255, 255, 255, 0.06);

  /* Functional */
  --stitch-error: #ffb4ab;
  --stitch-error-container: #93000a;
  --stitch-success: #50d890;
  --stitch-success-container: rgba(80, 216, 144, 0.12);
  --stitch-warning: #ffb786;
  --stitch-warning-container: rgba(255, 183, 134, 0.12);

  /* Backward-compat aliases */
  --bg: var(--stitch-bg);
  --surface: var(--stitch-surface);
  --surface-hover: var(--stitch-surface-high);
  --border: var(--stitch-outline-variant);
  --text: var(--stitch-text);
  --text-muted: var(--stitch-text-muted);
  --primary: var(--stitch-primary-container);
  --primary-hover: #3a7aef;
  --danger: var(--stitch-error);
  --warning: var(--stitch-tertiary);
  --success: var(--stitch-success);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 0 0 1px var(--stitch-outline-variant);
  --shadow-modal: 0 0 0 1px var(--stitch-outline-variant), 0 24px 80px rgba(0, 0, 0, 0.6);
  --shadow-elevated: 0 0 0 1px var(--stitch-outline-variant), 0 8px 32px rgba(0, 0, 0, 0.4);

  /* Transitions */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  background: var(--stitch-bg);
  color: var(--stitch-text);
  min-height: 100vh;
}

#root {
  min-height: 100vh;
  display: flex;
}

/* ── Links ── */
a {
  color: var(--stitch-primary-container);
  text-decoration: none;
  transition: color var(--transition-fast);
}
a:hover {
  color: var(--stitch-primary);
  text-decoration: underline;
}

/* ── Form Inputs ── */
input, select, textarea {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  background: var(--stitch-surface-dim);
  color: var(--stitch-text);
  border: 1px solid var(--stitch-outline-variant);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--stitch-primary-container);
  box-shadow: 0 0 0 3px rgba(77, 142, 255, 0.2);
}

input::placeholder, textarea::placeholder {
  color: var(--stitch-text-muted);
  font-style: normal;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238c909f'%3E%3Cpath d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

button {
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--stitch-outline-variant); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--stitch-outline); }

/* ── Keyframes ── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
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

/* ── Utility Classes ── */
.fade-in {
  animation: fadeIn 0.4s var(--transition-slow) both;
}

.slide-up {
  animation: slideUp 0.35s var(--transition-slow) both;
}

.stagger-1 { animation-delay: 50ms; }
.stagger-2 { animation-delay: 100ms; }
.stagger-3 { animation-delay: 150ms; }
.stagger-4 { animation-delay: 200ms; }

/* ── Responsive Breakpoints ── */
/* Mobile: default (<768px) */
/* Tablet: @media (min-width: 768px) */
/* Desktop: @media (min-width: 1024px) */
/* Wide: @media (min-width: 1280px) */
```

---

## 3. Component Library

### 3.1 Button (`components/ui/Button.tsx`)

**Visual Treatment:**
- Border-radius: `16px` (radius-lg) for all sizes
- Font-weight: 600 for md/lg, 600 for sm
- Letter-spacing: -0.01em for lg size
- Minimum height: 36px (sm), 40px (md), 48px (lg)
- Padding: `8px 16px` (sm), `10px 20px` (md), `14px 28px` (lg)

**Variants:**
- `primary`: Background `#4d8eff` (stitch-primary-container), color white. On hover: brighten to `#6aa0ff`. On active: darken to `#3a7aef`. Transition: `all 150ms ease`.
- `secondary`: Background transparent, border `1px solid var(--stitch-outline-variant)`, color `var(--stitch-text)`. On hover: background `var(--stitch-surface-high)`, border-color `var(--stitch-outline)`. No color change.
- `danger`: Background `var(--stitch-error)`, color `var(--stitch-on-error)` (#690005). On hover: brighten.
- `success`: Background `var(--stitch-success)`, color `#0a3d2a`. On hover: brighten.
- `ghost`: Background transparent, color `var(--stitch-text-muted)`, border transparent. On hover: background `var(--stitch-surface-high)`, color `var(--stitch-text)`.

**Loading State:**
- Show a spinning ring animation (CSS `@keyframes spin`), white border-top color, 14x14px.
- Button becomes non-interactive (`cursor: not-allowed`, `opacity: 0.6`).

**Disabled State:**
- `opacity: 0.4`, `cursor: not-allowed`, no hover effects.

**Stagger Animation:**
- When multiple buttons appear together (e.g., action bars), each subsequent button gets `animation-delay` of 50ms for a cascade-in effect.

### 3.2 Card (`components/ui/Card.tsx`)

**Visual Treatment:**
- Background: `var(--stitch-surface)` (#1d2027)
- Border: `1px solid var(--stitch-outline-variant)` (#424754)
- Border-radius: `16px` (radius-lg)
- No box-shadow by default (tonal layering only)
- Padding: `16px` (sm), `20px` (md), `28px` (lg)

**Hoverable State (when `hoverable=true` or `onClick` provided):**
- On hover: border-color transitions to `var(--stitch-primary-container)` (#4d8eff), add subtle glow `0 0 20px rgba(77, 142, 255, 0.08)`.
- Transition: `border-color 200ms ease, box-shadow 200ms ease`.
- Cursor: pointer.

**Title:**
- Font: `var(--text-label-md)` (600 14px/20px Inter), color `var(--stitch-text)`.

### 3.3 Badge (`components/ui/Badge.tsx`)

**Visual Treatment:**
- Border-radius: `6px` (NOT pill/rounded-full) — consistent with Stitch's "no pill shapes" principle.
- Padding: `2px 8px`
- Font: 11px, weight 600, letter-spacing 0.02em
- Uppercase text.

**Variants:**
- `success`: Background `var(--stitch-success-container)`, color `var(--stitch-success)`
- `warning`: Background `var(--stitch-warning-container)`, color `var(--stitch-warning)`
- `danger`: Background `rgba(255, 180, 171, 0.12)`, color `var(--stitch-error)`
- `info`: Background `rgba(77, 142, 255, 0.12)`, color `var(--stitch-primary-container)`
- `neutral`: Background `var(--stitch-surface-high)`, color `var(--stitch-text-secondary)`

### 3.4 Modal (`components/ui/Modal.tsx`)

**Visual Treatment:**
- Overlay: `rgba(0, 0, 0, 0.7)` with `backdrop-filter: blur(8px)` — dramatic backdrop blur.
- Panel: Background `var(--stitch-surface)`, border `1px solid var(--stitch-outline-variant)`, border-radius `16px`.
- Shadow: `var(--shadow-modal)` (tonal + deep shadow for modal prominence).
- Max-width: `360px` (sm), `520px` (md), `720px` (lg).
- Max-height: `85vh`, overflow-y auto.
- Entrance animation: `fadeInScale` (200ms ease-out).
- Header: padding `16px 24px`, border-bottom `1px solid var(--stitch-outline-variant)`.
- Title: `var(--text-headline-md)` (700 20px/28px).
- Close button: `var(--stitch-text-muted)` color, 20px font, hover turns `var(--stitch-text)`.

### 3.5 DataTable (`components/ui/DataTable.tsx`)

**Visual Treatment:**
- Container: `var(--stitch-surface)` bg, `1px solid var(--stitch-outline-variant)` border, `16px` border-radius.
- Header row: sticky top, `var(--stitch-surface-dim)` background, `1px solid var(--stitch-outline-variant)` bottom border. Font: 11px, weight 600, uppercase, letter-spacing `0.04em`, color `var(--stitch-text-muted)`.
- Data rows: padding `12px 16px`, min-height `56px` (for touch targets), border-bottom `1px solid var(--stitch-outline-variant)`.
- Row hover: background `var(--stitch-surface-high)`. Transition: `background 120ms ease`.
- Numeric data: use `var(--text-mono)` (Geist Mono) for values.
- Empty state: centered, 48px icon, 14px muted text.

### 3.6 EmptyState (`components/ui/EmptyState.tsx`)

**Visual Treatment:**
- Container: flex column centered, padding `48px 24px`.
- Icon: 56px, opacity 0.4, color `var(--stitch-text-muted)`.
- Title: `var(--text-headline-md)` (700 20px), color `var(--stitch-text)`.
- Description: `var(--text-body-md)` (400 16px), color `var(--stitch-text-muted)`, max-width `360px`.
- Animation: `fadeIn 0.4s ease both`.

### 3.7 Skeleton (`components/ui/Skeleton.tsx`)

**Visual Treatment:**
- Background: `linear-gradient(90deg, var(--stitch-surface-high) 25%, var(--stitch-surface-highest) 50%, var(--stitch-surface-high) 75%)`
- Background-size: `200% 100%`
- Animation: `shimmer 1.5s infinite linear`
- Border-radius: varies by variant.

---

## 4. Layout & Navigation

### 4.1 Sidebar (Desktop)

**Container:**
- Width: `240px` (slightly wider than current 220px for breathing room)
- Background: `var(--stitch-surface)` (#1d2027)
- Border-right: `1px solid var(--stitch-outline-variant)`
- Padding: `0`
- Display: flex, flexDirection: column, minHeight: 100vh
- Position: sticky, top: 0

**Logo Area:**
- Height: `64px` (generous)
- Padding: `0 20px`
- Border-bottom: `1px solid var(--stitch-outline-variant)`
- Display: flex, alignItems: center
- "TUSTOCK" text: font `var(--text-headline-md)` (700 20px), color `var(--stitch-primary-container)` (#4d8eff), letter-spacing `-0.02em`
- Below it: server status indicator (dot + text), font `var(--text-label-sm)`, color `var(--stitch-text-muted)`

**Navigation Groups:**
- Group title: font `var(--text-label-sm)` (500 12px), color `var(--stitch-text-muted)`, uppercase, letter-spacing `0.06em`, padding `16px 20px 6px`
- Each group separated by a subtle `1px solid var(--stitch-outline-variant)` horizontal line (margin `4px 20px`)

**Nav Items:**
- Display: flex, alignItems: center, gap `12px`
- Padding: `10px 20px`
- Border-radius: `10px`
- Margin: `0 10px` (inset from sidebar edges)
- Font: `var(--text-label-md)` (600 14px), color `var(--stitch-text-secondary)` (#c2c6d6)
- Icon: 18px, opacity 0.7
- Transition: `all 150ms ease`

**Active Nav Item:**
- Background: `rgba(77, 142, 255, 0.10)` (translucent primary)
- Color: `var(--stitch-primary-container)` (#4d8eff)
- Icon: opacity 1
- Left border: `3px solid var(--stitch-primary-container)` (accent bar)

**Nav Item Hover (non-active):**
- Background: `var(--stitch-surface-high)` (#272a31)

**Badge (count):**
- Position: marginLeft auto
- Background: `var(--stitch-error)` for alerts, `var(--stitch-tertiary-container)` for pending
- Color: white (alerts), `#311400` (pending)
- Border-radius: `6px` (NOT pill — Stitch rule)
- Padding: `2px 8px`, font 11px, weight 700

**Bottom Section (Planes + Ajustes):**
- Separated from main nav by a `1px solid var(--stitch-outline-variant)` line
- Pinned to bottom with `marginTop: auto`
- Same styling as regular nav items
- "Planes" icon: use `⭐` emoji, "Ajustes" use `⚙️` emoji

**Low Stock Alerts Panel (bottom of sidebar):**
- Padding: `12px 20px`
- Border-top: `1px solid var(--stitch-outline-variant)`
- Title: 12px, weight 600, color `var(--stitch-tertiary)` (#ffb786)
- Items: 11px, muted text, stock numbers in `var(--stitch-error)` bold

### 4.2 Sidebar (Mobile)

**Hamburger Menu Button:**
- Position: fixed top-left, 44x44px touch target
- Background: transparent, border none
- Icon: 24px, color `var(--stitch-text)`
- On tap: triggers slide-in sidebar

**Mobile Sidebar:**
- Position: fixed, left 0, top 0, bottom 0, width `280px`
- Background: `var(--stitch-surface)`
- Border-right: `1px solid var(--stitch-outline-variant)`
- Transform: `translateX(-100%)` (hidden), `translateX(0)` (visible)
- Transition: `transform 300ms cubic-bezier(0.4, 0, 0.2, 1)`
- z-index: 1200
- Box-shadow when open: `0 0 40px rgba(0, 0, 0, 0.5)`

**Backdrop Overlay:**
- Position: fixed, inset 0, top 56px
- Background: `rgba(0, 0, 0, 0.6)`, backdrop-filter `blur(4px)`
- z-index: 1100
- Click to close

### 4.3 Mobile Header

- Position: fixed, top 0, left 0, right 0
- Height: `56px`
- Background: `var(--stitch-surface)` with subtle bottom border
- Border-bottom: `1px solid var(--stitch-outline-variant)`
- z-index: 1100
- Display: flex, alignItems: center, padding `0 12px`, gap `12px`
- Logo: "TUSTOCK" font `var(--text-headline-md)` (700 18px), color `var(--stitch-primary-container)`
- Server status dot: right-aligned, 8x8px circle

### 4.4 Main Content Area

- Flex: 1, display flex, flexDirection column
- Background: `var(--stitch-bg)` (#10131a)
- Overflow: auto
- Padding: `24px` (desktop), `16px` (mobile)
- Max-width: none (content fills available space)
- Content animation: `fadeIn 0.3s ease` on route change

---

## 5. Page: Dashboard

### 5.1 Page Header

- "Dashboard" title: `var(--text-headline-lg)` (800 24px/32px), color `var(--stitch-text)`, letter-spacing `-0.02em`
- Margin-bottom: `24px`
- Animation: `fadeIn 0.3s ease` on mount

### 5.2 KPI Cards Grid

**Layout:**
- CSS Grid: `repeat(auto-fit, minmax(220px, 1fr))`, gap `16px`
- Margin-bottom: `32px`

**Each KPI Card:**
- Background: `var(--stitch-surface)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `16px`
- Padding: `24px`
- Display: flex, flexDirection: column

**Inside each KPI Card:**
- Label: `var(--text-label-sm)` (500 12px), color `var(--stitch-text-muted)`, uppercase, letter-spacing `0.04em`
- Value: `var(--text-display-lg)` (800 32px/40px), color `var(--stitch-primary-container)`, letter-spacing `-0.02em`
  - Use `var(--text-mono)` for the numeric value to get monospaced alignment
- Icon accent: small colored dot or icon (12px) next to label, using the card's accent color

**Accent Colors per KPI:**
- "Ventas hoy": `var(--stitch-primary-container)` (#4d8eff)
- "Transacciones": `var(--stitch-success)` (#50d890)
- "Artículos vendidos": `var(--stitch-tertiary)` (#ffb786)
- "Ticket promedio": `var(--stitch-text-secondary)` (#c2c6d6)

**Stagger Animation:**
- Each card gets `animation: fadeIn 0.4s ease both` with delay: card 1 = 0ms, card 2 = 80ms, card 3 = 160ms, card 4 = 240ms

### 5.3 Low Stock Alert Table

**Container:**
- Same grid as current: `2fr 1fr` (desktop), `1fr` (mobile)
- Left panel: low stock table
- Right panel: quick actions

**Low Stock Panel:**
- Background: `var(--stitch-surface)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `16px`
- Padding: `24px`

**Panel Title:**
- "Productos con stock bajo (N)"
- Font: `var(--text-headline-md)` (700 20px), color `var(--stitch-text)`
- Warning icon: `var(--stitch-tertiary)` color

**Table Inside:**
- Column headers: `var(--text-label-sm)` (500 12px), uppercase, letter-spacing `0.04em`, color `var(--stitch-text-muted)`
- Data cells: padding `14px 0`, border-bottom `1px solid var(--stitch-outline-variant)`
- Product name: weight 500, 14px
- Product code: 11px, muted
- Stock values: `var(--text-mono)` (Geist Mono), weight 600
- Low stock number: color `var(--stitch-tertiary)`
- Zero stock: color `var(--stitch-error)`, weight 700
- Status badges: `var(--stitch-error)` bg for AGOTADO, `var(--stitch-warning-container)` bg for REPONER, both with 6px border-radius, 11px uppercase

**Empty State (no low stock):**
- All-green checkmark icon (48px), "Todos los productos tienen stock suficiente", color `var(--stitch-success)`

### 5.4 Quick Actions Panel

**Container:**
- Background: `var(--stitch-surface)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `16px`
- Padding: `24px`

**Title:** "Acciones rápidas", `var(--text-headline-md)` (700 20px)

**Action Items (stacked vertically):**
- Each: flex row, padding `14px 16px`, border-radius `10px`, margin-bottom `8px`
- Background: `var(--stitch-bg)` (slightly darker than surface)
- Border-left: `3px solid` [accent color]
- Text: 14px, weight 500, color of accent
- On hover: background brightens to `var(--stitch-surface-high)`, subtle translateX(4px) slide
- Transition: `all 150ms ease`
- Arrow icon `→` at right end

**Action Colors:**
- "Nueva venta": `var(--stitch-primary-container)`
- "Agregar producto": `var(--stitch-success)`
- "Iniciar auditoría": `var(--stitch-tertiary)`
- "Generar informe": `var(--stitch-text-secondary)`

---

## 6. Page: Products

### 6.1 Page Header

- Flex row, space-between, align center
- Left: "Productos" title + inactive count badge (if showing inactive)
- Title: `var(--text-headline-lg)` (800 24px)
- Inactive count: `var(--text-body-md)` (400 16px), color `var(--stitch-text-muted)`, margin-left `12px`

**Header Actions (right side):**
- "Ver inactivos" toggle button: `secondary` variant, sm size. When active: `warning` variant (amber bg, dark text)
- "+ Nuevo producto" button: `primary` variant, md size

### 6.2 Search & Filter Bar

**Layout:** Flex row, gap `12px`, margin-bottom `20px`

**Search Input:**
- Placeholder: "Buscá por nombre o código..."
- Background: `var(--stitch-surface-dim)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `12px` (slightly larger for search prominence)
- Padding: `12px 16px`, font-size 14px
- Focus: border-color `var(--stitch-primary-container)`, box-shadow `0 0 0 3px rgba(77, 142, 255, 0.15)`
- On mobile: full width

**Category Select:**
- Min-width: `180px`
- Same styling as search input

### 6.3 Product Form (Create/Edit)

**Container:**
- Background: `var(--stitch-surface)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `16px`
- Padding: `24px`
- Margin-bottom: `20px`
- Entrance animation: `fadeIn 0.3s ease`

**Form Title:**
- "Nuevo producto" / "Editar producto"
- Font: `var(--text-headline-md)` (700 20px)

**Form Grid:**
- Desktop: `grid-template-columns: 1fr 1fr`, gap `16px`
- Mobile: single column

**Input Labels:**
- Font: `var(--text-label-md)` (600 14px), color `var(--stitch-text-secondary)`
- Position: above input, margin-bottom `6px`
- Voseo text: "Código", "Nombre del producto", "Precio de costo", "Precio de venta", "Stock mínimo", "Unidad", "Categoría", "Descripción"

**Input Styling:**
- Background: `var(--stitch-surface-dim)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `10px`
- Padding: `10px 14px`
- Full width

**"Generar" Buttons (code/barcode):**
- Padding: `8px 14px`
- Background: `var(--stitch-surface-high)`
- Color: `var(--stitch-text-secondary)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `8px`
- Font: 12px, weight 600

**Form Actions:**
- Flex row, gap `12px`, margin-top `20px`
- "Crear producto" / "Guardar cambios": `primary` variant
- "Cancelar": `secondary` variant

### 6.4 Products Table

**Container:**
- Background: `var(--stitch-surface)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `16px`
- Overflow: hidden

**Table Headers:**
- Background: `var(--stitch-surface-dim)`
- Font: `var(--text-label-sm)` (500 12px), uppercase, letter-spacing `0.04em`, color `var(--stitch-text-muted)`
- Padding: `12px 14px`
- Numeric columns: text-align right

**Table Rows:**
- Padding: `14px`
- Border-bottom: `1px solid var(--stitch-outline-variant)`
- Hover: background `var(--stitch-surface-high)` (subtle)
- Inactive rows: opacity `0.4`

**Data Cells:**
- Product name: weight 500, 14px
- Code: 13px, muted
- Description: 11px, muted, below name
- Price: `var(--text-mono)`, weight 600, color `var(--stitch-success)`
- Stock number: `var(--text-mono)`, weight 700, 18px
  - Zero: `var(--stitch-error)`
  - Low: `var(--stitch-tertiary)`
  - OK: `var(--stitch-text)`
- Category: 13px, muted

**Status Badges:**
- "Agotado": `var(--stitch-error)` bg, white text
- "Bajo": `var(--stitch-warning-container)` bg, `var(--stitch-tertiary)` text
- "OK": `var(--stitch-success-container)` bg, `var(--stitch-success)` text
- "Inactivo": `var(--stitch-surface-high)` bg, `var(--stitch-text-muted)` text
- Border-radius: `6px`, font 11px, weight 600, uppercase

**Action Buttons (per row):**
- +1 / -1 / Edit / Delete
- Small buttons: `8px 10px`, border-radius `8px`, font 12px, weight 600
- +1: `var(--stitch-success-container)` bg, `var(--stitch-success)` text
- -1: `var(--stitch-error-container)` bg, `var(--stitch-error)` text
- Edit: `var(--stitch-surface-high)` bg, `var(--stitch-text-secondary)` text
- Delete: transparent bg, `var(--stitch-text-muted)` text, hover `var(--stitch-error)`
- Transition: all 120ms ease

**Barcode Column:**
- Barcode image: height `48px` (reduced from 60), border-radius `4px`
- Barcode text: 10px mono, muted
- "Generar" button: same style as form generate buttons

**Empty State:**
- "No se encontraron productos" / "No hay productos inactivos"
- 48px muted icon, centered

---

## 7. Page: Sales (POS)

### 7.1 Page Header

- "Ventas" title: `var(--text-headline-lg)` (800 24px), margin-bottom `20px`

### 7.2 Tab Bar

**Container:**
- Flex row, gap `2px`, margin-bottom `20px`
- Background: `var(--stitch-surface-dim)` (dark strip behind tabs)
- Border-radius: `12px`
- Padding: `4px`
- Width: fit-content

**Tab Button:**
- Padding: `10px 24px`
- Border-radius: `10px`
- Font: `var(--text-label-md)` (600 14px)
- Transition: `all 150ms ease`

**Inactive Tab:**
- Background: transparent
- Color: `var(--stitch-text-muted)`

**Active Tab:**
- Background: `var(--stitch-primary-container)` (#4d8eff)
- Color: white
- Box-shadow: `0 2px 8px rgba(77, 142, 255, 0.3)`

### 7.3 New Sale View

**Layout:**
- Desktop: `grid-template-columns: 1fr 380px`, gap `20px`
- Mobile: single column, cart moves to top (or becomes a bottom sheet)

**Code Input Bar:**
- Flex row, gap `12px`, margin-bottom `20px`
- Input: "Escanear o escribir código...", font-size 16px, padding `14px 18px`, border-radius `12px`
- "Agregar" button: `primary` variant, md size
- Input bg: `var(--stitch-surface-dim)`, border `1px solid var(--stitch-outline-variant)`

**Cart Table:**
- Same DataTable treatment as Products
- Columns: Producto, Precio, Cantidad, Subtotal, (action)
- Product name: weight 500, code below in muted 11px
- Prices: `var(--text-mono)` right-aligned
- Quantity input: 60px width, centered, `var(--stitch-surface-dim)` bg, border-radius `8px`
- Remove button: `var(--stitch-error)` color, 18px, no bg/border
- Empty state: "Carrito vacío — Escaneá o escribí un código"

### 7.4 Order Summary Panel (Right Side)

**Container:**
- Background: `var(--stitch-surface)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `16px`
- Padding: `24px`
- Sticky top on desktop

**Title:** "Resumen", `var(--text-headline-md)` (700 20px)

**Line Items:**
- Subtotal, Descuento: flex row, space-between, 14px
- Descuento input: 100px, right-aligned, `var(--stitch-surface-dim)` bg
- Divider: `1px solid var(--stitch-outline-variant)`, margin `12px 0`

**Total:**
- Font: 24px, weight 800, letter-spacing `-0.02em`
- Color: `var(--stitch-primary-container)`
- Monospaced numbers

**Payment Method:**
- Label: "Método de pago", `var(--text-label-md)`, color `var(--stitch-text-muted)`
- Select: full width, same styling as global

**Customer Selector (when fiado):**
- Same treatment, appears with fadeIn animation

**Cobrar Button:**
- Full width, padding `16px`
- Background: `var(--stitch-success)` (green = GO for payment)
- Color: `#0a3d2a` (dark green text on bright green)
- Font: 16px, weight 700, letter-spacing `-0.01em`
- Border-radius: `14px`
- Disabled: `var(--stitch-outline-variant)` bg, `var(--stitch-text-muted)` text, `cursor: not-allowed`
- On hover (enabled): brighten, subtle shadow `0 4px 16px rgba(80, 216, 144, 0.3)`
- Processing: show spinner, text "Procesando..."

### 7.5 Sales History Tab

**Container:**
- Same DataTable treatment

**Columns:**
- #, Fecha, Total (right, mono, bold green), Pago (badge), Cliente, Ítems, Cajero

**Payment Method Badges:**
- "fiado": `var(--stitch-warning)` bg, dark text
- Others: `var(--stitch-surface-dim)` bg, normal text

---

## 8. Page: Customers

### 8.1 Page Header

- "Clientes" title + "+ Nuevo cliente" button (primary)

### 8.2 Customer Form

**Inline Form (not modal):**
- Background: `var(--stitch-surface)`, border `1px solid var(--stitch-outline-variant)`, border-radius `16px`, padding `20px`
- Grid: `1fr 1fr` desktop, single column mobile
- Labels: "Nombre *", "DNI", "Teléfono"
- Voseo placeholders: "Nombre completo", "Número de DNI", "Número de teléfono"
- Actions: "Crear" (primary) + "Cancelar" (secondary)

### 8.3 Customer List Table

**Container:** DataTable treatment

**Columns:**
- Cliente (left, weight 500), DNI (left, mono 13px), Adeuda (right, mono bold), Estado (center, badge)

**Balance Display:**
- `$0`: color `var(--stitch-success)`, weight 700
- `> $0`: color `var(--stitch-error)`, weight 700

**Status Badge:**
- "Adeuda": `var(--stitch-error-container)` bg, `var(--stitch-error)` text
- "Al día": `var(--stitch-success-container)` bg, `var(--stitch-success)` text
- Border-radius: `6px`

**Row Click:** Entire row is clickable, cursor pointer

### 8.4 Customer Detail View

**Back Button:** "← Volver", `var(--stitch-primary-container)` color, 14px, weight 500, margin-bottom `16px`

**Layout:**
- Desktop: `grid-template-columns: 1fr 380px`, gap `20px`
- Mobile: single column

**Customer Info Card:**
- Background: `var(--stitch-surface)`, border `1px solid var(--stitch-outline-variant)`, border-radius `16px`, padding `24px`
- Name: `var(--text-headline-lg)` (800 24px)
- DNI/Tel: `var(--text-body-md)`, color `var(--stitch-text-muted)`
- Stats row: 3 stat blocks (Saldo actual, Total fiado, Total pagado)
  - Each: flex column, label 12px muted, value `var(--text-headline-md)` (700 20px) or `var(--text-display-lg)` (800 32px) for balance
  - Saldo: red if > 0, green if = 0
  - Total fiado: red
  - Total pagado: green

**Movimientos (Transactions):**
- Container: `var(--stitch-surface)`, border `1px solid var(--stitch-outline-variant)`, border-radius `16px`
- Header: "Movimientos", padding `14px 20px`, border-bottom `1px solid var(--stitch-outline-variant)`, weight 600
- Each transaction row: flex row
  - Type badge: "FIADO" (error bg) or "PAGO" (success bg), border-radius `6px`, 10px, weight 600
  - Notes: 13px, muted
  - Date: 13px, muted, right-aligned
  - Amount: 14px, weight 600, mono, red for debt, green for payment

**Registrar Pago Panel:**
- Same as current but with Stitch styling
- Title: "Registrar pago", `var(--text-headline-md)`
- Input: "Monto del pago", full width, `var(--stitch-surface-dim)` bg
- Button: "Registrar pago", full width, `success` variant
- Balance alert: if customer owes, show card with amount in `var(--stitch-error)` weight 700, 24px

---

## 9. Page: Pedidos (Pending Orders)

### 9.1 Page Header

- "Pedidos pendientes" title with count badge
- Badge: `var(--stitch-tertiary)` bg (amber), dark text, border-radius `6px`, padding `4px 12px`, font 14px weight 600

### 9.2 Empty State

- Large icon (64px, muted)
- "No hay pedidos pendientes"
- Description: "Los pedidos que envían los empleados desde la app aparecen acá"
- Use EmptyState component

### 9.3 Order Cards Grid

**Layout:**
- CSS Grid: `repeat(auto-fill, minmax(340px, 1fr))`, gap `16px`

**Each Order Card:**
- Background: `var(--stitch-surface)`
- Border: `1px solid var(--stitch-outline-variant)`
- Border-radius: `16px`
- Padding: `20px`
- Cursor: pointer
- Hover: border-color `var(--stitch-primary-container)`, subtle glow

**Card Header:**
- Left: "Pedido #N" (weight 600, 15px), vendor name + items count (12px, muted)
- Right: Total (20px, weight 700, `var(--stitch-primary-container)`, mono), time (11px, muted)

**Card Items Preview:**
- Border-top: `1px solid var(--stitch-outline-variant)`
- Padding-top: `10px`
- Each item: flex row, space-between, 13px
  - "2x Producto" (normal), "$1.234" (muted)
- Max 4 items shown, "+N más" if more

### 9.4 Order Detail View

**Layout:** Desktop single column (no sidebar needed)

**Order Info Card:**
- Background: `var(--stitch-surface)`, border `1px solid var(--stitch-outline-variant)`, border-radius `16px`, padding `24px`
- Header: flex, space-between
  - Left: "Pedido #N" (20px weight 700), vendor info (13px muted)
  - Right: Total (28px weight 800, `var(--stitch-primary-container)`, mono)

**Items Table:** Same DataTable treatment

**Payment Method Selector:**
- Title: "MÉTODO DE PAGO", `var(--text-label-sm)` uppercase muted
- Toggle buttons in a row: efectivo / tarjeta / transferencia / fiado
- Each button: flex 1, padding `12px`, border-radius `10px`
- Inactive: `var(--stitch-surface-high)` bg, `var(--stitch-text-secondary)` text, `1px solid var(--stitch-outline-variant)` border
- Active: `var(--stitch-primary-container)` bg, white text, no border

**Action Buttons:**
- "Aprobar y descontar stock": `success` variant, full width, 16px weight 700
- "Rechazar": `danger` variant, full width

---

## 10. Page: Presupuestos (Budgets)

### 10.1 Tab Bar

Same treatment as Sales tabs. Two tabs: "Pendientes" / "Nuevo"

### 10.2 New Budget View

**Layout:** Same as Sales POS — `1fr 380px` grid

**Customer Name Input:**
- Label: "Cliente (opcional)"
- Placeholder: "Nombre del cliente..."

**Code Input:** Same as Sales POS

**Cart Table:** Same DataTable treatment as Sales

**Summary Panel:**
- "Productos: N", divider, "TOTAL: $X" (20px weight 700, `var(--stitch-primary-container)`)
- Button: "Crear presupuesto", primary, full width

### 10.3 Budget List

**Card Grid:** `repeat(auto-fill, minmax(320px, 1fr))`, gap `16px`

**Each Budget Card:**
- Same treatment as Pedidos cards
- Header: "#N Nombre del cliente" (weight 600), items count
- Total: 20px weight 700, `var(--stitch-primary-container)`
- Items preview: up to 3 items

### 10.4 Budget Detail View

- Same layout as Pedidos detail
- Action buttons: "Aprobar y vender" (success), "Rechazar" (danger)

---

## 11. Page: Audits

### 11.1 Page Header

- "Auditorías de Stock" title

### 11.2 Create Audit Form

**Container:** `var(--stitch-surface)`, border, border-radius `16px`, padding `20px`

**Title:** "Nueva auditoría"

**Form:**
- Input: "Notas (opcional)", placeholder "Ej: Auditoría mensual depósito...", full width
- Button: "Crear auditoría", `primary` variant, same row

### 11.3 Active Audit Scanner View

**Back Button:** Same as Customer detail

**Scanner Input:**
- Full width, "Escanear código para contar...", font-size 16px, padding `14px 18px`
- "Contar +1" button: `primary` variant

**Differences Header:**
- Flex row, space-between
- "Diferencias: N" (weight 600)
- "Completar y aplicar" button: `success` variant

**Differences Table:**
- Columns: Producto, Teórico, Contado, Diferencia
- Difference cell:
  - Positive: `var(--stitch-success)` weight 700
  - Negative: `var(--stitch-error)` weight 700
  - Zero: muted

### 11.4 Audit List

**Table:** Standard DataTable treatment
- Columns: #, Fecha, Estado, Creado por, Notas, Acción

**Status Badges:**
- "Borrador": neutral bg
- "En curso": warning bg
- "Completada": success bg

**Action Button:**
- "Iniciar" / "Continuar": `warning` variant (amber), sm size

---

## 12. Page: Reports

### 12.1 Upgrade Gate

**UpgradeBlock:**
- Centered, padding `48px`
- Text: "X no disponible en tu plan actual."
- Link: "Ver planes disponibles →", primary color, weight 600
- Background: `var(--stitch-surface)`, border, border-radius `16px`

### 12.2 Date Picker Row

- Flex row, gap `12px`, align flex-end
- Label: "Fecha", 12px muted
- Input: date type
- "Ver informe" button: primary
- "Generar / Re-generar" button: success

### 12.3 Report Stats Grid

- `repeat(auto-fit, minmax(200px, 1fr))`, gap `16px`
- Same KPI card treatment as Dashboard
- Stagger animation

### 12.4 Report Detail Cards

**Two-column grid:** `1fr 1fr` (desktop), `1fr` (mobile)

**Payment Method Breakdown:**
- Title: "Por método de pago"
- Progress bars:
  - Each method: label + value + percentage
  - Bar container: `var(--stitch-surface-dim)`, height `8px`, border-radius `4px`
  - Bar fill: colored (green/blue/amber), same border-radius

**Top Products:**
- Title: "Top productos"
- Mini table: Producto, Cant., Total
- Total column: mono, weight 600, green

### 12.5 Export Section

**Format Toggle:**
- Two buttons: CSV / Excel
- Inactive: `var(--stitch-surface)` bg, border, rounded
- Active: `var(--stitch-primary-container)` bg, white text

**Export Cards Grid:** `1fr 1fr` (desktop), `1fr` (mobile)
- Each card: `var(--stitch-surface)`, border, border-radius `16px`, padding `20px`
- Title: 15px weight 600
- Filter inputs + Export button in a row
- Export button: primary, sm

**"Para el contador" Tip:**
- Background: `var(--stitch-surface)`, border, border-radius `16px`, padding `16px`
- Title: 14px weight 600, muted
- Body: 13px, muted, line-height 1.6

---

## 13. Page: Vendors

### 13.1 Page Header

- "Vendedores" title + "+ Nuevo vendedor" button (primary)

### 13.2 Vendor Form

**Inline Form:**
- Same treatment as Customer form
- Labels: "DNI *", "Nombre *"
- Placeholders: "Ej: 12345678", "Nombre completo"

### 13.3 Vendor Table

**Columns:** DNI, Nombre, Estado (badge), Acción

**Status Badge:**
- "Activo": success bg
- "Inactivo": neutral bg

**Action Button:**
- "Desactivar": danger variant, sm

---

## 14. Page: Upgrade

### 14.1 Active License View

- Title: "Licencia activa", weight 800
- Plan info: name + key
- Success card: green bg, "Todas las funciones están habilitadas."

### 14.2 Plans Grid

**Layout:** Flex wrap, gap `20px`

**Each Plan Card:**
- Flex: `1 1 300px`
- Background: `var(--stitch-surface)`
- Border: `1px solid var(--stitch-outline-variant)` (default) or `2px solid var(--stitch-primary-container)` (highlighted)
- Border-radius: `16px`
- Padding: `28px`
- Display: flex, flexDirection: column

**Highlighted Plan (Suscripción):**
- Border: `2px solid var(--stitch-primary-container)`
- Badge: "RECOMENDADO" with primary bg, 11px, weight 700, border-radius `6px`
- Box-shadow: `0 0 30px rgba(77, 142, 255, 0.1)`

**Plan Content:**
- Name: `var(--text-headline-lg)` (800 24px)
- Price: `var(--text-display-lg)` (800 32px/40px), letter-spacing `-0.02em`
- Mode: 12px, muted
- Features list:
  - Each: flex row, gap `10px`, 13px
  - Checkmark: `var(--stitch-success)`, bold
  - Text: normal weight
- Not-included features:
  - Crossmark: `var(--stitch-text-muted)`
  - Text: muted, strikethrough-like opacity
- Footer: "Para adquirir este plan, contactanos.", centered, muted, padding-top

### 14.3 Trial Warning

- Background: `var(--stitch-warning-container)`, border `1px solid var(--stitch-tertiary)`, border-radius `10px`
- Text: "Te quedan N días de prueba...", 13px, dark text on amber bg

---

## 15. Page: Settings

### 15.1 Page Header

- "Ajustes" title (800 24px)
- Subtitle: "Configuración del sistema y licencia", 16px, muted

### 15.2 License Info Card

**Container:** `var(--stitch-surface)`, border, border-radius `16px`, padding `24px`, max-width `500px`

**Title:** "Licencia actual", 16px weight 600

**Info Rows:**
- Each row: flex, gap `8px`, 14px, line-height 2
- Labels: weight 600
- Values: normal
- Key: displayed in mono font (`var(--text-mono)`)

**Status Badge:**
- "Activa": success bg, white text
- "Inactiva": error bg, white text
- Border-radius: `8px` (slightly more rounded for settings)

### 15.3 Activate License Card

**Container:** Same treatment, below license info

**Title:** "Activar licencia"

**Key Input:**
- Placeholder: "TST-XXXX-XXXX-XXXX-XXXX"
- Font-family: `Geist Mono, monospace` (important for key readability)
- Letter-spacing: `0.05em`
- Background: `var(--stitch-surface-dim)`

**Name Input:**
- Placeholder: "Tu nombre o negocio (opcional)"

**Activate Button:**
- Primary variant
- Disabled when empty or submitting

---

## 16. Page: ScannerConnect

### 16.1 Page Header

- "Scanner - App Android" title
- Subtitle: "La app Android se conecta a este servidor por WiFi local para escanear códigos. Abajo podés simular el escaneo manualmente."

### 16.2 Server Info Card

**Container:** `var(--stitch-surface)`, border, border-radius `16px`, padding `24px`

**Title:** "Datos del servidor" + green dot indicator

**IP Addresses:**
- Each IP: display as a clickable code block
  - Background: `var(--stitch-surface-dim)`
  - Padding: `10px 16px`, border-radius `8px`
  - Font: `var(--text-mono)`, 15px, weight 600, color `var(--stitch-primary-container)`
  - Border: `1px solid var(--stitch-outline-variant)`
  - On hover: border-color `var(--stitch-primary-container)`, glow
  - Cursor: pointer (copies to clipboard)
  - Transition: `all 150ms ease`

**URL for App:**
- Same code block style but green border, green text

### 16.3 Scanner Simulator

**Two-column grid:** `1fr 1fr` (desktop), `1fr` (mobile)

**Left: Simulator**
- Title: "Simulador de escaneo"
- Input + "Escanear" button
- Product result card: `var(--stitch-surface-dim)` bg, border-radius `12px`, padding `16px`
  - Name: 16px weight 600
  - Code: 13px muted
  - Price: weight 700, green
  - Stock: weight 700

**Right: New Product Registration**
- Title: "Registrar producto nuevo"
- Form fields stacked vertically
- "Registrar producto" button: success variant

---

## 17. Global Components

### 17.1 TrialBanner

**Visual Treatment:**
- Background: `var(--stitch-tertiary)` (amber) when active trial, `var(--stitch-error)` when expired
- Color: dark text (#311400) on amber, white on error
- Padding: `12px 20px`
- Font: `var(--text-label-md)` (600 14px)
- Flex row, space-between, align center
- "Ver planes" link: underlined, weight 700
- Animation: `slideDown 0.3s ease` on mount
- z-index: 100 (below sidebar)

### 17.2 SubscriptionBanner

- Same visual treatment as TrialBanner
- Warning amber for grace period
- Error red for suspended
- "Regularizar" link instead of "Ver planes"

### 17.3 EulaModal

**Overlay:**
- `rgba(0, 0, 0, 0.85)` background
- `backdrop-filter: blur(12px)` — heavy blur for emphasis

**Panel:**
- Max-width: `600px`
- Border-radius: `20px` (extra rounded for legal modal prominence)
- Background: `var(--stitch-surface)`

**Header:**
- "TUSTOCK" in 800 28px, `var(--stitch-primary-container)` color
- Subtitle: 13px, muted

**Terms Content:**
- Font-size: 13px, line-height 1.8
- Color: `var(--stitch-text-secondary)`
- Strong text: `var(--stitch-text)`
- Links: `var(--stitch-primary-container)`, underlined

**Checkbox:**
- 18x18px, accent-color `var(--stitch-primary-container)`
- Label: 14px, "Acepto los Términos y Condiciones y la Política de Privacidad"

**Accept Button:**
- Full width, padding `14px`
- Background: `var(--stitch-primary-container)` when checked, `var(--stitch-outline-variant)` when unchecked
- Font: 15px, weight 700
- Transition: `all 200ms ease`

### 17.4 Toast Notifications

**Container:** Fixed bottom-right, z-index 9999

**Toast Item:**
- Padding: `14px 20px`
- Border-radius: `12px`
- Font: `var(--text-label-md)` (600 14px), white color
- Success: `var(--stitch-success)` bg
- Error: `var(--stitch-error)` bg (dark text)
- Info: `var(--stitch-primary-container)` bg
- Shadow: `0 8px 24px rgba(0, 0, 0, 0.4)`
- Animation: `slideInRight 0.25s ease` enter, `fadeIn` reverse on exit
- Max-width: `400px`
- z-index: 9999

---

## 18. Animations & Transitions

### 18.1 Page Transition

When navigating between pages:
```css
.page-enter {
  animation: fadeIn 0.3s ease both;
}
```
- Apply to the main content `<main>` element on route change.
- Use `key={location.pathname}` on the wrapper to trigger re-animation.

### 18.2 Card Hover

```css
.card-hover {
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
}
.card-hover:hover {
  border-color: var(--stitch-primary-container);
  box-shadow: 0 0 20px rgba(77, 142, 255, 0.08);
  transform: translateY(-1px);
}
```

### 18.3 Stagger Animation (for grids of cards)

Apply to each child in a grid:
```css
.stagger-item {
  animation: fadeIn 0.4s ease both;
}
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 60ms; }
.stagger-item:nth-child(3) { animation-delay: 120ms; }
.stagger-item:nth-child(4) { animation-delay: 180ms; }
.stagger-item:nth-child(5) { animation-delay: 240ms; }
.stagger-item:nth-child(6) { animation-delay: 300ms; }
```

### 18.4 Loading Skeletons

- Shimmer animation: `1.5s infinite linear`
- Gradient: `var(--stitch-surface-high)` → `var(--stitch-surface-highest)` → `var(--stitch-surface-high)`
- Applied to placeholder rows/rectangles

### 18.5 Button Press

```css
button:active:not(:disabled) {
  transform: scale(0.98);
}
```

### 18.6 Focus Ring

```css
*:focus-visible {
  outline: 2px solid var(--stitch-primary-container);
  outline-offset: 2px;
}
```

### 18.7 Modal Enter/Exit

- Enter: `fadeInScale 200ms ease-out`
- Exit: reverse (fade + scale down)

### 18.8 Toast Enter/Exit

- Enter: `slideInRight 250ms ease`
- Exit: fade out over 200ms

---

## 19. Mobile-First Responsive Strategy

### 19.1 Breakpoints

- **Mobile (default):** < 768px — single column, bottom navigation or hamburger menu
- **Tablet:** ≥ 768px — sidebar visible on tablets in landscape, 2-column grids
- **Desktop:** ≥ 1024px — full sidebar, all multi-column layouts
- **Wide:** ≥ 1280px — max container width, extra padding

### 19.2 Mobile-First Principles

1. **All components are designed mobile-first.** The default styles work on a 360px screen. Media queries ADD complexity for larger screens.
2. **Touch targets minimum 44x44px** — critical for retail use where users may be wearing gloves or have wet hands.
3. **Horizontal scroll is NEVER needed** — all content fits within viewport width.
4. **Tables become card lists on mobile** — horizontal data tables don't work on small screens. Each row becomes a stacked card.
5. **Sticky action buttons** — on mobile, the primary action button (e.g., "Cobrar") is pinned to the bottom of the viewport.

### 19.3 Mobile Adaptations by Page

**Products:**
- Table → Card list: each product is a card with name, code, price (mono, green), stock badge, and action buttons (inline)
- Search bar full width, category filter below
- Form: single column

**Sales (POS):**
- Cart moves to a collapsible bottom section (or tab between cart and summary)
- Code input: full width, large font
- Summary panel becomes full-width below cart
- "Cobrar" button: fixed bottom, full width

**Customers:**
- Table → Card list
- Detail view: single column, payment form below transactions

**Pedidos:**
- Cards stack full-width
- Detail: single column

**Reports:**
- Stats grid: 2 columns on mobile (not 4)
- Export cards: single column

**Upgrade:**
- Plan cards: full width, stacked vertically

---

## 20. Copy & Language Guidelines

### 20.1 Argentine Voseo

ALL user-facing text must use Argentine Spanish (voseo). Key conjugations:

| Infinitive | Voseo Form | English |
|-----------|-----------|---------|
| Buscar | Buscá | Search |
| Cargar | Cargá | Load |
| Crear | Creá | Create |
| Guardar | Guardá | Save |
| Escanear | Escaneá | Scan |
| Liquidar | Liquidá | Cash out |
| Exportar | Exportá | Export |
| Generar | Generá | Generate |
| Seleccionar | Seleccioná | Select |
| Iniciar | Iniciá | Start |
| Completar | Completá | Complete |
| Cancelar | Cancelá | Cancel |
| Aprobar | Aprobá | Approve |
| Rechazar | Rechazá | Reject |
| Activar | Activá | Activate |
| Contactar | Contactanos | Contact us |
| Verificar | Verificá | Verify |
| Ingresar | Ingresá | Enter/Input |
| Elegir | Elegí | Choose |

### 20.2 Placeholder Text

| Location | Text |
|----------|------|
| Product search | "Buscá por nombre o código..." |
| POS scanner | "Escanear o escribir código de producto..." |
| Audit scanner | "Escanear código para contar..." |
| Customer name | "Nombre completo" |
| Customer phone | "Número de teléfono" |
| Vendor DNI | "Ej: 12345678" |
| License key | "TST-XXXX-XXXX-XXXX-XXXX" |
| Customer (optional) | "Nombre del cliente..." |
| Budget scanner | "Escanear o escribir código..." |

### 20.3 Button Labels

| Location | Text |
|----------|------|
| New product | "+ Nuevo producto" |
| New customer | "+ Nuevo cliente" |
| New vendor | "+ Nuevo vendedor" |
| Create product | "Crear producto" |
| Edit product | "Guardar cambios" |
| Add to cart | "Agregar" |
| Cash out | "Cobrar $X.XX" |
| Approve order | "Aprobar y descontar stock" |
| Reject order | "Rechazar" |
| Start audit | "Iniciar" |
| Complete audit | "Completar y aplicar" |
| Export | "Exportar" |
| Activate license | "Activar licencia" |
| View plans | "Ver planes" |
| Generate report | "Generar / Re-generar" |

### 20.4 Empty States

| Location | Title | Description |
|----------|-------|-------------|
| Products (no results) | "No se encontraron productos" | — |
| Pedidos (empty) | "No hay pedidos pendientes" | "Los pedidos que envían los empleados desde la app aparecen acá" |
| Presupuestos (empty) | "No hay presupuestos pendientes" | — |
| Audits (empty) | "No hay auditorías registradas" | — |
| Customers (empty) | "No hay clientes registrados" | — |
| Vendors (empty) | "No hay vendedores registrados" | — |
| Sales (empty cart) | "Carrito vacío" | "Escaneá o escribí un código" |

---

## Implementation Notes

### Migration Strategy

1. **Replace `index.css` entirely** with the Stitch version above.
2. **Update `components/ui/` components first** — Button, Card, Badge, Modal, DataTable, EmptyState, Skeleton.
3. **Update `Layout.tsx`** — sidebar, mobile header, content area.
4. **Update pages one by one** — Dashboard → Products → Sales → Customers → Pedidos → Presupuestos → Audits → Reports → Vendors → Upgrade → Settings → ScannerConnect.
5. **Update global components** — TrialBanner, SubscriptionBanner, EulaModal, Toast.
6. **Do NOT change** any API calls, state management, routing, or data types. This is purely a visual redesign.
7. **Do NOT change** `api/client.ts`, `App.tsx` routing structure, or `main.tsx` providers.

### What Stays the Same

- All API endpoints and data fetching patterns
- All React state management (useState, useEffect, useCallback)
- All routing (react-router-dom Routes/Route)
- TypeScript types and interfaces
- Business logic (cart, payment methods, license checks, etc.)
- Component file structure and naming

### What Changes

- ALL inline styles (every `style={{...}}` in every file)
- CSS custom properties in `index.css`
- Font imports (add Inter + Geist Mono from Google Fonts)
- Animation keyframes
- Visual treatment of every component and page
- Copy text (voseo)

### Key Visual Differences (Before → After)

| Element | Before | After (Stitch) |
|---------|--------|----------------|
| Background | `#0f172a` (blue-black) | `#10131a` (deep indigo) |
| Surface | `#1e293b` (slate) | `#1d2027` (dark indigo-gray) |
| Primary | `#3b82f6` (bright blue) | `#4d8eff` (soft vibrant blue) |
| Text | `#e2e8f0` | `#e1e2ec` (softer) |
| Muted text | `#94a3b8` | `#8c909f` (cooler) |
| Borders | `#334155` | `#424754` (darker, more subtle) |
| Border-radius | 6-12px mixed | 16px consistent (cards) |
| Shadows | box-shadow (black) | Tonal borders (1px solid) |
| Font | Inter only | Inter + Geist Mono for data |
| Badges | Pill-shaped (border-radius 20) | Rounded squares (border-radius 6) |
| Animations | None/minimal | fadeIn, stagger, hover glow |
| Mobile | Basic responsive | Mobile-first with card lists |

---

*This prompt covers the complete TUSTOCK React frontend redesign. Total files affected: ~30+. Zero changes to business logic, API calls, or routing.*
