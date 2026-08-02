# Análisis Técnico — Tier Multi-Sucursal (30 de Julio de 2026)

> Documento de evaluación técnica para el tier Multi-Sucursal (3 sucursales del mismo negocio viendo sus stocks entre sí). Solo análisis, sin código.

---

## Recomendación ejecutiva (para el humano)

1. **Arquitectura:** instancias SQLite independientes por sucursal + un **coordinador de catálogo y stock en el cloud** (PostgreSQL/Railway) que reutiliza la infraestructura ya construida (push del agente, snapshot de inventario, CommandQueue). Es la única opción que preserva el offline y no toca a los 2 clientes actuales.
2. **MVP en ~1 semana (40-45h):** propagación de catálogo + stock remoto visible entre sucursales con **indicador de frescura** ("actualizado hace 12s"). La fiabilidad no se resuelve con sincronización mágica: se resuelve con snapshot completo + push real-time (ya existe) + **mentir nunca: si el dato está viejo, se muestra viejo**.
3. **Venta cruzada de stock NO va en el MVP:** se vende en la sucursal que tiene el producto. Reserva/venta remota y transferencias son Fase 2, usando la CommandQueue del POS Remoto (infra ya construida). Reservar stock en una DB remota es overengineering para el caso de la llamada telefónica.
4. **Riesgos top:** (1) stock desactualizado si una sucursal está offline o el push falla → mitigado con badge de frescura + snapshot completo; (2) conflictos de IDs/catálogo entre sucursales → mitigado con `product_uuid` global + soft-delete + sync versionado; (3) doble venta del mismo stock → en MVP read-only no aplica, y con CommandQueue cada sucursal es la **única escritora** de su propio stock (sin escrituras cruzadas concurrentes).
5. **Clientes actuales intactos:** single-PC sigue siendo el default. El tier se activa por flag `multisucursal_enabled` en la licencia. Los cambios son aditivos (migraciones + tablas nuevas + endpoints nuevos).

---

## 1. Contexto y caso de uso real

**Cliente:** polirrubro con 3 sucursales (hoy maneja todo en cuaderno). **Prospecto:** farmacia con 3 sucursales (1 central + 2).

**Caso de uso que escuchamos el sábado:**
> "Cliente llega y pregunta por un producto. Si no está en stock, llaman por teléfono a la otra sucursal para consultar existencia... PERO si no se actualizó, o el sistema no registró la venta, o el stock quedó congelado, no hay fiabilidad de que el producto exista."

**La fiabilidad es el problema, no la visibilidad.** Ver un número de stock de otra sucursal que puede estar viejo es lo mismo que no verlo: el vendedor no se va a jugar a prometerle al cliente un producto que no puede verificar. Cualquier solución técnica debe garantizar (o al menos exponer honestamente) la frescura del dato.

Requisito implícito del caso: **el stock que ve la sucursal B debe reflejar ventas hechas en la sucursal A hace 5 minutos.**

---

## 2. Evaluación de modelos de datos

### Opción a) Instancias SQLite independientes + coordinador en cloud ⭐

Una instancia TUSTOCK completa por sucursal (una PC por sucursal, cada una con su `tustock.db`). El cloud guarda el estado de cada sucursal y lo distribuye.

| Aspecto | Evaluación |
|---------|-----------|
| **Offline** | ✅ Total. Cada sucursal funciona 100% sin internet; el sync es oportunista. Diferenciador #1 intacto. |
| **Fiabilidad del stock** | ✅ El agente ya pushea **snapshot completo del inventario** cada 30s (`cloud_push.py:38-166`) + push real-time post-venta (`cloud_push.py:200-201`, hook en `sales.py` y `stock.py`). El cloud ya guarda el último estado por negocio. |
| **Esfuerzo** | Medio. Reutiliza agente, push, snapshot y CommandQueue. Faltan: modelo Branch, sync de catálogo, tabla de stock remoto, UI. |
| **Riesgo** | Bajo. Cambios aditivos. Compatible con clientes actuales (ver §9). |
| **Compatibilidad** | ✅ Alta. Los 2 clientes actuales no cambian nada. |

### Opción b) Catálogo central en cloud + SQLite local como caché (offline-first)

El cloud es la fuente de verdad del catálogo; cada sucursal tiene una caché SQLite local.

| Aspecto | Evaluación |
|---------|-----------|
| **Offline** | ⚠️ El catálogo debe seguir creándose/actualizándose sin internet → write-behind local → cola de escrituras pendientes → reintentos → conflictos de merge. Complejidad de sistema distribuido real. |
| **Fiabilidad** | ⚠️ Alta latencia de propagación y conflictos de resolución en la práctica. |
| **Esfuerzo** | Alto. Merge de conflictos, tombstones, reconciliación. Overengineering para 3 sucursales. |
| **Riesgo** | Alto. Es el diseño más difícil de acertar y el que más fácilmente queda "invisible roto". |
| **Veredicto** | ❌ Descartada para 3 sucursales. Solo tendría sentido con 20+ sucursales o venta remota masiva. |

### Opción c) SQLite central compartido vía red (NFS/SMB/red local)

Un solo archivo `tustock.db` compartido por las 3 PCs vía carpeta de red o VPN.

| Aspecto | Evaluación |
|---------|-----------|
| **Offline** | ❌ Un archivo compartido en red no funciona sin red. Y las 3 sucursales del cliente están **en distintos lugares físicos** → requeriría VPN. |
| **Corrupción** | ❌ SQLite sobre filesystems de red (NFS/SMB) tiene locking no confiable. WAL sobre NFS está **desaconsejado oficialmente** y produce corrupción de archivos. |
| **Fiabilidad** | ❌ Latencia y bloqueos. Dos PCs escribiendo en paralelo = riesgo de lock contention. |
| **Esfuerzo** | Bajo aparente, pero alto en soporte (corrupción, permisos, latencia). |
| **Veredicto** | ❌ Descartada por riesgo de corrupción de datos — el peor escenario posible para un sistema que vende "tus datos en tu PC". |

### Opción d) Migrar a PostgreSQL central

| Aspecto | Evaluación |
|---------|-----------|
| **Offline** | ❌ **Roma la promesa #1 del producto** ("funciona sin internet, tus datos están en tu PC"). Innegociable. |
| **Esfuerzo** | Alto. Migración de los 2 clientes existentes, infra por cliente, soporte. |
| **Riesgo** | Alto. Cambia el modelo de negocio y la propuesta de valor. |
| **Veredicto** | ❌ Descartada como arquitectura principal. PostgreSQL queda SOLO en el cloud como coordinador (ya está). |

### Veredicto

**Opción (a):** instancias independientes + coordinador en cloud. Es la evaluación previa de MEMORY ("instancias independientes + consolidador"), pero el caso nuevo exige **algo más que consolidación**: sync de catálogo y stock remoto *entre* sucursales con fiabilidad. La arquitectura se mantiene; lo que crece es la capa de sync (ver §4-6). El esfuerzo total supera levemente las 38h previstas.

---

## 3. Arquitectura propuesta

```
Sucursal A (PC propia)          Cloud (Railway/PostgreSQL)         Sucursal B (PC propia)
┌──────────────────────┐       ┌──────────────────────────┐       ┌──────────────────────┐
│ TUSTOCK + SQLite     │       │  Business (cuenta)       │       │ TUSTOCK + SQLite     │
│  tustock.db (A)      │       │  ├─ Branch A ──────────┐ │       │  tustock.db (B)      │
│  catálogo + stock A  │       │  ├─ Branch B ──────────┤ │       │  catálogo + stock B  │
│  (única escritora    │       │  └─ catalog_state A/B  │ │       │  (única escritora    │
│   de su stock)       │       │  └─ CommandQueue       │ │       │   de su stock)       │
│                      │       └──────────────────────────┘       │                      │
│  agente A ──push 30s──► /api/push (snapshot) ──◄──poll── agente B│
│  agente A ──◄── pull sync catálogo + stock B ──►── agente B      │
└──────────────────────┘                                           └──────────────────────┘
```

Principios de diseño:

1. **Cada sucursal es la única escritora de su propio stock.** No hay escrituras cruzadas concurrentes. Esto elimina las carreras de doble descuento por construcción.
2. **El push es un snapshot completo** (`cloud_push.py:38-166`): cada push sobreescribe la foto de esa sucursal en el cloud. Sin deltas que reconciliar para stock.
3. **El cloud es solo un coordinador/relay**, nunca la fuente de verdad operativa. Si el cloud cae, cada sucursal sigue vendiendo; el sync se pone en pausa.
4. **La frescura es un dato de UI, no una promesa.** Cada número remoto muestra cuándo se actualizó.

---

## 4. Modelo de datos

### Cloud (PostgreSQL) — aditivo

```
Branch                          # NUEVO
  id, business_id, name, api_key (unique), is_active, last_seen_at
  # hoy Business.api_key es 1:1 con la PC (cloud/models.py:18-29).
  # Multi-sucursal: cada sucursal es un Branch con su propia api_key.

CatalogState                    # NUEVO
  branch_id, product_uuid, payload (name, code, barcode, price, cost,
  min_stock, unit, category, stock, is_active), version, updated_at
  # Último estado de cada producto por sucursal. Es la tabla que se
  # distribuye entre sucursales.

CommandQueue                    # EXISTENTE (cloud/models.py:97-108)
  # Se reutiliza en Fase 2 para transferencias/venta remota.
  # FALTA: campo operation_id (idempotencia) — ver §7.
```

**Migración de compatibilidad:** los Business existentes (Librería, SU-Day) reciben un Branch default al desplegar. Sus flujos no cambian; `api_key` de Business sigue funcionando (apunta al branch default).

### Local (SQLite por sucursal) — aditivo

```
Product
  + product_uuid TEXT            # NUEVO. Identidad global del producto.
  # El id local (Integer autoincrement, product.py:23) sigue existiendo
  # para FKs locales; el uuid es la clave de sync. Precedente de migración
  # con ALTER TABLE: database.py:35-44 (_run_migrations, expiry_date).

RemoteStock                     # NUEVO
  product_id, branch_id, quantity, reported_at
  # Stock que la sucursal LOCAL muestra de OTRAS sucursales.
  # Se guarda cacheado para mostrarse offline con badge "desactualizado".
  # NUNCA toca current_stock local (esa tabla es sagrada).

SyncState                       # NUEVO
  branch_id, last_catalog_version, last_pull_at
  # Para sync incremental de catálogo (solo lo que cambió).
```

---

## 5. Sync de catálogo

**Problema:** un producto nuevo en A debe aparecer en B. Y un producto borrado en A debe dejar de venderse en B.

### Conflicto de IDs

- `Product.id` es `Integer autoincrement` **local a cada sucursal** (`product.py:23`) → el producto #42 en A no es el #42 en B.
- Solución: **`product_uuid` (UUID) como identidad global**, generado en el alta del producto y propagado. El `id` local queda solo para FKs internas.
- `code` y `barcode` son `unique` **por sucursal** (`product.py:24,32`). Al propagar, si el code ya existe localmente, se actualiza ese producto (por uuid); si el uuid no existe pero el code sí, es un conflicto de doble alta → resolución por prioridad de versión y log para el dueño.

### Mecanismo (pull-based, idempotente por versión)

```
1. Alta/edición/baja de producto en sucursal A
   → se persiste local con updated_at + se marca "dirty" (pendiente de push)
2. Agente A (loop 30s, o push real-time) → POST /api/catalog  (delta)
3. Cloud upsert en CatalogState (branch_id, product_uuid, version)
4. Agente B → GET /api/catalog/sync?since_version=X
   → aplica productos nuevos/modificados (upsert por uuid)
   → aplica tombstone (is_active=false) para borrados lógicos
5. Producto borrado = soft-delete (is_active=False, products.py:166-174)
   → ya es el comportamiento existente; solo se propaga el flag.
```

**Detalle clave:** hoy el snapshot de inventario está limitado a 500 productos (`cloud_push.py:148`, flag `truncated`). Para multi-sucursal, **el sync de catálogo es independiente del snapshot de métricas**: la tabla `CatalogState` lleva el catálogo completo con stock incluido, sin límite. El límite de 500 queda solo para el dashboard de monitoreo.

**Reglas de consistencia:**
- Una vez sincronizado un producto, `code` y `barcode` no se editan en ninguna sucursal (o se editan con re-sync completo). Cambiar un code que ya existe en otra sucursal rompe el join natural.
- El conflicto "dos sucursales crean el mismo producto con códigos distintos" se resuelve por dedupe de `barcode` en el cloud (alerta al dueño en el Monitor Cloud, no bloqueo).

---

## 6. Sync de stock con fiabilidad

**Pregunta:** ¿alcanza el push cada 30s + push real-time post-venta que YA existe?

**Respuesta corta: sí para el requisito del caso, con un matiz.**

Cadena completa:
1. Venta en sucursal A → commit local → `push_async()` (fire-and-forget, `cloud_push.py:200-201`) → cloud `/api/push` en **<1s**.
2. Sucursal B (poll del agente cada 30s) → lee el estado más reciente de A desde el cloud.
3. Resultado: **el stock que ve B refleja la venta de A con ≤31 segundos de demora** (típicamente ~1-5s). El requisito de "5 minutos" se cumple con 10x de margen.
4. Si el push real-time falla (timeout 5s, errores silenciosos por diseño), el loop de 30s lo compensa. Si el cloud está caído, cada sucursal opera normal y el sync se reanuda solo.

**El problema real no es la latencia, es la honestidad.** El diseño de fiabilidad es:
- Cada stock remoto muestra **cuándo se actualizó** (timestamp de reporte).
- Badge de frescura: 🟢 <1min, 🟡 1-10min, 🔴 >30min/offline.
- **Si sucursal B estuvo offline 2 horas**, al volver trae el estado fresco de A en el primer poll (snapshot completo). Mientras tanto, B cachea el último RemoteStock conocido y lo muestra con badge rojo — o lo oculta si no hay dato.
- El vendedor decide con información verdadera: verde = "existe y está fresco", rojo = "llamá por teléfono" (el comportamiento actual, ahora como fallback y no como default).

**Doble descuento / carreras:** en MVP no hay descuento cruzado → no existe la carrera. En Fase 2, cada sucursal es la única escritora de su stock: la venta remota se ejecuta **en la DB de la sucursal dueña del stock**, atómicamente (mismo patrón que `remote_orders.py:52-63`: chequeo de stock + decremento + movimiento en la misma transacción). El único residuo es la staleness del dato en el momento de decidir la venta — inherente a cualquier sistema distribuido y aceptable con la reserva/confirmación del dueño.

---

## 7. Venta en sucursal B de stock de sucursal A

**El caso real es:** "¿tenés esto?" → verificar existencia. **No** "quiero que me lo reserven y pagar acá".

### Recomendación MVP: SIN reserva remota

La venta se hace donde está el producto:
- **Escenario 1 (típico):** B ve que A tiene el producto (verde, fresco) → le dice al cliente "sí, en la sucursal Centro hay 3" → el cliente va a A y compra ahí. Sin llamada telefónica, sin fiabilidad dudosa. **Esto mata el caso de uso por completo.**
- **Escenario 2 (B vende igual):** B cobra al cliente y registra la venta localmente con una **transferencia pendiente** desde A. En Fase 2, esto es: CommandQueue a A (decrementa stock en A) + entrada de stock en B + ajuste. En el MVP, un simple movimiento de ajuste manual en B y otro en A (o una anotación) — sin magia de sync.

**Por qué no reservar stock remoto en el MVP:** reservar unidades en una DB remota implica estados (reserved → confirmed/cancelled), expiración de reservas, y reintentos de des-reserva. Es complejidad distribuida para un caso que se resuelve con una transferencia física entre sucursales del mismo dueño. Overengineering.

### Fase 2: venta remota + transferencias (con infra ya existente)

La CommandQueue del POS Remoto (`cloud/models.py:97-108`, `cloud/api.py:1294-1459`, `agent.py:241-290`) ya ejecuta ventas remotas en la DB local. Se reutiliza con un comando `transfer`/`remote_sale` **dirigido a la sucursal dueña del stock**. 

**Fix previo obligatorio antes de Fase 2:** hoy `GET /api/commands/pending` marca los comandos como `executing` (`cloud/api.py:1407-1409`). Si el agente crashea entre el fetch y el ack, el comando queda `executing` para siempre (sin retry). Para multi-sucursal hace falta un campo `operation_id` (UUID) que la sucursal guarde localmente para deduplicar: si un comando se re-despacha, se detecta y se responde con el resultado ya aplicado (idempotencia real, no solo el flag de estado).

---

## 8. Esfuerzo estimado

### Fase 1 — MVP: stock entre sucursales con fiabilidad (~40-45h, 1 semana de dev)

| Componente | Trabajo | Horas |
|-----------|---------|:-----:|
| **Cloud API + modelos** | Branch, CatalogState, register-branch, `/api/catalog` push/pull/sync, `/api/branches/status`, migración de Business existentes → Branch default | 10 |
| **Server backend** | `product_uuid` + migración ALTER, tabla RemoteStock + SyncState, hooks en alta/edición/baja de producto (marcar dirty + push), gating por licencia `multisucursal_enabled` | 10 |
| **Agente local + cloud_push** | Identidad de sucursal en `config/cloud.json` (`branch_id`), push de catálogo, pull de RemoteStock de hermanas, badges de frescura | 6 |
| **Frontend** | Columna/panel "Stock en otras sucursales" en Products y POS, badges de frescura, página/configuración de sucursales | 8 |
| **Config / instalación** | `configurar.bat` multi-branch, `cloud.json`, spec PyInstaller + hiddenimports, EXE/APK rebuild, checklist USB | 4 |
| **QA + integración** | Simulación de 3 sucursales (2 VMs + host), casos offline, validación con el cliente | 4 |
| **Buffer** | Imprevistos | 4 |
| **Total Fase 1** | | **~46** |

### Fase 2 — Venta remota + transferencias entre sucursales (~20-30h)

| Componente | Trabajo | Horas |
|-----------|---------|:-----:|
| Cloud + agent | `operation_id` (idempotencia), comando `transfer`, ack con re-intento, fix del stuck-executing | 12 |
| Frontend | Flujo de venta con sucursal remota, transferencias pendientes, aprobación | 8 |
| QA | Doble venta, offline durante transferencia, reintentos | 4 |

### Fase 3 — Consolidado y analytics (~10-15h)

| Componente | Trabajo | Horas |
|-----------|---------|:-----:|
| Cloud | Analytics por sucursal + vista consolidada por negocio (reusa `/api/admin/analytics/weekly`), stock consolidado en Monitor Cloud | 10 |
| Frontend | Vista multi-sucursal en dashboard cloud | 3 |

**Total completo: ~75-90h (~2 semanas de dev). MVP: 1 semana.**

> Nota: la evaluación previa de MEMORY estimaba ~38h para "consolidación". Este análisis sube a ~46h el MVP porque el caso nuevo (stock *entre* sucursales con fiabilidad) exige sync de catálogo + tabla de stock remoto + indicador de frescura, que es más que una vista consolidada.

---

## 9. Riesgos

### Riesgos top 3

| # | Riesgo | Severidad | Mitigación |
|---|--------|:---------:|-----------|
| 1 | **Stock desactualizado si sucursal offline o push falla** → el vendedor promete stock que no existe | 🔥 Alto | Snapshot completo + push real-time (≤31s de demora típica) + **badge de frescura honesto** + cache local con marca de viejo. MVP es read-only: no se descuenta stock cruzado, no hay promesa sobre un número viejo. |
| 2 | **Conflictos de catálogo entre sucursales** (IDs locales distintos, codes editados, doble alta del mismo producto) | 🔥 Alto | `product_uuid` global + sync versionado + soft-delete. Regla: code/barcode inmutables una vez sincronizados. Dedupe por barcode con alerta al dueño (no bloqueo). |
| 3 | **Mercado: 1 solo prospecto real** (polirrubro 3 sucursales) + farmacia (3). ¿Justifica 1 semana de dev? | 🟡 Medio | La infra se reutiliza entera (cloud, agent, CommandQueue). El costo de oportunidad es ~46h. Ventas valora el deal en $240K+ ($300K según `analisis-precios-2026-07-30.md`). Además el feature abre mercado (farmacias, kioscos con 2 locales). |

### Riesgos secundarios

| Riesgo | Mitigación |
|--------|-----------|
| **Corrupción de datos** | Descartada la opción (c) NFS. Cada sucursal es dueña de su DB (WAL ya activo, `database.py:10-16`). El cloud es solo relay. |
| **Latencia >500 productos** | El sync de catálogo es separado del snapshot de 500 (`truncated`); `CatalogState` lleva el catálogo completo. |
| **Doble venta del mismo stock (Fase 2)** | Cada sucursal es la única escritora de su stock; la venta remota ejecuta en la DB dueña (patrón `remote_orders.py`). Residuo: staleness al decidir → aceptable + reserva/confirmación. |
| **Comando colgado en executing (Fase 2)** | `operation_id` + dedupe local; re-despacho seguro. |
| **Compatibilidad con clientes actuales** | Cambios aditivos. Librería y SU-Day: single-PC sin flag → flujo idéntico. Migración automática: su Business se convierte en Business + 1 Branch default. Requiere deploy de cloud (git push a Railway) y rebuild de EXE. |
| **Precios / licencias** | Dominio de Ventas. Mecánicamente: plan `multisucursal` en `cloud/api.py:302` (mapa PRICE) y en la matriz de features de `/api/licenses/validate` (`cloud/api.py:1244-1250`), + flag en `License` local. |

---

## 10. Recomendación final

**Arquitectura elegida:** instancias SQLite independientes por sucursal + coordinador de catálogo y stock en el cloud (opción a). Preserva el offline, no toca a los clientes actuales, reutiliza agente/push/snapshot/CommandQueue.

**¿MVP en una semana? Sí**, con un alcance estricto:
- ✅ Catálogo sincronizado entre sucursales (producto creado en A aparece en B en <1min).
- ✅ Stock remoto visible desde el POS/Products con badge de frescura (resuelve el caso de la llamada telefónica: se ve la existencia real y actualizada).
- ✅ Estado por sucursal en el Monitor Cloud (última conexión, stocks bajos por sucursal).
- ❌ FUERA del MVP: reserva de stock remoto, venta cobrada en B de stock de A, transferencias con comando automático, reports consolidados. Son Fase 2/3 con infra ya construida.

**La fiabilidad del stock se logra con tres piezas que ya tenemos o son triviales:** (1) push real-time post-venta (ya existe), (2) snapshot completo por push (ya existe), (3) mostrar la frescura del dato en vez de ocultarla (nuevo, barato). No hace falta magia de sincronización distribuida para 3 sucursales que hoy se comunican por teléfono.
