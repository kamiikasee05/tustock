"""Wrapper de entrada para PyInstaller. Carga .env, ejecuta el servidor
y muestra un icono en la bandeja del sistema (system tray).

Si pystray no está disponible, hace fallback a modo consola.
"""

import os
import sys
import signal
import threading
import webbrowser
from pathlib import Path
from datetime import datetime

BUNDLE_DIR = None
_server_ready = threading.Event()
_server_error = [None]


def get_bundle_dir():
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)
    return Path(__file__).resolve().parent.parent


def load_env_file(env_path: Path):
    if not env_path.exists():
        return False
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip()
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                if key and key not in os.environ:
                    os.environ[key] = value
    return True


def create_tray_icon():
    from PIL import Image, ImageDraw, ImageFont

    size = 64
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle(
        [4, 4, 60, 60], radius=12, fill=(16, 19, 26, 255), outline=(77, 142, 255, 255), width=2
    )

    draw.rectangle([16, 20, 48, 24], fill=(77, 142, 255, 255))
    draw.rectangle([16, 28, 48, 32], fill=(120, 160, 255, 200))
    draw.rectangle([16, 36, 40, 40], fill=(120, 160, 255, 160))
    draw.rectangle([16, 44, 34, 48], fill=(120, 160, 255, 120))

    draw.ellipse([46, 42, 56, 52], fill=(0, 200, 120, 255))

    return img


def run_server(bundle_dir: Path):
    try:
        sys.path.insert(0, str(bundle_dir / "server"))

        env_file = bundle_dir / "server" / ".env"
        load_env_file(env_file)

        if not os.environ.get("TUSTOCK_TOKEN"):
            _server_error[0] = "TUSTOCK_TOKEN no está configurado"
            _server_ready.set()
            return

        import uvicorn

        from main import app
        from config import API_HOST, API_PORT
        from database import init_db

        log_dir = bundle_dir / "server" / "logs"
        log_dir.mkdir(exist_ok=True)
        log_file = log_dir / "server.log"
        pid_file = log_dir / "server.pid"

        def log(msg):
            with open(log_file, "a") as f:
                f.write(f"[{datetime.now().isoformat()}] {msg}\n")

        init_db()
        log("Base de datos iniciada")

        from database import SessionLocal
        from services.license_service import init_license

        _lic_db = SessionLocal()
        try:
            lic = init_license(_lic_db)
            log(f"Licencia activa: {lic.plan} ({lic.key})")
        finally:
            _lic_db.close()

        with open(pid_file, "w") as f:
            f.write(str(os.getpid()))

        log(f"Iniciando servidor en http://{API_HOST}:{API_PORT}")
        _server_ready.set()
        uvicorn.run(app, host=API_HOST, port=API_PORT, log_config=None)
    except SystemExit:
        pass
    except Exception as e:
        log_file = bundle_dir / "server" / "logs" / "server.log"
        try:
            with open(log_file, "a") as f:
                import traceback
                traceback.print_exc(file=f)
        except Exception:
            pass
        _server_error[0] = str(e)
        _server_ready.set()
    finally:
        pid_file = bundle_dir / "server" / "logs" / "server.pid"
        try:
            pid_file.unlink(missing_ok=True)
        except Exception:
            pass


def open_browser(url):
    webbrowser.open(url)


def main():
    global BUNDLE_DIR
    BUNDLE_DIR = get_bundle_dir()
    os.chdir(BUNDLE_DIR)

    sys.path.insert(0, str(BUNDLE_DIR / "server"))

    env_file = BUNDLE_DIR / "server" / ".env"
    load_env_file(env_file)

    try:
        from config import API_HOST, API_PORT
    except Exception:
        API_HOST = "0.0.0.0"
        API_PORT = 8090

    server_url = f"http://localhost:{API_PORT}"

    server_thread = threading.Thread(target=run_server, args=(BUNDLE_DIR,), daemon=True)
    server_thread.start()

    try:
        import pystray
    except ImportError:
        pystray = None

    if pystray is not None:
        _server_ready.wait(timeout=15)

        if _server_error[0]:
            print(f"ERROR: {_server_error[0]}")
            sys.exit(1)

        icon_image = create_tray_icon()

        def on_open(icon, item):
            open_browser(server_url)

        def on_exit(icon, item):
            icon.stop()

        menu = pystray.Menu(
            pystray.MenuItem("Abrir TUSTOCK", on_open, default=True),
            pystray.MenuItem("Detener servidor", on_exit),
        )

        icon = pystray.Icon(
            "TUSTOCK",
            icon_image,
            "TUSTOCK - Servidor activo en puerto 8090",
            menu,
        )

        def on_icon_stop(icon):
            pid_file = BUNDLE_DIR / "server" / "logs" / "server.pid"
            try:
                pid_file.unlink(missing_ok=True)
            except Exception:
                pass

        icon.on_stop = on_icon_stop
        icon.run()
    else:
        _server_ready.wait(timeout=15)

        if _server_error[0]:
            print(f"ERROR: {_server_error[0]}")
            sys.exit(1)

        print(f"TUSTOCK server running on {server_url}")
        print("PyInstaller mode: console (pystray not available)")
        print("Press Ctrl+C to stop.")
        try:
            server_thread.join()
        except KeyboardInterrupt:
            pass

    pid_file = BUNDLE_DIR / "server" / "logs" / "server.pid"
    try:
        pid_file.unlink(missing_ok=True)
    except Exception:
        pass


if __name__ == "__main__":
    main()
