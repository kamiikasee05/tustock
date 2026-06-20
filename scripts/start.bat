@echo off
title TUSTOCK - Servidor
echo ========================================
echo     TUSTOCK - Iniciando servidor
echo ========================================
echo.
echo Abra http://localhost:8090 en el navegador
echo.
echo Para la app Android, configure la URL:
echo http://SU_IP_LOCAL:8090
echo.

cd /d "%~dp0..\server"
python main.py

pause
