"""Benchmark HTTP de latencia de los endpoints del backend con DB de estrés.

Asume que el server YA está corriendo contra `tustock_stress.db`:

    $env:TUSTOCK_DB="sqlite:///tustock_stress.db"; cd E:/TUSTOCK/server; python main.py

Para cada endpoint hace ~30 requests (3 de calentamiento + 27 medidas), calcula
p50/p95/p99 y promedio, y repite la ronda con 5 threads simultáneos (simula
2-3 cajeros + monitor).

Uso:
    python benchmark_stress.py 10000

Solo usa stdlib (urllib, concurrent.futures, sqlite3) para leer los datos de la
DB de estrés y no depender de ninguna librería nueva.
"""

import json
import os
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = "http://127.0.0.1:8090"
TOKEN = "tustock-local-token"
STRESS_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tustock_stress.db")

WARM = 3
MEASURE = 27
THREADS = 5


def http(method: str, path: str, body: dict | None = None) -> tuple[float, int]:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        BASE + path,
        data=data,
        method=method,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    )
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            resp.read()
        return (time.perf_counter() - t0) * 1000.0, resp.status
    except urllib.error.HTTPError as e:
        try:
            e.read()
        except Exception:
            pass
        return (time.perf_counter() - t0) * 1000.0, e.code
    except Exception:
        return (time.perf_counter() - t0) * 1000.0, 0


def percentile(sorted_ms: list[float], p: float) -> float:
    if not sorted_ms:
        return 0.0
    k = (len(sorted_ms) - 1) * p / 100.0
    f = int(k)
    c = min(f + 1, len(sorted_ms) - 1)
    return sorted_ms[f] + (sorted_ms[c] - sorted_ms[f]) * (k - f)


def run_round(specs: list[dict], concurrent: bool) -> list[dict]:
    results = []
    for spec in specs:
        samples: list[float] = []
        errors = 0
        for _ in range(WARM):
            _, status = http(spec["method"], spec["path"], spec.get("body"))
        if not concurrent:
            for _ in range(MEASURE):
                ms, status = http(spec["method"], spec["path"], spec.get("body"))
                if status in (200, 201):
                    samples.append(ms)
                else:
                    errors += 1
        else:
            def worker(_):
                ms, status = http(spec["method"], spec["path"], spec.get("body"))
                return ms, status
            with ThreadPoolExecutor(max_workers=THREADS) as pool:
                for ms, status in pool.map(worker, range(MEASURE)):
                    if status in (200, 201):
                        samples.append(ms)
                    else:
                        errors += 1
        results.append({
            "name": spec["name"],
            "p50": percentile(sorted(samples), 50),
            "p95": percentile(sorted(samples), 95),
            "p99": percentile(sorted(samples), 99),
            "avg": sum(samples) / len(samples) if samples else 0.0,
            "errors": errors,
        })
    return results


def print_table(rows: list[dict], title: str) -> None:
    print(f"\n=== {title} ===")
    print(f"{'ENDPOINT':<26}{'p50':>9}{'p95':>9}{'p99':>9}{'avg':>9}{'err':>5}")
    for r in rows:
        print(f"{r['name']:<26}{r['p50']:>9.1f}{r['p95']:>9.1f}{r['p99']:>9.1f}{r['avg']:>9.1f}{r['errors']:>5}")


def build_specs(n: int) -> list[dict]:
    conn = sqlite3.connect(STRESS_DB)
    cur = conn.cursor()
    row = cur.execute("SELECT id, code, selling_price FROM products ORDER BY id LIMIT 3").fetchall()
    conn.close()
    p1, code1, price1 = row[0]
    p2, code2, price2 = row[1]
    p3, code3, price3 = row[2]

    q = urllib.parse.quote
    return [
        {"name": "products_search_pocos", "method": "GET",
         "path": f"/api/products?search={q(f'Producto {n // 2}')}&page=1&page_size=50"},
        {"name": "products_search_muchos", "method": "GET",
         "path": f"/api/products?search={q('Producto 5')}&page=1&page_size=50"},
        {"name": "products_list", "method": "GET", "path": "/api/products?page=1&page_size=50"},
        {"name": "products_scan", "method": "GET", "path": f"/api/products/scan/{code1}"},
        {"name": "products_near_expiry", "method": "GET",
         "path": "/api/products?near_expiry=30&page=1&page_size=5"},
        {"name": "stock_all", "method": "GET", "path": "/api/stock"},
        {"name": "sales_create", "method": "POST", "path": "/api/sales",
         "body": {
             "items": [
                 {"product_id": p1, "quantity": 1, "unit_price": float(price1)},
                 {"product_id": p2, "quantity": 2, "unit_price": float(price2)},
                 {"product_id": p3, "quantity": 1, "unit_price": float(price3)},
             ],
             "discount": 0.0,
             "payment_method": "efectivo",
             "cashier": "stress",
         }},
        {"name": "sales_history", "method": "GET", "path": "/api/sales?limit=50"},
        {"name": "audits_list", "method": "GET", "path": "/api/audits"},
    ]


def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python benchmark_stress.py <cantidad>")
        sys.exit(1)
    n = int(sys.argv[1])
    specs = build_specs(n)

    serial = run_round(specs, concurrent=False)
    print_table(serial, f"Ronda serial ({n} productos, {MEASURE} mediciones)")

    concurrent = run_round(specs, concurrent=True)
    print_table(concurrent, f"Ronda concurrente ({n} productos, {THREADS} threads)")


if __name__ == "__main__":
    main()
