import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, date
from pydantic import BaseModel, Field
from database import get_db
from models.budget import Budget
from models.sale import Sale, SaleItem
from models.stock import CurrentStock, StockMovement

router = APIRouter(prefix="/api/budgets", tags=["budgets"])

class BudgetItem(BaseModel):
    product_id: int
    code: str
    name: str
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)

class BudgetCreate(BaseModel):
    customer_name: str | None = Field(default=None, max_length=200)
    items: list[BudgetItem]

@router.get("")
def list_budgets(db: Session = Depends(get_db), status: str = "pending"):
    budgets = db.query(Budget).filter(Budget.status == status).order_by(Budget.created_at.desc()).all()
    return [
        {
            "id": b.id, "customer_name": b.customer_name, "total": b.total,
            "status": b.status, "items": json.loads(b.items_json),
            "created_at": str(b.created_at),
        }
        for b in budgets
    ]

@router.post("")
def create_budget(data: BudgetCreate, db: Session = Depends(get_db)):
    items_dict = [item.model_dump() for item in data.items]
    total = sum(item.quantity * item.unit_price for item in data.items)

    b = Budget(customer_name=data.customer_name, total=total, items_json=json.dumps(items_dict))
    db.add(b)
    db.commit()
    db.refresh(b)
    return {"id": b.id, "total": total, "status": "pending"}

@router.post("/{budget_id}/approve")
def approve(budget_id: int, db: Session = Depends(get_db)):
    b = db.query(Budget).filter(Budget.id == budget_id).first()
    if not b:
        raise HTTPException(404, "Presupuesto no encontrado")
    if b.status != "pending":
        raise HTTPException(400, "Ya fue procesado")

    items = json.loads(b.items_json)

    sale = Sale(
        sale_date=date.today(),
        total=b.total,
        payment_method="a confirmar",
        notes=f"Presupuesto #{b.id}" + (f" - {b.customer_name}" if b.customer_name else ""),
        created_at=datetime.now(timezone.utc),
    )
    db.add(sale)
    db.flush()

    for item in items:
        db.add(SaleItem(
            sale_id=sale.id, product_id=item["product_id"],
            quantity=item["quantity"], unit_price=item["unit_price"],
            subtotal=item["quantity"] * item["unit_price"],
        ))
        cs = db.query(CurrentStock).filter(CurrentStock.product_id == item["product_id"]).first()
        if cs:
            cs.quantity = max(0.0, cs.quantity - item["quantity"])
        else:
            db.add(CurrentStock(product_id=item["product_id"], quantity=0.0))
        db.add(StockMovement(
            product_id=item["product_id"], quantity=item["quantity"],
            movement_type="exit", reference_type="sale", reference_id=sale.id,
        ))

    b.status = "approved"
    b.processed_at = datetime.now(timezone.utc)
    db.commit()
    return {"id": b.id, "sale_id": sale.id, "status": "approved", "total": b.total}

@router.post("/{budget_id}/reject")
def reject(budget_id: int, db: Session = Depends(get_db)):
    b = db.query(Budget).filter(Budget.id == budget_id).first()
    if not b:
        raise HTTPException(404, "Presupuesto no encontrado")
    if b.status != "pending":
        raise HTTPException(400, "Ya fue procesado")
    b.status = "rejected"
    b.processed_at = datetime.now(timezone.utc)
    db.commit()
    return {"id": b.id, "status": "rejected"}
