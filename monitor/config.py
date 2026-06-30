"""Configuración del Monitor Premium TUSTOCK."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MONITOR_HOST = os.getenv("TUSTOCK_MONITOR_HOST", "0.0.0.0")
MONITOR_PORT = int(os.getenv("TUSTOCK_MONITOR_PORT", "8091"))

MONITOR_USER = os.getenv("TUSTOCK_MONITOR_USER", "admin")
MONITOR_PASS = os.getenv("TUSTOCK_MONITOR_PASS", "tustock123")

DATABASE_URL = os.getenv("TUSTOCK_DB", f"sqlite:///{BASE_DIR / 'tustock.db'}")
