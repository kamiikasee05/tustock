from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.product import Product
from models.sale import Sale, SaleItem
from models.stock import CurrentStock, StockMovement
from models.customer import Customer, CustomerTransaction
from datetime import datetime, timezone, date

router = APIRouter(prefix="/api/remote-orders", tags=["remote-orders"])


@router.post("")
def create_remote_order(
    data: dict,
    db: Session = Depends(get_db),
):
    items = data.get("items", [])
    payment_method = data.get("payment_method", "efectivo")
    customer_id = data.get("customer_id")
    customer_name = data.get("customer_name")
    notes = data.get("notes", "Venta remota")

    if not items:
        raise HTTPException(400, "Sin items")

    total = 0.0
    sale_items = []

    for item in items:
        code = item.get("product_code", "")
        qty = item.get("quantity", 0)
        unit_price = item.get("unit_price", 0)

        if qty <= 0 or unit_price < 0:
            continue

        product = db.query(Product).filter(
            Product.code == code,
            Product.is_active == True,
        ).first()

        if not product:
            product = db.query(Product).filter(
                Product.barcode == code,
                Product.is_active == True,
            ).first()

        if not product:
            raise HTTPException(400, f"Producto {code} no encontrado")

        stock = db.query(CurrentStock).filter(CurrentStock.product_id == product.id).first()
        current_qty = stock.quantity if stock else 0

        if current_qty < qty:
            raise HTTPException(400, f"Stock insuficiente para {product.name} (disponible: {current_qty})")

        if stock:
            stock.quantity -= qty
        else:
            stock = CurrentStock(product_id=product.id, quantity=-qty)
            db.add(stock)

        movement = StockMovement(
            product_id=product.id,
            quantity=qty,
            movement_type="exit",
            reference_type="sale",
            notes=f"Venta remota - {notes}"[:500],
        )
        db.add(movement)

        total += qty * unit_price
        sale_items.append({
            "product_id": product.id,
            "quantity": qty,
            "unit_price": unit_price,
        })

    if not sale_items:
        raise HTTPException(400, "No se procesaron items válidos")

    sale = Sale(
        total=total,
        payment_method=payment_method,
        notes=notes,
        sale_date=date.today(),
    )
    db.add(sale)
    db.flush()

    customer = None
    if customer_id:
        customer = db.query(Customer).filter(Customer.id == customer_id, Customer.is_active == True).first()
    elif customer_name and payment_method == "fiado":
        customer = db.query(Customer).filter(Customer.name == customer_name, Customer.is_active == True).first()

    if customer:
        sale.customer_id = customer.id

    if payment_method == "fiado" and customer:
        db.add(CustomerTransaction(
            customer_id=customer.id,
            type="debt",
            amount=total,
            sale_id=sale.id,
            notes=f"Venta remota #{sale.id} - fiado",
        ))

    for si in sale_items:
        db.add(SaleItem(
            sale_id=sale.id,
            product_id=si["product_id"],
            quantity=si["quantity"],
            unit_price=si["unit_price"],
            subtotal=si["quantity"] * si["unit_price"],
        ))

    db.commit()

    try:
        from cloud_push import push_async
        push_async()
    except Exception:
        pass

    return {"sale_id": sale.id, "total": total, "items_count": len(sale_items)}
