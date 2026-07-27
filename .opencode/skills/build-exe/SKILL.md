---
name: build-exe
description: Build the TUSTOCK executable with PyInstaller. Use when the user asks to build, compile, or package the exe, or when delivering an updated version to a client.
---

# Build TUSTOCK EXE

Build the TUSTOCK Windows executable using PyInstaller. This bundles the Python backend, React frontend, and all dependencies into a single distributable folder.

## Prerequisites

- Python 3.9+ installed
- Node.js installed
- PyInstaller installed (`pip install pyinstaller`)
- All Python dependencies installed (`pip install -r server/requirements.txt`)

## Build Steps

### 1. Rebuild Frontend (generates fresh JS/CSS)

```powershell
cd E:\TUSTOCK\web
npm run build
```

Verify `web/dist/` was created and `index.html` references the correct JS hash.

### 2. Verify Local Fonts Exist

```powershell
Test-Path "E:\TUSTOCK\web\public\assets\fonts"
```

If missing, fonts won't load offline. Must have `material-icons`, `inter`, `geist-mono`.

### 3. Build Executable

```powershell
cd E:\TUSTOCK
pyinstaller --clean --noconfirm tustock.spec
```

### 4. Copy Frontend to Dist

```powershell
$dist = "E:\TUSTOCK\installer\dist\TUSTOCK\_internal\web\dist"
Copy-Item -Recurse -Force "E:\TUSTOCK\web\dist\*" $dist
```

### 5. Clean Old JS Hashes

Check if `index.html` in dist points to the current JS hash. Remove any old JS files with different hashes.

```powershell
$html = Get-Content "$dist\index.html" -Raw
$match = [regex]::Match($html, 'index-[A-Za-z0-9_]+\.js')
$currentHash = $match.Value -replace 'index-','' -replace '\.js',''
Get-ChildItem "$dist\index-*.js" | Where-Object { $_.Name -notmatch $currentHash } | Remove-Item -Force
```

### 6. Verify Build

```powershell
$exe = "E:\TUSTOCK\installer\dist\TUSTOCK\TUSTOCK.exe"
$size = [math]::Round((Get-Item $exe).Length / 1MB, 2)
Write-Output "EXE: $size MB"
```

Expected: ~10-15 MB. If much larger, check for accidental large file inclusion.

### 7. Send Notification

```powershell
& "E:\TUSTOCK\scripts\send-ntfy.ps1" -Title "✅ TUSTOCK DEV" -Message "Build exe completado — $size MB" -Priority 4 -Tags "white_check_mark"
```

## Common Issues

| Issue | Fix |
|-------|-----|
| Old JS served after rebuild | Step 5 — clean old hashes |
| Fonts missing offline | Verify `web/public/assets/fonts/` exists before build |
| EXE crashes on startup | Check `server/.env` exists with `TUSTOCK_LOCAL_TOKEN=tustock-local-token` |
| ModuleNotFoundError in exe | Verify `tustock.spec` includes all needed packages |
