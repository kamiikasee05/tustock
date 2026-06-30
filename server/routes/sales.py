from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
from datetime import date, datetime, timezone
from database import get_db
from models.sale import Sale, SaleItem
from models.product import Product
from models.customer import Customer, CustomerTransaction
from models.stock import CurrentStock, StockMovement
from schemas import SaleCreate, SaleItemData

router = APIRouter(prefix="/api/sales", tags=["sales"])

@router.get("")
def list_sales(db: Session = Depends(get_db), sale_date: str = None, limit: int = 100):
    q = db.query(Sale).options(selectinload(Sale.items), selectinload(Sale.customer))
    if sale_date:
        q = q.filter(Sale.sale_date == sale_date)
    sales = q.order_by(Sale.created_at.desc()).limit(limit).all()
    return [
        {
            "id": s.id,
            "sale_date": str(s.sale_date),
            "total": s.total,
            "discount": s.discount,
            "payment_method": s.payment_method,
            "notes": s.notes,
            "cashier": s.cashier,
            "vendor_id": s.vendor_id,
            "customer_id": s.customer_id,
            "customer_name": s.customer.name if s.customer else None,
            "created_at": str(s.created_at) if s.created_at else None,
            "items_count": len(s.items),
        }
        for s in sales
    ]

@router.get("/{sale_id}")
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).options(selectinload(Sale.customer)).filter(Sale.id == sale_id).first()
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
        "customer_id": sale.customer_id,
        "customer_name": sale.customer.name if sale.customer else None,
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

    if data.payment_method == "fiado" and not data.customer_id:
        raise HTTPException(400, "Seleccioná un cliente para vender fiado")

    sale = Sale(
        sale_date=date.today(),
        total=total,
        discount=data.discount,
        payment_method=data.payment_method,
        notes=data.notes,
        cashier=data.cashier,
        customer_id=data.customer_id,
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

    # Si es fiado, crear deuda automaticamente
    if data.payment_method == "fiado" and data.customer_id:
        debt = CustomerTransaction(
            customer_id=data.customer_id,
            type="debt",
            amount=total,
            sale_id=sale.id,
            notes=f"Venta #{sale.id} - fiado",
        )
        db.add(debt)

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
