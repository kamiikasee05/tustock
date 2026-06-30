"""Monitor Premium TUSTOCK — API read-only + dashboard responsive.

Puerto 8091. Expuesto vía Cloudflare Tunnel para acceso remoto.
Solo lectura. No expone el admin principal (puerto 8090).
"""

import json
import secrets
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, text as sa_text
from sqlalchemy.orm import Session, sessionmaker

from config import MONITOR_HOST, MONITOR_PORT, MONITOR_USER, MONITOR_PASS, DATABASE_URL, BASE_DIR

# ── DB ──────────────────────────────────────────────
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── App ─────────────────────────────────────────────
app = FastAPI(title="TUSTOCK Monitor", version="1.0.0")

# ── Sessions (cookie-based login) ───────────────────
_sessions: dict[str, str] = {}  # token -> username

def _check_auth(request: Request):
    token = request.cookies.get("session")
    if not token or token not in _sessions:
        raise HTTPException(401, "No autorizado")
    return True

# ── Login page ──────────────────────────────────────
LOGIN_HTML = r"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TUSTOCK Monitor</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f0f2f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{background:#fff;border-radius:16px;padding:40px;width:90%;max-width:380px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
h1{font-size:22px;margin-bottom:4px;color:#1a1a2e}
p{font-size:13px;color:#6b7280;margin-bottom:24px}
label{font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:4px}
input{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:16px}
button{width:100%;padding:12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}
button:hover{background:#1d4ed8}
.error{color:#dc2626;font-size:13px;margin-bottom:12px;display:none}
</style>
</head>
<body>
<div class="card">
<h1>TUSTOCK Monitor</h1>
<p>Acceso al panel de monitoreo remoto</p>
<div id="error" class="error"></div>
<label>Usuario</label>
<input type="text" id="user" autofocus>
<label>Contraseña</label>
<input type="password" id="pass" onkeydown="if(event.key==='Enter')login()">
<button onclick="login()">Ingresar</button>
</div>
<script>
async function login(){
const u=document.getElementById('user').value.trim(),p=document.getElementById('pass').value.trim();
if(!u||!p)return;
const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
if(r.ok)window.location.reload();
else document.getElementById('error').style.display='block',document.getElementById('error').textContent='Usuario o contraseña incorrectos'
}
</script>
</body>
</html>"""

@app.get("/")
def root(request: Request):
    token = request.cookies.get("session")
    if not token or token not in _sessions:
        return HTMLResponse(LOGIN_HTML)
    html = (BASE_DIR / "monitor" / "dashboard.html").read_text("utf-8")
    return HTMLResponse(html)

@app.get("/api/login")
def login_get():
    return JSONResponse({"ok": True})

@app.post("/api/login")
def login_post(data: dict):
    u = data.get("username", "")
    p = data.get("password", "")
    if u == MONITOR_USER and p == MONITOR_PASS:
        token = secrets.token_hex(32)
        _sessions[token] = u
        resp = JSONResponse({"ok": True})
        resp.set_cookie("session", token, httponly=True, max_age=86400 * 7, samesite="lax")
        return resp
    raise HTTPException(401, "Credenciales inválidas")

# ── API read-only ───────────────────────────────────
@app.get("/api/metrics")
def metrics(request: Request, db: Session = Depends(get_db)):
    _check_auth(request)
    today = date.today()
    now = datetime.now(timezone.utc)

    # Ventas hoy
    sales = db.execute(sa_text(
        "SELECT COUNT(*) as count, COALESCE(SUM(total),0) as total FROM sales WHERE sale_date = :d"
    ), {"d": today}).first()

    # Items vendidos hoy
    items_sold = db.execute(sa_text(
        "SELECT COALESCE(SUM(quantity),0) FROM sale_items si "
        "JOIN sales s ON s.id = si.sale_id WHERE s.sale_date = :d"
    ), {"d": today}).scalar() or 0

    # Ventas por método de pago hoy
    by_method = db.execute(sa_text(
        "SELECT payment_method, COUNT(*) as count, COALESCE(SUM(total),0) as total FROM sales "
        "WHERE sale_date = :d GROUP BY payment_method"
    ), {"d": today}).all()

    # Productos más vendidos (últimos 7 días)
    week_ago = date.today() - timedelta(days=7)
    top = db.execute(sa_text(
        "SELECT p.name, SUM(si.quantity) as qty, SUM(si.subtotal) as total FROM sale_items si "
        "JOIN sales s ON s.id = si.sale_id "
        "JOIN products p ON p.id = si.product_id "
        "WHERE s.sale_date >= :w "
        "GROUP BY si.product_id ORDER BY qty DESC LIMIT 5"
    ), {"w": week_ago}).all()

    # Stock bajo
    low = db.execute(sa_text(
        "SELECT p.name, p.min_stock, COALESCE(cs.quantity,0) as qty, p.unit FROM products p "
        "LEFT JOIN current_stock cs ON cs.product_id = p.id "
        "WHERE p.is_active = 1 AND COALESCE(cs.quantity,0) <= p.min_stock "
        "ORDER BY qty ASC LIMIT 10"
    )).all()

    # Clientes con deuda
    debts = db.execute(sa_text(
        "SELECT c.name, COALESCE(d.total,0) as debt, COALESCE(p.total,0) as paid, "
        "COALESCE(d.total,0)-COALESCE(p.total,0) as balance FROM customers c "
        "LEFT JOIN (SELECT customer_id, SUM(amount) as total FROM customer_transactions WHERE type='debt' GROUP BY customer_id) d ON d.customer_id = c.id "
        "LEFT JOIN (SELECT customer_id, SUM(amount) as total FROM customer_transactions WHERE type='payment' GROUP BY customer_id) p ON p.customer_id = c.id "
        "WHERE c.is_active = 1 AND COALESCE(d.total,0)-COALESCE(p.total,0) > 0 "
        "ORDER BY balance DESC LIMIT 10"
    )).all()

    return {
        "date": str(today),
        "server_time": now.isoformat(),
        "sales_today": {
            "count": sales.count,
            "total": float(sales.total),
            "items_sold": int(items_sold),
        },
        "by_method": [
            {"method": m.payment_method or "sin metodo", "count": m.count, "total": float(m.total)}
            for m in by_method
        ],
        "top_products": [
            {"name": t.name, "quantity": int(t.qty), "total": float(t.total)}
            for t in top
        ],
        "low_stock": [
            {"name": l.name, "min_stock": l.min_stock, "current": float(l.qty), "unit": l.unit}
            for l in low
        ],
        "debtors": [
            {"name": d.name, "balance": float(d.balance)}
            for d in debts
        ],
    }

@app.get("/api/metrics/summary")
def summary(request: Request, db: Session = Depends(get_db)):
    _check_auth(request)
    today = date.today()
    first_day = today.replace(day=1)

    # Ventas del mes
    month_sales = db.execute(sa_text(
        "SELECT COUNT(*) as count, COALESCE(SUM(total),0) as total FROM sales WHERE sale_date >= :d"
    ), {"d": first_day}).first()

    # Ventas hoy
    today_sales = db.execute(sa_text(
        "SELECT COUNT(*) as count, COALESCE(SUM(total),0) as total FROM sales WHERE sale_date = :d"
    ), {"d": today}).first()

    return {
        "today": {"count": today_sales.count, "total": float(today_sales.total)},
        "month": {"count": month_sales.count, "total": float(month_sales.total)},
    }

@app.get("/api/health")
def health():
    return {"status": "ok"}


# ── Main ────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=MONITOR_HOST, port=MONITOR_PORT, log_level="info")
