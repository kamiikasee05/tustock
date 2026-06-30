"""Gestión de clientes, deudas, pagos y transacciones."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from database import get_db
from models.customer import Customer, CustomerTransaction

router = APIRouter(prefix="/api/customers", tags=["customers"])

class CustomerCreate(BaseModel):
    """Datos para registrar un nuevo cliente."""
    name: str = Field(..., max_length=200)
    dni: str | None = Field(default=None, max_length=20)
    phone: str | None = Field(default=None, max_length=50)
    notes: str | None = None

class PaymentCreate(BaseModel):
    """Datos para registrar un pago de un cliente."""
    customer_id: int
    amount: float = Field(..., gt=0)
    notes: str | None = None

class CreditSaleCreate(BaseModel):
    """Datos para registrar una deuda por venta fiado."""
    customer_id: int
    total: float

@router.get("")
def list_customers(db: Session = Depends(get_db), include_inactive: bool = False):
    """Lista los clientes con su saldo deudor calculado (deudas - pagos)."""
    debt_subq = (
        db.query(
            CustomerTransaction.customer_id,
            func.sum(CustomerTransaction.amount).label("total")
        )
        .filter(CustomerTransaction.type == "debt")
        .group_by(CustomerTransaction.customer_id)
        .subquery()
    )
    payment_subq = (
        db.query(
            CustomerTransaction.customer_id,
            func.sum(CustomerTransaction.amount).label("total")
        )
        .filter(CustomerTransaction.type == "payment")
        .group_by(CustomerTransaction.customer_id)
        .subquery()
    )

    q = (db.query(
        Customer,
        func.coalesce(debt_subq.c.total, 0).label("debts"),
        func.coalesce(payment_subq.c.total, 0).label("payments"),
    ).outerjoin(debt_subq, Customer.id == debt_subq.c.customer_id)
    .outerjoin(payment_subq, Customer.id == payment_subq.c.customer_id))

    if not include_inactive:
        q = q.filter(Customer.is_active == True)

    rows = q.order_by(Customer.name).all()
    return [
        {
            "id": c.id, "name": c.name, "dni": c.dni, "phone": c.phone,
            "notes": c.notes, "is_active": c.is_active,
            "balance": debts - payments,
            "total_debts": debts,
            "total_payments": payments,
        }
        for c, debts, payments in rows
    ]

@router.post("")
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    """Registra un nuevo cliente en el sistema."""
    c = Customer(**data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@router.delete("/{customer_id}")
def deactivate(customer_id: int, db: Session = Depends(get_db)):
    """Desactiva un cliente (borrado lógico)."""
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(404, "Cliente no encontrado")
    c.is_active = False
    db.commit()
    return {"ok": True}

@router.get("/{customer_id}/transactions")
def customer_transactions(customer_id: int, db: Session = Depends(get_db), limit: int = 50):
    """Obtiene el historial de transacciones (deudas y pagos) de un cliente."""
    txs = db.query(CustomerTransaction).filter(
        CustomerTransaction.customer_id == customer_id
    ).order_by(CustomerTransaction.created_at.desc()).limit(limit).all()

    return [
        {
            "id": t.id, "type": t.type, "amount": t.amount,
            "sale_id": t.sale_id, "notes": t.notes,
            "created_at": str(t.created_at),
        }
        for t in txs
    ]

@router.post("/payment")
def register_payment(data: PaymentCreate, db: Session = Depends(get_db)):
    """Registra un pago realizado por un cliente para reducir su deuda."""
    c = db.query(Customer).filter(Customer.id == data.customer_id, Customer.is_active == True).first()
    if not c:
        raise HTTPException(404, "Cliente no encontrado")

    t = CustomerTransaction(
        customer_id=data.customer_id,
        type="payment",
        amount=data.amount,
        notes=data.notes,
    )
    db.add(t)
    db.commit()
    return {"id": t.id, "type": "payment", "amount": t.amount}

@router.post("/debt")
def register_debt(data: CreditSaleCreate, db: Session = Depends(get_db)):
    """Registra una deuda por venta fiado a un cliente."""
    c = db.query(Customer).filter(Customer.id == data.customer_id, Customer.is_active == True).first()
    if not c:
        raise HTTPException(404, "Cliente no encontrado")

    t = CustomerTransaction(
        customer_id=data.customer_id,
        type="debt",
        amount=data.total,
        notes=f"Venta fiado",
    )
    db.add(t)
    db.commit()
    return {"id": t.id, "type": "debt", "amount": t.amount}
