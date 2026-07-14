from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from pathlib import Path
from sqlalchemy.orm import Session
from database import get_db
from services.license_service import (
    get_license_status,
    activate_license,
    init_license,
    can_add_product,
    accept_eula,
)

router = APIRouter(prefix="/api/license", tags=["license"])

LEGAL_DIR = Path(__file__).resolve().parent.parent / "legal"


class ActivateBody(BaseModel):
    key: str
    customer_name: str = ""


@router.get("/status")
def status(db: Session = Depends(get_db)):
    init_license(db)
    return get_license_status(db)


@router.post("/activate")
def activate(body: ActivateBody, db: Session = Depends(get_db)):
    result = activate_license(db, body.key, body.customer_name)
    if not result["ok"]:
        raise HTTPException(400, result["error"])
    return get_license_status(db)


@router.get("/can-add-product")
def check_can_add_product(db: Session = Depends(get_db)):
    ok, msg = can_add_product(db)
    return {"ok": ok, "message": msg}


@router.post("/accept-eula")
def accept_eula_route(db: Session = Depends(get_db)):
    result = accept_eula(db)
    if not result["ok"]:
        raise HTTPException(400, result["error"])
    return {"ok": True, "message": "Términos aceptados"}


@router.get("/terms")
def get_terms():
    path = LEGAL_DIR / "terminos-y-condiciones.html"
    if path.exists():
        return HTMLResponse(path.read_text("utf-8"))
    return HTMLResponse("<h1>Documento no disponible</h1>", status_code=404)


@router.get("/privacy")
def get_privacy():
    path = LEGAL_DIR / "politica-de-privacidad.html"
    if path.exists():
        return HTMLResponse(path.read_text("utf-8"))
    return HTMLResponse("<h1>Documento no disponible</h1>", status_code=404)


@router.get("/refund")
def get_refund():
    path = LEGAL_DIR / "politica-de-reembolso.html"
    if path.exists():
        return HTMLResponse(path.read_text("utf-8"))
    return HTMLResponse("<h1>Documento no disponible</h1>", status_code=404)
