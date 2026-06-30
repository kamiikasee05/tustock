@echo off
title TUSTOCK
cd /d "%~dp0"

:: Si es primera vez o se pide explicitamente, correr el asistente
if not exist "config\.setup_done" goto launcher

:: Si ya esta configurado, preguntar si quiere menu o inicio rapido
:menu
cls
echo ========================================
echo     TUSTOCK - Sistema de Gestion
echo ========================================
echo.
echo  1. Iniciar TUSTOCK (rapido)
echo  2. Asistente de configuracion
echo  3. Crear acceso directo escritorio
echo  4. Iniciar Monitor Premium
echo  5. Tunnel (exponer monitor a Internet)
echo  6. Detener TUSTOCK
echo  7. Salir
echo.
choice /C 1234567 /N /M "Elegi una opcion: "
if errorlevel 7 exit /b
if errorlevel 6 goto stop
if errorlevel 5 goto tunnel
if errorlevel 4 goto monitor
if errorlevel 3 goto shortcut
if errorlevel 2 goto launcher
if errorlevel 1 goto quick
goto menu

:quick
python scripts\launcher.py --quick
exit /b

:launcher
python scripts\launcher.py
exit /b

:shortcut
call scripts\Crear Acceso Directo.bat
exit /b

:monitor
call scripts\start-monitor.bat
exit /b

:tunnel
call scripts\tunnel-monitor.bat
exit /b

:stop
call scripts\stop.bat
exit /b
