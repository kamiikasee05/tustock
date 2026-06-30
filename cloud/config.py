"""Configuración del Monitor Cloud TUSTOCK."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

CLOUD_HOST = os.getenv("TUSTOCK_CLOUD_HOST", "0.0.0.0")
CLOUD_PORT = int(os.getenv("TUSTOCK_CLOUD_PORT", "8000"))

DATABASE_URL = os.getenv("TUSTOCK_CLOUD_DB", f"sqlite:///{BASE_DIR / 'cloud.db'}")
JWT_SECRET = os.getenv("TUSTOCK_JWT_SECRET", "cambiar-en-produccion")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 30
