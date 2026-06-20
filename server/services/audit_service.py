from datetime import datetime, timezone, date
from sqlalchemy.orm import Session
from models.audit import StockAudit, AuditItem
from models.product import Product
from models.stock import CurrentStock, StockMovement
from services.stock_service import get_current_stock

def create_audit(db: Session, notes: str = None, created_by: str = None):
    audit = StockAudit(
        audit_date=date.today(),
        status="draft",
        notes=notes,
        created_by=created_by,
    )
    db.add(audit)
    db.flush()

    products = db.query(Product).filter(Product.is_active == True).all()
    for p in products:
        qty = get_current_stock(db, p.id)
        item = AuditItem(
            audit_id=audit.id,
            product_id=p.id,
            theoretical_qty=qty,
        )
        db.add(item)

    db.commit()
    return {"id": audit.id, "status": audit.status, "items_count": len(products)}

def start_audit(db: Session, audit_id: int):
    audit = db.query(StockAudit).filter(StockAudit.id == audit_id).first()
    if not audit:
        return None
    audit.status = "in_progress"
    db.commit()
    return {"id": audit.id, "status": audit.status}

def update_audit_item(db: Session, audit_id: int, product_id: int, counted_qty: float, notes: str = None):
    item = (
        db.query(AuditItem)
        .filter(AuditItem.audit_id == audit_id, AuditItem.product_id == product_id)
        .first()
    )
    if not item:
        return None

    item.counted_qty = counted_qty
    item.difference = counted_qty - item.theoretical_qty
    if notes:
        item.notes = notes
    db.commit()

    return {
        "product_id": product_id,
        "theoretical": item.theoretical_qty,
        "counted": item.counted_qty,
        "difference": item.difference,
    }

def complete_audit(db: Session, audit_id: int, apply_corrections: bool = True):
    audit = db.query(StockAudit).filter(StockAudit.id == audit_id).first()
    if not audit:
        return None

    items = db.query(AuditItem).filter(AuditItem.audit_id == audit_id).all()

    discrepancies = []
    for item in items:
        if item.difference is not None and item.difference != 0:
            discrepancies.append({
                "product_id": item.product_id,
                "theoretical": item.theoretical_qty,
                "counted": item.counted_qty,
                "difference": item.difference,
            })

            if apply_corrections:
                cs = db.query(CurrentStock).filter(CurrentStock.product_id == item.product_id).first()
                if cs:
                    cs.quantity = item.counted_qty

                movement = StockMovement(
                    product_id=item.product_id,
                    quantity=abs(item.difference),
                    movement_type="audit_correction",
                    reference_type="audit",
                    reference_id=audit_id,
                    notes=f"Corrección por auditoría #{audit_id}: teórico={item.theoretical_qty}, contado={item.counted_qty}",
                )
                db.add(movement)

    audit.status = "completed"
    audit.completed_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "id": audit.id,
        "status": audit.status,
        "discrepancies": discrepancies,
        "corrections_applied": apply_corrections,
    }

def get_audit_detail(db: Session, audit_id: int):
    audit = db.query(StockAudit).filter(StockAudit.id == audit_id).first()
    if not audit:
        return None

    items = (
        db.query(AuditItem, Product)
        .join(Product, AuditItem.product_id == Product.id)
        .filter(AuditItem.audit_id == audit_id)
        .all()
    )

    return {
        "id": audit.id,
        "audit_date": str(audit.audit_date),
        "status": audit.status,
        "notes": audit.notes,
        "created_by": audit.created_by,
        "items": [
            {
                "product_id": item.product_id,
                "code": product.code,
                "name": product.name,
                "theoretical_qty": item.theoretical_qty,
                "counted_qty": item.counted_qty,
                "difference": item.difference,
                "notes": item.notes,
            }
            for item, product in items
            if item.difference is not None and item.difference != 0
        ],
    }

def list_audits(db: Session):
    audits = db.query(StockAudit).order_by(StockAudit.created_at.desc()).all()
    return [
        {"id": a.id, "audit_date": str(a.audit_date), "status": a.status, "created_by": a.created_by, "notes": a.notes}
        for a in audits
    ]

def scan_to_audit(db: Session, audit_id: int, product_code: str):
    product = db.query(Product).filter(Product.code == product_code).first()
    if not product:
        return {"error": "Producto no encontrado", "code": product_code}

    item = (
        db.query(AuditItem)
        .filter(AuditItem.audit_id == audit_id, AuditItem.product_id == product.id)
        .first()
    )
    if not item:
        return {"error": "Producto no incluido en la auditoría"}

    new_count = (item.counted_qty or 0) + 1
    return update_audit_item(db, audit_id, product.id, new_count)
