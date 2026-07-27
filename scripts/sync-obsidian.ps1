<#
.SYNOPSIS
    Sincroniza el vault de Obsidian con MEMORY.md
.DESCRIPTION
    Actualiza las fechas en Dashboard.md y copia MEMORY.md al vault de Obsidian.
    Ejecutar después de cada cambio significativo a MEMORY.md.
.EXAMPLE
    .\sync-obsidian.ps1
#>

$ErrorActionPreference = "Stop"
$Root = "E:\TUSTOCK"
$Obsidian = "$Root\obsidian\TU STOCK"

Write-Host "🔄 Sincronizando Obsidian..." -ForegroundColor Cyan

# 1. Actualizar fecha en Dashboard.md
$date = Get-Date -Format "d 'de' MMMM 'de' yyyy"
$dashboard = "$Obsidian\Dashboard.md"
if (Test-Path $dashboard) {
    $content = Get-Content $dashboard -Raw -Encoding UTF8
    $newContent = $content -replace '(## 🎯 Estado al cierre — )(.+)', "`$1$date"
    if ($newContent -ne $content) {
        Set-Content $dashboard $newContent -Encoding UTF8 -NoNewline
        Write-Host "  ✅ Dashboard.md — fecha actualizada: $date" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Dashboard.md — fecha ya al día" -ForegroundColor DarkGray
    }
}

# 2. Copiar MEMORY.md al vault (referencia para agents que lean Obsidian)
$memoryDest = "$Obsidian\01-Producto\MEMORY.md"
$memorySrc = "$Root\MEMORY.md"
if (Test-Path $memorySrc) {
    Copy-Item $memorySrc $memoryDest -Force
    Write-Host "  ✅ MEMORY.md copiado a 01-Producto/" -ForegroundColor Green
}

# 3. Verificar que todas las secciones de Obsidian existen
$expectedFiles = @(
    "Dashboard.md",
    "01-Producto\Planes y Precios.md",
    "01-Producto\MEMORY.md",
    "02-Ventas\Speech.md",
    "02-Ventas\Canales.md",
    "03-Legal\Checklist.md",
    "04-Tecnico\Pendientes DEV.md",
    "04-Tecnico\Arquitectura.md",
    "05-Decisiones\Historial.md",
    "08-Investigacion\TUSTOCK en Tablet.md"
)

$missing = @()
foreach ($file in $expectedFiles) {
    $path = "$Obsidian\$file"
    if (-not (Test-Path $path)) {
        $missing += $file
    }
}

if ($missing.Count -gt 0) {
    Write-Host "  ⚠️  Archivos faltantes:" -ForegroundColor Yellow
    foreach ($m in $missing) {
        Write-Host "    - $m" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✅ Todos los archivos esperados existen" -ForegroundColor Green
}

# 4. Resumen
$files = Get-ChildItem "$Obsidian" -Recurse -Filter "*.md" | Measure-Object
$lines = Get-ChildItem "$Obsidian" -Recurse -Filter "*.md" | Get-Content | Measure-Object -Line
Write-Host ""
Write-Host "📊 Vault: $($files.Count) archivos, $($lines.Lines) líneas" -ForegroundColor Cyan
Write-Host "✅ Sync completado" -ForegroundColor Green

# 5. Notificación
& "$Root\scripts\send-ntfy.ps1" -Title "🔄 TUSTOCK" -Message "Obsidian sincronizado — $($files.Count) archivos" -Priority 3 -Tags "arrows_counterclockwise" 2>$null
