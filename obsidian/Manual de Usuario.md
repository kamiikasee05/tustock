---
tags:
  - tustock
  - manual
  - usuario
  - completo
---

# Manual de Usuario — TUSTOCK

> Sistema de gestión de stock para polirrubros. Todo corre en tu PC, sin internet ni suscripciones.

---

## Tabla de Contenido

1. [[Manual de Usuario#1 Bienvenido a TUSTOCK|Bienvenido a TUSTOCK]]
2. [[Manual de Usuario#2 Instalación PASO a PASO|Instalación PASO a PASO]]
3. [[Manual de Usuario#3 Iniciar el sistema por primera vez|Iniciar el sistema por primera vez]]
4. [[Manual de Usuario#4 El Dashboard — Tu pantalla de inicio|El Dashboard]]
5. [[Manual de Usuario#5 Productos — Cómo manejar tu inventario|Productos]]
6. [[Manual de Usuario#6 Ventas — El punto de venta PASO a PASO|Ventas]]
7. [[Manual de Usuario#7 Auditorías de stock — Encontrá qué falta y qué sobra|Auditorías de stock]]
8. [[Manual de Usuario#8 Informes diarios — Sabé cuánto vendiste|Informes diarios]]
9. [[Manual de Usuario#9 App Android — El escáner en tu celular|App Android]]
10. [[Manual de Usuario#10 Backup y restauración — No pierdas tus datos|Backup y restauración]]
11. [[Manual de Usuario#11 Atajos de teclado|Atajos de teclado]]
12. [[Manual de Usuario#12 Consejos prácticos para el día a día|Consejos prácticos]]
13. [[Manual de Usuario#13 Solución de problemas|Solución de problemas]]
14. [[Manual de Usuario#14 Preguntas frecuentes FAQ|Preguntas frecuentes (FAQ)]]

---

## 1. Bienvenido a TUSTOCK

### ¿Qué es TUSTOCK?

```
┌──────────────────────────────────────────────────────────┐
│                     TUSTOCK                               │
│                                                           │
│   Un sistema para manejar TODO el inventario de tu       │
│   negocio desde una sola PC. Sin internet, sin servidores│
│   externos, sin pagar nada. Funciona con tu lector de     │
│   barras USB o con un celular Android como escáner.       │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### ¿Qué podés hacer con TUSTOCK?

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  DASHBOARD   │   │  PRODUCTOS   │   │   VENTAS     │
│              │   │              │   │              │
│  · Ventas    │   │  · Cargar    │   │  · Escanear  │
│    del día   │   │    productos │   │    códigos   │
│  · Alertas   │   │  · Editar    │   │  · Armar     │
│    de stock  │   │    precios   │   │    carrito   │
│  · Accesos   │   │  · Ver stock │   │  · Cobrar    │
│    rápidos   │   │  · Ajustes   │   │  · Historial │
└──────────────┘   └──────────────┘   └──────────────┘

┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ AUDITORÍAS   │   │  INFORMES    │   │ APP ANDROID  │
│              │   │              │   │              │
│  · Contar    │   │  · Total     │   │  · Escanear  │
│    stock     │   │    vendido   │   │    QR/barras │
│  · Encontrar │   │  · Por pago  │   │  · Consultar │
│    faltantes │   │  · Top       │   │    productos │
│  · Corregir  │   │    productos │   │  · Registrar │
│    automát.  │   │  · Historial │   │    nuevos    │
└──────────────┘   └──────────────┘   └──────────────┘
```

> [!tip]
> Toda la información se guarda en **tu PC**, en un solo archivo llamado `tustock.db`. Vos tenés el control total. Nadie más puede ver tus datos.

### ¿Qué necesitás para usar TUSTOCK?

| ¿Qué? | ¿Para qué? |
|-------|-----------|
| **Una PC con Windows** | Ahí corre el sistema |
| **Python** (gratis) | Para que funcione el servidor |
| **Node.js** (gratis) | Para la interfaz visual |
| **Un navegador** (Chrome, Edge, Firefox) | Para abrir el sistema |
| **Lector de barras USB** *(opcional)* | Para escanear productos rápido |
| **Celular Android** *(opcional)* | Para usar la app escáner |

---

## 2. Instalación PASO a PASO

> [!warning]
> Seguí estos pasos **en orden**. Si te salteás alguno, el sistema no va a funcionar.

### Paso 1 — Instalar Python

Python es lo que hace funcionar el "motor" del sistema.

1. Abrí tu navegador de internet (Chrome, Edge, Firefox)
2. Andá a la página: **https://python.org**
3. Click en el botón amarillo grande que dice **Download Python**
4. Cuando se descargue el archivo, abrilo
5. **MUY IMPORTANTE**: Marcá la casilla que dice **"Add Python to PATH"** (abajo del todo)
6. Click en **Install Now**
7. Esperá a que termine. Click en **Close**.

```
┌───────────────────────────────────────────┐
│     Instalador de Python                   │
│                                            │
│   ┌─────────────────────────────────┐     │
│   │  Install Now                     │     │
│   │                                  │     │
│   │  ☑ Add Python to PATH  ← MARCAR │     │
│   │                                  │     │
│   └─────────────────────────────────┘     │
│                                            │
└───────────────────────────────────────────┘
```

### Paso 2 — Instalar Node.js

Node.js es lo que hace funcionar la parte visual del sistema (lo que ves en pantalla).

1. Abrí tu navegador de internet
2. Andá a: **https://nodejs.org**
3. Click en el botón verde que dice **LTS** (es la versión más estable)
4. Cuando se descargue, abrilo
5. Click en **Next**, **Next**, **Next**, **Install**, **Finish**

### Paso 3 — Verificar que todo esté instalado

Abrí una **terminal**:

```
┌──────────────────────────────────────────────┐
│  Cómo abrir la terminal:                      │
│                                                │
│  1. Presioná la tecla Windows (la del logo)   │
│  2. Escribí: PowerShell                        │
│  3. Presioná Enter                             │
│                                                │
│  Se abre una ventana negra. Ahí escribís los  │
│  comandos.                                     │
└──────────────────────────────────────────────┘
```

Escribí estos comandos (presioná Enter después de cada uno):

```powershell
python --version
```

Deberías ver algo como `Python 3.11.5` o similar.

```powershell
node --version
```

Deberías ver algo como `v20.11.0` o similar.

Si alguno de los dos **no te muestra un número**, volvé al paso correspondiente y reinstalalo.

### Paso 4 — Descargar TUSTOCK

Hay dos formas. Elegí una:

#### Forma A: Con Git (la más fácil)

1. Instalá **Git** desde [git-scm.com](https://git-scm.com) (igual que instalaste Python: Next, Next, Finish)
2. Abrí la terminal y escribí:

```powershell
cd C:\
git clone https://github.com/kamiikasee05/tustock.git
```

#### Forma B: Manual (sin Git)

1. Andá a: `https://github.com/kamiikasee05/tustock`
2. Click en el botón verde **Code**
3. Click en **Download ZIP**
4. Descomprimí el ZIP en `C:\TUSTOCK`

### Paso 5 — Ejecutar el instalador automático

Abrí la terminal y escribí:

```powershell
cd C:\TUSTOCK
scripts\setup.bat
```

Esto va a instalar todo lo necesario automáticamente. Puede tardar unos minutos. Esperá a que termine.

> [!tip]
> Si la terminal te pregunta algo, respondé que sí (escribí `y` y presioná Enter). Si aparece texto rojo, no te asustes — muchas veces son advertencias que no impiden que funcione.

---

## 3. Iniciar el sistema por primera vez

### Arrancar TUSTOCK

1. Abrí la terminal
2. Escribí:

```powershell
cd C:\TUSTOCK
scripts\start.bat
```

3. Vas a ver un montón de texto pasar. Al final deberías ver algo como:

```
Uvicorn running on http://127.0.0.1:8090
```

> [!warning]
> **No cierres la terminal.** Si la cerrás, el sistema se apaga. Dejala abierta mientras uses TUSTOCK.

4. Abrí tu navegador (Chrome, Edge, Firefox)
5. En la barra de direcciones (arriba), escribí:

```
http://localhost:8090
```

6. Presioná Enter. ¡Listo! Ya estás dentro.

```
┌──────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────┐     │
│  │ http://localhost:8090                           │  ←  │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│   ┌──────────────────────────────────────────────┐     │
│   │                                              │     │
│   │          T U S T O C K                       │     │
│   │                                              │     │
│   │     ════  Dashboard  ════                    │     │
│   │                                              │     │
│   │   Ventas hoy: $0                             │     │
│   │   Transacciones: 0                           │     │
│   │   ...                                        │     │
│   │                                              │     │
│   └──────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Cómo apagar el sistema

1. Volvé a la ventana de la terminal (la ventana negra)
2. Presioná las teclas **Ctrl + C** al mismo tiempo
3. Esperá a que se detenga
4. Podés cerrar la terminal

### Atajo para el escritorio (recomendado)

Para no tener que escribir comandos cada vez:

1. Andá a la carpeta `C:\TUSTOCK\scripts\`
2. Hacé **click derecho** sobre el archivo `start.bat`
3. Elegí **Enviar a > Escritorio (crear acceso directo)**
4. En el escritorio, click derecho sobre el acceso directo, elegí **Propiedades**
5. Click en **Cambiar icono** y ponete uno que te guste
6. Ahora con hacer doble click en ese ícono, ya arranca TUSTOCK

---

## 4. El Dashboard — Tu pantalla de inicio

Cuando entrás a `http://localhost:8090`, lo primero que ves es el **Dashboard**. Es como el tablero de tu auto: te muestra todo lo importante de un vistazo.

```
┌──────────────────────────────────────────────────────────────┐
│   ☰  TUSTOCK                           Dashboard             │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│  Inicio  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────┐ │
│  Productos│  │ Ventas   │ │Transacc. │ │Artículos │ │Tkt. │ │
│  Ventas  │  │ hoy      │ │          │ │vendidos  │ │prom.│ │
│  Auditor.│  │ $45.000  │ │   23     │ │   89     │ │$1.956│ │
│  Informes│  └──────────┘ └──────────┘ └──────────┘ └─────┘ │
│          │                                                   │
│          │  ⚠ Productos con stock bajo (4)                   │
│          │  ┌──────────────────────────────────────────────┐ │
│          │  │ Coca-Cola 1.5L    2    Mín:10   REPONER     │ │
│          │  │ Arroz 1kg         1    Mín:5    REPONER     │ │
│          │  │ Yerba 500g        0    Mín:8    AGOTADO     │ │
│          │  │ Aceite 900ml      3    Mín:6    REPONER     │ │
│          │  └──────────────────────────────────────────────┘ │
│          │                                                   │
│          │  Acciones rápidas                                 │
│          │  ▸ Nueva venta         →                          │
│          │  ▸ Agregar producto    →                          │
│          │  ▸ Iniciar auditoría   →                          │
│          │  ▸ Generar informe     →                          │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

A la izquierda está el **menú lateral**. Desde ahí navegás a todas las secciones:

| Menú | ¿Qué hacés ahí? |
|------|---------------|
| **Inicio** | Volvés al Dashboard |
| **Productos** | Cargás, editás y administrás tu inventario |
| **Ventas** | El punto de venta para cobrar a los clientes |
| **Auditorías** | Contás stock físico y lo comparás con el sistema |
| **Informes** | Ves cuánto vendiste en el día |

### ¿Qué información muestra el Dashboard?

**Tarjetas superiores:**

| Tarjeta | ¿Qué significa? |
|---------|----------------|
| **Ventas hoy** | Total de plata que entró hoy |
| **Transacciones** | Cuántas ventas hiciste |
| **Artículos vendidos** | Cuántos productos salieron |
| **Ticket promedio** | Cuánto gasta cada cliente en promedio |

**Alertas de stock bajo:**

El sistema te avisa cuando un producto tiene **poco stock** o **está agotado**:

| Color | Significado |
|-------|-------------|
| Naranja **REPONER** | El stock está en o por debajo del mínimo que configuraste |
| Rojo **AGOTADO** | Stock = 0. No tenés nada. |

Las alertas se actualizan **automáticamente cada 30 segundos**. También podés recargar la página (tecla **F5**) para ver los cambios al instante.

**Acciones rápidas:**

Botones para ir directo a lo que más usás, sin tener que navegar por el menú.

---

## 5. Productos — Cómo manejar tu inventario

### La pantalla de productos

```
┌──────────────────────────────────────────────────────────────┐
│  Productos                            [+ Nuevo producto]      │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🔍 Buscar por nombre o código...                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────┬───────────────┬────────┬──────┬─────┬──────┬──────┐│
│  │Código│ Nombre        │P. Venta│Stock │Mín. │Estado│Acción││
│  ├──────┼───────────────┼────────┼──────┼─────┼──────┼──────┤│
│  │779...│Coca-Cola 1.5L │ $2.500 │  24  │ 10  │  OK  │+1 -1✎│
│  │779...│Arroz Gallo 1kg│ $1.800 │   3  │  5  │ BAJO │+1 -1✎│
│  │847...│Yerba Amanda   │ $2.100 │   0  │  8  │AGOT. │+1 -1✎│
│  └──────┴───────────────┴────────┴──────┴─────┴──────┴──────┘│
└──────────────────────────────────────────────────────────────┘
```

### 5.1 Agregar un producto nuevo

1. Click en el botón **+ Nuevo producto** (arriba a la derecha)
2. Se abre un formulario. Completalo así:

```
┌──────────────────────────────────────────┐
│  Nuevo producto                          │
│                                          │
│  Código:   ┌──────────────────────────┐  │
│            │ 7790895001234             │  │  ← El código de barras
│            └──────────────────────────┘  │
│                                          │
│  Nombre:   ┌──────────────────────────┐  │
│            │ Coca-Cola 1.5 Litros      │  │  ← Nombre descriptivo
│            └──────────────────────────┘  │
│                                          │
│  Precio    ┌──────────────────────────┐  │
│  costo:    │ 1500                      │  │  ← Lo que te costó a vos
│            └──────────────────────────┘  │
│                                          │
│  Precio    ┌──────────────────────────┐  │
│  venta:    │ 2500                      │  │  ← A cuánto lo vendés
│            └──────────────────────────┘  │
│                                          │
│  Stock     ┌──────────────────────────┐  │
│  mínimo:   │ 10                        │  │  ← Cuándo te avisa
│            └──────────────────────────┘  │
│                                          │
│  Unidad:   ┌──────────────────────────┐  │
│            │ unidad                    │  │  ← unid, kg, litro...
│            └──────────────────────────┘  │
│                                          │
│  Descripción (opcional):                │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [ Crear producto ]  [ Cancelar ]       │
└──────────────────────────────────────────┘
```

3. Click en **Crear producto**

> [!tip]
> **Importante sobre los códigos:** Podés usar el código de barras que ya trae el producto (EAN-13, generalemnte 13 dígitos), o inventar tu propio código interno (ej: `COCA-15L`). Lo importante es que **cada código sea único** — no puede haber dos productos con el mismo código.

### 5.2 Editar un producto

1. En la lista de productos, buscá el que querés modificar
2. Click en el botón **✎** (lápiz)
3. Se abre el mismo formulario de antes, con los datos cargados
4. Cambiá lo que necesites
5. Click en **Guardar cambios**

> [!warning]
> El **código** del producto no se puede cambiar una vez creado. Si necesitás cambiarlo, vas a tener que borrar el producto y crear uno nuevo con el código correcto. Esto es a propósito: evita confusiones con el historial de ventas.

### 5.3 Desactivar (eliminar) un producto

1. En la lista de productos, click en el botón **×** del producto que querés eliminar
2. Confirmá la operación

> [!tip]
> El producto no se borra para siempre. Se **desactiva**: deja de aparecer en ventas y en stock, pero el historial de ventas anteriores se conserva. Si algún día lo volvés a necesitar, podés reactivarlo desde la base de datos o creando uno nuevo con otro código.

### 5.4 Ajustar el stock manualmente

En la columna **Acciones** de cada producto tenés dos botones:

| Botón | ¿Qué hace? |
|-------|-----------|
| **+1** | Suma 1 unidad al stock. Usalo cuando entra mercadería. |
| **-1** | Resta 1 unidad. Usalo por roturas, vencimientos o correcciones. |

```
Producto: Coca-Cola 1.5L   Stock: 24
                                  ^
                    ┌─────────────┴─────────────┐
                    │ [ +1 ]  [ -1 ]  [ ✎ ]  [ × ] │
                    └─────────────────────────────┘
```

Ejemplo de uso:
- Llegó el delivery con 12 Coca-Colas → apretá **+1** doce veces, o leelo con el escáner del celular.
- Se rompió una botella → apretá **-1** una vez.

Para ajustes de cantidades grandes (ej: sumar 50 unidades de una vez), consultá la sección [[Manual de Usuario#13 Solución de problemas|Solución de problemas]].

### 5.5 Buscar productos

Usá la barra de búsqueda para encontrar productos:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 coc                                                      │
└─────────────────────────────────────────────────────────────┘
```

Escribí parte del nombre o del código. La búsqueda es **parcial**: si escribís "coc", encuentra "Coca-Cola", "Coco rallado", "Chocolate", etc.

> [!tip]
> La búsqueda se ejecuta automáticamente mientras escribís. No hace falta presionar Enter.

### 5.6 Estados del stock

Cada producto muestra su estado con colores:

```
🟢 OK      → Stock por encima del mínimo     (color verde, dice "OK")
🟠 BAJO    → Stock en o por debajo del mínimo (color naranja, dice "BAJO" o "REPONER")
🔴 AGOTADO → Stock = 0                        (color rojo, dice "AGOTADO")
```

---

## 6. Ventas — El punto de venta (POS)

Esta es la pantalla que más vas a usar. Desde acá cobrás a los clientes.

### La pantalla de ventas

```
┌──────────────────────────────────────────────────────────────────┐
│  Ventas                                                           │
│                                                                   │
│  [ Nueva venta ]  [ Historial ]        ← Pestañas                 │
│                                                                   │
│  ┌─────────────────────────────────────┐ ┌──────────────────────┐│
│  │ 🔍 Escanear o escribir código...    │ │ Resumen              ││
│  │                              [Agregar]│ │                      ││
│  ├─────────────────────────────────────┤ │ Subtotal     $7.500  ││
│  │ Producto      Precio  Cant  Subtot. │ │ Descuento   ┌─────┐ ││
│  │ ─────────────────────────────────── │ │             │  500│ ││
│  │ Coca 1.5L     $2.500   2   $5.000  │ │             └─────┘ ││
│  │ Arroz 1kg     $1.800   1   $1.800  │ │ ─────────────────── ││
│  │ Yerba 500g    $2.100   1   $2.100  │ │ TOTAL        $8.400 ││
│  │                                    │ │                      ││
│  │                                    │ │ Pago: [Efectivo ▾]  ││
│  │                                    │ │                      ││
│  │                                    │ │ [   Cobrar $8.400  ]││
│  └────────────────────────────────────┘ └──────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 6.1 Cómo hacer una venta — PASO a PASO

1. **Ir a Ventas** → Click en "Ventas" en el menú de la izquierda
2. **Asegurate de estar en la pestaña "Nueva venta"** (la que está seleccionada por defecto)
3. **Escaneá el producto** o escribí el código en la casilla de búsqueda:

```
┌──────────────────────────────────────────────────┐
│ 🔍 7790895001234                          [Agregar]│
└──────────────────────────────────────────────────┘
```

4. **Presioná Enter** o click en **Agregar**
5. El producto aparece en el carrito. **Repetí** para cada producto que lleva el cliente.

6. **Si lleva más de una unidad del mismo producto**, cambiá la cantidad en la columna "Cant." del carrito:

```
┌──────────────────────────────────────────────────┐
│ Coca-Cola 1.5L    $2.500   ┌───┐    $5.000       │
│                             │ 2 │                 │
│                             └───┘                 │
│                        ↕ flechitas para cambiar   │
└──────────────────────────────────────────────────┘
```

7. **Elegí el método de pago** en el panel de la derecha:

```
Método de pago
┌─────────────────────────┐
│ Efectivo            ▾   │
├─────────────────────────┤
│ Efectivo                 │
│ Débito                   │
│ Crédito                  │
│ Transferencia            │
│ Otro                     │
└─────────────────────────┘
```

8. **Aplicá descuento si corresponde** (en pesos, no en porcentaje):

```
Descuento:  ┌─────────┐
            │ 500     │  ← poné 500 para descontar $500
            └─────────┘
```

9. **Click en el botón verde "Cobrar"** (abajo a la derecha)

```
┌──────────────────────┐
│                      │
│  Cobrar $8.400       │  ← Click acá
│                      │
└──────────────────────┘
```

10. Aparece un cartel confirmando la venta: **"Venta #X registrada — Total: $8.400"**

11. **El carrito se vacía** automáticamente. ¡Listo para la próxima venta!

### 6.2 Usar lector de barras USB

Si tenés un lector de barras conectado por USB:

1. Conectalo a la PC (no requiere instalar nada)
2. Andá a **Ventas > Nueva venta**
3. Pasá el producto por el lector
4. El código se escribe solo y el producto se agrega automáticamente

```
┌──────────┐
│ Lector   │  ──USB──▶  PC  ──▶  TUSTOCK agrega el producto solo
│ de barras│
└──────────┘
```

> [!tip]
> **El lector de barras funciona como un teclado**: cuando pasás un código, "escribe" el número y presiona Enter automáticamente. No tenés que configurar nada en TUSTOCK. Simplemente conectalo y andá a la pantalla de Ventas.

### 6.3 Múltiples cantidades del mismo producto

Si un cliente lleva 3 unidades del mismo producto:

**Forma 1:** Escaneá el código **una sola vez** y después cambiá la cantidad en el carrito a 3.

**Forma 2:** Escaneá 3 veces el mismo código. Cada escaneo suma 1 a la cantidad.

> [!tip]
> La forma 1 es más rápida. La forma 2 es mejor si el cliente va agregando productos de a uno mientras los ponés en la bolsa.

### 6.4 Corregir errores en el carrito

- **Para cambiar la cantidad**: Usá las flechitas o escribí directamente el número en la columna "Cant."
- **Para borrar un producto del carrito**: Click en el botón **×** rojo al lado del producto
- **Para vaciar todo el carrito**: Borrá uno por uno, o recargá la página (F5) — pero perdés lo que habías cargado

### 6.5 Ver el historial de ventas

Click en la pestaña **Historial**:

```
┌─────────────────────────────────────────────────────────────┐
│  [# Nueva venta]  [ Historial ]                              │
│                                                              │
│  ┌──┬───────────────┬───────┬──────┬─────┬────────┐        │
│  │# │ Fecha         │ Total │ Pago │Ítems│ Cajero │        │
│  ├──┼───────────────┼───────┼──────┼─────┼────────┤        │
│  │#1│ 2026-06-22    │ $8.400│efect.│  3  │Mostrador│       │
│  │#2│ 2026-06-22    │ $2.500│débito│  1  │Mostrador│       │
│  │#3│ 2026-06-22    │ $1.800│transf│  1  │Mostrador│       │
│  └──┴───────────────┴───────┴──────┴─────┴────────┘        │
│                                                              │
│  (últimas 50 ventas)                                         │
└─────────────────────────────────────────────────────────────┘
```

Muestra las últimas 50 ventas. Cada venta muestra:

| Columna | Descripción |
|---------|-------------|
| **#** | Número de venta |
| **Fecha** | Día y hora en que se hizo |
| **Total** | Plata cobrada |
| **Pago** | Método: efectivo, débito, crédito, etc. |
| **Ítems** | Cuántos productos distintos llevó |
| **Cajero** | Quién la registró |

---

## 7. Auditorías de stock — Encontrá qué falta y qué sobra

Las auditorías te permiten **comparar lo que dice el sistema con lo que realmente hay en la góndola**. Es como hacer un inventario rápido para ver si perdiste mercadería o hay errores.

### ¿Cuándo hacer una auditoría?

- Una vez por **mes** en productos clave (los más caros o los que más se venden)
- Una vez cada **3 meses** en todo el local
- Cuando **sospechás** que falta mercadería
- Después de un **cambio de personal**

### 7.1 Crear una auditoría nueva

1. Andá a **Auditorías** en el menú lateral
2. Escribí una nota (opcional) para identificar de qué se trata:

```
┌──────────────────────────────────────────┐
│  Nueva auditoría                         │
│                                          │
│  Notas: ┌──────────────────────────────┐ │
│         │ Auditoría mensual depósito   │ │
│         └──────────────────────────────┘ │
│                                          │
│  [ Crear auditoría ]                     │
└──────────────────────────────────────────┘
```

3. Click en **Crear auditoría**
4. El sistema toma una "foto" del stock actual. Este es el **stock teórico**.

### 7.2 Iniciar el conteo

1. En la lista de auditorías, buscá la que recién creaste (estado: **Borrador**)
2. Click en **Iniciar**
3. El estado cambia a **En curso**

```
┌────────────────────────────────────────────────────────┐
│ # │ Fecha      │ Estado    │ Notas            │ Acción │
│───┼────────────┼───────────┼──────────────────┼────────│
│ 3 │ 2026-06-22 │ Borrador  │ Auditoría mensual│[Iniciar]│  ← click
│ 2 │ 2026-06-15 │ Completada│ Semanal          │ Complet.│
│ 1 │ 2026-06-01 │ Completada│ Inauguración     │ Complet.│
└────────────────────────────────────────────────────────┘
```

### 7.3 Escanear productos

```
┌──────────────────────────────────────────────────────────┐
│  ← Volver    Auditoría #3     Estado: En curso           │
│                                                           │
│  ┌──────────────────────────────────┐  ┌────────────┐   │
│  │ 🔍 Escanear código para contar... │  │ Contar +1  │   │
│  └──────────────────────────────────┘  └────────────┘   │
│                                                           │
│  Diferencias: 2                 [ Completar y aplicar ]   │
│                                                           │
│  ┌──────────────┬───────┬───────┬───────────┐           │
│  │ Producto     │Teórico│Contado│Diferencia │           │
│  ├──────────────┼───────┼───────┼───────────┤           │
│  │ Coca 1.5L    │  24   │  22   │   -2      │  ← rojo   │
│  │ Sprite 1.5L  │  18   │  20   │   +2      │  ← verde  │
│  └──────────────┴───────┴───────┴───────────┘           │
└──────────────────────────────────────────────────────────┘
```

- **Escaneá o escribí** el código de cada producto y presioná Enter
- Cada escaneo **suma +1** al contado de ese producto
- Vas viendo en tiempo real:
  - **Teórico**: lo que el sistema cree que hay
  - **Contado**: lo que vas registrando
  - **Diferencia**: positivo (+sobrante) o negativo (-faltante)

> [!tip]
> Podés usar la [[App Android - Scanner|app Android]] o un lector de barras USB. Cada "bip" suma uno al contado de ese producto.

### 7.4 Completar la auditoría

Cuando terminaste de contar todo:

1. Click en **Completar y aplicar**
2. Confirmá la acción
3. El sistema:
   - Calcula todas las diferencias (faltantes y sobrantes)
   - **Corrige el stock automáticamente** para que coincida con lo contado
   - Guarda todo en el historial

```
┌──────────────────────────────────────────────┐
│  ⚠  ¿Completar auditoría y aplicar           │
│     correcciones?                             │
│                                                │
│  Se encontraron 2 diferencias.                │
│  El stock será ajustado automáticamente.      │
│                                                │
│  [ Cancelar ]    [ Aceptar ]                  │
└──────────────────────────────────────────────┘
```

> [!warning]
> Cuando completás una auditoría, **el stock se corrige automáticamente**. Revisá bien las diferencias antes de completar. Si hay una diferencia muy grande (ej: dice que faltan 50 unidades de algo), puede ser un error de conteo. **Recontá antes de aplicar.**

### 7.5 Ejemplo práctico

Imaginá que hacés una auditoría en la góndola de bebidas:

| Producto | Teórico | Contaste | Diferencia | ¿Qué pasó? |
|----------|---------|----------|------------|-------------|
| Coca-Cola 1.5L | 24 | 22 | **-2** | Faltan 2 botellas |
| Sprite 1.5L | 18 | 20 | **+2** | Sobran 2 |
| Agua mineral | 50 | 50 | **0** | OK, sin diferencias |

Al completar, Coca-Cola se ajusta a 22 y Sprite a 20. Las diferencias quedan registradas.

### 7.6 Buenas prácticas

1. **Auditá por sectores**: no intentes contar todo el local de una vez. Empezá por una góndola, seguí por otra.
2. **No mires el teórico mientras contás**: así evitás el sesgo de "creer" que hay cierta cantidad.
3. **Dos personas**: uno cuenta y el otro registra. Reduce errores.
4. **Diferencias grandes**: si un producto muestra diferencia de más de 5 unidades, recontá antes de aplicar.
5. **Frecuencia**: mensual para productos caros, trimestral para todo el local.

---

## 8. Informes diarios — Sabé cuánto vendiste

El informe diario te dice exactamente cuánta plata entró, por qué medio de pago y qué productos vendiste más.

### La pantalla de informes

```
┌──────────────────────────────────────────────────────────┐
│  Informes Diarios                                         │
│                                                           │
│  Fecha: ┌────────────┐                                   │
│         │ 2026-06-22 │  [ Ver informe ]  [ Generar ]     │
│         └────────────┘                                   │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Total vent.│ │Transacc. │ │Artículos │ │Descuentos│   │
│  │$ 45.800  │ │   23     │ │   89     │ │ $1.200   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                           │
│  ┌─────────────────────┐ ┌─────────────────────────────┐ │
│  │ Por método de pago  │ │ Top productos                │ │
│  │                     │ │                              │ │
│  │ Efectivo  $28.000   │ │ Coca-Cola 1.5L  15  $37.500 │ │
│  │ ████████████  61%   │ │ Arroz 1kg        12  $21.600│ │
│  │ Tarjeta   $12.000   │ │ Yerba 500g       10  $21.000│ │
│  │ ██████       26%   │ │ Aceite 900ml      8  $14.400│ │
│  │ Otros     $5.800    │ │ Pan lactal       7  $8.400 │ │
│  │ ███         13%    │ │                              │ │
│  └─────────────────────┘ └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 8.1 Generar el informe de hoy

1. Andá a **Informes** en el menú lateral
2. La fecha de hoy ya está seleccionada
3. Click en **Generar / Re-generar**

### 8.2 Ver informes de días anteriores

1. Click en el campo de fecha y seleccioná el día que querés ver
2. Click en **Ver informe**

> [!tip]
> Si el informe no existe para esa fecha, el sistema te avisa y te pregunta si querés generarlo. Podés generar informes de cualquier día, incluso de semanas atrás.

### 8.3 ¿Cada cuánto generar el informe?

> [!tip]
> **Acostumbrate a generar el informe al cerrar el día.** Antes de apagar la PC, andá a Informes, click en Generar y revisá los números. El sistema recalcula todo cada vez que generás, así que podés regenerarlo si hubo más ventas después.

### 8.4 ¿Qué significan los números?

| Sección | Detalle |
|---------|---------|
| **Total ventas** | Toda la plata que entró en el día (descontando descuentos) |
| **Transacciones** | Cantidad de ventas distintas que hiciste (clientes que atendiste) |
| **Artículos vendidos** | Total de productos que salieron (sumando cantidades) |
| **Descuentos** | Cuánta plata dejaste de cobrar por descuentos |
| **Ticket promedio** | Total de ventas dividido por transacciones |
| **Por método de pago** | Cuánto cobraste en efectivo, tarjeta y otros |
| **Top productos** | Los productos que más vendiste, ordenados por ingresos |

---

## 9. App Android — El escáner en tu celular

La app TUSTOCK Scanner convierte tu celular Android en un lector de códigos QR y de barras. Ideal para:
- Escanear productos cuando no tenés lector USB
- Contar stock en el depósito (movés el celular, no la PC)
- Registrar productos nuevos escaneando su código

```
┌─────────────────────────────────────────────┐
│            TUSTOCK Scanner                   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ URL del servidor                      │   │
│  │ http://192.168.1.100:8090             │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Estado: ● Conectado (verde)                │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │         [     ESCANEAR     ]          │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘
```

### 9.1 Instalar la app

1. Abrí **Android Studio** en la PC
2. Abrí la carpeta `android/` dentro de `C:\TUSTOCK`
3. Conectá el celular por USB
4. En el celular, activá **Depuración USB** (Ajustes > Opciones de desarrollador)
5. Click en el botón ▶️ (Run) en Android Studio

Si no sabés usar Android Studio, hay una guía paso a paso en la nota [[App Android - Scanner]].

### 9.2 Configurar la app

Para que el celular se conecte al sistema necesitás:

1. **Que el servidor acepte conexiones externas.** Creá o editá el archivo `C:\TUSTOCK\server\.env` y agregá:

```
TUSTOCK_HOST=0.0.0.0
```

2. **Saber la IP de tu PC.** En la terminal de la PC escribí:

```powershell
ipconfig
```

Buscá donde dice **Dirección IPv4**. Va a ser algo como `192.168.1.100`.

3. En la app del celular, en **URL del servidor** escribí:

```
http://192.168.1.100:8090
```

4. Click en **Conectar**. Si se pone verde, ¡listo!

> [!warning]
> La PC y el celular tienen que estar en la **misma red WiFi** (la del local). Si la PC está conectada por cable y el celular por WiFi, tienen que estar en el mismo router.

### 9.3 Escanear productos

1. Click en **ESCANEAR**
2. Apuntá la cámara al código QR o de barras
3. La app lo detecta automáticamente y muestra:

```
┌──────────────────────────────────┐
│  Coca-Cola 1.5L                  │
│  Código: 7790895001234           │
│  Precio: $2.500                  │
│  Stock: 24                       │
│                                  │
│  (stock OK = blanco,             │
│   stock bajo ≤ 5 = naranja,     │
│   agotado = rojo)               │
└──────────────────────────────────┘
```

### 9.4 Producto no encontrado

Si el código no está en el sistema, la app te permite **registrarlo desde el celular**:

1. Escaneá el código
2. La app dice "Producto no encontrado"
3. Click en **Registrar**
4. Completá: **Nombre** y **Precio de venta** (el código ya está cargado)
5. Click en **Registrar producto**

Se crea en el servidor y ya queda disponible para ventas.

### 9.5 Tipos de códigos que lee

La app reconoce prácticamente todos los códigos que existen:

| Formato | Dónde se usa |
|---------|-------------|
| EAN-8 / EAN-13 | La mayoría de los productos de almacén |
| UPC-A / UPC-E | Productos importados |
| QR Code | Productos con QR, promociones |
| Code 39 / 128 | Códigos internos de depósito |
| Data Matrix | Electrónica, componentes chicos |

### 9.6 Solución de problemas de la app

Ver la sección [[Manual de Usuario#13 Solución de problemas|Solución de problemas]], punto "La app Android no se conecta".

---

## 10. Backup y restauración — No pierdas tus datos

> [!danger]
> **Hacé backups regularmente.** El archivo `tustock.db` contiene TODOS tus datos: productos, ventas, auditorías, informes. Si se pierde o corrompe, perdés todo. Un backup es simplemente una copia de ese archivo en otro lugar.

### 10.1 Hacer un backup

Abrí la terminal y escribí:

```powershell
cd C:\TUSTOCK
python scripts\backup.py
```

Esto hace automáticamente:

1. Copia la base de datos a la carpeta `backups\`
2. Le pone fecha y hora al nombre (ej: `tustock_20260622_193000.db`)
3. Conserva los últimos **30 backups** y borra los más viejos

```
C:\TUSTOCK\
├── tustock.db          ← la base de datos activa
└── backups\
    ├── tustock_20260622_193000.db
    ├── tustock_20260621_191500.db
    ├── tustock_20260620_190000.db
    └── ... (30 archivos en total)
```

### 10.2 Backup manual

También podés copiar el archivo a mano:

1. Andá a `C:\TUSTOCK\`
2. Copiá el archivo `tustock.db`
3. Pegalo en otro lugar seguro (un pendrive, otra carpeta, un disco externo)

### 10.3 Restaurar un backup

Si algo sale mal y necesitás volver a una versión anterior:

```powershell
cd C:\TUSTOCK
python scripts\restore.py
```

El script te va a:
1. Mostrar todos los backups disponibles (con fecha y tamaño)
2. Pedirte que elijas cuál restaurar
3. Pedir confirmación (escribir `si` y presionar Enter)
4. Hacer un respaldo de seguridad de la base actual (por las dudas)
5. Sobreescribir la base con la versión que elegiste

> [!warning]
> Al restaurar un backup, **perdés todos los datos posteriores** a la fecha del backup. Las ventas, productos y cambios hechos después de ese backup se pierden. El script guarda la base actual como respaldo antes de hacer el cambio.

### 10.4 ¿Cada cuánto hacer backup?

| Frecuencia | Recomendación |
|------------|--------------|
| **Todos los días** | Al cerrar el día, después de generar el informe. |
| **Todas las semanas** | Copiá el backup a un pendrive o disco externo. |
| **Todos los meses** | Guardá una copia en otro lugar físico (otra PC, casa). |

### 10.5 ¿Se pueden perder datos por un corte de luz?

> [!tip]
> Es muy difícil. El sistema guarda los datos **instantáneamente** en cada operación: al registrar una venta, al ajustar stock, al crear un producto, al completar una auditoría. Si se corta la luz, lo único que podrías perder es lo que estabas escribiendo en ese exacto milisegundo.

Además, SQLite usa **modo WAL** (Write-Ahead Logging), que es la forma más segura de guardar datos.

---

## 11. Atajos de teclado

| Tecla | ¿Qué hace? | ¿Dónde funciona? |
|-------|-----------|-----------------|
| **Enter** | Agregar producto al carrito / escanear en auditoría | Ventas, Auditorías |
| **F5** | Recargar la página (actualizar datos) | Todo el sistema |
| **Ctrl + F** | Buscar en la página | Todo el sistema |
| **Tab** | Saltar al siguiente campo | Formularios |
| **Ctrl + C** | Detener el servidor (en la terminal) | Terminal |
| **Flechas ↑↓** | Cambiar cantidad en el carrito | Ventas (input de cantidad) |

> [!tip]
> **El Enter es tu mejor amigo.** En la pantalla de Ventas, después de escanear un producto, el foco ya está en la casilla de código. Simplemente escaneá y el producto se agrega solo. Si escribís el código a mano, presioná Enter para agregarlo.

---

## 12. Consejos prácticos para el día a día

### Rutina diaria

```
┌────────────────────────────────────────────────────┐
│  MAÑANA                                              │
│  1. Prendé la PC                                     │
│  2. Doble click en el acceso directo de TUSTOCK      │
│  3. Abrí Chrome y entrá a localhost:8090             │
│  4. Revisá las alertas de stock bajo en el Dashboard │
│  5. Andá a Ventas > Nueva venta                      │
│     ¡Listo para empezar a vender!                    │
│                                                      │
│  NOCHE                                               │
│  1. Andá a Informes                                  │
│  2. Click en Generar / Re-generar                    │
│  3. Revisá los números del día                       │
│  4. En la terminal, ejecutá:                         │
│     python scripts\backup.py                        │
│  5. Presioná Ctrl+C en la terminal                   │
│  6. Apagá la PC                                      │
└────────────────────────────────────────────────────┘
```

### Checklist semanal

- [ ] Revisar productos con stock bajo y hacer pedidos a proveedores
- [ ] Hacer backup en un pendrive
- [ ] Verificar que la app Android se conecta bien

### Checklist mensual

- [ ] Hacer auditoría de productos caros o de alta rotación
- [ ] Guardar un backup en otro lugar físico (pendrive en casa)
- [ ] Revisar precios de costo vs. precios de venta

### Consejos sueltos

1. **Precio de costo**: Completalo siempre. Aunque hoy no lo uses, más adelante te va a servir para saber márgenes y ganancias.

2. **Stock mínimo**: Configuralo con criterio. Si vendés 10 Coca-Colas por día, el mínimo debería ser 15 o 20 (para que el aviso te llegue antes de quedarte sin stock).

3. **Códigos de productos**: Si un producto no tiene código de barras, inventale uno. Por ejemplo: `PAN-LACTAL` o `FIAMBRE-001`. El sistema acepta letras y números.

4. **Descuentos**: Siempre en pesos, no en porcentaje. Si querés hacer 10% de descuento, calculalo mentalmente o con la calculadora: $2.500 × 10% = $250 de descuento.

5. **No cierres la terminal**: Si cerrás la ventana negra, se apaga el sistema y nadie puede vender. Minimizala nomás.

6. **Lector de barras**: Si comprás uno, que sea plug-and-play (se conecta y funciona solo, sin instalar drivers). Los más baratos de Mercado Libre funcionan perfecto.

7. **Varias pestañas**: Podés abrir TUSTOCK en varias pestañas del navegador al mismo tiempo. Ej: una pestaña con Ventas y otra con Productos.

---

## 13. Solución de problemas

### "La pantalla queda en blanco"

1. Recargá la página (tecla **F5**)
2. Si sigue en blanco, fijate si la terminal sigue abierta y corriendo
3. Si la terminal se cerró, volvé a ejecutar `scripts\start.bat`

### "No veo el botón de X cosa"

Recargá la página (**F5**). A veces, después de hacer muchos cambios, la pantalla necesita refrescarse.

### "El puerto 8090 ya está en uso"

Significa que TUSTOCK ya está corriendo en otra ventana. O que otro programa está usando ese puerto.

**Solución 1**: Cerrá la otra terminal que pueda tener TUSTOCK abierto, y volvé a intentar.

**Solución 2**: Cambiá el puerto. Creá o editá el archivo `C:\TUSTOCK\server\.env`:

```env
TUSTOCK_PORT=8091
```

Después entrá a `http://localhost:8091` en vez de `:8090`.

### "Error al conectar con el servidor" en el navegador

1. Verificá que la terminal esté abierta y mostrando algo como `Uvicorn running on...`
2. Verificá que estás entrando a `http://localhost:8090` (no a `https://` ni a otra dirección)
3. Probá cerrar la terminal, abrirla de nuevo y ejecutar `scripts\start.bat` otra vez

### "npm no se reconoce" al ejecutar setup.bat

Node.js no está instalado o no se agregó al PATH. Volvé al [[Manual de Usuario#Paso 2 Instalar Nodejs|Paso 2 de la instalación]] y reinstalalo. Asegurate de que durante la instalación diga "Add to PATH".

### "python no se reconoce" al ejecutar setup.bat

Python no está instalado o no se agregó al PATH. Reinstalalo desde [python.org](https://python.org) y **marcá la casilla "Add Python to PATH"** durante la instalación.

### La app Android no se conecta

Verificá todo esto en orden:

1. **¿El servidor está corriendo?** En la PC, la terminal tiene que estar abierta.
2. **¿TUSTOCK_HOST=0.0.0.0?** Sin esto, el servidor solo acepta conexiones de la misma PC.
3. **¿Misma red WiFi?** PC y celular tienen que estar en la misma red.
4. **¿IP correcta?** En la PC, ejecutá `ipconfig` y fijate la IPv4. En el celular, asegurate de poner bien la IP.
5. **¿Firewall de Windows?** A veces Windows bloquea las conexiones. Andá a Panel de Control > Firewall > Permitir una aplicación y agregá el puerto 8090.
6. **Probá en el navegador del celular:** Abrí Chrome en el celular y entrá a `http://IP_DE_LA_PC:8090/api/health`. Si carga, el problema es la app. Si no carga, es la red o el firewall.

### "Se fue la luz y no hice backup"

No deberías perder datos. El sistema guarda todo instantáneamente. Cuando vuelva la luz, prendé la PC, iniciá TUSTOCK y seguí como si nada.

Si por algún motivo la base de datos se corrompió (muy raro, pero puede pasar), restaurá el último backup con `python scripts\restore.py`.

### No puedo cambiar el código de un producto

Es a propósito. El código del producto no se puede editar una vez creado. Si te equivocaste:
1. Creá un producto nuevo con el código correcto
2. Desactivá (borrá) el producto viejo con el código incorrecto

### "La búsqueda de productos no encuentra nada"

Probá:
- Escribir parte del nombre (ej: "coc" en vez de "Coca-Cola")
- Escribir parte del código (ej: "779" en vez del código completo)
- Revisar si el producto está activo (los productos desactivados no aparecen)

### "Cobré una venta y no se descontó del stock"

Esto no debería pasar — el sistema descuenta el stock automáticamente al cobrar. Si ves que el stock no cambió, recargá la página (**F5**) y revisá de nuevo. Si realmente no se descontó, hacé un ajuste manual con el botón **-1** en la pantalla de Productos.

### "Quiero cargar 50 unidades de un producto nuevo, ¿cómo hago?"

**Opción 1 (recomendada):** Creá el producto normalmente. Después, desde la pantalla de Productos, apretá el botón **+1** 50 veces. Es molesto pero funciona.

**Opción 2 (avanzada):** Usá la API del sistema. En la terminal:

```powershell
cd C:\TUSTOCK
python -c "
import requests
r = requests.post('http://localhost:8090/api/stock/adjust',
  headers={'Authorization': 'Bearer tustock-local-token'},
  json={'product_id': 1, 'quantity': 50, 'movement_type': 'entry', 'notes': 'Carga inicial'})
print(r.json())
"
```

Cambiá `product_id` por el número de ID de tu producto (lo ves en la URL cuando editás un producto).

---

## 14. Preguntas frecuentes (FAQ)

### 1. ¿Necesito internet para usar TUSTOCK?

**No.** TUSTOCK es 100% local. Funciona sin internet. No depende de ningún servidor externo ni de la nube. La PC, el sistema y la base de datos están todos en tu local.

### 2. ¿Puedo usar TUSTOCK en más de una PC?

Actualmente no. El sistema está pensado para una sola PC en el local. Si tenés varias PCs en red, la versión Pro (futura) va a soportar múltiples puestos.

### 3. ¿Qué pasa si se me rompe la PC?

Si tenés backups, podés instalar TUSTOCK en otra PC y restaurar el último backup. Sin backup, perdés los datos. Por eso insistimos tanto con los backups.

### 4. ¿Puedo usar TUSTOCK con un lector de barras Bluetooth?

Sí, siempre y cuando el lector se conecte a la PC (como si fuera un teclado). La mayoría de los lectores Bluetooth inalámbricos funcionan así.

### 5. ¿Se puede conectar una impresora de tickets?

Actualmente no. Pero como el sistema muestra el total y los métodos de pago, podés usar cualquier impresora normal para imprimir informes desde el navegador (Ctrl+P).

### 6. ¿Puedo poner precios con decimales?

Sí. Ejemplo: $1.250,50. El sistema acepta decimales en precios de costo y de venta.

### 7. ¿Cuántos productos puedo cargar?

No hay límite. El sistema usa SQLite, que puede manejar millones de registros sin problemas. Para el uso de un polirrubro, es más que suficiente.

### 8. ¿Puedo tener dos productos con el mismo código?

No. El código es la identificación única de cada producto. Si intentás cargar dos productos con el mismo código, el sistema te va a dar error.

### 9. ¿Puedo cambiar la contraseña o ponerle seguridad al sistema?

El sistema usa un token de seguridad (como una contraseña larga). Por defecto es `tustock-local-token`. Si querés cambiarlo, editá el archivo `.env` en la carpeta `server`. Como el sistema es local, la seguridad principal es física: quien no está en la PC no puede acceder.

### 10. ¿Se puede usar sin el lector de barras?

Sí. Podés escribir los códigos a mano con el teclado en la casilla de búsqueda de Ventas. O usar la app Android como escáner.

### 11. ¿Puedo ver cuánto me costó un producto y cuánto gané?

Por ahora el sistema muestra el precio de costo al editar un producto, pero no calcula márgenes automáticamente. La versión Pro va a incluir reportes de ganancias y márgenes. Mientras tanto, podés calcularlo: Precio de venta − Precio de costo = Ganancia bruta.

### 12. ¿Cómo hago una devolución?

Registrá una venta por el monto de la devolución con método de pago "Efectivo" u "Otro", y después manualmente volvé a sumar el stock del producto con el botón **+1** en Productos. En versiones futuras se agregará una función específica para devoluciones.

### 13. ¿Se pueden exportar los informes a Excel?

No directamente desde el sistema. Pero podés copiar los datos de cualquier tabla y pegarlos en Excel (seleccioná con el mouse, Ctrl+C, y Ctrl+V en Excel).

### 14. ¿Qué hago si un empleado se equivoca y cobra mal una venta?

Si la venta ya está registrada, no se puede modificar. Lo que podés hacer es:
1. Si te olvidaste de cobrar un producto: hacé una venta aparte solo con ese producto.
2. Si cobraste de más: registrá una "devolución" como se explica en la pregunta 12.
3. Si te equivocaste en el método de pago: anotalo aparte; el informe te muestra los totales por método pero no podés recategorizar una venta ya hecha.

### 15. ¿Cada cuánto tengo que actualizar el sistema?

Cuando salga una nueva versión, vas a `C:\TUSTOCK`, abrís la terminal y ejecutás `git pull` (si lo instalaste con Git) o descargás el ZIP nuevo. Después ejecutás `scripts\setup.bat` de nuevo. No hace falta hacerlo seguido; solo cuando quieras tener las últimas mejoras.

### 16. ¿La app Android funciona en iPhone?

No. La app es solo para Android. Para iPhone, podés usar cualquier app lectora de códigos de barras (hay cientos gratis) que muestre el número, y después escribís ese número a mano en la PC.

### 17. ¿Puedo usar TUSTOCK en Linux o Mac?

El sistema está pensado para Windows. Sin embargo, si tenés conocimientos técnicos, el servidor (Python) y el frontend (React) funcionan en Linux y Mac. Tendrías que ejecutar los comandos manualmente en vez de usar los `.bat`.

### 18. ¿Qué diferencia hay entre el precio de costo y el precio de venta?

- **Precio de costo**: lo que vos le pagaste al proveedor. Solo vos lo ves. Sirve para saber tu margen de ganancia.
- **Precio de venta**: lo que le cobrás al cliente. Es el que aparece en la pantalla de Ventas.

---

> [!tip]
> **¿Te quedó alguna duda?** Revisá las otras guías de la documentación:
> - [[Instalación y Configuración]] — detalles técnicos de instalación
> - [[Guía de Usuario]] — versión resumida
> - [[Auditorías de Stock]] — guía detallada de auditorías
> - [[App Android - Scanner]] — todo sobre la app del celular
> - [[Backup y Restauración]] — guía de respaldos
>
> Si no encontrás respuesta, reportá el problema en: https://github.com/kamiikasee05/tustock/issues

---

*TUSTOCK — Sistema de gestión de stock para polirrubros. Hecho para comerciantes, no para informáticos.*
