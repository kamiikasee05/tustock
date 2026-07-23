@echo off
echo ============================================
echo   Deteniendo TUSTOCK Admin
echo ============================================

taskkill /IM TUSTOCK_ADMIN.exe /F >nul 2>&1
if not errorlevel 1 (
    echo [OK] TUSTOCK_ADMIN detenido.
) else (
    echo [INFO] TUSTOCK_ADMIN no estaba corriendo.
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo [OK] Puerto 5174 liberado (PID %%a).
)

timeout /t 2 /nobreak >nul