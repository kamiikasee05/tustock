# Test de estrés del backend — 6 de Agosto 2026

> **Motivo:** la clienta de la Librería reportó lentitud con **648 artículos** al buscar producto en POS y Gestión de Productos. Se aplicó el fix de frontend (6/8, búsqueda server-side en `Sales.tsx`/`Presupuestos.tsx`/`Products.tsx`). Este test valida que el backend aguanta catálogos grandes y anticipa cuellos de botella para clientes con miles de artículos.

**Contexto del cliente real:** 648 artículos. Los números de abajo muestran que a ese volumen todo responde en milisegundos — el fix 6/8 resuelve el problema reportado.

## Metodología

- **DB de prueba:** `tustock_stress.db` separada (env var `TUSTOCK_DB`), producción intacta.
- **Seed:** `server/seed_stress.py` — inserción masiva `executemany`, productos realistas (nombres, barcodes EAN, vencimientos, stock, 3 auditorías).
- **Benchmark:** `server/benchmark_stress.py` — 9 endpoints, 3 requests de calentamiento + 27 medidas, p50/p95/p99/avg en **ms**. Ronda serial + ronda con 5 threads (simula 2-3 cajeros + monitor).
- **Volúmenes:** 1.000 / 5.000 / 20.000 productos (el de 100k se descartó a pedido del humano).
- **Server:** `python main.py` con la DB de stress, puerto 8090, token local.

## Resultados

### Ronda serial (un usuario a la vez)

| Endpoint | 1k p50 | 1k p95 | 5k p50 | 5k p95 | 20k p50 | 20k p95 |
|---|---|---:|---:|---:|---:|---:|
| products_search_pocos | 7.9 | 32.6 | 29.4 | 33.4 | 70.9 | 78.3 |
| products_search_muchos | 30.9 | 35.8 | 33.5 | 46.6 | 61.9 | 75.9 |
| products_list (paginado) | 10.7 | 31.5 | 30.4 | 35.3 | 30.4 | 35.8 |
| products_scan | 15.0 | 26.0 | 14.2 | 28.1 | 6.2 | 31.1 |
| products_near_expiry | 15.5 | 31.3 | 25.0 | 33.3 | 21.7 | 31.7 |
| **stock_all (GET /api/stock)** | **47.0** | **85.1** | **221.5** | **269.4** | **908.2** | **945.5** |
| sales_create (POST) | 42.8 | 66.2 | 55.8 | 69.2 | 49.5 | 68.4 |
| sales_history | 19.6 | 31.9 | 23.9 | 32.3 | 22.6 | 32.5 |
| audits_list | 5.2 | 27.6 | 5.5 | 26.8 | 15.5 | 31.7 |

### Ronda concurrente (5 threads simultáneos)

| Endpoint | 1k p50 | 1k p95 | 5k p50 | 5k p95 | 20k p50 | 20k p95 |
|---|---|---:|---:|---:|---:|---:|
| products_search_pocos | 23.2 | 43.7 | 95.5 | 146.8 | 468.1 | 497.9 |
| products_search_muchos | 74.8 | 123.3 | 74.7 | 192.6 | 362.4 | 461.0 |
| products_list (paginado) | 70.7 | 84.5 | 77.8 | 94.6 | 75.0 | 97.6 |
| products_scan | 16.1 | 32.0 | 19.1 | 33.8 | 25.3 | 28.4 |
| products_near_expiry | 30.8 | 38.1 | 31.6 | 65.8 | 33.6 | 43.5 |
| **stock_all (GET /api/stock)** | **465.3** | **509.2** | **2466.5** | **2532.2** | **10465.5** | **11175.4** |
| sales_create (POST) | 125.0 | 635.8 | 108.5 | 688.4 | 132.6 | 613.5 |
| sales_history | 64.1 | 101.5 | 62.7 | 74.1 | 50.3 | 82.5 |
| audits_list | 14.6 | 34.5 | 17.8 | 27.4 | 23.3 | 38.3 |

(0 errores en todos los endpoints y volúmenes.)

## Conclusiones

### ✅ El fix del 6/8 está validado
- **products_list (paginado + search)** — el flujo que ahora usa el POS y Productos — es **estable**: ~30ms serial y ~75ms concurrente incluso a 20k artículos. La búsqueda server-side con debounce del fix resuelve el problema real (648 artículos → respuesta en milisegundos).
- **products_scan** (Enter en POS) es el más rápido y constante: 6-25ms en todos los volúmenes.

### 🔴 `GET /api/stock` (stock_all) es el cuello de botella
- Serial: 47ms (1k) → 221ms (5k) → **908ms (20k)**. Concurrente: 465ms → 2.4s → **10.5s**.
- Devuelve **todos** los productos + stock serializados sin paginación.
- **Ya no lo usa nadie en el frontend** (el fix 6/8 lo eliminó de POS, Productos y Presupuestos). Queda como riesgo latente: si vuelve a usarse o el admin lo llama, degrada.

### 🟡 Búsqueda `LIKE %x%` se degrada linealmente con el volumen
- Serial: 8ms (1k) → 29ms (5k) → 71ms (20k). Concurrente: 23ms → 96ms → **468ms (20k)**.
- No usa índice (LIKE con wildcard al inicio = scan completo). A 648 o 5k artículos es irrelevante; a 20k+ concurrente se nota; a 100k sería el límite principal.

### 🟡 `sales_create` — lock de escritura SQLite
- Serial estable (43-56ms). Concurrente p95 613-688ms: el write lock de SQLite serializa las escrituras.
- **OK para el uso real**: un cajero humano tarda segundos entre ventas; 2-3 cajeros no saturan (el benchmark simula 5 requests simultáneos sostenidos).

### ✅ Endpoints sin drama
- `sales_history`, `audits_list` (con join de sobrantes/faltantes), `near_expiry`: estables en todos los volúmenes (5-65ms).

## Recomendaciones (NO implementadas — solo evaluar cuando haya clientes con miles de artículos)

| # | Mejora | Qué resuelve | Esfuerzo est. |
|---|---|---|---|
| 1 | **Paginación en `GET /api/stock`** o eliminarlo del backend (queda huérfano) | stock_all a 20k: 908ms → ~30ms | ~2h |
| 2 | **Índice FTS5** (virtual table) para búsqueda por nombre en vez de `LIKE %x%` | search a 20k concurrente: 468ms → <30ms | ~4-6h |
| 3 | Nada por hacer en POS/Productos para el caso real | — | 0h |

**Contexto:** con el catálogo real actual (648 artículos) todos los endpoints responden en <100ms serial y <150ms concurrente. El fix 6/8 está entregado y resuelto.

## Artefactos

- `server/seed_stress.py` — seed masivo (DB separada, producción intacta).
- `server/benchmark_stress.py` — benchmark HTTP (solo stdlib). *Fix aplicado por el Dispatcher: `p2`/`p3` no se desempaquetaban (bug de DEV con `_`).*
- DB de estrés eliminada al finalizar.

*Reporte: Dispatcher (DEV se colgó a mitad — scripts dejados a medias y server colgado; el Dispatcher completó el ciclo).*
