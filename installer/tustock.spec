# -*- mode: python ; coding: utf-8 -*-
# TUSTOCK PyInstaller Spec File — PoC
# Modo one-folder. Entry point: installer/tustock_entry.py (wrapper)

import os
from pathlib import Path

SPEC_DIR = os.path.dirname(os.path.abspath(SPEC))
PROJECT_ROOT = Path(SPEC_DIR).parent

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
        (str(PROJECT_ROOT / "scripts"), "scripts"),
        # Cloud agent
        (str(PROJECT_ROOT / "cloud"), "cloud"),
        # Documentos legales
        (str(PROJECT_ROOT / "legal"), "legal"),
        # Environment file (si existe)
        (str(PROJECT_ROOT / "server" / ".env"), "server"),
        # .env.example como fallback
        (str(PROJECT_ROOT / "server" / ".env.example"), "server"),
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
        "barcode",
        "barcode.writer",
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
