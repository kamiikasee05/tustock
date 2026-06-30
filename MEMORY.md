# Memoria Compartida TUSTOCK

Instrucciones: NO borres entradas existentes. Solo agrega nuevas lineas al final.

## Features completadas

## Identidad del producto

TUSTOCK es un sistema de gestión de stock y ventas para **polirrubros, mercerías, almacenes y comercios minoristas**. Funciona 100% local (sin Internet para operar). Orientado a dueños de comercios que no saben de tecnología — todo funciona con doble clic.

## Stack técnico

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy 2.0, SQLite (WAL mode)
- **Frontend**: React + Vite + TypeScript, servido estático desde el backend
- **Autenticación**: Token Bearer fijo (configurable vía env `TUSTOCK_TOKEN`)
- **Servidor**: uvicorn, corre oculto con `pythonw`, PID file, auto-apertura del navegador
- **App Android**: APK con WebView + ML Kit para escaneo de códigos de barra (GitHub Releases)
- **Base de datos**: `tustock.db` en la raíz del proyecto, auto-creada con `init_db()`

## Estructura del proyecto

```
TUSTOCK/
├── TUSTOCK.bat                # Entry point único (doble clic aquí)
├── tustock.db                 # Base de datos SQLite (auto-creada)
├── web/dist/                  # Frontend compilado (trackeado en git)
├── server/
│   ├── main.py                # FastAPI app, rutas públicas, graceful shutdown
│   ├── config.py              # Host, puerto, token, CORS
│   ├── auth.py                # verify_token por Bearer header
│   ├── database.py            # SQLAlchemy engine, get_db, init_db
│   ├── schemas.py             # Pydantic models (ProductCreate, SaleCreate, etc.)
│   ├── seed.py                # Datos de prueba (15 productos, 3 clientes, 3 vendedores)
│   ├── requirements.txt
│   ├── models/                # SQLAlchemy models
│   │   ├── product.py         # Product, Category
│   │   ├── sale.py            # Sale, SaleItem
│   │   ├── stock.py           # CurrentStock, StockMovement
│   │   ├── customer.py        # Customer, CustomerTransaction
│   │   ├── vendor.py          # Vendor
│   │   ├── audit.py           # StockAudit, AuditItem
│   │   ├── report.py          # DailyReport
│   │   ├── pending_order.py   # PendingOrder
│   │   └── budget.py          # Budget
│   ├── routes/                # FastAPI routers
│   │   ├── products.py        # CRUD productos, códigos, categorías, escaneo
│   │   ├── sales.py           # CRUD ventas, resumen diario
│   │   ├── stock.py           # Stock actual, movimientos, ajustes
│   │   ├── customers.py       # CRUD clientes, transacciones, pagos
│   │   ├── vendors.py         # CRUD vendedores, login por DNI
│   │   ├── reports.py         # Reportes diarios y mensuales, exportación CSV
│   │   ├── audits.py          # Auditorías de inventario
│   │   ├── pending_orders.py  # Pedidos pendientes, aprobar/rechazar
│   │   └── budgets.py         # Presupuestos, aprobar/rechazar
│   └── services/
│       ├── stock_service.py   # get_current_stock, get_low_stock, adjust_stock
│       ├── audit_service.py   # Lógica de auditorías
│       └── report_service.py  # Generación de reportes
├── scripts/
│   ├── start.bat              # Arranca el servidor oculto con pythonw
│   ├── stop.bat               # Mata el servidor
│   ├── setup-cliente.bat      # Instalación única (pip install + seed)
│   ├── Crear Acceso Directo.bat
│   ├── install-startup.bat    # Auto-inicio con Windows
│   ├── uninstall-startup.bat  # Remueve auto-inicio
│   └── generar_guia.py        # Genera la guía de usuario PDF
└── Guia de Usuario TUSTOCK.pdf
```

## Modelo de datos (esquema resumido)

| Tabla | Columnas clave |
|-------|---------------|
| `products` | id, code (único), name, category_id, cost_price, selling_price, min_stock, barcode (único), is_active |
| `categories` | id, name, parent_id |
| `sales` | id, sale_date, total, discount, payment_method, cashier, vendor_id, customer_id |
| `sale_items` | id, sale_id, product_id, quantity, unit_price, subtotal |
| `current_stock` | product_id (PK), quantity |
| `stock_movements` | id, product_id, quantity, movement_type, reference_type, reference_id |
| `customers` | id, name, dni, phone, is_active |
| `customer_transactions` | id, customer_id, type (debt/payment), amount, sale_id |
| `vendors` | id, dni (único), name, is_active |
| `pending_orders` | id, vendor_id, total, items_json, status |
| `budgets` | id, customer_name, total, items_json, status |
| `stock_audits` | id, audit_date, status, created_by |
| `audit_items` | id, audit_id, product_id, theoretical_qty, counted_qty, difference |
| `daily_reports` | id, report_date, total_sales, total_transactions, report_data (JSON) |

## API endpoints principales

### Productos (`/api/products`)
- `GET /` — listar (filtros: search, category_id, include_inactive)
- `POST /` — crear
- `PUT /{id}` — actualizar
- `DELETE /{id}` — desactivar
- `POST /{id}/reactivate` — reactivar
- `GET /{id}` — detalle
- `GET /generate-code` — genera código TST + 10 dígitos
- `GET /barcode/next` — genera código de barra 2 + 11 dígitos
- `POST /{id}/barcode` — genera y asigna código de barra al producto
- `GET /{id}/barcode.png` — imagen Code128 con nombre + precio (público, sin auth)
- `GET /scan/{code}` — busca por code o barcode
- `GET /categories` — lista categorías
- `POST /categories` — crear categoría
- `GET /alerts/low-stock` — alertas stock bajo

### Ventas (`/api/sales`)
- `GET /` — listar (filtro: sale_date, limit)
- `POST /` — crear (items, discount, payment_method, customer_id opcional)
- `GET /{id}` — detalle con items
- `GET /today/summary` — resumen del día

### Stock (`/api/stock`)
- `GET /` — stock actual de todos los productos
- `GET /low` — solo productos con stock bajo
- `POST /adjust` — movimiento (entry/exit/adjustment)
- `GET /{product_id}/movements` — historial de movimientos

### Clientes (`/api/customers`)
- `GET /` — listar con saldo (deudas - pagos)
- `POST /` — crear
- `DELETE /{id}` — desactivar
- `GET /{id}/transactions` — historial de transacciones
- `POST /payment` — registrar pago
- `POST /debt` — registrar deuda

### Vendedores (`/api/vendors`)
- `GET /` — listar
- `POST /` — crear
- `DELETE /{id}` — desactivar
- `POST /login` — login por DNI

### Pedidos pendientes (`/api/pending-orders`)
- `GET /` — listar pendientes
- `POST /` — crear (vendor_id, items)
- `POST /{id}/approve` — aprobar (body opcional: payment_method, customer_id)
- `POST /{id}/reject` — rechazar
- `POST /clear?vendor_id=X` — limpiar pedidos de un vendedor

### Presupuestos (`/api/budgets`)
- `GET /` — listar
- `POST /` — crear
- `POST /{id}/approve` — aprobar (descuenta stock)
- `POST /{id}/reject` — rechazar

### Auditorías (`/api/audits`)
- `GET /` — listar
- `POST /` — crear
- `GET /{id}` — detalle con items
- `POST /{id}/start` — iniciar
- `POST /{id}/scan` — escanear producto
- `POST /{id}/complete` — completar y aplicar correcciones

### Reportes (`/api/reports`)
- `GET /daily?report_date=YYYY-MM-DD` — reporte diario
- `POST /daily/generate?report_date=YYYY-MM-DD` — generar reporte
- `GET /range?start=...&end=...` — reportes por rango
- `GET /export/sales.csv`, `export/products.csv`, etc. — exportación CSV
- `GET /export/monthly.csv?year=&month=` — exportación mensual

## Planes de negocio (definido en conversación previa)

### Plan Standard (gratis)
- POS + control de stock
- Ventas fiado
- Códigos de barra (generación e impresión)
- Reportes diarios y mensuales
- Auditorías de inventario
- Presupuestos y pedidos pendientes
- App Android (escaneo y pedidos móviles)
- Acceso desde 2 PCs en red local

### Plan Premium (pago — MONITOREO REMOTO)
- Todo lo del Standard
- **Monitor remoto** vía Cloudflare Tunnel
- Dashboard mobile responsive (métricas en el celular)
- Login de acceso para el cliente
- Sin exponer el sistema administrativo completo (solo monitoreo read-only)

**Pendiente de implementar**: el monitor premium. Idea: carpeta `monitor/` con FastAPI read-only, puerto 8091, tunnel Cloudflare apuntando ahí, login propio, dashboard HTML plano responsive.

## Cómo funciona internamente (para ventas)

### Flujo de autenticación
1. El frontend guarda el token en `api/client.ts` como variable `TOKEN`
2. Cada request incluye `Authorization: Bearer tustock-local-token`
3. El backend valida contra `TUSTOCK_TOKEN` en `config.py`
4. Los routers se montan con `dependencies=[Depends(verify_token)]`
5. La excepción: `/api/products/{id}/barcode.png` es público (sin auth) porque las `<img>` no envían headers

### Flujo de venta fiado
1. Usuario selecciona "Fiado" como método de pago
2. Aparece selector de clientes
3. Al crear la venta, si `payment_method == "fiado"`, se crea `CustomerTransaction` tipo "debt"
4. El saldo del cliente se calcula como: `SUM(debt) - SUM(payment)`

### Flujo de códigos de barra
1. El sistema genera códigos de 12 dígitos empezando con "2"
2. Usa `python-barcode` con `ImageWriter` para generar PNG Code128
3. La imagen incluye: código de barras + número + nombre del producto + precio
4. El usuario guarda la imagen y la imprime para etiquetas

### Flujo de pedidos pendientes
1. Vendedor crea pedido desde Android (vendor_id + items)
2. En el panel web aparece el pedido pendiente
3. Al aprobar, se puede seleccionar método de pago y cliente (para fiado)
4. Se genera automáticamente una venta con los items del pedido

### Manejo del servidor
- `start.bat` usa `pythonw` (sin consola) para no molestar al usuario
- Escribe PID en `logs/server.pid`
- `stop.bat` mata por PID o fuerza cierre
- `main.py` captura SIGTERM/SIGINT para shutdown graceful
- Errores y shutdown logueados en `logs/server.log`

### Cobertura de features sin conexión
100% local. SQLite no necesita servidor de base de datos. No hay dependencia de Internet para operar. Ideal para clientes con conectividad limitada.

## Bugs conocidos corregidos en auditoría

| Bug | Archivo | Fix |
|-----|---------|-----|
| Stock adjustment perdía signo (abs) | `services/stock_service.py:79` | Cambiado a `quantity - previous` |
| Bare `except:` tragaba SystemExit | `main.py:52,133` | Cambiado a `except Exception:` |
| Query param token exponía en logs | `auth.py:12` | Eliminado, solo Bearer header |
| IntegrityError en update sin manejo | `routes/products.py:122` | Agregado try/except + rollback |
| N+1 en list_customers | `routes/customers.py:34-43` | Reescrito con subqueries |
| N+1 en today_summary | `routes/sales.py:135` | Agregado selectinload |
| top_items KeyError | `services/report_service.py:110` | Cambiado a `.get("top_items", [])` |
| sale_date sin validar | `routes/sales.py:18` | Agregado `date.fromisoformat()` |
| Pillow faltaba en requirements | `requirements.txt` | Agregado `Pillow>=10.0.0` |
| __tablename__ faltante en modelos | `models/*.py` | Restaurados en Product, StockMovement, SaleItem, CustomerTransaction, AuditItem |

## Cómo generar y regenerar la guía PDF

```bash
python scripts/generar_guia.py
# Genera: Guia de Usuario TUSTOCK.pdf
```

## Variables de entorno configurables

| Variable | Default | Descripción |
|----------|---------|-------------|
| `TUSTOCK_TOKEN` | `tustock-local-token` | Token de autenticación |
| `TUSTOCK_HOST` | `0.0.0.0` | IP donde escucha el servidor |
| `TUSTOCK_PORT` | `8090` | Puerto |
| `TUSTOCK_DB` | `sqlite:///tustock.db` | URL de base de datos |

## Enlaces útiles

- **Repositorio**: https://github.com/kamiikasee05/tustock
- **APK Android**: https://github.com/kamiikasee05/tustock/releases/tag/apk-35
- **Guía de usuario**: `Guia de Usuario TUSTOCK.pdf` (en la raíz del proyecto)
