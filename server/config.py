"""Variables de configuración de la aplicación (base de datos, host, token, CORS)."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

if getattr(sys, "frozen", False):
    BUNDLE_DIR = Path(sys._MEIPASS)
    BASE_DIR = BUNDLE_DIR
else:
    BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / "server" / ".env")

DATABASE_URL = os.getenv("TUSTOCK_DB") or f"sqlite:///{BASE_DIR / 'tustock.db'}"

API_HOST = os.getenv("TUSTOCK_HOST", "0.0.0.0")
API_PORT = int(os.getenv("TUSTOCK_PORT", "8090"))

WEB_DIR = BASE_DIR / "web" / "dist"

TUSTOCK_TOKEN = os.getenv("TUSTOCK_TOKEN") or ""
TUSTOCK_ADMIN_TOKEN = os.getenv("TUSTOCK_ADMIN_TOKEN") or ""
TUSTOCK_CLOUD_URL = os.getenv("TUSTOCK_CLOUD_URL") or "https://tustock.up.railway.app"
TUSTOCK_CLOUD_CACHE_DAYS = 7

if not TUSTOCK_TOKEN:
    print("ERROR: TUSTOCK_TOKEN no está configurado.")
    print("Creá un archivo server/.env con tus tokens (ver server/.env.example).")
    print("Sin esto, el servidor no puede funcionar.")
    sys.exit(1)

CORS_ORIGINS = [
    "http://localhost:8090",
    "http://127.0.0.1:8090",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
