"""Servicios de consulta y ajuste de stock de productos."""

from sqlalchemy.orm import Session
from sqlalchemy import text
from models.product import Product
from models.stock import CurrentStock, StockMovement

def get_current_stock(db: Session, product_id: int) -> float:
    """Retorna la cantidad actual de stock de un producto (0.0 si no existe registro)."""
    cs = db.query(CurrentStock).filter(CurrentStock.product_id == product_id).first()
    return cs.quantity if cs else 0.0

def get_all_stock(db: Session):
    """Devuelve el stock de todos los productos activos incluyendo precio y stock mínimo."""
    results = (
        db.query(Product, CurrentStock)
        .outerjoin(CurrentStock, Product.id == CurrentStock.product_id)
        .filter(Product.is_active == True)
        .all()
    )
    return [
        {
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "min_stock": p.min_stock,
            "quantity": cs.quantity if cs else 0.0,
            "unit": p.unit,
            "selling_price": p.selling_price,
        }
        for p, cs in results
    ]

def get_low_stock(db: Session):
    """Retorna los productos activos cuyo stock actual es menor o igual al stock mínimo."""
    results = (
        db.query(Product, CurrentStock)
        .outerjoin(CurrentStock, Product.id == CurrentStock.product_id)
        .filter(Product.is_active == True)
        .all()
    )
    low = []
    for p, cs in results:
        qty = cs.quantity if cs else 0.0
        if qty <= p.min_stock:
            low.append({
                "id": p.id,
                "code": p.code,
                "name": p.name,
                "min_stock": p.min_stock,
                "current": qty,
                "unit": p.unit,
            })
    return low

def adjust_stock(db: Session, product_id: int, quantity: float, movement_type: str, notes: str = None):
    """Realiza un ajuste de stock (entrada, salida o ajuste manual) y registra el movimiento."""
    db.execute(
        text("INSERT INTO current_stock (product_id, quantity) VALUES (:pid, 0) "
             "ON CONFLICT(product_id) DO NOTHING"),
        {"pid": product_id}
    )

    cs = db.query(CurrentStock).filter(CurrentStock.product_id == product_id).first()
    previous = cs.quantity

    if movement_type == "entry":
        db.execute(
            text("UPDATE current_stock SET quantity = quantity + :qty WHERE product_id = :pid"),
            {"qty": quantity, "pid": product_id}
        )
    elif movement_type == "exit":
        db.execute(
            text("UPDATE current_stock SET quantity = MAX(0, quantity - :qty) WHERE product_id = :pid"),
            {"qty": quantity, "pid": product_id}
        )
    elif movement_type == "adjustment":
        db.execute(
            text("UPDATE current_stock SET quantity = :qty WHERE product_id = :pid"),
            {"qty": quantity, "pid": product_id}
        )

    movement = StockMovement(
        product_id=product_id,
        quantity=quantity if movement_type != "adjustment" else (quantity - previous),
        movement_type=movement_type,
        reference_type="manual",
        notes=notes,
    )
    db.add(movement)
    db.commit()

    cs = db.query(CurrentStock).filter(CurrentStock.product_id == product_id).first()
    return {"product_id": product_id, "previous": previous, "current": cs.quantity}

def register_entry(db: Session, product_id: int, quantity: float, notes: str = None):
    """Registra una entrada de stock para un producto."""
    return adjust_stock(db, product_id, quantity, "entry", notes)

def register_exit(db: Session, product_id: int, quantity: float, notes: str = None):
    """Registra una salida de stock para un producto."""
    return adjust_stock(db, product_id, quantity, "exit", notes)
