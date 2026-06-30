@echo off
title TUSTOCK Tunnel
cd /d "%~dp0.."

echo =========================================
echo   TUSTOCK - Monitor por Internet
echo =========================================
echo.
echo Este script expone el Monitor (puerto 8091)
echo a Internet mediante Cloudflare Tunnel.
echo.
echo Requisito: cloudflared.exe
echo.

:: Buscar cloudflared
set CLOUD=cloudflared
where cloudflared >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "%~dp0cloudflared.exe" (
        set "CLOUD=%~dp0cloudflared.exe"
    ) else if exist "cloudflared.exe" (
        set "CLOUD=%cd%\cloudflared.exe"
    ) else (
        echo [ERROR] No se encuentra cloudflared.exe
        echo.
        echo Descargalo desde:
        echo https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
        echo.
        echo Guardalo en la carpeta scripts\ como cloudflared.exe
        echo o instalalo en el PATH.
        echo.
        pause
        exit /b 1
    )
)

:: Verificar que el monitor este corriendo
echo Verificando monitor en localhost:8091...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8091/api/health' -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] El monitor no parece estar corriendo.
    echo Ejecutá primero scripts\start-monitor.bat
    echo.
    choice /C SN /M "Igual querés iniciar el tunnel?"
    if errorlevel 2 exit /b 1
)

echo.
echo Iniciando Cloudflare Tunnel...
echo.
echo LA URL SE VA A MOSTRAR ABAJO, en la linea que dice:
echo   https://XXXX.trycloudflare.com
echo.
echo ABRILA DESDE EL CELULAR para ver el monitor.
echo.
echo IMPORTANTE: Dejá esta ventana abierta mientras
echo quieras tener acceso remoto.
echo.
echo Para cerrar el tunnel, cerra esta ventana
echo o presiona Ctrl+C.
echo.
echo =========================================
echo.

%CLOUD% tunnel --url http://localhost:8091

echo.
echo Tunnel cerrado.
pause
