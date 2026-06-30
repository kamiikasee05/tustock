from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.license_service import (
    get_license_status,
    activate_license,
    init_license,
    can_add_product,
)

router = APIRouter(prefix="/api/license", tags=["license"])


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
