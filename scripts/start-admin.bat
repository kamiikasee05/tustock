@echo off
cd /d "E:\TUSTOCK_ADMIN"
title Admin TUSTOCK
echo ============================================
echo   Admin TUSTOCK — Panel de Administracion
echo   http://localhost:5174
echo ============================================
echo.
echo Requisito: npm install (solo la primera vez)
echo.
call npm run dev
pause