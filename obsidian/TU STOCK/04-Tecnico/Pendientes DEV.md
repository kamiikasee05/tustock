# Pendientes DEV

**2026-07-07**

| # | Tarea | Estado | Prioridad |
|---|-------|:------:|:--------:|
| 1 | Fix webhook Plan MP (error 400: "Properties to update are required") | ❌ | 🔥 |
| 2 | Eliminar dependencias no usadas (`recharts`, `lucide-react`) | ❌ | 🟢 |
| 3 | Añadir migraciones (Alembic) o documentar esquema actual | ❌ | 🟢 |
| 4 | CRM en Google Sheets | ❌ | 🟢 |
| 5 | Tests automatizados | Postergado (5+ clientes) | 🟢 |
| 6 | Docker / CI/CD | Postergado (10+ clientes) | 🟢 |

## Completado recientemente

- ✅ `TUSTOCK_MP_TOKEN` configurado en Railway (producción)
- ✅ Suscripción MP vía Plan compartido (link fijo) — plan ID `492a6877398e4831a2d36f2159320f1c`
- ✅ Modelo híbrido MP: Checkout Pro (pagos únicos) + Plan compartido (suscripciones)
- ✅ GRACE PERIOD suscripción con banner progresivo (SubscriptionBanner.tsx)
- ✅ EULA clickwrap + consentimiento cloud + baja de cuenta
- ✅ Admin separado del proyecto principal (`admin/` standalone)
- ✅ DB local reparada (columnas faltantes via ALTER TABLE)
- ✅ Bugs funcionales corregidos (audits.py, main.py, pending_orders.py)
- ✅ auth.py timing-safe (`secrets.compare_digest`)