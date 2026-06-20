@echo off
echo ========================================
echo     TUSTOCK - Modo desarrollo
echo ========================================
echo.
echo Iniciando servidor Python en :8090
echo Iniciando frontend React en :3000 (con proxy a :8090)
echo.

start "TUSTOCK-Server" cmd /c "cd /d %~dp0..\server && python main.py"
start "TUSTOCK-Web" cmd /c "cd /d %~dp0..\web && npm run dev"

echo Servidores iniciados.
echo Frontend dev: http://localhost:3000
echo API: http://localhost:8090
echo.
pause
