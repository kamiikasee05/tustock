@echo off
cd /d "E:\TUSTOCK_ADMIN"
title TUSTOCK Admin
echo ============================================
echo   TUSTOCK Admin — Panel de Administracion
echo   http://localhost:5174
echo ============================================
echo.

if not exist "dist" (
    echo [INFO] dist/ no encontrado. Compilando...
    call npm run build
    if errorlevel 1 (
        echo ERROR: Build fallido.
        pause
        exit /b 1
    )
    echo.
)

if exist "dist\TUSTOCK_ADMIN\TUSTOCK_ADMIN.exe" (
    echo [OK] Iniciando TUSTOCK_ADMIN.exe...
    start "" "dist\TUSTOCK_ADMIN\TUSTOCK_ADMIN.exe"
) else (
    echo [INFO] TUSTOCK_ADMIN.exe no encontrado. Iniciando con Python...
    python admin_entry.py
)