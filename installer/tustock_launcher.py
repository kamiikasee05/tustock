"""TUSTOCK Launcher — Entry point for PyInstaller bundle.

In PyInstaller 6.x onedir, data files live in _internal/ but config.py
calculates BASE_DIR as the exe's parent. We create junctions so data
is accessible from both locations.
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path


def debug(msg):
    try:
        with open("debug.log", "a", encoding="utf-8") as f:
            f.write(f"{msg}\n")
    except Exception:
        pass


def create_junction(src, dst):
    if os.path.exists(dst):
        return True
    try:
        result = subprocess.run(
            ["cmd", "/c", "mklink", "/J", dst, src],
            capture_output=True, text=True, timeout=5
        )
        return result.returncode == 0
    except Exception:
        return False


def main():
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
        internal_dir = getattr(sys, '_MEIPASS', os.path.join(exe_dir, '_internal'))
    else:
        exe_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        internal_dir = exe_dir

    os.chdir(exe_dir)
    debug(f"exe_dir: {exe_dir}")
    debug(f"internal_dir: {internal_dir}")

    for dirname in ['web', 'monitor', 'legal', 'cloud']:
        src = os.path.join(internal_dir, dirname)
        dst = os.path.join(exe_dir, dirname)
        if os.path.isdir(src) and not os.path.exists(dst):
            ok = create_junction(src, dst)
            debug(f"junction {dirname}: src={src} dst={dst} ok={ok}")

    server_dir = os.path.join(internal_dir, 'server')
    if server_dir not in sys.path:
        sys.path.insert(0, server_dir)

    env_file = os.path.join(server_dir, '.env')
    if not os.path.exists(env_file):
        env_example = os.path.join(server_dir, '.env.example')
        if os.path.exists(env_example):
            shutil.copy2(env_example, env_file)
            debug(".env created from example")
        else:
            print("[tustock] ERROR: No se encontro server/.env")
            if sys.stdin.isatty():
                input("Enter para salir...")
            sys.exit(1)

    from dotenv import load_dotenv
    load_dotenv(env_file)

    from database import init_db
    from services.license_service import init_license
    from database import SessionLocal

    debug("Running init_db...")
    init_db()
    debug("init_db done")

    db = SessionLocal()
    try:
        lic = init_license(db)
        debug(f"License: {lic.plan}")
    finally:
        db.close()

    from main import app
    import uvicorn
    from config import API_HOST, API_PORT, WEB_DIR, BASE_DIR

    debug(f"BASE_DIR: {BASE_DIR}")
    debug(f"WEB_DIR: {WEB_DIR}")
    debug(f"WEB_DIR.exists(): {WEB_DIR.exists()}")
    if WEB_DIR.exists():
        debug(f"index.html: {(WEB_DIR / 'index.html').exists()}")

    print(f"[tustock] Servidor en http://{API_HOST}:{API_PORT}")
    uvicorn.run(app, host=API_HOST, port=API_PORT)


if __name__ == '__main__':
    main()
