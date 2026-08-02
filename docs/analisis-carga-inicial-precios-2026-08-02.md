# Análisis técnico — Carga de precios posterior al import inicial (punto C)

> **Fecha:** 2 de agosto de 2026
> **Autor:** DEV
> **Origen:** Flujo unificado de carga inicial (app Stock CSV → import web). Al registrar productos nuevos desde un CSV de toma de stock, se crean con `selling_price = 0.0` y `cost_price = 0.0` (`server/services/csv_import.py`, `register_products_batch` y `register_product_from_import`).
> **Problema:** un cliente que carga miles de productos de golpe (carga inicial de la Librería, polirrubro nuevo) se queda con el catálogo a $0 — **vendibles por error en el POS** y sin margen en informes.

---

## 1. Contexto

El flujo unificado (Opción E + import) resuelve **stock** y **catálogo** (barcode + nombre), pero no **precios**. Los tres vectores que crean productos nuevos en un import:

| Origen | Precio con el que se crea | Cómo se cargan hoy los precios |
|--------|:-------------------------:|-------------------------------|
| `register_product_from_import` (individual) | `0.0` | Edición manual producto por producto en `web/src/pages/Products.tsx` |
| `register_products_batch` (botón "Registrar todos") | `0.0` | Ídem |
| Alta manual en Products | Campo `selling_price` del formulario | Directo en el alta |

**Escala real del problema:** la Librería tiene 309 productos ≈ 5% de su stock real, "va a crecer a miles" (Telenota 1/8). El polirrubro de 1 sucursal (reunión semana del 5/8) puede arrancar de cero. Editar mil productos a mano en el modal de Products no es viable para el dueño.

**Riesgo adicional:** un producto a `selling_price = 0.0` se vende en el POS como **$0 sin advertencia** (`web/src/pages/Sales.tsx` suma el precio tal cual está cargado). Es un riesgo de caja real si el cliente no actualiza precios antes de vender.

---

## 2. Qué existe hoy (NO reinventar)

| Recurso | Dónde | Utilidad para el punto C |
|---------|-------|--------------------------|
| Parser CSV robusto | `server/services/csv_import.py` (`decode_csv_bytes`, `split_csv_fields`, `parse_quantity`) | **Reutilizable directo** para un CSV de precios (RFC 4180, BOM, `;`, decimales con coma) |
| Patrón preview → confirmar → aplicar | `web/src/pages/ImportStock.tsx` + endpoints `import-csv` / `import-register-batch` / `complete` | Plantilla de UI y de flujo para "Cargar precios" |
| Resolución de barcode por barcode o code | `resolve_products(db, barcodes)` en `csv_import.py` | Reutilizable |
| `ProductUpdate.selling_price` / `cost_price` | `server/schemas.py` | Ya existe; falta un endpoint **masivo** |
| Edición manual con `step="0.01"` | `Products.tsx` (fix 26/7) | Base de UI por-producto (no escala solo) |
| Export CSV/XLSX de productos (con margen) | Endpoints de reports | Los clientes pueden descargar el catálogo actual, agregar precios en Excel y re-subir — **flujo de ida y vuelta natural** |

---

## 3. Opciones

### Opción C1 — Import de precios por CSV (recomendada, ~6h)

El cliente descarga (o arma) un CSV con `barcode;precio[;costo]`, lo sube desde la web, ve un preview con diferencias y aplica. Mismo patrón visual que ImportStock.

```
PC/web                                            Server
┌────────────────────────────┐                   ┌──────────────────────────┐
│ Página "Cargar precios"    │                   │ POST /api/products/      │
│ 1. Subir CSV               │── upload ────────>│   import-prices/preview  │
│    (barcode;precio[;costo])│                   │  → parsea + resuelve     │
│ 2. Preview editable        │                   │  → responde:             │
│    ├─ X productos a achar  │                   │    {matched, errors,     │
│    ├─ Y barcodes no vienen │                   │     preview[]}           │
│    └─ Z barcodes inválidos │                   │  (NO escribe)            │
│ 3. "Aplicar cambios"       │── apply ─────────>│ POST /api/products/      │
│                            │                   │   import-prices/apply    │
│                            │                   │  → update masivo en 1 tx │
└────────────────────────────┘                   └──────────────────────────┘
```

- **Formato:** `barcode;selling_price[;cost_price]` — mismas reglas que el import de stock (`;`, UTF-8 BOM, decimal con coma, header opcional). El precio es obligatorio; el costo opcional (si falta, queda como está).
- **Preview con 3 buckets:** encontrados (con precio viejo → nuevo), barcodes no registrados (error), barcodes repetidos / cantidad inválida (malformed).
- **Apply:** update masivo en una sola transacción con `db.query(Product).filter(id.in_(...))` + `UPDATE`, respetando `is_active == True`.
- **Interacción con el import de stock:** se pueden cargar **precios ANTES** (preview sin aplicar) y usar **"Registrar todos"** en la toma — o después. No hay dependencia de orden; el barcode es la llave.
- **Detalle UX:** el preview permite editar precios en línea antes de aplicar (un barcode con precio mal tipeado se corrige sin re-subir).

**Estimación (~6h):**
| Parte | Horas |
|-------|:-----:|
| Endpoint preview (parse + resolve + buckets) | 1.5h |
| Endpoint apply (update masivo, validación precio > 0) | 1h |
| Página/UI (upload → preview editable → aplicar), copiada de ImportStock | 2h |
| QA + build + ajustes | 1.5h |

### Opción C2 — Editor masivo en Products (~4.5h)

En la página Products, con la paginación de 50/100/200 ya existente, agregar un modo "editar precios" que lista los productos de la página con input de precio inline y un botón "Guardar página" (batch `PUT`). No requiere CSV.

- **Pro:** no requiere que el cliente arme un Excel; trabaja sobre el catálogo ya cargado.
- **Contra:** sigue siendo página a página (200 por página máx.); para miles de productos es más lento que un CSV de una sola vez. El polirrubro que compra a un mayorista con lista de precios electrónica prefiera el CSV.
- **Complementario:** C2 es un buen *parche* si el humano quiere algo YA sin tocar Excel.

### Opción C3 — Margen automático (~3h, menor valor)

Un botón "calcular precios" por categoría: costo × (1 + margen%). Requiere `cost_price` cargado; sin costo no hay margen. Solo tiene sentido como extra DESPUÉS de C1 (el costo llega por el mismo CSV).

### Opción C4 — Bloqueo de venta a $0 (~1h, no es carga de precios)

Independiente de cómo se carguen los precios: el POS debería **rechazar o advertir** antes de cobrar un producto con `selling_price <= 0` (hoy vende a $0 sin aviso). Es una red de seguridad barata que descomprime el riesgo del punto C mientras el cliente carga precios. Se puede hacer con un `confirm()` en `Sales.tsx` o un check en el backend de ventas (mejor backend: `SaleItem` con precio 0 rechazado o marcado).

---

## 4. Recomendación

1. **C1 (import de precios CSV, ~6h)** como feature principal — reutiliza parser + patrón de ImportStock, escala a miles, y el CSV de precios del mayorista se vuelve la vía natural de carga. El `barcode` ya es la llave.
2. **C4 (bloqueo/advertencia de venta a $0, ~1h)** como red de seguridad inmediata — evita que un producto a $0 se cobre sin aviso mientras el cliente carga precios. **Se puede hacer YA, sin esperar C1.**
3. C2 (editor masivo) queda como alternativa si el humano prefiere no manejar CSVs; C3 (margen) solo como post-C1.

**Esfuerzo total si se hacen C1 + C4: ~7h** (menos de medio sprint). La decisión del humano de desarrollarlo puede esperar a la reunión del polirrubro (5/8) — si el cliente pide "carga inicial fácil", C1 pasa a prioridad alta y se suma al bundle de la demo.

## 5. Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Cliente edita el CSV en Excel y Excel borra ceros a la izquierda del barcode (EAN/UPC) | Misma mitigación que el import de stock: comparar como string + no matchear = error claro en preview, no aplicar |
| Precio mal tipeado (ej. `1200` en vez de `12.00`) | Preview editable + aplicar requiere confirmación; el preview muestra el cambio |
| Producto a $0 se vende antes de cargar precios | C4: bloqueo/advertencia en POS |
| CSV con costo faltante | Columna `cost_price` opcional; si falta, no se toca el costo existente |
| Precios en cadena de margen no cubiertos | Fuera de alcance; los precios son absolutos |
