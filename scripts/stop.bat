@echo off
title TUSTOCK - Detener
cd /d "%~dp0..\server"

echo ========================================
echo     TUSTOCK - Deteniendo
echo ========================================
echo.

:: Matar servidor principal
if exist logs\server.pid (
    set /p PID=<logs\server.pid
    taskkill /PID %PID% /F >nul 2>&1
    if not exist logs\server.pid (
        echo [OK] Servidor detenido.
    )
)

:: Matar monitor si existe
if exist logs\monitor.pid (
    set /p PID=<logs\monitor.pid
    taskkill /PID %PID% /F >nul 2>&1
    if not exist logs\monitor.pid (
        echo [OK] Monitor detenido.
    )
)

:: Force kill por si queda algun proceso colgado
taskkill /IM pythonw.exe /F >nul 2>&1
taskkill /IM python.exe /F >nul 2>&1

echo [OK] TUSTOCK detenido.
timeout /t 3 /nobreak >nul
