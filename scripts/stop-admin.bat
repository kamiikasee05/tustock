@echo off
echo ============================================
echo   Deteniendo Admin TUSTOCK
echo ============================================

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo [OK] Admin detenido (PID %%a)
)

if not errorlevel 1 echo [OK] Admin no estaba corriendo.

timeout /t 2 /nobreak >nul