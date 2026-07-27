# Feature Sugerido: POS Remoto en Monitor Cloud

> **Fecha:** 23 de Julio 2026
> **Cliente:** SU - Day (Dayana)
> **Solicitud:** "Quiero poder vender y tomar pedidos desde el celular"

---

## Contexto

Dayana usa el Monitor Cloud desde su celular para ver ventas, stock y deudores. Su necesidad principal es:

1. **Tomar pedidos por teléfono** — Cuando la llaman para pedir productos, quiere registrar el pedido desde el celular
2. **Ver pedidos pendientes** — Para saber qué tiene que entregar
3. **Marcar pedidos como entregados/cobrados** — Para mantener todo actualizado

## Lo que pide vs lo que tenemos

| Necesidad | Estado actual | ¿Lo ofrecemos? |
|-----------|:------------:|:---------------:|
| Ver ventas del día | ✅ Monitor Cloud | Sí |
| Ver stock bajo | ✅ Monitor Cloud | Sí |
| Ver deudores | ✅ Monitor Cloud | Sí |
| **Tomar pedidos desde el celular** | ❌ | **No** |
| **Ver pedidos pendientes** | ❌ | **No** |
| **Marcar pedidos como entregados** | ❌ | **No** |
| **Cobrar/confirmar pago** | ❌ | **No** |

## Análisis técnico (preliminar)

### Opción A: POS Remoto vía API

Agregar endpoints al Monitor Cloud que permitan:
- `GET /api/orders/pending` — Ver pedidos pendientes
- `POST /api/orders/create` — Crear un pedido nuevo
- `POST /api/orders/{id}/complete` — Marcar como entregado
- `POST /api/orders/{id}/pay` — Confirmar pago

**Problema:** El POS de TUSTOCK corre en la PC local. Si creamos pedidos en el cloud, hay que sincronizarlos con la DB local. Complejo.

### Opción B: Cola de pedidos (simplificado)

El cliente toma el pedido desde el celular → se guarda en el cloud → se muestra un "tablero" en la PC local con los pedidos pendientes → el cajero los procesa.

**Más viable pero requiere:**
1. Endpoints nuevos en cloud/api.py
2. Nueva tabla en la DB cloud (pending_orders_remote)
3. UI en el dashboard del monitor
4. Sección en la PC local para ver/procesar pedidos remotos

### Opción C: Solo visualización (más simple)

No tomar pedidos desde el celular, pero sí:
- Ver pedidos que entraron por la app Android
- Marcar como "visto" o "en proceso"
- No modificar, solo visualizar

## Esfuerzo estimado

| Opción | Horas | Complejidad |
|--------|-------|:-----------:|
| A: POS Remoto completo | ~40-60h | Alta |
| B: Cola de pedidos | ~20-30h | Media |
| C: Solo visualización | ~8-12h | Baja |

## Recomendación

1. **Corto plazo (esta semana):** Configurar el directorio `config/` y que Dayana pueda acceder al monitor actual
2. **Mediano plazo (agosto):** Evaluar si la Opción B vale la pena para otros clientes
3. **No vender como feature** — Si Dayana insiste, explicarle que es un desarrollo nuevo con costo adicional

## Preguntas para el humano

1. ¿Cuánto estaría Dayana dispuesta a pagar extra por este feature?
2. ¿Hay otros clientes que lo pidan?
3. ¿Lo desarrollamos antes del polirrubro o lo dejamos para después?

---

*Documentado por Dispatcher — 23 de Julio 2026*
