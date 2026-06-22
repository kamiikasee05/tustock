from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime, timezone
from database import get_db
from models.sale import Sale, SaleItem
from models.product import Product
from models.stock import CurrentStock, StockMovement
from schemas import SaleCreate, SaleItemData

router = APIRouter(prefix="/api/sales", tags=["sales"])

@router.get("")
def list_sales(db: Session = Depends(get_db), sale_date: str = None, limit: int = 100):
    q = db.query(Sale)
    if sale_date:
        q = q.filter(Sale.sale_date == sale_date)
    return q.order_by(Sale.created_at.desc()).limit(limit).all()

@router.get("/{sale_id}")
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(404, "Venta no encontrada")
    return {
        "id": sale.id,
        "sale_date": str(sale.sale_date),
        "total": sale.total,
        "discount": sale.discount,
        "payment_method": sale.payment_method,
        "notes": sale.notes,
        "cashier": sale.cashier,
        "items": [
            {
                "id": i.id,
                "product_id": i.product_id,
                "quantity": i.quantity,
                "unit_price": i.unit_price,
                "subtotal": i.subtotal,
            }
            for i in sale.items
        ],
    }

@router.post("")
def create_sale(data: SaleCreate, db: Session = Depends(get_db)):
    subtotal = sum(item.quantity * item.unit_price for item in data.items)
    total = subtotal - data.discount

    if total < 0:
        raise HTTPException(400, "El descuento no puede superar el subtotal")

    sale = Sale(
        sale_date=date.today(),
        total=total,
        discount=data.discount,
        payment_method=data.payment_method,
        notes=data.notes,
        cashier=data.cashier,
        created_at=datetime.now(timezone.utc),
    )
    db.add(sale)
    db.flush()

    for item_data in data.items:
        si = SaleItem(
            sale_id=sale.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            subtotal=item_data.quantity * item_data.unit_price,
        )
        db.add(si)

        cs = db.query(CurrentStock).filter(CurrentStock.product_id == item_data.product_id).first()
        if cs:
            cs.quantity = max(0.0, cs.quantity - item_data.quantity)
        else:
            db.add(CurrentStock(product_id=item_data.product_id, quantity=0.0))

        movement = StockMovement(
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            movement_type="exit",
            reference_type="sale",
            reference_id=sale.id,
        )
        db.add(movement)

    db.commit()
    db.refresh(sale)
    return {"id": sale.id, "total": sale.total, "items_count": len(data.items)}

@router.get("/today/summary")
def today_summary(db: Session = Depends(get_db)):
    today = date.today()
    sales = db.query(Sale).filter(Sale.sale_date == today).all()
    total = sum(s.total for s in sales)
    count = len(sales)
    items = sum(len(s.items) for s in sales)
    return {
        "date": str(today),
        "total_sales": total,
        "transaction_count": count,
        "items_sold": items,
        "average_ticket": total / count if count > 0 else 0,
    }
