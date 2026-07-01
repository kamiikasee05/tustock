"""Rutas de administración de licencias — solo accesible con token admin."""

import uuid
import secrets
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from config import TUSTOCK_ADMIN_TOKEN
from models.license import License

router = APIRouter(prefix="/api/admin", tags=["admin"])


def verify_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer ") or not secrets.compare_digest(auth[7:], TUSTOCK_ADMIN_TOKEN):
        raise HTTPException(401, "Admin token invalido")


def _generate_key() -> str:
    raw = uuid.uuid4().hex[:16].upper()
    return f"TST-{raw[:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}"


@router.get("/licenses")
def list_licenses(request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    licenses = db.query(License).order_by(License.created_at.desc()).all()
    return {
        "licenses": [
            {
                "id": lic.id,
                "key": lic.key,
                "plan": lic.plan,
                "customer_name": lic.customer_name or "",
                "active": lic.active,
                "expires_at": str(lic.expires_at) if lic.expires_at else None,
                "created_at": lic.created_at.isoformat() if lic.created_at else None,
                "last_validated_at": lic.last_validated_at.isoformat() if lic.last_validated_at else None,
            }
            for lic in licenses
        ]
    }


@router.post("/generate")
def generate_license(data: dict, request: Request, db: Session = Depends(get_db)):
    verify_admin(request)

    plan = data.get("plan", "basico")
    customer_name = data.get("customer_name", "").strip()
    expires_str = data.get("expires_at")

    if plan not in ("basico", "suscripcion", "pro", "trial"):
        raise HTTPException(400, "Plan invalido. Opciones: basico, suscripcion, pro, trial")

    if customer_name and len(customer_name) > 200:
        raise HTTPException(400, "Nombre de cliente muy largo (max 200 caracteres)")

    from services.license_service import PLAN_FEATURES
    features = PLAN_FEATURES.get(plan, PLAN_FEATURES["trial"])

    expires_at = None
    if expires_str:
        try:
            expires_at = date.fromisoformat(expires_str)
        except ValueError:
            raise HTTPException(400, "Formato de fecha invalido (YYYY-MM-DD)")

    if plan == "trial" and not expires_at:
        expires_at = date.today() + timedelta(days=30)

    key = _generate_key()
    lic = License(
        key=key,
        plan=plan,
        customer_name=customer_name,
        max_products=features["max_products"],
        reports_enabled=features["reports_enabled"],
        export_enabled=features["export_enabled"],
        monitor_enabled=features["monitor_enabled"],
        backup_enabled=features["backup_enabled"],
        expires_at=expires_at,
    )
    db.add(lic)
    db.commit()
    db.refresh(lic)

    return {
        "ok": True,
        "key": lic.key,
        "plan": lic.plan,
        "customer_name": lic.customer_name,
        "expires_at": str(lic.expires_at) if lic.expires_at else None,
    }


@router.post("/revoke/{license_key}")
def revoke_license(license_key: str, request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    lic = db.query(License).filter(License.key == license_key).first()
    if not lic:
        raise HTTPException(404, "Licencia no encontrada")
    lic.active = False
    db.commit()
    return {"ok": True, "message": f"Licencia {license_key} revocada"}


@router.post("/activate/{license_key}")
def activate_license(license_key: str, request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    lic = db.query(License).filter(License.key == license_key).first()
    if not lic:
        raise HTTPException(404, "Licencia no encontrada")
    lic.active = True
    db.commit()
    return {"ok": True, "message": f"Licencia {license_key} activada"}


@router.delete("/delete/{license_key}")
def delete_license(license_key: str, request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    lic = db.query(License).filter(License.key == license_key).first()
    if not lic:
        raise HTTPException(404, "Licencia no encontrada")
    db.delete(lic)
    db.commit()
    return {"ok": True, "message": f"Licencia {license_key} eliminada"}


@router.get("/stats")
def stats(request: Request, db: Session = Depends(get_db)):
    verify_admin(request)
    all_licenses = db.query(License).all()
    active_licenses = [l for l in all_licenses if l.active]
    by_plan = {}
    for l in all_licenses:
        by_plan[l.plan] = by_plan.get(l.plan, 0) + 1

    PRICE = {"basico": 80000, "suscripcion": 8000, "pro": 160000, "trial": 0, "premium": 0}

    estimated_revenue = sum(PRICE.get(l.plan, 0) for l in active_licenses)
    mrr = sum(PRICE.get(l.plan, 0) for l in active_licenses if l.plan == "suscripcion")
    one_time = sum(PRICE.get(l.plan, 0) for l in active_licenses if l.plan != "suscripcion")

    active_by_plan = {}
    for l in active_licenses:
        active_by_plan[l.plan] = active_by_plan.get(l.plan, 0) + 1

    customers_with_names = sum(1 for l in active_licenses if l.customer_name)

    today = date.today()
    soon = today + timedelta(days=7)
    trials_expiring = [
        {
            "key": l.key,
            "customer_name": l.customer_name or "Sin nombre",
            "expires_at": str(l.expires_at) if l.expires_at else None,
            "days_left": (l.expires_at - today).days if l.expires_at else 0,
        }
        for l in active_licenses
        if l.plan == "trial" and l.expires_at and today <= l.expires_at <= soon
    ]

    return {
        "total": len(all_licenses),
        "active": len(active_licenses),
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
