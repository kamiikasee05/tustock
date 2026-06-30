"""TUSTOCK — Lanzador interactivo.

Reemplaza todos los .bat separados. Hace setup, configuración,
inicio del servidor y monitor en un solo comando.
"""

import os
import sys
import subprocess
import webbrowser
import time
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

def _db_session():
    from database import SessionLocal
    return SessionLocal()

def get_db_license_status():
    """Lee el estado de licencia directamente de la base de datos."""
    try:
        import sys
        sys.path.insert(0, str(SERVER))
        from services.license_service import get_license_status
        db = _db_session()
        try:
            result = get_license_status(db)
            return result
        finally:
            db.close()
    except Exception:
        return {"monitor_enabled": False, "plan": "trial"}

def check_monitor_enabled():
    status = get_db_license_status()
    return status.get("monitor_enabled", False)

def get_plan_name():
    status = get_db_license_status()
    return status.get("plan_name", "Trial")

def is_trial():
    status = get_db_license_status()
    return status.get("trial", False) and not status.get("expired", True)

def start_monitor():
    title("Monitor Premium")
    pid_path = SERVER / "logs" / "monitor.pid"
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
    print(f"  Para exponer a Internet, despues ejecuta: TUSTOCK.bat (opcion 5)")
    return proc

def find_cloudflared():
    """Busca cloudflared.exe en PATH, scripts/ o raiz."""
    import shutil
    exe = shutil.which("cloudflared")
    if exe:
        return Path(exe)
    for d in [BASE / "scripts", BASE]:
        p = d / "cloudflared.exe"
        if p.exists():
            return p
    return None

def download_cloudflared():
    """Descarga cloudflared.exe desde GitHub."""
    url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    dest = BASE / "scripts" / "cloudflared.exe"
    print(f"  Descargando cloudflared desde GitHub...")
    import urllib.request
    try:
        urllib.request.urlretrieve(url, dest)
        print(f"  Descargado: cloudflared.exe ({dest.stat().st_size / 1024:.0f} KB)")
        return dest
    except Exception as e:
        print(f"  [ERROR] No se pudo descargar: {e}")
        return None

def start_tunnel():
    """Inicia Cloudflare Tunnel exponiendo el monitor a Internet."""
    title("Tunnel Cloudflare")
    cloud = find_cloudflared()
    if not cloud:
        if ask("Descargar cloudflared.exe de GitHub?"):
            cloud = download_cloudflared()
        if not cloud:
            print()
            print("Descargalo manualmente desde:")
            print("  https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/")
            print("Y guardalo en scripts/cloudflared.exe")
            input("Presioná Enter para volver...")
            return 1
    print(f"  Usando: {cloud}")
    import urllib.request
    try:
        r = urllib.request.urlopen("http://localhost:8091/api/health", timeout=3)
        if r.status != 200:
            raise Exception("status != 200")
    except Exception:
        print("  [ERROR] El monitor no esta corriendo en http://localhost:8091")
        print("  Inicialo primero desde el menu (opcion 4)")
        input("Presioná Enter para volver...")
        return 1
    print()
    print("  Tunnel iniciado. Abrí esta URL desde el celular:")
    print()
    print("  https://XXXX.trycloudflare.com")
    print()
    print("  (La URL completa aparece abajo)")
    print()
    print("  Dejá esta ventana abierta. Para cerrar: Ctrl+C")
    print()
    subprocess.run([str(cloud), "tunnel", "--url", "http://localhost:8091"])
    return 0

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

def start_cloud_agent():
    """Inicia el agente cloud en segundo plano si está configurado."""
    cfg = BASE / "config" / "cloud.json"
    if not cfg.exists():
        return None
    import json
    try:
        config = json.loads(cfg.read_text("utf-8"))
        if not config.get("api_url") or not config.get("api_key"):
            return None
    except Exception:
        return None

    pid_path = SERVER / "logs" / "cloud_agent.pid"
    if pid_path.exists():
        try:
            pid = int(pid_path.read_text("utf-8").strip())
            r = subprocess.run(f'tasklist /FI "PID eq {pid}"', shell=True, capture_output=True, text=True)
            if "python" in r.stdout.lower():
                return pid
        except Exception:
            pass

    proc = subprocess.Popen(
        [sys.executable, str(BASE / "cloud" / "agent.py")],
        cwd=str(BASE),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0,
    )
    pid_path.write_text(str(proc.pid), "utf-8")
    print(f"  Cloud Agent iniciado (PID {proc.pid})")
    return proc


def cloud_setup_wizard():
    """Asistente para configurar el Monitor Cloud."""
    title("Configurar Monitor Cloud")
    import json
    cfg_path = BASE / "config" / "cloud.json"
    print("Necesitás:")
    print("  1. Una cuenta en tustock-monitor.com (o la URL de tu cloud)")
    print("  2. La API key que te dió el registro")
    print()
    api_url = input("URL del Monitor Cloud: ").strip().rstrip("/")
    if not api_url:
        api_url = "https://tustock-monitor.com"
    api_key = input("API key del negocio: ").strip()
    if not api_key:
        print("Configuración cancelada.")
        return
    cfg_path.write_text(json.dumps({"api_url": api_url, "api_key": api_key}, indent=2), "utf-8")
    print(f"Guardado en {cfg_path}")
    if ask("Iniciar agente ahora?"):
        start_cloud_agent()
    print("El agente se inicia automáticamente con TUSTOCK.")


def show_summary(monitor_proc=None, cloud_agent_proc=None):
    title("TUSTOCK corriendo")
    print(f"  Admin:    http://localhost:8090")
    print(f"  Monitor:  http://localhost:8091")
    cloud_cfg = BASE / "config" / "cloud.json"
    if cloud_cfg.exists():
        import json
        try:
            cfg = json.loads(cloud_cfg.read_text("utf-8"))
            print(f"  Cloud:    {cfg.get('api_url', '?')}")
        except Exception:
            pass
    print()
    print(f"  Para detener: scripts\\stop.bat")
    if monitor_proc:
        print(f"  Tunnel:      TUSTOCK.bat (opcion 5)")
    if cloud_agent_proc:
        print(f"  Cloud Agent: activo")
    print()
    webbrowser.open("http://localhost:8090")


def main():
    quick = "--quick" in sys.argv
    tunnel = "--tunnel" in sys.argv
    os.chdir(str(BASE))

    if tunnel:
        sys.exit(start_tunnel())

    if "--cloud-setup" in sys.argv:
        cloud_setup_wizard()
        return

    if "--cloud-agent" in sys.argv:
        start_cloud_agent()
        return

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

    monitor_proc = None

    if first_run and not quick:
        check_db()
        print()
        setup_desktop_shortcut()
        setup_autostart()
        print()

        print(c("Sobre el plan:"))
        print(c("  Trial: 30 días, hasta 50 productos, sin informes ni exportación"))
        print(c("  Básico: $80.000 único, sistema completo"))
        print(c("  Pro:    $160.000 único, incluye monitor remoto y backup"))
        print(c("  Suscripción: $8.000/mes, todo incluido"))
        print()
        print(c("Para activar una licencia, entrá a Ajustes > Licencia en el sistema."))
        print()

        (BASE / "config" / ".setup_done").touch()

        print()
        print(c("Configuración completada!"))

        if not ask("Iniciar TUSTOCK ahora?"):
            print()
            print("Ejecutá TUSTOCK.bat de nuevo cuando quieras empezar.")
            input("Presioná Enter para salir...")
            sys.exit(0)
    else:
        status = get_db_license_status()
        if status.get("monitor_enabled") and os.getenv("TUSTOCK_NO_MONITOR") != "1":
            if quick:
                monitor_proc = start_monitor()
            elif ask("Iniciar Monitor Premium?"):
                monitor_proc = start_monitor()

    cloud_agent_proc = start_cloud_agent() if (BASE / "config" / "cloud.json").exists() else None
    start_server()
    show_summary(monitor_proc, cloud_agent_proc)

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
