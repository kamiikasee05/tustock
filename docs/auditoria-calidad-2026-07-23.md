# Auditoría de Calidad — TUSTOCK

> **Fecha:** 23 de Julio 2026
> **Agente:** Auditoría de Calidad
> **Alcance:** Integral — todos los componentes del ecosistema
> **Trigger:** GAP descubierto con vinculación Monitor Cloud + instalación local

---

## Resumen ejecutivo

| Severidad | Cantidad |
|-----------|:--------:|
| 🔥 Crítica | 3 |
| 🟡 Alta | 5 |
| 🟢 Media | 4 |
| ⚪ Baja | 2 |
| **Total** | **14** |

**Hallazgo principal:** Hay 3 vulnerabilidades de seguridad que podrían permitir falsificación de pagos, robo de tokens JWT, y bypass del consentimiento legal. Además, el flag `backup_enabled: True` se devuelve a clientes Pro sin que la feature exista — publicidad engañosa.

---

## HALLAZGO-01: Webhook de MP no valida firma

- **Categoría:** C (Seguridad)
- **Severidad:** 🔥 Crítica
- **Componente:** `cloud/api.py:686` — endpoint `POST /api/payments/webhook`
- **Descripción:** El endpoint de webhook de Mercado Pago no valida el header `x-signature` que MP envía para autenticar las notificaciones. Cualquiera que conozca la URL puede hacer POST con un `data_id` fake y que el sistema lo procese. Aunque el endpoint luego llama a `get_payment()` para verificar, un atacante podría enviar un `topic=preapproval` con un ID válido conocido para manipular el estado de una suscripción.
- **Impacto:** Cualquier persona externa podría manipular estados de pago/suscripción. Riesgo financiero.
- **Recomendación:** Implementar validación de `x-signature` header del webhook de MP usando `HMAC-SHA256` con el secret del app. MP provee la documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
- **Esfuerzo:** ~4h

---

## HALLAZGO-02: JWT_SECRET con valor por defecto vacío

- **Categoría:** C (Seguridad)
- **Severidad:** 🔥 Crítica
- **Componente:** `cloud/config.py:13` — `JWT_SECRET = os.getenv("TUSTOCK_JWT_SECRET", "")`
- **Descripción:** Si la variable de entorno `TUSTOCK_JWT_SECRET` no está configurada en Railway, `JWT_SECRET` queda como string vacío. Un attacker podría firmar tokens JWT con un secret vacío usando el algoritmo `HS256`, obteniendo acceso a cualquier cuenta del Monitor Cloud. La app en producción (Railway) DEBE tener esta variable seteada.
- **Impacto:** Takeover completo de cuentas del Monitor Cloud si la env var no está seteada.
- **Recomendación:** (1) Verificar que `TUSTOCK_JWT_SECRET` esté configurado en Railway. (2) Si `JWT_SECRET` es vacío al startup, hacer `sys.exit(1)` igual que hace el server local con `TUSTOCK_TOKEN`. (3) Documentar en `docs/setup-cloud-agent.md` que esta env var es obligatoria.
- **Esfuerzo:** ~2h

---

## HALLAZGO-03: `register-from-install` no requiere consentimiento

- **Categoría:** D (Legal/Consistencia)
- **Categoría:** 🔥 Crítica
- **Componente:** `cloud/api.py:128` — endpoint `POST /api/register-from-install`
- **Descripción:** El endpoint `register-from-install` (usado por `configurar.bat`) crea la cuenta con `terms_accepted=True` sin que el usuario haya aceptado los Términos ni la Política de Privacidad. El checkbox de consentimiento del formulario de registro normal (`POST /api/register`) sí lo requiere (`accepts_terms: true`). Hay una inconsistencia legal: el registro manual respeta la ley, el automático no.
- **Impacto:** Viola la Ley 24.240 (consentimiento informado). Si un cliente demanda, no hay prueba de que aceptó los términos. Riesgo legal.
- **Recomendación:** El endpoint `register-from-install` debe requerir `accepts_terms: true` explícitamente. `configurar.bat` debe mostrar los términos y pedir confirmación antes de hacer curl al endpoint. Alternativa: aceptación implícita documentada en el USB ("al ejecutar este archivo, usted acepta..."). Consultar a Legal.
- **Esfuerzo:** ~3h (incluyendo cambio en .bat)

---

## HALLAZGO-04: `backup_enabled: True` para plan Pro sin feature

- **Categoría:** D (Documentación/Consistencia)
- **Severidad:** 🟡 Alta
- **Componente:** `cloud/api.py:889` + `server/services/license_service.py:41` — PLAN_FEATURES
- **Descripción:** El plan Pro devuelve `backup_enabled: True` en la validación de licencia. La feature de backup en la nube NO existe (MEMORY.md sección 4: "Backup en la nube — Pro (planeado) — ❌ No existe"). El frontend recibe este flag y podría mostrar un botón o sección de backup que no funciona. Esto es publicidad engañosa (Ley 24.240 arts. 8-9).
- **Impacto:** Un cliente Pro ve "Backup habilitado" pero no puede hacer backup. Confusión + riesgo legal.
- **Recomendación:** Cambiar `backup_enabled: True` a `backup_enabled: False` en PLAN_FEATURES para el plan Pro en AMBOS archivos (cloud/api.py y server/services/license_service.py). Cuando el backup esté realmente construido, se cambia a True.
- **Esfuerzo:** ~0.5h

---

## HALLAZGO-05: CORS `allow_origins=["*"]` en cloud API

- **Categoría:** C (Seguridad)
- **Severidad:** 🟡 Alta
- **Componente:** `cloud/api.py:64`
- **Descripción:** El CORS de la cloud API permite cualquier origen (`allow_origins=["*"]`). Aunque la API usa JWT y API keys, un sitio malicioso podría hacer requests al API desde el browser de un usuario autenticado (si tiene el JWT). El header `Authorization` no es un "simple header", así que el preflight OPTIONS lo bloquearía... pero con `allow_headers=["*"]` el browser sí enviaría el header.
- **Impacto:** Ataque CSRF desde sitios maliciosos contra usuarios autenticados del Monitor Cloud.
- **Recomendación:** Restringir `allow_origins` a `["https://monitor.tustocksoft.com.ar", "http://localhost:5174"]`. El admin panel corre en localhost:5174, el monitor en monitor.tustocksoft.com.ar.
- **Esfuerzo:** ~1h

---

## HALLAZGO-06: Admin routes duplicados (server + cloud)

- **Categoría:** A (Inconsistencia entre componentes)
- **Severidad:** 🟡 Alta
- **Componente:** `server/routes/admin.py` + `cloud/api.py:170-318`
- **Descripción:** Después de la migración del admin a "independizado" (habla solo a cloud), las rutas admin en `server/routes/admin.py` siguen existiendo y sonfuncionales. Si el humano usa el admin local en vez del panel de Railway, estaría generando keys en la DB local que no están en la cloud. La feature "admin independizado" está incompleta: el admin local no se desactivó.
- **Impacto:** Keys generadas localmente no están en la cloud. Si un cliente intenta activar esa key, falla con "Clave inválida".
- **Recomendación:** (1) Si el admin local ya no se usa, eliminar `server/routes/admin.py` y su inclusión en `main.py`. (2) Si se mantiene como fallback, documentar que las keys generadas localmente DEBEN hacerse sync manual al cloud. (3) Actualizar MEMORY.md sección 3 para reflejar el estado real.
- **Esfuerzo:** ~2h

---

## HALLAZGO-07: `configurar.bat` no crea `server/.env`

- **Categoría:** B (Flujo de usuario)
- **Severidad:** 🟡 Alta
- **Componente:** `configurar.bat`
- **Descripción:** `configurar.bat` crea `config/cloud.json` (para el agente cloud) pero NO crea `server/.env` con `TUSTOCK_TOKEN`. Sin `.env`, el servidor no arranca (`config.py` hace `sys.exit(1)`). El flujo de instalación actual es: (1) copiar USB, (2) ejecutar configurar.bat, (3) ejecutar TUSTOCK.exe. Pero TUSTOCK.exe falla si no hay `.env`. El cliente necesita crear manualmente el archivo `.env` o ejecutar otro script. La documentación de instalación (LEEME) no aclara esto.
- **Impacto:** El cliente ejecuta configurar.bat, luego TUSTOCK.exe, y el sistema no arranca. Confusión + llamada de soporte.
- **Recomendación:** Agregar al final de `configurar.bat` la creación de `server/.env` con `TUSTOCK_TOKEN=tustock-local-token` y `TUSTOCK_HOST=0.0.0.0`. Así el flujo completo queda automatizado.
- **Esfuerzo:** ~1h

---

## HALLAZGO-08: Sin rate limiting en endpoints admin

- **Categoría:** C (Seguridad)
- **Severidad:** 🟡 Alta
- **Componente:** `cloud/api.py` — endpoints `/api/admin/*`
- **Descripción:** Rate limiting existe para `/api/login` (5/15min) y `/api/register` (3/30min), pero NO para endpoints admin (`/api/admin/generate`, `/api/admin/licenses`, etc.). Un atacante con un token admin válido podría hacer brute force o abusar de los endpoints. Más relevante: si `ADMIN_TOKEN` es vacío (como `JWT_SECRET`), cualquiera podría usar los endpoints admin.
- **Impacto:** Generación masiva de keys, revocación de licencias, acceso a datos de todos los clientes.
- **Recomendación:** (1) Verificar que `TUSTOCK_ADMIN_TOKEN` esté seteado en Railway. (2) Agregar rate limiting a endpoints admin (ej: 60 req/min). (3) Si `ADMIN_TOKEN` es vacío, rechazar requests admin en vez de permitirlos.
- **Esfuerzo:** ~2h

---

## HALLAZGO-09: MetricsPush crece indefinidamente

- **Categoría:** C (Configuración)
- **Severidad:** 🟢 Media
- **Componente:** `cloud/models.py:29` — tabla `metrics_pushes`
- **Descripción:** Cada 30 segundos, el agente local crea un nuevo registro en `metrics_pushes`. Con 1 cliente son ~2880 rows/día. Con 10 clientes, ~28,800/día. La DB cloud crece indefinidamente. No hay mecanismo de purge/retention. Railway tiene límite de storage en plan Hobby.
- **Impacto:** La DB cloud se llena con el tiempo. Performance degradada. En algún punto, Railway puede bloquear la app.
- **Recomendación:** (1) Agregar un job periódico (cron o al hacer push) que elimine registros con más de 30 días. (2) Opcional: comprimir/agregar métricas históricas en vez de guardar cada push individual.
- **Esfuerzo:** ~3h

---

## HALLAZGO-10: KeyActivation crece indefinidamente

- **Categoría:** C (Configuración)
- **Severidad:** 🟢 Media
- **Componente:** `cloud/models.py:66` — tabla `key_activations`
- **Descripción:** Cada vez que una licencia se valida desde una PC nueva, se crea un registro en `key activations`. Con el tiempo, si los clientes reinstalan o cambian de PC, esta tabla crece sin control. No hay purge.
- **Impacto:** Menor que MetricsPush pero acumulación a largo plazo.
- **Recomendación:** Eliminar registros duplicados (mantener solo el más reciente por `license_key`) o agregar purge periódico.
- **Esfuerzo:** ~1h

---

## HALLAZGO-11: Agent cloud no loguea errores de push

- **Categoría:** E (Experiencia de usuario / Debug)
- **Severidad:** 🟢 Media
- **Componente:** `cloud/agent.py:128` — `except Exception: return False`
- **Descripción:** Cuando el push falla, el agente retorna `False` y el `main()` imprime "FAIL" pero no loguea el error específico. Si el problema es un 401 (API key inválida), un timeout, o un 500 del server, el usuario no tiene forma de saber qué falla. No hay archivo de log.
- **Impacto:** Imposible diagnosticar por qué el monitor no muestra datos. El usuario ve "Sin datos" y no sabe por qué.
- **Recomendación:** (1) Guardar errores en `config/agent.log` con timestamp, HTTP status y mensaje. (2) Mostrar el error más específico en la consola. (3) Si el error es 401, sugerir "Verificá que la API key en config/cloud.json sea correcta".
- **Esfuerzo:** ~2h

---

## HALLAZGO-12: Sin tests automatizados

- **Categoría:** D (Documentación/Calidad)
- **Severidad:** 🟢 Media
- **Componente:** Todo el proyecto
- **Descripción:** No existe ni un solo archivo de test en el proyecto (`**/test*.py` = 0 resultados). Bugs como el token mismatch de `configurar.bat`, el barcode lookup, o el undefined en historial de ventas se descubrieron manualmente en campo. Sin tests, cada fix nuevo puede romper algo existente.
- **Impacto:** Cada install es un experimento. Los bugs se descubren en campo, no en desarrollo.
- **Recomendación:** Crear tests mínimos para los flujos críticos: (1) `test_license.py` — init, activate, validate, can_add_product. (2) `test_cloud_push.py` — push, metrics, login. (3) `test_admin.py` — generate, revoke, stats. Usar pytest. Ejecutar antes de cada USB.
- **Esfuerzo:** ~8h (setup + tests básicos)

---

## HALLAZGO-13: No hay documentación de soporte al cliente

- **Categoría:** D (Documentación)
- **Severidad:** ⚪ Baja
- **Componente:** N/A (falta de documentación)
- **Descripción:** No hay documento que explique al cliente qué hacer si: (1) el monitor no muestra datos, (2) la licencia no activa, (3) el servidor no arranca, (4) quiere actualizar el sistema. El LEEME.txt menciona configurar.bat pero no cubre troubleshooting. El FAQ de la landing page es genérico de ventas, no de soporte.
- **Impacto:** Cada problema menor genera una llamada/WhatsApp al humano. Carga de soporte manual.
- **Recomendación:** Crear `docs/guia-soporte.md` con los 10 problemas más comunes y sus soluciones (basado en MEMORY.md sección 15 — tabla de errores comunes in-situ).
- **Esfuerzo:** ~2h

---

## HALLAZGO-14: `cloud.agent` hardcodea paths relativos

- **Categoría:** A (Consistencia)
- **Severidad:** ⚪ Baja
- **Componente:** `cloud/agent.py:22-24`
- **Descripción:** `cloud/agent.py` usa `BASE_DIR = Path(__file__).resolve().parent.parent` para resolver paths. Cuando se ejecuta desde el exe (PyInstaller), `__file__` puede no estar disponible o apuntar a un path temporal. El server local ya tiene fix para esto (`config.py` detecta `sys.frozen`), pero el agent no.
- **Impacto:** Si el agente se ejecuta como parte del exe, podría no encontrar `config/cloud.json` o `tustock.db`.
- **Recomendación:** Agregar detección de `sys.frozen` en `cloud/agent.py` igual que en `server/config.py`. O documentar que el agent se ejecuta como script independiente, no como parte del exe.
- **Esfuerzo:** ~1h

---

## Hallazgo adicional: ausencia de validación MP

El webhook de MP confía en que el `data_id` recibido es válido y llama a `get_payment()` para verificar. Sin embargo, si un atacante envía un `topic=preapproval` con un `preapproval_id` que conoce (porque es público en URLs de MP), el sistema podría actualizar el estado de una suscripción sin haber verificado la firma del webhook. La mitigación parcial es que luego se consulta a MP, pero el flujo no es 100% seguro sin validación de firma.

---

## Plan de acción recomendado

| Prioridad | Hallazgo | Acción | Esfuerzo |
|:---------:|----------|--------|:--------:|
| 1 | H01 | Validar firma webhook MP | 4h |
| 2 | H02 | JWT_SECRET obligatorio al startup | 2h |
| 3 | H04 | `backup_enabled: False` en Pro | 0.5h |
| 4 | H03 | Consentimiento en register-from-install | 3h |
| 5 | H05 | CORS restringido | 1h |
| 6 | H07 | .env creado por configurar.bat | 1h |
| 7 | H08 | Rate limiting admin + ADMIN_TOKEN check | 2h |
| 8 | H06 | Decidir: eliminar admin local o documentar sync | 2h |
| 9 | H11 | Log de errores en agent cloud | 2h |
| 10 | H09 | Purge de MetricsPush (>30 días) | 3h |
| 11 | H10 | Purge de KeyActivation | 1h |
| 12 | H12 | Tests mínimos | 8h |
| 13 | H13 | Guía de soporte al cliente | 2h |
| 14 | H14 | Fix paths agent en PyInstaller | 1h |
| **Total** | | | **~33.5h** |

### Quick wins (menos de 1 día, impacto alto)

1. `backup_enabled: False` para Pro (0.5h) — elimina riesgo legal inmediato
2. JWT_SECRET obligatorio al startup (2h) — cierra vulnerabilidad crítica
3. CORS restringido (1h) — cierra vector de ataque
4. `.env` en configurar.bat (1h) — arregla flujo de instalación

---

*Auditoría generada por agente de Calidad — 23 de Julio 2026*
