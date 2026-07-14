"""Variables de configuración de la aplicación (base de datos, host, token, CORS)."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_URL = os.getenv("TUSTOCK_DB", f"sqlite:///{BASE_DIR / 'tustock.db'}")

API_HOST = os.getenv("TUSTOCK_HOST", "0.0.0.0")
API_PORT = int(os.getenv("TUSTOCK_PORT", "8090"))

WEB_DIR = BASE_DIR / "web" / "dist"

TUSTOCK_TOKEN = os.getenv("TUSTOCK_TOKEN", "tustock-local-token")
TUSTOCK_ADMIN_TOKEN = os.getenv("TUSTOCK_ADMIN_TOKEN", "")
TUSTOCK_CLOUD_URL = os.getenv("TUSTOCK_CLOUD_URL", "https://tustock.up.railway.app")
TUSTOCK_CLOUD_CACHE_DAYS = 7

CORS_ORIGINS = [
    "http://localhost:8090",
    "http://127.0.0.1:8090",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
