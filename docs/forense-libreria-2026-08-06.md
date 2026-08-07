# Forense — Instalación anterior de la Librería (ZIP del 6/8)

> **Fuente:** `F:\TUSTOCK.zip` (146 MB) — copia del sistema que corría en la PC de la clienta **antes** de la actualización del 6/8 (bundle 6/8 con fix de rendimiento). Copiado por el humano el 6/8 a las 10:02. Extraído en temp para análisis read-only. La DB real (`tustock.db`) se analizó en modo `mode=ro` — sin modificar nada.

## 1. Qué era el bundle viejo

| Aspecto | Valor |
|---|---|
| EXE | `TUSTOCK.exe` 11.6 MB (build 3/8) |
| Frontend | `web/dist/index.html` → `/assets/index-BxsJ1R9z.js` (337 KB) = build 3/8 (resumen sobrantes/faltantes) |
| APKs | 4 (pos/stock × debug/release) en raíz + dir `apks/` |
| Config | `config/cloud.json` con API key de la clienta (64 chars) + `configurar.bat` + `KEY.txt` |
| DB | `_internal/tustock.db` 376 KB (con WAL del 6/8 09:55) |
| License key | `TST-A921-C581-9F20-4B43` (coincide con MEMORY) |

### 🟡 Hallazgo 1 — JS viejos acumulados en el dist
`web/dist/assets/` tiene **3 bundles JS**: `index-BxsJ1R9z.js` (337 KB, el que usa index.html), `index-kBkTtofU.js` (316 KB) e `index-TLgyBOjS.js` (316 KB) — huérfanos de builds anteriores. Confirma el bug documentado en §15 ("JS viejo se sirve después de rebuild"): los bundles acumulan JS con hash viejo sin limpiar. No rompe (index.html apunta al correcto) pero infla el bundle. **El checklist §15 punto 4 sigue vigente.**

### 🟡 Hallazgo 2 — `.env` del bundle contiene `TUSTOCK_ADMIN_TOKEN` (40 chars)
El `.env` shippeado al cliente trae el token de admin. **Impacto real: BAJO** — el router admin (`server/routes/admin.py`) **NO se monta** en `main.py` (no hay `include_router(admin_router)`): los endpoints `/api/admin/*` locales no existen en el server del cliente. El token solo lo usa la cloud API (Railway). Riesgo teórico: si el .env se filtra y el token coincide con el de Railway, un atacante podría llamar a la cloud API admin. **Acción: sanitizar el .env en el próximo build de bundle (quitar `TUSTOCK_ADMIN_TOKEN`)** — verificado que maestra (E:) y pendrive (F:) tampoco lo tienen sanitizado.

## 2. La DB real del negocio (lo valioso)

### Inventario
| Métrica | Valor |
|---|---|
| Productos | **639** (con code + barcode EAN: 638; 1 sin barcode) |
| Categorías | **1 sola: "LIBRERIA"** (la clienta no usa categorías) |
| Unidades en stock | **30.224** (promedio 47.3 por producto; ninguno en cero) |
| Precios | 639 con precio > 0 — min $10, max $130.000 (Lápices Faber Castell x100), promedio $5.691 |
| min_stock | 638 configurados (> 0) |
| Vencimientos | 0 (no aplica a librería) |
| Auditorías | 0 completadas |

### Actividad (29/7 → 6/8, ~8 días de uso)
| Métrica | Valor |
|---|---|
| **Ventas registradas** | **1 sola** (29/7, $3.500, método "fiado", cliente "TEST" — evidentemente una prueba del día de instalación) |
| Pedidos pendientes | 1 — **RECHAZADO** (reglas Wero, 29/7 — la clienta probó la app POS y lo rechazó) |
| Movimientos de stock | **1.884**: 1.095 entradas + 452 salidas + 337 ajustes |
| Vendedores | 2: LUMA (DNI 33234567) y PATRI TOLEDO (DNI 25976207) — cargados para uso real |
| Clientes | 1: "TEST" (fiado $3.500 creado y pagado en el mismo día) |

## 3. Aprendizajes clave

### 🟡 La clienta está en fase de CARGA INICIAL — las ventas van al cuaderno (decisión de la dueña)
- Hay **452 movimientos "exit"** pero **1 sola venta** en el sistema.
- **ACLARACIÓN DEL HUMANO (6/8):** los "exit" son **ventas reales anotadas al cuaderno** mientras se termina la carga. **Patricia (dueña) decidió que todo el stock esté cargado antes de empezar a vender por el sistema.**
- **Qué significa:** la clienta está usando TUSTOCK como sistema de inventario (carga + control), no como POS — de forma deliberada, según su plan de puesta en marcha.
- **Impacto:** mientras no registre ventas en el POS, el Monitor Cloud le muestra actividad casi nula (1 venta).
- **Acción de soporte (agendada):** cuando termine la carga → capacitación POS (flujo de venta: carrito → cobro), y aclarar que vender "sacando stock" con ajustes duplica trabajo. La app POS (pedido → aprobación) quedó rechazada en una prueba (29/7): verificar si el flujo le resultó confuso (esperaba que la venta se registrara sola).

### 🟡 No explota categorías
Una sola categoría ("LIBRERIA") → los informes por categoría y el filtrado no le sirven. Sugerirle agrupar (Escolar, Escritura, Papelería, etc.) para aprovechar informes y búsquedas. Es una tarea de datos, no de desarrollo.

### 🟡 Stock cargado con precisión real
638 barcodes EAN reales y 30.224 unidades: hizo una carga inicial seria (probablemente con la app Stock). El seed demo y las guías de carga inicial están validados contra este patrón real.

## 4. Pendientes accionables

| # | Acción | Quién | Prioridad |
|---|---|---|---|
| 1 | **Capacitar a la clienta en el flujo de venta POS** — AGENDADA para cuando termine la carga inicial (decisión de Patricia: todo el stock cargado antes de vender por el sistema). Aprovechar para preguntar por qué rechazó el pedido de la app POS | 🧑 Humano (soporte) | 🟡 Alta (cuando termine la carga) |
| 2 | Sanitizar `.env` del bundle de entrega (quitar `TUSTOCK_ADMIN_TOKEN`) en el próximo build | 🖥 DEV (proceso de build) | 🟡 Media |
| 3 | Limpiar JS huérfanos en `web/dist/assets` al rebuildear (checklist §15 punto 4 — mantener) | 🖥 DEV | 🟡 Media |
| 4 | Sugerir categorías a la clienta para explotar informes | 🧑 Humano (soporte) | 🟢 Baja |

## 5. Nota sobre hardware de la clienta
PC de la librería: **Intel Celeron J4025 (2 núcleos) + 4 GB RAM** — hardware de entrada. El backend responde <100 ms a 648 artículos (test de estrés 6/8); el frontend React tiene solo 2 `backdrop-filter` en `index.css` (costo de renderizado bajo). **El cuello de botella es Windows + navegador en esa CPU/GPU integrada, no TUSTOCK.** Ver recomendaciones de optimización de la PC en el reporte de la sesión.

*Forense: Dispatcher — análisis read-only sobre `F:\TUSTOCK.zip`. Ningún dato del cliente se expone fuera de este documento.*
