---
tags:
  - tustock
  - instalacion
  - setup
---

# Instalación y Configuración

## Requisitos

| Herramienta | Versión mínima | ¿Para qué? |
|-------------|---------------|------------|
| **Python** | 3.9 o superior | Ejecutar el servidor |
| **Node.js** | 18 o superior | Compilar la interfaz web |
| **Android Studio** | Hedgehog (2023.1) | *(solo si vas a compilar la app Android)* |

### Verificar instalación

```powershell
python --version
node --version
```

Si no tenés Python, descargalo de [python.org](https://python.org).  
Si no tenés Node.js, descargalo de [nodejs.org](https://nodejs.org) (versión LTS).

---

## Instalación

### Opción 1: Desde GitHub (recomendada)

```powershell
git clone https://github.com/kamiikasee05/tustock.git
cd tustock
scripts\setup.bat
```

### Opción 2: Manual

```powershell
# Backend
cd server
pip install -r requirements.txt

# Frontend
cd ..\web
npm install
npm run build
```

---

## Iniciar el sistema

### Modo producción

```powershell
scripts\start.bat
```

Esto inicia el servidor. Abrí `http://localhost:8090` en el navegador.

### Modo desarrollo

```powershell
scripts\dev.bat
```

Inicia el servidor en `:8090` y el frontend con hot-reload en `:3000`. Útil si estás haciendo cambios al código.

---

## Configuración avanzada

El sistema usa variables de entorno para configuración. Creá un archivo `.env` en la carpeta `server/` si necesitás cambiarlas:

```env
# Puerto del servidor (default: 8090)
TUSTOCK_PORT=8090

# Dirección de escucha (default: 127.0.0.1 = solo local)
# Usar 0.0.0.0 si necesitás que la app Android se conecte desde otro dispositivo
TUSTOCK_HOST=0.0.0.0

# Ruta de la base de datos
TUSTOCK_DB=C:\TUSTOCK\datos\tustock.db

# Token de seguridad (cambialo en producción)
TUSTOCK_TOKEN=mi-token-seguro-personalizado
```

### Permitir conexión desde la app Android

Por defecto el servidor solo acepta conexiones locales (`127.0.0.1`). Para usar la app Android:

1. Configurá `TUSTOCK_HOST=0.0.0.0`
2. Averiguá la IP de tu PC en la red local (comando `ipconfig`)
3. En la app Android, configurá la URL: `http://192.168.1.X:8090`

### Cambiar el token de seguridad

El token por defecto es `tustock-local-token`. Para mayor seguridad:

1. Cambiá la variable `TUSTOCK_TOKEN` en el `.env`
2. Actualizá el mismo token en:
   - `web/src/api/client.ts` → constante `TOKEN`
   - `android/.../ApiClient.kt` → variable `token`

---

## Solución de problemas

### "El puerto 8090 ya está en uso"

Cambiá el puerto con `TUSTOCK_PORT=8091` en el `.env`.

### "No se puede conectar al servidor" desde la app Android

1. Verificá que `TUSTOCK_HOST=0.0.0.0`
2. Verificá que el firewall de Windows permita conexiones entrantes al puerto 8090
3. Verificá que el celular esté en la misma red WiFi que la PC

### "npm no se reconoce"

Node.js no está instalado o no está en el PATH. Reinstalá Node.js desde [nodejs.org](https://nodejs.org).

### La base de datos se corrompió

Restaurá desde un backup: [[Backup y Restauración]].
