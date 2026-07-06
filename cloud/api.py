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
from payments import SUBSCRIPTION_PLAN_ID, SUBSCRIPTION_PLAN_PRICE, SUBSCRIPTION_PLAN_URL, update_plan_notification_url, get_subscription_plan
from models import init_db, get_db, Business, MetricsPush, Payment, AuthorizedKey, KeyActivation, Subscription

init_db()

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
<footer>TUSTOCK &copy; 2026 &mdash; <a href="https://kamiikasee05.github.io/tustock">Volver al inicio</a></footer>
</div></body></html>""")

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


@app.get("/api/licenses/terms")
def legal_terms():
    return _legal_page("Términos y Condiciones de Uso + EULA", """
<p>TUSTOCK es un sistema de gestión de stock y ventas para comercios argentinos, desarrollado por <strong>Kamiikaze Desarrollos</strong>.</p>
<h2>Licencia de Uso</h2>
<p>El software se concede en licencia, no se vende. El usuario acepta no modificar, descompilar, distribuir ni realizar ingeniería inversa del producto.</p>
<h2>Planes</h2>
<p>Los planes vigentes son: Trial (gratuito 30 días), Básico (pago único), Suscripción (mensual) y Pro (pago único). Las características de cada plan se detallan en el sitio oficial.</p>
<h2>Limitación de Responsabilidad</h2>
<p>El software se proporciona "tal cual". El proveedor no se responsabiliza por daños directos, indirectos o consecuentes derivados del uso del sistema, incluyendo pérdida de datos. El usuario es responsable de realizar backups periódicos.</p>
<h2>Derecho de Arrepentimiento</h2>
<p>Conforme al art. 34 de la Ley 24.240, el usuario dispone de 10 días hábiles desde la activación para solicitar el reembolso total. Transcurrido ese plazo, no se realizan reembolsos.</p>
<h2>Propiedad Intelectual</h2>
<p>Todos los derechos de propiedad intelectual pertenecen a Kamiikaze Desarrollos. El uso no autorizado constituye infracción a la Ley 11.723.</p>
<h2>Jurisdicción</h2>
<p>Las partes se someten a los Tribunales de la Ciudad Autónoma de Buenos Aires (CABA).</p>
<p><a href="https://kamiikasee05.github.io/tustock/legal/terminos-y-condiciones.html">Ver documento completo →</a></p>
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
<p>El usuario puede solicitar acceso, rectificación, cancelación u oposición escribiendo a <a href="mailto:kamiikasee05@gmail.com">kamiikasee05@gmail.com</a>.</p>
<h2>Registro AAIP</h2>
<p>Pendiente de inscripción en la Agencia de Acceso a la Información Pública conforme al art. 21 de la Ley 25.326.</p>
<p><a href="https://kamiikasee05.github.io/tustock/legal/politica-de-privacidad.html">Ver documento completo →</a></p>
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
<p>Escribir a <a href="mailto:kamiikasee05@gmail.com">kamiikasee05@gmail.com</a> con el asunto "Reembolso" y el número de licencia. Se responderá en un máximo de 72 horas hábiles.</p>
<p><a href="https://kamiikasee05.github.io/tustock/legal/politica-de-reembolso.html">Ver documento completo →</a></p>
""")


@app.post("/api/register")
def register(data: dict, db: Session = Depends(get_db)):
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    accepts_terms = data.get("accepts_terms", False)

    if not name or not email or not password:
        raise HTTPException(400, "Faltan campos: name, email, password")
    if len(password) < 6:
        raise HTTPException(400, "La contraseña debe tener al menos 6 caracteres")
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
    if not MP_ACCESS_TOKEN:
        raise HTTPException(400, "Mercado Pago no configurado en el servidor")

    plan = data.get("plan", "suscripcion")
    price = data.get("price", 0)
    license_key = data.get("license_key", "")
    email = data.get("email", "").strip()

    if not email:
        raise HTTPException(400, "Email del cliente requerido para crear suscripcion")

    from payments import create_subscription as mp_create_sub
    result = mp_create_sub(MP_ACCESS_TOKEN, plan, price, license_key, email)
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

    return {
        "ok": True,
        "preapproval_id": result.get("preapproval_id"),
        "init_point": result.get("init_point"),
    }


@app.get("/api/plan/subscription")
def get_subscription_plan_info(db: Session = Depends(get_db)):
    if not MP_ACCESS_TOKEN:
        raise HTTPException(400, "Mercado Pago no configurado")

    plan_info = get_subscription_plan(MP_ACCESS_TOKEN, SUBSCRIPTION_PLAN_ID)
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
    if not MP_ACCESS_TOKEN:
        raise HTTPException(400, "Mercado Pago no configurado")

    webhook_url = "https://tustock.up.railway.app/api/payments/webhook"
    result = update_plan_notification_url(MP_ACCESS_TOKEN, SUBSCRIPTION_PLAN_ID, webhook_url)
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


@app.post("/api/payments/webhook")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    topic = request.query_params.get("topic", "")

    data_id = ""
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass

    data_id = body.get("data", {}).get("id") if isinstance(body.get("data"), dict) else body.get("data", {}).get("id", "")
    if not data_id and "id" in body:
        data_id = body["id"]
    if not data_id:
        data_id = request.query_params.get("id", "")

    if not data_id:
        return {"ok": False, "error": "No data.id"}

    if not MP_ACCESS_TOKEN:
        return {"ok": False, "error": "MP no configurado"}

    from payments import get_subscription, get_payment

    if topic == "preapproval" or body.get("type") in ("subscription_preapproval", "subscription_preapproval_plan"):
        sub_data = get_subscription(MP_ACCESS_TOKEN, str(data_id))
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
        pay_data = get_payment(MP_ACCESS_TOKEN, str(data_id))
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=CLOUD_HOST, port=CLOUD_PORT, log_level="info")
