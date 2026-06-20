---
tags:
  - tustock
  - android
  - scanner
---

# App Android - Scanner

La app TUSTOCK Scanner convierte tu celular Android en un lector de códigos QR y de barras conectado al sistema.

## Instalación

### Compilar desde Android Studio

1. Abrí Android Studio
2. Seleccioná **Open** y navegá hasta la carpeta `android/` del proyecto
3. Esperá a que Gradle sincronice (la primera vez descarga dependencias, puede tardar)
4. Conectá el celular por USB con depuración USB activada
5. Click en **Run** (▶️)

### Generar APK para instalar manualmente

1. En Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. El APK se genera en `android/app/build/outputs/apk/debug/`
3. Copialo al celular e instálalo

> [!info]
> En el celular tenés que habilitar **Orígenes desconocidos** en Ajustes > Seguridad para instalar APKs fuera de Play Store.

---

## Configuración inicial

1. Abrí la app **TUSTOCK Scanner** en el celular
2. En el campo **URL del servidor**, ingresá la IP de la PC donde corre TUSTOCK:
   ```
   http://192.168.1.100:8090
   ```
3. Click en **Conectar**
4. Si la conexión es exitosa, el indicador se pone verde y se habilita el botón **ESCANEAR**

> [!tip]
> Para saber la IP de tu PC, abrí una terminal en la PC y ejecutá `ipconfig`. Buscá la dirección IPv4 del adaptador WiFi o Ethernet.

---

## Escanear productos

### Modo consulta

1. Click en **ESCANEAR**
2. Apuntá la cámara al código QR o de barras
3. El sistema detecta automáticamente y muestra:
   - Nombre del producto
   - Código
   - Precio de venta
   - Stock actual

Si el stock está bajo (≤ 5), el número se muestra en naranja. Si está agotado (0), en rojo.

### Producto no encontrado

Si el código no existe en el sistema, la app te ofrece **Registrar**:

1. Click en **Registrar**
2. Completá:
   - **Código**: ya viene completado con lo escaneado
   - **Nombre**: nombre del producto
   - **Precio de venta**: el precio al público
3. Click en **Registrar producto**

El producto se crea en el servidor y queda disponible para ventas.

---

## Tipos de códigos que lee

La app usa ML Kit de Google y reconoce todos estos formatos:

| Formato | Ejemplos de uso |
|---------|----------------|
| **EAN-8 / EAN-13** | Productos de supermercado, alimentación |
| **UPC-A / UPC-E** | Productos importados, electrónica |
| **Code 39 / Code 128** | Logística, depósitos, códigos internos |
| **QR Code** | Productos con QR, promociones |
| **Data Matrix** | Electrónica, componentes pequeños |
| **PDF417** | Encomiendas, paquetería |
| **Codabar / ITF** | Uso industrial |
| **Aztec** | Transporte, tickets |

---

## Solución de problemas

### "No se puede conectar al servidor"

1. Verificá que el servidor esté corriendo en la PC
2. Verificá que `TUSTOCK_HOST=0.0.0.0` en la configuración
3. Verificá que el celular y la PC estén en la misma red WiFi
4. Verificá que el firewall de Windows permita el puerto 8090
5. Probá la URL en el navegador del celular: `http://IP_DE_LA_PC:8090/api/health`

### La cámara no enfoca bien

- Alejá o acercá el celular hasta que el código esté nítido
- Asegurate de tener buena iluminación
- Para códigos muy chicos (Data Matrix), acercá bien la cámara

### Escanea códigos que no corresponden

La app procesa cualquier código que vea. Mantené la cámara apuntando solo al código deseado.

---

## Uso en auditorías

La app es ideal para contar stock durante una auditoría:

1. Iniciá una [[Auditorías de Stock|auditoría]] desde la PC
2. Desde el celular, escaneás los productos uno por uno
3. Cada escaneo suma +1 al conteo de ese producto en la auditoría

Para activar el modo auditoría, usá el endpoint correspondiente (próximamente integrado en la UI de la app).
