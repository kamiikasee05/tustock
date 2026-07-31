@echo off
REM Compila APKs Release firmados con keystore de TUSTOCK
REM REQUIERE: Android SDK + JDK 17 en PATH

echo ========================================
echo  TUSTOCK - Build Release APKs
echo ========================================
echo.

setlocal

REM Verificar keystore
if not exist "app\tustock-release.jks" (
    echo [ERROR] No se encuentra app\tustock-release.jks
    echo Ejecuta primero: keytool -genkey ...
    exit /b 1
)

REM Verificar keystore.properties
if not exist keystore.properties (
    echo [ERROR] No se encuentra keystore.properties
    echo Crea el archivo con:
    echo   storeFile=app/tustock-release.jks
    echo   storePassword=TU_PASSWORD
    echo   keyAlias=tustock-release
    echo   keyPassword=TU_PASSWORD
    exit /b 1
)

echo [1/2] Compilando APK Release POS...
call .\gradlew.bat assemblePosRelease
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Fallo la compilacion de POS
    exit /b 1
)

echo [2/2] Compilando APK Release Stock...
call .\gradlew.bat assembleStockRelease
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Fallo la compilacion de Stock
    exit /b 1
)

echo.
echo ======== BUILD EXITOSO ========
echo.
echo APKs generados:
echo   app\build\outputs\apk\pos\release\app-pos-release.apk
echo   app\build\outputs\apk\stock\release\app-stock-release.apk
echo.
echo Copialos a USB_TUSTOCK\TUSTOCK\ y a entregar!
echo.
pause
