# -*- mode: python ; coding: utf-8 -*-
# TUSTOCK PyInstaller Spec File — PoC
# Modo one-folder. Entry point: installer/tustock_entry.py (wrapper)

import os
import sys
from pathlib import Path

SPEC_DIR = os.path.dirname(os.path.abspath(SPEC))
PROJECT_ROOT = Path(SPEC_DIR).parent

import barcode as _barcode
_BARCODE_DIR = os.path.dirname(os.path.abspath(_barcode.__file__))

# Scripts: incluir todo EXCEPTO cloudflared.exe (51 MB, se descarga on-demand)
scripts_datas = [
    (str(p), "scripts")
    for p in (PROJECT_ROOT / "scripts").iterdir()
    if p.is_file() and p.name != "cloudflared.exe"
]

a = Analysis(
    [str(PROJECT_ROOT / "installer" / "tustock_entry.py")],
    pathex=[str(PROJECT_ROOT / "server")],
    binaries=[],
    datas=[
        # Frontend compilado
        (str(PROJECT_ROOT / "web" / "dist"), "web" + os.sep + "dist"),
        # Monitor local
        (str(PROJECT_ROOT / "monitor"), "monitor"),
        # Scripts
        *scripts_datas,
        # Cloud agent
        (str(PROJECT_ROOT / "cloud"), "cloud"),
        # Documentos legales
        (str(PROJECT_ROOT / "legal"), "legal"),
        # Environment file (si existe)
        (str(PROJECT_ROOT / "server" / ".env"), "server"),
        # .env.example como fallback
        (str(PROJECT_ROOT / "server" / ".env.example"), "server"),
        # Fuentes de barcode (necesario para ImageWriter en runtime)
        (os.path.join(_BARCODE_DIR, "fonts"), "barcode" + os.sep + "fonts"),
    ],
    hiddenimports=[
        "pystray",
        "pystray._win32",
        "six",
        "uvicorn",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.h11_impl",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.wsproto_impl",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        "fastapi",
        "starlette",
        "sqlalchemy",
        "sqlalchemy.dialects.sqlite",
        "sqlalchemy.ext.baked",
        "pydantic",
        "multipart",
        "openpyxl",
        "reportlab",
        "reportlab.lib",
        "reportlab.pdfgen",
        "reportlab.platypus",
        "reportlab.graphics",
        "reportlab.graphics.barcode",
        "reportlab.graphics.barcode.code128",
        "reportlab.graphics.barcode.code39",
        "reportlab.graphics.barcode.code93",
        "reportlab.graphics.barcode.common",
        "reportlab.graphics.barcode.widgets",
        "reportlab.graphics.barcode.eanbc",
        "reportlab.graphics.barcode.qr",
        "reportlab.graphics.barcode.qrencoder",
        "reportlab.graphics.barcode.dmtx",
        "reportlab.graphics.barcode.ecc200datamatrix",
        "reportlab.graphics.barcode.usps",
        "reportlab.graphics.barcode.usps4s",
        "reportlab.graphics.renderPDF",
        "barcode",
        "barcode.writer",
        "barcode.codex",
        "barcode.base",
        "barcode.charsets",
        "barcode.charsets.code128",
        "barcode.charsets.code39",
        "barcode.charsets.ean",
        "barcode.ean",
        "barcode.upc",
        "barcode.itf",
        "barcode.codabar",
        "barcode.isxn",
        "PIL",
        "PIL.Image",
        "PIL.ImageDraw",
        "PIL.ImageFont",
        "aiofiles",
        "aiofiles.os",
        "dotenv",
        "routes",
        "routes.products",
        "routes.stock",
        "routes.sales",
        "routes.audits",
        "routes.reports",
        "routes.vendors",
        "routes.pending_orders",
        "routes.customers",
        "routes.budgets",
        "routes.license",
        "routes.admin",
        "routes.remote_orders",
        "models",
        "models.product",
        "models.sale",
        "models.stock",
        "models.audit",
        "models.vendor",
        "models.customer",
        "models.budget",
        "models.pending_order",
        "models.license",
        "models.report",
        "services",
        "services.license_service",
        "services.stock_service",
        "services.audit_service",
        "services.report_service",
        "database",
        "config",
        "auth",
        "schemas",
        "seed",
        "cloud_push",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        "tkinter",
        "matplotlib",
        "numpy",
        "scipy",
        "pandas",
        "pytest",
        "unittest",
    ],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="TUSTOCK",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="TUSTOCK",
)
