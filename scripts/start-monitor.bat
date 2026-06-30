@echo off
cd /d "%~dp0.."
echo Iniciando Monitor TUSTOCK (puerto 8091)...
start /B pythonw monitor\app.py
timeout /t 3 /nobreak >nul
echo Monitor corriendo en http://localhost:8091
echo.
echo Para exponerlo por Internet, necesitas Cloudflare Tunnel.
echo Segui los pasos en la guia de usuario.
