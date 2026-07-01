# MEMORY — TUSTOCK

> Este archivo es la fuente de verdad compartida entre el **Agente de Ventas** (sales agent) y el **Agente de Desarrollo** (DEV). Lo leo al inicio de cada sesión para saber el estado actual.
>
> **Rol de Ventas (YO):** Conozco el producto, el mercado, los precios. Organizo, coordino y le asigno tareas humanas al usuario para vender.
>
> **Rol de DEV (asistente de código):** Construye exclusivamente lo que está definido aquí. No inventa features. No desarrolla fuera del roadmap.
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
- **Dashboard admin de licencias:** Panel `/admin` con token separado. Generar keys, ver licencias, revocar/activar, stats por plan.
- **Guía de Usuario PDF** generada automáticamente

---

## 4. QUÉ NO ESTÁ CONSTRUIDO (NO VENDER, NO PROMETER)

| Feature | Está en docs | Realidad | Acción |
|---------|:-----------:|:--------:|--------|
| Backup en la nube | Pro (planeado) | ❌ No existe | No prometer |
| Multi-PC / multi-sucursal | Pro (planeado) | ❌ No existe | No prometer |
| Múltiples perfiles de cajero | Pro (planeado) | ❌ No existe | No prometer |
| Monitor Cloud (push-based, URL fija) | Pro (planeado) | ✅ Construido y desplegado | `tustock.up.railway.app`. API cloud push-based, agente local, dashboard responsive, login multiusuario JWT. URL fija. |
| Sistema de licencias | Mencionado | ✅ Construido | `server/models/license.py`, `server/services/license_service.py`, `server/routes/license.py`. Frontend: `useLicense.ts`, `Settings.tsx`, `TrialBanner.tsx`, `Upgrade.tsx` |
| Trial mode | Mencionado | ✅ Construido | 30 días o 50 productos. Banner visible. Se auto-crea en primer arranque. |
| Feature gating (tiers) | Mencionado | ✅ Construido | Backend: límite de productos en create, informes y export gateados con 403. Frontend: `UpgradeBlock` en Reports, `TrialBanner` global. |
| Integración de pagos | Mencionado | ❌ No existe | **Pendiente de construir (Fase 1)** |
| Tests automatizados | — | ❌ No existe | Postergado (Fase 4) |
| Docker / CI/CD | — | ❌ No existe | Postergado (Fase 4) |
| i18n (inglés) | — | ❌ No existe | No está en roadmap |

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

**Estamos en: Fase 1 y Fase 5 completas. Fase 1 (licencias + trial + feature gating) ✅. Monitor Cloud desplegado. Próximo: integración de pagos (Mercado Pago).**

### Hitos alcanzados

- ✅ Análisis del proyecto y valorización (~$6K USD hoy, hasta $250K potencial)
- ✅ Definición de planes y precios (Básico $60K, Suscripción $6K/mes, Pro $120K)
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

### Prioridades actuales (reordenadas post-venta)

| Prioridad | Tarea | Quién | Por qué es crítica |
|:---------:|-------|:-----:|-------------------|
| 🔥 1 | **Corregir gating para Básico** (`export_enabled: true`) | 🖥 DEV | ✅ Hecho. Matriz aprobada. Export Excel va en todos los planes pagos. |
| 🔥 2 | **Alinear Upgrade.tsx con la matriz aprobada** | 🖥 DEV | ✅ Hecho. Quitar "Exportación Excel" de la lista de "no incluye" en la card de Básico. |
| 🔥 3 | **Dashboard admin de licencias** | 🖥 DEV | ✅ Hecho. Panel `/admin`, token separado, generar keys, ver/revocar/activar, stats. |
| 🔥 4 | **Integración Mercado Pago** | 🖥 DEV | Para cobrar automáticamente sin intervención humana. |
| 🟡 5 | **Landing page estática** | 🖥 DEV | Para tener presencia web y recibir leads |
| 🟡 6 | **CRM en Google Sheets** | 🖥 DEV | Para no perder oportunidades de venta |
| 🟡 5 | **Monitor Cloud (push-based, URL fija)** | 🖥 DEV | **COMPLETO.** Reemplaza Cloudflare Tunnel. Arquitectura híbrida: agente local pushea a API cloud. Login multiusuario. Dominio fijo. Desplegado en Railway. |
| 🟡 6 | **Landing page estática** | 🖥 DEV | Para tener presencia web y recibir leads |
| 🟢 7 | **CRM en Google Sheets** | 🖥 DEV | Para no perder oportunidades de venta |
| 🟢 8 | **Tests automatizados** | 🖥 DEV | Postergado hasta tener 5+ clientes |
| 🟢 9 | **Docker / CI/CD** | 🖥 DEV | Postergado hasta tener 10+ clientes |

### Tareas HUMANAS pendientes

| Prioridad | Tarea | Tiempo estimado |
|:---------:|-------|:---------------:|
| 🔥 1 | **Instalar Monitor Premium en PC de la clienta** (Cloudflare Tunnel) | 1 hora |
| 🔥 2 | **Cobrar $6K suscripción mes siguiente** (recordatorio) | 5 min |
| 🔥 3 | **Pedir testimonio/caso de éxito a la clienta** (con foto del negocio si acepta) | 30 min |
| 🔥 4 | **Pedir referidos** a la clienta ("¿conocés otro comerciante que necesite esto?") | 10 min |
| 🟡 5 | **Publicar en grupos de Facebook** el caso de éxito (anonimizado si prefiere) | 30 min |
| 🟡 6 | **Crear cuenta de Mercado Libre** para publicar TUSTOCK | 1 hora |
| 🟡 7 | **Crear cuenta de Mercado Pago** (si no tenés) para cobrar | 30 min |
| 🟢 8 | **Publicar en Mercado Libre** con el texto que prepare | 30 min |
| 🟢 9 | **Ir a 3-5 polirrubros del barrio** a ofrecer el sistema personalmente | 2 horas |

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

---

*Última actualización: 30 de Junio de 2026*
