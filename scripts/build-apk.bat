@echo off
setlocal enabledelayedexpansion
title TUSTOCK - Compilador APK
echo ========================================
echo     TUSTOCK - Compilar APK Android
echo ========================================
echo.

:: Verificar Java
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java no encontrado.
    echo Se necesita JDK 17 o superior.
    echo Descargar de: https://adoptium.net/download/
    echo.
    echo Alternativa: el APK se compila automaticamente en GitHub Actions.
    echo Descargalo de: https://github.com/kamiikasee05/tustock/releases
    pause
    exit /b 1
)

:: Verificar Android SDK
if not defined ANDROID_HOME (
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    ) else (
        echo [ERROR] Android SDK no encontrado.
        echo Opciones:
        echo   1. Instala Android Studio (recomendado)
        echo   2. Instala solo cmdline-tools desde:
        echo      https://developer.android.com/studio#command-line-tools-only
        echo   3. Baja el APK pre-compilado de GitHub Releases:
        echo      https://github.com/kamiikasee05/tustock/releases
        pause
        exit /b 1
    )
)

echo Java: detectado
echo Android SDK: !ANDROID_HOME!

:: Descargar gradle-wrapper.jar si no existe
set "WRAPPER_JAR=%~dp0..\android\gradle\wrapper\gradle-wrapper.jar"
if not exist "%WRAPPER_JAR%" (
    echo.
    echo Descargando gradle-wrapper.jar...
    powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/gradle/gradle/v8.4.0/gradle/wrapper/gradle-wrapper.jar' -OutFile '%WRAPPER_JAR%'"
    if !errorlevel! neq 0 (
        echo [ERROR] No se pudo descargar gradle-wrapper.jar.
        echo Necesitas Android Studio para generar el wrapper.
        pause
        exit /b 1
    )
)

:: Crear local.properties con la ruta del SDK
echo sdk.dir=!ANDROID_HOME!>"%~dp0..\android\local.properties"

:: Compilar
echo.
echo Compilando APK...
cd /d "%~dp0..\android"
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Fallo la compilacion.
    pause
    exit /b 1
)

:: Copiar APK a carpeta de salida
set "APK_SRC=%~dp0..\android\app\build\outputs\apk\debug\app-debug.apk"
set "APK_DST=%~dp0..\tustock-scanner.apk"
if exist "%APK_SRC%" (
    copy /y "%APK_SRC%" "%APK_DST%"
    echo.
    echo ========================================
    echo APK generado: tustock-scanner.apk
    echo Copialo al celular e instalalo.
    echo ========================================
) else (
    echo [ERROR] No se encontro el APK compilado.
)

pause
