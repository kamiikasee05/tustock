---
name: post-install
description: Checklist and common fixes after installing TUSTOCK on a client's PC. Use when the user mentions installation, delivery, USB, client setup, or post-install bugs.
---

# Post-Install Checklist

Run this checklist after installing TUSTOCK on a client's computer. Each item comes from a real bug found during the 2 installations.

## Pre-Delivery (on YOUR PC)

| # | Step | Command/Check | Done |
|---|------|---------------|:----:|
| 1 | Rebuild exe | `build-exe` skill | ⬜ |
| 2 | Rebuild frontend | `cd web && npm run build` | ⬜ |
| 3 | Fonts in `web/public/assets/fonts/` | `Test-Path` | ⬜ |
| 4 | `index.html` hash matches JS | Regex check | ⬜ |
| 5 | `configurar.bat` uses `tustock-local-token` | grep token in file | ⬜ |
| 6 | `.env` sanitized (no `TUSTOCK_ADMIN_TOKEN`) | grep admin token | ⬜ |
| 7 | Sync key to cloud | `POST /api/licenses/sync` | ⬜ |
| 8 | APKs compiled (Stock + POS) | Check `android/` build | ⬜ |
| 9 | LEEME.txt with instructions | Create file | ⬜ |
| 10 | Guía de Usuario PDF | Copy from build | ⬜ |
| 11 | `config/cloud.json` preconfigured | API key in file | ⬜ |
| 12 | Verify client has email | Ask client | ⬜ |

## On-Site Installation

```
1. Copy TUSTOCK/ folder to client's PC
2. Run configurar.bat (creates .env with correct token)
3. Run TUSTOCK.exe (starts server on port 8090)
4. Open browser → http://localhost:8090
5. Accept EULA
6. Activate license (client's key)
7. Install APK on phone → configure IP: 192.168.X.X:8090
```

## Common Errors and Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Token inválido" / "Sin acceso" | `.env` token ≠ frontend token | Re-run `configurar.bat` |
| "Clave inválida" at activate | Key not in cloud DB | `POST /api/licenses/sync` with key |
| Products don't register (500) | Barcode `""` violates UNIQUE | Already fixed (2026-07-21) |
| Scanner USB can't find product | `addToCart()` only checks `code` | Already fixed (2026-07-22) |
| App Stock registers barcode as "code" | Missing `barcode` field | Already fixed (2026-07-21) |
| Frontend shows "Error de conexion" | Only reads `err.detail` | Already fixed (2026-07-21) |
| Monitor Cloud shows no data | `config/cloud.json` missing | Create with API key |
| Monitor Cloud "API key inválida" | Key doesn't match any Business | Verify email + key |
| PC has no `config/` directory | Windows doesn't auto-create dirs | Create manually or via configurar.bat |
| JS served is old after rebuild | Hash mismatch in index.html | Delete old JS files |
| Fonts don't load (no internet) | CDN reference in index.html | Use local fonts in `public/assets/fonts/` |
| Server won't start | Missing `tustock-local-token` in `.env` | Run `configurar.bat` first |
| Port 8090 blocked | Windows firewall | `netsh advfirewall firewall add rule name="TUSTOCK-8090" dir=in action=allow protocol=tcp localport=8090` |
| App Android won't connect | Server listens on `127.0.0.1` | Verify `TUSTOCK_HOST=0.0.0.0` in `.env` |

## Post-Install Verification

After installation, test these flows:

1. ✅ Create a product (manual entry)
2. ✅ Create a product via barcode scanner
3. ✅ Make a sale (POS)
4. ✅ Apply a discount
5. ✅ Register a customer (fiado)
6. ✅ Register a payment on customer account
7. ✅ Adjust stock (manual)
8. ✅ Run a daily report
9. ✅ Export to Excel
10. ✅ Monitor Cloud shows data from this PC
