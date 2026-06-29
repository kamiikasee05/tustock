# Guía de Instalación — TUSTOCK

## Requisito único

- **Python 3.9 o superior** (descargar de [python.org](https://python.org))

## Instalación (1 vez)

```
1. Abrir terminal en la carpeta TUSTOCK
2. cd server
3. pip install -r requirements.txt
```

## Iniciar el sistema (todos los días)

```
1. Abrir terminal en TUSTOCK\server
2. python main.py
3. Abrir navegador en http://localhost:8090
```

## Pantalla de inicio

Al ejecutar `python main.py` vas a ver:

```
TUSTOCK corriendo en http://0.0.0.0:8090
```

Eso significa que ya está funcionando. Abrí cualquier navegador (Chrome, Edge) en `http://localhost:8090`.

## Conexión desde Android

1. Averiguar la IP de la PC:
   - Abrir `cmd` y escribir `ipconfig`
   - Buscar "Dirección IPv4" (ej: `192.168.1.50`)
2. En la app Android, configurar la URL: `http://192.168.1.50:8090`
3. Asegurar que el celular esté en la misma red WiFi

## Estructura de archivos

```
TUSTOCK/
  server/          ← Backend (Python)
    main.py        ← Ejecutar para iniciar
    tustock.db     ← Base de datos (se crea sola)
  web/dist/        ← Frontend ya compilado
  android/         ← App Android (solo si se quiere compilar)
  scripts/
    backup.py      ← Backup manual
    restore.py     ← Restaurar backup
```

## Backup

```bash
python scripts\backup.py     →  Crea backup en backups/
python scripts\restore.py    →  Restaura un backup
```

## Solución de problemas

| Problema | Solución |
|----------|----------|
| "python no se reconoce" | Instalar Python y marcar "Add to PATH" |
| Puerto 8090 ocupado | `set TUSTOCK_PORT=8091` y luego `python main.py` |
| No carga el navegador | Verificar que el servidor muestre "TUSTOCK corriendo" |
| App Android no conecta | Ping a la IP de la PC desde el celular |
| Se borró la DB | Restaurar backup con `restore.py` |
