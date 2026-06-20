---
tags:
  - tustock
  - arquitectura
  - tecnico
  - desarrollo
---

# Arquitectura del Sistema

> Documento técnico para desarrolladores. Si sos usuario, empezá por la [[Guía de Usuario]].

## Visión general

```
┌──────────────────────────────────────────────────────────┐
│                    RED LOCAL (WiFi)                       │
│                                                           │
│  ┌──────────────────┐          ┌──────────────────────┐  │
│  │  Android App     │ ──REST──▶│  Servidor Python      │  │
│  │  CameraX + ML Kit│   HTTP   │  FastAPI + uvicorn    │  │
│  └──────────────────┘          │  SQLite + SQLAlchemy  │  │
│                                 │  localhost:8090       │  │
│                                 └──────────┬───────────┘  │
│                                            │              │
│                                 ┌──────────▼───────────┐  │
│                                 │  Interfaz Web (React) │  │
│                                 │  Dashboard, POS, etc  │  │
│                                 └──────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Backend** | Python 3.9+ / FastAPI | API REST moderna, documentación automática (Swagger) |
| **ORM** | SQLAlchemy 2.0 | Mapeo objeto-relacional, previene SQL injection |
| **Base de datos** | SQLite (modo WAL) | Sin servidor, archivo único, ideal para local-first |
| **Frontend** | React 18 / Vite / TypeScript | SPA rápida, tipado seguro |
| **Android** | Kotlin / CameraX / ML Kit | Barcode scanning offline, integración nativa |
| **HTTP Client (Android)** | OkHttp 4 | Cliente HTTP robusto para Android |

## Estructura de archivos

```
tustock/
├── server/                     # Backend Python
│   ├── main.py                # Punto de entrada FastAPI
│   ├── config.py              # Configuración (puerto, DB, token)
│   ├── database.py            # Conexión SQLAlchemy + SQLite
│   ├── auth.py                # Middleware de autenticación por token
│   ├── schemas.py             # Modelos Pydantic (validación)
│   ├── models/                # Modelos ORM (SQLAlchemy)
│   │   ├── product.py         # Product, Category
│   │   ├── stock.py           # CurrentStock, StockMovement
│   │   ├── sale.py            # Sale, SaleItem
│   │   ├── audit.py           # StockAudit, AuditItem
│   │   └── report.py          # DailyReport
│   ├── routes/                # Endpoints REST
│   │   ├── products.py        # CRUD productos, scan, alerts
│   │   ├── stock.py           # Consulta y ajustes de stock
│   │   ├── sales.py           # POS, registro de ventas
│   │   ├── audits.py          # Flujo de auditoría
│   │   └── reports.py         # Informes diarios
│   └── services/              # Lógica de negocio
│       ├── stock_service.py   # Movimientos de stock (atómico SQL)
│       ├── audit_service.py   # Flujo de auditoría completo
│       └── report_service.py  # Generación de informes
├── web/                        # Frontend React
│   └── src/
│       ├── api/client.ts      # Cliente HTTP tipado (con token)
│       ├── components/        # Componentes compartidos
│       └── pages/             # Páginas (Dashboard, Products, etc.)
├── android/                    # App Android Kotlin
│   └── app/src/main/java/com/tustock/scanner/
│       ├── MainActivity.kt    # Pantalla principal + conexión
│       ├── ScannerActivity.kt # Cámara + ML Kit + API
│       ├── SettingsActivity.kt # Configuración + registro
│       └── ApiClient.kt       # Cliente HTTP (OkHttp + token)
├── scripts/                    # Utilidades
│   ├── setup.bat              # Instalación completa
│   ├── start.bat              # Iniciar servidor producción
│   ├── dev.bat                # Modo desarrollo
│   ├── backup.py              # Backup de base de datos
│   └── restore.py             # Restauración de backup
└── obsidian/                   # Documentación (Vault Obsidian)
```

## Modelo de datos

```
categories
  ├── id INTEGER PK
  ├── name VARCHAR(100)
  └── parent_id FK → categories.id

products
  ├── id INTEGER PK
  ├── code VARCHAR(50) UNIQUE
  ├── name VARCHAR(200)
  ├── description TEXT
  ├── category_id FK → categories.id
  ├── cost_price FLOAT
  ├── selling_price FLOAT
  ├── min_stock INTEGER (default 5)
  ├── unit VARCHAR(20)
  └── is_active BOOLEAN

current_stock
  ├── product_id INTEGER PK FK → products.id
  └── quantity FLOAT

stock_movements
  ├── id INTEGER PK
  ├── product_id FK → products.id
  ├── quantity FLOAT
  ├── movement_type VARCHAR(20)   -- entry | exit | adjustment | audit_correction
  ├── reference_type VARCHAR(50)  -- purchase | sale | audit | manual
  ├── reference_id INTEGER
  └── created_at DATETIME

sales
  ├── id INTEGER PK
  ├── sale_date DATE
  ├── total FLOAT
  ├── discount FLOAT
  ├── payment_method VARCHAR(50)
  ├── cashier VARCHAR(100)
  └── created_at DATETIME

sale_items
  ├── id INTEGER PK
  ├── sale_id FK → sales.id
  ├── product_id FK → products.id
  ├── quantity FLOAT
  ├── unit_price FLOAT
  └── subtotal FLOAT

stock_audits
  ├── id INTEGER PK
  ├── audit_date DATE
  ├── status VARCHAR(20)   -- draft | in_progress | completed
  └── completed_at DATETIME

audit_items
  ├── id INTEGER PK
  ├── audit_id FK → stock_audits.id
  ├── product_id FK → products.id
  ├── theoretical_qty FLOAT
  ├── counted_qty FLOAT
  ├── difference FLOAT
  └── notes TEXT

daily_reports
  ├── id INTEGER PK
  ├── report_date DATE UNIQUE
  ├── total_sales FLOAT
  ├── cash_sales / card_sales / other_sales FLOAT
  ├── total_transactions INTEGER
  ├── total_items_sold INTEGER
  └── report_data TEXT (JSON)
```

## Seguridad

| Medida | Implementación |
|--------|---------------|
| **Autenticación** | Token Bearer requerido en todas las rutas API |
| **CORS** | Restringido a orígenes locales (`localhost:8090`, `localhost:3000`) |
| **Bind** | `127.0.0.1` por defecto (no expuesto a la red) |
| **SQL Injection** | Prevenido por SQLAlchemy ORM + parámetros bind |
| **Input validation** | Modelos Pydantic con `Field(gt, ge, max_length)` |
| **Race conditions** | Operaciones de stock con SQL atómico (`UPDATE ... SET qty = qty + :n`) |
| **Cost price** | Solo visible para clientes autenticados |

## API Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/health` | Health check | No |
| `GET` | `/api/products` | Listar productos | Bearer |
| `POST` | `/api/products` | Crear producto | Bearer |
| `GET` | `/api/products/scan/{code}` | Buscar por código | Bearer |
| `GET` | `/api/products/alerts/low-stock` | Alertas stock bajo | Bearer |
| `GET` | `/api/stock` | Stock actual | Bearer |
| `POST` | `/api/stock/adjust` | Ajustar stock | Bearer |
| `POST` | `/api/sales` | Registrar venta | Bearer |
| `GET` | `/api/sales/today/summary` | Resumen del día | Bearer |
| `POST` | `/api/audits` | Crear auditoría | Bearer |
| `POST` | `/api/audits/{id}/scan` | Escanear en auditoría | Bearer |
| `POST` | `/api/audits/{id}/complete` | Completar auditoría | Bearer |
| `POST` | `/api/reports/daily/{date}` | Generar informe | Bearer |
