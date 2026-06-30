# MEMORY — TUSTOCK

> Este archivo es la fuente de verdad compartida entre el **Agente de Ventas** (sales agent) y el **Agente de Desarrollo** (DEV). Lo leo al inicio de cada sesión para saber el estado actual.
> 
> **Rol de Ventas (YO):** Conozco el producto, el mercado, los precios. Organizo, coordino y le asigno tareas humanas al usuario para vender.
> 
> **Rol de DEV (asistente de código):** Construye exclusivamente lo que está definido aquí. No inventa features. No desarrolla fuera del roadmap.
> 
> **Regla especial — Cliente Premium:** La clienta que paga $60K entry + $6K/mes tiene acceso anticipado al Monitor Premium (Fase 4 adelantada). Ningún otro cliente lo recibe hasta que se lance oficialmente. Esta excepción queda registrada acá.

---

## 1. QUÉ ES TUSTOCK — Propuesta de Valor

Sistema de gestión de stock y ventas para polirrubros argentinos (kioscos, librerías, almacenes, etc.).

**Diferenciación única vs competidores:**
1. **Pago único** (o suscripción mensual barata) — no hay cuotas infinitas
2. **Sin internet** — funciona 100% local, no depende de la nube
3. **App Android incluida** — escáner de códigos con el celular
4. **Datos en tu PC** — nadie más ve la información del negocio
5. **Sin técnico** — lo instala el dueño en 15 minutos

**No competimos en:** features enterprise, contabilidad integrada, e-commerce, facturación electrónica (AFIP). Eso no es nuestro cliente.

---

## 2. PLANES Y PRECIOS (CONGELADO — NO CAMBIAR SIN REVISIÓN)

### Planes actuales (Junio 2026)

| Plan | Precio | Modelo | Qué incluye |
|------|--------|--------|-------------|
| **Trial** | Gratis | 30 días | Máximo 50 productos, sin informes, sin exportación |
| **Básico** | $60,000 ARS único | Pago único | Todo el sistema, app Android, 1 año de updates |
| **Suscripción** | $6,000 ARS/mes | Mensual | Todo incluido, updates continuos, soporte prioritario |
| **Pro** | $120,000 ARS único | Pago único (futuro) | Todo + multi-PC + cloud backup + export Excel |

### Reglas de negocio

- **Licencia perpetua**: dueño paga una vez y usa para siempre
- **Updates**: 1 año incluidos en Básico. Renovación: $24,000/año (40% del valor)
- **Suscripción**: se cancela cuando quiera. Si deja de pagar, el sistema sigue funcionando (pierde updates y soporte)
- **Trial**: 30 días o 50 productos (lo que ocurra primero). Banner visible de "modo trial"
- **Licencia por negocio, no por PC**: si cambia de computadora, reinstala y activa con la misma key
- **Descuentos por volumen**: 3-5 locales → 15%, 6-10 → 25%, +10 → a convenir

### Precios en USD (referencia, no se publica)

- Básico: ~$50 USD
- Pro: ~$100 USD
- Suscripción: ~$5 USD/mes

---

## 3. QUÉ ESTÁ CONSTRUIDO (REAL, NO ASPIRACIONAL)

Todo esto FUNCIONA y lo vendemos como parte del sistema:

- Dashboard con resumen diario y alertas de stock bajo
- Productos: ABM, código, precios, categorías, búsqueda, código de barras
- Stock: actual, movimientos (entrada/salida/ajuste), alertas
- Ventas POS: carrito, métodos de pago, descuentos, descuento automático de stock
- Clientes: registro, saldo "fiado", transacciones
- Vendedores: alta con DNI, desactivación
- Auditorías de stock: crear, escanear, completar, corregir stock automático
- Pedidos pendientes (desde app Android): aprobar→crea venta, rechazar
- Presupuestos: crear, aprobar→convierte a venta
- Informes diarios: totales, métodos de pago, top productos
- Exportación CSV y XLSX: ventas, productos (con margen bruto), vendedores, resumen mensual
- App Android: POS (tomar pedidos como vendedor) y Stock (escanear y contar)
- Escáner de código de barras con cámara (ML Kit)
- Generación de imagen de código de barras con precio
- Scripts de backup/restauración, setup, dev, start
- Servidor con SPA fallback para frontend compilado
- **Monitor Premium (Fase 4 adelantada):** Servicio independiente puerto 8091, login propio, dashboard mobile responsive, API read-only. Expuesto vía Cloudflare Tunnel para acceso remoto desde el celular. Solo esta clienta lo tiene.

---

## 4. QUÉ NO ESTÁ CONSTRUIDO (NO VENDER, NO PROMETER)

| Feature | Está en docs | Realidad | Acción |
|---------|:-----------:|:--------:|--------|
| Backup en la nube | Pro (planeado) | ❌ No existe | No prometer |
| Multi-PC / multi-sucursal | Pro (planeado) | ❌ No existe | No prometer |
| Múltiples perfiles de cajero | Pro (planeado) | ❌ No existe | No prometer |
| Panel web cloud para ver informes | Pro (planeado) | ✅ Existe (Fase 4 adelantada) | En producción SOLO para clienta premium. General release cuando se complete Fase 1-3 |
| Sistema de licencias | Mencionado | ❌ No existe | **Pendiente de construir (Fase 1)** |
| Trial mode | Mencionado | ❌ No existe | **Pendiente de construir (Fase 1)** |
| Feature gating (tiers) | Mencionado | ❌ No existe | **Pendiente de construir (Fase 1)** |
| Integración de pagos | Mencionado | ❌ No existe | **Pendiente de construir (Fase 1)** |
| Tests automatizados | — | ❌ No existe | Postergado (Fase 4) |
| Docker / CI/CD | — | ❌ No existe | Postergado (Fase 4) |
| i18n (inglés) | — | ❌ No existe | No está en roadmap |

---

## 5. ARQUITECTURA DEL MONITOR PREMIUM

> Solo disponible para la clienta premium ($60K entry + $6K/mes). Fase 4 adelantada.

### Componentes

| Componente | Archivo | Rol |
|------------|---------|-----|
| API + Auth | `monitor/app.py` | FastAPI en puerto 8091, login por cookie, endpoints read-only |
| Config | `monitor/config.py` | Puerto (8091), usuario/contraseña, DB URL |
| Dashboard | `monitor/dashboard.html` | SPA vanilla, responsive mobile-first, auto-refresh 30s |
| Iniciar | `scripts\start-monitor.bat` | Lanza con pythonw, fondo |

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | `/api/login` | No | Login con usuario/contraseña, setea cookie |
| GET | `/api/metrics` | Cookie | Dashboard completo: ventas hoy, método de pago, stock bajo, top productos, deudores |
| GET | `/api/metrics/summary` | Cookie | Resumen hoy vs mes |
| GET | `/api/health` | No | Health check para tunnel |

### Cloudflare Tunnel (exposición a internet)

1. Descargar cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
2. Ejecutar en servidor:
   ```
   cloudflared tunnel --url http://localhost:8091
   ```
3. Cloudflare genera una URL pública `https://xxx.trycloudflare.com`
4. La clienta abre esa URL desde el celular e ingresa con sus credenciales

**Seguridad:**
- El tunnel apunta SOLO al puerto 8091 (monitor read-only), NUNCA al 8090 (admin)
- El monitor tiene su propio login (usuario/contraseña) independiente del token del admin
- Sin endpoints de escritura (POST/PUT/DELETE) expuestos
- Cloudflare Tunnel no requiere abrir puertos en el router

---

## 6. FASE ACTUAL DEL ROADMAP

**Estamos en: Fase 0 — Investigación de Mercado**

### Tareas completadas

- ✅ Análisis del proyecto y valorización (~$6K USD hoy, hasta $250K potencial)
- ✅ Definición de planes y precios (Básico $60K, Suscripción $6K/mes, Pro $120K)
- ✅ Diferenciación y propuesta de valor
- ✅ Guión de entrevista con clienta de librería (mañana)
- ✅ Secuencia de WhatsApp para preventa, seguimiento y cierre
- ✅ **Monitor Premium (Fase 4 adelantada)** implementado para clienta premium ($60K + $6K/mes)

### En progreso

- 🔄 Entrevista con clienta de librería (mañana) — **tarea humana**

### Pendiente

| Fase | Tareas | Quién |
|------|--------|:-----:|
| 0 | Entrevistar 5-10 comerciantes | 🧑 Humano |
| 0 | Publicar encuesta en grupos de Facebook | 🧑 Humano |
| 0 | Validar precio $60K con entrevistados | 🧑 Humano |
| 0 | Mapa competitivo actualizado | 🧑 Humano |
| 1 | Modelo License en BD + feature gating | 🖥 DEV |
| 1 | Trial mode (30 días / 50 productos) | 🖥 DEV |
| 1 | Página /upgrade con planes | 🖥 DEV |
| 1 | Integración Mercado Pago | 🖥 DEV |
| 1 | Servidor de licencias MVP (Bot Telegram) | 🖥 DEV |
| 1 | Crear cuenta de pagos | 🧑 Humano |
| 2 | Landing page estática | 🖥 DEV |
| 2 | Guiones de venta (WhatsApp, llamada, demo) | 🖥 DEV |
| 2 | PDF de planes | 🖥 DEV |
| 2 | Video de 2 min del sistema | 🧑 Humano |
| 2 | Publicar en Mercado Libre | 🧑 Humano |
| 3 | CRM en Google Sheets | 🖥 DEV |
| 3 | Pipeline de seguimiento automático | 🖥 DEV |
| 3 | Hacer ventas, demos, instalaciones | 🧑 Humano |
| 4 | Tests automatizados | 🖥 DEV |
| 4 | Docker / CI/CD | 🖥 DEV |
| 4 | Conseguir revendedores | 🧑 Humano |

---

## 7. REGLAS PARA DEV

1. **No desarrollar nada que no esté en este roadmap.** Si surge una idea, documentarla abajo en "Ideas en espera", no codearla.
2. **No modificar precios, planes ni lógica de negocio** sin consultar con Ventas (YO).
3. **Prioridad absoluta a Fase 1:** sistema de licencias, trial mode, feature gating, página de planes, integración de pagos. Sin esto no podemos vender.
4. **El frontend y backend deben seguir funcionando en localhost sin internet.** La validación de licencia debe cachearse mínimo 7 días offline.
5. **Código limpio, sin comentarios, siguiendo el estilo existente** (Python con type hints, TypeScript sin strict mode, estilos inline en React).
6. **No agregar dependencias innecesarias.** Si se necesita una nueva, justificarla.
7. **No tocar la app Android** a menos que se indique explícitamente.
8. **No internacionalizar.** Solo español.

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
- **Plan Premium:** Mirá las ventas desde el celular donde estés (monitor remoto)

**Qué NO decimos (porque no existe):**
- No decimos "backup automático en la nube"
- No decimos "sincronización entre sucursales"
- No decimos "múltiples cajeros con perfiles"
- No decimos "integración con Mercado Libre / Tiendanube"

**Manejo si preguntan por cloud:**
> "Todo corre en tu propia PC, así que tus datos no salen de tu negocio. Si querés hacer backup, el sistema te lo permite con un solo clic, y podés guardarlo donde quieras: un pendrive, Google Drive, lo que prefieras."

**Manejo si preguntan por monitor remoto:**
> "Eso es parte del plan Pro. Conectamos una ventanita segura por Cloudflare Tunnel que solo muestra informes. No se puede modificar nada. Se ve desde el celular."

---

## 9. CANALES DE VENTA AUTORIZADOS

| Canal | Estado | Prioridad |
|-------|:-----:|:---------:|
| WhatsApp directo a comerciantes locales | 🟢 Activo | 🔥 Alta |
| Facebook Groups (kiosqueros, almaceneros) | 🟡 Pendiente | 🔥 Alta |
| Mercado Libre | 🟡 Pendiente (crear cuenta) | 🔥 Alta |
| Boca a boca / referidos | 🟢 Activo (cuando tengamos clientes) | 🟡 Media |
| Proveedores mayoristas (comisión) | 🔴 Futuro | 🟢 Baja |
| Mercado de apps Tiendanube/Empretienda | 🔴 Futuro | 🟢 Baja |

---

## 10. IDEAS EN ESPERA (NO TOCAR)

> Estas ideas están documentadas pero **no aprobadas para desarrollar**. Solo se considerarán cuando las fases 0-3 estén completas.

- Múltiples idiomas
- Facturación electrónica AFIP
- Integración con Mercado Libre (sincronizar stock)
- App iOS
- Dashboard en la nube (web app externa)
- Módulo de proveedores con órdenes de compra
- Notificaciones push a Android
- Modo oscuro

---

## 11. HISTORIAL DE DECISIONES

| Fecha | Decisión | Quién |
|------|----------|:-----:|
| 2026-06-30 | Precio Básico fijado en $60K ARS único | Ventas |
| 2026-06-30 | Suscripción fijada en $6K ARS/mes | Ventas |
| 2026-06-30 | Pro fijado en $120K ARS único (futuro) | Ventas |
| 2026-06-30 | Trial: 30 días o 50 productos, sin informes | Ventas |
| 2026-06-30 | Feature gating backend + frontend para licencias | DEV (pendiente) |
| 2026-06-30 | Prioridad Fase 1 sobre Fase 2-4 | Ventas |
| 2026-06-30 | Android app congelada (no tocar) | Ventas |
| 2026-06-30 | No prometer cloud backup ni multi-PC | Ventas |
| 2026-06-30 | Entrevista clienta librería mañana (validación mercado) | Humano |
| 2026-06-30 | Fase 4 (Monitor Premium) adelantada SOLO para clienta premium ($60K entry + $6K/mes) | Ventas |
| 2026-06-30 | Monitor Premium implementado: puerto 8091, login propio, dashboard mobile, Cloudflare Tunnel | DEV |

---

*Última actualización: 30 de Junio de 2026*
