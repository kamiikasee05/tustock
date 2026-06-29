@echo off
title TUSTOCK - Instalar inicio automatico
cd /d "%~dp0"

echo ========================================
echo  TUSTOCK - Inicio automatico con Windows
echo ========================================
echo.
echo Se creara una tarea en el Programador de Tareas
echo para iniciar TUSTOCK cuando inicie sesion.
echo.

:: Ruta completa al start.bat
set START_SCRIPT=%~dp0start.bat

:: Verificar que existe
if not exist "%START_SCRIPT%" (
    echo [ERROR] No se encuentra %START_SCRIPT%
    pause
    exit /b 1
)

:: Crear tarea programada (se ejecuta al iniciar sesion de cualquier usuario)
schtasks /CREATE /SC ONLOGON /TN "TUSTOCK Server" /TR "'%START_SCRIPT%'" /F /RL HIGHEST 2>&1

if %errorlevel% equ 0 (
    echo.
    echo [OK] Tarea creada: "TUSTOCK Server"
    echo      Se ejecutara automaticamente al iniciar sesion.
    echo.
    echo Para desinstalar:  uninstall-startup.bat
) else (
    echo [ERROR] No se pudo crear la tarea.
    echo        Ejecute como Administrador (clic derecho ^> Ejecutar como administrador).
    pause
    exit /b 1
)

timeout /t 5 /nobreak >nul
