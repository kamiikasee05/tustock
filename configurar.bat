@echo off
title TUSTOCK - Configurar Monitor Cloud
cd /d "%~dp0"

echo ========================================
echo     Configurar Monitor Cloud
echo ========================================
echo.

set CLOUD_URL=https://tustock.up.railway.app

:: Pedir datos del negocio
set /p EMAIL="Email del negocio: "
if "%EMAIL%"=="" (
    echo Email requerido.
    pause
    exit /b 1
)

set /p BIZNAME="Nombre del negocio: "
if "%BIZNAME%"=="" (
    echo Nombre requerido.
    pause
    exit /b 1
)

echo.
echo Creando cuenta en el Monitor Cloud...

:: Crear JSON en archivo temporal
> "%TEMP%\tustock_body.json" echo {"email":"%EMAIL%","name":"%BIZNAME%"}

:: Llamar al endpoint con curl usando @file (evita problemas de quoting en cmd)
curl -s -X POST "%CLOUD_URL%/api/register-from-install" ^
    -H "Content-Type: application/json" ^
    -d @"%TEMP%\tustock_body.json" > "%TEMP%\tustock_register.json"

if %errorlevel% neq 0 (
    echo ERROR: No se pudo conectar al Monitor Cloud.
    echo Verificá tu conexión a internet.
    pause
    exit /b 1
)

:: Verificar respuesta
findstr /C:"\"ok\":true" "%TEMP%\tustock_register.json" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo crear la cuenta.
    type "%TEMP%\tustock_register.json"
    echo.
    pause
    exit /b 1
)

:: Extraer API key y password con PowerShell
for /f "delims=" %%i in ('powershell -Command "$j = Get-Content '%TEMP%\tustock_register.json' | ConvertFrom-Json; $j.api_key"') do set API_KEY=%%i
for /f "delims=" %%i in ('powershell -Command "$j = Get-Content '%TEMP%\tustock_register.json' | ConvertFrom-Json; $j.password"') do set AUTO_PASS=%%i

echo.
echo ========================================
echo     Cuenta configurada
echo ========================================
echo.
echo   Email:       %EMAIL%
echo   API Key:     %API_KEY%
if "%AUTO_PASS%"=="" (
    echo   Contrasena:  (usá la que ya tenías)
) else (
    echo   Contrasena:  %AUTO_PASS%
    echo.
    echo   GUARDA ESTOS DATOS. La contrasena se muestra una sola vez.
)
echo.

:: Guardar configuracion del agente
if not exist "config" mkdir "config"

powershell -Command ^
    "@{api_url='%CLOUD_URL%'; api_key='%API_KEY%'} | ConvertTo-Json | Set-Content 'config\cloud.json'"

if %errorlevel% equ 0 (
    echo   Agente cloud configurado en config\cloud.json
) else (
    echo   ERROR: No se pudo guardar config\cloud.json
)

echo.
echo ========================================
echo     Listo
echo ========================================
echo.

:: Crear .env si no existe
if not exist "server\.env" (
    (
        echo TUSTOCK_TOKEN=tustock-local-token
        echo TUSTOCK_DB=
        echo TUSTOCK_HOST=0.0.0.0
        echo TUSTOCK_PORT=8090
        echo TUSTOCK_CLOUD_URL=https://tustock.up.railway.app
    ) > "server\.env"
    echo   Archivo server\.env creado con valores por defecto.
) else (
    echo   server\.env ya existe, no se sobreescribe.
)

echo.
echo   Para acceder al Monitor Cloud:
echo     URL:    %CLOUD_URL%
echo     Email:  %EMAIL%
echo     Pass:   %AUTO_PASS%
echo.
echo   Reiniciá TUSTOCK para activar el agente cloud.
echo.
pause
