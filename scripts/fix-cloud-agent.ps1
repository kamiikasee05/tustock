# fix-cloud-agent.ps1
# Configura el agente cloud en una PC existente de TUSTOCK.
# Uso: powershell -ExecutionPolicy Bypass -File scripts\fix-cloud-agent.ps1

$ErrorActionPreference = "Stop"
$CLOUD_URL = "https://tustock.up.railway.app"

Write-Host ""
Write-Host "=== Configurar Monitor Cloud ===" -ForegroundColor Cyan
Write-Host ""

$email = Read-Host "Email del negocio"
$name = Read-Host "Nombre del negocio"

if (-not $email -or -not $name) {
    Write-Host "Email y nombre son requeridos." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creando cuenta en el Monitor Cloud..." -ForegroundColor Yellow

$body = @{ email = $email; name = $name } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$CLOUD_URL/api/register-from-install" `
        -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop

    if ($response.ok) {
        Write-Host ""
        Write-Host "Cuenta creada" -ForegroundColor Green
        Write-Host "  Email:       $($response.email)"
        Write-Host "  API Key:     $($response.api_key)"
        Write-Host "  Contrasena:  $($response.password)"
        Write-Host ""

        $configDir = Join-Path $PSScriptRoot "..\config"
        if (-not (Test-Path $configDir)) {
            New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        }

        $config = @{ api_url = $CLOUD_URL; api_key = $response.api_key } | ConvertTo-Json
        $configPath = Join-Path $configDir "cloud.json"
        Set-Content -Path $configPath -Value $config -Encoding UTF8

        Write-Host "Agente cloud configurado en config\cloud.json" -ForegroundColor Green
        Write-Host ""
        Write-Host "Para acceder al Monitor Cloud:" -ForegroundColor Cyan
        Write-Host "  URL:         $CLOUD_URL"
        Write-Host "  Email:       $($response.email)"
        Write-Host "  Contrasena:  $($response.password)"
        Write-Host ""
        Write-Host "Reinicia TUSTOCK para activar el agente." -ForegroundColor Yellow
    }
} catch {
    $msg = $_.Exception.Message
    if ($msg -match "409") {
        Write-Host ""
        Write-Host "Este email ya esta registrado en el Monitor Cloud." -ForegroundColor Yellow
        Write-Host "Si ya tenes cuenta, configura manualmente config\cloud.json:" -ForegroundColor Yellow
        Write-Host '  {"api_url":"https://tustock.up.railway.app","api_key":"TU-API-KEY"}' -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "Error: $msg" -ForegroundColor Red
        Write-Host "Verifica tu conexion a internet." -ForegroundColor Yellow
    }
}
