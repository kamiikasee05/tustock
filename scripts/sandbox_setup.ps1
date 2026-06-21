<#
  TUSTOCK Windows Sandbox Setup
  Instala Python 3.9+, Node.js 18+ y dependencias del proyecto
  Se ejecuta automaticamente al abrir sandbox.wsb
#>

$ErrorActionPreference = "Stop"
$projectDir = "C:\Users\WDAGUtilityAccount\Desktop\TUSTOCK"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TUSTOCK - Configurando entorno Sandbox" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Python ---
Write-Host "[1/4] Verificando Python..." -ForegroundColor Yellow
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "  Python no encontrado. Instalando via winget..." -ForegroundColor Gray
    winget install Python.Python.3.12 --accept-package-agreements --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  winget fallo. Descargando instalador..." -ForegroundColor Gray
        $pyInstaller = "$env:TEMP\python-installer.exe"
        Invoke-WebRequest -Uri "https://www.python.org/ftp/python/3.12.9/python-3.12.9-amd64.exe" -OutFile $pyInstaller
        & $pyInstaller /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
        Remove-Item $pyInstaller
    }
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Host "  Python instalado. Cerrando y reabriendo sesion para refrescar PATH..." -ForegroundColor Gray
    # Needed to pick up new PATH entries
    refreshenv -ErrorAction SilentlyContinue
}
python --version
Write-Host ""

# --- Node.js ---
Write-Host "[2/4] Verificando Node.js..." -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "  Node.js no encontrado. Instalando via winget..." -ForegroundColor Gray
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  winget fallo. Descargando instalador..." -ForegroundColor Gray
        $nodeInstaller = "$env:TEMP\node-installer.msi"
        Invoke-WebRequest -Uri "https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi" -OutFile $nodeInstaller
        Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart" -NoNewWindow -Wait
        Remove-Item $nodeInstaller
    }
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    refreshenv -ErrorAction SilentlyContinue
}
node --version
Write-Host ""

# --- Dependencias del proyecto ---
Write-Host "[3/4] Instalando dependencias del proyecto..." -ForegroundColor Yellow

Write-Host "  Python dependencies (server)..." -ForegroundColor Gray
Set-Location "$projectDir\server"
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo pip install" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "  Node dependencies (web)..." -ForegroundColor Gray
Set-Location "$projectDir\web"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo npm install" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "  Compilando frontend..." -ForegroundColor Gray
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo build frontend" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- Iniciar servidor ---
Write-Host ""
Write-Host "[4/4] Iniciando servidor..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Abri http://localhost:8090 en Edge" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Set-Location "$projectDir\server"
python main.py
