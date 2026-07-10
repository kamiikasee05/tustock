# Registro de Base de Datos en AAIP

> **Asignado a:** 🧑 HUMANO
> **Prioridad:** 🟢 Media
> **Base legal:** Ley 25.326, art. 21 — Registro Nacional de Bases de Datos Personales
> **Instructivo oficial:** [PDF instructivo TAD](https://www.argentina.gob.ar/sites/default/files/instructivo_tad_inscripcionymodificacionresponsable_basesprivadas_2.pdf)
> **Plataforma:** [TAD - Trámites a Distancia](https://tramitesadistancia.gob.ar)

---

## ⚠️ INFORMACIÓN IMPORTANTE

El proceso tiene **DOS PASOS** separados:

| Paso | Trámite en TAD | Estado |
|:----:|---------------|:------:|
| **1** | **Inscripción del Responsable** al RNBDP (primero te registrás vos como responsable) | ❌ Pendiente |
| **2** | **Registro de Bases de Datos Personales** (después registrás la BD de TUSTOCK) | ❌ Pendiente (requiere paso 1) |

> ❗ **NO buscaste "Registro de Bases de Datos" primero.** Tenés que empezar por el trámite de **"Inscripción del Responsable"**.

---

## ¿Qué hay que registrar?

La base de datos del **Monitor Cloud** que contiene datos personales de usuarios registrados. Está alojada en **Railway (EE.UU.)** con PostgreSQL.

### Datos personales almacenados en cloud

| Tabla | Campos con datos personales | Descripción |
|-------|----------------------------|-------------|
| `businesses` | `name` (nombre del negocio), `email`, `password_hash` | Titulares de cuenta del Monitor Cloud |
| `payments` | `customer_email`, `license_key` | Registro de pagos |
| `subscriptions` | `customer_email`, `license_key` | Suscripciones activas |
| `metrics_pushes` | `payload` (puede contener nombres de clientes deudores) | Métricas de ventas pushadas cada 30s |
| `authorized_keys` | `customer_name` | Licencias activas |
| `key_activations` | `machine_id`, `hostname` | Activaciones de licencia |

**Base de datos local (SQLite):** NO requiere registro porque los datos no salen de la PC del cliente.

---

# PASO 1: Inscripción del Responsable

### 1. Entrar a TAD

1. Andá a: **[https://tramitesadistancia.gob.ar](https://tramitesadistancia.gob.ar)**
2. Iniciá sesión con **Clave Fiscal nivel 2 o superior de AFIP**
3. En el menú izquierdo, buscá **"Agencia de Acceso a la Información Pública (AAIP)"**
4. Buscá el trámite: **"Inscripción del Responsable al Registro Nacional de Bases de Datos"**

### 2. Completar datos del trámite

Hacé click en **"Completar"** en "Datos del trámite" y marcá:

| Campo | Valor |
|-------|-------|
| **El responsable es** | `☑ Privado` ⬅️ **¡ESTE ES EL PUNTO CLAVE!** |
| **CUIT/CUIL** | `20-33489288-4` |
| **Denominación** | `Ricardo Ezequiel Godoy` |
| **Persona** | `Física` |
| **Apoderado/representante** | *(No aplica, dejá vacío)* |
| **Domicilio** | `Colón 350, Chamical (5380), La Rioja` |
| **Email** | `tustock.administracion@gmail.com` |
| **Teléfono** | `+54 9 3826 403110` |

> ✅ Al marcar **PRIVADO** y **PERSONA FÍSICA**, los campos de "Repartición" y "Actuación" **desaparecen** automáticamente (esos son solo para organismos públicos).

### 3. Confirmar

1. Tildá **"Leído"** en la declaración jurada
2. Adjuntá **copia de DNI** (digital, escaneado) como documentación respaldatoria
3. Hacé click en **"Guardar"**
4. Hacé click en **"Confirmar trámite"**

### 4. Esperar aprobación

Te va a llegar una notificación con el **Código de Responsable (RL-...)** asignado. Guardalo.

---

# PASO 2: Registro de la Base de Datos (solo después del paso 1)

Una vez que tengas el **Código de Responsable (RL-...)**, volvé a TAD y buscá:

> **"Registro de Bases de Datos Personales"**

Ahí completás los datos de la BD de TUSTOCK:

### Datos del responsable

| Campo | Valor |
|-------|-------|
| **Código de Responsable (RL)** | *(el que te asignaron en el paso 1)* |

### Datos de la base de datos

| Campo | Valor |
|-------|-------|
| **Nombre de la Base** | `TUSTOCK Monitor Cloud — Usuarios` |
| **Norma de creación respaldatoria** | `Ley 25.326 de Protección de Datos Personales` |
| **Finalidad** | Gestión de usuarios del Monitor Cloud, validación de licencias, procesamiento de pagos a través de Mercado Pago, envío de métricas de ventas, notificaciones sobre estado de licencia |
| **Carácter** | `Voluntario` |
| **Datos sensibles** | ❌ No |
| **Antecedentes penales** | ❌ No |
| **Tipo de datos** | ☑ Datos identificatorios — ☑ Datos comerciales, económicos y financieros |
| **Forma de recolección** | ☑ Directamente del titular |
| **Cesión de datos** | Sí — Railway Corporation (infraestructura cloud, EE.UU.), Mercado Pago S.A. (pagos) |
| **Forma de actualización** | ☑ Desde una aplicación (agente automático cada 30s) |
| **Periodicidad** | ☑ Diaria |
| **Conservación** | Determinado — mientras dure la relación contractual + 2 años |
| **Seguridad** | HTTPS/TLS, contraseñas con hash scrypt + salt, autenticación JWT, PostgreSQL con cifrado en reposo |
| **Interrelación** | ☑ Código único (email del usuario) |
| **Derechos ARCO** | ☑ Correo electrónico — ☑ Sitio web — ☑ Telefónicamente |

### Contacto para ARCO

| Campo | Valor |
|-------|-------|
| **Calle** | `Colón` |
| **Altura** | `350` |
| **Provincia** | `La Rioja` |
| **Localidad** | `Chamical` |
| **Código Postal** | `5380` |
| **Teléfono** | `+54 9 3826 403110` |
| **Correo electrónico** | `tustock.administracion@gmail.com` |

### Procedimiento ARCO

> *"El titular deberá enviar un correo electrónico a tustock.administracion@gmail.com o un mensaje de WhatsApp al +54 9 3826 403110, identificándose con el email de su cuenta. La solicitud será respondida dentro de los 10 días hábiles siguientes. También puede gestionar la baja de cuenta directamente desde el dashboard del Monitor Cloud."*

### Adjuntar

- **Copia de la Política de Privacidad** ✅ (ya existe en `legal/politica-de-privacidad.html`)
- **Copia de los Términos y Condiciones** ✅ (ya existe en `legal/terminos-y-condiciones.html`)

### Costo

**GRATUITO** — sin tasa de registro.

---

## Después del registro

1. ✅ Guardar el **número de expediente** que te asigne el TAD
2. ✅ Actualizar la **Política de Privacidad** cambiando sección 11 de *"procederá a registrar"* a *"se encuentra registrada"* (con número de registro)
3. ✅ Avisar al Dispatcher para actualizar **MEMORY.md** y **Checklist.md**

---

## Dudas o consultas

- **Email oficial AAIP:** registrobasesdedatos@aaip.gob.ar
- **Mesa de ayuda TAD:** https://tramitesadistancia.gob.ar/ayuda.html

---

## Referencias legales

- **Artículo 21 Ley 25.326:** *"Los archivos, registros o bancos de datos serán registrados ante el órgano de control."*
- **Artículo 29 Decreto 1558/2001:** Reglamenta el procedimiento de registro
- **Resolución AAIP 4/2019:** Nuevo sistema de registro digital vía TAD

---

## Enlaces útiles

| Recurso | URL |
|---------|-----|
| TAD (Trámites a Distancia) | https://tramitesadistancia.gob.ar |
| Instructivo oficial (PDF) | https://www.argentina.gob.ar/sites/default/files/instructivo_tad_inscripcionymodificacionresponsable_basesprivadas_2.pdf |
| Guía AAIP - Registro de Bases | https://www.argentina.gob.ar/aaip/datospersonales/registro |
| Ley 25.326 completa | https://www.argentina.gob.ar/aaip/datospersonales |
| Mi Argentina | https://www.argentina.gob.ar/miargentina |
| Mesa de ayuda TAD | https://tramitesadistancia.gob.ar/ayuda.html |

---

*Documento actualizado por el Dispatcher — 9 de Julio de 2026*
