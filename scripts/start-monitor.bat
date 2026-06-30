@echo off
cd /d "%~dp0.."
echo Iniciando Monitor TUSTOCK (puerto 8091)...
start /B pythonw monitor\app.py
timeout /t 3 /nobreak >nul
echo.
echo ============================================
echo   Monitor corriendo en:
echo   http://localhost:8091
echo ============================================
echo.
echo Para verlo desde el celular por Internet:
echo   1. Ejecutá:  scripts\tunnel-monitor.bat
echo   2. Necesitas descargar cloudflared.exe
echo      (solo la primera vez)
echo   3. La URL publica aparece en esa ventana
echo.
echo Para detener el monitor:
echo   Ejecutá:  scripts\stop.bat
