# Pendientes DEV

**2026-07-06**

| # | Tarea | Estado | Prioridad |
|---|-------|:------:|:--------:|
| 1 | Configurar `TUSTOCK_MP_TOKEN` en Railway (2 apps) | ❌ | 🔥 |
| 2 | Configurar webhook en el Plan de Suscripción MP | ❌ | 🟡 |
| 3 | Eliminar dependencias no usadas (`recharts`, `lucide-react`) | ❌ | 🟢 |
| 4 | Añadir migraciones (Alembic) o documentar esquema actual | ❌ | 🟢 |
| 5 | CRM en Google Sheets | ❌ | 🟢 |
| 6 | Tests automatizados | Postergado (5+ clientes) | 🟢 |
| 7 | Docker / CI/CD | Postergado (10+ clientes) | 🟢 |

## Completado recientemente

- ✅ Bugs funcionales corregidos (audits.py, main.py, pending_orders.py)
- ✅ auth.py timing-safe (`secrets.compare_digest`)
- ✅ Suscripción MP vía Plan compartido (link fijo)
- ✅ Modelo híbrido MP: Checkout Pro (pagos únicos) + Plan compartido (suscripciones)
- ✅ GRACE PERIOD suscripción con banner progresivo
- ✅ EULA clickwrap + consentimiento cloud + baja de cuenta