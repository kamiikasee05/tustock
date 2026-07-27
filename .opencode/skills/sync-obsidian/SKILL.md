---
name: sync-obsidian
description: Synchronize the Obsidian vault with MEMORY.md. Use when the user asks to sync Obsidian, update the vault, or when a significant change has been made to MEMORY.md that should be reflected in Obsidian.
---

# Sync Obsidian Vault

Keep `obsidian/TU STOCK/` in sync with `MEMORY.md`. Obsidian is the visual dashboard for the human; MEMORY.md is the source of truth for agents.

## Sync Rules

| Obsidian File | Source | When to Update |
|---------------|--------|----------------|
| `Dashboard.md` | MEMORY.md §6 (priorities) + §3 (built) | After feature completions or priority changes |
| `01-Producto/MEMORY.md` | Copy of MEMORY.md | After any MEMORY.md update |
| `01-Producto/Planes y Precios.md` | MEMORY.md §2 | After price changes |
| `04-Tecnico/Pendientes DEV.md` | MEMORY.md §6 + §11 | After DEV completes a task |
| `05-Decisiones/Historial.md` | MEMORY.md §12 | After any decision |
| `08-Investigacion/*.md` | New research topics | When new research is added |

## Quick Sync Script

Run this PowerShell script to update key Obsidian files from MEMORY.md:

```powershell
# Update "Última actualización" in Dashboard.md
$date = Get-Date -Format "d 'de' MMMM 'de' yyyy"
$content = Get-Content "E:\TUSTOCK\obsidian\TU STOCK\Dashboard.md" -Raw
$content = $content -replace '## 🎯 Estado al cierre — .*', "## 🎯 Estado al cierre — $date"
Set-Content "E:\TUSTOCK\obsidian\TU STOCK\Dashboard.md" $content
```

## Manual Sync Steps

When a significant change happens:

1. **New feature completed:**
   - Add to `04-Tecnico/Pendientes DEV.md` under "Completado recientemente"
   - Update `Dashboard.md` software list
   - Add to `05-Decisiones/Historial.md`

2. **Decision made:**
   - Add to `05-Decisiones/Historial.md`

3. **Priority changed:**
   - Update `Dashboard.md` pendientes table

4. **New research topic:**
   - Create file in `08-Investigacion/`
   - Add link in `Dashboard.md` notes section

## Notification

After sync:
```powershell
& "E:\TUSTOCK\scripts\send-ntfy.ps1" -Title "🔄 TUSTOCK" -Message "Obsidian sincronizado" -Priority 3 -Tags "arrows_counterclockwise"
```
