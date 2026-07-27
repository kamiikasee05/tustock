# Configurar Monitor Cloud — Guía de Vinculación

## Cómo funciona

Cuando instalás TUSTOCK en una PC, el **agente cloud** puede enviar métricas de ventas al Monitor Cloud para que las veas desde tu celular. Para eso, la instalación local necesita una **API key** que la vincule a tu cuenta del Monitor Cloud.

### Flujo automático (recomendado)

```
PC del cliente                         Cloud (Railway)
┌─────────────────┐                   ┌─────────────────────┐
│ TUSTOCK local   │                   │ tustock.up.railway  │
│                 │                   │                     │
│ configurar.bat  │── POST ──────────>│ /api/register-     │
│ (email + name)  │<── api_key ──────│   from-install     │
│                 │                   │                     │
│ config/cloud.json                   │  Crea Business +   │
│ {api_url, key}  │── POST /push ──> │  guarda key        │
│                 │   (cada 30s)      │                     │
└─────────────────┘                   └─────────────────────┘
```

1. El cliente ejecuta `configurar.bat`
2. Ingresá email y nombre del negocio
3. El script llama a `POST /api/register-from-install`
4. La cloud crea la cuenta y devuelve una API key + contraseña temporal
5. La API key se guarda en `config/cloud.json`
6. El agente cloud arranca automáticamente con TUSTOCK

### Flujo manual (PCs existentes)

Si TUSTOCK ya está instalado y querés agregar el Monitor Cloud:

**Opción A — desde TUSTOCK.bat:**
1. Ejecutá `TUSTOCK.bat`
2. Elegí opción **6. Configurar Monitor Cloud**
3. Elegí opción **1. Crear cuenta nueva**

**Opción B — script PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\fix-cloud-agent.ps1
```

**Opción C — manual:**
1. Abrí `config\cloud.json` (crealo si no existe)
2. Poné:
   ```json
   {
     "api_url": "https://tustock.up.railway.app",
     "api_key": "TU-API-KEY-AQUI"
   }
   ```
3. La API key la obtenés del admin o creando la cuenta con el script

## Endpoints involucrados

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/register-from-install` | POST | No | Crea cuenta + devuelve api_key y password |
| `/api/push` | POST | API key | Recibe métricas del agente local |
| `/api/login` | POST | No | Login con email + password |

## Verificar si el agente está conectado

### Desde la PC del cliente
1. Abrí `config\cloud.json` — debe tener `api_url` y `api_key`
2. Verificá que el proceso `cloud_agent` esté corriendo (Task Manager → python)
3. Mirá la consola al iniciar TUSTOCK — dice "Cloud Agent iniciado (PID XXXX)"

### Desde el Monitor Cloud
1. Entrá a `https://tustock.up.railway.app`
2. Login con el email y contraseña de la cuenta
3. Si ves datos de ventas, el agente está conectado
4. Si dice "El negocio aún no ha enviado datos", el agente no está corriendo

### Test manual del agente
```bash
python cloud/agent.py --once
```
Si devuelve `{"ok": true, "pushed": "2026-07-23"}`, la conexión funciona.

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| "El email ya está registrado" | La cuenta ya existe en la cloud | Usá la opción 2 (API key manual) o entrá a la URL del Monitor Cloud con ese email |
| Error de conexión al crear cuenta | Sin internet o cloud caída | Verificá conexión a internet. Si la cloud está caída, configurá manualmente `config\cloud.json` con una API key previamente generada |
| Agente no arranca | Falta `config\cloud.json` o está vacío | Ejecutá `configurar.bat` o la opción 6 de `TUSTOCK.bat` |
| Datos no llegan a la cloud | API key inválida o agente detenido | Verificá `config\cloud.json`, reiniciá TUSTOCK, o ejecutá `python cloud/agent.py --once` |
| "API key inválida" en push | La API key no existe en la cloud | Regenerá la key desde el admin, o creá una nueva cuenta con `configurar.bat` |
| Agente se detiene | Error en la DB local | Verificá que `tustock.db` existe y no está corrupto |

## Archivos involucrados

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `config/cloud.json` | Raíz del proyecto | Configuración del agente (api_url + api_key) |
| `cloud/agent.py` | Cloud | Agente que lee DB local y pushea métricas |
| `cloud/api.py` | Cloud (deployed) | API cloud con endpoint register-from-install |
| `configurar.bat` | Raíz | Script de configuración interactiva |
| `scripts/fix-cloud-agent.ps1` | Scripts | Fix manual para PCs existentes |
| `scripts/launcher.py` | Scripts | Launcher con wizard de cloud setup |
