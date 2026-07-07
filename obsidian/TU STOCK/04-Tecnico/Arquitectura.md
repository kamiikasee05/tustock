# Arquitectura Técnica

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.9+ / FastAPI / SQLAlchemy / SQLite WAL |
| Frontend | React 18 + Vite + TypeScript (inline styles) |
| Android | Kotlin + CameraX + ML Kit (congelado) |
| Monitor Local | Vanilla HTML+CSS+JS (puerto 8091) |
| Monitor Cloud | FastAPI en Railway (`tustock.up.railway.app`) |
| Agente Cloud | `cloud/agent.py` — push cada 30s |
| Launcher | `scripts/launcher.py` / `TUSTOCK.bat` |

## Backend — 15 modelos, 49 endpoints, 4 servicios

**Modelos:** Product, Category, Sale, SaleItem, CurrentStock, StockMovement, Customer, CustomerTransaction, Vendor, StockAudit, AuditItem, PendingOrder, Budget, License, DailyReport

**Routers (11):** products, sales, stock, customers, vendors, audits, reports, pending_orders, budgets, license, admin

**Servicios:** stock_service, audit_service, report_service, license_service

**Middlewares:** CORS → trial_check (bloqueo por licencia) → spa_fallback

## Frontend — 13 páginas, 12 con Layout, Admin standalone

Dashboard, Sales (POS), Products, Customers, Audits, Reports, Pedidos, Presupuestos, Vendors, ScannerConnect, Upgrade, Settings, Admin

## Cloud — 17 endpoints, SPA dashboard

Registro/login JWT, push metrics, payments (preference + subscription), webhooks MP, validate/sync licenses, baja de cuenta

## Monitor Local — 4 endpoints, cookie auth

Login, metrics, summary, health — expuesto via Cloudflare Tunnel

## Endpoints completos

Ver [[Endpoints]] o consultar directamente el código en `server/routes/`, `cloud/api.py`, `monitor/app.py`.

## Lo que NO está construido

- ❌ Backup en la nube
- ❌ Multi-PC / multi-sucursal
- ❌ Múltiples perfiles de cajero
- ❌ Tests automatizados
- ❌ Docker / CI/CD

## Bugs conocidos

Ver [[Pendientes DEV]] o [[01-Producto/MEMORY#14]]