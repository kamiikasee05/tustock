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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;background:#10131a;color:#e1e2ec;display:flex;justify-content:center;align-items:center;min-height:100vh;-webkit-font-smoothing:antialiased}
.login-wrapper{width:90%;max-width:380px}
.login-card{background:rgba(30,41,59,0.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px 32px}
.login-logo{font-size:24px;font-weight:900;color:#adc6ff;letter-spacing:-0.5px;margin-bottom:6px;text-align:center}
.login-sub{font-size:13px;color:#8b95a5;margin-bottom:28px;text-align:center;font-weight:500}
.error{color:#ffb4ab;font-size:13px;margin-bottom:14px;display:none;text-align:center;background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.2);border-radius:8px;padding:8px 12px}
label{font-size:12px;font-weight:600;color:#8b95a5;display:block;margin-bottom:6px;letter-spacing:0.3px}
input{width:100%;padding:12px 14px;background:rgba(11,14,21,0.6);border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:14px;font-family:inherit;color:#e1e2ec;margin-bottom:18px;outline:none;transition:border-color 0.2s}
input:focus{border-color:#4d8eff;box-shadow:0 0 0 2px rgba(77,142,255,0.2)}
input::placeholder{color:#424754}
button{width:100%;padding:13px;background:linear-gradient(135deg,#4d8eff,#3a6fdb);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;margin-top:4px}
button:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(77,142,255,0.3)}
button:active{transform:translateY(0)}
.login-footer{text-align:center;margin-top:20px;font-size:11px;color:#424754}
@media(max-width:420px){.login-card{padding:32px 24px}}
</style>
</head>
<body>
<div class="login-wrapper">
<div class="login-card">
<div class="login-logo">TUSTOCK</div>
<div class="login-sub">Monitor de Monitoreo Remoto</div>
<div id="error" class="error"></div>
<label>Usuario</label>
<input type="text" id="user" autofocus autocomplete="username">
<label>Contraseña</label>
<input type="password" id="pass" autocomplete="current-password" onkeydown="if(event.key==='Enter')login()">
<button onclick="login()">Ingresar</button>
</div>
<div class="login-footer">TUSTOCK &copy; 2026</div>
</div>
<script>
async function login(){
const u=document.getElementById('user').value.trim(),p=document.getElementById('pass').value.trim();
if(!u||!p)return;
const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
if(r.ok)window.location.reload();
else{const e=document.getElementById('error');e.style.display='block';e.textContent='Usuario o contraseña incorrectos'}
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
