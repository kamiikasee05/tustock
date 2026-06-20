---
tags:
  - tustock
  - backup
  - seguridad
---

# Backup y Restauración

Toda la información del negocio (productos, ventas, auditorías, informes) se guarda en un solo archivo: `tustock.db`. Hacer backup es copiar ese archivo a un lugar seguro.

> [!danger]
> **Hacé backups regularmente.** Si el archivo `tustock.db` se pierde o corrompe, perdés todo el historial. No depende de internet ni de la nube, así que la responsabilidad es tuya.

## Crear un backup

```powershell
python scripts\backup.py
```

Esto:
1. Copia `tustock.db` a la carpeta `backups/` con fecha y hora en el nombre
2. Conserva los últimos 30 backups automáticamente
3. Borra los más viejos para no llenar el disco

### Backup manual

También podés copiar el archivo a mano:

```powershell
copy tustock.db D:\Backups\tustock_%date:/=-%.db
```

---

## Restaurar un backup

```powershell
python scripts\restore.py
```

El script:
1. Muestra los backups disponibles con fecha y tamaño
2. Te pide que elijas cuál restaurar
3. Pide confirmación (escribir `si`)
4. Antes de restaurar, hace un backup de seguridad de la base actual (por si te arrepentís)
5. Sobreescribe la base de datos con el backup elegido

> [!warning]
> Al restaurar un backup, **perdés todos los datos posteriores** a la fecha del backup. El script guarda la base actual como respaldo por las dudas.

---

## Frecuencia recomendada

| Frecuencia | Qué backup hacer |
|------------|-----------------|
| **Diario** | Al cerrar el día, después de generar el informe |
| **Semanal** | Copia a un pendrive o disco externo |
| **Mensual** | Copia a otro dispositivo (otra PC, disco externo guardado en otro lugar) |

---

## Versión Pro - Backup en la nube

En la versión Pro, el backup se hará automáticamente a la nube sin que tengas que preocuparte. Mientras tanto, sé disciplinado con los backups manuales.

---

## ¿Cada cuánto se guarda la base de datos?

El sistema guarda los datos **instantáneamente** en cada operación:

- Al registrar una venta
- Al ajustar stock
- Al crear o modificar un producto
- Al completar una auditoría
- Al generar un informe

No hay riesgo de perder datos por un corte de luz, salvo lo que estuvieras escribiendo en ese exacto momento (milisegundos).

La base usa **modo WAL** (Write-Ahead Logging), que es más seguro y rápido que el modo tradicional de SQLite.
