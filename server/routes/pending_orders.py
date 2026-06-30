"""Gestión de pedidos pendientes: creación, aprobación, rechazo y limpieza."""

import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import datetime, timezone, date
from database import get_db
from models.pending_order import PendingOrder
from models.vendor import Vendor
from models.sale import Sale, SaleItem
from models.stock import CurrentStock, StockMovement
from models.customer import Customer, CustomerTransaction
from schemas import PendingOrderCreate

router = APIRouter(prefix="/api/pending-orders", tags=["pending-orders"])

@router.get("")
def list_pending(db: Session = Depends(get_db)):
    """Lista los pedidos pendientes con datos del vendedor y sus items."""
    orders = (
        db.query(PendingOrder, Vendor)
        .join(Vendor, PendingOrder.vendor_id == Vendor.id)
        .filter(PendingOrder.status == "pending")
        .order_by(PendingOrder.created_at.desc())
        .all()
    )
    return [
        {
            "id": o.id,
            "vendor_name": v.name,
            "vendor_dni": v.dni,
            "total": o.total,
            "items": json.loads(o.items_json),
            "created_at": str(o.created_at),
        }
        for o, v in orders
    ]

@router.post("")
def create_pending(data: PendingOrderCreate, db: Session = Depends(get_db)):
    """Crea un nuevo pedido pendiente asociado a un vendedor activo."""
    vendor = db.query(Vendor).filter(Vendor.id == data.vendor_id, Vendor.is_active == True).first()
    if not vendor:
        raise HTTPException(404, "Vendedor no encontrado")

    items_dict = [item.model_dump() for item in data.items]
    total = sum(item.quantity * item.unit_price for item in data.items)

    order = PendingOrder(
        vendor_id=data.vendor_id,
        total=total,
        items_json=json.dumps(items_dict),
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return {"id": order.id, "total": total, "status": "pending"}

class ApproveBody(BaseModel):
    """Datos opcionales para aprobar un pedido con método de pago y cliente."""
    payment_method: str | None = Field(default=None, max_length=50)
    customer_id: int | None = None

@router.post("/{order_id}/approve")
def approve(order_id: int, body: ApproveBody = None, db: Session = Depends(get_db)):
    """Aprueba un pedido, genera una venta automática y descuenta stock."""
    order = db.query(PendingOrder).filter(PendingOrder.id == order_id).first()
    if not order:
        raise HTTPException(404, "Pedido no encontrado")
    if order.status != "pending":
        raise HTTPException(400, "El pedido ya fue procesado")

    pm = body.payment_method if body and body.payment_method else "a confirmar"
    cid = body.customer_id if body else None

    if pm == "fiado" and not cid:
        raise HTTPException(400, "Seleccioná un cliente para vender fiado")

    items = json.loads(order.items_json)

    sale = Sale(
        sale_date=date.today(),
        total=order.total,
        payment_method=pm,
        notes=f"Pedido #{order.id}",
        vendor_id=order.vendor_id,
        customer_id=cid,
        created_at=datetime.now(timezone.utc),
    )
    db.add(sale)
    db.flush()

    for item in items:
        si = SaleItem(
            sale_id=sale.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            subtotal=item["quantity"] * item["unit_price"],
        )
        db.add(si)

        cs = db.query(CurrentStock).filter(CurrentStock.product_id == item["product_id"]).first()
        if cs:
            cs.quantity = max(0.0, cs.quantity - item["quantity"])
        else:
            db.add(CurrentStock(product_id=item["product_id"], quantity=0.0))

        movement = StockMovement(
            product_id=item["product_id"],
            quantity=item["quantity"],
            movement_type="exit",
            reference_type="sale",
            reference_id=sale.id,
        )
        db.add(movement)

    if pm == "fiado" and cid:
        debt = CustomerTransaction(
            customer_id=cid,
            type="debt",
            amount=order.total,
            sale_id=sale.id,
            notes=f"Pedido #{order.id} - fiado",
        )
        db.add(debt)

    order.status = "approved"
    order.processed_at = datetime.now(timezone.utc)
    db.commit()

    pm_label = {"efectivo": "efectivo", "tarjeta": "tarjeta", "transferencia": "transferencia", "fiado": "fiado"}.get(pm, pm)
    return {"id": order.id, "sale_id": sale.id, "status": "approved", "total": order.total, "payment_method": pm}

@router.post("/{order_id}/reject")
def reject(order_id: int, db: Session = Depends(get_db)):
    """Rechaza un pedido pendiente sin generar venta."""
    order = db.query(PendingOrder).filter(PendingOrder.id == order_id).first()
    order = db.query(PendingOrder).filter(PendingOrder.id == order_id).first()
    if not order:
        raise HTTPException(404, "Pedido no encontrado")
    if order.status != "pending":
        raise HTTPException(400, "El pedido ya fue procesado")

    order.status = "rejected"
    order.processed_at = datetime.now(timezone.utc)
    db.commit()

    return {"id": order.id, "status": "rejected"}

@router.post("/clear")
def clear_vendor_orders(vendor_id: int, db: Session = Depends(get_db)):
    """Elimina todos los pedidos pendientes de un vendedor específico."""
    db.query(PendingOrder).filter(
        PendingOrder.vendor_id == vendor_id,
        PendingOrder.status == "pending",
    ).delete(synchronize_session=False)
    db.commit()
    return {"ok": True}
