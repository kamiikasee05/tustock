import uuid
import json
import urllib.request
import urllib.error
import socket
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from models.license import License
from models.product import Product
from config import TUSTOCK_CLOUD_URL, TUSTOCK_CLOUD_CACHE_DAYS


PLAN_FEATURES = {
    "trial": {
        "max_products": 100,
        "reports_enabled": False,
        "export_enabled": False,
        "monitor_enabled": False,
        "backup_enabled": False,
    },
    "basico": {
        "max_products": 999999,
        "reports_enabled": True,
        "export_enabled": True,
        "monitor_enabled": False,
        "backup_enabled": False,
    },
    "suscripcion": {
        "max_products": 999999,
        "reports_enabled": True,
        "export_enabled": True,
        "monitor_enabled": True,
        "backup_enabled": False,
    },
    "pro": {
        "max_products": 999999,
        "reports_enabled": True,
        "export_enabled": True,
        "monitor_enabled": True,
        "backup_enabled": True,
    },
    "premium": {
        "max_products": 999999,
        "reports_enabled": True,
        "export_enabled": True,
        "monitor_enabled": True,
        "backup_enabled": False,
    },
}


def _generate_key() -> str:
    raw = uuid.uuid4().hex[:16].upper()
    return f"TST-{raw[:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}"


def init_license(db: Session) -> License:
    lic = db.query(License).filter(License.active == True).first()
    if lic:
        return lic
    any_lic = db.query(License).first()
    if any_lic:
        return any_lic
    key = _generate_key()
    lic = License(
        key=key,
        plan="trial",
        max_products=100,
        expires_at=date.today() + timedelta(days=30),
    )
    db.add(lic)
    db.commit()
    db.refresh(lic)
    return lic


def get_license(db: Session) -> License | None:
    return db.query(License).filter(License.active == True).first()


def get_license_status(db: Session) -> dict:
    lic = get_license(db)
    if not lic:
        return {
            "plan": "none",
            "active": False,
            "trial": False,
            "expired": False,
            "days_left": 0,
            "products_used": 0,
            "products_max": 0,
            "reports_enabled": False,
            "export_enabled": False,
            "monitor_enabled": False,
            "backup_enabled": False,
            "key": "",
            "customer_name": "",
            "upgrade_message": "Ingresá una licencia para activar el sistema",
        }

    product_count = db.query(Product).filter(Product.is_active == True).count()
    expired = False
    days_left = 9999

    if lic.plan == "trial" and lic.expires_at:
        days_left = (lic.expires_at - date.today()).days
        expired = days_left <= 0
        days_left = max(days_left, 0)

    plan_name = {
        "trial": "Trial",
        "basico": "Básico",
        "suscripcion": "Suscripción",
        "pro": "Pro",
        "premium": "Premium",
    }.get(lic.plan, lic.plan.capitalize())

    upgrade_message = ""
    if lic.plan == "trial" and expired:
        upgrade_message = "Tu período de prueba expiró. Adquirí una licencia para seguir usando el sistema."
    elif lic.plan == "trial":
        upgrade_message = "Estás usando la versión Trial. Adquirí una licencia para acceder a todas las funciones."

    return {
        "plan": lic.plan,
        "plan_name": plan_name,
        "active": lic.active,
        "trial": lic.plan == "trial",
        "expired": expired,
        "days_left": days_left,
        "products_used": product_count,
        "products_max": lic.max_products,
        "reports_enabled": lic.reports_enabled,
        "export_enabled": lic.export_enabled,
        "monitor_enabled": lic.monitor_enabled,
        "backup_enabled": lic.backup_enabled,
        "key": lic.key,
        "customer_name": lic.customer_name,
        "expires_at": str(lic.expires_at) if lic.expires_at else None,
        "upgrade_message": upgrade_message,
    }


def activate_license(db: Session, key: str, customer_name: str = "") -> dict:
    lic = db.query(License).filter(License.key == key).first()
    if not lic:
        return {"ok": False, "error": "Clave de licencia inválida"}
    if not lic.active:
        return {"ok": False, "error": "La licencia está desactivada"}
    lic.customer_name = customer_name or lic.customer_name
    lic.last_validated_at = datetime.utcnow()
    db.commit()
    return {"ok": True, "plan": lic.plan}


def can_add_product(db: Session) -> tuple[bool, str]:
    lic = get_license(db)
    if not lic:
        return False, "No hay licencia activa"
    product_count = db.query(Product).filter(Product.is_active == True).count()
    if lic.plan == "trial" and lic.expires_at and lic.expires_at < date.today():
        return False, "Período de prueba expirado. Ingresá una licencia."
    if product_count >= lic.max_products:
        if lic.plan == "trial":
            return False, f"Límite de {lic.max_products} productos alcanzado en el plan Trial. Adquirí una licencia para agregar más."
        return False, "Límite de productos alcanzado"
    return True, ""


def get_machine_id() -> str:
    try:
        import uuid
        node = uuid.getnode()
        return format(node, 'x')[:24]
    except:
        return "unknown"


def validate_against_cloud(key: str) -> dict:
    try:
        machine_id = get_machine_id()
        hostname = socket.gethostname()
        body = json.dumps({"license_key": key, "machine_id": machine_id, "hostname": hostname}).encode()
        req = urllib.request.Request(
            f"{TUSTOCK_CLOUD_URL}/api/licenses/validate",
            data=body,
            headers={"Content-Type": "application/json"},
        )
        resp = urllib.request.urlopen(req, timeout=10)
        return json.loads(resp.read())
    except Exception as e:
        return {"ok": False, "error": "cloud_unreachable", "message": str(e)[:100]}


def check_cloud_validation(db: Session) -> dict:
    lic = get_license(db)
    if not lic:
        return {"valid": False, "reason": "no_license"}

    if lic.plan == "trial":
        return {"valid": True, "reason": "trial"}

    cache_age = None
    if lic.last_validated_at:
        cache_age = (datetime.utcnow() - lic.last_validated_at).days

    if cache_age is not None and cache_age < TUSTOCK_CLOUD_CACHE_DAYS:
        return {"valid": True, "reason": "cached", "cache_age": cache_age}

    result = validate_against_cloud(lic.key)

    if result.get("ok"):
        lic.last_validated_at = datetime.utcnow()
        db.commit()
        return {"valid": True, "reason": "cloud_ok", "cloud_plan": result.get("plan")}

    if cache_age is None:
        return {"valid": False, "reason": "no_cache_no_cloud"}
    if cache_age >= TUSTOCK_CLOUD_CACHE_DAYS + 7:
        return {"valid": False, "reason": "cache_expired_cloud_down"}

    return {"valid": True, "reason": "cached_but_cloud_down", "cache_age": cache_age}


def sync_key_to_cloud(key: str, plan: str, customer_name: str = "") -> bool:
    try:
        body = json.dumps({"license_key": key, "plan": plan, "customer_name": customer_name}).encode()
        req = urllib.request.Request(
            f"{TUSTOCK_CLOUD_URL}/api/licenses/sync",
            data=body,
            headers={"Content-Type": "application/json"},
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


def get_upgrade_url() -> str:
    return "/upgrade"
