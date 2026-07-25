"""Agente local TUSTOCK — Lee la base de datos local y envía métricas al Monitor Cloud.

Se ejecuta en segundo plano en la PC del cliente. Cada 30 segundos
lee la DB local y hace POST a la API cloud con las métricas.

Configuración: config/cloud.json
  {
    "api_url": "https://tustock-monitor.com",
    "api_key": "tu-api-key"
  }
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys.executable).resolve().parent
else:
    BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_FILE = BASE_DIR / "config" / "cloud.json"
LOCAL_DB = BASE_DIR / "tustock.db"
PUSH_INTERVAL = 30


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text("utf-8"))
    return {}


def save_config(cfg: dict):
    CONFIG_FILE.parent.mkdir(exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(cfg, indent=2), "utf-8")


def _get_local_token() -> str:
    cfg = load_config()
    token = cfg.get("local_token", "")
    if token:
        return token
    env_path = BASE_DIR / "server" / ".env"
    if env_path.exists():
        for line in env_path.read_text("utf-8").splitlines():
            if line.startswith("TUSTOCK_TOKEN="):
                return line.split("=", 1)[1].strip()
    return "tustock-local-token"


def _query(db, sql, params=None):
    import sqlite3
    conn = sqlite3.connect(str(db))
    try:
        cur = conn.execute(sql, params or {})
        return cur.fetchall()
    finally:
        conn.close()


def _scalar(db, sql, params=None):
    import sqlite3
    conn = sqlite3.connect(str(db))
    try:
        cur = conn.execute(sql, params or {})
        row = cur.fetchone()
        return row[0] if row else 0
    finally:
        conn.close()


def collect_inventory(db_path: Path) -> dict:
    try:
        rows = _query(db_path, """
            SELECT p.name, p.code, p.barcode, c.name,
                   p.selling_price, p.cost_price,
                   p.min_stock, p.unit,
                   COALESCE(cs.quantity, 0)
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN current_stock cs ON cs.product_id = p.id
            WHERE p.is_active = 1
            ORDER BY p.name
            LIMIT 500
        """)
        products = [
            {
                "name": r[0], "code": r[1], "barcode": r[2],
                "category": r[3] or "", "price": float(r[4] or 0),
                "cost": float(r[5] or 0), "min_stock": r[6] or 0,
                "unit": r[7] or "un", "stock": float(r[8]),
            }
            for r in rows
        ]
        total_count = _scalar(db_path, "SELECT COUNT(*) FROM products WHERE is_active = 1")
        return {
            "products": products,
            "total": total_count,
            "truncated": len(products) < total_count,
        }
    except Exception:
        return None


def collect_metrics(db_path: Path) -> dict:
    today = str(date.today())
    week_ago = str(date.today() - timedelta(days=7))

    sales_count, sales_total = 0, 0.0
    row = _query(db_path, "SELECT COUNT(*), COALESCE(SUM(total),0) FROM sales WHERE sale_date = :d", {"d": today})
    if row:
        sales_count, sales_total = row[0][0], float(row[0][1])

    items_sold = _scalar(db_path, "SELECT COALESCE(SUM(quantity),0) FROM sale_items si JOIN sales s ON s.id = si.sale_id WHERE s.sale_date = :d", {"d": today})

    by_method_rows = _query(db_path, "SELECT payment_method, COUNT(*), COALESCE(SUM(total),0) FROM sales WHERE sale_date = :d GROUP BY payment_method", {"d": today})
    by_method = [{"method": r[0] or "sin metodo", "count": r[1], "total": float(r[2])} for r in by_method_rows]

    top_rows = _query(db_path, """
        SELECT p.name, SUM(si.quantity), SUM(si.subtotal)
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        JOIN products p ON p.id = si.product_id
        WHERE s.sale_date >= :w
        GROUP BY si.product_id ORDER BY SUM(si.quantity) DESC LIMIT 5
    """, {"w": week_ago})
    top_products = [{"name": r[0], "quantity": int(r[1]), "total": float(r[2])} for r in top_rows]

    low_rows = _query(db_path, """
        SELECT p.name, p.min_stock, COALESCE(cs.quantity,0), p.unit
        FROM products p
        LEFT JOIN current_stock cs ON cs.product_id = p.id
        WHERE p.is_active = 1 AND COALESCE(cs.quantity,0) <= p.min_stock
        ORDER BY cs.quantity ASC LIMIT 10
    """)
    low_stock = [{"name": r[0], "min_stock": r[1], "current": float(r[2]), "unit": r[3]} for r in low_rows]

    debt_rows = _query(db_path, """
        SELECT c.name, COALESCE(d.total,0)-COALESCE(p.total,0)
        FROM customers c
        LEFT JOIN (SELECT customer_id, SUM(amount) as total FROM customer_transactions WHERE type='debt' GROUP BY customer_id) d ON d.customer_id = c.id
        LEFT JOIN (SELECT customer_id, SUM(amount) as total FROM customer_transactions WHERE type='payment' GROUP BY customer_id) p ON p.customer_id = c.id
        WHERE c.is_active = 1 AND COALESCE(d.total,0)-COALESCE(p.total,0) > 0
        ORDER BY 2 DESC LIMIT 10
    """)
    debtors = [{"name": r[0], "balance": float(r[1])} for r in debt_rows]

    pending_rows = _query(db_path, """
        SELECT po.id, po.total, po.status, po.created_at
        FROM pending_orders po
        WHERE po.created_at >= :today
        ORDER BY po.created_at DESC
        LIMIT 10
    """, {"today": today})
    pending_orders = [
        {
            "id": r[0],
            "total": float(r[1]),
            "status": r[2] or "pending",
            "created_at": str(r[3]) if r[3] else None,
        }
        for r in pending_rows
    ]

    inventory = collect_inventory(db_path)

    return {
        "date": today,
        "server_time": datetime.now(timezone.utc).isoformat(),
        "sales_today": {
            "count": sales_count,
            "total": sales_total,
            "items_sold": int(items_sold),
        },
        "by_method": by_method,
        "top_products": top_products,
        "low_stock": low_stock,
        "debtors": debtors,
        "pending_orders": pending_orders,
        "inventory": inventory,
    }


def push_metrics(api_url: str, api_key: str, data: dict) -> bool:
    url = api_url.rstrip("/") + "/api/push"
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={
        "Content-Type": "application/json",
        "X-API-Key": api_key,
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return resp.status == 200
    except Exception:
        return False


def fetch_pending_commands(api_url: str, api_key: str) -> list:
    try:
        req = urllib.request.Request(
            f"{api_url.rstrip('/')}/api/commands/pending",
            headers={"X-API-Key": api_key},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return data.get("commands", [])
    except Exception:
        return []


def ack_command(api_url: str, api_key: str, cmd_id: int, ok: bool, result=None, error=None):
    try:
        payload = json.dumps({"ok": ok, "result": result, "error": error}).encode()
        req = urllib.request.Request(
            f"{api_url.rstrip('/')}/api/commands/{cmd_id}/ack",
            data=payload,
            headers={"X-API-Key": api_key, "Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=10)
    except Exception:
        pass


def execute_command(cmd: dict, api_url: str, api_key: str):
    cmd_type = cmd.get("command_type", "")
    payload = cmd.get("payload", {})
    cmd_id = cmd.get("id")
    local_url = "http://localhost:8090"
    token = _get_local_token()

    try:
        if cmd_type == "direct_sale":
            data = json.dumps(payload).encode()
            req = urllib.request.Request(
                f"{local_url}/api/remote-orders",
                data=data,
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read())
                ack_command(api_url, api_key, cmd_id, True, result=result)

        elif cmd_type == "approve_order":
            order_id = payload.get("order_id")
            payment_method = payload.get("payment_method", "efectivo")
            data = json.dumps({"payment_method": payment_method}).encode()
            req = urllib.request.Request(
                f"{local_url}/api/pending-orders/{order_id}/approve",
                data=data,
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read())
                ack_command(api_url, api_key, cmd_id, True, result=result)

        elif cmd_type == "reject_order":
            order_id = payload.get("order_id")
            req = urllib.request.Request(
                f"{local_url}/api/pending-orders/{order_id}/reject",
                method="POST",
                headers={"Authorization": f"Bearer {token}"},
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read())
                ack_command(api_url, api_key, cmd_id, True, result=result)

        else:
            ack_command(api_url, api_key, cmd_id, False, error=f"Tipo desconocido: {cmd_type}")

    except Exception as e:
        ack_command(api_url, api_key, cmd_id, False, error=str(e))


def setup_wizard():
    print("=== Configurar Monitor Cloud ===")
    print()
    api_url = input("URL del Monitor Cloud (ej: https://tustock-monitor.com): ").strip().rstrip("/")
    if not api_url:
        print("Configuración cancelada.")
        return False
    api_key = input("API key del negocio: ").strip()
    if not api_key:
        print("Configuración cancelada.")
        return False
    save_config({"api_url": api_url, "api_key": api_key})
    print()
    print("Configuración guardada en config/cloud.json")
    return True


def main():
    cfg = load_config()

    if "--setup" in sys.argv:
        setup_wizard()
        return

    if not cfg.get("api_url") or not cfg.get("api_key"):
        print("[cloud-agent] No configurado. Ejecutá con --setup para configurar.")
        return

    if "--once" in sys.argv:
        data = collect_metrics(LOCAL_DB)
        ok = push_metrics(cfg["api_url"], cfg["api_key"], data)
        print(json.dumps({"ok": ok, "pushed": data["date"]}))
        return

    print(f"[cloud-agent] Iniciado. Push cada {PUSH_INTERVAL}s a {cfg['api_url']}")
    print("[cloud-agent] Para detener: cerrar esta ventana o Ctrl+C")
    print()

    while True:
        try:
            data = collect_metrics(LOCAL_DB)
            ok = push_metrics(cfg["api_url"], cfg["api_key"], data)
            status = "OK" if ok else "FAIL"
            t = datetime.now().strftime("%H:%M:%S")
            print(f"  [{t}] Push {status} — {data['date']} — ${data['sales_today']['total']:.0f}")

            commands = fetch_pending_commands(cfg["api_url"], cfg["api_key"])
            if commands:
                print(f"  [{t}] Comandos recibidos: {len(commands)}")
            for cmd in commands:
                print(f"  [{t}] Ejecutando: {cmd.get('command_type')} id={cmd.get('id')}")
                execute_command(cmd, cfg["api_url"], cfg["api_key"])

        except Exception as e:
            print(f"  [{datetime.now().strftime('%H:%M:%S')}] Error: {e}")
        time.sleep(PUSH_INTERVAL)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[cloud-agent] Detenido.")
