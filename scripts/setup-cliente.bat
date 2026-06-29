@echo off
title TUSTOCK - Instalacion
cd /d "%~dp0..\server"

echo ========================================
echo     TUSTOCK - Instalacion
echo ========================================
echo.

echo [1/2] Instalando dependencias...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: No se pudo instalar. ^?Tenes Python 3.9+ instalado?
    pause
    exit /b 1
)

echo [2/2] Cargando datos de prueba...
python seed.py

echo.
echo ========================================
echo     Instalacion completada
echo ========================================
echo.
echo Para iniciar TUSTOCK:
echo   1. Ejecute TUSTOCK.bat (o el acceso directo en el escritorio)
echo   2. Se abrira automaticamente http://localhost:8090
echo.
echo Para detener: scripts\stop.bat
echo.
pause
