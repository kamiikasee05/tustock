"""Gestión de vendedores: registro, login y desactivación."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.vendor import Vendor
from schemas import VendorCreate, VendorLogin

router = APIRouter(prefix="/api/vendors", tags=["vendors"])

@router.get("")
def list_vendors(db: Session = Depends(get_db)):
    """Lista los vendedores activos."""
    return db.query(Vendor).filter(Vendor.is_active == True).all()

@router.post("")
def create_vendor(data: VendorCreate, db: Session = Depends(get_db)):
    """Registra un nuevo vendedor validando que el DNI no esté duplicado."""
    existing = db.query(Vendor).filter(Vendor.dni == data.dni).first()
    if existing:
        raise HTTPException(400, "Ese DNI ya esta registrado")
    v = Vendor(dni=data.dni, name=data.name)
    db.add(v)
    db.commit()
    db.refresh(v)
    return v

@router.delete("/{vendor_id}")
def deactivate_vendor(vendor_id: int, db: Session = Depends(get_db)):
    """Desactiva un vendedor (borrado lógico)."""
    v = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not v:
        raise HTTPException(404, "Vendedor no encontrado")
    v.is_active = False
    db.commit()
    return {"ok": True}

@router.post("/login")
def login_vendor(data: VendorLogin, db: Session = Depends(get_db)):
    """Autentica un vendedor por DNI y devuelve sus datos si está activo."""
    v = db.query(Vendor).filter(Vendor.dni == data.dni, Vendor.is_active == True).first()
    if not v:
        raise HTTPException(404, "DNI no registrado o vendedor inactivo")
    return {"id": v.id, "dni": v.dni, "name": v.name}
