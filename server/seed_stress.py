"""Seed masivo de productos para tests de estrés del backend.

Crea una DB NUEVA y separada (`tustock_stress.db`) con N productos realistas,
categorías, stock actual y una licencia activa, usando inserción masiva
(`executemany`) para que 100k productos tarden segundos, no minutos.

Uso:
    python seed_stress.py 10000
    python seed_stress.py 100000

La DB de producción (`tustock.db`) NO se toca: el env var TUSTOCK_DB apunta a
`tustock_stress.db` antes de importar `database`.
"""

import os
import sqlite3
import sys
import time
from datetime import date, datetime, timedelta, timezone
from random import Random

STRESS_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tustock_stress.db")

BRANDS = [
    "Marolio", "La Virginia", "Primor", "Baggio", "Serenisima", "Ledesma",
    "Terrabusi", "Bagley", "Arcor", "Milka", "Quilmes", "Coca Cola",
    "Danone", "Ilolay", "Molinos", "Nestle", "Pampers", "Zorro", "Colgate",
    "Carrefour",
]

CATEGORIES = [
    "Bebidas", "Almacen", "Limpieza", "Cuidado personal", "Snacks",
    "Lacteos", "Congelados", "Panaderia", "Verduleria", "Golosinas",
    "Galletitas", "Pastas", "Conservas", "Cereales", "Cafe e infusiones",
    "Libreria", "Perfumeria", "Ferreteria", "Mascotas", "Otros",
]


def seed(n: int) -> None:
    if os.path.exists(STRESS_DB):
        for suffix in ("", "-wal", "-shm"):
            p = STRESS_DB + suffix
            if os.path.exists(p):
                os.remove(p)

    os.environ["TUSTOCK_DB"] = "sqlite:///" + STRESS_DB.replace(os.sep, "/")

    from database import init_db

    init_db()

    conn = sqlite3.connect(STRESS_DB)
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA foreign_keys=ON")

    t0 = time.perf_counter()
    rng = Random(42)
    today = date.today()
    now_ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    conn.execute("BEGIN")

    cur.executemany(
        "INSERT INTO categories (name, parent_id) VALUES (?, NULL)",
        [(name,) for name in CATEGORIES],
    )

    products = []
    stock_rows = []
    for i in range(1, n + 1):
        roll = rng.random()
        if roll < 0.30:
            exp = today + timedelta(days=rng.randint(1, 30))
        elif roll < 0.70:
            exp = today + timedelta(days=rng.randint(31, 730))
        else:
            exp = None
        price = rng.randint(500, 50000)
        products.append((
            f"STRS-{i:06d}",
            f"Producto {i} - Marca {BRANDS[i % len(BRANDS)]}",
            "",
            rng.randint(1, len(CATEGORIES)),
            int(price * 0.6),
            price,
            rng.randint(1, 10),
            "unidad",
            f"779{i:010d}",
            1,
            exp.isoformat() if exp else None,
        ))
        stock_rows.append((i, float(rng.randint(0, 200))))

    cur.executemany(
        "INSERT INTO products (code, name, description, category_id, cost_price, "
        "selling_price, min_stock, unit, barcode, is_active, expiry_date) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        products,
    )
    cur.executemany(
        "INSERT INTO current_stock (product_id, quantity) VALUES (?, ?)",
        stock_rows,
    )

    cur.execute(
        "INSERT INTO licenses (key, plan, active, customer_name, max_products, "
        "reports_enabled, export_enabled, monitor_enabled, backup_enabled, "
        "eula_accepted, last_validated_at, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ("TST-STRESS-0001-AAAA", "basico", 1, "Test de estres", 999999, 1, 1, 0, 0,
         1, now_ts, now_ts, now_ts),
    )

    audit_items = []
    for a in range(1, 4):
        for j in range(1, 201):
            theo = rng.randint(0, 50)
            counted = max(0, theo + rng.randint(-3, 3))
            audit_items.append((a, j, float(theo), float(counted), float(counted - theo), None))
    cur.executemany(
        "INSERT INTO stock_audits (id, audit_date, status, created_by, created_at, completed_at) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        [(a, today.isoformat(), "completed", "stress", now_ts, now_ts) for a in range(1, 4)],
    )
    cur.executemany(
        "INSERT INTO audit_items (audit_id, product_id, theoretical_qty, counted_qty, "
        "difference, notes) VALUES (?, ?, ?, ?, ?, ?)",
        audit_items,
    )

    conn.commit()
    elapsed = time.perf_counter() - t0

    total = cur.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    lic = cur.execute("SELECT plan, active FROM licenses LIMIT 1").fetchone()
    conn.close()

    print(f"Seed OK: {total} productos en {elapsed:.2f}s | licencia: {lic[0]} (active={lic[1]})")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python seed_stress.py <cantidad>")
        sys.exit(1)
    try:
        seed(int(sys.argv[1]))
    except Exception as e:
        print(f"Error en seed: {e}")
        sys.exit(1)
