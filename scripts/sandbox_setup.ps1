<#
  TUSTOCK Windows Sandbox Setup
  Instala Python, Node.js y dependencias. Inicia el servidor.
#>
$ErrorActionPreference = "Continue"
$projectDir = "C:\Users\WDAGUtilityAccount\Desktop\TUSTOCK"

function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TUSTOCK - Entorno Sandbox" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# --- Python ---
Write-Host "[1/4] Python..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) { $pythonCmd = Get-Command "$env:LOCALAPPDATA\Programs\Python\Python3*\python.exe" -ErrorAction SilentlyContinue }
if (-not $pythonCmd) { $pythonCmd = Get-Command "C:\Program Files\Python3*\python.exe" -ErrorAction SilentlyContinue }

if (-not $pythonCmd) {
    Write-Host "  Instalando Python 3.12..." -ForegroundColor Gray
    winget install Python.Python.3.12 --accept-package-agreements --silent
    Start-Sleep -Seconds 15
    Refresh-Path
    $pythonExe = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
    if (-not (Test-Path $pythonExe)) {
        $pythonExe = "C:\Program Files\Python312\python.exe"
    }
} else {
    $pythonExe = $pythonCmd.Source
}
Write-Host "  Python: $pythonExe" -ForegroundColor Green
& $pythonExe --version

# --- Node.js ---
Write-Host "[2/4] Node.js..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) { $nodeCmd = Get-Command "C:\Program Files\nodejs\node.exe" -ErrorAction SilentlyContinue }

if (-not $nodeCmd) {
    Write-Host "  Instalando Node.js LTS..." -ForegroundColor Gray
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --silent
    Start-Sleep -Seconds 15
    Refresh-Path
    $nodeExe = "C:\Program Files\nodejs\node.exe"
} else {
    $nodeExe = $nodeCmd.Source
}
Write-Host "  Node: $nodeExe" -ForegroundColor Green
& $nodeExe --version

$npmExe = "C:\Program Files\nodejs\npm.cmd"
if (-not (Test-Path $npmExe)) {
    $npmExe = (Join-Path (Split-Path $nodeExe -Parent) "npm.cmd")
}

# --- Dependencias del proyecto ---
Write-Host "[3/4] Instalando dependencias..." -ForegroundColor Yellow

Write-Host "  pip install..." -ForegroundColor Gray
Set-Location "$projectDir\server"
& $pythonExe -m pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: pip install fallo. Reintentando..." -ForegroundColor Red
    & $pythonExe -m pip install -r requirements.txt
}

Write-Host "  npm install + build..." -ForegroundColor Gray
Set-Location "$projectDir\web"
& $npmExe install
if ($LASTEXITCODE -eq 0) {
    & $npmExe run build
}

# --- Iniciar ---
Write-Host ""
Write-Host "[4/4] Iniciando TUSTOCK..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Abri http://localhost:8090" -ForegroundColor Green
Write-Host "  Token: tustock-local-token" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Set-Location "$projectDir\server"
& $pythonExe main.py

Read-Host "Presiona Enter para cerrar"
