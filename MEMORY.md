# MEMORY — TUSTOCK

> Este archivo es la fuente de verdad compartida entre el **Agente de Ventas**, el **Agente de Desarrollo (DEV)** y el **Agente Legal**. Lo leo al inicio de cada sesión para saber el estado actual.
>
> **Rol de Ventas (YO):** Conozco el producto, el mercado, los precios. Organizo, coordino y le asigno tareas humanas al usuario para vender.
>
> **Rol de DEV (asistente de código):** Construye exclusivamente lo que está definido aquí. No inventa features. No desarrolla fuera del roadmap.
>
> **Rol de Legal (abogado especialista en servicios digitales):** Asesora en cumplimiento normativo, redacta términos legales, protege al proyecto de riesgos jurídicos. Sus directivas en materia legal son vinculantes para DEV y Ventas.
>
> **Regla especial — Cliente Premium:** La clienta que paga $60K entry + $6K/mes tiene un plan híbrido legacy (pago único + suscripción). Tiene acceso al Monitor Cloud, updates continuos y soporte prioritario. Su tier en código es `premium`. Ningún cliente nuevo accede a este precio ni a este tier. Es la primera clienta y cierra antes del lanzamiento oficial.

**Regla de legacy pricing:** Si un referido pregunta cuánto pagó ella, la respuesta es: *"Fue la primera cliente y compró antes del lanzamiento oficial. Esos precios ya no están disponibles."*

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
7. **Licencias validadas en la nube** — cada 7 días verifica que la key sea legítima, sin internet sigue funcionando

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
- **Monitor Cloud (Fase 5):** Desplegado en Railway (`tustock.up.railway.app`). API push-based, dashboard mobile responsive, login multiusuario JWT. Agente local (`cloud/agent.py`) pushea métricas cada 30s desde la PC del cliente. URL fija, sin tunnel.
- **Launcher unificado:** `scripts/launcher.py` — inicia servidor, monitor, tunnel y cloud agent desde un solo punto. `TUSTOCK.bat` con menú interactivo de 8 opciones.
- **Dashboard admin de licencias:** App independiente en `admin/` (Vite+React standalone, puerto 5174). Generar keys, ver licencias, revocar/activar, stats por plan, ingresos estimados, trials por vencer. Panel de Suscripciones MP con link compartido y vinculación de suscripciones entrantes a licencias. Scripts: `scripts/start-admin.bat`, `scripts/stop-admin.bat`.
- **Validación cloud de licencias:** Cada 7 días el sistema local valida la key contra la API cloud. Si no hay internet, sigue funcionando con cache de hasta 14 días. Trial no requiere validación cloud. Admin sync-keys al generar.
- **Bloqueo por licencia:** Middleware que bloquea todas las APIs cuando el trial vence o no hay licencia activa. Solo deja pasar health, license/status y license/activate.
- **Landing page:** `docs/index.html` — página estática dark theme responsive servida via GitHub Pages (`kamiikasee05.github.io/tustock`). Incluye hero, features, planes, caso real, FAQ, WhatsApp CTA.
- **Mercado Pago:** Integración con dos apps (Checkout Pro para pagos únicos Básico/Pro, Suscripciones vía Plan compartido). Crear preferencias, webhook, verificar status. Admin tiene botón "Cobrar MP" y columna estado de pago. Suscripciones: Plan único `preapproval_plan` ($8K/mes) con link compartido, webhook registra nuevas suscripciones, admin las vincula a licencias desde el panel. Requiere `TUSTOCK_MP_TOKEN` configurado.
- **Guía de Usuario PDF** generada automáticamente
- **Documentación legal:** Términos y Condiciones de Uso + EULA, Política de Privacidad, Política de Reembolso y Cancelación (`legal/`). Links en footer de landing page y referenciados desde el registro cloud.
- **EULA clickwrap:** Modal en primera ejecución que obliga a aceptar términos. Endpoints para servir documentos legales (`/api/license/terms`, `/api/license/privacy`, `/api/license/refund`).
- **Consentimiento explícito:** Checkbox obligatorio de aceptación de Términos + Política de Privacidad en formulario de registro del Monitor Cloud.
- **Baja de cuenta cloud:** Endpoint `POST /api/business/delete-account` con confirmación por email. Soft-delete del Business + eliminación de MetricsPush. UI en dashboard con botón "Eliminar mi cuenta".

---

## 4. QUÉ NO ESTÁ CONSTRUIDO (NO VENDER, NO PROMETER)

| Feature | Está en docs | Realidad | Acción |
|---------|:-----------:|:--------:|--------|
| Backup en la nube | Pro (planeado) | ❌ No existe | El flag `backup_enabled: True` está en el modelo pero el feature no se construyó. No prometer. |
| Multi-PC / multi-sucursal | Pro (planeado) | ❌ No existe | No prometer |
| Múltiples perfiles de cajero | Pro (planeado) | ❌ No existe | No prometer |
| Monitor Cloud (push-based, URL fija) | Pro (planeado) | ✅ Construido y desplegado | `tustock.up.railway.app`. API cloud push-based, agente local, dashboard responsive, login multiusuario JWT. URL fija. |
| Sistema de licencias | Mencionado | ✅ Construido | `server/models/license.py`, `server/services/license_service.py`, `server/routes/license.py`. Frontend: `useLicense.ts`, `Settings.tsx`, `TrialBanner.tsx`, `Upgrade.tsx` |
| Trial mode | Mencionado | ✅ Construido | 30 días o 100 productos. Banner visible. Se auto-crea en primer arranque. |
| Feature gating (tiers) | Mencionado | ✅ Construido | Backend: límite de productos en create, informes y export gateados con 403. Frontend: `UpgradeBlock` en Reports, `TrialBanner` global. |
| Integración de pagos | Mencionado | ✅ Construido | Mercado Pago vía REST API en `cloud/payments.py`. Crear preferencias, webhook, verificar status. Admin muestra botón "Cobrar MP" y estado de pago. Requiere `TUSTOCK_MP_TOKEN` en Railway. |
| Validación cloud de licencias | — | ✅ Construido | Cada 7d valida key contra cloud. Offline fallback 14d. Admin sync keys al generar. Trial no requiere validación. |
| Tests automatizados | — | ❌ No existe | Postergado (Fase 4) |
| Docker / CI/CD | — | ❌ No existe | Postergado (Fase 4) |
| i18n (inglés) | — | ❌ No existe | No está en roadmap |
| Consentimiento explícito en registro cloud | — | ✅ Construido | Checkbox de aceptación de Términos + Política de Privacidad en formulario de registro del Monitor Cloud. Backend rechaza registro sin `accepts_terms: true`. |
| Baja de cuenta cloud (endpoint + UI) | — | ✅ Construido | Endpoint `POST /api/business/delete-account` con confirmación por email. Soft-delete del Business + eliminación de MetricsPush. UI en dashboard con botón "Eliminar mi cuenta". |
| EULA clickwrap en primera ejecución | — | ✅ Construido | Modal de aceptación de Términos y Condiciones en primera ejecución. Backend: `POST /api/license/accept-eula`. Frontend: EulaModal en Layout bloquea toda interacción hasta aceptar. |
| Registro de bases de datos AAIP | — | ❌ No existe | No se registró la base de datos de usuarios cloud ante la Agencia de Acceso a la Información Pública. Postergado (Legal — Semana 2). |

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

### Componentes del Monitor Cloud (en desarrollo — Fase 5)

| Componente | Rol | Estado |
|------------|-----|:------:|
| `cloud/api.py` | API FastAPI cloud, recibe push, sirve dashboard, login multiusuario | ✅ Desplegado en Railway |
| `cloud/dashboard.html` | Dashboard responsive (adaptado del local) | ✅ En producción |
| `cloud/agent.py` | Agente local en PC del cliente, pushea datos cada 30s | ✅ Funcionando |
| Despliegue | Railway (tier gratis) | ✅ `tustock.up.railway.app` |

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

### Cloudflare Tunnel (actual — a reemplazar)

1. Ejecutar `scripts\launcher.py --tunnel` (o TUSTOCK.bat opción 5)
2. Si falta `cloudflared.exe`, lo descarga automáticamente de GitHub
3. Cloudflare genera una URL pública `https://xxx.trycloudflare.com`
4. La clienta abre esa URL desde el celular e ingresa con sus credenciales

**Nota:** Este approach es temporario. Se reemplazará por Monitor Cloud (URL fija) en Fase 5.

**Seguridad (tunnel actual):**
- El tunnel apunta SOLO al puerto 8091 (monitor read-only), NUNCA al 8090 (admin)
- El monitor tiene su propio login (usuario/contraseña) independiente del token del admin
- Sin endpoints de escritura (POST/PUT/DELETE) expuestos
- Cloudflare Tunnel no requiere abrir puertos en el router
- La sesión expira a los 7 días, requiere re-login

---

## 6. FASE ACTUAL DEL ROADMAP

**Estamos en: Fase 1 y Fase 5 completas. Fase 1 (licencias + trial + feature gating) ✅. Monitor Cloud desplegado. Admin dashboard completo. Validación cloud de licencias implementada. Mercado Pago híbrido: Checkout Pro (pagos únicos) + Plan compartido (suscripciones).**

### Hitos alcanzados

- ✅ Análisis del proyecto y valorización (~$6K USD hoy, hasta $250K potencial)
- ✅ Definición de planes y precios (Básico $80K, Suscripción $8K/mes, Pro $160K)
- ✅ Diferenciación y propuesta de valor
- ✅ Guión de entrevista con clienta de librería
- ✅ Secuencia de WhatsApp para preventa, seguimiento y cierre
- ✅ **PRIMER CLIENTE: Librería. Pagó $60K entry + $6K/mes suscripción. Sin objeciones.**
- ✅ **Monitor Premium (Fase 4 adelantada)** implementado y disponible para clienta premium
- ✅ **Monitor Cloud** implementado, desplegado en Railway (`tustock.up.railway.app`) y funcionando con datos reales
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
- ✅ **Mercado Pago**: integración REST lista, token en Railway configurado, Checkout Pro y Plan compartido funcionando

### Prioridades actuales (Julio 2026)

| Prioridad | Tarea | Quién | Por qué es crítica |
|:---------:|-------|:-----:|-------------------|
| 🔥 1 | **(HUMANO) Testear webhook MP** | 🧑 HUMANO | Abrir admin panel → click "Configurar Webhook". El fix de DEV ya evita el error 400 (primero consulta el plan, solo hace PUT si el notification_url es diferente). CORS también agregado. |
| 🟡 2 | **Configurar Railway hobby ($5/mes)** | 🧑 HUMANO | Para 24/7 de validación cloud y monitor. |
| 🟢 3 | **Registrar bases de datos en AAIP** | 🧑 HUMANO | Obligación legal si hay datos personales en cloud (Ley 25.326 art. 21). |
| 🟢 4 | **CRM en Google Sheets** | 🖥 DEV | No perder oportunidades de venta |
| 🟢 5 | **Tests automatizados** | 🖥 DEV | Postergado hasta tener 5+ clientes |
| 🟢 6 | **Docker / CI/CD** | 🖥 DEV | Postergado hasta tener 10+ clientes |

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
    - Dispatcher: `-Title "🔄 TUSTOCK" -Message "Revisión completada" -Priority 3 -Tags "arrows_counterclockwise"`
    Esto aplica a TODOS los agentes, sin excepción.

### Stack que NO se cambia

- Backend: Python 3.9+ / FastAPI / SQLAlchemy / SQLite
- Frontend: React 18 + Vite + TypeScript (estilos inline, sin Tailwind/CSS modules)
- Android: Kotlin + CameraX + ML Kit (congelado, no tocar)
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
| Facebook Groups (kiosqueros, almaceneros) | 🟡 Pendiente | 🔥 Alta |
| Mercado Libre | 🟡 Pendiente (crear cuenta) | 🔥 Alta |
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
- [feature] MONITOR CLOUD: API cloud con push del agente local, login multiusuario JWT, dashboard mobile responsive. Desplegado en Railway (`tustock.up.railway.app`). (2026-06-30)
- [feature] DASHBOARD ADMIN: Panel de administración de licencias en `/admin`, token separado. Generar keys, ver/revocar/activar licencias, stats por plan, ingresos estimados, trials por vencer. (2026-06-30)
- [feature] MERCADO PAGO: Integración REST en `cloud/payments.py`. Crear preferencias de pago, webhook notification, verificar status. Admin tiene botón "Cobrar MP" y columna de estado de pago. (2026-07-02)
- [feature] VALIDACION CLOUD: Sync de keys al cloud, validate contra API cloud, cache 7d con fallback offline 14d. Middleware bloquea APIs si licencia expirada o inválida. Trial no requiere validación. (2026-07-02)
- [feature] LANDING PAGE: `docs/index.html` — página estática dark theme responsive, GitHub Pages (`kamiikasee05.github.io/tustock`). Hero, features, planes, caso real, FAQ, WhatsApp CTA. (2026-07-02)
- [feature] BLOQUEO TRIAL: Middleware bloquea todas las APIs cuando trial vence o no hay licencia. Solo health + license/status + license/activate pasan. (2026-07-02)
- [feature] SUSCRIPCION MP RECURRENTE: `cloud/payments.py` con `create_subscription()` (preapproval), `get_subscription()`, `cancel_subscription()`. Modelo `Subscription` en cloud. Endpoint `POST /api/payments/subscribe` para Suscripcion $8K/mes con cobro recurrente automático. Webhook maneja `topic=preapproval` y `topic=payment`. Admin muestra botón "Suscribir MP" (púrpura) y estado de suscripción (Activa/Cancelada/Pendiente). (2026-07-04)
- [feature] GRACE PERIOD SUSCRIPCION: 7 días de gracia ante pago rechazado de suscripción MP. Webhook `topic=authorized_payment` actualiza `grace_period_end` en cloud. Validate devuelve `subscription_grace_days_left` y `subscription_suspended`. Banner progresivo en frontend (día 0/3/7+). Sistema nunca se bloquea, solo pierde updates + soporte. (2026-07-04)
- [feature] EULA CLICKWRAP: Modal de aceptación de Términos y Condiciones en primera ejecución. Backend: modelo License con `eula_accepted`, endpoint `POST /api/license/accept-eula`. Frontend: componente EulaModal en Layout que bloquea toda interacción hasta aceptar. Endpoints para servir documentos legales: `/api/license/terms`, `/api/license/privacy`, `/api/license/refund`. (2026-07-04)
- [feature] CONSENTIMIENTO REGISTRO CLOUD: Checkbox obligatorio de aceptación de Términos y Política de Privacidad en el formulario de registro del Monitor Cloud. Modelo Business con `terms_accepted`. Backend rechaza registro sin `accepts_terms: true`. (2026-07-04)
- [feature] BAJA DE CUENTA CLOUD: Endpoint `POST /api/business/delete-account` con confirmación por email. Elimina MetricsPush y anonimiza datos del Business (soft-delete con is_active=False). UI en dashboard con botón "Eliminar mi cuenta" y confirmación. Endpoints cloud para docs legales: `/api/licenses/terms`, `/api/licenses/privacy`, `/api/licenses/refund`. (2026-07-04)
- [feature] ADMIN SEPARADO: App independiente en `admin/` (Vite+React, puerto 5174). Removido del web/ principal. Scripts `start-admin.bat` y `stop-admin.bat`. Proxy `/api/admin` a localhost:8090. (2026-07-06)
- [feature] SUBSCRIPTION BANNER: Componente SubscriptionBanner muestra banner progresivo de grace period para suscripciones (día 0/3/7+). Integrado en Layout debajo de TrialBanner. (2026-07-06)
- [feature] DB LOCAL REPARADA: Columnas faltantes agregadas a `tustock.db` via ALTER TABLE: `subscription_grace_days_left`, `subscription_suspended`, `eula_accepted`, `eula_accepted_at`. (2026-07-06)
- [feature] WEBHOOK MP FIX: update_plan_notification_url ahora consulta GET /preapproval_plan/{id} primero para verificar si notification_url ya está seteado. Solo hace PUT si es diferente, evitando error 400 "Properties to update are required". (2026-07-07)
- [feature] CORS CLOUD API: Agregado CORSMiddleware con allow_origins=["*"] en cloud/api.py para permitir llamadas desde el admin panel (localhost:5174) a la cloud API (tustock.up.railway.app). (2026-07-07)

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
| 2026-06-30 | **Monitor Cloud desplegado en Railway**: `tustock.up.railway.app`. API push-based, agente local funcionando con datos reales, dashboard multiusuario. Clienta premium configurada (`libreria@tustock.com`). | DEV + Humano |
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
| 2026-07-06 | **Plan activo ID**: `492a6877398e4831a2d36f2159320f1c` — link de suscripción `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=492a6877398e4831a2d36f2159320f1c` — funcional y probado (hermana se suscribió). Webhook pendiente de configurar en el plan. | DEV + Humano |
| 2026-07-06 | **Modelo híbrido MP confirmado**: Checkout Pro para pagos únicos (Básico/Pro) + Plan compartido para suscripciones. Dos apps de MP separadas (selector de producto excluyente). Admin vincula suscripciones manualmente desde el panel. | DEV + Humano + Dispatcher |
| 2026-07-06 | **Admin separado del proyecto**: App independiente en `admin/` (Vite+React, puerto 5174). Removido del web/ principal y de App.tsx. Scripts `start-admin.bat` y `stop-admin.bat`. `.gitignore` actualizado para `admin/dist/`. | DEV |
| 2026-07-06 | **DB local reparada**: Columnas faltantes (`subscription_grace_days_left`, `subscription_suspended`, `eula_accepted`, `eula_accepted_at`) agregadas a `tustock.db` via ALTER TABLE. El modelo License ya las tenía pero no existían en la DB física. | DEV |
| 2026-07-07 | **Webhook MP fix**: update_plan_notification_url ahora verifica GET primero, solo hace PUT si notification_url es diferente. Evita error 400. | DEV |
| 2026-07-07 | **CORS cloud API**: Agregado CORSMiddleware para permitir llamadas desde admin panel (localhost:5174 → tustock.up.railway.app). | DEV |

---
## 13. EQUIPO LEGAL

> **Agente Legal:** Abogado especialista en servicios digitales (IA). Asesora en cumplimiento normativo, redacta términos legales, protege al proyecto de riesgos jurídicos. Sus directivas en materia legal son vinculantes para DEV y Ventas.

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
| 🟢 6 | Registro de bases de datos AAIP | ❌ Pendiente | 🧑 HUMANO |

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

### 🐛 Bugs activos

*(No hay bugs activos conocidos)*

### ⚠️ Observaciones

| Archivo | Detalle |
|---------|---------|
| `server/auth.py` | `verify_token` usa comparación directa `!=` en lugar de `secrets.compare_digest()`. El admin SÍ usa timing-safe. |
| `server/migrations/` | Directorio vacío. No hay sistema de migraciones (Alembic). |
| `web/package.json` | `recharts` y `lucide-react` instalados pero **no se usan** en ningún componente. |
| `server/services/license_service.py` | `validate_against_cloud` timeout 10s — podría fallar en conexiones lentas. |
| `server/config.py` | `TUSTOCK_CLOUD_CACHE_DAYS` = 7 hardcodeado. MEMORY menciona 14 días porque el máximo absoluto es `CACHE_DAYS + 7` en `check_cloud_validation()`. |

---

*Última actualización: 7 de Julio de 2026*
