@echo off
echo ========================================
echo     TUSTOCK - Instalacion del sistema
echo ========================================
echo.

echo [1/3] Instalando dependencias Python...
cd /d "%~dp0..\server"
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias Python.
    echo Asegurese de tener Python 3.9+ instalado.
    pause
    exit /b 1
)

echo [2/3] Instalando dependencias web...
cd /d "%~dp0..\web"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias web.
    echo Asegurese de tener Node.js 18+ instalado.
    pause
    exit /b 1
)

echo [3/3] Compilando frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: No se pudo compilar el frontend.
    pause
    exit /b 1
)

echo.
echo ========================================
echo     Instalacion completada
echo ========================================
echo.
echo Ejecute 'start.bat' para iniciar el servidor.
echo Luego abra http://localhost:8090 en el navegador.
pause
