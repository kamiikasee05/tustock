@echo off
title TUSTOCK - Servidor
cd /d "%~dp0..\server"

if not exist logs mkdir logs

echo ========================================
echo     TUSTOCK - Iniciando servidor
echo ========================================
echo.
echo El servidor se inicia en BACKGROUND (sin ventana).
echo.
echo   http://localhost:8090
echo.
echo Para DETENERLO:  stop.bat
echo.

:: Iniciar servidor completamente oculto (pythonw = sin consola)
where pythonw.exe >nul 2>&1
if %errorlevel% equ 0 (
    start "" pythonw.exe main.py
) else (
    start /B "" python.exe main.py >> logs\server.log 2>&1
)

:: Esperar que escriba el PID
timeout /t 4 /nobreak >nul
if exist logs\server.pid (
    set /p PID=<logs\server.pid
    echo [OK] Servidor corriendo (PID: %PID%)
) else (
    echo [ERROR] No se pudo iniciar el servidor.
    echo        Revise logs\server.log
    pause
    exit /b 1
)

echo.
echo El servidor quedo corriendo en background.
echo Para iniciar automaticamente con Windows:
echo   install-startup.bat
echo.
timeout /t 5 /nobreak >nul
