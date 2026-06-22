---
tags:
  - tustock
  - usuario
  - guia
---

# Guía de Usuario

Guía completa para usar TUSTOCK en el día a día del negocio.

## Dashboard

La pantalla principal muestra:

- **Ventas del día**: total facturado, cantidad de transacciones, artículos vendidos y ticket promedio
- **Productos con stock bajo**: lista de productos que están por debajo del mínimo configurado
- **Acciones rápidas**: accesos directos a nueva venta, agregar producto, iniciar auditoría y generar informe

Las alertas de stock bajo se actualizan automáticamente cada 30 segundos. El ícono del menú muestra un badge rojo con la cantidad de alertas activas.

> [!tip]
> Configurá el **stock mínimo** de cada producto para que el sistema te avise cuándo reponer. Un producto con stock 0 aparece como **AGOTADO** en rojo.

---

## Productos

### Agregar un producto

1. Ir a **Productos** en el menú lateral
2. Click en **+ Nuevo producto**
3. Completar los campos:

| Campo | Descripción |
|-------|-------------|
| **Código** | El número de barras, QR o código interno. Es único para cada producto |
| **Nombre** | Nombre descriptivo del producto |
| **Precio costo** | Lo que te costó a vos (para calcular márgenes, no se muestra en ventas) |
| **Precio venta** | El precio al que lo vendés |
| **Stock mínimo** | Cuando el stock baja de este número, el sistema te alerta |
| **Unidad** | Cómo se mide: unidad, kg, litro, pack, etc. |

4. Click en **Crear producto**

### Editar un producto

1. En la lista de productos, click en **✎** (lápiz)
2. Modificá los campos necesarios
3. Click en **Guardar cambios**

> [!warning]
> El **código** no se puede cambiar una vez creado. Si necesitás cambiarlo, desactivá el producto y creá uno nuevo.

### Ajustes rápidos de stock

En la columna **Acciones** de cada producto tenés botones para ajustes rápidos:

- **+1**: suma 1 unidad al stock (entrada de mercadería)
- **-1**: resta 1 unidad (salida, rotura, etc.)

Para ajustes mayores, usá la sección [[Guía de Usuario#Ajustes de stock manuales|Ajustes de stock]].

### Buscar productos

Usá la barra de búsqueda para filtrar por nombre o código. Funciona con búsqueda parcial: escribí "coc" y encuentra "Coca-Cola", "Coco rallado", etc.

### Desactivar y reactivar productos

Para dar de baja un producto sin perder el historial de ventas:

- Click en **×** para **desactivar** un producto. No se borra: desaparece de la lista principal y de ventas, pero conserva todo su historial (ventas pasadas, movimientos de stock, auditorías).
- Click en **☠ Ver inactivos** para ver la lista de productos desactivados.
- En un producto inactivo, click en **Reactivar** para restaurarlo. Vuelve a la lista de activos con stock en 0 (debés ajustarlo manualmente con **+1**).

> [!tip]
> El borrado lógico (soft delete) preserva la integridad de tus informes y auditorías. Reactivar un producto no borra su historial anterior.

### Estados de stock

| Color | Significado |
|-------|-------------|
| 🟢 OK | Stock por encima del mínimo |
| 🟠 Bajo | Stock en o por debajo del mínimo |
| 🔴 Agotado | Stock = 0 |

---

## Ventas

### Punto de venta

1. Ir a **Ventas** en el menú lateral
2. La pestaña **Nueva venta** ya está seleccionada
3. **Escaneá o escribí** el código del producto y presioná Enter
4. El producto se agrega al carrito automáticamente
5. Podés cambiar la cantidad si llevan más de uno
6. Elegí el **método de pago** (efectivo, débito, crédito, transferencia)
7. Si corresponde, aplicá un **descuento** en pesos
8. Click en **Cobrar**

### Usar lector de barras USB

Conectá el lector a la PC. Cuando pasás un código de barras, el lector escribe el número y presiona Enter automáticamente. El sistema lo detecta y agrega el producto al carrito. No requiere configuración adicional.

### Múltiples cantidades del mismo producto

Si un cliente lleva 3 unidades del mismo producto:

1. Escaneá el código una vez
2. En el carrito, cambiá la cantidad de 1 a 3 con las flechitas o escribiendo el número

### Historial de ventas

La pestaña **Historial** muestra las últimas 50 ventas registradas con:
- Número de venta
- Fecha y hora
- Total
- Método de pago
- Cajero

---

## Ajustes de stock manuales

Para corregir stock sin pasar por una venta (roturas, mercadería encontrada, ajustes de inventario inicial):

1. En la pantalla de **Productos**, usá los botones **+1** y **-1** para ajustes unitarios
2. Para ajustes con cantidades específicas, necesitás usar la API:

```powershell
# Ejemplo: sumar 10 unidades al producto con ID 1
curl -X POST http://localhost:8090/api/stock/adjust `
  -H "Authorization: Bearer tustock-local-token" `
  -H "Content-Type: application/json" `
  -d '{"product_id":1,"quantity":10,"movement_type":"entry","notes":"Reposicion semanal"}'
```

> [!info]
> En versiones futuras del frontend se agregará un panel de ajustes de stock con interfaz visual.

---

## Informes

### Generar informe diario

1. Ir a **Informes** en el menú lateral
2. Seleccioná la fecha
3. Click en **Generar / Re-generar**

El informe incluye:

- **Totales**: ventas, transacciones, artículos vendidos, descuentos
- **Por método de pago**: cuánto se cobró en efectivo, tarjeta y otros
- **Top productos**: los más vendidos del día con cantidades e ingresos

### Ver informes de días anteriores

1. Seleccioná la fecha deseada
2. Click en **Ver informe**

Si el informe no existe para esa fecha, el sistema te ofrece generarlo.

> [!tip]
> Acostumbrate a generar el informe al cerrar el día. El sistema recalcula los datos cada vez que lo generás, así que podés regenerarlo si hubo ventas posteriores.

---

## Auditorías

Ver la guía completa en [[Auditorías de Stock]].

---

## App Android

Ver la guía completa en [[App Android - Scanner]].

> [!info] Ícono de la app
> La app tiene ícono propio: **caja azul con código de barras y tilde verde**. Una vez instalada, lo ves en el cajón de apps del celular.

---

## Backup

Ver la guía completa en [[Backup y Restauración]].

> [!danger]
> Hacé backups regularmente. La base de datos contiene todo el historial de tu negocio.
