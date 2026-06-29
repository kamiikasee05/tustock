@echo off
title TUSTOCK
cd /d "%~dp0..\server"

if not exist logs mkdir logs

:: Ya esta corriendo?
if exist logs\server.pid (
    set /p OLD_PID=<logs\server.pid
    tasklist /FI "PID eq %OLD_PID%" 2>nul | find /I "python" >nul
    if not errorlevel 1 (
        echo TUSTOCK ya esta en ejecucion.
        echo Abriendo navegador...
        start http://localhost:8090
        timeout /t 3 /nobreak >nul
        exit /b 0
    )
)

:: Iniciar servidor oculto
echo Iniciando TUSTOCK...
where pythonw.exe >nul 2>&1
if %errorlevel% equ 0 (
    start "" pythonw.exe main.py
) else (
    start /B "" python.exe main.py >> logs\server.log 2>&1
)

:: Esperar a que este listo
set WAIT=0
:waitloop
timeout /t 1 /nobreak >nul
set /a WAIT+=1
if exist logs\server.pid goto ready
if %WAIT% geq 10 goto fail
goto waitloop

:ready
echo Listo!
timeout /t 1 /nobreak >nul
start http://localhost:8090
exit /b 0

:fail
echo ERROR: No se pudo iniciar TUSTOCK.
echo Revise logs\server.log
pause
exit /b 1
