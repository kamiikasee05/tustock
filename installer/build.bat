@echo off
REM TUSTOCK Build Script — PyInstaller PoC
REM Ejecutar desde: E:\TUSTOCK\installer\

echo ============================================
echo  TUSTOCK — PyInstaller Build
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando pyinstaller...
pyinstaller --version
if errorlevel 1 (
    echo ERROR: PyInstaller no esta instalado.
    echo Ejecuta: pip install pyinstaller
    pause
    exit /b 1
)

echo.
echo [2/3] Verificando server/.env...
if not exist "..\server\.env" (
    echo ADVERTENCIA: server/.env no existe.
    if exist "..\server\.env.example" (
        echo Creando .env desde .env.example...
        copy "..\server\.env.example" "..\server\.env" >nul
    ) else (
        echo ERROR: No hay .env ni .env.example. Crea server/.env manualmente.
        pause
        exit /b 1
    )
)

echo.
echo [3/3] Ejecutando PyInstaller...
pyinstaller tustock.spec --noconfirm
if errorlevel 1 (
    echo.
    echo ERROR: Build fallido. Revisa el log arriba.
    pause
    exit /b 1
)

echo.
echo ============================================
echo  BUILD COMPLETADO
echo  Output: dist\tustock\
echo ============================================
echo.
echo Para probar:
echo   cd dist\tustock
echo   tustock.exe
echo.
pause
