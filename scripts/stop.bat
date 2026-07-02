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
    del logs\server.pid >nul 2>&1
    echo [OK] Servidor detenido.
)

:: Matar monitor si existe
if exist logs\monitor.pid (
    set /p PID=<logs\monitor.pid
    taskkill /PID %PID% /F >nul 2>&1
    del logs\monitor.pid >nul 2>&1
    echo [OK] Monitor detenido.
)

:: Matar cloud agent si existe
if exist logs\cloud_agent.pid (
    set /p PID=<logs\cloud_agent.pid
    taskkill /PID %PID% /F >nul 2>&1
    del logs\cloud_agent.pid >nul 2>&1
)

:: Force kill por si queda algun proceso colgado
taskkill /IM pythonw.exe /F >nul 2>&1
taskkill /IM python.exe /F >nul 2>&1

echo [OK] TUSTOCK detenido.
timeout /t 3 /nobreak >nul
