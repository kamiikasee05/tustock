"""Monitor Cloud TUSTOCK — API cloud con push, login multiusuario, dashboard.

Recibe datos del agente local (push), los almacena por negocio,
y los sirve via dashboard web con login JWT.
"""

import hashlib
import secrets
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc

from config import CLOUD_HOST, CLOUD_PORT, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRY_DAYS, BASE_DIR, MP_ACCESS_TOKEN
from models import init_db, get_db, Business, MetricsPush, Payment, AuthorizedKey, KeyActivation

init_db()

app = FastAPI(title="TUSTOCK Cloud Monitor", version="1.0.0")


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64)
    return salt + ":" + h.hex()


def _verify_password(password: str, stored: str) -> bool:
    salt, hx = stored.split(":", 1)
    h = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64)
    return h.hex() == hx


def _create_token(business_id: int, email: str) -> str:
    payload = {
        "business_id": business_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _get_business_from_token(token: str, db: Session) -> Business:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token inválido")
    biz = db.query(Business).filter(Business.id == payload["business_id"], Business.is_active == True).first()
    if not biz:
        raise HTTPException(401, "Negocio no encontrado")
    return biz


def _get_current_business(request: Request, db: Session = Depends(get_db)) -> Business:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requerido")
    return _get_business_from_token(auth[7:], db)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "tustock-cloud-monitor", "version": "1.0.0"}


@app.post("/api/register")
def register(data: dict, db: Session = Depends(get_db)):
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        raise HTTPException(400, "Faltan campos: name, email, password")
    if len(password) < 6:
        raise HTTPException(400, "La contraseña debe tener al menos 6 caracteres")
    if db.query(Business).filter(Business.email == email).first():
        raise HTTPException(409, "El email ya está registrado")

    biz = Business(
        name=name,
        email=email,
        password_hash=_hash_password(password),
        api_key=secrets.token_hex(32),
    )
    db.add(biz)
    db.commit()
    db.refresh(biz)

    return {
        "ok": True,
        "business_id": biz.id,
        "api_key": biz.api_key,
        "message": "Registro exitoso. Guardá tu API key para configurar el agente local.",
    }


@app.post("/api/login")
def login(data: dict, db: Session = Depends(get_db)):
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        raise HTTPException(400, "Faltan email o contraseña")

    biz = db.query(Business).filter(Business.email == email, Business.is_active == True).first()
    if not biz or not _verify_password(password, biz.password_hash):
        raise HTTPException(401, "Email o contraseña incorrectos")

    token = _create_token(biz.id, biz.email)
    return {"ok": True, "token": token, "business_name": biz.name}


@app.post("/api/push")
def push(data: dict, request: Request, db: Session = Depends(get_db)):
    api_key = request.headers.get("X-API-Key", "")
    if not api_key:
        raise HTTPException(401, "API key requerida")

    biz = db.query(Business).filter(Business.api_key == api_key, Business.is_active == True).first()
    if not biz:
        raise HTTPException(401, "API key inválida")

    push = MetricsPush(business_id=biz.id, payload=data)
    db.add(push)
    db.commit()

    return {"ok": True, "pushed_at": datetime.now(timezone.utc).isoformat()}


@app.get("/api/metrics")
def metrics(business: Business = Depends(_get_current_business), db: Session = Depends(get_db)):
    last = db.query(MetricsPush).filter(
        MetricsPush.business_id == business.id
    ).order_by(desc(MetricsPush.pushed_at)).first()

    if not last:
        return {
            "ok": True,
            "has_data": False,
            "message": "El negocio aún no ha enviado datos. Configurá el agente local.",
            "last_push": None,
            "data": None,
        }

    return {
        "ok": True,
        "has_data": True,
        "last_push": last.pushed_at.isoformat() if last.pushed_at else None,
        "data": last.payload,
    }


@app.get("/api/business")
def get_business(business: Business = Depends(_get_current_business)):
    return {
        "id": business.id,
        "name": business.name,
        "email": business.email,
        "api_key": business.api_key,
    }


@app.get("/api/regenerate-key")
def regenerate_key(business: Business = Depends(_get_current_business), db: Session = Depends(get_db)):
    business.api_key = secrets.token_hex(32)
    db.commit()
    return {"ok": True, "api_key": business.api_key}


@app.post("/api/payments/create")
def create_payment(data: dict, db: Session = Depends(get_db)):
    if not MP_ACCESS_TOKEN:
        raise HTTPException(400, "Mercado Pago no configurado en el servidor")

    plan = data.get("plan", "basico")
    price = data.get("price", 0)
    license_key = data.get("license_key", "")
    email = data.get("email", "")

    from payments import create_preference
    result = create_preference(MP_ACCESS_TOKEN, plan, price, license_key, email)
    if not result.get("ok"):
        raise HTTPException(400, result.get("error", "Error al crear preferencia"))

    payment = Payment(
        license_key=license_key,
        plan=plan,
        price=price,
        preference_id=result["preference_id"],
        init_point=result["init_point"],
        customer_email=email,
    )
    db.add(payment)
    db.commit()

    return {
        "ok": True,
        "preference_id": result["preference_id"],
        "init_point": result["init_point"],
    }


@app.post("/api/payments/webhook")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        return {"ok": False, "error": "Invalid JSON"}

    data_id = body.get("data", {}).get("id") if isinstance(body.get("data"), dict) else body.get("data", {}).get("id", "")

    if not data_id and "id" in body:
        data_id = body["id"]

    if not data_id:
        return {"ok": False, "error": "No data.id"}

    if not MP_ACCESS_TOKEN:
        return {"ok": False, "error": "MP no configurado"}

    from payments import verify_webhook
    result = verify_webhook(MP_ACCESS_TOKEN, str(data_id))
    if not result.get("ok"):
        return {"ok": False, "error": result.get("error")}

    lic_key = result.get("external_reference", "")
    payment = db.query(Payment).filter(Payment.preference_id == result.get("preference_id")).first()
    if not payment and lic_key:
        payment = db.query(Payment).filter(Payment.license_key == lic_key).order_by(Payment.created_at.desc()).first()

    if payment:
        payment.status = result["status"]
        payment.payment_id = str(result.get("payment_id", ""))
        if result["status"] == "approved":
            payment.paid_at = datetime.now(timezone.utc)
        db.commit()

    return {"ok": True, "status": result["status"], "license_key": lic_key}


@app.get("/api/payments/status/{license_key}")
def payment_status(license_key: str, db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(
        Payment.license_key == license_key
    ).order_by(Payment.created_at.desc()).all()

    latest = payments[0] if payments else None
    return {
        "license_key": license_key,
        "payments": [
            {
                "preference_id": p.preference_id,
                "status": p.status,
                "plan": p.plan,
                "price": p.price,
                "init_point": p.init_point,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "paid_at": p.paid_at.isoformat() if p.paid_at else None,
            }
            for p in payments
        ],
        "status": latest.status if latest else "none",
    }


@app.post("/api/licenses/sync")
def sync_license(data: dict, db: Session = Depends(get_db)):
    key = data.get("license_key", "").strip()
    plan = data.get("plan", "basico")
    customer_name = data.get("customer_name", "")

    if not key:
        raise HTTPException(400, "license_key requerido")

    existing = db.query(AuthorizedKey).filter(AuthorizedKey.license_key == key).first()
    if existing:
        existing.plan = plan
        existing.customer_name = customer_name or existing.customer_name
    else:
        ak = AuthorizedKey(license_key=key, plan=plan, customer_name=customer_name)
        db.add(ak)
    db.commit()
    return {"ok": True, "key": key}


@app.post("/api/licenses/validate")
def validate_license(data: dict, db: Session = Depends(get_db)):
    key = data.get("license_key", "").strip()
    machine_id = data.get("machine_id", "")
    hostname = data.get("hostname", "")

    if not key:
        raise HTTPException(400, "license_key requerido")

    ak = db.query(AuthorizedKey).filter(AuthorizedKey.license_key == key).first()
    if not ak:
        return {"ok": False, "error": "invalid_key", "message": "Clave de licencia inválida"}
    if not ak.is_active:
        return {"ok": False, "error": "revoked", "message": "La licencia fue revocada"}

    if machine_id:
        activation = db.query(KeyActivation).filter(
            KeyActivation.license_key == key,
            KeyActivation.machine_id == machine_id,
        ).first()
        if not activation:
            activation = KeyActivation(
                license_key=key,
                machine_id=machine_id,
                hostname=hostname,
            )
            db.add(activation)
            db.commit()

    features = {
        "trial": {"max_products": 100, "monitor_enabled": False, "reports_enabled": False, "export_enabled": False, "backup_enabled": False},
        "basico": {"max_products": 999999, "monitor_enabled": False, "reports_enabled": True, "export_enabled": True, "backup_enabled": False},
        "suscripcion": {"max_products": 999999, "monitor_enabled": True, "reports_enabled": True, "export_enabled": True, "backup_enabled": False},
        "pro": {"max_products": 999999, "monitor_enabled": True, "reports_enabled": True, "export_enabled": True, "backup_enabled": True},
        "premium": {"max_products": 999999, "monitor_enabled": True, "reports_enabled": True, "export_enabled": True, "backup_enabled": False},
    }
    feat = features.get(ak.plan, features["trial"])

    return {
        "ok": True,
        "plan": ak.plan,
        "plan_name": {"basico": "Basico", "pro": "Pro", "suscripcion": "Suscripcion", "trial": "Trial"}.get(ak.plan, ak.plan),
        "customer_name": ak.customer_name,
        "monitor_enabled": feat.get("monitor_enabled", False),
        "reports_enabled": feat.get("reports_enabled", True),
        "export_enabled": feat.get("export_enabled", False),
        "backup_enabled": feat.get("backup_enabled", False),
        "max_products": feat.get("max_products", 999999),
    }


@app.get("/")
def serve_app():
    file_path = BASE_DIR / "dashboard.html"
    if not file_path.exists():
        return HTMLResponse("<h1>Dashboard no encontrado</h1>", status_code=404)
    html = file_path.read_text("utf-8")
    return HTMLResponse(html)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=CLOUD_HOST, port=CLOUD_PORT, log_level="info")
