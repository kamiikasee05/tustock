"""Monitor Cloud TUSTOCK — API cloud con push, login multiusuario, dashboard.

Recibe datos del agente local (push), los almacena por negocio,
y los sirve via dashboard web con login JWT.
"""

import hashlib
import hmac as _hmac
import logging
import secrets
import json
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc

from audit import log_event
from config import CLOUD_HOST, CLOUD_PORT, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRY_DAYS, BASE_DIR, MP_ACCESS_TOKEN, MP_SUBS_TOKEN, ADMIN_TOKEN, MP_WEBHOOK_SECRET, MP_WEBHOOK_SECRET_SUBS
from payments import SUBSCRIPTION_PLAN_ID, SUBSCRIPTION_PLAN_PRICE, SUBSCRIPTION_PLAN_URL, update_plan_notification_url, get_subscription_plan
from models import init_db, get_db, Business, MetricsPush, Payment, AuthorizedKey, KeyActivation, Subscription, CommandQueue

import sys as _sys
if not JWT_SECRET:
    print("WARNING: TUSTOCK_JWT_SECRET no está configurado. Los tokens JWT no serán seguros.", file=_sys.stderr)

logger = logging.getLogger("tustock.cloud.webhook")

init_db()

_rate_limit_store: dict[str, list[datetime]] = defaultdict(list)


def _check_rate_limit(ip: str, max_attempts: int = 5, window_minutes: int = 15) -> bool:
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=window_minutes)
    _rate_limit_store[ip] = [t for t in _rate_limit_store[ip] if t > cutoff]
    if len(_rate_limit_store[ip]) >= max_attempts:
        return False
    _rate_limit_store[ip].append(now)
    return True

def _legal_page(title: str, content: str) -> HTMLResponse:
    return HTMLResponse(f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} - TUSTOCK</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:Inter,system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;line-height:1.7;padding:40px 24px}}
.container{{max-width:800px;margin:0 auto}}
h1{{font-size:28px;font-weight:900;margin-bottom:16px}}
p,li{{font-size:14px;color:#94a3b8;margin-bottom:8px}}
a{{color:#3b82f6}}
footer{{margin-top:48px;padding-top:24px;border-top:1px solid #334155;font-size:13px;color:#94a3b8}}
</style></head><body><div class="container">
<h1>{title}</h1>
{content}
<footer>TUSTOCK &copy; 2026 &mdash; <a href="https://tustocksoft.com.ar">Volver al inicio</a></footer>
</div></body></html>""")

app = FastAPI(title="TUSTOCK Cloud Monitor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tustocksoft.com.ar",
        "https://monitor.tustocksoft.com.ar",
        "http://localhost:5174",
        "http://localhost:8090",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


def verify_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer ") or not secrets.compare_digest(auth[7:], ADMIN_TOKEN):
        raise HTTPException(401, "Admin token invalido")


def _generate_key() -> str:
    raw = uuid.uuid4().hex[:16].upper()
    return f"TST-{raw[:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}"


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "tustock-cloud-monitor", "version": "1.0.0"}


@app.post("/api/register-from-install")
def register_from_install(data: dict, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else ""
    email = data.get("email", "").strip().lower()
    name = data.get("name", "").strip()

    if not email or not name:
        raise HTTPException(400, "email y name son requeridos")

    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(400, "Email inválido")

    if len(name) > 200:
        raise HTTPException(400, "Nombre muy largo (max 200 caracteres)")

    existing = db.query(Business).filter(Business.email == email).first()
    if existing:
        return {
            "ok": True,
            "api_key": existing.api_key,
            "email": email,
            "password": "",
            "message": "Email ya registrado. Usá la api_key existente.",
        }

    auto_password = f"TUSTOCK-{secrets.token_hex(4).upper()}"

    biz = Business(
        name=name,
        email=email,
        password_hash=_hash_password(auto_password),
        api_key=secrets.token_hex(32),
        terms_accepted=True,
        terms_accepted_at=datetime.now(timezone.utc),
    )
    db.add(biz)
    db.commit()
    db.refresh(biz)

    log_event("register_from_install", {"email": email, "business_id": biz.id}, ip)
    return {
        "ok": True,
        "api_key": biz.api_key,
        "email": email,
        "password": auto_password,
        "message": "Cuenta creada. Usá la api_key para configurar el agente.",
    }


@app.get("/api/admin/licenses")
def admin_list_licenses(request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    keys = db.query(AuthorizedKey).order_by(AuthorizedKey.created_at.desc()).all()
    return {
        "licenses": [
            {
                "id": ak.id,
                "key": ak.license_key,
                "plan": ak.plan,
                "customer_name": ak.customer_name or "",
                "active": ak.is_active,
                "expires_at": ak.expires_at.isoformat() if ak.expires_at else None,
                "created_at": ak.created_at.isoformat() if ak.created_at else None,
                "last_validated_at": None,
            }
            for ak in keys
        ]
    }


@app.post("/api/admin/generate")
def admin_generate_license(data: dict, request: Request, db: Session = Depends(get_db)):
    verify_admin(request)

    plan = data.get("plan", "basico")
    customer_name = data.get("customer_name", "").strip()
    expires_str = data.get("expires_at")

    if plan not in ("basico", "suscripcion", "pro", "trial"):
        raise HTTPException(400, "Plan invalido. Opciones: basico, suscripcion, pro, trial")
    if customer_name and len(customer_name) > 200:
        raise HTTPException(400, "Nombre de cliente muy largo (max 200 caracteres)")

    from datetime import date as _date, timedelta as _td
    expires_at = None
    if expires_str:
        try:
            expires_at = datetime.fromisoformat(expires_str)
        except ValueError:
            try:
                expires_at = datetime.combine(_date.fromisoformat(expires_str), datetime.min.time())
            except ValueError:
                raise HTTPException(400, "Formato de fecha invalido (YYYY-MM-DD)")
    if plan == "trial" and not expires_at:
        expires_at = datetime.combine(_date.today() + _td(days=30), datetime.min.time())

    key = _generate_key()
    ak = AuthorizedKey(
        license_key=key,
        plan=plan,
        customer_name=customer_name,
        is_active=True,
        expires_at=expires_at,
    )
    db.add(ak)
    db.commit()
    db.refresh(ak)

    return {
        "ok": True,
        "key": ak.license_key,
        "plan": ak.plan,
        "customer_name": ak.customer_name,
        "expires_at": ak.expires_at.isoformat() if ak.expires_at else None,
    }


@app.post("/api/admin/revoke/{license_key}")
def admin_revoke_license(license_key: str, request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    ak = db.query(AuthorizedKey).filter(AuthorizedKey.license_key == license_key).first()
    if not ak:
        raise HTTPException(404, "Licencia no encontrada")
    ak.is_active = False
    db.commit()
    return {"ok": True, "message": f"Licencia {license_key} revocada"}


@app.post("/api/admin/activate/{license_key}")
def admin_activate_license(license_key: str, request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    ak = db.query(AuthorizedKey).filter(AuthorizedKey.license_key == license_key).first()
    if not ak:
        raise HTTPException(404, "Licencia no encontrada")
    ak.is_active = True
    db.commit()
    return {"ok": True, "message": f"Licencia {license_key} activada"}


@app.delete("/api/admin/delete/{license_key}")
def admin_delete_license(license_key: str, request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    ak = db.query(AuthorizedKey).filter(AuthorizedKey.license_key == license_key).first()
    if not ak:
        raise HTTPException(404, "Licencia no encontrada")
    db.delete(ak)
    db.commit()
    return {"ok": True, "message": f"Licencia {license_key} eliminada"}


@app.get("/api/admin/stats")
def admin_stats(request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    from datetime import date as _date, timedelta as _td

    all_keys = db.query(AuthorizedKey).all()
    active_keys = [k for k in all_keys if k.is_active]
    by_plan = {}
    for k in all_keys:
        by_plan[k.plan] = by_plan.get(k.plan, 0) + 1

    PRICE = {"basico": 80000, "suscripcion": 8000, "pro": 160000, "trial": 0, "premium": 0}
    estimated_revenue = sum(PRICE.get(k.plan, 0) for k in active_keys)
    mrr = sum(PRICE.get(k.plan, 0) for k in active_keys if k.plan == "suscripcion")
    one_time = sum(PRICE.get(k.plan, 0) for k in active_keys if k.plan != "suscripcion")

    active_by_plan = {}
    for k in active_keys:
        active_by_plan[k.plan] = active_by_plan.get(k.plan, 0) + 1

    customers_with_names = sum(1 for k in active_keys if k.customer_name)

    today = _date.today()
    soon = today + _td(days=7)
    trials_expiring = [
        {
            "key": k.license_key,
            "customer_name": k.customer_name or "Sin nombre",
            "expires_at": k.expires_at.isoformat() if k.expires_at else None,
            "days_left": (k.expires_at.date() - today).days if k.expires_at else 0,
        }
        for k in active_keys
        if k.plan == "trial" and k.expires_at and today <= k.expires_at.date() <= soon
    ]

    return {
        "total": len(all_keys),
        "active": len(active_keys),
        "by_plan": by_plan,
        "revenue": {
            "estimated_total": estimated_revenue,
            "mrr": mrr,
            "one_time": one_time,
            "customers": customers_with_names,
        },
        "active_by_plan": active_by_plan,
        "trials_expiring": trials_expiring,
    }


@app.get("/api/licenses/terms")
def legal_terms():
    return _legal_page("Términos y Condiciones de Uso + EULA", """
<p>TUSTOCK es un sistema de gestión de stock y ventas para comercios argentinos.</p>
<h2>Licencia de Uso</h2>
<p>El software se concede en licencia, no se vende. El usuario acepta no modificar, descompilar, distribuir ni realizar ingeniería inversa del producto.</p>
<h2>Planes</h2>
<p>Los planes vigentes son: Trial (gratuito 30 días), Básico (pago único), Suscripción (mensual) y Pro (pago único). Las características de cada plan se detallan en el sitio oficial.</p>
<h2>Limitación de Responsabilidad</h2>
<p>El software se proporciona "tal cual". El proveedor no se responsabiliza por daños directos, indirectos o consecuentes derivados del uso del sistema, incluyendo pérdida de datos. El usuario es responsable de realizar backups periódicos.</p>
<h2>Derecho de Arrepentimiento</h2>
<p>Conforme al art. 34 de la Ley 24.240, el usuario dispone de 10 días hábiles desde la activación para solicitar el reembolso total. Transcurrido ese plazo, no se realizan reembolsos.</p>
<h2>Propiedad Intelectual</h2>
<p>Todos los derechos de propiedad intelectual pertenecen a TUSTOCK. El uso no autorizado constituye infracción a la Ley 11.723.</p>
<h2>Jurisdicción</h2>
<p>Las partes se someten a los Tribunales de la Ciudad Autónoma de Buenos Aires (CABA).</p>
<p><a href="https://tustocksoft.com.ar/legal/terminos-y-condiciones.html">Ver documento completo →</a></p>
""")


@app.get("/api/licenses/privacy")
def legal_privacy():
    return _legal_page("Política de Privacidad", """
<p>En TUSTOCK respetamos tu privacidad. Esta política describe qué datos recolectamos y cómo los tratamos.</p>
<h2>Datos Recolectados (Local)</h2>
<p>El sistema local no envía datos del negocio (productos, ventas, clientes) a ningún servidor externo. Toda la información permanece en la PC del usuario.</p>
<h2>Datos Recolectados (Cloud)</h2>
<p>Solo si el usuario se registra en el Monitor Cloud, recolectamos: nombre, email, contraseña cifrada, y métricas de ventas agregadas (totales diarios, no datos individuales de clientes).</p>
<h2>Finalidad</h2>
<p>Autenticación, visualización remota de métricas, validación de licencias, y mejora del servicio.</p>
<h2>Transferencia Internacional</h2>
<p>Los datos del Monitor Cloud se almacenan en servidores de Railway (Estados Unidos). Al registrarse, el usuario consiente esta transferencia.</p>
<h2>Derechos ARCO</h2>
<p>El usuario puede solicitar acceso, rectificación, cancelación u oposición escribiendo a <a href="mailto:tustock.administracion@gmail.com">tustock.administracion@gmail.com</a>.</p>
<h2>Registro AAIP</h2>
<p>Pendiente de inscripción en la Agencia de Acceso a la Información Pública conforme al art. 21 de la Ley 25.326.</p>
<p><a href="https://tustocksoft.com.ar/legal/politica-de-privacidad.html">Ver documento completo →</a></p>
""")


@app.get("/api/licenses/refund")
def legal_refund():
    return _legal_page("Política de Reembolso y Cancelación", """
<h2>Derecho de Arrepentimiento</h2>
<p>De acuerdo con el art. 34 de la Ley 24.240, el usuario dispone de un plazo de <strong>10 días hábiles</strong> desde la activación de la licencia para solicitar el reembolso total del importe abonado.</p>
<h2>Reembolso Proporcional</h2>
<p>Transcurridos los 10 días hábiles, no se realizarán reembolsos. En caso de defectos del software, se procederá a la corrección sin costo adicional o, si la corrección no es posible, al reembolso proporcional.</p>
<h2>Cancelación de Suscripción</h2>
<p>El usuario puede cancelar su suscripción mensual en cualquier momento. La cancelación no da derecho a reembolso del período ya facturado. El servicio continúa hasta el final del período pagado.</p>
<h2>Grace Period</h2>
<p>Ante un pago rechazado de suscripción, el usuario dispone de 7 días de gracia durante los cuales el sistema sigue funcionando, perdiendo únicamente updates y soporte prioritario.</p>
<h2>Cómo Solicitar</h2>
<p>Escribir a <a href="mailto:tustock.administracion@gmail.com">tustock.administracion@gmail.com</a> con el asunto "Reembolso" y el número de licencia. Se responderá en un máximo de 72 horas hábiles.</p>
<p><a href="https://tustocksoft.com.ar/legal/politica-de-reembolso.html">Ver documento completo →</a></p>
""")


@app.post("/api/register")
def register(data: dict, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else ""
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    accepts_terms = data.get("accepts_terms", False)

    if not name or not email or not password:
        raise HTTPException(400, "Faltan campos: name, email, password")
    if len(password) < 6:
        raise HTTPException(400, "La contraseña debe tener al menos 6 caracteres")
    if not _check_rate_limit(f"register:{ip}", max_attempts=3, window_minutes=30):
        log_event("register_rate_limited", {"email": email}, ip)
        raise HTTPException(429, "Demasiados intentos. Intentá de nuevo en unos minutos.")
    if db.query(Business).filter(Business.email == email).first():
        raise HTTPException(409, "El email ya está registrado")
    if not accepts_terms:
        raise HTTPException(400, "Debés aceptar los Términos y Condiciones y la Política de Privacidad")

    biz = Business(
        name=name,
        email=email,
        password_hash=_hash_password(password),
        api_key=secrets.token_hex(32),
        terms_accepted=True,
        terms_accepted_at=datetime.now(timezone.utc),
    )
    db.add(biz)
    db.commit()
    db.refresh(biz)

    log_event("register", {"email": email, "business_id": biz.id}, ip)
    return {
        "ok": True,
        "business_id": biz.id,
        "api_key": biz.api_key,
        "message": "Registro exitoso. Guardá tu API key para configurar el agente local.",
    }


@app.post("/api/login")
def login(data: dict, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else ""
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        raise HTTPException(400, "Faltan email o contraseña")

    if not _check_rate_limit(f"login:{ip}", max_attempts=5, window_minutes=15):
        log_event("login_rate_limited", {"email": email}, ip)
        raise HTTPException(429, "Demasiados intentos. Intentá de nuevo en unos minutos.")

    biz = db.query(Business).filter(Business.email == email, Business.is_active == True).first()
    if not biz or not _verify_password(password, biz.password_hash):
        log_event("login_failed", {"email": email, "reason": "wrong_password"}, ip)
        raise HTTPException(401, "Email o contraseña incorrectos")

    token = _create_token(biz.id, biz.email)
    log_event("login_success", {"email": email, "business_id": biz.id}, ip)
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

    log_event("push_metrics", {"api_key": api_key[:8], "business_id": biz.id})
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


@app.get("/api/inventory")
def get_inventory(
    page: int = 1,
    per_page: int = 20,
    search: str = "",
    category: str = "",
    low_only: bool = False,
    business: Business = Depends(_get_current_business),
    db: Session = Depends(get_db),
):
    last = db.query(MetricsPush).filter(
        MetricsPush.business_id == business.id
    ).order_by(desc(MetricsPush.pushed_at)).first()

    if not last or not last.payload or not last.payload.get("inventory"):
        return {"ok": True, "products": [], "total": 0, "page": 1, "per_page": per_page, "pages": 0, "categories": []}

    inventory = last.payload["inventory"]
    products = inventory.get("products", [])

    all_categories = sorted(set(p.get("category", "") for p in products if p.get("category")))

    if search:
        q = search.lower()
        products = [p for p in products if q in (p.get("name", "")).lower() or q in (p.get("code", "")).lower()]

    if category:
        products = [p for p in products if p.get("category") == category]

    if low_only:
        products = [p for p in products if p.get("stock", 0) <= p.get("min_stock", 0)]

    total = len(products)
    pages = max(1, (total + per_page - 1) // per_page)
    page = max(1, min(page, pages))
    start = (page - 1) * per_page
    products = products[start:start + per_page]

    return {
        "ok": True,
        "products": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
        "categories": all_categories,
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


@app.post("/api/business/delete-account")
def delete_account(data: dict, business: Business = Depends(_get_current_business), db: Session = Depends(get_db)):
    confirm = data.get("confirm", False)
    if not confirm:
        raise HTTPException(400, "Debés confirmar la eliminación de la cuenta")

    email = data.get("email", "").strip().lower()
    if email != business.email:
        raise HTTPException(400, "El email no coincide con la cuenta actual")

    db.query(MetricsPush).filter(MetricsPush.business_id == business.id).delete()
    business.name = "[CUENTA ELIMINADA]"
    business.email = f"deleted-{business.id}@tustock.com"
    business.password_hash = ""
    business.api_key = ""
    business.is_active = False
    db.commit()

    log_event("account_deleted", {"email": email, "business_id": business.id})
    return {"ok": True, "message": "Cuenta eliminada correctamente"}


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


@app.post("/api/payments/subscribe")
def create_subscription(data: dict, db: Session = Depends(get_db)):
    if not MP_SUBS_TOKEN:
        raise HTTPException(400, "Mercado Pago Suscripciones no configurado en el servidor")

    plan = data.get("plan", "suscripcion")
    price = data.get("price", 0)
    license_key = data.get("license_key", "")
    email = data.get("email", "").strip()

    if not email:
        raise HTTPException(400, "Email del cliente requerido para crear suscripcion")

    from payments import create_subscription as mp_create_sub
    result = mp_create_sub(MP_SUBS_TOKEN, plan, price, license_key, email)
    if not result.get("ok"):
        raise HTTPException(400, result.get("error", "Error al crear suscripción"))

    sub = Subscription(
        license_key=license_key,
        preapproval_id=result.get("preapproval_id"),
        plan=plan,
        price=price,
        init_point=result.get("init_point"),
        customer_email=email,
    )
    db.add(sub)
    db.commit()

    log_event("subscription_created", {"plan_id": result.get("preapproval_id"), "license_key": license_key, "email": email})
    return {
        "ok": True,
        "preapproval_id": result.get("preapproval_id"),
        "init_point": result.get("init_point"),
    }


@app.get("/api/plan/subscription")
def get_subscription_plan_info(db: Session = Depends(get_db)):
    if not MP_SUBS_TOKEN:
        raise HTTPException(400, "Mercado Pago Suscripciones no configurado")

    plan_info = get_subscription_plan(MP_SUBS_TOKEN, SUBSCRIPTION_PLAN_ID)
    unlinked = db.query(Subscription).filter(
        Subscription.license_key == "",
        Subscription.status != "cancelled"
    ).order_by(Subscription.created_at.desc()).all()

    return {
        "ok": True,
        "plan_id": SUBSCRIPTION_PLAN_ID,
        "plan_price": SUBSCRIPTION_PLAN_PRICE,
        "init_point": SUBSCRIPTION_PLAN_URL,
        "plan_status": plan_info.get("status", "unknown") if "error" not in plan_info else "unknown",
        "unlinked_subscriptions": [
            {
                "preapproval_id": s.preapproval_id,
                "status": s.status,
                "customer_email": s.customer_email,
                "paid_at": s.paid_at.isoformat() if s.paid_at else None,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in unlinked
        ],
    }


@app.post("/api/plan/update-webhook")
def update_plan_webhook(db: Session = Depends(get_db)):
    if not MP_SUBS_TOKEN:
        raise HTTPException(400, "Mercado Pago Suscripciones no configurado")

    webhook_url = "https://tustock.up.railway.app/api/payments/webhook?source_news=webhooks"
    result = update_plan_notification_url(MP_SUBS_TOKEN, SUBSCRIPTION_PLAN_ID, webhook_url)
    return result


@app.post("/api/plan/link-subscription")
def link_subscription_to_license(data: dict, db: Session = Depends(get_db)):
    preapproval_id = data.get("preapproval_id", "").strip()
    license_key = data.get("license_key", "").strip()

    if not preapproval_id or not license_key:
        raise HTTPException(400, "preapproval_id y license_key requeridos")

    sub = db.query(Subscription).filter(
        Subscription.preapproval_id == preapproval_id
    ).first()

    if not sub:
        raise HTTPException(404, "Suscripción no encontrada")

    if sub.license_key and sub.license_key != license_key:
        raise HTTPException(400, f"La suscripción ya está vinculada a la licencia {sub.license_key}")

    sub.license_key = license_key
    db.commit()

    log_event("subscription_linked", {"license_key": license_key, "subscription_id": preapproval_id})
    return {"ok": True, "preapproval_id": preapproval_id, "license_key": license_key}


@app.get("/api/payments/subscription-status/{license_key}")
def subscription_status(license_key: str, db: Session = Depends(get_db)):
    subs = db.query(Subscription).filter(
        Subscription.license_key == license_key
    ).order_by(Subscription.created_at.desc()).all()

    latest = subs[0] if subs else None
    now = datetime.now(timezone.utc)
    return {
        "license_key": license_key,
        "subscriptions": [
            {
                "preapproval_id": s.preapproval_id,
                "status": s.status,
                "price": s.price,
                "init_point": s.init_point,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "paid_at": s.paid_at.isoformat() if s.paid_at else None,
                "last_payment_status": s.last_payment_status,
                "grace_period_end": s.grace_period_end.isoformat() if s.grace_period_end else None,
                "grace_days_left": max((s.grace_period_end - now).days, 0) if s.grace_period_end and s.grace_period_end > now else 0,
            }
            for s in subs
        ],
        "status": latest.status if latest else "none",
    }


def verify_mp_signature(
    x_signature: str,
    x_request_id: str,
    data_id: str,
    secret: str,
) -> tuple:
    """Verifica la firma x-signature de Mercado Pago (HMAC-SHA256)."""
    meta = {"x_signature_present": bool(x_signature), "secret_present": bool(secret)}
    if not x_signature or not secret:
        return False, meta
    try:
        parts = {}
        for item in x_signature.split(","):
            if "=" in item:
                k, v = item.split("=", 1)
                parts[k.strip()] = v.strip()
        ts = parts.get("ts", "")
        v1 = parts.get("v1", "")
        meta["ts"] = ts
        if not ts or not v1:
            return False, meta
        manifest_parts = []
        if data_id:
            manifest_parts.append(f"id:{data_id}")
        if x_request_id:
            manifest_parts.append(f"request-id:{x_request_id}")
        manifest_parts.append(f"ts:{ts}")
        manifest = ";".join(manifest_parts) + ";"
        meta["manifest"] = manifest
        expected = _hmac.new(
            secret.encode("utf-8"),
            manifest.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        meta["match"] = _hmac.compare_digest(expected, v1)
        return meta["match"], meta
    except Exception as e:
        meta["error"] = str(e)
        return False, meta


@app.post("/api/payments/webhook")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    topic = request.query_params.get("topic", "")
    x_signature = request.headers.get("x-signature", "")
    x_request_id = request.headers.get("x-request-id", "")

    data_id = ""
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass

    data_block = body.get("data", {})
    if isinstance(data_block, dict):
        data_id = data_block.get("id", "")
    if not data_id:
        data_id = body.get("id", "")
    if not data_id:
        data_id = request.query_params.get("id", "")

    webhook_type = body.get("type", topic)
    if webhook_type in ("subscription_preapproval", "subscription_preapproval_plan", "authorized_payment") or topic in ("preapproval", "authorized_payment"):
        secret = MP_WEBHOOK_SECRET_SUBS
    else:
        secret = MP_WEBHOOK_SECRET

    if secret:
        sig_ok, sig_meta = verify_mp_signature(x_signature, x_request_id, str(data_id), secret)
        if not sig_ok:
            logger.warning("webhook signature verification failed | data_id=%s topic=%s meta=%s", data_id, topic, sig_meta)
        else:
            logger.info("webhook signature verified | data_id=%s topic=%s", data_id, topic)
    else:
        logger.warning("webhook received without MP_WEBHOOK_SECRET configured | data_id=%s topic=%s", data_id, topic)

    if x_signature and secret:
        try:
            ts_str = ""
            for item in x_signature.split(","):
                if "=" in item:
                    k, v = item.split("=", 1)
                    if k.strip() == "ts":
                        ts_str = v.strip()
            if ts_str:
                ts_val = int(ts_str)
                from time import time as _time
                age_seconds = _time() - ts_val
                if age_seconds > 300:
                    logger.warning("webhook timestamp is %d seconds old (>5min) | data_id=%s", age_seconds, data_id)
        except Exception:
            pass

    logger.info("webhook received | topic=%s type=%s data_id=%s", topic, webhook_type, data_id)

    if not data_id:
        return {"ok": False, "error": "No data.id"}

    if not MP_ACCESS_TOKEN and not MP_SUBS_TOKEN:
        return {"ok": False, "error": "MP no configurado"}

    from payments import get_subscription, get_payment

    if topic == "preapproval" or body.get("type") in ("subscription_preapproval", "subscription_preapproval_plan"):
        sub_data = get_subscription(MP_SUBS_TOKEN, str(data_id))
        if "error" in sub_data:
            return {"ok": False, "error": sub_data["error"]}

        lic_key = sub_data.get("external_reference", "")
        sub_status = sub_data.get("status", "")
        payer_email = sub_data.get("payer_email", "")
        plan_id = sub_data.get("preapproval_plan_id", "")

        sub = db.query(Subscription).filter(
            Subscription.preapproval_id == str(data_id)
        ).first()

        if sub:
            sub.status = sub_status
            if sub_status == "authorized" and not sub.paid_at:
                sub.paid_at = datetime.now(timezone.utc)
            db.commit()
        else:
            sub = Subscription(
                license_key=lic_key or "",
                preapproval_id=str(data_id),
                plan="suscripcion",
                price=SUBSCRIPTION_PLAN_PRICE,
                status=sub_status,
                customer_email=payer_email,
                init_point=f"https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id={plan_id}",
            )
            db.add(sub)
            if sub_status == "authorized":
                sub.paid_at = datetime.now(timezone.utc)
            db.commit()

        return {"ok": True, "type": "preapproval", "status": sub_status, "license_key": lic_key or "(sin asignar)", "preapproval_id": str(data_id)}

    if topic == "authorized_payment":
        pay_data = get_payment(MP_SUBS_TOKEN, str(data_id))
        if "error" in pay_data:
            return {"ok": False, "error": pay_data["error"]}

        lic_key = pay_data.get("external_reference", "")
        pay_status = pay_data.get("status", "")
        date_approved = pay_data.get("date_approved")

        sub = db.query(Subscription).filter(
            Subscription.license_key == lic_key,
            Subscription.status == "authorized"
        ).first()

        if sub:
            sub.last_payment_id = str(data_id)
            sub.last_payment_status = pay_status
            if pay_status == "approved":
                sub.paid_at = datetime.now(timezone.utc)
                sub.grace_period_end = None
            elif pay_status in ("rejected", "cancelled", "refunded", "charged_back"):
                sub.grace_period_end = datetime.now(timezone.utc) + timedelta(days=7)
            db.commit()

        return {"ok": True, "type": "authorized_payment", "status": pay_status, "license_key": lic_key}

    from payments import verify_webhook

    is_subscription_topic = topic == "payment" or body.get("type") in ("payment", "subscription_payment")
    webhook_token = MP_SUBS_TOKEN if is_subscription_topic else MP_ACCESS_TOKEN
    result = verify_webhook(webhook_token, str(data_id))
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

    if lic_key:
        sub = db.query(Subscription).filter(
            Subscription.license_key == lic_key,
            Subscription.status == "authorized"
        ).first()
        if sub and result.get("status") == "approved":
            sub.paid_at = datetime.now(timezone.utc)
            sub.last_payment_id = str(result.get("payment_id", ""))
            db.commit()

    return {"ok": True, "status": result.get("status", "unknown"), "license_key": lic_key}


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

    log_event("license_sync", {"license_key": key, "plan": plan})
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
        log_event("license_validate", {"license_key": key, "result": "invalid_key"}, "")
        return {"ok": False, "error": "invalid_key", "message": "Clave de licencia inválida"}
    if not ak.is_active:
        log_event("license_validate", {"license_key": key, "result": "revoked"}, "")
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
        "pro": {"max_products": 999999, "monitor_enabled": True, "reports_enabled": True, "export_enabled": True, "backup_enabled": False},
        "premium": {"max_products": 999999, "monitor_enabled": True, "reports_enabled": True, "export_enabled": True, "backup_enabled": False},
    }
    feat = features.get(ak.plan, features["trial"])

    subscription_grace_days_left = None
    subscription_suspended = False

    if ak.plan == "suscripcion":
        sub = db.query(Subscription).filter(
            Subscription.license_key == key,
            Subscription.status == "authorized"
        ).order_by(Subscription.created_at.desc()).first()

        if sub and sub.grace_period_end:
            now = datetime.now(timezone.utc)
            if sub.grace_period_end > now:
                subscription_grace_days_left = (sub.grace_period_end - now).days
            else:
                subscription_suspended = True

    log_event("license_validate", {"license_key": key, "result": "valid", "plan": ak.plan})
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
        "subscription_grace_days_left": subscription_grace_days_left,
        "subscription_suspended": subscription_suspended,
    }


@app.get("/")
def serve_app():
    file_path = BASE_DIR / "dashboard.html"
    if not file_path.exists():
        return HTMLResponse("<h1>Dashboard no encontrado</h1>", status_code=404)
    html = file_path.read_text("utf-8")
    return HTMLResponse(html)


@app.post("/api/pos/order")
async def pos_create_order(
    request: Request,
    business: Business = Depends(_get_current_business),
    db: Session = Depends(get_db),
):
    body = await request.json()
    items = body.get("items", [])
    payment_method = body.get("payment_method", "efectivo")
    customer_name = body.get("customer_name")
    customer_id = body.get("customer_id")
    notes = body.get("notes", "")

    if not items:
        raise HTTPException(400, "Sin items")
    if payment_method not in ("efectivo", "transferencia", "fiado", "mercadopago"):
        raise HTTPException(400, "Método de pago inválido")

    cmd = CommandQueue(
        business_id=business.id,
        command_type="direct_sale",
        payload={"items": items, "payment_method": payment_method, "customer_name": customer_name, "customer_id": customer_id, "notes": notes},
        status="pending",
    )
    db.add(cmd)
    db.commit()

    log_event("pos_order", {"business_id": business.id, "items_count": len(items)})
    return {"ok": True, "command_id": cmd.id, "message": "Pedido enviado — procesando..."}


@app.post("/api/pos/approve")
async def pos_approve_order(
    request: Request,
    business: Business = Depends(_get_current_business),
    db: Session = Depends(get_db),
):
    body = await request.json()
    order_id = body.get("order_id")
    payment_method = body.get("payment_method", "efectivo")

    if not order_id:
        raise HTTPException(400, "order_id requerido")

    cmd = CommandQueue(
        business_id=business.id,
        command_type="approve_order",
        payload={"order_id": order_id, "payment_method": payment_method},
        status="pending",
    )
    db.add(cmd)
    db.commit()

    log_event("pos_approve", {"business_id": business.id, "order_id": order_id})
    return {"ok": True, "command_id": cmd.id, "message": "Aprobación enviada"}


@app.post("/api/pos/reject")
async def pos_reject_order(
    request: Request,
    business: Business = Depends(_get_current_business),
    db: Session = Depends(get_db),
):
    body = await request.json()
    order_id = body.get("order_id")

    if not order_id:
        raise HTTPException(400, "order_id requerido")

    cmd = CommandQueue(
        business_id=business.id,
        command_type="reject_order",
        payload={"order_id": order_id},
        status="pending",
    )
    db.add(cmd)
    db.commit()

    log_event("pos_reject", {"business_id": business.id, "order_id": order_id})
    return {"ok": True, "command_id": cmd.id, "message": "Rechazo enviado"}


@app.get("/api/pos/pending-orders")
def pos_pending_orders(
    business: Business = Depends(_get_current_business),
    db: Session = Depends(get_db),
):
    last = db.query(MetricsPush).filter(
        MetricsPush.business_id == business.id
    ).order_by(desc(MetricsPush.pushed_at)).first()

    if not last or not last.payload:
        return {"orders": []}

    orders = last.payload.get("pending_orders", [])
    return {"orders": orders}


@app.get("/api/commands/pending")
def get_pending_commands(
    request: Request,
    db: Session = Depends(get_db),
):
    api_key = request.headers.get("X-API-Key", "") or request.query_params.get("api_key", "")
    business = db.query(Business).filter(Business.api_key == api_key).first()
    if not business:
        raise HTTPException(401, "API key inválida")

    commands = db.query(CommandQueue).filter(
        CommandQueue.business_id == business.id,
        CommandQueue.status == "pending",
    ).order_by(CommandQueue.created_at).all()

    for cmd in commands:
        cmd.status = "executing"
    db.commit()

    return {
        "commands": [
            {
                "id": cmd.id,
                "command_type": cmd.command_type,
                "payload": cmd.payload,
                "created_at": cmd.created_at.isoformat() if cmd.created_at else None,
            }
            for cmd in commands
        ]
    }


@app.post("/api/commands/{cmd_id}/ack")
async def ack_command(
    cmd_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    api_key = request.headers.get("X-API-Key", "") or request.query_params.get("api_key", "")
    business = db.query(Business).filter(Business.api_key == api_key).first()
    if not business:
        raise HTTPException(401, "API key inválida")

    body = {}
    try:
        body = await request.json()
    except Exception:
        pass

    cmd = db.query(CommandQueue).filter(
        CommandQueue.id == cmd_id,
        CommandQueue.business_id == business.id,
    ).first()

    if not cmd:
        raise HTTPException(404, "Comando no encontrado")

    if body.get("ok"):
        cmd.status = "completed"
        cmd.result = body.get("result")
    else:
        cmd.status = "failed"
        cmd.error_message = body.get("error", "Error desconocido")

    cmd.executed_at = datetime.now(timezone.utc)
    db.commit()

    return {"ok": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=CLOUD_HOST, port=CLOUD_PORT, log_level="info")
