import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_URL = os.getenv("TUSTOCK_DB", f"sqlite:///{BASE_DIR / 'tustock.db'}")

API_HOST = os.getenv("TUSTOCK_HOST", "0.0.0.0")
API_PORT = int(os.getenv("TUSTOCK_PORT", "8090"))

WEB_DIR = BASE_DIR / "web" / "dist"

TUSTOCK_TOKEN = os.getenv("TUSTOCK_TOKEN", "tustock-local-token")

CORS_ORIGINS = [
    "http://localhost:8090",
    "http://127.0.0.1:8090",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
