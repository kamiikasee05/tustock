@echo off
title TUSTOCK - Instalacion
echo ========================================
echo     TUSTOCK - Instalacion rapida
echo ========================================
echo.
echo Instalando dependencias Python...
cd /d "%~dp0..\server"
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: No se pudo instalar. ¿Tenes Python 3.9+ instalado?
    pause
    exit /b 1
)
echo.
echo ========================================
echo     Instalacion completada
echo ========================================
echo.
echo Para iniciar:
echo   1. Ejecute scripts\start.bat
echo   2. Abra http://localhost:8090
pause
