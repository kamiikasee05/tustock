@echo off
title TUSTOCK - Detener
cd /d "%~dp0..\server"

echo ========================================
echo     TUSTOCK - Deteniendo
echo ========================================
echo.

:: Matar por PID si existe el archivo
if exist logs\server.pid (
    set /p PID=<logs\server.pid
    taskkill /PID %PID% /F >nul 2>&1
    timeout /t 2 /nobreak >nul
    if not exist logs\server.pid (
        echo [OK] TUSTOCK detenido.
        timeout /t 3 /nobreak >nul
        exit /b 0
    )
)

:: Si no, matar cualquier proceso python corriendo main.py
echo Buscando procesos...
taskkill /IM pythonw.exe /F >nul 2>&1
taskkill /IM python.exe /F >nul 2>&1

echo [OK] TUSTOCK detenido.
timeout /t 3 /nobreak >nul
