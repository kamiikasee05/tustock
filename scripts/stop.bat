@echo off
title TUSTOCK - Deteniendo servidor
cd /d "%~dp0..\server"

echo ========================================
echo     TUSTOCK - Deteniendo servidor
echo ========================================
echo.

set PID_FILE=logs\server.pid

if not exist %PID_FILE% (
    echo El servidor no parece estar corriendo.
    echo (no se encuentra %PID_FILE%)
    goto :force
)

set /p PID=<%PID_FILE%
echo Deteniendo servidor (PID: %PID%) ...
taskkill /PID %PID% /F >nul 2>&1

timeout /t 2 /nobreak >nul

if not exist %PID_FILE% (
    echo [OK] Servidor detenido correctamente.
    exit /b 0
)

:force
echo.
echo Buscando procesos python con main.py...
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /I "python.exe" >nul
if %errorlevel% equ 0 (
    echo Deteniendo procesos python.exe ...
    taskkill /IM python.exe /F >nul 2>&1
)
tasklist /FI "IMAGENAME eq pythonw.exe" 2>nul | find /I "pythonw.exe" >nul
if %errorlevel% equ 0 (
    taskkill /IM pythonw.exe /F >nul 2>&1
)

echo [OK] Procesos detenidos.
timeout /t 3 /nobreak >nul
