# PoC: Instalador PyInstaller para TUSTOCK

**Fecha:** 14 de Julio de 2026
**Autor:** DEV (Agente)
**Objetivo:** Investigar si PyInstaller puede empaquetar TUSTOCK en un .exe funcional.

---

## Resultado: ✅ FUNCIONA

El servidor arranca, escucha en puerto 8090, responde `/api/health` y `/api/server-info`. La base de datos SQLite se crea automáticamente. La licencia trial se inicializa correctamente.

### Pruebas realizadas

| Prueba | Resultado |
|--------|:---------:|
| `GET /api/health` | `{"status": "ok"}` |
| `GET /api/server-info` | Devuelve hostname, IPs, puerto, URLs |
| Inicialización de DB | SQLite crea `tustock.db` automáticamente |
| Licencia trial | Se inicializa: `trial (TST-C1A4-E511-34C6-4533)` |
| Frontend React | `web/dist/` servido correctamente (SPA fallback) |
| .env loading | Token cargado desde `.env` empaquetado |

---

## Tamaño del bundle

| Componente | Tamaño |
|------------|-------:|
| **Total bundle** | **~101 MB** |
| `TUSTOCK.exe` | ~11 MB |
| `scripts/cloudflared.exe` | ~51.7 MB |
| `PIL` (Pillow) | ~12.7 MB |
| `pydantic_core` | ~4.8 MB |
| Resto (Python, FastAPI, SQLAlchemy, etc.) | ~20 MB |
| Frontend React (`web/dist/`) | ~0.3 MB |
| **Sin cloudflared.exe** | **~49 MB** |

### Nota sobre `cloudflared.exe`

El 51% del bundle es `scripts/cloudflared.exe` (binario de Cloudflare Tunnel). Opciones para producción:
1. **Excluir del bundle** y descargar on-demand (requiere cambio en launcher)
2. **Mantenerlo** si el instalador debe ser self-contained
3. **Separar en un instalador post-descarga** (recomendado para reducir tamaño)

---

## Arquitectura del empaquetado

### Entry point: `installer/tustock_entry.py`

PyInstaller no puede usar `server/main.py` directamente porque `config.py` resuelve rutas relativas a `__file__`, que en el bundle apunta a `_internal/server/`. Se creó un wrapper que:

1. Detecta entorno PyInstaller (`sys.frozen`)
2. Carga `.env` manualmente (sin dependencia de `python-dotenv`)
3. Agrega `_internal/server/` a `sys.path`
4. Importa `main.app` y ejecuta `uvicorn.run()`

### Estructura del bundle

```
dist/TUSTOCK/
  TUSTOCK.exe              ← Entry point (wrapper)
  _internal/
    server/                ← Código Python del servidor
      .env                 ← Tokens (copiado del proyecto)
      .env.example
    web/dist/              ← Frontend React compilado
      index.html
      assets/
    monitor/               ← Monitor local
    cloud/                 ← Cloud agent
    scripts/               ← Scripts + cloudflared.exe
    legal/                 ← Documentos legales HTML
```

### Resolución de rutas

`config.py` usa `Path(__file__).resolve().parent.parent` como `BASE_DIR`. En el bundle:
- `__file__` = `.../_internal/server/config.py`
- `BASE_DIR` = `.../_internal/`
- `WEB_DIR` = `.../_internal/web/dist/` ✓
- `DATABASE_URL` = `sqlite:///.../_internal/tustock.db` ✓

Las rutas resuelven correctamente porque los data files se colocan en `_internal/` (mismo directorio que `BASE_DIR`).

---

## Archivos creados (en `installer/`)

| Archivo | Propósito |
|---------|-----------|
| `tustock.spec` | Spec file de PyInstaller (one-folder mode) |
| `tustock_entry.py` | Wrapper de entrada para PyInstaller |
| `test-stdout.log` | Logs de prueba (temp) |
| `test-stderr.log` | Logs de prueba (temp) |

---

## Problemas encontrados y solucionados

### 1. `TUSTOCK_TOKEN no está configurado` (RESUELTO)

**Causa:** `config.py` usa `python-dotenv` para cargar `.env`, pero en el bundle PyInstaller, `load_dotenv()` no encuentra el archivo porque `__file__` resuelve a una ruta diferente.

**Solución:** Wrapper `tustock_entry.py` carga `.env` manualmente con parser propio (sin dependencias externas) y setea `os.environ` antes de importar `main.py`.

### 2. Puerto diferente al configurado (RESUELTO)

**Causa:** Primera ejecución mostró puerto 8099 en vez de 8090. Causa: el server de desarrollo ya estaba corriendo en 8090.

**Solución:** Matar el server de desarrollo antes de testear. En producción no habría conflicto.

### 3. Stdout/stderr no capturan uvicorn output

**Causa:** Uvicorn redirige su logging internamente, no pasa por stdout/stderr del proceso.

**Solución:** El wrapper escribe a `server/logs/server.log`. Los logs se verifican ahí.

---

## Decisiones pendientes para producción

| Decisión | Opciones | Recomendación |
|----------|----------|:-------------:|
| **Tamaño del bundle** | 101 MB total, 49 MB sin cloudflared | Excluir cloudflared, descargar on-demand |
| **.env management** | Incluir en bundle vs. generar en instalación | Generar en instalación (evita hardcodear tokens) |
| **Updater** | Sin auto-update vs. descarga manual | Descarga manual por ahora |
| **Firma digital** | Sin firmar vs. certificado | Sin firmar (costo adicional, no bloqueante) |
| **Antivirus** | Posible falsos positivos | Incluir instrucciones para whitelist |

---

## Conclusión

**PyInstaller SÍ puede empaquetar TUSTOCK en un .exe funcional.** El PoC demuestra que:
- El servidor arranca correctamente
- La DB se crea/inicializa automáticamente
- El frontend React se sirve
- Los endpoints de API funcionan
- La resolución de rutas funciona con el wrapper

**El bloqueo NO es técnico.** Los únicos items pendientes son de configuración del instalador (tamaño, updater, firma), no de compatibilidad.

**Próximos pasos (si se decide avanzar):**
1. Crear script de build automatizado (`installer/build.bat`)
2. Decidir manejo de `cloudflared.exe` (excluir vs. incluir)
3. Crear script de instalación (copia de archivos + acceso directo)
4. Probar en PC sin Python instalado (target real del .exe)
5. Testear con Windows Defender (falsos positivos)
