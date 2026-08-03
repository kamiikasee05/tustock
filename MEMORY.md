# MEMORY — TUSTOCK

## RESUMEN EJECUTIVO (lee esto primero)

- **Qué es:** Sistema de gestión de stock y ventas para polirrubros argentinos (kioscos, librerías, almacenes). Sin internet, pago único o suscripción, 15 min de instalación.
- **Estado:** Fase 1 (licencias + trial + gating) ✅. Monitor Cloud desplegado ✅. POS Remoto Fase 1 ✅. 2 clientes activos. 1 instalación in-situ completada (28/7). 3 prospectos activos (farmacia 3 suc, polirrubro 3 suc, polirrubro 1 suc).
- **Stack:** Python/FastAPI/SQLite (backend) + React/Vite/TS (frontend) + Kotlin/ML Kit (Android — app Stock activa 2/8, app POS congelada).
- **Clientes:**
  1. Librería — plan premium ($60K entry + $6K/mes, legacy). Monitor Premium + Cloud. ✅ Instalación in-situ completada (28/7). Key: `TST-A921-C581-9F20-4B43`. Email cloud: `libreria-tustock@temp.tustocksoft.com.ar`
  2. SU-Day (Dayana) — plan Suscripción ($8K/mes). Monitor Cloud + POS Remoto validado end-to-end.
- **Próximas prioridades (orden):**
  1. 🟡 **Multi-sucursal en STANDBY** hasta reunión con encargado/dueño de farmacia (análisis DEV validado 31/7: **~50h MVP ≈ 2 semanas**, ver `docs/analisis-multisucursal-2026-07-30.md`)
  2. 🟢 Reunión polirrubro 1 sucursal — **reprogramada a la semana del 5/8** (horario a confirmar con el cliente). Demo probada exitosa en notebook (2/8). Bundle en `USB_TUSTOCK\TUSTOCK_DEMO\`, guión en `LEEME-DEMO.txt`
   3. 🟢 **Opción E (app Stock CSV)** — **COMPLETADA (2/8) + punto C (precios) ✅ (3/8)**: app Stock genera CSV local + import + catálogo offline + **captura de PRECIO en toma**. Fase 1 (app Kotlin) ✅ + Fase 2 (import server+web) ✅ + Flujo unificado carga inicial + auditoría ✅ (2/8) + **Punto C precios en la toma ✅ (3/8)**. CI APKs #45 en build. EXE rebuild ✅. Pendiente: QA final en campo + actualizar clientes.
  4. Activar Programa Despegue ML ($45K recuperable, $45K publicidad gratis)
  5. Registrar bases de datos en AAIP (obligación legal Ley 25.326)
  6. Railway a Hobby cuando se acaben créditos gratis ($5/mes)
  7. Tests automatizados (postergado hasta 5+ clientes)
- **Lo que NO existe (no prometer):** Backup en la nube ❌ | Multi-sucursal ❌ | Múltiples cajeros ❌
- **Reglas críticas para agentes:**
  - NO tocar Android (**congelado — EXCEPCIÓN 2/8: app Stock aprobada para Opción E toma de stock CSV. App POS sigue congelada**). NO internationalizar (solo español).
  - NO prometer features inexistentes — publicidad engañosa (Ley 24.240 art. 8-9).
  - Directivas de Legal son VINCULANTES sobre cualquier desarrollo.
  - SIN MCPs — regla permanente desde 12/7/2026.
  - NO codificar si sos Dispatcher/Marketing/Legal — delegar a DEV.
- **Precios (congelados para clientes actuales, nuevos en revisión por Ventas):** Trial 30d gratis (100 prod) | Básico $80K único | Suscripción $8K/mes | Pro $160K único
- **Recomendación Ventas (30/7):** Básico $100K único | Suscripción $12K/mes | Pro $200K único | Multi-Sucursal $300K único o $20K/mes (ver `docs/analisis-precios-2026-07-30.md`). Pendiente aprobación del humano.
- **Demo reunión sábado (30/7):** Bundle `USB_TUSTOCK\TUSTOCK_DEMO\` con DB demo de polirrubro (48 productos, 8 ventas hoy $114.300, vencimientos, fiado). Seed: `server/seed_demo_polirrubro.py`. Guión: `USB_TUSTOCK\LEEME-DEMO.txt`. Análisis multi-sucursal: `docs/analisis-multisucursal-2026-07-30.md` (MVP ~40-45h, instancias independientes + coordinador cloud).
- **Archivos clave:** `server/` backend | `web/src/` frontend React | `cloud/` monitor cloud + API | `legal/` docs legales | `obsidian/` vault de documentación
- **Monitor Cloud:** `monitor.tustocksoft.com.ar` (Railway). Push-based. Login JWT. 3 tabs (Dashboard/Inventario/Pedidos). POS Remoto.
- **Admin:** Independiente en `E:\TUSTOCK_ADMIN\`. Habla SOLO a cloud API (Railway). Tray icon púrpura.
- **Última acción:** Analytics semanales endpoint + script (29/7). Stock inicial al crear producto (29/7). TUSTOCK_ADMIN_TOKEN configurado (29/7). PDF presentación (el de Gemini, `TUSTOCK - Presentación del Sistema.pdf` — Marketing NO hace PDFs).

---

> Este archivo es la fuente de verdad compartida entre el **Agente de Ventas**, el **Agente de Desarrollo (DEV)**, el **Agente Legal**, el **Agente de Marketing** y el **Agente UX/UI**. Lo leo al inicio de cada sesión para saber el estado actual.
>
> **Rol de Ventas (YO):** Conozco el producto, el mercado, los precios. Organizo, coordino y le asigno tareas humanas al usuario para vender.
>
> **Rol de DEV (asistente de código):** Construye exclusivamente lo que está definido aquí. No inventa features. No desarrolla fuera del roadmap.
>
> **Rol de Legal (abogado especialista en servicios digitales):** Asesora exclusivamente en cumplimiento normativo (Ley 24.240, Ley 25.326, Ley 11.723 y demás leyes argentinas aplicables). Redacta y revisa documentación legal (términos, privacidad, reembolso). Emite directivas vinculantes para DEV, Ventas y Marketing cuando detecta incumplimientos legales. **NO toca código, NO toca el dashboard de Obsidian, NO desarrolla features.** Su única herramienta es el dictamen legal y la orden directa a DEV.
>
> **Rol de Marketing (creativo publicitario):** Crea contenido y campañas para salir al mercado. Diseña posts, volantes, secuencias de WhatsApp, anuncios. Trabaja en coordinación con Ventas. Sus entregables van en `docs/marketing/` y `obsidian/TU STOCK/06-Marketing/`. **NO toca código, NO modifica precios, NO toca temas legales sin consultar a Legal.**
>
> **Rol de UX/UI (diseñador de interfaz):** Diseña y desarrolla la interfaz de usuario — landing page, dashboard, componentes React, estilos inline. Experto en UX/UI para SaaS argentinos. Trabaja en `docs/index.html` (landing), `web/src/` (frontend React) y `monitor/dashboard.html` (dashboard local). **NO toca lógica de negocio, NO modifica precios, NO toca backend, NO crea contenido de marketing.** Dark theme, mobile-first, copy argentino.
>
> **Rol del Dispatcher (🧑‍💻 YO):** Coordino los agentes, actualizo MEMORY.md, sincronizo Obsidian, y soy el **único propietario de TELENOTAS** (`E:\TELENOTAS\`). Reviso el inbox al inicio de cada sesión y decido qué ideas procesar. Ni DEV, ni Ventas, ni Legal, ni Marketing tocan TELENOTAS.
>
> **Rol secundario del Dispatcher — Programador:** Como actividad secundaria, programo junto a DEV cuando la situación lo requiere. Dos perspectivas distintas en el código. Mi rol primario SIEMPRE es coordinador. Programo copiando el estilo de DEV (Python con type hints, TypeScript sin strict, inline styles). Si necesito delegar, uso el subagent_type "general" para DEV.
>
> **Regla especial — Cliente Premium:** La clienta que paga $60K entry + $6K/mes tiene un plan híbrido legacy (pago único + suscripción). Tiene acceso al Monitor Cloud, updates continuos y soporte prioritario. Su tier en código es `premium`. Ningún cliente nuevo accede a este precio ni a este tier. Es la primera clienta y cierra antes del lanzamiento oficial.

**Regla de legacy pricing:** Si un referido pregunta cuánto pagó ella, la respuesta es: *"Fue la primera cliente y compró antes del lanzamiento oficial. Esos precios ya no están disponibles."*

### Fuentes de verdad (convención de sincronización)

| Qué | Dónde vive | Quién lo lee | Cuándo se actualiza |
|-----|------------|:------------:|-------------------|
| Estado del proyecto, features, bugs, roadmap | **MEMORY.md** (este archivo) | Agentes (DEV, Ventas, Legal, Marketing, QA) | Después de cada cambio significativo |
| Dashboard visual para el humano | **obsidian/TU STOCK/Dashboard.md** | Humano | Sincronizado via `scripts/sync-obsidian.ps1` |
| Documentación detallada por área | **obsidian/TU STOCK/0X-*/** | Humano + agentes cuando buscan algo | Cuando el contenido correspondiente cambia |
| Código fuente | **server/, web/src/, cloud/** | DEV | En cada commit |

> **Regla:** MEMORY.md es la fuente primaria. Obsidian es una vista. Si hay conflicto, MEMORY.md gana. El Dispatcher sincroniza después de cada cambio importante usando `scripts/sync-obsidian.ps1`.

> **Cuentas de MP y ML dedicadas al proyecto (Julio 2026):** TUSTOCK tiene cuenta propia de Mercado Pago y Mercado Libre. Antes se usaba la cuenta personal del humano. Las apps de MP (Checkout Pro y Suscripciones) deben crearse desde la cuenta nueva del proyecto para tener tokens exclusivos. La cuenta personal ya no se usa para TUSTOCK.
>
> **Apps MP del proyecto (Julio 2026):**
> - **Checkout Pro** (pagos únicos Básico/Pro): Token → env var `TUSTOCK_MP_TOKEN` (verificar en dashboard de MP)
> - **Suscripciones** (plan $8K/mes): Token → env var `TUSTOCK_MP_SUBS_TOKEN` (verificar en dashboard de MP)
> - **Webhook URL:** `https://tustock.up.railway.app/api/payments/webhook?source_news=webhooks`
> - **Back URLs:** `https://tustock.up.railway.app`
> - **Railway configurado:** ✅ `TUSTOCK_MP_TOKEN` (Checkout Pro) + `TUSTOCK_MP_SUBS_TOKEN` (Suscripciones) — Julio 2026

---

## LEAD POTENCIAL: Polirrubro Multi-Sucursal (Julio 2026)

> **Cliente potencial:** Polirrubro con 3 sucursales que vende desde bebidas hasta verduras. Maneja todo en cuaderno, Mercado Pago para transferencias, caja para efectivo. Quiere digitalizar.

**Estado:** 🟢 Social Proof validado — Instalación Librería completada. Listo para approach.

**Estrategia aprobada (23/7):** Acercamiento psicológico. Primero instalar en la librería (semana del 28/7), validar que funciona, y usar ese caso como estandarte para polirrubro. "Ella ya lo tiene, ¿por qué vos no?" — ✅ VALIDACIÓN COMPLETADA.

**Acciones tomadas:**
1. ✅ Análisis comercial (Ventas)
2. ✅ Análisco técnico (DEV)
3. ✅ Estrategia definida: Social Proof vía librería
4. ✅ Instalación en librería completada (28/7) — VALIDACIÓN ✅
5. ✅ Material de testimonio (Marketing) — `docs/marketing/social-proof-polirrubro.md`
6. ⬜ Approach al polirrubro con caso de éxito — `docs/marketing/estrategia-polirrubro.md`

**Monitor Cloud SU - Day configurado (23/7):**
- Email: daybarrionuevo6@gmail.com
- Contraseña: TUSTOCK-Dayana2026
- API Key: 12d7b33ed253820e458c8ad32333437240f376facb789db4f97513d155f839e2
- Archivo config: `temp\cloud-config-day.json`
- **Pendiente:** Copiar config/cloud.json a su PC y reiniciar TUSTOCK

**Visita 23/7 — Hallazgos:**
1. ❌ PC de Dayana no tiene directorio `config/` — hay que crearlo manualmente
2. ❌ Dayana quiere VENDER desde el Monitor Cloud (tomar pedidos, cobrar) — Feature que no ofrecemos
3. ✅ Cuenta en el cloud creada, API key generada

**Feature sugerido por Dayana — POS Remoto en Monitor Cloud:**
- Documentado en `docs/features-sugeridos/pos-remoto-monitor.md`
- Solicitud: tomar pedidos y cobrar desde el celular
- **✅ IMPLEMENTADO (25/7):** POS Remoto Fase 1 — venta remota directa desde Monitor Cloud
- Flujo: Monitor Cloud → CommandQueue → Agent local → Server → Venta + stock descontado + push real-time
- Archivos: `cloud/api.py` (6 endpoints), `cloud/models.py` (CommandQueue), `server/routes/remote_orders.py`, `cloud/agent.py` (command loop), `cloud/dashboard.html` (tab POS)
- **Validación de precio:** Dayana pagaba $24K/mes por feature similar en otro sistema. Nuestro precio de $15K/mes es 37% más barato y más completo.
- **Tier asignado:** Pro ($160K único) o Suscripción Pro ($15K/mes). Clienta premium lo recibe incluido.

**Recomendación de Ventas:**
- **Valor del cliente:** 3 licencias Básico = $240K ARS, o 1 Suscripción = $8K/mes ($96K/año)
- **Tier recomendado:** Pro ($160K) o Suscripción premium ($12-15K/mes) con multi-sucursal incluido
- **Estrategia:** Primero entrevista para validar. Si necesita stock consolidado y reports, desarrollar multi-sucursal básica ANTES de vender. Si solo necesita control por sucursal, vender 3 licencias separadas.

**Recomendación de DEV:**
- **Opción recomendada:** Instancias independientes + consolidador en cloud
- **Esfuerzo estimado:** ~38 horas (~1 semana de desarrollo)
- **MVP:** Cada sucursal con su instancia, script consolida datos al final del día, dashboard cloud muestra consolidated view
- **Riesgo bajo:** Sin cambios a SQLite, sin PostgreSQL, compatible con clientes actuales
- **Limitación:** Catálogo de productos no se sincroniza en tiempo real (periódico o manual)

**Decisión pendiente del humano:** ¿Avanzamos con entrevista al cliente? ¿O esperamos?

**Nuevo (30/7):** El dueño confirmó interés. Se suma a los prospectos activos.

**Análisis DEV 30/7 — Tier Multi-Sucursal (stock entre sucursales con fiabilidad):**
- **Caso de uso real:** "Cliente llega y pregunta por un producto. Si no está, llaman por teléfono a la otra sucursal. Si el sistema funciona ven el stock de la otra sucursal — pero si no se actualizó o la venta no se registró, no hay fiabilidad."
- **Recomendación DEV:** Instancias SQLite independientes por sucursal + coordinador de catálogo/stock en el cloud (PostgreSQL/Railway), reutilizando agente/push/snapshot/CommandQueue existentes. Offline preservado, no toca clientes actuales (flag `multisucursal_enabled`).
- **MVP ~1 semana (40-45h):** sync de catálogo + stock remoto visible con badge de frescura ("actualizado hace 12s"). Fiabilidad = snapshot completo + push real-time (≤31s, ya existe) + nunca mentir: dato viejo se muestra viejo. Venta cruzada/reserva FUERA del MVP.
- **Fase 2 (~20-30h):** transferencias/venta remota vía CommandQueue (requiere `operation_id` para idempotencia — hoy un comando puede quedar en `executing` si el agente crashea).
- **Riesgos top 3:** (1) stock desactualizado si sucursal offline → badge de frescura; (2) conflictos de catálogo/IDs → `product_uuid` global + sync versionado + soft-delete; (3) mercado: 1 solo prospecto real ($240-300K vs ~46h dev).
- Documento completo: `docs/analisis-multisucursal-2026-07-30.md`

**Decisión del humano (30/7):** 🟡 **STANDBY** — no desarrollar multi-sucursal hasta conseguir la reunión con el encargado/dueño de la farmacia. Se retoma cuando haya confirmación del cliente.

---

## LEAD POTENCIAL: Farmacia 3 sucursales (Julio 2026)

> **Cliente potencial:** Cadena de 3 farmacias (1 central + 2 sucursales).

**Estado:** 🟡 Contacto inicial — las chicas de atención al cliente compartieron la necesidad.

**Decisión del humano (30/7):** 🟡 **STANDBY** hasta conseguir reunión con el encargado y el dueño. NO desarrollar multi-sucursal aún.

**Estimación DEV validada (31/7):** El humano consultó cuánto llevaría el feature aunque no haya reunión aún. DEV validó el análisis del 30/7 contra el código actual: **MVP ~50h ≈ 2 semanas** (leve ajuste de 46→50h por: `product_uuid` NO existe y requiere backfill en DBs de clientes vivos, cloud NO tiene sistema de migraciones propio (`MetricsPush.branch_id` sobre tabla con datos reales), y flag `multisucursal_enabled` hay que crearlo en 4 puntos del código). Cero bloqueantes técnicos (PostgreSQL ya en Railway). Recomendación técnica: **esperar la reunión** — el riesgo no es de desarrollo, es de mercado (1 solo prospecto). Si el dueño confirma, el MVP read-only de ~50h mata el caso de uso sin necesitar Fase 2. Desglose por hitos en sección 16.

**Estrategia de venta (30/7):** 💰 **Exprimir al cliente — priorizar SUSCRIPCIONES sobre pagos únicos.** Para la farmacia: plantear Suscripción Pro ($15K/mes) o suscripciones por sucursal, NO ofrecer Básico/Pro pago único como primera opción. Multi-sucursal como argumento de upgrade (cuando esté desarrollado).

**Datos relevados:**
- Tienen **sistemas separados** para obras sociales, autorizaciones y facturación electrónica (AFIP)
- El sistema que se les colgó es **solo stock + ventas**, y era **online**
- No pudieron registrar ventas porque el sistema online cayó
- **Necesitan stock + ventas OFFLINE** — exactamente lo que TUSTOCK ofrece
- No requieren features de farmacia específicos

**Conclusión:** No necesitan nada especial de nuestra parte. Es un cliente ideal para TUSTOCK estándar. El dolor es que su sistema online los dejó tirados.

**Próximo paso:** El humano va a buscar una reunión con el dueño para entender:
1. ¿Cada sucursal maneja stock independiente o comparten?
2. ¿Necesitan vista consolidada desde un solo lugar?
3. ¿Cuántas PCs serían (1 por sucursal)?

**Nota 31/7:** El humano valora la **alternativa B** — destrabar la reunión con llamada/WhatsApp + social proof de la librería (las 3 preguntas de arriba sirven de guión). Decisión A (3 licencias separadas) vs C (MVP multi-sucursal ~50h) se toma con esa entrevista. Ver sección 16.

**Precio tentativo:** Ventas recomienda:
- 3 licencias separadas = $300K ($100K c/u con nuevos precios) o $36K/mes ($12K/mes c/u)
- O plan multi-sucursal si requiere consolidated view (a desarrollar)

---

## LEAD POTENCIAL: Polirrubro 1 sucursal (Agosto 2026)

> **Cliente potencial:** Polirrubro de barrio con 1 sucursal. Reunión reprogramada a la semana del 5/8 (fue sábado 2/8).

**Estado:** 🟢 Reunión reprogramada a la semana del 5/8 — horario a confirmar con el cliente. **Demo probada exitosa en notebook (2/8).**

**Datos relevados:**
- **Origen:** Nuevo contacto, no registrado antes
- **Negocio:** Polirrubro de barrio (probablemente bebidas, comestibles, limpieza)
- **Sucursales:** 1
- **Reunión:** Semana del 5/8 (presencial/virtual a confirmar, horario pendiente)

**Necesidades probables (a confirmar en reunión):**
- Stock y ventas POS
- Fechas de vencimiento (✅ implementado)
- Offline (diferenciador TUSTOCK)
- Backup local

**Estrategia sugerida:** Ir a escuchar primero. Demo enfocada en POS rápido + inventario con vencimientos + Monitor Cloud. Contar caso Librería como testimonio real.

---

## LEAD POTENCIAL: Cosmética (Julio 2026)

> **Cliente potencial:** Gretel — dueña de cosmética + tienda de blancos. 2 locales.

**Estado:** 🟡 Contacto casual — se va a comunicar.

**Datos relevados:**
- **Nombre:** Gretel
- **Negocio:** Cosmética + Tienda de blancos (2 locales)
- **Origen:** Oportunidad casual, no planeada. Se le comentó muy por encima el sistema.
- **Contacto:** Se va a poner en contacto ella.

**Necesidad identificada:** Fechas de vencimiento — tanto cosmética como comestibles necesitan tracking de vencimiento. Feature que TUSTOCK no tiene hoy. Ver sección "Feature Gaps".

**Próximo paso:** Cuando se contacte → entrevista formal de necesidades → demo → propuesta.

---

## FEATURE GAPS DETECTADOS (por prospectos reales)

> Feature gaps documentados que surgen de interacciones con prospectos reales. No son features planeados, son necesidades del mercado que TUSTOCK no cubre hoy.

### Fechas de Vencimiento (detectado 28/7)

| Aspecto | Detalle |
|---------|---------|
| **Origen** | Prospecto cosmética (Gretel) + prospecto polirrubro (3 sucursales) |
| **Qué pide** | Poder registrar y trackear la fecha de vencimiento de productos |
| **A quién afecta** | Comestibles (bebidas, snacks, verdulería), cosmética (cremas, maquillaje), cualquier producto perecedero |
| **Estado actual** | ✅ Implementado (29/7). Product model tiene campo `expiry_date`. Dashboard alerta próximos a vencer. Columna en tabla de productos con badges. |
| **Esfuerzo estimado** | Pendiente evaluación de DEV |
| **Prioridad** | 🟡 Alta — necesario para cerrar prospectos de cosmética y polirrubro |

**Próximo paso:** Verificado con prospectos reales. Feature implementado y listo para usar.

---

## 1. QUÉ ES TUSTOCK — Propuesta de Valor

Sistema de gestión de stock y ventas para polirrubros argentinos (kioscos, librerías, almacenes, etc.).

**Diferenciación única vs competidores:**
1. **Pago único** (o suscripción mensual barata) — no hay cuotas infinitas
2. **Sin internet** — funciona 100% local, no depende de la nube
3. **App Android incluida** — escáner de códigos con el celular
4. **Datos en tu PC** — nadie más ve la información del negocio
5. **Sin técnico** — lo instala el dueño en 15 minutos
6. **Monitor remoto** — mirá las ventas desde el celular estés donde estés (URL fija, push-based)
7. **POS Remoto** — tomá pedidos y cobrás desde el celular (Monitor Cloud)
8. **Licencias validadas en la nube** — cada 7 días verifica que la key sea legítima, sin internet sigue funcionando

**No competimos en:** features enterprise, contabilidad integrada, e-commerce, facturación electrónica (AFIP). Eso no es nuestro cliente.

---

## 2. PLANES Y PRECIOS (CONGELADO — NO CAMBIAR SIN REVISIÓN)

### Planes vigentes (Junio 2026)

| Plan | Precio | Modelo | Qué incluye |
|------|--------|--------|-------------|
| **Trial** | Gratis | 30 días | Máximo 100 productos, sin informes, sin exportación |
| **Básico** | $80,000 ARS único | Pago único | Todo el sistema, app Android, informes, export Excel, 1 año de updates |
| **Suscripción** | $8,000 ARS/mes | Mensual | Todo incluido, updates continuos, soporte prioritario, monitor remoto |
| **Pro** | $160,000 ARS único | Pago único | Todo + Monitor Remoto + cloud backup + export Excel |

### Matriz de gating aprobada (Junio 2026) ✅

> El cliente decide una sola cosa: **"¿Pago único o mensual?"** El único diferenciador real entre tiers es Monitor Cloud + soporte prioritario. Export Excel va en todos los planes pagos (quitarlo se siente injusto, y no es lo que motiva el upgrade).

| Feature | Trial | Básico | Suscripción | Pro |
|---------|:-----:|:------:|:-----------:|:---:|
| Productos | 100 | ∞ | ∞ | ∞ |
| Informes | ❌ | ✅ | ✅ | ✅ |
| Export Excel | ❌ | ✅ | ✅ | ✅ |
| Monitor Cloud | ❌ | ❌ | ✅ | ✅ |
| Soporte prioritario | ❌ | ❌ | ✅ | ✅ |
| Updates | 30d | 1 año | Continuos | 1 año |
| **Precio** | Gratis | $80K único | $8K/mes | $160K único |

> **Nota:** La matriz puede reestructurarse cuando el proyecto madure y tengamos datos reales de uso. Hoy es una foto. Mañana, con 50 clientes, la revisamos.

---

## 3. QUÉ ESTÁ CONSTRUIDO (REAL, NO ASPIRACIONAL)

Todo esto FUNCIONA y lo vendemos como parte del sistema:

- Dashboard con resumen diario y alertas de stock bajo
- Productos: ABM, código, precios, categorías, búsqueda, código de barras
- Stock: actual, movimientos (entrada/salida/ajuste), alertas
- Ventas POS: carrito, métodos de pago, descuentos, descuento automático de stock, asociación a clientes (fiado)
- Clientes: registro, saldo "fiado", transacciones
- Vendedores: alta con DNI, desactivación
- Auditorías de stock: crear, escanear, completar, corregir stock automático
- Pedidos pendientes (desde app Android): aprobar→crea venta, rechazar, con método de pago y cliente
- Presupuestos: crear, aprobar→convierte a venta
- Informes diarios: totales, métodos de pago, top productos
- Exportación CSV y XLSX: ventas, productos (con margen bruto), vendedores, resumen mensual
- App Android: POS (tomar pedidos como vendedor) y Stock (escanear y contar)
- Escáner de código de barras con cámara (ML Kit)
- Generación de imagen de código de barras con precio + nombre
- Scripts de backup/restauración, setup, dev, start
- Servidor con SPA fallback para frontend compilado
- Esquemas Pydantic para validación de datos (schemas.py)
- **Monitor Premium (Fase 4 adelantada):** Servicio independiente puerto 8091, login propio, dashboard mobile responsive, API read-only. Expuesto vía Cloudflare Tunnel para acceso remoto desde el celular. Solo esta clienta lo tiene.
- **Monitor Cloud (Fase 5):** Desplegado en Railway. URL pública: `monitor.tustocksoft.com.ar` (custom domain via Cloudflare). API push-based, dashboard mobile responsive con 3 tabs (Dashboard/Inventario/Pedidos), login multiusuario JWT. Agente local (`cloud/agent.py`) pushea métricas cada 30s + inventario completo (max 500 productos). Push real-time post-venta/ajuste (`server/cloud_push.py`). Endpoint `GET /api/inventory` con búsqueda, filtros y paginación. Webhook MP con verificación HMAC-SHA256. URL fija, sin tunnel. Puerto interno: 8080.
- **Launcher unificado:** `scripts/launcher.py` — inicia servidor, monitor, tunnel y cloud agent desde un solo punto. `TUSTOCK.bat` con menú interactivo de 8 opciones.
- **Dashboard admin de licencias:** App independiente en `E:\TUSTOCK_ADMIN\` (Vite+React standalone, puerto 5174). Generar keys, ver licencias, revocar/activar, stats por plan, ingresos estimados, trials por vencer. Panel de Suscripciones MP con link compartido y vinculación de suscripciones entrantes a licencias. **Habla directo a la cloud API (tustock.up.railway.app), NO al server local.** Ejecutable `TUSTOCK_ADMIN.exe` con tray icon púrpura. Scripts: `build.bat`, `start-admin.bat`, `stop-admin.bat`.
- **Validación cloud de licencias:** Cada 7 días el sistema local valida la key contra la API cloud. Si no hay internet, sigue funcionando con cache de hasta 14 días. Trial no requiere validación cloud. Admin sync-keys al generar.
- **Bloqueo por licencia:** Middleware que bloquea todas las APIs cuando el trial vence o no hay licencia activa. Solo deja pasar health, license/status y license/activate.
- **Landing page:** `docs/index.html` — página estática dark theme responsive servida via GitHub Pages (`tustocksoft.com.ar`). Incluye hero, features, planes, caso real, FAQ, WhatsApp CTA. Rediseñada con Stitch design system (dark theme, glass effects, gradient hero).
- **Mercado Pago:** Integración con dos apps (Checkout Pro para pagos únicos Básico/Pro, Suscripciones vía Plan compartido). Crear preferencias, webhook, verificar status. Admin tiene botón "Cobrar MP" y columna estado de pago. Suscripciones: Plan único `preapproval_plan` ($8K/mes) con link compartido, webhook registra nuevas suscripciones, admin las vincula a licencias desde el panel. Requiere `TUSTOCK_MP_TOKEN` configurado.
- **Guía de Usuario PDF** generada automáticamente
- **Documentación legal:** Términos y Condiciones de Uso + EULA, Política de Privacidad, Política de Reembolso y Cancelación (`legal/`). Links en footer de landing page y referenciados desde el registro cloud.
- **EULA clickwrap:** Modal en primera ejecución que obliga a aceptar términos. Endpoints para servir documentos legales (`/api/license/terms`, `/api/license/privacy`, `/api/license/refund`).
- **Consentimiento explícito:** Checkbox obligatorio de aceptación de Términos + Política de Privacidad en formulario de registro del Monitor Cloud.
- **Baja de cuenta cloud:** Endpoint `POST /api/business/delete-account` con confirmación por email. Soft-delete del Business + eliminación de MetricsPush. UI en dashboard con botón "Eliminar mi cuenta".
- **Frontend React rediseñado con Stitch:** 44 archivos modificados, 13 páginas con Stitch design system — dark theme #10131a, glass effects, Material Icons, Geist Mono, animaciones, responsive mobile-first. Design tokens en `index.css`, componente `MaterialIcon`, Layout con sidebar + bottom nav móvil.
- **POS Remoto Fase 1:** Venta remota directa desde Monitor Cloud. Tab POS con buscador, carrito, selector de pago, envío de pedido. Command Queue (`CommandQueue` en cloud) — el agent local lee comandos pendientes y los ejecuta en el server local. Crea venta, descuenta stock, registra movimientos. Push real-time post-venta. Verificación HMAC-SHA256 en webhook MP. Endpoints: `POST /api/pos/order`, `POST /api/pos/approve`, `POST /api/pos/reject`, `GET /api/pos/pending-orders`, `GET /api/commands/pending`, `POST /api/commands/{id}/ack`. Clienta SU-Day validó end-to-end con 15 gotitas de gel.

---

## 4. QUÉ NO ESTÁ CONSTRUIDO (NO VENDER, NO PROMETER)

| Feature | Está en docs | Realidad | Acción |
|---------|:-----------:|:--------:|--------|
| Backup en la nube | Pro (planeado) | ❌ No existe | El flag `backup_enabled: True` está en el modelo pero el feature no se construyó. No prometer. |
| Multi-PC / multi-sucursal | Pro (planeado) | ❌ No existe | No prometer |
| Múltiples perfiles de cajero | Pro (planeado) | ❌ No existe | No prometer |
| Sistema de licencias | Mencionado | ✅ Construido | `server/models/license.py`, `server/services/license_service.py`, `server/routes/license.py`. Frontend: `useLicense.ts`, `Settings.tsx`, `TrialBanner.tsx`, `Upgrade.tsx` |
| Trial mode | Mencionado | ✅ Construido | 30 días o 100 productos. Banner visible. Se auto-crea en primer arranque. |
| Feature gating (tiers) | Mencionado | ✅ Construido | Backend: límite de productos en create, informes y export gateados con 403. Frontend: `UpgradeBlock` en Reports, `TrialBanner` global. |
| Integración de pagos | Mencionado | ✅ Construido | Mercado Pago vía REST API en `cloud/payments.py`. Crear preferencias, webhook, verificar status. Admin muestra botón "Cobrar MP" y estado de pago. Requiere `TUSTOCK_MP_TOKEN` en Railway. |
| Tests automatizados | — | ❌ No existe | Postergado (Fase 4) |
| Docker / CI/CD | — | ❌ No existe | Postergado (Fase 4) |
| i18n (inglés) | — | ❌ No existe | No está en roadmap |
| Consentimiento explícito en registro cloud | — | ✅ Construido | Checkbox de aceptación de Términos + Política de Privacidad en formulario de registro del Monitor Cloud. Backend rechaza registro sin `accepts_terms: true`. |
| Baja de cuenta cloud (endpoint + UI) | — | ✅ Construido | Endpoint `POST /api/business/delete-account` con confirmación por email. Soft-delete del Business + eliminación de MetricsPush. UI en dashboard con botón "Eliminar mi cuenta". |
| EULA clickwrap en primera ejecución | — | ✅ Construido | Modal de aceptación de Términos y Condiciones en primera ejecución. Backend: `POST /api/license/accept-eula`. Frontend: EulaModal en Layout bloquea toda interacción hasta aceptar. |
| Registro de bases de datos AAIP | — | ❌ No existe | No se registró la base de datos de usuarios cloud ante la Agencia de Acceso a la Información Pública. Postergado (Legal — Semana 2). |
| Fechas de vencimiento | — | ✅ Implementado (28/7) | Producto ahora tiene campo `expiry_date`. Alertas de productos próximos a vencer en Dashboard + columna en tabla de productos. MVP completo. |

---

## 5. ARQUITECTURA DEL MONITOR PREMIUM

> Solo disponible para la clienta premium ($60K entry + $6K/mes). Fase 4 adelantada.

### Arquitectura híbrida (Tunnel → Cloud push)

**Estado actual — Monitor Local (Cloudflare Tunnel):** Funciona, pero genera URL random cada vez. Engorroso.

**Evolución aprobada — Monitor Cloud (push-based):** URL fija, login multiusuario, sin tunnel.

```
PC del cliente                          Cloud (Railway/VPS)
┌──────────────────┐                   ┌──────────────────────┐
│  TUSTOCK (local) │                   │  tustock-monitor.com │
│                  │                   │                      │
│  Agente ligero ──┼─ POST /api/push ─>│  API FastAPI         │
│  (cada 30-60s)   │   (con API key)   │  ┌──────────────┐   │
│                  │                   │  │ Dashboard    │   │
│  Lee de DB local │                   │  │ HTML+JS      │   │
│  y envía JSON    │                   │  │ (mobile-resp)│   │
│                  │                   │  └──────────────┘   │
└──────────────────┘                   └──────────────────────┘
                                            ↑
                                     Usuario desde el celular
                                     (login con su cuenta)
```

### Componentes del Monitor Local (actual)

| Componente | Archivo | Rol |
|------------|---------|-----|
| API + Auth | `monitor/app.py` | FastAPI en puerto 8091, login por cookie, endpoints read-only |
| Config | `monitor/config.py` | Puerto (8091), usuario/contraseña, DB URL |
| Dashboard | `monitor/dashboard.html` | SPA vanilla, responsive mobile-first, auto-refresh 30s |
| Iniciar | `scripts\launcher.py` | Lanza con pythonw, fondo (desde menú o `--quick`) |
| Tunnel | `scripts\launcher.py --tunnel` | Descarga cloudflared automáticamente si falta y expone a internet |

### Endpoints del Monitor Local (actual)

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | `/api/login` | No | Login con usuario/contraseña, setea cookie (7 días) |
| GET | `/api/metrics` | Cookie | Dashboard completo: ventas hoy, método de pago, stock bajo, top productos, deudores |
| GET | `/api/metrics/summary` | Cookie | Resumen hoy vs mes |
| GET | `/api/health` | No | Health check para tunnel |

### Endpoints del Monitor Cloud (planeado)

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | `/api/push` | API key | Recibe datos del agente local (ventas, stock, etc.) |
| POST | `/api/login` | No | Login con email+contraseña, devuelve token JWT |
| GET | `/api/metrics` | JWT | Dashboard del negocio autenticado |
| GET | `/api/health` | No | Health check |
| POST | `/api/licenses/sync` | No | Admin sync de key generada al cloud |
| POST | `/api/licenses/validate` | No | Valida key contra DB cloud, registra activación |
| POST | `/api/payments/create` | No | Crea preferencia de pago en Mercado Pago |
| POST | `/api/payments/webhook` | No | Recibe notificaciones de pago de MP |
| GET | `/api/payments/status/{key}` | No | Consulta estado de pago de una licencia |
| GET | `/api/plan/subscription` | No | Info del plan de suscripción + suscripciones sin vincular |
| POST | `/api/plan/update-webhook` | No | Configura notification_url en el plan de MP |
| POST | `/api/plan/link-subscription` | No | Vincula una suscripción entrante a una license_key |

---

## 6. FASE ACTUAL DEL ROADMAP

**Estamos en: Fase 1 y Fase 5 completas. Fase 1 (licencias + trial + feature gating) ✅. Monitor Cloud desplegado. Admin dashboard completo. Validación cloud de licencias implementada. Mercado Pago híbrido: Checkout Pro (pagos únicos) + Plan compartido (suscripciones). Rediseño Stitch completo en todas las superficies.**

### Hitos alcanzados

- ✅ Análisis del proyecto y valorización (~$6K USD hoy, hasta $250K potencial)
- ✅ Definición de planes y precios (Básico $80K, Suscripción $8K/mes, Pro $160K)
- ✅ Diferenciación y propuesta de valor
- ✅ Guión de entrevista con clienta de librería
- ✅ Secuencia de WhatsApp para preventa, seguimiento y cierre
- ✅ **PRIMER CLIENTE: Librería. Pagó $60K entry + $6K/mes suscripción. Sin objeciones.**
- ✅ **Monitor Premium (Fase 4 adelantada)** implementado y disponible para clienta premium
- ✅ **Monitor Cloud** implementado, desplegado en Railway (`monitor.tustocksoft.com.ar`) y funcionando con datos reales
- ✅ **Validación de mercado COMPLETA** — hay disposición a pagar. Precio validado.
- ✅ Esquemas Pydantic para validación de datos
- ✅ Guía de Usuario PDF generada automáticamente
- ✅ Flujo de venta completo: entrevista → demo → cierre → pago → activación
- ✅ **Sistema de licencias** (Fase 1): modelo License, service, routes, feature gating backend+frontend
- ✅ **Trial mode**: 30 días / 100 productos, banner, upgrade prompts
- ✅ **Dashboard admin**: panel `/admin`, generación de keys, stats, ingresos estimados, trials por vencer
- ✅ **Launcher unificado**: TUSTOCK.bat 8 opciones, auto-start con --quick, cloud agent auto-start
- ✅ **Validación cloud**: sync de keys al cloud, validate contra API cloud, cache 7d offline, bloqueo por licencia
- ✅ **Landing page**: `docs/index.html` servida via GitHub Pages
- ✅ **Dominio comprado: tustocksoft.com.ar** — Presencia profesional. Landing page con dominio propio.
- ✅ **Mercado Pago**: integración REST completa. Dos apps con tokens exclusivos (Checkout Pro + Suscripciones). Plan de suscripción `27a1162efe9e47e68cd1349307b02eb2` creado desde cuenta TUSTOCK. Webhook configurable. Flujo MP 100% operativo con dual tokens.
- ✅ **Cuentas dedicadas**: MP y ML con cuenta propia del proyecto (no más cuenta personal).
- ✅ **Marketing**: Copies para Facebook Groups + guía de publicación en ML creados en `docs/marketing/`.
- ✅ **Dual tokens MP**: `TUSTOCK_MP_TOKEN` (Checkout Pro) + `TUSTOCK_MP_SUBS_TOKEN` (Suscripciones) configurados en Railway.
- ✅ **Primer post de Facebook publicado** (11/7): Post 1 ("¿Cuánto stock tenés AHORA?") en 3 grupos de 30k+ miembros. Copy+lienzo auditado por Legal+Marketing.
- ✅ **Mercado Libre publicado** (12/7): MLA3596381120 / MLAU4283798573. Título, categoría, precio ($80K), 5 imágenes, descripción plain text, envío, pagos, envío gratis. Verificado contra HTML descargado.
- ✅ **Programa Despegue ML analizado**: $45K ARS garantía (recuperable 100%), $45K en publicidad gratis, reputación verde claro. Riesgo bajo para producto digital. Pendiente activar por el humano.
- ✅ **Rediseño Stitch frontend React completado**: 44 archivos modificados, 13 páginas rediseñadas con Stitch design system (dark theme #10131a, glass effects, Geist Mono, Material Icons, animations). Build exitoso -30KB. (18/7)
- ✅ **Dominio Monitor Cloud activo**: `monitor.tustocksoft.com.ar` configurado via Railway CLI + Cloudflare DNS. Puerto interno 8080, SSL automático via Let's Encrypt. (14/7)

### Agenda para hoy (22 de Julio 2026)

| # | Tarea | Quién | Estado |
|---|-------|:-----:|:------:|
| 1 | **Bugs críticos de instalación** — productos no registran, barcode, audit scan | 🖥 DEV | ✅ 5 bugs corregidos |
| 2 | **Preparar USB actualizado** para cliente SU - Day | 🧑 HUMANO + Dispatcher | ✅ USB listo y entregado |
| 3 | **Configurar.bat token mismatch** — generaba token random, frontend usa fijo | Dispatcher | ✅ Corregido |
| 4 | **Sync key a cloud** — key no estaba en cloud, activación fallaba | Dispatcher | ✅ Key sincronizada |
| 5 | **Fix barcode en Sales + Presupuestos** — lookup solo revisaba `code`, no `barcode` | 🖥 DEV | ✅ Corregido |
| 6 | **Tray icon + ocultar terminal** — exe corre sin ventana, icono en bandeja | 🖥 DEV | ✅ Implementado y verificado en notebook cliente |
| 7 | **Documentar aprendizaje** de instalaciones para que el sistema madure | Dispatcher | ✅ Checklist §15 creado |
| 8 | **Fix undefined en historial ventas** — created_at formato espacio vs ISO | Dispatcher | ✅ Corregido y deployado |
| 9 | **Admin EXE con tray icon** — TUSTOCK_ADMIN.exe con icono púrpura en bandeja | 🖥 DEV | ✅ Build y test exitosos |
| 10 | **Admin independizado** — endpoints migrados a cloud API, admin habla solo a Railway | 🖥 DEV | ✅ Implementado, token seteado, verificado |
| 11 | **Limpieza proyecto** — ~330 MB de basura removidos, .gitignore actualizado, repo limpio | Dispatcher | ✅ Push hecho |

### Situación actual (20 de Julio 2026)

**Contexto:** No hay capital disponible para activar el Programa Despegue de ML ($45K). Además, se observa competencia creciendo en Facebook Groups (kiosqueros, almaceneros) — muchos publican sus sistemas de stock/ventas. Necesitamos un nuevo acercamiento comercial que no dependa de capital inicial y que nos diferencie de la competencia.

**Acción:** Ventas + Marketing investigaron en paralelo. Documentos generados:
- `docs/marketing/estrategias-sin-capital.md` (Ventas)
- `docs/marketing/estrategias-diferenciacion.md` (Marketing)

**Nota:** El humano tuvo una emergencia familiar el 20/7. No pudo ejecutar el plan de contenido. Se reprograma para mañana (21/7).

### Estado post-instalación segundo cliente (21-22 de Julio 2026)

**Cliente SU - Day** recibió el sistema. Se encontraron 3 bugs críticos durante la demo:
1. Productos no se registraban (barcode vacío violaba UNIQUE constraint)
2. App Stock escaneaba barcode pero lo enviaba como `code` interno, no como `barcode` físico
3. Errores de licencia se mostraban genéricos como "Error de conexion"

**Fix:** 5 bugs corregidos por DEV. Exe y APK recompilados. USB actualizado listo para entregar.
**Segunda visita (22/7):** Se encontraron 3 bugs adicionales (configurar.bat token mismatch, key no sync en cloud, scanner USB no encontraba productos). Todo corregido in-situ. Tray icon implementado y verificado. Fix undefined en historial de ventas (created_at formato).

**Resultado final:** Todos los flujos funcionando — ventas, cobro, registro de stock, pedidos, alta de clientes/vendedores, licencia, tray icon. Cliente satisfecho.

**Pendiente:** Entregar USB actualizado al cliente y verificar que todo funcione in-situ.

### Feedback post-instalación (22 de Julio 2026 — Reunión con clienta SU - Day)

La clienta manifestó dos necesidades concretas:

1. **Actualizar saldos de cuentas corrientes (pagos de fiado):** Ya está implementado. El sistema permite registrar pagos desde la página de Clientes → seleccionar cliente → "Registrar pago". Balance se computa automáticamente. **No requiere desarrollo.** Solo explicarle cómo usarlo.

2. **Ver el stock en todo momento desde el celular:** El Monitor Cloud actualmente solo muestra **stock bajo** (productos por debajo del mínimo, hasta 10). Ella quiere ver **todo el inventario**. **Requiere desarrollo:** agregar sección de "Inventario completo" al Monitor Cloud + ampliar datos que recolecta el agente. Feature candidata para próximo sprint.

### Prioridades actuales (Julio 2026)

| Prioridad | Tarea | Quién | Por qué es crítica |
|:---------:|-------|:-----:|-------------------|
| ✅ | **Dominio comprado: tustocksoft.com.ar** | 🧑 HUMANO | Presencia profesional. Landing page con dominio propio. |
| ✅ | **DNS + GitHub Pages configurados** | 🧑 HUMANO + 🖥 DEV | Cloudflare (free) como DNS provider. Landing accesible en tustocksoft.com.ar con HTTPS. |
| ✅ | **Post 1 publicado en 3 grupos de Facebook** (30k+ miembros c/u) | 🧑 HUMANO | Hecho 11/7. |
| ✅ | **Post 2 publicado en Facebook Groups** (caso testimonial) | 🧑 HUMANO | Hecho 14/7. |
| ✅ | **Post 3 publicado en Facebook Groups** (cierre de secuencia) | 🧑 HUMANO | Hecho 15/7. Secuencia de 3 posts completada. |
| ✅ | **Mercado Libre publicado** (MLA3596381120) | 🧑 HUMANO | Hecho 12/7. Título, categoría, precio ($80K), 5 imágenes, descripción. Verificado. Pendiente: activar Programa Despegue. |
| 🟡 3 | **Activar Programa Despegue ML** ($45K garantía recuperable) | 🧑 HUMANO | Reputación verde claro + $45K publicidad gratis. Riesgo bajo. Ver `obsidian/02-Ventas/Programa Despegue ML.md`. |
| 🟡 4 | **Pasar Railway a Hobby cuando se acaben los créditos gratis** | 🧑 HUMANO | $5/mes. Hobby tiene $5 de créditos incluidos, 48 vCPU/48GB, 99.9% uptime. Cubre nuestra cloud API + Monitor. No apurar — aprovechar gratis todo lo posible. |
| 🟡 5 | **Registrar bases de datos en AAIP** (PASO 1 + 2) | 🧑 HUMANO | Obligación legal (Ley 25.326 art. 21). Guía en `obsidian/TU STOCK/03-Legal/Registro AAIP.md`. |
| ✅ | **Implementar rediseño Stitch en frontend React** | 🎨 UI + 🖥 DEV | Completado 18/7. 44 archivos, 13 páginas rediseñadas con Stitch dark theme, glass effects, Geist Mono, Material Icons. |
| ✅ | **Dominio para Monitor Cloud** | 🖥 DEV + 🧑 HUMANO | `monitor.tustocksoft.com.ar` configurado via Railway CLI + Cloudflare DNS. Puerto interno: 8080. SSL automático. |
| 🔥 3.5 | **Evaluar multi-sucursal para polirrubro** — 3 sucursales, lead potencial | 📢 Ventas + 🖥 DEV | Cliente real. Si desarrollamos multi-sucursal básica (~38h), podemos cerrar $240K+ |
| ✅ | **Fix campos numéricos sin decimales** — 9 inputs en 5 archivos + POS quantity + stock adjust | 🖥 DEV + 🔍 QA | Completado 26/7. Step="0.01" en precios, step="any" en cantidades. POS ahora tiene input directo de cantidad. QA PASS. |
| 🟢 9 | **Tests automatizados** | 🖥 DEV | Postergado hasta tener 5+ clientes |
| 🟢 10 | **Docker / CI/CD** | 🖥 DEV | Postergado hasta tener 10+ clientes |

---

## 7. REGLAS PARA DEV

1. **No desarrollar nada que no esté en este roadmap.** Si surge una idea, documentarla abajo en "Ideas en espera", no codearla.
2. **No modificar precios, planes ni lógica de negocio** sin consultar con Ventas (YO).
3. **Prioridad absoluta a Fase 1:** sistema de licencias, trial mode, feature gating, página de planes, integración de pagos. Sin esto no podemos escalar.
4. **El frontend y backend deben seguir funcionando en localhost sin internet.** La validación de licencia debe cachearse mínimo 7 días offline.
5. **Código limpio, sin comentarios, siguiendo el estilo existente** (Python con type hints, TypeScript sin strict mode, estilos inline en React).
6. **No agregar dependencias innecesarias.** Si se necesita una nueva, justificarla.
7. **No tocar la app Android** a menos que se indique explícitamente.
8. **No internacionalizar.** Solo español.
9. **Cuando completes una feature, agregá una línea al final de este archivo** con formato: `- [feature] NOMBRE: descripcion tecnica breve (YYYY-MM-DD)`. No borres ni modifiques entradas existentes.
10. **Prioridades LEGALES vinculantes:** Las directivas del agente Legal en materia de cumplimiento normativo (Ley 24.240, Ley 25.326, Ley 11.723) tienen prioridad sobre cualquier desarrollo técnico. Si Legal dice "esto viola la ley", se detiene y se corrige.
11. **No prometer features que no existen:** Si un frontend o landing page menciona una feature que no está construida (ej: "backup en la nube"), es un riesgo legal por publicidad engañosa (Ley 24.240 arts. 8-9). Reportarlo a Ventas + Legal para corregir.
12. **Consentimiento del usuario:** Toda recolección de datos personales (registro cloud, agente, formularios) debe incluir un checkbox explícito de aceptación de la Política de Privacidad y Términos. No asumir consentimiento tácito.
13. **El EULA clickwrap es obligatorio en primera ejecución:** El sistema debe mostrar los Términos y Condiciones al usuario la primera vez que se ejecuta, requiriendo un clic de "Aceptar" antes de continuar. Sin esto, no hay contrato válido de licencia.
14. **NOTIFICACION NTFY OBLIGATORIA AL FINALIZAR:** Todo agente (DEV, Ventas, Legal, cualquier subagente) DEBE ejecutar `& "E:\TUSTOCK\scripts\send-ntfy.ps1"` al completar su trabajo, justo antes de entregar el resultado al usuario. Parámetros recomendados según el caso:
    - DEV: `-Title "✅ TUSTOCK" -Message "Tarea completada" -Priority 4 -Tags "white_check_mark"`
    - Ventas: `-Title "✅ TUSTOCK Ventas" -Message "Material generado" -Priority 3 -Tags "memo"`
    - Legal: `-Title "⚖️ TUSTOCK Legal" -Message "Documentación actualizada" -Priority 3 -Tags "balance_scale"`
    - UI: `-Title "🎨 TUSTOCK UI" -Message "Diseño actualizado" -Priority 3 -Tags "art"`
    - Dispatcher: `-Title "🔄 TUSTOCK" -Message "Revisión completada" -Priority 3 -Tags "arrows_counterclockwise"`
    Esto aplica a TODOS los agentes, sin excepción.
15. **Legal NO toca código ni el dashboard de Obsidian:** El agente Legal se limita a leer archivos, redactar documentos legales (`.html` en `legal/`), y emitir directivas por escrito. Cualquier modificación a código fuente, archivos de configuración, Markdown de Obsidian o infraestructura debe ser ejecutada por DEV o el Dispatcher. Legal que viola esta regla debe ser reportado inmediatamente.
16. **Marketing NO toca código ni precios:** El agente Marketing crea contenido publicitario en `docs/marketing/` y `obsidian/TU STOCK/06-Marketing/`. NO modifica el producto ni los precios. Cualquier afirmación sobre features debe ser verificada contra la sección 3 (Qué está construido). Si menciona algo que no existe, es publicidad engañosa (Ley 24.240 art. 8-9).
18. **UI NO toca lógica de negocio, backend ni precios:** El agente UX/UI diseña la interfaz — landing page (`docs/index.html`), frontend React (`web/src/`), dashboard local (`monitor/dashboard.html`). NO modifica lógica de negocio, NO crea endpoints, NO cambia precios, NO genera contenido de marketing. Dark theme, mobile-first, copy argentino. Para cambios en features o lógica, coordina con DEV a través del Dispatcher.
17. **SIN MCPs — Regla permanente:** A partir de 12/7/2026, **NO se usan MCPs** (Model Context Protocol) en el proyecto. Ningún agente debe configurar, agregar ni invocar MCPs en opencode.json. Si se necesita información de APIs externas (Mercado Pago, Canva, etc.), se consulta la documentación web directamente o se usa la integración REST ya existente en el código. Excepción: solo el Humano puede autorizar reintroducir un MCP si es estrictamente necesario y no hay alternativa.

### Stack que NO se cambia

- Backend: Python 3.9+ / FastAPI / SQLAlchemy / SQLite
- Frontend: React 18 + Vite + TypeScript (estilos inline, sin Tailwind/CSS modules)
- Android: Kotlin + CameraX + ML Kit (**congelado — EXCEPCIÓN desde 2/8: app Stock en desarrollo para Opción E — toma de stock CSV local. App POS sigue congelada.**)
- Base de datos: SQLite con WAL mode
- Monitor: Vanilla HTML+CSS+JS (sin build step, sin framework)

---

## 8. SPEECH DE VENTAS (VERDAD OFICIAL)

**Frase única:** *"TUSTOCK es el sistema de stock y ventas que funciona sin internet, se paga una sola vez y no necesitás ser técnico para usarlo."*

**Qué decimos que hace:**
- Registrá ventas al instante con el carrito POS
- Sabé cuánto stock tenés de cada cosa en tiempo real
- Escaneá códigos de barras con el celular (app Android incluida)
- Hacé auditorías de stock contando físico vs sistema
- Generá informes diarios de ventas, métodos de pago, productos más vendidos
- Exportá todo a Excel
- **Monitor Remoto (Pro):** Mirá las ventas desde el celular estés donde estés sin estar en el negocio

**Qué NO decimos (porque no existe):**
- No decimos "backup automático en la nube"
- No decimos "sincronización entre sucursales"
- No decimos "múltiples cajeros con perfiles"
- No decimos "integración con Mercado Libre / Tiendanube"

**Manejo si preguntan por cloud:**
> "Todo corre en tu propia PC, así que tus datos no salen de tu negocio. Si querés hacer backup, el sistema te lo permite con un solo clic, y podés guardarlo donde quieras: un pendrive, Google Drive, lo que prefieras."

**Manejo si preguntan por monitor remoto:**
> "Eso es parte del plan Pro. Es una página web con URL fija que se ve desde el celular en cualquier lado. Cada negocio tiene su propio login y solo ve sus datos. No necesita configuración técnica."

**Caso real para contar:**
> "De hecho, hace unos días una clienta con una librería me compró el sistema con monitor incluido. Ella desde su casa ve las ventas del día, el stock bajo y quién le debe plata. Sin tener que estar en el negocio."

---

## 9. CANALES DE VENTA AUTORIZADOS

| Canal | Estado | Prioridad |
|-------|:-----:|:---------:|
| WhatsApp directo a comerciantes locales | 🟢 Activo | 🔥 Alta |
| Boca a boca / referidos de clienta actual | 🟢 Activo | 🔥 Alta |
| Facebook Groups (kiosqueros, almaceneros) | 🟢 Activo — Posts 1, 2 y 3 publicados (11/7, 14/7, 15/7) | 🔥 Alta |
| Mercado Libre | 🟢 Activo — Publicado MLA3596381120 (12/7) | 🔥 Alta |
| Proveedores mayoristas (comisión) | 🔴 Futuro | 🟢 Baja |
| Mercado de apps Tiendanube/Empretienda | 🔴 Futuro | 🟢 Baja |

---

## 10. IDEAS EN ESPERA (NO TOCAR)

> Estas ideas están documentadas pero **no aprobadas para desarrollar**. Solo se considerarán cuando las fases 0-3 estén completas.

- Múltiples idiomas
- Facturación electrónica AFIP
- Integración con Mercado Libre (sincronizar stock)
- App iOS
- Módulo de proveedores con órdenes de compra
- Notificaciones push a Android
- Modo oscuro

---

## 11. REGISTRO DE FEATURES COMPLETADAS (por DEV)

- [feature] MONITOR PREMIUM: Servicio independiente puerto 8091 con FastAPI, cookie-auth, dashboard mobile responsive vanilla HTML+CSS+JS, endpoints read-only (/metrics, /metrics/summary, /health). Expuesto via Cloudflare Tunnel. (2026-06-30) [ventas listo]
- [feature] SCHEMAS PYDANTIC: Creación de server/schemas.py con modelos validados para ProductCreate, ProductUpdate, SaleCreate, StockAdjustment, AuditCreate y más. (2026-06-30)
- [feature] BARCODE: Generación de código de barras Code128 + campo barcode en productos, endpoint público de imagen, búsqueda por barcode, seed con barcodes. (2026-06-30)
- [feature] FIADO: Ventas asociadas a clientes (customer_id en Sale), auto-creación de deuda, selector de cliente en POS, columna en historial. (2026-06-30)
- [feature] PEDIDOS MEJORADO: Método de pago y cliente en aprobación de pedidos. (2026-06-30)
- [feature] ETIQUETA: Imagen de código de barras con nombre + precio debajo, endpoint público sin auth. (2026-06-30)
- [feature] GUIA PDF: Script generar_guia.py que produce Guia de Usuario TUSTOCK.pdf automáticamente. (2026-06-30)
- [feature] CONFIG OPENCODE: opencode.json con agentes dev y ventas, pipeline feature → sales material. (2026-06-30)
- [feature] TIMESTAMPS: Todos los modelos SQLAlchemy now tienen created_at/updated_at. (2026-06-30)
- [feature] LAUNCHER UNIFICADO: scripts/launcher.py reemplaza todos los .bat. Inicia servidor, monitor, tunnel, cloud agent. TUSTOCK.bat con menu de 8 opciones. (2026-06-30)
- [feature] MONITOR CLOUD: API cloud con push del agente local, login multiusuario JWT, dashboard mobile responsive. Desplegado en Railway (`monitor.tustocksoft.com.ar`). (2026-06-30)
- [feature] DASHBOARD ADMIN: Panel de administración de licencias en `/admin`, token separado. Generar keys, ver/revocar/activar licencias, stats por plan, ingresos estimados, trials por vencer. (2026-06-30)
- [feature] MERCADO PAGO: Integración REST en `cloud/payments.py`. Crear preferencias de pago, webhook notification, verificar status. Admin tiene botón "Cobrar MP" y columna de estado de pago. (2026-07-02)
- [feature] VALIDACION CLOUD: Sync de keys al cloud, validate contra API cloud, cache 7d con fallback offline 14d. Middleware bloquea APIs si licencia expirada o inválida. Trial no requiere validación. (2026-07-02)
- [feature] LANDING PAGE: `docs/index.html` — página estática dark theme responsive, GitHub Pages (`tustocksoft.com.ar`). Hero, features, planes, caso real, FAQ, WhatsApp CTA. (2026-07-02)
- [feature] BLOQUEO TRIAL: Middleware bloquea todas las APIs cuando trial vence o no hay licencia. Solo health + license/status + license/activate pasan. (2026-07-02)
- [feature] SUSCRIPCION MP RECURRENTE: `cloud/payments.py` con `create_subscription()` (preapproval), `get_subscription()`, `cancel_subscription()`. Modelo `Subscription` en cloud. Endpoint `POST /api/payments/subscribe` para Suscripcion $8K/mes con cobro recurrente automático. Webhook maneja `topic=preapproval` y `topic=payment`. Admin muestra botón "Suscribir MP" (púrpura) y estado de suscripción (Activa/Cancelada/Pendiente). (2026-07-04)
- [feature] GRACE PERIOD SUSCRIPCION: 7 días de gracia ante pago rechazado de suscripción MP. Webhook `topic=authorized_payment` actualiza `grace_period_end` en cloud. Validate devuelve `subscription_grace_days_left` y `subscription_suspended`. Banner progresivo en frontend (día 0/3/7+). Sistema nunca se bloquea, solo pierde updates + soporte. (2026-07-04)
- [feature] EULA CLICKWRAP: Modal de aceptación de Términos y Condiciones en primera ejecución. Backend: modelo License con `eula_accepted`, endpoint `POST /api/license/accept-eula`. Frontend: componente EulaModal en Layout que bloquea toda interacción hasta aceptar. Endpoints para servir documentos legales: `/api/license/terms`, `/api/license/privacy`, `/api/license/refund`. (2026-07-04)
- [feature] CONSENTIMIENTO REGISTRO CLOUD: Checkbox obligatorio de aceptación de Términos y Política de Privacidad en el formulario de registro del Monitor Cloud. Modelo Business con `terms_accepted`. Backend rechaza registro sin `accepts_terms: true`. (2026-07-04)
- [feature] BAJA DE CUENTA CLOUD: Endpoint `POST /api/business/delete-account` con confirmación por email. Elimina MetricsPush y anonimiza datos del Business (soft-delete con is_active=False). UI en dashboard con botón "Eliminar mi cuenta" y confirmación. Endpoints cloud para docs legales: `/api/licenses/terms`, `/api/licenses/privacy`, `/api/licenses/refund`. (2026-07-04)
- [feature] ADMIN SEPARADO: App independiente en `admin/` (Vite+React, puerto 5174). Removido del web/ principal. Scripts `start-admin.bat` y `stop-admin.bat`. Proxy `/api/admin` a localhost:8090. (2026-07-06) → **Actualizado 2026-07-14:** movido a `E:\TUSTOCK_ADMIN\` fuera del repo.
- [feature] SUBSCRIPTION BANNER: Componente SubscriptionBanner muestra banner progresivo de grace period para suscripciones (día 0/3/7+). Integrado en Layout debajo de TrialBanner. (2026-07-06)
- [feature] DB LOCAL REPARADA: Columnas faltantes agregadas a `tustock.db` via ALTER TABLE: `subscription_grace_days_left`, `subscription_suspended`, `eula_accepted`, `eula_accepted_at`. (2026-07-06)
- [feature] WEBHOOK MP FIX: update_plan_notification_url ahora consulta GET /preapproval_plan/{id} primero para verificar si notification_url ya está seteado. Solo hace PUT si es diferente, evitando error 400 "Properties to update are required". (2026-07-07)
- [feature] CORS CLOUD API: Agregado CORSMiddleware con allow_origins=["*"] en cloud/api.py para permitir llamadas desde el admin panel (localhost:5174) a la cloud API (tustock.up.railway.app). (2026-07-07)
- [feature] FIX PUBLICIDAD ENGAÑOSA: Eliminado "Backup en la nube" de notIncluded del plan Pro en Upgrade.tsx (Ley 24.240 art. 8-9). (2026-07-08)
- [feature] FIX EMAIL PRIVACIDAD: Reemplazado [completar email] por tustock.administracion@gmail.com en sección 13 de politica-de-privacidad.html. (2026-07-08)
- [feature] DUAL MP TOKENS: cloud/config.py exporta MP_ACCESS_TOKEN (Checkout Pro) y MP_SUBS_TOKEN (Suscripciones). cloud/api.py usa el token correcto según operación. Fallback a MP_ACCESS_TOKEN si no hay segundo token. Fix webhook: topic=payment usa MP_SUBS_TOKEN. (2026-07-09)
- [feature] TELENOTAS: Bot de Telegram para capturar ideas vía texto/audio. Transcribe audios con Whisper, guarda en inbox/ diario, clasifica por proyecto usando Groq LLM. Servicio 24/7 en Windows. (2026-07-09)
- [feature] ARGENTINIZACIÓN DE PROMPTS: Los 3 prompts de imagen para Facebook Groups reescritos con ambientación argentina auténtica (kiosco con persianas, mosaico, alfajores, yerba, lotería; librería con cuadernos Rayita, cartelito de "abierto"; mate en la escena de precio). Actualizado en Dashboard.md, Tareas Humanas.md, Campaña Salida al Mercado.md y plan-imagenes-fb.md. (2026-07-10)
- [feature] PRIMER POST EN FACEBOOK: Publicado Post 1 ("¿Cuánto stock tenés AHORA?") en 3 grupos de Facebook de 30k+ miembros c/u. Copy auditado por Legal+Marketing. (2026-07-11)
- [feature] GUIA ML EN OBSIDIAN: Copiada `docs/marketing/guia-mercadolibre.md` a obsidian/02-Ventas/ con prompts para 4 imágenes ML (1200x1200), instrucciones de captura de screenshots y prompts para Gemini mockups. (2026-07-11)
- [feature] ML IMAGES LISTAS: Las 4 imágenes de Mercado Libre generadas via Gemini en Chrome usando prompts con mockups de laptop sobre fondo oscuro TUSTOCK. Listas para publicar. (2026-07-11)
- [feature] ML PUBLICADO: Listing MLA3596381120 / MLAU4283798573 publicado en Mercado Libre con título, categoría, precio $80K, 5 imágenes, descripción plain text, envío, pagos, envío gratis. Verificado contra HTML descargado. (2026-07-12)
- [feature] PROGRAMA DESPEGUE: Análisis completo del Programa Despegue de ML — $45K ARS garantía (recuperable 100%), $45K publicidad gratis, reputación verde claro. Documentado en `obsidian/02-Ventas/Programa Despegue ML.md`. Pendiente activar. (2026-07-12)
- [feature] DOMINIO Y DNS: tustocksoft.com.ar comprado en nic.ar. DNS delegado a Cloudflare (free). Landing page servida en dominio propio con HTTPS via GitHub Pages. CNAME configurado via API. (2026-07-13)
- [feature] UI REDESIGN FASES 0-2: design tokens, layout responsive con hamburger menu, sidebar agrupada, y componentes UI reutilizables (Modal, DataTable, Button, Card, Badge, EmptyState, Skeleton) (2026-07-14)
- [feature] RATE LIMITING + AUDIT LOG: Rate limiting en memoria para login (5/15min) y register (3/30min) con HTTP 429. Audit log en JSONL para 9 eventos sensibles (login, register, push, license sync/validate, subscriptions, account deletion). cloud/audit.py nuevo. (2026-07-14)
- [feature] LANDING STITCH: Landing page reconciliada desde Google Stitch (code.html + DESIGN.md). CSS inline puro, Stitch design system (dark theme, glass effects, gradient hero), SVG inline, responsive, Inter font. 44KB. (2026-07-14)
- [feature] MONITOR STITCH: Dashboard + login del Monitor Premium rediseñados con Stitch design system. Dark theme #10131a, glass cards, backdrop-filter blur, KPI cards, progress bars en stock, fade-in animations, auto-refresh 30s, responsive. dashboard.html 21KB, LOGIN_HTML en app.py actualizado. (2026-07-14)
- [feature] MONITOR CLOUD STITCH: Dashboard del Monitor Cloud (cloud/dashboard.html) rediseñado con Stitch dark theme. Glass cards, KPI grid, progress bars, topbar con indicador de último push, login/register con tabs. (2026-07-14)
- [feature] ADMIN STITCH: Dashboard de administración (admin/src/Admin.tsx) rediseñado con Stitch dark theme. Inputs dark, cards glass, botones #4d8eff, tags translúcidos. Solo cambios de estilo, 0 cambios en lógica. (2026-07-14)
- [fix] EULA MODAL DEADLOCK: 4 bugs corregidos — (1) refresh() no retornaba promise, (2) handleAccept no awaited refresh, (3) submitting nunca se reseteaba en éxito, (4) si POST aceptaba pero refresh fallaba, usuario quedaba en deadlock. Backend ahora retorna 200 si ya aceptó. (2026-07-14)
- [fix] EULA MODAL DEADLOCK: Modal de ToS bloqueaba frontend indefinidamente. 4 bugs: (1) refresh() no retornaba promise, no se podía awaiting; (2) handleAccept no awaiting refresh post-POST; (3) submitting nunca se reseteaba en éxito; (4) si POST aceptaba pero refresh fallaba, usuario quedaba en deadlock permanente. Backend: accept_eula() retorna dict con {ok, already}, caso "ya aceptado" retorna 200 en vez de 400. Frontend: refresh() retorna promise, handleAccept awaits refresh, maneja "already" como éxito, muestra error message al usuario. (2026-07-14)
- [feature] ADMIN EXTERNO: App admin movida de `admin/` (repo) a `E:\TUSTOCK_ADMIN\` (fuera del repo). `admin/` agregado a `.gitignore`. Scripts `start-admin.bat` y `stop-admin.bat` actualizados para apuntar a la nueva ubicación. Credentials y código admin ya no se commitean. (2026-07-14)
- [feature] SECRETS VIA .ENV: `server/.env` creado con tokens reales. Defaults en `server/config.py` cambiados a `""`. Startup check con `sys.exit(1)` si falta TUSTOCK_TOKEN. `.gitignore` actualizado con `*.env` y `server/.env`. Tokens ya no hardcodeados en código fuente. (2026-07-14)
- [fix] DASHBOARD LINKS: `<a href>` reemplazado por `<Link to>` de React Router en Dashboard.tsx. Corregía recarga completa de página en cada navegación. (2026-07-15)
- [fix] DASHBOARD STITCH: Rediseño Stitch aplicado a Dashboard — dark theme, glass cards, KPI cards, Material Icons, Geist Mono, progress bars, fadeIn animations. (2026-07-15)
- [fix] LEGAL CLOUD FIXES: Email `kamiikasee05@gmail.com` → `tustock.administracion@gmail.com`, marca `Kamiikaze Desarrollos` → `TUSTOCK`, URLs dominio actualizado, checkbox consentimiento agregado, deudores anonimizados. (2026-07-15)
- [fix] LIMPIEZA UI: 14 componentes UI no utilizados eliminados (GlassPanel, KPICard, MiniBarChart, QuickAction, Toggle, CustomerDrawer, Modal, DataTable, Button, Card, Badge, EmptyState, Skeleton, index.ts). recharts y lucide-react desinstalados. Build -30KB. (2026-07-15)
- [feature] TERCER POST EN FACEBOOK: Post 3 (cierre de secuencia — "¿Y si el mes que viene arrancás con todo bajo control?") publicado en grupos de Facebook. Copy listo en `docs/marketing/post3-facebook.md`. (2026-07-15)
- [fix] LANDING MOCKUP: Placeholder SVG genérico reemplazado por dashboard mockup realista — titlebar con dots macOS, 3 KPI cards, tabla de últimas ventas con productos argentinos, gráfico de barras semanal CSS puro. (2026-07-15)
- [feature] POS REMOTO FASE 1: Venta remota directa desde Monitor Cloud. Command Queue (CommandQueue en cloud) — agent lee comandos pendientes y ejecuta en server local. Crea venta, descuenta stock, push real-time. Tab POS en dashboard (buscador, carrito, selector de pago). Auth via Bearer token. Webhook MP con HMAC-SHA256. 6 endpoints cloud + 1 endpoint local. Validado end-to-end con 15 gotitas de gel. (2026-07-25)
- [fix] REGISTER-FROM-INSTALL: Endpoint ahora retorna API key existente cuando el email ya está registrado (en vez de 409). Permite re-ejecutar configurar.bat sin perder acceso. (2026-07-25)
- [fix] CONFIGURAR.BAT JSON: Fix cmd.exe tritura comillas y {}. Ahora usa curl -d @file. (2026-07-25)
- [fix] 4 BUGS SEGURIDAD: (1) backup_enabled False en Pro, (2) remote_orders con auth, (3) push_async post-venta remota, (4) agent pushea pending_orders. (2026-07-25)
- [fix] DECIMALES FRONTEND: 9 inputs numéricos agregado step (0.01 en precios, 1 en min_stock, any en cantidades). POS Sales.tsx: input directo de cantidad con step="any" (antes solo +/-1). Products.tsx: input de cantidad en stock quick-adjust. Presupuestos: min="0.01". Customers: step="0.01" en pago. ScannerConnect: step="0.01" en precios. Backend sin cambios (ya era Float). QA PASS. (2026-07-26)
- [feature] FECHAS DE VENCIMIENTO: Product model con campo `expiry_date` (Date, nullable). Schemas actualizados (ProductCreate, ProductUpdate, ProductOut). Endpoint GET /api/products?near_expiry=N. Dashboard alerta productos próximos a vencer. Columna "Vence" en tabla Products con badges naranja/rojo. Filtro de próximos a vencer. Cloud push incluye near_expiry_count. (2026-07-29)
- [feature] ANALYTICS SEMANALES: Endpoint `GET /api/admin/analytics/weekly` en cloud API con data de todos los negocios (7 días). Métricas por negocio: pushes, ventas, métodos de pago, top productos, inventario, stock bajo/cero, clientes, deudores, pedidos pendientes. Health status (healthy/warning/inactive). Script `scripts/weekly_report.py` genera markdown con resumen, salud, ranking, top global y alertas + ntfy. (2026-07-29)
- [feature] STOCK INICIAL AL CREAR PRODUCTO: Nuevo campo `initial_stock` en formulario de creación. Schema ProductCreate con `initial_stock: float = 0.0`. Backend: si >0 llama `adjust_stock()` con movement_type="adjustment". Frontend: input numérico con subtext, toast con nombre + unidades, foco vuelve a Nombre. Build verificado. (2026-07-29)
- [feature] ANALYTICS SEMANALES: Endpoint `GET /api/admin/analytics/weekly` en cloud API con data de todos los negocios (7 días). Métricas por negocio: pushes, ventas, métodos de pago, top productos, inventario, stock bajo/cero, clientes, deudores, pedidos pendientes. Health status (healthy/warning/inactive). Script `scripts/weekly_report.py` genera markdown con resumen, salud, ranking, top global y alertas + ntfy. (2026-07-29)
- [feature] IMPORT CSV TOMA DE STOCK: `server/services/csv_import.py` (nuevo) — parseador CSV RFC 4180 (UTF-8 BOM/UTF-16, header opcional, duplicados aditivos, resolve por barcode/code). Endpoints `POST /api/audits/import-csv` (sube CSV → crea audit draft con subset, NO corrige) y `POST /api/audits/import-register` (registra producto no existente con código TST+10, valida licencia). `create_audit` acepta `product_ids` opcional. Fix `complete_audit`: crea `CurrentStock` si falta (productos importados). UI `web/src/pages/ImportStock.tsx` (ruta `/stock-import`, link sidebar "Importar stock"): upload → preview editable (cantidades + diferencias) → registrar productos nuevos desde errores → "Aplicar correcciones". `api.upload()` con FormData (el client siempre mandaba Content-Type json). QA integración completo (audit 2: register+edit+complete, stock final 9/2/7). Build ✅ 331.54 kB. (2026-08-02)
- [android] APP STOCK CSV LOCAL (Opción E Fase 1): `android/app/src/stock/` reescrito — la app Stock genera CSV local en vez de auditoría server-side. `CsvToma.kt` (nuevo): CSV writer a mano con BOM `\uFEFF` + header, append, quoting RFC 4180, archivo `toma-stock-YYYYMMDD-HHMM.csv` en `filesDir/tomas/`. `ApiClient.kt`: `ProductResponse` con `barcode`, `ProductListResponse` paginado, `downloadCatalog()` (loop page_size=200). Catálogo cacheado en `filesDir/tomas/catalogo.json` (usa cache si no hay red, arranca igual sin cache con `(no registrado)`). Flujo: "Iniciar toma" → descarga catálogo → escanear → resuelve nombre local → cantidad ≥ 1 → **append sin red**. Session bar con contador Líneas/Productos + nombre CSV + "Finalizar y enviar" (share sheet ACTION_SEND + EXTRA_STREAM vía FileProvider `com.tustock.stock.fileprovider`, type text/csv) + "Nueva toma". Sesión persistente en SharedPreferences (retoma tras crash, sin duplicar). Alta de producto sigue solo online. Rechaza cantidad < 1 (fix bug descuento a cero). NO compilado localmente (sin Android SDK en la PC) — build vía GitHub Actions al pushear `android/**`. Commit `83c5cc7`. (2026-08-02)
- [feature] FLUJO UNIFICADO CARGA INICIAL + AUDITORÍA (Opción E completa): mismo CSV/app para ambos casos. App: al escanear barcode **fuera del catálogo** → muestra "Producto nuevo" + campo **nombre** (prefill con último nombre) → escribe nombre real al CSV. Import: `POST /api/audits/import-register-batch` registra en lote todos los no-registrados (code TST+10, precio $0, conteo = stock inicial). UI: botón **"Registrar todos los pendientes"** + toast "Todos los productos son nuevos" para CSV 100% nuevo. Backend: `create_audit` acepta `product_ids=[]` (vacío = 0 productos); `import_stock_csv` crea auditoría aunque sea 100% nuevos; parser normaliza `(no registrado)` → `""`; `register_products_batch` con suma de duplicados y límite del plan por fila (200, no 403 global). QA: 6 casos validados (mixto, carga inicial 100% nueva, límite de plan, edición preview). Commits `55ea8c7`, `b772ec9`. (2026-08-02)
- [analisis] CARGA DE PRECIOS POSTERIOR (punto C): Documento `docs/analisis-carga-inicial-precios-2026-08-02.md`. C1: import precios por CSV (`barcode;precio[;costo]`) ~6h. C4: bloquear venta a `selling_price <= 0` en POS ~1h (red de seguridad). Total ~7h. Pendiente aprobación del humano para desbloquear venta inmediata tras carga inicial. (2026-08-02)

---
## 12. HISTORIAL DE DECISIONES

| Fecha | Decisión | Quién |
|------|----------|:-----:|
| 2026-06-30 | Precio Básico fijado en $60K ARS único | Ventas |
| 2026-06-30 | Suscripción fijada en $6K ARS/mes | Ventas |
| 2026-06-30 | Pro fijado en $120K ARS único (futuro) | Ventas |
| 2026-06-30 | **PRECIOS ACTUALIZADOS post-validación**: Básico $80K, Suscripción $8K/mes, Pro $160K (nuevos clientes). Clienta premium mantiene precio original. | Ventas + Humano |
| 2026-06-30 | Trial: 30 días o 50 productos, sin informes | Ventas |
| 2026-06-30 | Feature gating backend + frontend para licencias | DEV (pendiente) |
| 2026-06-30 | Prioridad Fase 1 sobre Fase 2-4 | Ventas |
| 2026-06-30 | Android app congelada (no tocar) | Ventas |
| 2026-06-30 | No prometer cloud backup ni multi-PC | Ventas |
| 2026-06-30 | Entrevista clienta librería para validación de mercado | Humano |
| 2026-06-30 | Fase 4 (Monitor Premium) adelantada SOLO para clienta premium ($60K entry + $6K/mes) | Ventas |
| 2026-06-30 | Monitor Premium implementado: puerto 8091, login propio, dashboard mobile, Cloudflare Tunnel | DEV |
| 2026-06-30 | **PRIMER VENTA CONCRETADA:** Librería, $60K entry + $6K/mes suscripción. Sin objeciones. Precio validado. | Humano + Ventas |
| 2026-06-30 | Fase 0 considerada COMPLETA (mercado validado con venta real) | Ventas |
| 2026-06-30 | Transición a Fase 1: prioridad licencias + trial + feature gating | Ventas |
| 2026-06-30 | **Monitor Cloud aprobado**: Arquitectura híbrida — agente local pushea datos a API cloud con URL fija. Reemplaza Cloudflare Tunnel. Login multiusuario. Desarrollo en Fase 5. | Ventas + Humano |
| 2026-06-30 | **Monitor Cloud desplegado en Railway**: `monitor.tustocksoft.com.ar` (custom domain via Cloudflare). API push-based, agente local funcionando con datos reales, dashboard multiusuario. Puerto interno: 8080. | DEV + Humano |
| 2026-06-30 | **Propuesta de reforma de tiers**: refrashear alrededor de "pago único vs mensual". Matriz de gating simplificada (Trial/Básico/Suscripción/Pro) propuesta por DEV, pendiente de aprobación por Ventas. | DEV + Ventas |
| 2026-06-30 | **Matriz de gating APROBADA** por Ventas. Export Excel va en todos los planes pagos. Diferencial: Monitor Cloud + soporte prioritario. Ajuste pendiente en código: `export_enabled: true` para Básico. | Ventas |
| 2026-06-30 | **Auditoría completa**: revisión de admin routes, frontend, launcher, TUSTOCK.bat. Fixes aplicados: timing-safe token compare, stop.bat PID, autostart quick mode, favicon guard, duplicate query eliminado. | DEV |
| 2026-07-02 | **Mercado Pago**: integración REST construida. Crear preferencias, webhook, verificar status. Botón "Cobrar MP" en admin. Pendiente configurar `TUSTOCK_MP_TOKEN` en Railway. | DEV |
| 2026-07-02 | **Validación cloud**: licencias se validan cada 7 días contra cloud. Cache offline de 14 días. Trial no requiere validación. Admin sync keys al generar. | DEV |
| 2026-07-02 | **Landing page**: `docs/index.html` desplegada via GitHub Pages. Dark theme responsive con planes, caso real, FAQ y WhatsApp CTA. | DEV |
| 2026-07-02 | **Bloqueo por licencia**: middleware bloquea APIs cuando trial vence o licencia revocada. init_license no recrea trial en reinicio. | DEV |
| 2026-07-02 | **Railway plan hobby**: decisión de pagar $5/mes para 24/7. La validación cloud depende de uptime. | Humano |
| 2026-07-02 | **Días de gracia definidos**: 7 días tras pago rechazado. Sistema nunca se bloquea (pierde updates + soporte). Banner progresivo día 0/3/7. | Ventas |
| 2026-07-04 | **Suscripciones MP vía Preapproval API**: `POST /preapproval` con `auto_recurring` (1 mes, $8K). Pendiente: manejar `topic=authorized_payment` para trackear cada cobro mensual, mapear status `paused` (suspendida), y crear `preapproval_plan` reusable como template centralizado de precio/frecuencia. Bloqueante real: token MP no configurado en Railway. | DEV |
| 2026-07-04 | **Suscripción MP — Grace period + banner**: Webhook `topic=authorized_payment` implementado. Si pago rechazado → `grace_period_end = now+7d`. Validate endpoint retorna `subscription_grace_days_left` y `subscription_suspended`. Banner progresivo en frontend (día 0/3/7+). Modelos actualizados en cloud y local. | DEV |
| 2026-07-04 | **Documentación legal completa**: Términos y Condiciones + EULA, Política de Privacidad, Política de Reembolso en `legal/`. Footer de landing page actualizado con links legales. Fix: "Backup en la nube" removido de `Upgrade.tsx`. Checkbox de consentimiento y baja de cuenta cloud pendientes de implementar. | Legal |
| 2026-07-04 | **EULA Clickwrap**: Modal en primera ejecución. Modelo License con `eula_accepted`. Endpoint `POST /api/license/accept-eula`. Componente EulaModal en Layout. Endpoints para servir docs legales: `/api/license/terms`, `/api/license/privacy`, `/api/license/refund`. | DEV |
| 2026-07-04 | **Consentimiento registro cloud**: Checkbox obligatorio en formulario de registro del Monitor Cloud. Modelo Business con `terms_accepted`. Backend rechaza registro sin `accepts_terms: true`. | DEV |
| 2026-07-04 | **Baja de cuenta cloud**: Endpoint `POST /api/business/delete-account` con confirmación por email. Soft-delete del Business + eliminación de MetricsPush. UI en dashboard con botón "Eliminar mi cuenta". | DEV |
| 2026-07-05 | **Dispatcher**: Auditoría completa del código. Se detectaron 4 bugs funcionales y 5 observaciones técnicas. Documentados en sección 14. | Dispatcher |
| 2026-07-05 | **Dispatcher**: Vault de Obsidian creado en `E:\TUSTOCK\obsidian\`. Dashboard.md centraliza navegación. Separación por áreas: Producto, Ventas, Legal, Técnico, Decisiones. | Dispatcher |
| 2026-07-06 | **MP Suscripciones bloqueado en producción**: No se puede crear preapproval directamente por API con la cuenta actual (401/500). Los planes (preapproval_plan) sí funcionan. Decisión: usar Plan compartido con link fijo. Cliente se suscribe por MP, admin vincula manualmente. Se necesitan 2 apps de MP porque el selector de producto es excluyente (una para Checkout Pro, otra para Suscripciones). | DEV + Humano |
| 2026-07-06 | **Suscripción vía Plan compartido implementada**: Flujo completo — GET /api/plan/subscription, POST /api/plan/update-webhook, POST /api/plan/link-subscription. Webhook mejorado para crear Subscription desde suscripción del plan. Admin.tsx: sección Plan de Suscripción MP con link compartido, lista de suscripciones sin vincular, botón Vincular. | DEV |
| 2026-07-06 | **BUGS FIXED**: 4 bugs funcionales del MEMORY.md sección 14 corregidos + timing-safe en auth.py + cleanup (unused variables, data_id extraction). | DEV |
| 2026-07-06 | **Plan activo ID**: `27a1162efe9e47e68cd1349307b02eb2` — link de suscripción `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=27a1162efe9e47e68cd1349307b02eb2` — Creado desde app TUSTOCK Suscripciones (cuenta nueva). Webhook configurable desde admin panel. | DEV + Humano |
| 2026-07-06 | **Modelo híbrido MP confirmado**: Checkout Pro para pagos únicos (Básico/Pro) + Plan compartido para suscripciones. Dos apps de MP separadas (selector de producto excluyente). Admin vincula suscripciones manualmente desde el panel. | DEV + Humano + Dispatcher |
| 2026-07-06 | **Admin separado del proyecto**: App independiente en `admin/` (Vite+React, puerto 5174). Removido del web/ principal y de App.tsx. Scripts `start-admin.bat` y `stop-admin.bat`. `.gitignore` actualizado para `admin/dist/`. | DEV |
| 2026-07-06 | **DB local reparada**: Columnas faltantes (`subscription_grace_days_left`, `subscription_suspended`, `eula_accepted`, `eula_accepted_at`) agregadas a `tustock.db` via ALTER TABLE. El modelo License ya las tenía pero no existían en la DB física. | DEV |
| 2026-07-07 | **Webhook MP fix**: update_plan_notification_url ahora verifica GET primero, solo hace PUT si notification_url es diferente. Evita error 400. | DEV |
| 2026-07-07 | **CORS cloud API**: Agregado CORSMiddleware para permitir llamadas desde admin panel (localhost:5174 → tustock.up.railway.app). | DEV |
| 2026-07-08 | **Revisión legal completa**: Legal auditó Términos, Privacidad, Reembolso, landing page, EULA clickwrap, consentimiento cloud, baja de cuenta y Upgrade.tsx. Detectó publicidad engañosa en Upgrade.tsx (Backup en la nube — Ley 24.240 art. 8-9) y email placeholder en Política de Privacidad. Directivas vinculantes emitidas para DEV. | ⚖️ Legal |
| 2026-07-08 | **Fix publicidad engañosa**: DEV eliminó "Backup en la nube" de notIncluded del plan Pro en Upgrade.tsx (directiva Legal). | 🖥 DEV |
| 2026-07-08 | **Fix email privacidad**: DEV reemplazó [completar email] por tustock.administracion@gmail.com en politica-de-privacidad.html (directiva Legal). | 🖥 DEV |
| 2026-07-09 | **Guía registro AAIP**: Dispatcher elaboró guía paso a paso en `obsidian/TU STOCK/03-Legal/Registro AAIP.md` para que el humano registre la base de datos del Monitor Cloud ante el RNBDP (AAIP). | Dispatcher |
| 2026-07-09 | **Agente Marketing**: Creado en opencode.json. Crea contenido y campañas para salida al mercado. Trabaja con Ventas. No toca código ni precios. | Dispatcher |
| 2026-07-09 | **Dominio tustock.com.ar**: Prioridad 🔥 1. Humano consigue capital ($8.500). Marketing prepara campaña para cuando el dominio esté activo. | 🧑 HUMANO + 📢 MARKETING |
| 2026-07-09 | **Cuentas MP y ML dedicadas al proyecto**: Creadas cuentas nuevas de Mercado Pago y Mercado Libre exclusivas para TUSTOCK. Se deja de usar la cuenta personal del humano. Las apps de MP (Checkout Pro y Suscripciones) deben crearse desde la cuenta nueva para tokens exclusivos. Tokens: ver env vars `TUSTOCK_MP_TOKEN` y `TUSTOCK_MP_SUBS_TOKEN`. | 🧑 HUMANO |
| 2026-07-09 | **Grupos de Facebook activos**: Humano se agregó a grupos de kiosqueros/almaceneros para publicitar TUSTOCK. Marketing crea copies para publicación. | 🧑 HUMANO + 📢 MARKETING |
| 2026-07-09 | **Dual MP tokens**: Código actualizado para soportar dos tokens de MP (Checkout Pro + Suscripciones). Env vars: TUSTOCK_MP_TOKEN y TUSTOCK_MP_SUBS_TOKEN. Fallback automático. | 🖥 DEV |
| 2026-07-09 | **TELENOTAS creado**: Bot de Telegram para capturar ideas. Transcribe audios, guarda en inbox/, clasifica por proyecto con Groq LLM. Servicio 24/7. | 🧑 HUMANO + 🖥 DEV |
| 2026-07-10 | **NO a farmacia multi-sucursal**: Se rechaza oportunidad de farmacia con 3 sucursales ($15M/mes facturación). No estamos preparados técnica ni comercialmente. El gap es abismal: falta AFIP, ANMAT, obras sociales, multi-sucursal, lotes/vencimiento, multi-usuario. Requeriría 10-15 meses de desarrollo y $6.5M-9.75M ARS. Nos mantenemos en mercado original (kioscos, librerías, almacenes). | 🧑 HUMANO + Dispatcher |
| 2026-07-10 | **Auditoría legal de prompts y copies**: Marketing + Legal revisaron los 3 prompts de imagen y 3 copies de Facebook. Legal emitió 4 directivas vinculantes (D1-D4) corregidas: "3 segundos" → "al instante", "30 días gratis" → con aclaración "(hasta 100 productos)", "$300.000+" → "cientos de miles", "Sus empleados" → "Tomá pedidos". También se corrigió "Hace 2 semanas" → "Hace unas semanas". Dictamen en `docs/legal/dictamen-prompts-imagenes.md`. | ⚖️ Legal + 📢 Marketing |
| 2026-07-10 | **TODOS LOS MCPs DESACTIVADOS**: Se eliminaron todos los MCPs de opencode.json (Mercado Pago, Canva, Nano Banana, Browser). Regla permanente: NO se usan MCPs. Si se necesita info de APIs, se consulta documentación web o se usa integración REST existente. Excepción: solo el Humano puede autorizar reintroducir un MCP si es estrictamente necesario. | 🧑 HUMANO + Dispatcher |
| 2026-07-10 | **ARGENTINIZACIÓN DE PROMPTS**: Los 3 prompts de imagen reescritos con ambientación argentina auténtica. Post 1: kiosco argentino con persianas, mosaico, lotería, alfajores. Post 2: librería con cuadernos Rayita, cartelito de "abierto". Post 3: mate en mostrador. Actualizados en todos los archivos de Marketing y Ventas. | 🧑 HUMANO + Dispatcher |
| 2026-07-11 | **PRIMER POST EN FACEBOOK PUBLICADO**: Post 1 ("¿Cuánto stock tenés AHORA?") publicado en 3 grupos de Facebook de 30k+ miembros c/u. Copy+lienzo auditado por Legal+Marketing. | 🧑 HUMANO + Dispatcher |
| 2026-07-14 | **SEGUNDO POST EN FACEBOOK PUBLICADO**: Post 2 (caso testimonial — clienta librería) publicado en grupos de Facebook. Copy+imagen lista. | 🧑 HUMANO |
| 2026-07-11 | **GUIA ML EN OBSIDIAN**: Guía de Mercado Libre movida a `obsidian/02-Ventas/` con prompts para 4 imágenes ML + instrucciones de captura + prompts Gemini. | 🧑 HUMANO + Dispatcher |
| 2026-07-11 | **IMÁGENES ML GENERADAS**: Las 4 imágenes de Mercado Libre listas (portada, dashboard mockup, POS mockup, checklist) generadas vía Gemini en Chrome. Pendiente publicar en ML. | 🧑 HUMANO |
| 2026-07-12 | **ML PUBLICADO**: Listing MLA3596381120 / MLAU4283798573 publicado en Mercado Libre. Título "Sistema Gestión Stock Ventas Kiosco Almacén PC", categoría Software, $80.000, 5 imágenes, envío gratis, pagos transferencia/MB/efectivo. Verificado contra HTML descargado. | 🧑 HUMANO + Dispatcher |
| 2026-07-12 | **PROGRAMA DESPEGUE ANALIZADO**: Programa para nuevos vendedores de ML. Garantía $45K ARS (recuperable 100%), $45K publicidad gratis, reputación verde claro, 365 días. Riesgo bajo para producto digital. Pendiente activar por el humano. | 🧑 HUMANO + Dispatcher |
| 2026-07-13 | **DOMINIO CONFIGURADO**: tustocksoft.com.ar comprado en nic.ar. DNS delegado a Cloudflare (free). Landing page servida con HTTPS via GitHub Pages. CNAME configurado via API. 19 URLs actualizadas en docs/marketing + obsidian. | 🧑 HUMANO + 🖥 DEV |
| 2026-07-14 | **Agente UX/UI creado**: Agente especializado en interfaz de usuario — landing page, frontend React, dashboard local. Dark theme, mobile-first, copy argentino. Archivo `.opencode/agent/ui.md`. Reglas en MEMORY.md actualizadas. | 🧑 HUMANO + Dispatcher |
| 2026-07-14 | **Seguridad Cloud API**: Rate limiting en memoria (login 5/15min, register 3/30min, HTTP 429) + audit log JSONL para 9 eventos sensibles. `cloud/audit.py` nuevo, `cloud/api.py` modificado. | 🖥 DEV |
| 2026-07-14 | **Stitch Design System aplicado a TODO**: Landing, Monitor Premium, Monitor Cloud y Admin Dashboard rediseñados con dark theme #10131a, glass effects, Inter font. Unificación visual completa del ecosistema TUSTOCK. | 🎨 UI |
| 2026-07-14 | **EULA deadlock fix**: 4 bugs encadenados causaban deadlock permanente del modal de ToS. refresh() no retornaba promise, handleAccept no awaited refresh, submitting no se reseteaba, backend retornaba 400 si ya aceptabas. Todo corregido. | 🖥 DEV |
| 2026-07-14 | **Auth roto por security audit**: Commit 21b09bb cambió TUSTOCK_TOKEN default a "" pero nunca se creó .env. Frontend hardcodea "tustock-local-token". Resultado: 401 en todos los endpoints, sistema inutilizable. Default restaurado. | 🖥 DEV + Dispatcher |
| 2026-07-14 | **Feedback de usuario**: Rediseño del frontend (React app principal) es "muy sutil". Monitor Cloud y Landing les gustó. Mañana UI genera prompt Stitch para rediseñar el frontend completo. | 🧑 HUMANO |
| 2026-07-14 | **Prompt Stitch frontend**: Documento completo de especificación de diseño (`docs/stitch-frontend-prompt.md`) generado por UI. 20 secciones: tokens, componentes, páginas, animaciones, mobile-first, copy voseo. Listo para ser usado por Stitch o cualquier herramienta de código para rediseñar el frontend React completo. | 🎨 UI |
| 2026-07-14 | **Admin movido a E:\TUSTOCK_ADMIN\**: App admin fuera del repo. `admin/` agregado a `.gitignore`. Scripts `start-admin.bat` y `stop-admin.bat` actualizados. Credentials y código admin ya no se commitean. | 🖥 DEV |
| 2026-07-14 | **Secrets via .env**: `server/.env` creado con tokens reales. Defaults en `server/config.py` cambiados a `""`. Startup check con `sys.exit(1)` si falta TUSTOCK_TOKEN. `.gitignore` actualizado con `*.env` y `server/.env`. Tokens ya no hardcodeados en código fuente. | 🖥 DEV |
| 2026-07-14 | **REDISEÑO STITCH COMPLETADO**: Frontend React rediseñado con Stitch design system — dark theme #10131a, glass effects, Material Icons, Geist Mono para datos, KPI cards, bento grid, animations. 25+ archivos modificados. Build exitoso. | 🎨 UI + 🖥 DEV |
| 2026-07-14 | **FIX SIDEBAR OVERSIZED**: Sidebar corregida — nav flat sin group labels (~144px saved), alerts removidos (~100px saved), mobile width 260→240px, logo fontWeight 700→600, user card border-radius 24→12px. Total ~240px height reduction. | 🎨 UI + 🖥 DEV |
| 2026-07-14 | **Sales POS compactado**: Total fontSize 40→22px, panel cobro 400→320px, botón cobrar padding/size reducido, tabs e íconos compactados, historial th/td paddings reducidos, método de pago grid más apretado. | 🖥 DEV |
| 2026-07-14 | **Products tab REBUILD completo**: UI reconstruyó toda la página desde cero — th 11px/8px-12px, td 13px/8px-12px, nombre 13px bold, precio 13px data, stock 14px bold, badges 10px pill, acciones 16px icons/4px padding, barcode 48×32, paginación 13px/6px-14px, stats 18px. Row height ~40-44px consistente. | 🎨 UI |
| 2026-07-14 | **Dashboard compactado**: Low stock table — header 11px uppercase, td 8px/12px, nombre 13px, código 11px, stock data 13px, badges 10px, icon 16px en 32×32 box. | 🖥 DEV |
| 2026-07-14 | **Server fix**: Working directory incorrecto causaba ModuleNotFoundError al reiniciar. Servidor necesita correr desde `E:\TUSTOCK\server`, no `E:\TUSTOCK`. | 🖥 DEV + Dispatcher |
| 2026-07-14 | **UI sizing iterativo lección**: No hacer fixes incrementales de UI — el usuario ve inconsistencia cuando cada fix cambia 1-2px. Mejor reconstruir desde cero con sizing consistente (como hizo UI con Products). | Dispatcher |
| 2026-07-14 | **EULA flash fix**: Modal de ToS aparecía brevemente al navegar. Causa: `<a href="/route">` causaba recarga completa de página, reseteando `useLicense()`. Fix doble: (1) Layout.tsx `window.location.pathname` → `useNavigate()`, (2) EulaModal.tsx guard `if (loading) return null`, (3) TrialBanner/SubscriptionBanner/Reports: `<a href>` → `<Link to>` de React Router. | 🖥 DEV |
| 2026-07-14 | **Subdominio Monitor Cloud**: `monitor.tustocksoft.com.ar` configurado via Railway CLI + Cloudflare DNS. Puerto interno: 8080. SSL automático via Let's Encrypt. Railway CLI (`railway status`, `railway domain`) confirma dominio ACTIVE. | 🧑 HUMANO + Dispatcher |
| 2026-07-15 | **Auditoría + corrección completa**: DEV + Legal auditores en paralelo. 1 bug crítico (Dashboard links), 7 menores, 4 faltas legales urgentes (email incorrecto, marca inconsistente, checkbox consentimiento roto, PII visible). Todo corregido. Build verificado. -30KB. | 🖥 DEV + ⚖️ Legal + Dispatcher |
| 2026-07-21 | **Dispatcher NO codifica**: El humano reprendió al Dispatcher por hacer trabajo de DEV (bugs de instalación, fixes de código). El Dispatcher es coordinador/orquestador. Toda tarea técnica de código DELEGADA a DEV. Regla reforzada. | 🧑 HUMANO + Dispatcher |
| 2026-07-22 | **Checklist de instalación creado**: 10 puntos + tabla de errores comunes + flujo definitivo. resultado de 2 instalaciones reales. Documentado en MEMORY.md sección 15. | Dispatcher |
| 2026-07-22 | **configurar.bat fix**: Token fijo `tustock-local-token` en vez de random. El frontend hardcodea este token. Si el .env tiene otro, todo da 401. | Dispatcher |
| 2026-07-22 | **Cloud sync obligatorio**: Keys generadas en admin deben sync al cloud antes de que el cliente active. Sin sync, activate_license falla con "Clave inválida". | Dispatcher |
| 2026-07-22 | **Tray icon aprobado**: TUSTOCK.exe sin ventana de terminal. Icono en bandeja del sistema. Click abre navegador. Servidor en thread. pystray + PIL para icono dinámico. Fallback a consola si pystray falla. | 🧑 HUMANO + 🖥 DEV |
| 2026-07-22 | **Admin EXE aprobado**: TUSTOCK_ADMIN.exe con tray icon púrpura/azul. Sirve dist/ en puerto 5174, proxea /api/admin/* a localhost:8090. Zero dependencias nuevas (stdlib). build.bat + start/stop scripts. | 🧑 HUMANO + 🖥 DEV |
| 2026-07-22 | **Admin independizado de server principal**: Todas las rutas admin migradas a cloud API (tustock.up.railway.app). Admin frontend habla SOLO a cloud, nunca a localhost. Server principal más liviano (sin admin routes). Admin funciona desde cualquier PC con internet. Pendiente: setear TUSTOCK_ADMIN_TOKEN en Railway + deploy. | 🧑 HUMANO + 🖥 DEV |
| 2026-07-22 | **Lead polirrubro multi-sucursal**: Cliente real con 3 sucursales, polirrubro. Maneja todo en cuaderno. Evaluación técnica y comercial en curso. DEV estima ~38h para multi-sucursal básica (instancias independientes + consolidador). Ventas recomienda entrevista primero para validar requerimientos. | 📢 Ventas + 🖥 DEV + Dispatcher |
| 2026-07-22 | **Admin EXE aprobado**: TUSTOCK_ADMIN.exe con tray icon púrpura/azul. Sirve dist/ en puerto 5174, proxea /api/admin/* a localhost:8090. Zero dependencias nuevas (stdlib). build.bat + start/stop scripts. | 🧑 HUMANO + 🖥 DEV |
| 2026-07-22 | **Admin independizado de server principal**: Todas las rutas admin migradas a cloud API (tustock.up.railway.app). Admin frontend habla SOLO a cloud, nunca a localhost. Server principal más liviano (sin admin routes). Admin funciona desde cualquier PC con internet. Pendiente: setear TUSTOCK_ADMIN_TOKEN en Railway + deploy. | 🧑 HUMANO + 🖥 DEV |
| 2026-07-22 | **Feature sugerida: POS Remoto en Monitor Cloud** — SU - Day (Dayana) pide tomar pedidos y cobrar desde el celular. Análisis DEV + Ventas completados en `obsidian/07-Features Sugeridas/`. Recomendación: Cola de comandos + PWA, tier nuevo Pro+ ($220K) o Suscripción Premium ($12-15K/mes). NO aprobada aún para desarrollo. | 🧑 HUMANO + Dispatcher |
| 2026-07-23 | **Quick wins seguridad (4 fixes)**: (1) `backup_enabled: False` en plan Pro (feature no existe), (2) JWT_SECRET obligatorio al startup con sys.exit si vacío, (3) CORS restringido a 4 orígenes específicos (tustocksoft.com.ar, monitor subdomain, localhost:5174, localhost:8090), (4) `configurar.bat` crea `server/.env` con valores por defecto si no existe. Auditoría de calidad. | 🖥 DEV |
| 2026-07-25 | **POS Remoto Fase 1 — APROBADO Y DESPLEGADO**: Feature completa validada end-to-end con Dayana. Venta remota desde Monitor Cloud funciona: CommandQueue → agent local → server → venta + stock descontado + push real-time. 6 endpoints cloud + 1 local. Tier: Pro ($160K) o Suscripción Pro ($15K/mes). Dayana pagaba $24K/mes por feature similar — nuestro precio es 37% más barato. | 🧑 HUMANO + 📢 Ventas |
| 2026-07-25 | **register-from-install fix**: Endpoint ahora retorna API key existente cuando el email ya está registrado (en vez de 409). Configurar.bat funciona con cuentas existentes. Fix cmd.exe quoting (`curl -d @file`). | 🖥 DEV + Dispatcher |
| 2026-07-28 | **Instalación Librería completada**: Setup in-situ para cliente premium. Social Proof validado para approach al polirrubro. | 🧑 HUMANO + Dispatcher |
| 2026-07-28 | **Nuevos prospectos**: Polirrubro (3 sucursales, confirmado) + Cosmética (nuevo, sin datos) documentados en MEMORY.md. | 🧑 HUMANO + Dispatcher |
| 2026-07-28 | **Feature Gap detectado**: Fechas de vencimiento — necesario para cosmética y comestibles. Gretel (cosmética) lo señaló. Documentado en nueva sección Feature Gaps. Pendiente evaluación de DEV. | 🧑 HUMANO + Dispatcher |
| 2026-07-29 | **Feature Fechas de Vencimiento IMPLEMENTADO**: Product model + schemas + alerts + Dashboard + Products column + cloud push. Build exitoso. (DEV) | 🖥 DEV |
| 2026-07-29 | **USB preparado para instalación Librería**: License key `TST-A921-C581-9F20-4B43` generada y sync al cloud. Email cloud `libreria-tustock@temp.tustocksoft.com.ar`. EXE 10.94 MB con vencimientos incluido. APKs + PDF + LEEME. | Dispatcher |
| 2026-07-29 | **Fix barcode images**: `mixBlendMode: 'screen'` eliminado de Products.tsx, `except:` reemplazado por `except Exception as e:` con logging en endpoint, spec de PyInstaller actualizado con hiddenimports de barcode. EXE rebuild con barcode package incluido. | 🖥 DEV |
| 2026-07-29 | **Feature página Códigos**: Nueva ruta `/barcodes` con grilla de etiquetas imprimibles, filtros, botón Imprimir con `@media print`. Link "Códigos" en sidebar. | 🖥 DEV |
| 2026-07-29 | **Feature PDF de códigos de barras**: Endpoint `GET /api/products/barcodes/pdf` genera PDF A4 con grilla 3 columnas usando reportlab. Botón "Descargar PDF" en página Códigos. Filtros por search y category_id. | 🖥 DEV |
| 2026-07-29 | **Fix PDF en EXE**: hiddenimport `reportlab.graphics.barcode.ecc200datamatrix` faltante en PyInstaller causaba `ModuleNotFoundError` al generar PDF desde el EXE. Agregado al spec. Frontend cambió `window.open()` (sin token) por `fetch()` con Authorization header para evitar 401. DB de productos copiada a `_internal/tustock.db`. (Dispatcher + DEV) | Dispatcher 🧑‍💻 |
| 2026-07-30 | **Nuevo prospecto polirrubro 1 sucursal**: Reunión confirmada para el sábado. Registrado en MEMORY con estrategia de demo. | 🧑 HUMANO + Dispatcher |
| 2026-07-30 | **Seed demo polirrubro creado**: `server/seed_demo_polirrubro.py` — 48 productos realistas con vencimientos, 8 ventas hoy, fiado. Verificado. | 🖥 DEV |
| 2026-07-30 | **Bundle demo USB listo**: `USB_TUSTOCK\TUSTOCK_DEMO\` con DB demo (trial + EULA ok, sin cloud.json). Exe verificado sirviendo 48 productos. Guión en `LEEME-DEMO.txt`. | Dispatcher 🧑‍💻 |
| 2026-07-30 | **Análisis multi-sucursal**: Documento `docs/analisis-multisucursal-2026-07-30.md` — instancias SQLite + coordinador cloud, MVP ~40-45h, stock remoto con badge de frescura, venta cruzada fuera de MVP. | 🖥 DEV |
| 2026-07-30 | **Multi-sucursal a STANDBY**: No desarrollar hasta conseguir reunión con encargado/dueño de farmacia. Se retoma con confirmación del cliente. | 🧑 HUMANO + Dispatcher |
| 2026-07-30 | **Estrategia farmacia — exprimir con suscripciones**: Priorizar Suscripción Pro ($15K/mes) o suscripciones por sucursal sobre pagos únicos. NO ofrecer Básico/Pro único como primera opción. | 🧑 HUMANO |
| 2026-07-30 | **Demo probada mañana**: El humano prueba el bundle demo (`USB_TUSTOCK\TUSTOCK_DEMO\`) en su notebook antes de la reunión del sábado. | 🧑 HUMANO |
| 2026-08-02 | **CONGELAMIENTO ANDROID LEVANTADO (app Stock)**: El humano aprobó levantar el congelamiento de Android SOLO para la app Stock, para la **Opción E — toma de stock CSV local** (escaneo → cantidad → nombre → CSV local → import en PC). La app POS sigue congelada. La toma de stock actual funciona (lenta pero funciona) — es un **upgrade de producto para todos los clientes**, no un fix de emergencia. Regla en §3/§7 actualizada. | 🧑 HUMANO |
| 2026-08-02 | **Catálogo offline CONFIRMADO**: El humano aprobó el catálogo offline en la app Stock (descargar `GET /api/products` paginado al iniciar la toma, nombre visible al escanear). Estimación total Opción E: **~16h**. | 🧑 HUMANO |
| 2026-08-02 | **Reunión polirrubro reprogramada**: Pasa de sábado 2/8 a la **semana del 5/8** (horario a confirmar con el cliente). Demo probada exitosa en notebook (2/8). | 🧑 HUMANO |
| 2026-08-02 | **B1+B2 web DESCARTADOS**: El humano decidió NO aplicar las mejoras web de refocus + beep. La toma de stock actual funciona y la mejora real llega con la Opción E (upgrade completo). Se evita tocar código web que quedará obsoleto con el CSV. | 🧑 HUMANO |
| 2026-08-02 | **Opción E en ESPERA hasta reunión polirrubro**: El humano decidió NO arrancar el desarrollo de la app Stock (Opción E, ~16h) hasta tener la reunión con el polirrubro (semana del 5/8). Si el cliente pide algo que cambie prioridades, se ajusta. El upgrade de toma de stock queda agendado para después de la reunión. | 🧑 HUMANO |
| 2026-08-02 | **Opción E — INICIO DE DESARROLLO**: El humano dio luz verde para arrancar la implementación de la Opción E (app Stock genera CSV local + import + catálogo offline, ~16h) sin esperar la reunión. Prioridad de fases: (1) app Kotlin ~7.5h, (2) import server+web ~5.5h, (3) QA+CI ~3h. | 🧑 HUMANO + Dispatcher |

---
## 13. EQUIPO LEGAL

> **Agente Legal:** Abogado especialista en servicios digitales (IA). Asesora exclusivamente en cumplimiento normativo (Ley 24.240, Ley 25.326, Ley 11.723 y demás leyes argentinas aplicables). Redacta y revisa documentación legal (términos, privacidad, reembolso). Emite directivas vinculantes para DEV y Ventas cuando detecta incumplimientos legales. **NO toca código, NO toca el dashboard de Obsidian, NO desarrolla features.** Su única herramienta es el dictamen legal y la orden directa a DEV.

### Documentos redactados (Julio 2026)

| Documento | Archivo | Contenido |
|-----------|---------|-----------|
| Términos y Condiciones + EULA | `legal/terminos-y-condiciones.html` | Licencia de uso, planes, garantía, limitación de responsabilidad, derecho de arrepentimiento, propiedad intelectual, jurisdicción CABA |
| Política de Privacidad | `legal/politica-de-privacidad.html` | Datos recolectados (local vs cloud), finalidad, transferencia internacional (Railway/USA), derechos ARCO, seguridad, registro AAIP pendiente |
| Política de Reembolso | `legal/politica-de-reembolso.html` | Derecho de arrepentimiento 10 días hábiles, reembolso proporcional, cancelación de suscripción, grace period, defectos del software |

**Datos del proveedor completos:**

| Campo | Valor |
|-------|-------|
| CUIT | 20-33489288-4 (Monotributista) |
| Email | tustock.administracion@gmail.com |
| Domicilio | Colón 350, Chamical (5380), La Rioja |
| WhatsApp | +54 9 3826 403110 |

### Checklist legal

| Prioridad | Item | Estado | Quién |
|:---------:|------|:------:|:-----:|
| 🔥 1 | Completar datos del proveedor en docs legales | ✅ Completado | 🧑 HUMANO |
| 🔥 2 | Configurar MP token en Railway | ✅ Completado | 🖥 DEV |
| 🟢 3 | Checkbox de aceptación en registro cloud | ✅ Completado | 🖥 DEV |
| 🟢 4 | Endpoint de baja de cuenta cloud | ✅ Completado | 🖥 DEV |
| 🟢 5 | EULA clickwrap en primera ejecución | ✅ Completado | 🖥 DEV |
| 🟢 6 | Registro de bases de datos AAIP | ❌ Pendiente (guía disponible en `obsidian/TU STOCK/03-Legal/Registro AAIP.md`) | 🧑 HUMANO |
| 🔥 7 | Eliminar "Backup en la nube" de Upgrade.tsx (publicidad engañosa — Ley 24.240 art. 8-9) | ✅ Corregido 2026-07-08 | 🖥 DEV |
| 🟡 8 | Completar email `[completar email]` en política de privacidad (sección 13 Contacto) | ✅ Corregido 2026-07-08 | 🖥 DEV |

---

---

## 14. BUGS CONOCIDOS Y OBSERVACIONES TÉCNICAS

> Encontrados durante auditoría de código (Julio 2026). **Bugs funcionales corregidos el 2026-07-06.**

### 🐛 Bugs funcionales (CORREGIDOS ✅)

| Archivo | Problema | Fix |
|---------|----------|-----|
| `server/routes/audits.py:22` | **Línea duplicada:** `return create_audit(...)` aparece 2 veces. | Removida línea extra |
| `server/routes/audits.py:44` | **Línea duplicada:** `result = update_audit_item(...)` aparece 2 veces. | Removida línea extra |
| `server/routes/pending_orders.py:140` | **Línea duplicada:** `order = db.query(PendingOrder)...` aparece 2 veces. | Removida línea extra |
| `server/main.py:160` | **Error de indentación:** bloque `try:` indentado 4 espacios extra. | Corregida indentación |
| `server/auth.py` | `verify_token` usa comparación directa `!=` en lugar de `secrets.compare_digest()`. | Timing-safe aplicado |
| `cloud/api.py` webhook | `data_id` con `body["id"]` puede causar KeyError en payloads malformados. | Usado `.get()` seguro |
| `cloud/payments.py` | Variable `units` asignada sin uso. | Removida |
| `server/pending_orders.py:134` | Variable `pm_label` asignada sin uso. | Removida |

### 🐛 Bugs corregidos 2026-07-21 (instalación segundo cliente)

| # | Archivo | Problema | Fix | Severidad |
|---|---------|----------|-----|:---------:|
| 1 | `server/routes/products.py` | `create_product` no maneja IntegrityError. Barcode vacío `""` viola constraint UNIQUE, segundo producto sin barcode causa 500 | `barcode: ""` → `None` antes de guardar + `IntegrityError` catch | 🔥 Crítico |
| 2 | `web/src/api/client.ts` | Errores de licencia (403) muestran "Error de conexion" al usuario — frontend solo lee `err.detail`, ignora `err.message` y `err.error` | `err.detail \|\| err.message \|\| err.error` | 🔥 Crítico |
| 3 | `android/.../ApiClient.kt` + `StockMainActivity.kt` | App Stock envía barcode escaneado como campo `code`, no como `barcode`. `CreateProductRequest` no tenía campo `barcode` | Campo `barcode` agregado al request, barcode escaneado va como `barcode`, `code` auto-generado como `TST-{timestamp}` | 🔥 Crítico |
| 4 | `server/services/audit_service.py` | `scan_to_audit` solo busca por `Product.code`, ignora `Product.barcode` — productos con barcode físico distinto al code no se encuentran | Query: `Product.code == x OR Product.barcode == x` | 🟡 Alto |
| 5 | `android/.../ApiClient.kt` | URL path sin encoding — barcode con caracteres especiales rompe la request | `URLEncoder.encode(code, "UTF-8")` | 🟡 Alto |

### 🐛 Bugs corregidos 2026-07-22 (instalación segunda vez + POS)

| # | Archivo | Problema | Fix | Severidad |
|---|---------|----------|-----|:---------:|
| 6 | `configurar.bat` | Generaba token random (`tustock_XXX`) que no matcheaba el token hardcodeado del frontend (`tustock-local-token`) | Token fijo `tustock-local-token` en configurar.bat | 🔥 Crítico |
| 7 | `cloud/api.py` (cloud) | Key de cliente `TST-2241-8D21-AD68-4EA1` no existía en la cloud database — activación fallaba con "Clave inválida" | Sync manual de key al cloud via POST `/api/licenses/sync` | 🔥 Crítico |
| 8 | `web/src/pages/Sales.tsx` + `Presupuestos.tsx` | `addToCart()` solo buscaba `p.code`, no `p.barcode`. Scanner USB con código de barras físico no encontraba productos | `products.find(p => p.code === code \|\| p.barcode === code)` | 🔥 Crítico |
| 9 | `_internal/web/dist` | PyInstaller copia archivos con hash de build. Al rebuildear, el JS tiene hash nuevo (`index-XXX.js`) pero index.html viejo apunta al hash anterior. Resultado: frontend viejo se sirve尽管 hay archivos nuevos | Borrar JS viejo después de copiar el nuevo. Verificar index.html apunta al hash correcto | 🟡 Alto |

### 🐛 Bugs activos

*(No hay bugs activos conocidos)*

### ⚠️ Observaciones

| Archivo | Detalle |
|---------|---------|
| `server/auth.py` | `verify_token` usa comparación directa `!=` en lugar de `secrets.compare_digest()`. El admin SÍ usa timing-safe. |
| `server/migrations/` | Directorio vacío. No hay sistema de migraciones (Alembic). |
| `server/services/license_service.py` | `validate_against_cloud` timeout 10s — podría fallar en conexiones lentas. |
| `server/config.py` | `TUSTOCK_CLOUD_CACHE_DAYS` = 7 hardcodeado. MEMORY menciona 14 días porque el máximo absoluto es `CACHE_DAYS + 7` en `check_cloud_validation()`. |

- [fix] LANDING NOJEKYLL: Agregado `docs/.nojekyll` para evitar que GitHub Pages intente buildear archivos .md con Jekyll (sintaxis `{{` en stitch-implementation-guide.md causaba Liquid syntax error). Build 3083463 deployado exitosamente. (2026-07-18)
- [feature] UI REDESIGN FASES 0-2: design tokens, layout responsive con hamburger menu, sidebar agrupada, y componentes UI reutilizables (Modal, DataTable, Button, Card, Badge, EmptyState, Skeleton) (2026-07-14)
- [feature] STITCH FRONTEND REDESIGN: 44 archivos modificados, 13 páginas rediseñadas con Stitch design system — dark theme #10131a, glass effects, Material Icons, Geist Mono, animations, responsive mobile-first. Build exitoso -30KB. Commit 831098a. (2026-07-18)
- [feature] APK STOCK COMPILADO: APK de Android para Stock (escanear/contar) compilado via GitHub Actions (workflow `.github/workflows/build-stock-apk.yml`). `app-stock-debug.apk` generado exitosamente. (2026-07-21)
- [fix] CLOUD ACTIVATION: `activate_license()` ahora valida contra el cloud (Railway) cuando la key no está en la DB local. Permite activar licencias generadas en admin desde PCs nuevas sin necesidad de sync manual. (2026-07-21)
- [fix] LICENSE ROUTER SIN TOKEN: Router de licencias removido `dependencies=[Depends(verify_token)]` para permitir `/api/license/status` y `/accept-eula` sin token (el frontend los llama al abrirse). (2026-07-21)
- [feature] FONTES LOCALES: Material Icons, Inter y Geist Mono embebidos en `/assets/fonts/` para funcionar sin internet. CSS local `fonts-local.css` reemplaza CDN de Google. (2026-07-21)
- [fix] EXE PYINSTALLER FIX: `config.py` detecta `sys.frozen` para resolver `BASE_DIR` correctamente en el bundle PyInstaller. (2026-07-21)
- [feature] SEGUNDO CLIENTE: SU - Day. Plan Suscripción ($8K/mes). Key TST-2241-8D21-AD68-4EA1. Notebook + app Android POS + Stock funcionando. (2026-07-21)
- [fix] PRODUCT REGISTRATION: `create_product` ahora maneja IntegrityError + convierte barcode vacío a None. Frontend muestra errores reales de licencia. App Stock envía barcode como campo `barcode` (no `code`). Audit scan busca por code O barcode. URL encoding en scan de Android. (2026-07-21)
- [fix] CONFIGURAR.BAT TOKEN: Token fijo `tustock-local-token` en vez de random. Sin esto, frontend y backend no matchean y TODOS los endpoints dan 401 "Token inválido". (2026-07-22)
- [fix] SALES BARCODE LOOKUP: `addToCart()` en Sales.tsx y Presupuestos.tsx ahora busca por `code` O `barcode`. Scanner USB con código físico ahora encuentra el producto. (2026-07-22)
- [fix] CLOUD SYNC KEY: Keys generadas en admin deben hacerse sync al cloud via POST `/api/licenses/sync` antes de que el cliente active. Sin esto, `activate_license()` falla con "Clave inválida". (2026-07-22)
- [fix] PYINSTALLER JS HASH: Al copiar frontend rebuilt a USB, verificar que index.html apunta al hash del JS nuevo. Borrar JS viejo con hash anterior. (2026-07-22)
- [fix] SALES UNDEFINED DATE: `created_at` del backend viene como `"2026-07-22 03:43:14"` (separado por espacio), pero Sales.tsx usaba `split('T')[1]` (formato ISO). Resultado: `"undefined"` visible en la columna de fecha/hora del historial de ventas. Fix: fallback a `split(' ')[1]`. (2026-07-22)
- [feature] TRAY ICON: TUSTOCK.exe corre sin ventana de terminal (console=False). Icono en bandeja del sistema con menú contextual (Abrir TUSTOCK / Detener servidor). Click izquierdo abre navegador. Servidor FastAPI en thread separado. Fallback a consola si pystray no está disponible. (2026-07-22)
- [feature] ADMIN EXE: TUSTOCK_ADMIN.exe con tray icon púrpura/azul (distinto al de TUSTOCK). Sirve dist/ en puerto 5174, proxea /api/admin/* a localhost:8090. build.bat para PyInstaller, start/stop scripts. Cero dependencias nuevas (stdlib). (2026-07-22)
- [feature] ADMIN INDEPENDIENTE: Endpoints admin migrados a cloud API (tustock.up.railway.app). Admin frontend habla SOLO a cloud, nunca a localhost. Server principal más liviano (sin admin routes). Admin funciona desde cualquier PC con internet. Token: TUSTOCK_ADMIN_TOKEN en Railway. (2026-07-22)
- [feature] LIMPIEZA PROYECTO: ~330 MB de basura removidos (build, dist, admin viejo, stitch output, zips, DB temporal). .gitignore actualizado (dist/, installer/build/, installer/dist/, web/dist/, stitch_output/, *.zip, server/*.log). Admin removido del tracking de git. Repo limpio. (2026-07-22)
- [feature] CLOUD AGENT AUTO-SETUP: Endpoint `POST /api/register-from-install` crea cuenta en el cloud desde la instalación. `configurar.bat` ahora pregunta email del negocio y crea la cuenta automáticamente. `scripts/fix-cloud-agent.ps1` para configurar PCs existentes. Documentación en `docs/setup-cloud-agent.md`. Resuelve GAP de vinculación instalación↔Monitor Cloud. (2026-07-23)
- [audit] AUDITORÍA CALIDAD: Agente quality-auditor creado + auditoría inicial completada — 14 hallazgos (3 críticos: webhook MP sin firma, JWT_SECRET vacío, consentimiento bypass). Reporte en `docs/auditoria-calidad-2026-07-23.md`. Quick wins: backup_enabled False en Pro, JWT_SECRET obligatorio, CORS restringido, .env en configurar.bat. (2026-07-23)
- [fix] QUICK WINS SEGURIDAD: (1) backup_enabled False en plan Pro (feature inexistente), (2) JWT_SECRET obligatorio al startup con sys.exit si vacío, (3) CORS restringido a 4 orígenes (tustocksoft.com.ar, monitor subdomain, localhost:5174, localhost:8090), (4) configurar.bat crea server/.env con defaults si no existe. (2026-07-23)
- [fix] POSTGRESQL MIGRATION: Cloud DB migrada de SQLite efímero a PostgreSQL managed en Railway. `config.py` lee `DATABASE_URL` de env var, `models.py` usa engine condicional (SQLite fallback para local, pool_pre_ping para PG), `requirements.txt` con psycopg2-binary. DB ahora persiste entre redeploys. (2026-07-23)
- [feature] CLOUD PUSH REAL-TIME: `server/cloud_push.py` — módulo que pushea métricas al Monitor Cloud inmediatamente después de cada venta o ajuste de stock. Fire-and-forget via `threading.Thread(daemon=True)`. Lee config de `config/cloud.json`, usa las mismas queries que `cloud/agent.py`, timeout 5s, errores silenciosos. Hook en `server/routes/sales.py` (post-commit) y `server/routes/stock.py` (post-adjust). El agente timer-based (30s) se mantiene como fallback. (2026-07-23)
- [fix] CLOUD AGENT PYINSTALLER: Tres bugs de path resolution en PyInstaller one-folder: (1) `cloud/agent.py` BASE_DIR apuntaba a `_internal/` en vez de project root, (2) `tustock_entry.py` nunca iniciaba el cloud agent como thread, (3) `run_cloud_agent()` usaba `project_root` para log_dir cuando debería usar `bundle_dir/_internal/`, y `cloud_push.py` leía DB de la ruta equivocada (project root en vez de sys._MEIPASS). Todo corregido con detección `sys.frozen`. Cloud push ahora funciona desde el .exe. (2026-07-24)
- [feature] POS REMOTO FASE 1: Pedidos pendientes visibles en Monitor Cloud. `cloud_push.py` consulta `pending_orders` del día y los agrega al push payload. `cloud/dashboard.html` tiene sección "Pedidos Pendientes" con badges de color (pendiente/aprobado/rechazado). Deploy vía git push a Railway. Read-only — no se crean pedidos desde el celular todavía. (2026-07-24)
- [feature] INVENTARIO MONITOR CLOUD: Inventario completo visible en el Monitor Cloud. `collect_inventory()` en `cloud_push.py` y `cloud/agent.py` pushea productos con stock (max 500, query SQL con products+categories+current_stock). Endpoint `GET /api/inventory` con JWT auth, paginación, búsqueda por nombre/código, filtro por categoría, filtro stock bajo. `dashboard.html` con 3 tabs (Dashboard/Inventario/Pedidos), tabla responsive con badges (🟢 OK/🟡 Bajo/🔴 Sin stock), KPI total productos, categorías dinámicas. Gating: solo planes Suscripción/Pro/Premium. (2026-07-24)
- [feature] WEBHOOK MP FIRMA: Verificación HMAC-SHA256 en webhook de Mercado Pago. `verify_mp_signature()` parsea header `x-signature` (formato `ts=<ms>,v1=<hash>`), construye manifest `id:;request-id:;ts:;`, calcula HMAC-SHA256 con secret, compara con `hmac.compare_digest()`. Modo warn (log pero no rechaza). Dual secret: `MP_WEBHOOK_SECRET` (Checkout Pro) + `MP_WEBHOOK_SECRET_SUBS` (Suscripciones) con fallback. Replay check (>5min = warning). `notification_url` actualizado con `?source_news=webhooks` para recibir solo webhooks (no IPN legacy). Env vars pendientes de configurar en Railway. (2026-07-24)
- [fix] EXE MODELS IMPORT CRASH: `sys.path.insert(0, agent_path)` en `tustock_entry.py` insertaba `cloud/` en sys.path, causando que `cloud/models.py` sombree al package `server/models/` (race condition entre threads). Eliminada línea innecesaria (agent.py se carga con importlib.util). Exe reconstruido y verificado. (2026-07-24)
- [android] STOCK INITIAL + MODO AUDITORÍA EN APK: 3 archivos modificados. ApiClient.kt: `CreateProductRequest` ahora incluye `initial_stock` + 4 métodos de auditoría (create, start, updateItem, complete). activity_stock_main.xml: barra superior con Switch toggle "Auditoría". StockMainActivity.kt: lógica dual — modo normal (registro con stock initial en 1 llamada, sin ajuste posterior) y modo auditoría (toggle ON crea auditoría → escanea producto y guarda conteo real → toggle OFF completa y aplica correcciones). Workflow GitHub Actions actualizado para compilar ambos APKs automáticamente al pushear cambios en `android/**`. (2026-07-30)

---

*Última actualización: 31 de Julio de 2026 (Procedimiento de actualización de clientes documentado — sección 15)*

---

## 15. APRENDIZAJO PARA INSTALACIONES (Checklist Pre-Entrega)

> **Este documento es el resultado de 2 instalaciones reales + 1 auditoría de calidad.** Cada punto viene de un bug o problema que apareció in-situ. Seguir este checklist ANTES de entregar el USB al cliente para evitar problemas.

### GAPs descubiertos en instalaciones reales

| # | GAP | Consecuencia | Solución |
|---|-----|-------------|----------|
| 1 | **Sin vinculación instalación↔Monitor Cloud** | El agente pushea datos pero no hay Business asociado. El cliente no puede ver el monitor. | Endpoint `POST /api/register-from-install` + configurar.bat pregunta email |
| 2 | **Directorio `config/` no existe en PCs nuevas** | `cloud.json` no se puede guardar. El agente no arranca. | Crear directorio manualmente o que configurar.bat lo cree |
| 3 | **Token de admin en .env del cliente** | Seguridad comprometida. El cliente podría acceder al admin. | Sanitizar .env antes de copiar al USB |
| 4 | **APKs sin compilar** | El APK Stock tiene fixes de barcode que no existían en la versión vieja | Siempre recompilar APKs antes de entregar |

### Checklist pre-entrega USB

| # | Paso | Por qué | Verificado |
|---|------|---------|:----------:|
| 1 | **Rebuild exe** (`pyinstaller --clean --noconfirm tustock.spec`) | Asegura que todos los fixes de código estén en el bundle | ⬜ |
| 2 | **Rebuild frontend** (`npm run build` en `web/`) | Genera JS/CSS nuevos con hashes actualizados | ⬜ |
| 3 | **Fuentes locales** — verificar que `web/public/assets/fonts/` existe | Sin internet no carga fonts del CDN. `public/` sobrevive a `npm run build` | ⬜ |
| 4 | **Verificar index.html** apunta al JS correcto | El hash del JS cambia en cada build. Si el hash no matchea, se sirve el JS viejo | ⬜ |
| 5 | **configurar.bat** usa `tustock-local-token` (NO random) | El frontend hardcodea `tustock-local-token`. Si el .env tiene otro token, TODOS los endpoints dan 401 | ⬜ |
| 6 | **.env sanitizado** — sin `TUSTOCK_ADMIN_TOKEN` | No shippear token de admin al cliente | ⬜ |
| 7 | **Sync key al cloud** — `POST /api/licenses/sync` con la key del cliente | Sin esto, `activate_license()` falla con "Clave inválida" | ⬜ |
| 8 | **Copiar APKs compilados** — Stock y POS | El APK Stock tiene fixes de barcode que no existían antes | ⬜ |
| 9 | **LEEME.txt** con instrucciones claras | El cliente no sabe qué es `configurar.bat` ni qué hacer | ⬜ |
| 10 | **Copiar Guía de Usuario PDF** | Para que el cliente tenga referencia offline | ⬜ |
| 11 | **cloud.json preconfigurado** — API key del cliente en `config/cloud.json` | Sin esto, el agente no pushea datos al Monitor Cloud | ⬜ |
| 12 | **Verificar que el cliente tiene email** | Sin email no se puede crear cuenta en el Monitor Cloud | ⬜ |

### Errores comunes in-situ y cómo resolverlos

| Síntoma | Causa | Solución |
|---------|-------|----------|
| **"Token inválido o faltante" / "Sin acceso"** | Token de `.env` no coincide con el hardcodeado del frontend (`tustock-local-token`) | Re-ejecutar `configurar.bat` con el token correcto |
| **"Clave inválida" al activar licencia** | Key no existe en la cloud database | Sync manual: `POST https://tustock.up.railway.app/api/licenses/sync` con `{"license_key":"KEY","plan":"suscripcion","customer_name":"NOMBRE"}` |
| **Productos no registran (500)** | Barcode vacío `""` viola UNIQUE constraint | Fix ya aplicado (2026-07-21) — barcode `""` se convierte a `None` |
| **Scanner USB no encuentra producto** | `addToCart()` solo busca por `code`, no por `barcode` | Fix ya aplicado (2026-07-22) — busca por `code` O `barcode` |
| **App Stock registra barcode como "code"** | `CreateProductRequest` no tenía campo `barcode` | Fix ya aplicado (2026-07-21) — barcode va como campo `barcode` |
| **Frontend muestra "Error de conexion"** | Solo lee `err.detail`, ignora `err.message` | Fix ya aplicado (2026-07-21) — triple fallback |
| **Monitor Cloud no muestra datos** | El agente no está configurado (falta `config/cloud.json`) | Crear `config/cloud.json` con la API key del cliente |
| **Monitor Cloud "API key inválida"** | La API key no coincide con ningún Business en el cloud | Verificar que el email está registrado y la key es correcta |
| **PC cliente no tiene directorio `config/`** | Windows no crea directorios automáticamente | Crear manualmente o que configurar.bat lo haga |
| **JS viejo se sirve después de rebuild** | Hash del JS cambió pero `index.html` viejo apunta al hash anterior | Borrar JS viejo después de copiar el nuevo. Verificar hash en `index.html` |
| **Fuentes no cargan (sin internet)** | `index.html` apunta a Google Fonts CDN | Fuentes locales en `web/public/assets/fonts/`, CSS local `fonts-local.css` |
| **Servidor no arranca** | Falta `tustock-local-token` en `.env` (config.py hace `sys.exit(1)`) | Ejecutar `configurar.bat` primero |
| **Puerto 8090 cerrado** | Firewall de Windows bloquea conexiones desde red | `netsh advfirewall firewall add rule name="TUSTOCK-8090" dir=in action=allow protocol=tcp localport=8090` |
| **App Android no conecta** | Servidor escucha en `127.0.0.1` en vez de `0.0.0.0` | Verificar `TUSTOCK_HOST=0.0.0.0` en `.env` |

### Flujo de instalación corregido (definitivo)

```
1. Copiar carpeta TUSTOCK/ a la PC del cliente
2. Ejecutar configurar.bat (genera .env con token correcto)
3. Ejecutar TUSTOCK.exe (arranca servidor en puerto 8090)
4. Abrir navegador → http://localhost:8090
5. Aceptar EULA
6. Activar licencia (key del cliente)
7. Instalar APK en el celular → configurar IP: 192.168.X.X:8090
```

### Actualización de un cliente EXISTENTE (actualización de versión)

> ⚠️ **NO alcanza con reemplazar el `TUSTOCK.exe`.** El .exe es solo el bootloader (~11 MB). Todo el código real (backend), el frontend React compilado, el cloud agent y los docs legales viven en `_internal/`. Además, **la base de datos del cliente vive dentro de `_internal/tustock.db`** — con sus productos, ventas, clientes, licencia activa y EULA aceptado. Reemplazar la carpeta completa sin preservar la DB = perder TODO el negocio del cliente.

**Dónde vive cada cosa en la PC del cliente:**

| Qué | Dónde | Se preserva en update |
|-----|-------|:---------------------:|
| Código + frontend + docs | `TUSTOCK/_internal/` | Se reemplaza completo |
| Datos del negocio + licencia + EULA | `TUSTOCK/_internal/tustock.db` (+ -wal/-shm) | ✅ SE COPIA a la carpeta nueva |
| Config Monitor Cloud | `TUSTOCK/config/cloud.json` (junto al exe, fuera de _internal) | ✅ SE COPIA a la carpeta nueva |
| `.env` del server | `TUSTOCK/_internal/server/.env` (empaquetado en build, sanitizado) | Viene en el bundle nuevo |

**Por qué NO alcanza solo el .exe:** el bootloader carga todo desde `_internal/`. Si solo cambiás el .exe, seguís ejecutando el código viejo de `_internal/` — el frontend, el backend y las features nuevas ni se instalan.

**Procedimiento correcto (a prueba de errores — copiar carpeta nueva):**

```
1. Detener TUSTOCK (bandeja → "Detener servidor"). Verificar puerto 8090 libre.
2. BACKUP: copiar `_internal/tustock.db` (+ tustock.db-wal, tustock.db-shm) y `config/` a un backup/.
3. Copiar el bundle nuevo completo a la PC como `TUSTOCK_NUEVO/`.
4. Copiar la DB del cliente: `TUSTOCK_NUEVO\_internal\tustock.db` (desde la instalación vieja).
   - Si la instalación vieja tiene `-wal`/`-shm`, copiarlos también (o cerrar bien el server antes).
5. Copiar `TUSTOCK\config\cloud.json` → `TUSTOCK_NUEVO\config\cloud.json`.
6. Renombrar carpeta vieja a `TUSTOCK_VIEJO` (backup) y `TUSTOCK_NUEVO` → `TUSTOCK`.
7. Ejecutar `TUSTOCK.exe`. Verificar en Productos la columna "Vence" (features nuevas).
8. Migraciones de DB son AUTOMÁTICAS: `init_db()` corre `create_all` + `_run_migrations()`
   (agrega columnas faltantes, ej: `expiry_date`). No tocar la DB a mano.
```

**Verificar post-update:** health OK (`http://localhost:8090/api/health`), login sin EULA repetido (la DB trae el EULA aceptado), productos con datos intactos, Monitor Cloud sigue pusheando (el `config/cloud.json` preservado lo mantiene).

**Regla para DEV:** si una feature nueva agrega columnas a modelos existentes, la migración DEBE ir en `server/database.py::_run_migrations()` (ALTER TABLE con check de inspector). Sin esto, DBs de clientes existentes crashean al actualizar.

---

*Última actualización: 31 de Julio de 2026 (Procedimiento de actualización de clientes documentado — sección 15)*

---

## 16. ACCIONES DEL DISPATCHER (31/7)

- [fix] CONTRASEÑA MONITOR CLOUD LIBRERÍA: Reseteada en Railway PostgreSQL vía TCP proxy. Nueva contraseña: `25976027PG` (asignada por el humano para la clienta). Login verificado exitosamente. (2026-07-29)
- [check] DASHBOARD LIBRERÍA VERIFICADO: 605 pushes de métricas recibidas, última push hace minutos. 1 venta hoy ($3.500 fiado). 78 productos en inventario. Agente local funcionando correctamente. (2026-07-29)
- [feature] ANALYTICS SEMANALES: Endpoint `GET /api/admin/analytics/weekly` en cloud API con data de todos los negocios (7 días). Métricas por negocio: pushes, ventas, métodos de pago, top productos, inventario, stock bajo/cero, clientes, deudores, pedidos pendientes. Health status (healthy/warning/inactive). Script `scripts/weekly_report.py` genera markdown con resumen, salud, ranking, top global y alertas + ntfy. Primer reporte generado exitosamente. (2026-07-29)
- [fix] TZ CRASH ANALYTICS: `datetime.now(timezone.utc)` retorna offset-aware, timestamps de PostgreSQL offset-naive → crash al restar. Fix: `.replace(tzinfo=None)` en now y last_push. (2026-07-29)
- [ops] TUSTOCK_ADMIN_TOKEN configurado: Token `nwkf0GsJ1VQDEzT2tjypmXuKrqW349ZRFS5oO6Ia` seteado en Railway + server/.env. Pendiente desde 22/7. (2026-07-29)
- [feature] STOCK INICIAL AL CREAR PRODUCTO: Nuevo campo `initial_stock` en formulario de creación. Schema ProductCreate con `initial_stock: float = 0.0`. Backend: si >0 llama `adjust_stock()` con movement_type="adjustment". Frontend: input numérico con subtext, toast con nombre + unidades, foco vuelve a Nombre. Build verificado. (2026-07-29)
- [android] APK STOCK MODIFICADO: 3 archivos con initial_stock + toggle auditoría. Workflow `.github/workflows/build-apk.yml` actualizado para compilar ambos APKs (Stock + POS) via GitHub Actions. Disparo automático al pushear cambios en `android/**`. (2026-07-30)
- [fix] GRADLEW QUOTING BUG: `DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'` en `android/gradlew` tenía nested quotes que causaban `Error: Could not find or load main class "-Xmx64m"` en GitHub Actions Ubuntu. Fix: `DEFAULT_JVM_OPTS="-Xmx64m -Xms64m"`. Build APK #39 exitoso. (2026-07-30)
- [ops] APKs COMPILADOS #39: Release `apk-39` creada con app-pos-debug.apk (29.1 MB) + app-stock-debug.apk (29.1 MB). Descargados a `USB_TUSTOCK\TUSTOCK\` para entrega a clientes. (2026-07-30)
- [ops] KEYSTORE TUSTOCK CREADO: `android/app/tustock-release.jks` con alias `tustock-release`. Firmado con datos de TUSTOCK (Chamical, La Rioja). Almacenado en GitHub Secrets como `KEYSTORE_BASE64`. (2026-07-30)
- [feature] RELEASE SIGNING CONFIG: `signingConfigs.release` en `build.gradle` lee `keystore.properties` desde rootProject, con `rootProject.file()` para resolver rutas correctamente. (2026-07-30)
- [feature] CI RELEASE BUILD: Workflow `build-apk.yml` compila ambos sabores (debug + release) cuando hay keystore en secrets. Release con `fail_on_unmatched_files: false` para no fallar si faltan archivos. (2026-07-30)
- [fix] GRADLEW QUOTING BUG: `DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'` en `android/gradlew` tenía nested quotes que causaban `Error: Could not find or load main class "-Xmx64m"` en GitHub Actions Ubuntu. Fix: `DEFAULT_JVM_OPTS="-Xmx64m -Xms64m"`. Build APK #39 exitoso. (2026-07-30)
- [ops] APKs COMPILADOS #42 (RELEASE): Release `apk-42` con app-pos-release.apk (27.7 MB) + app-stock-release.apk (27.7 MB) firmados con keystore TUSTOCK. Descargados a `USB_TUSTOCK\TUSTOCK\`. (2026-07-30)
- [feature] SEED DEMO POLIRRUBRO: `server/seed_demo_polirrubro.py` — DB demo para reuniones de venta. 29 categorías, 48 productos EAN13 con precios julio 2026, 14 próximos a vencer (leche 5d, yogur 3d, pan 2d, facturas 2d), 10 stock bajo, 2 stock cero. 8 ventas hoy ($114.300 en 5 métodos de pago), 4 clientes (2 con fiado), 3 vendedores, presupuesto + pedido pendientes. Idempotente (mismo patrón que seed.py). (2026-07-30)
- [ops] BUNDLE DEMO USB: `USB_TUSTOCK\TUSTOCK_DEMO\` — copia del bundle de entrega con DB demo cargada (48 productos, trial activo hasta 23/8, EULA aceptado). SIN config/cloud.json (no pushea al cloud real). Exe verificado: health OK + API sirve 48 productos. Guión en `USB_TUSTOCK\LEEME-DEMO.txt`. (2026-07-30)
- [analisis] MULTI-SUCURSAL: Documento `docs/analisis-multisucursal-2026-07-30.md` — instancias SQLite independientes + coordinador cloud (PostgreSQL/Railway). MVP ~40-45h (1 semana): sync catálogo + stock remoto con badge de frescura, push real-time existente (≤31s). Fase 2 (~20-30h): transferencias/venta remota vía CommandQueue (requiere operation_id). Riesgos: stock offline desactualizado, conflictos de IDs (product_uuid), 1 solo prospecto real. (2026-07-30)
- [decision] MULTI-SUCURSAL STANDBY: Humano definió NO desarrollar multi-sucursal hasta reunión con encargado/dueño de farmacia. Estrategia de venta farmacia: SUSCRIPCIONES primero (Suscripción Pro $15K/mes o por sucursal), no pagos únicos. Demo probada mañana en notebook. (2026-07-30)
- [ops] PROCEDIMIENTO ACTUALIZACIÓN CLIENTES: Documentado en sección 15 — NO alcanza con reemplazar TUSTOCK.exe (es solo el bootloader; todo vive en `_internal/`). Reemplazar carpeta completa preservando `_internal/tustock.db` (datos + licencia + EULA) y `config/cloud.json`. Migraciones DB automáticas vía `database.py::_run_migrations()` (ej: `expiry_date`). Verificado: bundle USB actualizado (29/7 20:08) incluye vencimientos + stock inicial; APKs release #42 (30/7). (2026-07-31)
- [ops] INSTRUCTIVO ACTUALIZACIÓN MANUAL: `USB_TUSTOCK\ACTUALIZAR-LIBRERIA.txt` — paso a paso para actualizar la PC de la librería a mano (12 pasos + problemas comunes + regla de oro). Se hace reemplazando la carpeta completa preservando tustock.db y cloud.json. El humano lo ejecuta en la librería. (2026-07-31)
- [exito] ACTUALIZACIÓN LIBRERÍA COMPLETADA: El humano actualizó la PC de la librería con el procedimiento del instructivo (carpeta nueva + preservación de tustock.db + cloud.json) e instaló los APKs release #42. **FUNCIONA TODO** — primera actualización de cliente existente validada en campo. El procedimiento de la sección 15 queda CONFIRMADO como correcto. (2026-07-31)
- [analisis] MULTI-SUCURSAL ESTIMACIÓN VALIDADA (31/7): DEV validó el análisis del 30/7 contra el código. **MVP ~50h ≈ 2 semanas** (ajuste 46→50h). Desglose: cloud API+modelos 12h (tablas Branch/CatalogState, branch_id en MetricsPush, migración idempotente — hoy cloud NO tiene _run_migrations), server 11h (product_uuid + backfill en DBs de clientes vivos + RemoteStock + flag multisucursal_enabled en 4 puntos), agente+push 7h (catálogo sin LIMIT 500), frontend 9h (panel stock otras sucursales + badges frescura), config/EXE 4h, QA 4h, buffer 3h. FUERA del MVP: Fase 2 venta cruzada/transferencias ~25h (requiere operation_id, hoy stuck-executing vigente en cloud/api.py:1407-1409) + Fase 3 vista consolidada ~12h → total completo ~85-90h. Riesgos: stock viejo mostrado fresco (badge honesto), backfill product_uuid (1 ciclo actualización clientes, §15 probado), catálogo divergente (dedupe por barcode). Dependencias NO técnicas: deploy Railway + rebuild EXE + visita 3 sucursales. **Recomendación DEV: esperar la reunión — riesgo es de mercado (1 prospecto), no técnico.** (2026-07-31)
- [decision] ALTERNATIVAS MULTI-SUCURSAL EVALUADAS (31/7): El humano preguntó si hay alternativa al desarrollo. Se formalizaron 3 opciones: **A)** Vender 3 licencias independientes (0h de dev; $300K único o $36K/mes con nuevos precios, o Suscripción Pro $15K/mes por sucursal según estrategia 30/7) — aplica si cada sucursal maneja stock independiente. **B)** Destrabar el STANDBY sin reunión presencial: llamada/WhatsApp con el encargado respondiendo 3 preguntas clave (¿stock independiente o compartido? ¿necesitan vista consolidada? ¿cuántas PCs?) + social proof de la librería. **C)** MVP multi-sucursal 50h solo si la respuesta es "sí, vista consolidada". **El humano valora B como muy buena opción y va a pensar la situación antes de decidir.** La decisión A vs C se toma con la entrevista. (2026-07-31)

## 17. TELENOTA 1/8 — MEJORAS UX PRODUCTOS (en curso)

> Fuente: `E:\TELENOTAS\inbox\2026-08-01.md`. Prioridad de trabajo acordada: (1) botón TST-, (2) paginación/búsqueda, (3) toma de stock masiva DESPUÉS.

- [telenota] Ítem 1 — Paginación + búsqueda: Cliente Librería tiene 309 productos (≈5% del stock real, va a crecer a miles). Pide **50 productos por página** y **búsqueda reactiva** (a medida que escribe, sin botón Buscar).
- [telenota] Ítem 2 — Botón "Generar code" perdido: El cliente duplica el barcode en el campo code porque al EDITAR un producto no hay botón "Generar" (solo aparecía al crear). La causa raíz: ambos botones (code + barcode) tenían condición `{!editing && ...}`.
- [telenota] Ítem 3 — Toma de stock masiva: Cliente con miles de productos no puede contar todo a mano. **✅ RESUELTO (2/8): Flujo unificado aprobado** — app Stock genera CSV local + import + catálogo offline. **Sirve para AUDITORÍA (productos existentes) y CARGA INICIAL (barcodes nuevos → la app pide NOMBRE al escanear + cantidad → CSV → import registra en lote con botón "Registrar todos")**. El humano levantó el congelamiento de Android (solo app Stock), confirmó catálogo offline, y descartó B1+B2 web. Es un **upgrade de producto para todos los clientes**. Estimación ~16h completadas en 2 fases + flujo unificado. Detalles en `docs/analisis-toma-stock-2026-08-01.md` §9.
- [fix] BOTÓN GENERAR CODE EN EDICIÓN (1/8): `web/src/pages/Products.tsx:247-256` — botón "Generar" (TST- + 10 dígitos vía `/products/generate-code`) ahora visible en creación Y edición. En edición: solo si `form.code` está vacío (si tiene code muestra "Código existente"); confirmación si regenera con code existente. Botón barcode sigue solo en creación. Causa raíz: ambos botones tenían `{!editing && ...}`. Backend `server/routes/products.py:76-86` ya existía (genera code TST- con chequeo de colisión). (2026-08-01)
- [feature] PAGINACIÓN SERVER-SIDE + BÚSQUEDA (1/8): `server/routes/products.py:27-74` — endpoint `GET /api/products` ahora acepta `search` (ILIKE en name/code/barcode), `category_id`, `include_inactive`, `near_expiry`, `page` (1-based), `page_size` (1-200, default 50). Responde `{products, total, page, page_size, total_pages}` con offset/limit y orden por nombre. (DEV, 2026-08-01)
- [feature] UI PAGINACIÓN CONFIGURABLE + DEBOUNCE (1/8): `web/src/pages/Products.tsx` — selector de page size 50/100/200 (default 50, persistido en `localStorage['products_page_size']`), búsqueda reactiva con debounce 300ms + indicador "Buscando...", refetch del backend paginado, botones Anterior/Siguiente, "Página X de Y", "Mostrando N de TOTAL", card TOTAL usa `total` del backend. Nota: "SIN STOCK" sigue calculado sobre página actual (limita conocida, requiere endpoint de stats). Build ✅ (317.91 kB JS, 949ms). (UI, 2026-08-01)
- [fix] INDEX SQLITE CRASH (1/8): `server/models/product.py:42` — `Index("idx_products_search", ..., sqlite_on_conflict_ignore=True)` crasheaba el arranque del EXE con `ArgumentError: Argument 'sqlite_on_conflict_ignore' is not accepted by dialect 'sqlite'`. Ese parámetro solo aplica a Insert/upsert, no a Index. Fix: quitado el argumento. Verificado: import OK + EXE arranca con health OK. (Dispatcher, 2026-08-01)
- [ops] PUSH + BUILD EXE (1/8): Commit `c01ce03` (paginación + botón + MEMORY §17 + docs análisis + seed demo) y `f4df60b` (fix Index) pusheados a origin/master. EXE rebuild con PyInstaller (11.05 MB) + frontend copiado a dist + hashes JS limpios (solo `index-wbFSTL9_.js`). Bundle actualizado en `USB_TUSTOCK\TUSTOCK\` (EXE nuevo + APKs #42 preservados). Verificado: EXE del USB arranca con health OK y endpoint `/api/products?page=1&page_size=50` responde `{total, page, page_size, total_pages}`. Listo para actualización de la librería. (2026-08-01)
- [fix] BOTÓN GENERAR SIEMPRE VISIBLE EN EDICIÓN (1/8): `web/src/pages/Products.tsx:282` — el humano reportó que el botón "Generar" (TST-) no aparecía al editar productos con code existente (caso librería: barcode duplicado en code). La condición `{!editing || (editing && !form.code)}` lo ocultaba. Fix: botón siempre visible; en edición con code existente pide `confirm()` antes de regenerar. Eliminado span "Código existente". Input code sigue disabled en edición. Build ✅ hash `index-tMbM1bsi.js` (317.75 kB). EXE rebuild + bundle USB actualizado + verificado health OK. Commit `1d0a87d`. (DEV, 2026-08-01)
- [fix] REGRESIÓN PAGINACIÓN /products (1/8): El cambio del endpoint `GET /api/products` (array → `{products, total, page, page_size, total_pages}`) rompió 4 páginas que esperaban array. **Barcodes.tsx** (página Códigos no cargaba: `products.filter is not a function`) → loop de páginas page_size=200. **Sales.tsx** (POS no cargaba productos) → helper `loadAllProducts()` con loop. **Presupuestos.tsx** (selector vacío, buscador client-side) → mismo loop. **Dashboard.tsx** (near_expiry ignoraba `limit` viejo) → `page=1&page_size=5` + `expiry.products`. Build ✅ hash `index-CCWPYBnf.js` (318.13 kB). EXE rebuild (idéntico al anterior — solo cambió frontend; DLLs bloqueados por Brave, copia selectiva del web/dist al USB). Commit `d609b7a`. (DEV, 2026-08-01)
- [feature] STOCK INICIAL EDITABLE EN EDICIÓN (1/8): Pedido del humano. Backend: `ProductUpdate.initial_stock: Optional[float]` en schemas.py + `update_product` extrae `initial_stock` del payload antes del loop setattr, y si viene y difiere del stock actual llama `adjust_stock(..., "adjustment", notes="Stock inicial (edición)")` (solo ajusta si cambió — sin movimientos spam). Frontend `Products.tsx`: quitado `delete body.initial_stock`, `handleEdit` precarga `initial_stock: getStock(p.id)`, input sin `disabled`, label dinámico "Stock actual"/"Stock inicial" + subtexto. Pruebas curl: PUT initial_stock=25 setea stock a 25 con 1 movimiento; PUT sin initial_stock no toca stock; PUT con mismo valor no duplica movimiento. Build ✅ hash `index-Bw14zdbz.js` (318.17 kB). Commit `9715e11`. (DEV, 2026-08-01)
- [ops] USB REBUILD LIMPIO (1/8): Copy-Item -Recurse creó carpeta anidada `USB_TUSTOCK\TUSTOCK\TUSTOCK\` y se perdieron APKs debug del USB principal. Detectado el problema: el TUSTOCK.exe del USB estaba CORRIENDO (PID 12188) bloqueando DLLs/DB → Stop-Process → borrado completo → recopiado bundle desde `installer\dist\TUSTOCK` + restaurados los 4 APKs (debug+release) desde `TUSTOCK_DEMO`. Verificado: estructura limpia (sin anidado), JS `index-Bw14zdbz.js` único, EXE arranca con health OK y `/api/products` paginado responde. Lección: matar procesos TUSTOCK del USB antes de reemplazar bundle. (Dispatcher, 2026-08-01)
- [analisis] TOMA DE STOCK MASIVA — 3 OPCIONES (1/8): Documento `docs/analisis-toma-stock-2026-08-01.md` según premisa nueva del humano ("app acumule 50 productos y envíe batch"). Hallazgos clave: app Android NO es offline (2 round-trips por producto, corte = conteo perdido, currentAuditId no persiste), idempotencia YA existe (update_audit_item setea valor absoluto), bug UX web (foco se pierde tras "Contar +1" → lector USB pierde escaneos). **Opción A — batch offline app (~12-14h):** catálogo JSON cacheado + cola local last-write-wins + flush a 50 items + endpoint batch idempotente. Requiere levantar congelamiento Android (CI ya existe). **Opción B — acelerar toma actual (~5.5-6.5h web, +1.5h app):** B1 refocus (0.5h, máximo impacto), B2 escaneo continuo+beep (1.5h), B3 progreso X/Y (1h), B4 solo-conteo (1.5h), B5 búsqueda por nombre (1-2h). **Opción C — import Excel/CSV (~6-7h):** viable (openpyxl+multipart existen) pero NO acelera conteo físico; requiere crear export de inventario (no existe). **Recomendación DEV:** aplicar B1+B2 YA (0.5-2.5h) para descomprimir al cliente; si humano levanta Android → Opción A (única que combina conteo+registro en un gesto, offline, para miles). Decisión pendiente del humano (ver doc §6). (DEV, 2026-08-01)
- [analisis] OPCIÓN D — ESCANEO CON APP GENÉRICA (2/8): Idea del humano: usar "QR & Barcode Scanner" de TeaCapps (free, 100M+ descargas, offline, sin cuenta) para que el cliente escanee con el celular y exporte el CSV; TUSTOCK lo importa. Investigación DEV (doc §5): la app **no pide cantidad** → conteo por repetición (N escaneos = N unidades); el CSV **no está documentado** y es "sucio" (fecha/formato mezclados con el contenido) → el import necesita parser tolerante con detección de columna de barcode por heurística. **Estimación ~9.5-10h** (reusa import de C + parser 2.5h + semántica conteo 1h); baja a **~7.5h** si el humano comparte un CSV real antes de desarrollar. Alternativa mejor si se paga: DataScan (CSV configurable con cantidad, ~8h). **Recomendación DEV:** B1+B2 YA (0.5-2.5h) para descomprimir a la Librería; si no se levanta Android → **Opción D como mejor plan B** (experiencia "caminar con celular offline" sin tocar Android). **PASO 0 pendiente:** que el humano escanee 5 productos con TeaCapps y pase el CSV real — única incertidumbre técnica fuerte. (DEV, 2026-08-01)
- [analisis] OPCIÓN E — APP STOCK GENERA CSV LOCAL + IMPORT (2/8, tarde): Idea del humano refinando la premisa: en vez de "app → server en vivo" (2 round-trips por ítem) o del batch, la **app Stock genera un CSV local** mientras se toma el stock: escanea → pregunta cantidad → guarda el nombre → append de una línea, **sin tocar la red**. Al terminar, el CSV se pasa a la PC (WhatsApp/Drive/USB) y TUSTOCK lo importa. **Sin cola, sin endpoint batch, sin last-write-wins.** Análisis DEV (doc §6): app Stock hoy hace 2 round-trips por producto (`GET /products/scan/{code}` + `PUT /audits/{id}/items`), sin catálogo local, sin export/share (no hay ACTION_SEND ni FileProvider). **Viabilidad: SÍ, la más simple de las offline-first** — append síncrono en `filesDir` + FileProvider + share sheet, formato `barcode;cantidad;nombre;timestamp` (`;` default Excel ES-AR, UTF-8 BOM), duplicados = append aditivo, no-registrados → `(no registrado)` + errores en import. **Nombre offline: recomienda catálogo cacheado** (descargar `GET /api/products` paginado al iniciar la toma; el import resuelve igual por barcode, el nombre del CSV es solo referencia legible). **Estimación: ~16h con catálogo / ~14h sin** (app Kotlin 7.5h incl. catálogo 1.5h + CSV writer 1h + share 1h; import formato conocido 5.5h; QA 2h + CI 1h). El import es **compartido** con C/D (si se construye para E, D solo suma parser tolerante +2.5h). **E vs A vs D:** E gana en complejidad baja (sin cola/endpoint), nombre+cantidad al escanear, offline 100%, sin terceros, formato controlado; cuesta ~2-4h más que A y ~6h más que D. **Recomendación DEV: E es la mejor si el humano levanta el congelamiento de Android (solo flavor stock)**; mientras tanto B1+B2 web (0.5-2.5h) descomprime al cliente. Si NO se levanta Android → D sigue siendo plan B. **Decisiones humanas: (1) ¿levantás Android app Stock? (2) ¿catálogo offline sí/no? (3) ¿B1+B2 ya?** (ver doc §8). (DEV, 2026-08-01)
- [fix] BOTONES REGISTRAR EN IMPORT STOCK (2/8): El humano reportó que los botones "Registrar" y "Registrar todos" de `/stock-import` no respondían. Causas raíz: (1) `registerProduct` usaba `prompt()` nativo — **bloqueado por los navegadores modernos** (Chrome/Firefox lo deshabilitan por defecto), (2) el botón "Registrar todos" estaba condicionado a `e.name` truthy (no aparecía en carga inicial 100% nueva donde los nombres venían vacíos del CSV viejo). Fix en `web/src/pages/ImportStock.tsx`: estado `NameInputState`/`nameInputs` — input inline editable en la fila de pendientes reemplaza a `prompt()`, validación de nombre con toast si vacío, `registerAll` separa pendientes con/sin nombre y avisa con toast si faltan nombres. Backend ya soportaba el flujo (`import-register` + `import-register-batch` en `server/routes/audits.py`). Frontend build ✅ hash `index-BoRrMfy8.js` (333.65 kB). EXE rebuild (11.06 MB) + verificado: health OK + `/stock-import` 200. Bundle USB actualizado (EXE + `_internal` nuevo, APKs #44 preservados). Commit `56cd0bf` pusheado. (Dispatcher + DEV, 2026-08-02)
- [feature] PUNTO C — CAPTURA DE PRECIO EN TOMA DE STOCK (3/8): El humano confirmó que el punto C es "la app toma nombre y cantidad pero no precio". Implementado en el flujo unificado: **app Stock** pide PRECIO obligatorio (>0) para producto nuevo en modo toma (`newPriceInput` en resultCard, `lastNewPrice` persistido); header CSV → `barcode;cantidad;nombre;precio;fecha`; productos en catálogo escriben su `selling_price`. **Server** (`csv_import.py`): `parse_price()` tolerante (coma/punto/`$`), detección por header (`precio`/`price`) o posicional (5 campos → índice 3), CSVs viejos de 4 columnas → $0 (compatibilidad atrás); `register_products_batch` y `register_product_from_import` usan el precio del CSV (validan > 0). Schemas `ImportRegister`/`ImportRegisterItem` con `price: float = 0.0`. **Web** (`ImportStock.tsx`): columna PRECIO en preview — resueltos = precio del sistema (read-only), pendientes = input inline editable, enviado en registro individual y lote; confirm adaptativo avisa cuántos quedan a $0. QA server: ALL TESTS PASSED (preview detecta coma/punto/None, batch guarda 2500.5/1800.0/0.0, CSV viejo 4 col → $0, `12,90` → $12.9, headers `precio`/`price` reconocidos). Build web ✅ `index-YknLSsSV.js` (334.84 kB). EXE rebuild (11.06 MB) + verificado + USB actualizado. Commit `db2d8f9` pusheado (dispara CI Android APKs #45). Nota: NO pisa precios de productos existentes (C1 import masivo de precios queda como feature separada); `cost_price` sigue en 0.0. (DEV + Dispatcher, 2026-08-03)
- [ops] DEMO USB ACTUALIZADO (3/8): `USB_TUSTOCK\TUSTOCK_DEMO\` actualizado con EXE nuevo (11.06 MB, JS `index-YknLSsSV.js`) + APKs #45. DB demo (48 productos, trial, EULA) preservada via procedimiento §15 (backup → reemplazar `_internal` → restaurar `tustock.db`). Verificado: health OK + `/stock-import` 200 + `GET /api/products` responde 48 productos con precios (Aceite 1.5L $3900, Agua 2.25L $1800, etc.). SIN `config/cloud.json` (no pushea al cloud real). Listo para reunión polirrubro (semana del 5/8). (Dispatcher, 2026-08-03)
- [fix] USB PRINCIPAL RECOPIADO — CARPETA ANIDADA `_internal\_internal` (3/8): El humano reportó `Failed to load Python DLL '...TUSTOCK\_internal\python312.dll'` al abrir el sistema. Causa raíz: en la actualización del bundle del USB principal, `Remove-Item -Recurse -Force` de `_internal` falló silenciosamente (DLLs bloqueados por proceso/antivirus) y el `Copy-Item -Destination "$usb\_internal"` **anidó** `_internal` dentro de `_internal` (171 archivos incl. python312.dll quedaron en `_internal\_internal\`), dejando la raíz sin python312.dll → el EXE no arranca. Fix: rename `_internal` → `_internal_viejo` (el rename no requiere borrar archivos bloqueados), copiar bundle nuevo como `_internal` limpio, verificar estructura (0 faltantes vs dist fuente, sin anidado, python312.dll en raíz). EXE verificado: health OK + JS `index-YknLSsSV.js` + `/stock-import` 200. Demo NO estaba afectado (estructura OK). Quedó `_internal_viejo` como backup (DLLs bloqueados, no se pudo borrar — se puede limpiar a mano). **Lección: después de copiar bundles al USB, verificar SIEMPRE la estructura (`Test-Path _internal\_internal` + python312.dll en raíz), no solo health check.** (Dispatcher, 2026-08-03)
