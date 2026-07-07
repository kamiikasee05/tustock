# Endpoints — Resumen

## Server Local (puerto 8090) — 49 endpoints

### GET
| Ruta | Router |
|------|--------|
| `/api/health` | main.py |
| `/api/server-info` | main.py |
| `/api/products` | products |
| `/api/products/generate-code` | products |
| `/api/products/scan/{code}` | products |
| `/api/products/barcode/next` | products |
| `/api/products/alerts/low-stock` | products |
| `/api/products/categories` | products |
| `/api/products/{product_id}` | products |
| `/api/products/{product_id}/barcode.png` | main.py |
| `/api/sales` | sales |
| `/api/sales/today/summary` | sales |
| `/api/sales/{sale_id}` | sales |
| `/api/stock` | stock |
| `/api/stock/low` | stock |
| `/api/stock/movements/{product_id}` | stock |
| `/api/customers` | customers |
| `/api/customers/{customer_id}/transactions` | customers |
| `/api/vendors` | vendors |
| `/api/audits` | audits |
| `/api/audits/{audit_id}` | audits |
| `/api/pending-orders` | pending_orders |
| `/api/budgets` | budgets |
| `/api/license/status` | license |
| `/api/license/can-add-product` | license |
| `/api/license/terms` | license |
| `/api/license/privacy` | license |
| `/api/license/refund` | license |
| `/api/reports/daily/{date}` | reports |
| `/api/reports/export/*` | reports (4 exports) |
| `/api/reports/range` | reports |
| `/api/admin/licenses` | admin |
| `/api/admin/stats` | admin |

### POST
| Ruta | Router |
|------|--------|
| `/api/products` | products |
| `/api/products/categories` | products |
| `/api/products/{id}/barcode` | products |
| `/api/products/{id}/reactivate` | products |
| `/api/sales` | sales |
| `/api/stock/adjust` | stock |
| `/api/customers` | customers |
| `/api/customers/payment` | customers |
| `/api/customers/debt` | customers |
| `/api/vendors` | vendors |
| `/api/vendors/login` | vendors |
| `/api/audits` | audits |
| `/api/audits/{id}/start` | audits |
| `/api/audits/{id}/items` | audits |
| `/api/audits/{id}/scan` | audits |
| `/api/audits/{id}/complete` | audits |
| `/api/pending-orders` | pending_orders |
| `/api/pending-orders/{id}/approve` | pending_orders |
| `/api/pending-orders/{id}/reject` | pending_orders |
| `/api/pending-orders/clear` | pending_orders |
| `/api/budgets` | budgets |
| `/api/budgets/{id}/approve` | budgets |
| `/api/budgets/{id}/reject` | budgets |
| `/api/license/activate` | license |
| `/api/license/accept-eula` | license |
| `/api/reports/daily/generate` | reports |
| `/api/reports/daily/{date}` | reports |
| `/api/admin/generate` | admin |

### PUT / DELETE
| Ruta | Router |
|------|--------|
| `PUT /api/products/{id}` | products |
| `DELETE /api/products/{id}` | products |
| `DELETE /api/customers/{id}` | customers |
| `DELETE /api/vendors/{id}` | vendors |
| `POST /api/admin/revoke/{key}` | admin |
| `POST /api/admin/activate/{key}` | admin |
| `DELETE /api/admin/delete/{key}` | admin |

## Cloud API (Railway, puerto 8000) — 17 endpoints

| Método | Ruta | Auth |
|--------|------|:----:|
| GET | `/api/health` | No |
| GET | `/api/licenses/terms` | No |
| GET | `/api/licenses/privacy` | No |
| GET | `/api/licenses/refund` | No |
| POST | `/api/register` | No |
| POST | `/api/login` | No |
| POST | `/api/push` | API Key |
| GET | `/api/metrics` | JWT |
| GET | `/api/business` | JWT |
| GET | `/api/regenerate-key` | JWT |
| POST | `/api/business/delete-account` | JWT |
| POST | `/api/payments/create` | No |
| POST | `/api/payments/subscribe` | No |
| GET | `/api/payments/status/{key}` | No |
| GET | `/api/payments/subscription-status/{key}` | No |
| POST | `/api/payments/webhook` | No |
| POST | `/api/licenses/sync` | No |
| POST | `/api/licenses/validate` | No |

## Monitor Local (puerto 8091) — 4 endpoints

| Método | Ruta | Auth |
|--------|------|:----:|
| GET | `/` | Cookie |
| POST | `/api/login` | No |
| GET | `/api/metrics` | Cookie |
| GET | `/api/metrics/summary` | Cookie |
| GET | `/api/health` | No |