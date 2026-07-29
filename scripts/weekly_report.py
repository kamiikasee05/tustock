"""Genera reporte semanal de TUSTOCK desde el Cloud API.

Uso:
    python scripts/weekly_report.py

Lee TUSTOCK_ADMIN_TOKEN de server/.env o variable de entorno.
Genera docs/reports/weekly-YYYY-MM-DD.md.
"""

import json
import os
import sys
import subprocess
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError

BASE_DIR = Path(__file__).resolve().parent.parent
REPORTS_DIR = BASE_DIR / "docs" / "reports"
ENV_FILE = BASE_DIR / "server" / ".env"


def _load_admin_token() -> str:
    token = os.environ.get("TUSTOCK_ADMIN_TOKEN", "")
    if token:
        return token
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text("utf-8").splitlines():
            line = line.strip()
            if line.startswith("TUSTOCK_ADMIN_TOKEN="):
                val = line.split("=", 1)[1].strip().strip("\"'")
                if val:
                    return val
    return ""


def _fetch_analytics(admin_token: str, cloud_url: str) -> dict:
    url = f"{cloud_url.rstrip('/')}/api/admin/analytics/weekly"
    req = Request(url, headers={"Authorization": f"Bearer {admin_token}"})
    try:
        with urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            if not data.get("ok"):
                return {"error": data.get("error", "API devolvio ok=false")}
            return data
    except URLError as e:
        return {"error": f"Error de conexion: {e.reason}"}
    except Exception as e:
        return {"error": str(e)}


def _format_currency(val: float) -> str:
    return f"${val:,.0f}"


def _generate_markdown(data: dict) -> str:
    now = datetime.now().strftime("%d/%m/%Y %H:%M")
    period_from = data.get("period", {}).get("from", "?")
    period_to = data.get("period", {}).get("to", "?")
    summary = data.get("summary", {})
    businesses = data.get("businesses", [])

    lines = []
    lines.append(f"# Reporte Semanal TUSTOCK")
    lines.append(f"")
    lines.append(f"**Generado:** {now}")
    lines.append(f"**Periodo:** {period_from} → {period_to}")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Resumen Ejecutivo")
    lines.append(f"")
    lines.append(f"| Métrica | Valor |")
    lines.append(f"|---------|-------|")
    lines.append(f"| Negocios activos | {summary.get('active_businesses', 0)} / {summary.get('total_businesses', 0)} |")
    lines.append(f"| Total pushes | {summary.get('total_pushes', 0)} |")
    lines.append(f"| Ventas totales | {summary.get('total_sales', 0)} |")
    lines.append(f"| Ingresos totales | {_format_currency(summary.get('total_revenue', 0))} |")
    lines.append(f"| Valor inventario total | {_format_currency(summary.get('total_inventory_value', 0))} |")
    unhealthy = summary.get("unhealthy_businesses", [])
    if unhealthy:
        lines.append(f"| Negocios con alertas | {len(unhealthy)} |")
    lines.append(f"")

    lines.append(f"## Salud por Cliente")
    lines.append(f"")
    lines.append(f"| Cliente | Plan | Estado | Último push | Ventas 7d | Ingresos | Alertas |")
    lines.append(f"|---------|------|--------|-------------|-----------|----------|---------|")
    for b in businesses:
        name = b.get("name", "?")
        plan = b.get("plan", "?")
        health = b.get("health", {})
        status = health.get("status", "?")
        status_icon = {"healthy": "🟢", "warning": "🟡", "inactive": "🔴"}.get(status, "⚪")
        last_push = b.get("metrics", {}).get("last_push", "?")
        if last_push and len(last_push) > 16:
            last_push = last_push[:16].replace("T", " ")
        sales_count = b.get("metrics", {}).get("total_sales_count", 0)
        revenue = b.get("metrics", {}).get("total_sales_revenue", 0)
        issues = "; ".join(health.get("issues", [])) or "—"
        lines.append(f"| {name} | {plan} | {status_icon} {status} | {last_push} | {sales_count} | {_format_currency(revenue)} | {issues} |")
    lines.append(f"")

    sorted_by_activity = sorted(
        businesses,
        key=lambda b: b.get("metrics", {}).get("total_pushes", 0),
        reverse=True,
    )
    lines.append(f"## Ranking de Actividad")
    lines.append(f"")
    lines.append(f"| # | Cliente | Pushes 7d | Intervalo (s) | Ventas | Ingresos |")
    lines.append(f"|---|---------|-----------|---------------|--------|----------|")
    for i, b in enumerate(sorted_by_activity, 1):
        name = b.get("name", "?")
        m = b.get("metrics", {})
        pushes = m.get("total_pushes", 0)
        interval = m.get("avg_push_interval_seconds", 0)
        sales = m.get("total_sales_count", 0)
        revenue = m.get("total_sales_revenue", 0)
        lines.append(f"| {i} | {name} | {pushes} | {interval}s | {sales} | {_format_currency(revenue)} |")
    lines.append(f"")

    global_top = {}
    for b in businesses:
        for tp in b.get("metrics", {}).get("top_products", []):
            name = tp.get("name", "")
            qty = tp.get("quantity", 0)
            rev = tp.get("revenue", 0)
            if name:
                if name not in global_top:
                    global_top[name] = {"name": name, "quantity": 0, "revenue": 0.0}
                global_top[name]["quantity"] += qty
                global_top[name]["revenue"] += rev

    if global_top:
        lines.append(f"## Top Productos Vendidos (Global)")
        lines.append(f"")
        lines.append(f"| Producto | Cantidad | Ingresos |")
        lines.append(f"|----------|----------|----------|")
        sorted_products = sorted(global_top.values(), key=lambda x: x["quantity"], reverse=True)[:10]
        for p in sorted_products:
            lines.append(f"| {p['name']} | {p['quantity']} | {_format_currency(p['revenue'])} |")
        lines.append(f"")

    alerts = []
    for b in businesses:
        name = b.get("name", "?")
        health = b.get("health", {})
        m = b.get("metrics", {})
        if health.get("status") == "inactive":
            alerts.append(f"- **{name}** — Cliente inactivo. Sin datos en 7 días.")
        elif health.get("status") == "warning":
            alerts.append(f"- **{name}** — Último push hace más de 1 hora.")
        low_stock = m.get("low_stock_count", 0)
        if low_stock > 0:
            alerts.append(f"- **{name}** — {low_stock} productos con stock bajo.")
        zero_stock = m.get("zero_stock_count", 0)
        if zero_stock > 0:
            alerts.append(f"- **{name}** — {zero_stock} productos sin stock.")

    if alerts:
        lines.append(f"## Alertas")
        lines.append(f"")
        for a in alerts:
            lines.append(a)
        lines.append(f"")

    lines.append(f"---")
    lines.append(f"*Reporte generado automáticamente por TUSTOCK Analytics.*")
    lines.append(f"")

    return "\n".join(lines)


def _send_ntfy():
    ps_script = BASE_DIR / "scripts" / "send-ntfy.ps1"
    if ps_script.exists():
        try:
            subprocess.run(
                [
                    "powershell",
                    "-ExecutionPolicy", "Bypass",
                    "-File", str(ps_script),
                    "-Title", "📊 Reporte Semanal TUSTOCK",
                    "-Message", "Reporte generado en docs/reports/",
                    "-Priority", "3",
                    "-Tags", "bar_chart",
                ],
                capture_output=True,
                timeout=15,
            )
        except Exception:
            pass


def main():
    admin_token = _load_admin_token()
    if not admin_token:
        print("ERROR: TUSTOCK_ADMIN_TOKEN no configurado.")
        print("Setear TUSTOCK_ADMIN_TOKEN en server/.env o variable de entorno.")
        sys.exit(1)

    cloud_url = os.environ.get("TUSTOCK_CLOUD_URL", "https://tustock.up.railway.app")
    print(f"Obteniendo analytics de {cloud_url}...")
    data = _fetch_analytics(admin_token, cloud_url)

    if "error" in data:
        print(f"ERROR: {data['error']}")
        sys.exit(1)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    today_str = date.today().strftime("%Y-%m-%d")
    report_path = REPORTS_DIR / f"weekly-{today_str}.md"
    markdown = _generate_markdown(data)
    report_path.write_text(markdown, "utf-8")
    print(f"Reporte generado: {report_path}")

    summary = data.get("summary", {})
    print(f"  Negocios: {summary.get('active_businesses')}/{summary.get('total_businesses')} activos")
    print(f"  Ventas: {summary.get('total_sales')} — Ingresos: ${summary.get('total_revenue', 0):.0f}")

    _send_ntfy()
    print("Notificacion ntfy enviada.")


if __name__ == "__main__":
    main()
