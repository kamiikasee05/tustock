"""Script de backup de la base de datos TUSTOCK."""
import shutil
import os
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "tustock.db"
BACKUP_DIR = BASE_DIR / "backups"

if not DB_PATH.exists():
    print(f"ERROR: No se encontro la base de datos en {DB_PATH}")
    print("Ejecute el servidor al menos una vez para crear la base de datos.")
    exit(1)

BACKUP_DIR.mkdir(exist_ok=True)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_name = f"tustock_backup_{timestamp}.db"
backup_path = BACKUP_DIR / backup_name

shutil.copy2(DB_PATH, backup_path)
print(f"Backup creado: {backup_path}")
print(f"Tamaño: {backup_path.stat().st_size / 1024:.1f} KB")

# Limpiar backups viejos (conservar últimos 30)
backups = sorted(BACKUP_DIR.glob("tustock_backup_*.db"))
if len(backups) > 30:
    for old in backups[:-30]:
        old.unlink()
        print(f"Backup antiguo eliminado: {old.name}")

print("Backup completado.")
