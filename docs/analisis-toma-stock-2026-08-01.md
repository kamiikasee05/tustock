# Análisis técnico — Toma de stock masiva (alternativas)

> **Fecha:** 1 de agosto de 2026
> **Autor:** DEV (solo investigación — no se escribió código de features)
> **Origen:** Telenota 1/8 ítem 3 (cliente Librería: 309 productos ≈ 5% del stock real, va a crecer a miles; no puede contar a mano).
> **Premisa nueva del humano (1/8):** "que la app almacene los productos al menos 50 productos. Cuando llegue a esa cantidad los envíe al sistema. O como alternativa que la toma de stock que tenemos sea más rápida."
> **Premisa original (descartada en parte):** import Excel/CSV en web (~4-6h).
> **Idea nueva del humano (2/8):** el cliente escanea con una app genérica (TeaCapps "QR & Barcode Scanner"), genera el CSV en el terreno y TUSTOCK lo importa → **Opción D** (§5). Investigación web + análisis técnico, sin código.

---

## 1. Estado actual — cómo funciona la toma de stock HOY

### 1.1 App Android Stock (`android/app/src/stock/java/com/tustock/scanner/StockMainActivity.kt`)

La app tiene dos modos controlados por el Switch "Auditoría":

| Paso | Código | Llamada a red | Qué pasa |
|------|--------|:-------------:|----------|
| Toggle ON | `StockMainActivity.kt:60-84` (`startAuditMode`) | `POST /api/audits` + `POST /api/audits/{id}/start` | Crea la auditoría **server-side** con TODOS los productos activos y su stock teórico; la deja `in_progress` |
| Escaneo | `StockMainActivity.kt:275-346` | `GET /api/products/scan/{code}` | Busca el producto en el server. En modo auditoría muestra "Stock en sistema" y pide "Cuantos hay?" |
| Guardar conteo | `StockMainActivity.kt:179-201` | `PUT /api/audits/{id}/items` | Envía `product_id` + `counted_qty` (valor absoluto) |
| Toggle OFF | `StockMainActivity.kt:86-110` (`finishAuditMode`) | `POST /api/audits/{id}/complete?apply_corrections=true` | Aplica correcciones de stock |

**Características críticas del flujo actual:**

- **NO funciona offline.** Cada escaneo (`scanProduct`) y cada conteo (`updateAuditItem`) requiere red (`ApiClient.kt:69-87, 254-271`). La app **no tiene catálogo local**: el lookup es contra el server en cada barcode.
- **Si se corta la conexión a mitad:** el conteo de ese producto se pierde (solo aparece un toast de error, `StockMainActivity.kt:196-198`). La auditoría queda `in_progress` en el server pero la app no lo sabe.
- **No hay resumen de sesión:** `currentAuditId` es una variable en memoria (`StockMainActivity.kt:31`), no persiste. Si la app muere (crash, cerrar, teléfono se apaga), no hay forma de retomar esa auditoría desde la app.
- **Idempotencia del conteo: SÍ (a nivel server).** `update_audit_item` (`audit_service.py:43-64`) *setea* `counted_qty` (valor absoluto), no incrementa. Re-enviar el mismo PUT no duplica. Esto es clave para el diseño de batch con reintentos.
- **No hay feedback sonoro/vibratorio** por producto contado. No hay indicador de progreso.
- **Por cada producto se hacen 2 round-trips de red** (scan + PUT) más el tap en "Guardar conteo". A escala de "miles de productos" es el cuello de botella.

### 1.2 Backend (`server/routes/audits.py` + `server/services/audit_service.py`)

| Endpoint | Servicio | Comportamiento |
|----------|----------|----------------|
| `POST /api/audits` | `create_audit` (`audit_service.py:10-32`) | Crea `StockAudit` (draft) + un `AuditItem` por cada producto activo con su stock teórico. **Un insert por producto**: con miles de productos es una transacción grande (aceptable, ~1-3s). |
| `POST /{id}/start` | `start_audit` (`:34-41`) | `draft → in_progress` |
| `PUT /{id}/items` | `update_audit_item` (`:43-64`) | Busca el item por `(audit_id, product_id)`, **setea** `counted_qty`, calcula `difference`. Idempotente. |
| `POST /{id}/scan` | `scan_to_audit` (`:152-166`) | Incrementa +1 (NO idempotente — lo usa la web). |
| `POST /{id}/complete` | `complete_audit` (`:66-108`) | Para cada item con diferencia: setea `CurrentStock.quantity = counted_qty` y registra `StockMovement` tipo `audit_correction`. |
| `GET /{id}` | `get_audit_detail` (`:110-142`) | Devuelve **solo los items con diferencia ≠ 0**. No devuelve total de productos ni "X de Y contados". |
| `GET /api/audits` | `list_audits` (`:144-150`) | Lista de auditorías. |

**Nota de diseño:** `AuditItem` NO tiene constraint único sobre `(audit_id, product_id)` (`models/audit.py:22-34`). Un endpoint batch futuro debe **buscar y actualizar** el item existente, nunca insertar a ciegas, o se generan duplicados.

### 1.3 Web (`web/src/pages/Audits.tsx`)

- Página completa: crear auditoría → iniciar → escanear → completar. El input de escaneo tiene `autoFocus` y Enter dispara `scanToAudit` (`Audits.tsx:37-45, 109-116`), que hace `POST /{id}/scan` (+1) y luego re-fetch del detalle.
- **Bug de UX que frena el escaneo continuo con lector USB:** tras hacer clic en "Contar +1" el foco queda en el botón, y `autoFocus` solo corre en el mount. El siguiente escaneo del lector (que "tipea" en el input) **no entra**. Para volver a escanear hay que hacer clic en el input otra vez. En la práctica eso hace que contar con lector sea lento y frustrante.
- No muestra progreso ("X de Y contados"), no hay sonido, no hay modo de conteo sin confirmar. El listado solo muestra diferencias (no los contados que coinciden).

### 1.4 Modelo de datos de stock

`Product` (catálogo) y `CurrentStock` (cantidad actual) son tablas separadas (`models/product.py`, `models/stock.py`). La corrección de auditoría escribe directo en `CurrentStock.quantity` + un movimiento `audit_correction`.

---

## 2. Opción A — Batch offline en la app Android (premisa del humano)

### 2.1 ¿Requiere levantar el congelamiento Android?

**Sí.** Es una decisión del humano, no un bloqueo técnico:

- El CI **ya existe y está probado**: `.github/workflows/build-apk.yml` compila `assembleStockDebug/Release` + `assemblePosDebug/Release` automáticamente al pushear cambios en `android/**`, y publica release `apk-NN` (30/7 se generó la #42). Descargar y empaquetar los APKs al bundle del USB ya es parte del flujo (§15 MEMORY).
- "Levantar el congelamiento" para este feature puntual = autorizar commits en `android/` y esperar un build de CI (~15-20 min). El costo de operación es mínimo (**~1h** incluyendo bajar APKs, empaquetar y verificar). El costo real es el desarrollo Kotlin (sección 2.3).
- Al tocar la app se recomienda **solo el flavor `stock`** (la app Stock). No tocar el flavor POS.

### 2.2 Arquitectura propuesta (local-first, batch flush)

```
App Stock (celular)                        Server (PC del cliente)
┌──────────────────────────────┐           ┌───────────────────────────┐
│ Catálogo local (JSON)        │           │ /api/products (paginado,  │
│  {barcode → id, name, teórico}│  <───────│  ya existe, page_size≤200)│
│                              │           │                           │
│ Cola local (JSON o prefs)    │           │ POST /audits/{id}/start    │
│  {barcode: counted_qty}      │           │  (al iniciar, online)      │
│  (last-write-wins por sku)   │           │                           │
│                              │           │ PUT /audits/{id}/items     │
│ Flush: cuando la cola llega  │  ────────>│  (por item, idempotente)   │
│  a 50 items O hay conexión   │   batch   │  — o endpoint batch nuevo —│
│  O "Enviar ahora" manual     │           │                           │
│                              │           │ POST /audits/{id}/complete │
│ Marca "sent" tras 200;       │           │  (aplica correcciones)     │
│  reintenta si falla          │           │                           │
└──────────────────────────────┘           └───────────────────────────┘
```

Puntos clave de diseño:

1. **Catálogo local:** la app descarga el catálogo paginado (`GET /api/products?page_size=200`, loop hasta `total_pages`) al abrir (online) y lo cachea en un archivo JSON. **Hoy `ProductResponse` (Kotlin) NO incluye `barcode`** (`ApiClient.kt:13-21`) — hay que agregar el campo (el server ya lo manda en `ProductOut`, `products.py:15-25`). Con "miles" de productos son ~200-500 KB de JSON: irrelevante.
2. **Cola local:** mapa `{barcode: counted_qty}` persistido en archivo JSON en `filesDir` o en `SharedPreferences` (ya se usa para config, `StockMainActivity.kt:27`). **Sin dependencia nueva** (no hace falta Room). Agregar por barcode con **last-write-wins** (si el mismo producto se re-cuenta, se pisa el valor — nunca se acumula).
3. **Flush por umbral:** cuando la cola llega a 50 items (o hay conectividad, o botón "Enviar ahora") se envían en lote. El criterio "50" del humano es el gatillo; en la práctica conviene **también** flushear al recuperar red y al cerrar el modo auditoría.
4. **Idempotencia ante re-intento:** el endpoint pone el valor absoluto (semántica PUT actual). Si un item se envía 2 veces por retry, el server setea el mismo número → **no duplica**. La cola marca `sent` solo tras recibir 200.
5. **Inicio de la sesión:** hay dos niveles de complejidad:
   - **Simplificado (recomendado):** crear la auditoría requiere conexión al inicio ("Conectate para iniciar la auditoría"). Después, el conteo puede seguir offline y el batch se sincroniza cuando hay red. Más simple, evita la creación lazy.
   - **Completo (local-first):** sesión 100% local y creación *lazy* de la auditoría en el primer flush. Más robusto pero suma complejidad.
6. **Productos no registrados:** si un barcode no existe en el catálogo local y no hay red, no se puede contar ni registrar. **Fuera del MVP:** registrar productos sigue siendo solo-online (flujo actual del `notFoundCard`).

### 2.3 Esfuerzo estimado (desglosado)

| Tarea | Horas | Detalle |
|-------|:-----:|---------|
| Agregar `barcode` a `ProductResponse` (Kotlin) + verificar payload | 0.5 | Server ya manda el campo; solo falta el data class |
| Catálogo local (descarga paginada + persistencia JSON + refresh al abrir) | 2 | Loop `page_size=200`; manejar errores de red |
| Cola local (agregar/actualizar por barcode, last-write-wins, persistencia) | 1.5 | Archivo JSON o prefs; sin dependencias |
| Endpoint batch server (buscar+actualizar items, N por request, reporte de errores por fila) | 1.5 | Respetar semántica SET (idempotente). Ver nota de modelo §1.2 |
| Flush (umbral 50 + reconexión + manual, retry, marcar `sent`) | 2 | Lógica de sincronización |
| UI de sesión (contador X/Y local, badge "X pendientes de enviar", botón Enviar ahora) | 1.5 | Feedback al usuario |
| Cierre (flush final + `complete` + resumen de correcciones) | 1 | |
| QA (offline total, corte a mitad, crash y reinicio, doble envío, re-conteo) | 2 | |
| CI + empaquetado (APKs release #, bundle USB, verificación) | 1 | Ya existe el workflow |
| **TOTAL** | **~12-14h** | ≈ 2 semanas parciales |

### 2.4 Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| **Crash del teléfono a mitad del conteo** | Cola persistida en disco + catálogo cacheado → al reabrir se retoma; `currentAuditId` debe persistirse (hoy no lo hace) |
| **Pérdida de respuesta (timeout) tras commit en el server** | El retry re-envía el mismo valor → idempotente, no duplica |
| **Conflicto con ventas durante el conteo** | `theoretical_qty` se captura al crear la auditoría; una venta a mitad altera la diferencia. Mismo riesgo que el flujo actual; mitigación: completar a fin de día o aceptar el desvío documentado |
| **Catálogo desactualizado** (productos nuevos cargados en la PC mientras se cuenta) | Refresh del catálogo al abrir la app; los items no incluidos en la auditoría se reportan por fila en el flush |
| **Producto contado offline que no existe en el server** | Se reporta como fila con error; se resuelve online (registrar producto) |
| **Límite del modelo**: `AuditItem` sin unique `(audit_id, product_id)` | El endpoint batch SIEMPRE busca y actualiza el item existente, nunca inserta a ciegas |

---

## 3. Opción B — Hacer más rápida la toma de stock ACTUAL

Se puede acelerar la toma existente con cambios en la web (el cliente Librería cuenta en la PC con lector) y retoques mínimos de app. Sin batch, sin levantar el congelamiento Android por completo (los retoques de app sí tocan Android).

### 3.1 Web — mejoras en `Audits.tsx`

| # | Mejora | Esfuerzo | Impacto |
|---|--------|:--------:|:-------:|
| B1 | **Refocus del input tras cada conteo** (`useRef` + `.focus()` post-scan). Hoy el lector USB "pierde" el escaneo siguiente porque el foco queda en el botón. **Esto solo convierte el conteo en "escanear → Enter → siguiente" sin clicks.** | 0.5h | 🔥 **Máximo impacto / mínimo costo** |
| B2 | **Modo escaneo continuo**: Enter cuenta +1, auto-refocus, feedback visual (flash) + beep por Web Audio, refresco del detalle debounced (hoy hace 1 `GET /audits/{id}` por conteo) | 1.5h | 🔥 Alto |
| B3 | **Progreso "X de Y contados"** — requiere backend: `GET /audits/{id}` debe devolver `counted_count` y `total_count` (hoy solo devuelve diferencias, `audit_service.py:110-142`). | 1h (0.5 server + 0.5 web) | Medio-alto |
| B4 | **Modo "solo conteo"**: acumular conteos en JS y enviar en lote al completar (usa PUT idempotente en loop o endpoint batch) | 1.5h | Medio |
| B5 | **Búsqueda por nombre** para productos sin barcode (combobox en modo auditoría) | 1-2h | Medio |

**Total web: ~5.5-6.5h.**

### 3.2 App Android — retoques mínimos (toca Android pero sin batch)

| # | Mejora | Esfuerzo |
|---|--------|:--------:|
| A-min | **Persistir `currentAuditId`** (SharedPreferences) para retomar una auditoría tras reinicio/crash | 1h |
| A-min | **Sonido/vibración** por producto contado | 0.5h |

**Total app mínima: ~1.5h** (requiere igualmente levantar el congelamiento para tocar `android/`, aunque sea un cambio chico).

### 3.3 Lectura: ¿por qué la web actual es lenta?

1. Foco perdido después de "Contar +1" (B1) — es la fricción #1 con lector USB.
2. Un `GET /audits/{id}` completo después de cada conteo (B2).
3. Sin feedback que confirme el conteo sin mirar la pantalla (B2).
4. Hay que estar en la PC con lector; no es "caminar el local con el celular" como la Opción A.

---

## 4. Opción C — Import Excel/CSV (premisa original, re-evaluada)

### 4.1 Correcciones a la estimación previa

La estimación original de **4-6h es ajustada pero incompleta**: no existe hoy un export de inventario. El `/api/reports/export/products` exporta **rendimiento de ventas** (unidades vendidas por producto, `report_service.py:168-191`), NO el stock actual. Hay que crear el export con stock desde cero.

**Sin bloqueantes de dependencias:** `openpyxl` ya está en `server/requirements.txt` (usado para CSV→XLSX) y `python-multipart` ya está (necesario para `UploadFile` de FastAPI).

### 4.2 Desglose

| Tarea | Horas |
|-------|:-----:|
| Export de inventario (code/barcode/nombre/stock actual/categoría) CSV+XLSX — endpoint nuevo | 1.5 |
| Import endpoint: `UploadFile`, parseo, mapeo por code/barcode, validación, creación de auditoría con items (o ajuste directo de stock) | 2.5 |
| Web UI: upload + preview de diferencias + botón confirmar | 2 |
| QA (archivos mal formados, filas duplicadas, productos inexistentes) | 1 |
| **TOTAL** | **~6-7h** |

### 4.3 ¿Resuelve "contar miles de productos"?

**Parcialmente.** El flujo real sería: exportar lista actual → contar físicamente en papel/Excel → reimportar. Esto:

- ✅ Sirve para **carga de datos / stock inicial** o corrección masiva en una PC.
- ❌ **No acelera el conteo físico** — el trabajo de caminar y contar el local queda igual; al final hay que transcribir todo (o que alguien tipee). Para "miles" es el doble de trabajo de registro vs la Opción A (donde conteo y registro son el mismo gesto).
- ✅ No requiere tocar Android.
- ✅ Es la opción más barata en horas de las tres que no tocan Android (vs B web que también es barata).

---

## 5. Opción D — Escaneo con app genérica (TeaCapps CSV)

> **Origen (1/8):** idea del humano — el cliente escanea directo con una app genérica en el celular (TeaCapps), genera el CSV en el terreno, y TUSTOCK lo importa. Elimina la transcripción manual de la Opción C. **Esta sección es solo investigación + análisis — no se escribió código.**

### 5.1 Investigación — la app exacta

| Dato | Valor |
|------|-------|
| **Nombre** | "QR & Barcode Scanner" (publicada también como "QR Code Reader" / QRbot) |
| **Desarrollador** | TeaCapps GmbH (Alemania) — `com.teacapps.barcodescanner` en Google Play. Version iOS: QRbot (`net.qrbot`) |
| **Descargas / rating** | 100M+ descargas, ~4.6-4.8, actualizada mar-2026 (v3.3.6-L) |
| **Precio** | Free con anuncios. PRO $6.99 (sin anuncios + features extra). Para este caso de uso alcanza la free |
| **Formato CSV** | Exporta el **historial completo** de escaneos como CSV ("manage unlimited history and export it as CSV file") |
| **Sharing** | Share sheet de Android → WhatsApp, Gmail, Google Drive, USB. **CSV local, sin nube obligatoria** |

**Formatos 1D soportados:** EAN/UPC/JAN/GTIN/ISBN, Codabar, Code 39/93/128, Interleaved 2 of 5, GS1 DataBar, PDF417 (+ QR, Aztec, Data Matrix). Cubre barcodes de kiosco/polirrubro.

### 5.2 Formato del CSV que exporta (crítico — NO está documentado públicamente)

- La app **no documenta** las columnas exactas del CSV ni permite configurar la exportación (a diferencia de DataScan).
- Reviews de usuarios (App Store/Pcmac): *"The date, title and other random stuff is on the same cell as the stuff I scanned"* y *"Exporting history may not work well with Excel or Google Sheets"* (con LibreOffice anda mejor). → **El CSV es "sucio": puede mezclar fecha/hora/formato/título con el contenido en la misma celda.**
- Estructura esperable por las reviews: columnas tipo `date`, `time`, `format` (simbología), `content` (el barcode), con headers — **pero no se puede confiar en headers ni en la cantidad de columnas**, y puede variar entre versiones de la app.
- **Conclusión para el import:** NO asumir headers fijos ni columna fija. El import debe **detectar la columna de barcode por heurística** (ver §5.6).

### 5.3 Capacidades

| Cap | Detalle |
|-----|---------|
| Offline | ✅ Escaneo e historial 100% offline. El CSV se genera en el teléfono sin red |
| CSV local / sin nube | ✅ Export a archivo local + share sheet. No pide cuenta ni cloud |
| Límite de escaneos | "Unlimited history" — sin límite práctico |
| **Cantidad por escaneo** | ❌ **No existe.** La app no pide cantidad al escanear. El conteo se expresa **por repetición**: escaneás el mismo barcode N veces = N unidades |
| Configuración de export | ❌ No configurable |

### 5.4 Alternativas conocidas

| App | Detalle | Formato | Precio |
|-----|---------|---------|:------:|
| **DataScan** (`de.keitgen.datascan`) | **La mejor para inventario.** Modos "Continuous Scan" (conteo rápido con prevención de duplicados) y "Single Value Scan" (escaneás + tipeás cantidad). Export CSV/Excel **configurable** (delimitador, headers, encoding, formato de fecha) | CSV configurable, ideal para import | 7 días trial, luego pago |
| **BarCode Cam to CSV** (`com.ejisoft.barcodecamtocsv`) | Escaneás, describís producto, indicás cantidad y costo. CSV con cantidad | CSV con cantidad | Free |
| 1000FreeTools "Barcode to CSV" (web) | Browser, no app; sirve solo como utilidad puntual | CSV | Free |
| Binary Eye | Open-source, offline, privacidad — **sin CSV export documentado** | — | Free |

**Si el humano usa DataScan en vez de TeaCapps**, el CSV puede traer columna de cantidad real (o pedirle que use "Single Value Scan"), y el import se simplifica (menos heurística). Pero es pago; TeaCapps es la app que el humano ya conoce y es free.

### 5.5 Escenario de uso propuesto (viabilidad)

```
1. Cliente instala "QR & Barcode Scanner" (free, sin cuenta).
2. Camina el local con el celular y escanea cada producto 1 vez por unidad
   (5 unidades de X → escanea X 5 veces). Offline.
3. Al terminar: Share → Exportar CSV → WhatsApp/Drive/USB → a la PC con TUSTOCK.
4. TUSTOCK: sube el CSV → el import cuenta las ocurrencias de cada barcode
   → crea/actualiza una auditoría (barcode → counted_qty)
   → preview con diferencias → confirmar → aplica correcciones de stock.
```

**Viable: SÍ.** En el terreno es funcionalmente equivalente a la Opción A (caminar el local con el celular, offline, conteo + registro en un solo gesto), con estos costos:

| D vs A | Detalle |
|--------|---------|
| ❌ No hay lookup en vivo | Mientras escanea no ve stock teórico ni nombre del producto |
| ❌ Sin progreso ni protección de duplicados | Si escanea 2 veces de más, cuenta 2. No hay "X de Y contados" |
| ❌ No-registrados se detectan recién en el import | En A se detectan en el terreno (online) |
| ⚠️ Depende de una app de terceros | Formato no garantizado (CSV "sucio"), app con anuncios |
| ✅ 0 desarrollo Android, offline, gratis para el cliente | El celular que ya tiene |

### 5.6 Integración técnica + estimación ajustada

La Opción D **reutiliza casi todo el import de la Opción C** (§4.2: export + endpoint + UI). La diferencia es el **parser tolerante** y la **semántica de conteo por repetición**:

| Tarea | Horas | Detalle |
|-------|:-----:|---------|
| Export de inventario (code/barcode/nombre/stock actual/categoría) CSV+XLSX — endpoint nuevo | 1.5 | Igual que C. Sirve de referencia para el cliente |
| **Parser tolerante** | 2.5 | Detectar separador (`,` `;` `\t`), encoding (UTF-8 con/sin BOM, latin-1), headers opcionales. **Detectar la columna de barcode**: por header (`barcode`/`code`/`ean`/`gtin`/`content`/`text`/`data`) o por heurística de contenido (columna ~90% EAN/UPC/GTIN válido de 8-14 dígitos, o que matchea barcodes existentes en la DB). Ignorar columnas extra (fecha/hora/format). **Esta es la pieza que hace falta porque TeaCapps no documenta el formato** |
| **Semántica de conteo** | 1 | Por defecto: cada ocurrencia de un barcode = +1 unidad (agrupar por barcode → `counted_qty`). Si el CSV trae columna de cantidad real (caso DataScan), usarla. Mismo barcode varias líneas = se suma (last-write-wins NO aplica aquí; el conteo es aditivo por diseño) |
| Crear/actualizar auditoría con items | 1.5 | Resolver `product_id` por barcode (o code); reusar la semántica SET idempotente de `update_audit_item`. Barcodes no registrados → filas con error, resolución en UI |
| Web UI: upload + preview + confirmar | 2 | Upload, tabla preview (barcode → producto → conteo → diferencia vs stock teórico), editar cantidades, marcar no-registrados, botón confirmar → `complete` |
| QA (CSVs sucios, separadores mixtos, duplicados, encoding, no-registrados, Excel que borra ceros a la izquierda) | 1 | |
| **TOTAL Opción D** | **~9.5-10h** | = C (6-7h) + parser tolerante (2.5h) + semántica de conteo (1h) |

**Ajustes según el escenario:**
- Si el humano **comparte un CSV real** de la app antes de desarrollar → el parser se acota al formato confirmado → baja a **~7.5h**.
- Si se usa **DataScan** (CSV configurable con cantidad) → menos heurística → **~8h**.
- Si el cliente quiere "escanear 1 vez + anotar cantidad en papel" (el patrón que la app no soporta) → volvemos a la transcripción de la Opción C; no conviene.

**Nota de parsing:** el barcode puede venir con ceros a la izquierda (EAN/UPC). Si el cliente abre el CSV en Excel antes de subirlo, Excel puede borrarlos. Mitigación: el parser compara como string y usa la columna que matchee barcodes existentes; y en la UI aclarar "no editar el CSV en Excel".

### 5.7 Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| **Formato CSV no documentado y "sucio"** (celdas mezcladas) | Parser tolerante + detección de columna por heurística + preview editable antes de confirmar |
| **Barcodes no registrados en TUSTOCK** | Se listan como filas con error en el preview; opciones: registrar como producto nuevo (stock = conteo) o saltar. No bloquea el import del resto |
| **Escaneo duplicado accidental** (contó de más) | Preview editable permite corregir la cantidad antes de aplicar |
| **Excel borra ceros a la izquierda** | Comparar barcode como string; avisar en la UI que no se abra en Excel |
| **El cliente "escanea 1 vez y anota"** (transcripción) | Fuera de alcance de la D — es la C. Guión de uso enseña el patrón "1 scan = 1 unidad" |
| **App de terceros cambia el formato en una update** | El parser tolerante absorbe variaciones; el import es genérico (no atado a TeaCapps) |
| **Conflicto con ventas durante el conteo** | Mismo riesgo que A/C: `theoretical_qty` se captura al crear la auditoría; completar a fin de día |

---

## 6. Comparación y recomendación

### 6.1 Tabla comparativa

| Opción | Esfuerzo | ¿Levanta Android? | ¿Acelera el conteo físico? | Offline | Esfuerzo humano durante el conteo |
|--------|:--------:|:------------------:|:--------------------------:|:-------:|------------------------------------|
| **A — Batch en app** (premisa del humano) | ~12-14h | Sí (decisión) | **Alta** — contás y registrás en el mismo gesto, sin espera de red por item | ✅ Sí | Caminar el local con el celular |
| **B — Web + mínimos app** | ~5.5-6.5h (web) / +1.5h (app) | Solo para los retoques de app | Media — sin espera de red por item, pero hay que estar en la PC con lector | ❌ No | En la PC con lector USB |
| **C — Import Excel/CSV** | ~6-7h | No | Baja — no acelera el conteo, solo la carga de datos | No aplica | Contar en papel/Excel y transcribir después |
| **D — Escaneo con app genérica (TeaCapps CSV)** | ~9.5-10h | **No** | **Alta** — contás y registrás en el mismo gesto, offline, con el celular que ya tiene (sin desarrollo Android) | ✅ Sí (en el terreno) | Caminar el local con el celular |

### 6.2 Recomendación técnica

1. **Inmediato y casi gratis (0.5-2.5h, hoy mismo):** aplicar **B1 + B2** en la web. El cliente Librería cuenta en la PC; arreglar el foco del input + feedback sonoro hace el conteo con lector USB usable ya mismo. Es valor real sin tocar Android y sin esperar nada.

2. **La premisa del humano (app que acumula y envía en batch) es técnicamente la más sólida para "miles de productos":** es la única opción que combina conteo físico + registro en un solo gesto y aguanta un local sin wifi estable. **Recomiendo desarrollarla si el humano levanta el congelamiento de Android** — es el camino de mayor beneficio real. Costo: ~12-14h + operación de CI (~1h).

3. **Si NO se quiere tocar Android: la Opción D (~9.5-10h) es el mejor plan B.** Da la experiencia "caminar el local con el celular, offline" de la A **sin desarrollo Android**, con una app gratuita. Reemplaza y mejora a la C para el caso de uso real (elimina la transcripción, que era la debilidad de C). La C queda como opción para **carga de datos inicial** (stock inicial masivo), no para conteo.

4. La Opción B completa (web mejorada + retoques de app) es un paso intermedio razonable para descomprimir el dolor actual mientras se decide lo de Android.

5. **Paso 0 obligatorio antes de desarrollar la D:** pedirle al humano que escanee 5 productos con la app y comparta el CSV real. El formato no está documentado y las reviews lo muestran "sucio"; una muestra real elimina la única incertidumbre técnica fuerte (y baja la estimación de 9.5-10h a ~7.5h). Construir el import como **"Import de conteo desde CSV" genérico** (sirve para TeaCapps, DataScan o cualquier CSV), para no quedar atados a un proveedor.

---

## 7. Decisión para el humano

| # | Pregunta | Opciones |
|---|----------|----------|
| 1 | ¿Levantás el congelamiento de Android **solo para la app Stock** y el feature de batch? | (a) Sí → Opción A (12-14h). (b) No → **Opción D (9.5-10h)** o solo web |
| 2 | ¿Aplica la mejora inmediata de la web (B1+B2, 0.5-2.5h) mientras tanto? | (a) Sí, ya. (b) No, esperar la decisión grande |
| 3 | ¿El conteo lo hace el cliente en la **PC con lector** o **caminando el local con el celular**? | PC → priorizar B web. Celular → priorizar A (si Android) o D (si no) |
| 4 | ¿La escala real es "miles" o "centenares"? | Miles → A o D. Centenares → B/C alcanza |
| 5 | Si se hace la A: ¿inicio de sesión simple (requiere red para iniciar) o 100% local-first? | Simplificado (recomendado) vs completo (+2-3h) |
| 6 | **Si se va por la D:** ¿podés escanear 5 productos con la app TeaCapps y compartir el CSV real? | Es el paso 0 que desbloquea la estimación exacta (~7.5h vs ~9.5-10h). Mientras tanto no conviene desarrollar el parser "a ciegas" |
| 7 | **Si se va por la D:** ¿preferís que el import funcione también con **DataScan** (CSV configurable con cantidad, app paga) o solo con el CSV de TeaCapps? | Genérico (recomendado, +0.5-1h) vs solo TeaCapps |
| 8 | **Si se va por la D:** para productos **sin barcode** (verduras, pan, fiambre), ¿el cliente los carga aparte a mano (flujo actual de alta de producto) o los importa por nombre? | Import por nombre (B5, +1-2h) vs alta manual |

**Costo de decidir A:** 12-14h de DEV + 1h de build/empaquetado + un ciclo de actualización de clientes (§15, ya probado el 31/7). **Costo de decidir D:** 9.5-10h de DEV (7.5h con CSV real) + sin ciclo Android.
