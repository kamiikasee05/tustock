"""Consulta y ajuste del stock de productos."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import StockAdjustment
from services.stock_service import get_all_stock, adjust_stock, get_low_stock
from cloud_push import push_async

router = APIRouter(prefix="/api/stock", tags=["stock"])

@router.get("")
def list_stock(db: Session = Depends(get_db)):
    """Devuelve el stock actual de todos los productos activos."""
    return get_all_stock(db)

@router.get("/low")
def low_stock(db: Session = Depends(get_db)):
    """Productos con stock por debajo del mínimo configurado."""
    return get_low_stock(db)

@router.post("/adjust")
def adjust(data: StockAdjustment, db: Session = Depends(get_db)):
    """Realiza un ajuste manual de stock: entrada, salida o ajuste directo."""
    result = adjust_stock(db, data.product_id, data.quantity, data.movement_type, data.notes)
    push_async()
    return result

@router.get("/movements/{product_id}")
def product_movements(product_id: int, db: Session = Depends(get_db), limit: int = 50):
    """Historial de movimientos de stock de un producto específico."""
    from models.stock import StockMovement
    movements = (
        db.query(StockMovement)
        .filter(StockMovement.product_id == product_id)
        .order_by(StockMovement.created_at.desc())
        .limit(limit)
        .all()
    )
    return movements
