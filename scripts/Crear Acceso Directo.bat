@echo off
title TUSTOCK - Acceso directo
cd /d "%~dp0"

set TARGET=%CD%\..\TUSTOCK.bat
set ICON=%CD%\..\server\favicon.ico
set SHORTCUT=%USERPROFILE%\Desktop\TUSTOCK.lnk

if not exist "%TARGET%" (
    echo ERROR: No se encuentra %TARGET%
    pause
    exit /b 1
)

:: Crear acceso directo con PowerShell
powershell -Command ^
    $ws = New-Object -ComObject WScript.Shell; ^
    $s = $ws.CreateShortcut('%SHORTCUT%'); ^
    $s.TargetPath = '%TARGET%'; ^
    $s.WorkingDirectory = '%CD%\..'; ^
    $s.Description = 'TUSTOCK - Sistema de Gestion'; ^
    if (Test-Path '%ICON%') { $s.IconLocation = '%ICON%' }; ^
    $s.Save()

if exist "%SHORTCUT%" (
    echo ACCESO DIRECTO CREADO:
    echo   %SHORTCUT%
    echo.
    echo Haga doble clic en "TUSTOCK" en el escritorio
    echo para iniciar el sistema.
) else (
    echo ERROR: No se pudo crear el acceso directo.
)

pause
