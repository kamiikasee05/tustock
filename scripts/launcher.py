"""TUSTOCK — Lanzador interactivo.

Reemplaza todos los .bat separados. Hace setup, configuración,
inicio del servidor y monitor en un solo comando.
"""

import os
import sys
import subprocess
import json
import webbrowser
import time
import signal
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SERVER = BASE / "server"
MONITOR = BASE / "monitor"
CONFIG = BASE / "config"
CONFIG.mkdir(exist_ok=True)

def c(text):
    return text

def title(text):
    print(f"\n=== {text} ===")

def ask(question, default=True):
    opts = "S/n" if default else "s/N"
    r = input(f"{question} [{opts}] ").strip().lower()
    if not r:
        return default
    return r in ("s", "si", "y", "yes")

def run(cmd, cwd=None, show=True):
    if show:
        print(f"  > {cmd}")
    return subprocess.run(cmd, shell=True, cwd=cwd or str(BASE))

def check_python():
    title("Verificando Python")
    v = sys.version_info
    if v.major < 3 or (v.major == 3 and v.minor < 9):
        print(f"[ERROR] Se necesita Python 3.9+, tenés {v.major}.{v.minor}")
        print("Descargalo desde: https://python.org")
        input("Presioná Enter para salir...")
        sys.exit(1)
    print(f"  Python {v.major}.{v.minor}.{v.micro} OK")

def check_dependencies():
    title("Dependencias")
    r = run(f'"{sys.executable}" -m pip install -r "{SERVER / "requirements.txt"}" -q')
    if r.returncode != 0:
        print("[ERROR] No se pudieron instalar las dependencias")
        input("Presioná Enter para salir...")
        sys.exit(1)
    print("  Dependencias OK")

def check_db():
    title("Base de datos")
    db_path = BASE / "tustock.db"
    if db_path.exists():
        print(f"  Base existente ({db_path.stat().st_size / 1024:.0f} KB)")
        return
    print("  Base no encontrada. Ejecutando seed...")
    r = run(f'"{sys.executable}" seed.py', cwd=str(SERVER))
    if r.returncode == 0:
        print("  Base creada y datos de ejemplo cargados OK")
    else:
        print("[ERROR] No se pudo crear la base de datos")
        input("Presioná Enter para salir...")
        sys.exit(1)

def setup_desktop_shortcut():
    if Path(os.path.expanduser("~/Desktop/TUSTOCK.lnk")).exists():
        return
    if not ask("Crear acceso directo en el escritorio?"):
        return
    target = str(BASE / "TUSTOCK.bat")
    icon = str(SERVER / "favicon.ico")
    shortcut = os.path.expanduser("~/Desktop/TUSTOCK.lnk")
    ps = (
        f'$ws = New-Object -ComObject WScript.Shell; '
        f'$s = $ws.CreateShortcut("{shortcut}"); '
        f'$s.TargetPath = "{target}"; '
        f'$s.WorkingDirectory = "{BASE}"; '
        f'$s.Description = "TUSTOCK - Sistema de Gestion"; '
        f'$s.IconLocation = "{icon}"; '
        f'$s.Save()'
    )
    r = run(f'powershell -Command "{ps}"')
    if r.returncode == 0 and Path(shortcut).exists():
        print("  Acceso directo creado en el escritorio")
    else:
        print("  No se pudo crear el acceso directo (no crítico)")

def setup_autostart():
    task_name = "TUSTOCK"
    r = subprocess.run(f'schtasks /QUERY /TN "{task_name}"', shell=True, capture_output=True, text=True)
    if r.returncode == 0:
        return  # ya instalado
    if not ask("Iniciar TUSTOCK automaticamente al encender la PC?"):
        return
    bat_path = str(BASE / "TUSTOCK.bat")
    ps = (
        f'Start-Process powershell -Verb RunAs -ArgumentList '
        f'\'-Command "schtasks /CREATE /SC ONLOGON /TN \\"{task_name}\\" '
        f'/TR \\"\'{bat_path}\'\\" /F /RL HIGHEST"\''
    )
    r = run(f'powershell -Command "{ps}"')
    if r.returncode == 0:
        print("  Inicio automático configurado")
    else:
        print("  No se pudo configurar (ejecutá como Administrador manualmente)")

def check_monitor_enabled():
    """Verifica si el monitor premium está habilitado para esta instalación."""
    lic_path = CONFIG / "license.json"
    if lic_path.exists():
        try:
            lic = json.loads(lic_path.read_text("utf-8-sig"))
            if lic.get("monitor", False):
                return True
        except Exception:
            pass
    return False

def enable_monitor():
    """Habilita el monitor premium (para clienta premium)."""
    lic_path = CONFIG / "license.json"
    lic = {"monitor": True, "plan": "premium", "since": time.strftime("%Y-%m-%d")}
    if lic_path.exists():
        try:
            existing = json.loads(lic_path.read_text("utf-8"))
            existing["monitor"] = True
            existing["plan"] = "premium"
            lic = existing
        except Exception:
            pass
    lic_path.write_text(json.dumps(lic, indent=2), "utf-8-sig")
    print("  Monitor Premium habilitado")

def start_monitor():
    title("Monitor Premium")
    pid_path = SERVER / "logs" / "monitor.pid"
    # verificar si ya corre
    if pid_path.exists():
        try:
            pid = int(pid_path.read_text("utf-8").strip())
            proc = subprocess.run(f'taskkill /PID {pid} /F', shell=True, capture_output=True)
            time.sleep(1)
        except Exception:
            pass
    log_path = SERVER / "logs"
    log_path.mkdir(exist_ok=True)
    proc = subprocess.Popen(
        [sys.executable, str(MONITOR / "app.py")],
        cwd=str(BASE),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0,
    )
    pid_path.write_text(str(proc.pid), "utf-8")
    print(f"  Monitor iniciado (PID {proc.pid})")
    print(f"  Local: http://localhost:8091")
    print(f"  Para exponer a Internet:")
    print(f"    scripts\\tunnel-monitor.bat")
    return proc

def start_server():
    title("Iniciando TUSTOCK")
    pid_path = SERVER / "logs" / "server.pid"
    (SERVER / "logs").mkdir(exist_ok=True)

    if pid_path.exists():
        try:
            pid = int(pid_path.read_text("utf-8").strip())
            r = subprocess.run(f'tasklist /FI "PID eq {pid}"', shell=True, capture_output=True, text=True)
            if "python" in r.stdout.lower():
                print(f"  Servidor ya estaba corriendo (PID {pid})")
                return
        except Exception:
            pass
        pid_path.unlink(missing_ok=True)

    proc = subprocess.Popen(
        [sys.executable, str(SERVER / "main.py")],
        cwd=str(SERVER),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0,
    )
    pid_path.write_text(str(proc.pid), "utf-8")
    print(f"  Servidor iniciado (PID {proc.pid})")
    for i in range(10):
        time.sleep(1)
        try:
            import urllib.request
            urllib.request.urlopen("http://localhost:8090/", timeout=2)
            print("  Listo!")
            break
        except Exception:
            if i == 9:
                print("  [AVISO] El servidor tardó en responder, pero debería funcionar")

def show_summary(monitor_proc=None):
    title("TUSTOCK corriendo")
    print(f"  Admin:    http://localhost:8090")
    print(f"  Monitor:  http://localhost:8091")
    print()
    print(f"  Para detener: scripts\\stop.bat")
    if monitor_proc:
        print(f"  Tunnel:      scripts\\tunnel-monitor.bat")
    print()
    webbrowser.open("http://localhost:8090")


def main():
    quick = "--quick" in sys.argv
    os.chdir(str(BASE))

    if not quick:
        print(c("=" * 50))
        print(c("   TUSTOCK — Sistema de Gestión"))
        print(c("=" * 50))
        print()

    first_run = not (BASE / "config" / ".setup_done").exists()

    if first_run and not quick:
        print(c("BIENVENIDO! Vamos a configurar todo."))
        print()

    check_python()
    if first_run or quick:
        check_dependencies()

    monitor_enabled = check_monitor_enabled()
    monitor_proc = None

    if first_run and not quick:
        check_db()
        print()
        setup_desktop_shortcut()
        setup_autostart()
        print()

        if ask("Habilitar Monitor Premium (acceso remoto desde el celular)?"):
            enable_monitor()
            monitor_enabled = True
            if ask("Iniciar el monitor ahora?"):
                monitor_proc = start_monitor()
        else:
            print("  Podés habilitarlo después editando config\\license.json")

        (BASE / "config" / ".setup_done").touch()

        print()
        print(c("Configuración completada!"))

        if not ask("Iniciar TUSTOCK ahora?"):
            print()
            print("Ejecutá TUSTOCK.bat de nuevo cuando quieras empezar.")
            input("Presioná Enter para salir...")
            sys.exit(0)
    else:
        if not quick and os.getenv("TUSTOCK_NO_MONITOR") != "1" and monitor_enabled:
            if ask("Iniciar Monitor Premium?"):
                monitor_proc = start_monitor()
        elif quick and monitor_enabled:
            if (CONFIG / ".monitor_auto").exists():
                monitor_proc = start_monitor()

    start_server()
    show_summary(monitor_proc)

    if not quick:
        print()
        print("Ventana visible — cerrar esto NO detiene el servidor.")
        print("Usá scripts\\stop.bat para apagar.")
        print()
        input("Presioná Enter para cerrar esta ventana...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nAdiós!")
