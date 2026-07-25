import json
import sqlite3
import threading
import urllib.request
import urllib.error
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import sys
if getattr(sys, "frozen", False):
    BUNDLE_DIR = Path(sys._MEIPASS)
    PROJECT_ROOT = Path(sys.executable).resolve().parent
else:
    BUNDLE_DIR = Path(__file__).resolve().parent.parent
    PROJECT_ROOT = BUNDLE_DIR

CONFIG_FILE = PROJECT_ROOT / "config" / "cloud.json"
LOCAL_DB = BUNDLE_DIR / "tustock.db"


def _query(db_path, sql, params=None):
    conn = sqlite3.connect(str(db_path))
    try:
        return conn.execute(sql, params or {}).fetchall()
    finally:
        conn.close()


def _scalar(db_path, sql, params=None):
    conn = sqlite3.connect(str(db_path))
    try:
        row = conn.execute(sql, params or {}).fetchone()
        return row[0] if row else 0
    finally:
        conn.close()


def collect_metrics() -> dict:
    today = str(date.today())
    week_ago = str(date.today() - timedelta(days=7))

    sales_count, sales_total = 0, 0.0
    row = _query(LOCAL_DB, "SELECT COUNT(*), COALESCE(SUM(total),0) FROM sales WHERE sale_date = :d", {"d": today})
    if row:
        sales_count, sales_total = row[0][0], float(row[0][1])

    items_sold = _scalar(LOCAL_DB, "SELECT COALESCE(SUM(quantity),0) FROM sale_items si JOIN sales s ON s.id = si.sale_id WHERE s.sale_date = :d", {"d": today})

    by_method_rows = _query(LOCAL_DB, "SELECT payment_method, COUNT(*), COALESCE(SUM(total),0) FROM sales WHERE sale_date = :d GROUP BY payment_method", {"d": today})
    by_method = [{"method": r[0] or "sin metodo", "count": r[1], "total": float(r[2])} for r in by_method_rows]

    top_rows = _query(LOCAL_DB, """
        SELECT p.name, SUM(si.quantity), SUM(si.subtotal)
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        JOIN products p ON p.id = si.product_id
        WHERE s.sale_date >= :w
        GROUP BY si.product_id ORDER BY SUM(si.quantity) DESC LIMIT 5
    """, {"w": week_ago})
    top_products = [{"name": r[0], "quantity": int(r[1]), "total": float(r[2])} for r in top_rows]

    low_rows = _query(LOCAL_DB, """
        SELECT p.name, p.min_stock, COALESCE(cs.quantity,0), p.unit
        FROM products p
        LEFT JOIN current_stock cs ON cs.product_id = p.id
        WHERE p.is_active = 1 AND COALESCE(cs.quantity,0) <= p.min_stock
        ORDER BY cs.quantity ASC LIMIT 10
    """)
    low_stock = [{"name": r[0], "min_stock": r[1], "current": float(r[2]), "unit": r[3]} for r in low_rows]

    debt_rows = _query(LOCAL_DB, """
        SELECT c.name, COALESCE(d.total,0)-COALESCE(p.total,0)
        FROM customers c
        LEFT JOIN (SELECT customer_id, SUM(amount) as total FROM customer_transactions WHERE type='debt' GROUP BY customer_id) d ON d.customer_id = c.id
        LEFT JOIN (SELECT customer_id, SUM(amount) as total FROM customer_transactions WHERE type='payment' GROUP BY customer_id) p ON p.customer_id = c.id
        WHERE c.is_active = 1 AND COALESCE(d.total,0)-COALESCE(p.total,0) > 0
        ORDER BY 2 DESC LIMIT 10
    """)
    debtors = [{"name": r[0], "balance": float(r[1])} for r in debt_rows]

    customers_rows = _query(LOCAL_DB, """
        SELECT c.id, c.name, COALESCE(d.total,0)-COALESCE(p.total,0)
        FROM customers c
        LEFT JOIN (SELECT customer_id, SUM(amount) as total FROM customer_transactions WHERE type='debt' GROUP BY customer_id) d ON d.customer_id = c.id
        LEFT JOIN (SELECT customer_id, SUM(amount) as total FROM customer_transactions WHERE type='payment' GROUP BY customer_id) p ON p.customer_id = c.id
        WHERE c.is_active = 1 AND COALESCE(d.total,0)-COALESCE(p.total,0) > 0
        ORDER BY 3 DESC
        LIMIT 50
    """)
    customers = [{"id": r[0], "name": r[1], "balance": float(r[2])} for r in customers_rows]

    pending_rows = _query(LOCAL_DB, """
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

    inventory = collect_inventory()

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
        "customers": customers,
        "pending_orders": pending_orders,
        "inventory": inventory,
    }


def collect_inventory() -> dict:
    try:
        rows = _query(LOCAL_DB, """
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
        total_count = _scalar(LOCAL_DB, "SELECT COUNT(*) FROM products WHERE is_active = 1")
        return {
            "products": products,
            "total": total_count,
            "truncated": len(products) < total_count,
        }
    except Exception:
        return None


def _push(data: dict):
    if not CONFIG_FILE.exists():
        return
    try:
        cfg = json.loads(CONFIG_FILE.read_text("utf-8"))
    except Exception:
        return
    api_url = cfg.get("api_url", "").rstrip("/")
    api_key = cfg.get("api_key", "")
    if not api_url or not api_key:
        return
    url = api_url + "/api/push"
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={
        "Content-Type": "application/json",
        "X-API-Key": api_key,
    })
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass


def push_to_cloud():
    try:
        data = collect_metrics()
        _push(data)
    except Exception:
        pass


def push_async():
    threading.Thread(target=push_to_cloud, daemon=True).start()
