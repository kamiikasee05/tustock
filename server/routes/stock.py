from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import StockAdjustment
from services.stock_service import get_all_stock, adjust_stock, get_low_stock

router = APIRouter(prefix="/api/stock", tags=["stock"])

@router.get("/")
def list_stock(db: Session = Depends(get_db)):
    return get_all_stock(db)

@router.get("/low")
def low_stock(db: Session = Depends(get_db)):
    return get_low_stock(db)

@router.post("/adjust")
def adjust(data: StockAdjustment, db: Session = Depends(get_db)):
    return adjust_stock(db, data.product_id, data.quantity, data.movement_type, data.notes)

@router.get("/movements/{product_id}")
def product_movements(product_id: int, db: Session = Depends(get_db), limit: int = 50):
    from models.stock import StockMovement
    movements = (
        db.query(StockMovement)
        .filter(StockMovement.product_id == product_id)
        .order_by(StockMovement.created_at.desc())
        .limit(limit)
        .all()
    )
    return movements
