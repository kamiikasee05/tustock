@echo off
title TUSTOCK - Desinstalar inicio automatico
cd /d "%~dp0"

echo ========================================
echo  TUSTOCK - Quitar inicio automatico
echo ========================================
echo.
echo Eliminando tarea "TUSTOCK Server" del Programador...
schtasks /DELETE /TN "TUSTOCK Server" /F 2>&1

if %errorlevel% equ 0 (
    echo [OK] Tarea eliminada.
) else (
    echo [OK] No habia tarea instalada.
)

timeout /t 3 /nobreak >nul
