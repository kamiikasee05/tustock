@echo off
title TUSTOCK - Inicio automatico
cd /d "%~dp0"

echo ========================================
echo  TUSTOCK - Inicio automatico con Windows
echo ========================================
echo.
echo Esto hace que TUSTOCK arranque solo al
echo encender la computadora e iniciar sesion.
echo.

schtasks /CREATE /SC ONLOGON /TN "TUSTOCK" /TR "'%CD%\..\TUSTOCK.bat'" /F /RL HIGHEST 2>&1

if %errorlevel% equ 0 (
    echo [OK] Instalado.
    echo TUSTOCK arrancara solo al iniciar sesion.
    echo.
    echo Para quitarlo:  quitar-auto-inicio.bat
) else (
    echo [ERROR] Ejecute como Administrador
    echo        (clic derecho ^> Ejecutar como administrador).
    pause
    exit /b 1
)

timeout /t 5 /nobreak >nul
