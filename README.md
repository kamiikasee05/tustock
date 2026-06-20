# TUSTOCK

Sistema de gestión de stock para polirrubros. 100% local, sin cloud, sin servidores externos.

## Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                  PC DEL LOCAL                         │
│                                                       │
│  ┌─────────────────┐     ┌────────────────────────┐  │
│  │  Android App    │────▶│   Servidor Python       │  │
│  │  (QR/Barcode    │     │   FastAPI + SQLite      │  │
│  │   Scanner)      │     │                         │  │
│  └─────────────────┘     │   localhost:8090        │  │
│          WiFi local      └───────────┬────────────┘  │
│                                       │               │
│                          ┌────────────▼────────────┐  │
│                          │  Interfaz Web (React)    │  │
│                          │  Dashboard / Productos   │  │
│                          │  Ventas / Auditorias     │  │
│                          │  Informes                │  │
│                          └─────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Resumen de ventas del día, alertas de stock bajo |
| **Productos** | ABM de productos con código, precio costo/venta, stock mínimo |
| **Stock** | Control de entradas/salidas, alertas automáticas de stock bajo |
| **Ventas** | Punto de venta con carrito, métodos de pago, descuentos |
| **Auditorías** | Conteo físico vs sistema, detección de faltantes/sobrantes, corrección automática |
| **Informes** | Reporte diario: total ventas, por método de pago, top productos |
| **Scanner** | App Android con cámara para escanear QR/barras, consulta y registra productos |

## Stack tecnológico

- **Backend**: Python 3.9+ / FastAPI / SQLAlchemy / SQLite
- **Frontend**: React 18 / Vite / TypeScript
- **Android**: Kotlin / CameraX / ML Kit Barcode Scanning / OkHttp

## Requisitos

- Python 3.9 o superior
- Node.js 18 o superior (para compilar el frontend)
- Android Studio (para compilar la app)

## Instalación

```bash
# 1. Ejecutar script de setup
scripts\setup.bat

# 2. Iniciar el servidor
scripts\start.bat

# 3. Abrir en navegador
# http://localhost:8090
```

## App Android

1. Abrir la carpeta `android/` con Android Studio
2. Sincronizar proyecto (Gradle sync)
3. Compilar e instalar en el celular
4. Configurar la URL del servidor (IP de la PC en la red local)
5. Escanear códigos QR o de barras de productos

## Desarrollo

```bash
# Modo desarrollo (servidor + frontend hot-reload)
scripts\dev.bat
```

## Backup y restauración

```bash
# Crear backup
python scripts\backup.py

# Restaurar backup
python scripts\restore.py
```

## API Endpoints

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/health` | Estado del servidor |
| `GET /api/products` | Listar productos |
| `POST /api/products` | Crear producto |
| `GET /api/products/scan/{code}` | Buscar por código (usado por scanner) |
| `GET /api/products/alerts/low-stock` | Alertas de stock bajo |
| `GET /api/stock` | Stock actual de todos los productos |
| `POST /api/stock/adjust` | Ajustar stock (entry/exit/adjustment) |
| `POST /api/sales` | Registrar venta |
| `GET /api/sales/today/summary` | Resumen de ventas del día |
| `POST /api/audits` | Crear auditoría |
| `POST /api/audits/{id}/scan` | Escanear código durante auditoría |
| `POST /api/audits/{id}/complete` | Completar auditoría y aplicar correcciones |
| `POST /api/reports/daily/{date}` | Generar/ver informe diario |

## Versión Pro (futuro)

La versión gratuita es completamente funcional y local. La versión Pro agregará:
- Backup automático en la nube
- Sincronización multi-sucursal
- Reportes avanzados (márgenes, rotación, proyecciones)
- Soporte prioritario
