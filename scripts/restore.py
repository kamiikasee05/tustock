"""Restaurar base de datos desde un backup."""
import shutil
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "tustock.db"
BACKUP_DIR = BASE_DIR / "backups"

backups = sorted(BACKUP_DIR.glob("tustock_backup_*.db"), reverse=True)

if not backups:
    print("No se encontraron backups en la carpeta backups/")
    print("Ejecute backup.py primero.")
    sys.exit(1)

print("Backups disponibles:")
for i, b in enumerate(backups):
    print(f"  [{i}] {b.name} ({b.stat().st_size / 1024:.1f} KB)")

try:
    choice = input(f"\nIngrese el numero del backup a restaurar (0-{len(backups)-1}): ").strip()
    idx = int(choice)
    selected = backups[idx]
except (ValueError, IndexError):
    print("Seleccion invalida.")
    sys.exit(1)

confirm = input(f"Esta seguro de restaurar {selected.name}? Esto SOBREESCRIBIRA la base actual. (si/no): ")
if confirm.lower() != "si":
    print("Cancelado.")
    sys.exit(0)

# Backup de seguridad de la DB actual antes de restaurar
if DB_PATH.exists():
    safety = BACKUP_DIR / f"pre_restore_{selected.stem}.db"
    shutil.copy2(DB_PATH, safety)
    print(f"Backup de seguridad guardado: {safety.name}")

shutil.copy2(selected, DB_PATH)
print(f"Base de datos restaurada desde {selected.name}")
