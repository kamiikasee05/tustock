"""Configuración del Monitor Cloud TUSTOCK."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

CLOUD_HOST = os.getenv("TUSTOCK_CLOUD_HOST", "0.0.0.0")
CLOUD_PORT = int(os.getenv("TUSTOCK_CLOUD_PORT", "8000"))

DATABASE_URL = os.getenv("DATABASE_URL", os.getenv("TUSTOCK_CLOUD_DB", f"sqlite:///{BASE_DIR / 'cloud.db'}"))
JWT_SECRET = os.getenv("TUSTOCK_JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 30

MP_ACCESS_TOKEN = os.getenv("TUSTOCK_MP_TOKEN", "")
MP_SUBS_TOKEN = os.getenv("TUSTOCK_MP_SUBS_TOKEN", "") or MP_ACCESS_TOKEN
ADMIN_TOKEN = os.getenv("TUSTOCK_ADMIN_TOKEN", "")

MP_WEBHOOK_SECRET = os.getenv("TUSTOCK_MP_WEBHOOK_SECRET", "")
MP_WEBHOOK_SECRET_SUBS = os.getenv("TUSTOCK_MP_WEBHOOK_SECRET_SUBS", "") or MP_WEBHOOK_SECRET
