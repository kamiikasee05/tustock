# Optimización de la PC de la Librería — Checklist (6/8/2026)

> **Contexto:** La clienta reportó lentitud con 648 artículos. El fix 6/8 (búsqueda server-side en POS/Productos/Presupuestos) fue aplicado y **confirmado por la clienta**: "el sistema se comportó bien y mejoró la velocidad".
> El test de estrés 6/8 demostró que el backend responde **<100 ms a 648 artículos** y el frontend React tiene solo 2 `backdrop-filter`. **El cuello de botella restante es el hardware** de la PC de la clienta:
>
> - **Procesador:** Intel Celeron J4025 @ 2.00 GHz (2 núcleos)
> - **RAM:** 4 GB (3,75 GB usable) — Windows x64
> - **GPU:** integrada (Intel UHD Graphics 600)
>
> Este checklist de configuración de Windows (sin instalar nada) maximiza el rendimiento de esa PC. Adicionalmente, TUSTOCK 6/8 v2 incluye el **modo liviano** (ver abajo).

---

## Modo liviano en TUSTOCK (implementado 6/8, bundle v2)

El sistema detecta automáticamente hardware débil (`navigator.hardwareConcurrency <= 2` OR `navigator.deviceMemory <= 4`) y agrega la clase `lite` al `<html>`:

- **Desactiva las 69 animaciones/transiciones inline** de los componentes (Layout, Dashboard, Products, Sales, Toast, etc.) — `animation-duration: 0.01ms !important`.
- **Desactiva el efecto glass** (`.glass-panel` sin `backdrop-filter`) — el blur(12px) es caro en GPU integrada.
- **`prefers-reduced-motion: reduce`** también activa el modo liviano: si la PC tiene desactivados los "Efectos de animación" de Windows (paso 1 abajo), el navegador lo respeta y TUSTOCK aplica el modo liviano igual.

Archivos tocados: `web/src/index.css` (bloque final) + `web/src/main.tsx` (detección). Build: `index-BY0B1i1D.js` + `index-st6KUokJ.css`.

---

## Checklist de optimización Windows (para la PC de la librería)

### 1. Apagar efectos visuales de Windows (🔥 máximo impacto)
- Inicio → escribir **"Efectos de animación"** → **"Efectos de animación"** → **Apagar**.
- Ruta alternativa: Configuración → Accesibilidad → Efectos de animación → Apagar.
- **Beneficio doble:** Windows consume menos GPU/RAM **y** TUSTOCK activa el modo liviano automáticamente (prefers-reduced-motion).

### 2. Plan de energía: Alto rendimiento (opcional)
- Inicio → escribir **"Elegir plan de energía"** → **Rendimiento alto** (si no aparece, "Máximo rendimiento" en Opciones adicionales de energía).
- En notebook es opcional (gasta más batería); en desktop es gratis.

### 3. Inicio limpio (más RAM libre)
- `Ctrl+Shift+Esc` (Administrador de tareas) → pestaña **"Aplicaciones de inicio"**.
- Desactivar todo lo que no sea imprescindible: WhatsApp, Spotify, etc. (conservar el antivirus).
- Menos programas al inicio = más RAM disponible para TUSTOCK.

### 4. Cerrar programas al usar TUSTOCK
- Con 4 GB de RAM, un navegador con muchas pestañas se come todo.
- Dejar **1 sola pestaña** abierta con el sistema (http://localhost:8090) mientras se trabaja.
- Cerrar apps de fondo innecesarias (Teams, actualizadores, etc.).

### 5. Liberador de espacio (opcional)
- Inicio → **"Liberador de espacio"** → unidad C: → "Archivos de sistema" → limpiar temporales y actualizaciones viejas.

### 6. Windows Update fuera del horario de trabajo
- Configuración → Windows Update → **Reanudación** → cambiar el horario de instalación a la noche (una actualización descargándose en background consume CPU/RAM/disco).

---

## Qué NO hacer

- ❌ No instalar "aceleradores" ni programas de limpieza automática (pesan más de lo que ayudan).
- ❌ No ampliar el pagefile a costa del disco C: sin necesidad.
- ❌ No cambiar la resolución/DPI del sistema (rompe la vista del frontend).
- ❌ No agregar más programas al inicio "por si acaso".

---

## Verificación post-ajuste

1. Abrir TUSTOCK (http://localhost:8090) y navegar entre páginas: debe sentirse inmediato (sin fade/animaciones).
2. Abrir el Administrador de tareas: uso de CPU de TUSTOCK en reposo ≈ 0-5% (no 20-40% por animaciones).
3. Buscar en POS: las sugerencias aparecen al instante al escribir.

---

## Historial

| Fecha | Qué |
|-------|-----|
| 6/8/2026 | Modo liviano implementado (detecta hardware débil o prefers-reduced-motion). EXE rebuild 11.06 MB, bundle v2 en maestra + pendrive F. Checklist creado. |
