---
tags:
  - tustock
  - auditoria
  - stock
---

# Auditorías de Stock

Las auditorías te permiten comparar el stock teórico (lo que dice el sistema) con el stock real (lo que contás físicamente). El objetivo es encontrar **faltantes** (tenés menos de lo que deberías) y **sobrantes** (tenés más de lo registrado).

## Flujo completo

### 1. Crear una auditoría

1. Ir a **Auditorías** en el menú lateral
2. En **Nueva auditoría**, escribí una nota (opcional) para identificar el motivo
3. Click en **Crear auditoría**

El sistema toma una foto del stock actual de **todos los productos activos**. Este es el stock teórico.

### 2. Iniciar el conteo

1. En la lista de auditorías, localizá la que creaste (estado: **Borrador**)
2. Click en **Iniciar**
3. El estado cambia a **En curso**

### 3. Escanear y contar

En la pantalla de la auditoría activa:

- **Escanear código**: escribí o escaneá el código de barras de cada producto y presioná Enter. Cada escaneo **suma +1** al contado de ese producto.
- Vas viendo en tiempo real:
  - **Teórico**: lo que el sistema cree que hay
  - **Contado**: lo que vas registrando
  - **Diferencia**: contado - teórico (positivo = sobrante, negativo = faltante)

> [!tip]
> Podés usar un lector de barras USB conectado a la PC o la [[App Android - Scanner|app Android]]. Cada "bip" del lector suma uno al producto correspondiente.

### 4. Completar la auditoría

Cuando terminaste de contar:

1. Click en **Completar y aplicar**
2. Confirmá la acción

El sistema:
- Calcula todas las diferencias (faltantes y sobrantes)
- **Corrige el stock** para que coincida con lo contado
- Registra los movimientos de ajuste en el historial
- Marca la auditoría como **Completada**

> [!warning]
> Una vez completada, la auditoría corrige el stock automáticamente. Si hay diferencias grandes, revisá antes de completar. Podés estar contando mal o haber olvidado algún producto.

---

## Ejemplo práctico

Imaginá que hacés una auditoría en la góndola de bebidas:

| Producto | Teórico | Contaste | Diferencia | ¿Qué pasó? |
|----------|---------|----------|------------|-------------|
| Coca-Cola 1.5L | 24 | 22 | **-2** | Faltan 2 botellas |
| Sprite 1.5L | 18 | 20 | **+2** | Sobran 2 (¿confusión con Coca?) |
| Agua mineral | 50 | 50 | **0** | OK, sin diferencias |
| Fanta 1.5L | 12 | 12 | **0** | OK, sin diferencias |

Al completar, el sistema ajusta Coca-Cola a 22 y Sprite a 20. Las diferencias quedan registradas con el motivo "Corrección por auditoría #X".

---

## Buenas prácticas

1. **Auditá por sectores**: no intentes contar todo el local de una vez. Hacé una auditoría por góndola, depósito, o categoría.
2. **Hacelo sin mirar el teórico**: contá físicamente sin ver lo que dice el sistema. Así evitás el sesgo de "creer" que hay cierta cantidad.
3. **Dos personas**: uno cuenta y otro registra. Reduce errores.
4. **Frecuencia**: una auditoría mensual de productos clave y una trimestral de todo el local es un buen ritmo.
5. **Revisá diferencias grandes**: si un producto tiene diferencia de más de 5 unidades, recontá antes de aplicar la corrección.

---

## Diferencias entre faltante y sobrante

| Tipo | Signo | Significado | Causas comunes |
|------|-------|-------------|----------------|
| **Faltante** | Negativo (-) | Hay menos stock del registrado | Robo, rotura no registrada, error de venta, pérdida |
| **Sobrante** | Positivo (+) | Hay más stock del registrado | Error de recepción, devolución no registrada, error de conteo anterior |

---

## Historial de auditorías

Todas las auditorías quedan guardadas con:
- Fecha
- Estado (Borrador / En curso / Completada)
- Quién la creó
- Notas

Podés consultar el historial para ver la evolución de las diferencias a lo largo del tiempo y detectar patrones.
