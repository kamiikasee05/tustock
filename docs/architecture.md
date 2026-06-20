# Arquitectura de TUSTOCK

## Principios de diseño

1. **Local-first**: Todo corre en la PC del local, sin dependencia de internet.
2. **Simple**: SQLite como única base de datos, sin configuraciones complejas.
3. **Extensible**: API REST documentada para integrar la app Android y futuros módulos.
4. **Tolerante a fallos**: La app Android funciona offline (consulta al reconectar).

## Estructura del proyecto

```
TUSTOCK/
├── server/                    # Backend Python
│   ├── main.py               # Entrada: FastAPI + uvicorn
│   ├── config.py             # Configuración (puerto, DB path)
│   ├── database.py           # Conexión SQLite + SQLAlchemy
│   ├── models/               # Modelos ORM
│   │   ├── product.py        # Producto, Categoría
│   │   ├── stock.py          # CurrentStock, StockMovement
│   │   ├── sale.py           # Sale, SaleItem
│   │   ├── audit.py          # StockAudit, AuditItem
│   │   └── report.py         # DailyReport
│   ├── routes/               # Endpoints REST
│   │   ├── products.py       # CRUD productos, scan, alerts
│   │   ├── stock.py          # Consulta y ajustes de stock
│   │   ├── sales.py          # Registro de ventas
│   │   ├── audits.py         # Auditorías
│   │   └── reports.py        # Informes diarios
│   └── services/             # Lógica de negocio
│       ├── stock_service.py  # Movimientos de stock
│       ├── audit_service.py  # Flujo de auditoría
│       └── report_service.py # Generación de informes
├── web/                       # Frontend React
│   ├── src/
│   │   ├── api/client.ts     # Cliente HTTP tipado
│   │   ├── components/       # Layout, etc.
│   │   └── pages/            # Dashboard, Products, Sales, Audits, Reports
│   └── dist/                 # Build para producción (servido por FastAPI)
├── android/                   # App Android Kotlin
│   └── app/src/main/java/com/tustock/scanner/
│       ├── MainActivity.kt   # Pantalla principal + conexión
│       ├── ScannerActivity.kt # Cámara + ML Kit + API calls
│       ├── SettingsActivity.kt # Configuración URL + registro
│       └── ApiClient.kt      # Cliente HTTP (OkHttp)
├── scripts/                   # Utilidades
│   ├── setup.bat             # Instalación completa
│   ├── start.bat             # Iniciar servidor producción
│   ├── dev.bat               # Iniciar modo desarrollo
│   ├── backup.py             # Backup de base de datos
│   └── restore.py            # Restauración de backup
└── docs/
    └── architecture.md       # Este documento
```

## Flujo de datos

### Venta
1. Usuario escanea/ingresa código de producto en el POS
2. Se busca el producto en la BD local
3. Se agrega al carrito
4. Al confirmar, se crea registro en `sales` + `sale_items`
5. Se descuenta del `current_stock`
6. Se registra movimiento en `stock_movements`

### Auditoría
1. Se crea una auditoría (toma snapshot del stock teórico de todos los productos)
2. Se inicia la auditoría (estado: `in_progress`)
3. Se escanean productos uno por uno (cada scan suma +1 al contado)
4. Alternativamente se ingresan cantidades manualmente
5. Se completa la auditoría:
   - Se calculan diferencias (contado - teórico)
   - Se aplican correcciones al `current_stock`
   - Se registran movimientos de tipo `audit_correction`
   - Estado: `completed`

### Alerta de stock bajo
- El sidebar consulta `/api/products/alerts/low-stock` cada 30 segundos
- Muestra badge rojo con el conteo de productos bajo mínimo
- Los productos con stock = 0 se muestran como "AGOTADO"

## Modelo de datos

```
categories
  ├── id, name, parent_id

products
  ├── id, code (único), name, description
  ├── category_id → categories.id
  ├── cost_price, selling_price, min_stock, unit
  └── is_active, created_at, updated_at

current_stock
  └── product_id → products.id, quantity

stock_movements
  ├── product_id → products.id
  ├── quantity, movement_type (entry|exit|adjustment|audit_correction)
  ├── reference_type (purchase|sale|audit|manual), reference_id
  └── notes, created_at

sales
  ├── sale_date, total, discount
  ├── payment_method, cashier
  └── notes, created_at

sale_items
  ├── sale_id → sales.id
  ├── product_id → products.id
  └── quantity, unit_price, subtotal

stock_audits
  ├── audit_date, status (draft|in_progress|completed)
  ├── created_by, notes
  └── created_at, completed_at

audit_items
  ├── audit_id → stock_audits.id
  ├── product_id → products.id
  └── theoretical_qty, counted_qty, difference, notes

daily_reports
  ├── report_date, total_sales, total_transactions
  ├── cash_sales, card_sales, other_sales, discounts
  └── report_data (JSON), generated_at
```

## Comunicación Android ↔ Servidor

La app Android se conecta al servidor por WiFi local usando HTTP REST:

1. Al abrir la app, verifica conexión con `GET /api/health`
2. Al escanear un código, llama a `GET /api/products/scan/{code}`
3. Si el producto no existe, ofrece registrar con `POST /api/products`
4. Durante auditorías, `POST /api/audits/{id}/scan` suma +1 al conteo

La URL del servidor se configura en la app y se guarda en SharedPreferences.
