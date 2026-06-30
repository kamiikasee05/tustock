"""Carga datos de prueba: categorías, productos, stock, ventas, clientes, vendedores y más."""

from sqlalchemy import text
from database import init_db, SessionLocal
from models.product import Product, Category
from models.stock import CurrentStock, StockMovement
from models.sale import Sale, SaleItem
from models.customer import Customer, CustomerTransaction
from models.vendor import Vendor
from models.budget import Budget
from models.pending_order import PendingOrder
from models.report import DailyReport
from models.audit import StockAudit, AuditItem
from datetime import datetime, timezone, date, timedelta
import json
import random

init_db()
db = SessionLocal()

# Disable FK constraints for cleanup
db.execute(text("PRAGMA foreign_keys=OFF"))
for table in [SaleItem, Sale, CustomerTransaction, Customer, PendingOrder, Budget, StockMovement, CurrentStock, AuditItem, StockAudit, Product, Category, Vendor, DailyReport]:
    db.query(table).delete()
db.execute(text("PRAGMA foreign_keys=ON"))
db.commit()

# === CATEGORIES ===
cats = {
    "Bebidas": ["Gaseosas", "Aguas", "Jugos"],
    "Almacén": ["Harinas", "Aceites", "Conservas"],
    "Limpieza": ["Detergentes", "Desinfectantes"],
    "Snacks": ["Galletitas", "Chocolates"],
}
cat_map = {}
for parent_name, children in cats.items():
    parent = Category(name=parent_name)
    db.add(parent)
    db.flush()
    cat_map[parent_name] = parent.id
    for child_name in children:
        child = Category(name=child_name, parent_id=parent.id)
        db.add(child)
        db.flush()
        cat_map[child_name] = child.id

# === PRODUCTS ===
products_data = [
    ("CO001", "Coca-Cola 1.5L", 1800, 2500, 10, "Bebidas", "Gaseosas"),
    ("CO002", "Sprite 1.5L", 1700, 2400, 10, "Bebidas", "Gaseosas"),
    ("CO003", "Agua Mineral 2L", 900, 1500, 15, "Bebidas", "Aguas"),
    ("CO004", "Jugo Naranja 1L", 1200, 2000, 8, "Bebidas", "Jugos"),
    ("AL001", "Harina 0000 1kg", 700, 1200, 20, "Almacén", "Harinas"),
    ("AL002", "Aceite Girasol 1.5L", 1500, 2500, 12, "Almacén", "Aceites"),
    ("AL003", "Tomate Triturado 500g", 600, 1100, 15, "Almacén", "Conservas"),
    ("LP001", "Detergente Lavandina 1L", 800, 1400, 10, "Limpieza", "Detergentes"),
    ("LP002", "Lavandina 1L", 500, 900, 10, "Limpieza", "Desinfectantes"),
    ("SN001", "Galletitas Dulces 200g", 400, 800, 20, "Snacks", "Galletitas"),
    ("SN002", "Chocolate con Leche 100g", 1200, 2000, 15, "Snacks", "Chocolates"),
    ("SN003", "Papas Fritas 150g", 900, 1600, 12, "Snacks", "Galletitas"),
    ("LP003", "Esponja Multiuso x3", 400, 800, 15, "Limpieza", "Detergentes"),
    ("AL004", "Arroz 1kg", 1000, 1700, 20, "Almacén", "Harinas"),
    ("SN004", "Turrón 30g", 200, 400, 30, "Snacks", "Chocolates"),
]

product_map = {}
barcode_start = 200000000000
for i, (code, name, cost, price, min_stock, parent_cat, sub_cat) in enumerate(products_data):
    p = Product(
        code=code, name=name, cost_price=cost, selling_price=price,
        min_stock=min_stock, unit="unidad", category_id=cat_map.get(sub_cat),
        description=f"{name} - Categoría: {parent_cat}",
        barcode=str(barcode_start + i),
    )
    db.add(p)
    db.flush()
    product_map[code] = p.id

    qty = random.randint(15, 60)
    cs = CurrentStock(product_id=p.id, quantity=qty)
    db.add(cs)
    db.add(StockMovement(
        product_id=p.id, quantity=qty, movement_type="entry",
        reference_type="manual", notes="Carga inicial",
        created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)),
    ))

db.commit()

# === VENDORS ===
v = Vendor(dni="30123456", name="María López")
db.add(v)
v2_data = [("30987654", "Carlos Pérez"), ("30111222", "Ana Gómez")]
for dni, name in v2_data:
    db.add(Vendor(dni=dni, name=name))
db.flush()

# === CUSTOMERS ===
customers_data = [
    ("Juan Pérez", "12345678", "1156789012", "Cliente habitual"),
    ("María García", "23456789", "1167890123", "Paga quincenal"),
    ("Pedro Rodríguez", "34567890", "1178901234", "Fiado máximo $5000"),
]
for name, dni, phone, notes in customers_data:
    c = Customer(name=name, dni=dni, phone=phone, notes=notes)
    db.add(c)
    db.flush()

    # Add debts and payments
    if name == "Juan Pérez":
        db.add(CustomerTransaction(customer_id=c.id, type="debt", amount=3500, notes="Compra fiado", created_at=datetime.now(timezone.utc) - timedelta(days=5)))
        db.add(CustomerTransaction(customer_id=c.id, type="payment", amount=2000, notes="Pago parcial", created_at=datetime.now(timezone.utc) - timedelta(days=2)))
    elif name == "Pedro Rodríguez":
        db.add(CustomerTransaction(customer_id=c.id, type="debt", amount=4800, notes="Compra fiado", created_at=datetime.now(timezone.utc) - timedelta(days=3)))

db.commit()

# === SALES (today and past days) ===
payment_methods = ["efectivo", "debito", "credito", "efectivo", "transferencia"]
for days_ago in [0, 0, 1, 2, 3, 5, 7]:
    sale_date = date.today() - timedelta(days=days_ago)
    pm = random.choice(payment_methods)
    items_count = random.randint(1, 4)
    selected = random.sample(list(products_data), items_count)
    total = 0
    sale = Sale(
        sale_date=sale_date, total=0, discount=random.choice([0, 0, 50, 100]),
        payment_method=pm, cashier=random.choice(["Cajero A", "Cajero B", "María López"]),
        created_at=datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(1, 10)),
    )
    db.add(sale)
    db.flush()
    for code, name, cost, price, *_ in selected:
        qty = random.randint(1, 3)
        subtotal = price * qty
        total += subtotal
        db.add(SaleItem(sale_id=sale.id, product_id=product_map[code], quantity=qty, unit_price=price, subtotal=subtotal))
        cs = db.query(CurrentStock).filter(CurrentStock.product_id == product_map[code]).first()
        if cs:
            cs.quantity = max(0, cs.quantity - qty)
        db.add(StockMovement(
            product_id=product_map[code], quantity=qty, movement_type="exit",
            reference_type="sale", reference_id=sale.id,
        ))
    sale.total = total - sale.discount

db.commit()

# === BUDGET ===
budget_items = [
    {"product_id": product_map["CO001"], "code": "CO001", "name": "Coca-Cola 1.5L", "quantity": 6, "unit_price": 2500},
    {"product_id": product_map["SN002"], "code": "SN002", "name": "Chocolate con Leche 100g", "quantity": 3, "unit_price": 2000},
]
b = Budget(customer_name="Fiesta Infantil", total=6*2500+3*2000, items_json=json.dumps(budget_items), status="pending")
db.add(b)

# === PENDING ORDER ===
order_items = [
    {"product_id": product_map["CO001"], "code": "CO001", "name": "Coca-Cola 1.5L", "quantity": 4, "unit_price": 2500},
    {"product_id": product_map["SN001"], "code": "SN001", "name": "Galletitas Dulces 200g", "quantity": 5, "unit_price": 800},
]
po = PendingOrder(vendor_id=v.id, total=4*2500+5*800, items_json=json.dumps(order_items), status="pending")
db.add(po)
db.commit()

# === DAILY REPORT (today) ===
today = date.today()
sales_today = db.query(Sale).filter(Sale.sale_date == today).all()
total_sales = sum(s.total for s in sales_today)
items_today = sum(len(s.items) for s in sales_today)
cash = sum(s.total for s in sales_today if s.payment_method == "efectivo")
card = sum(s.total for s in sales_today if s.payment_method in ("debito", "credito"))
other = sum(s.total for s in sales_today if s.payment_method not in ("efectivo", "debito", "credito"))
dr = DailyReport(
    report_date=today, total_sales=total_sales, total_transactions=len(sales_today),
    total_items_sold=items_today, cash_sales=cash, card_sales=card, other_sales=other,
    discounts=sum(s.discount for s in sales_today),
    report_data=json.dumps({"by_payment": {"efectivo": cash, "tarjeta": card, "otro": other}, "top_items": []}),
)
db.add(dr)
db.commit()

db.close()

print("=" * 50)
print("  DATOS DE PRUEBA CARGADOS")
print("=" * 50)
print(f"  Categorías:     {len(cats) + sum(len(v) for v in cats.values())}")
print(f"  Productos:      {len(products_data)}")
print(f"  Ventas hoy:     {len(sales_today)} (${total_sales:,.0f})")
print(f"  Clientes:       {len(customers_data)}")
print(f"  Vendedores:     {len([v]) + len(v2_data)}")
print(f"  Presupuesto:    1 pendiente")
print(f"  Pedido móvil:   1 pendiente")
print("=" * 50)
print("  Abrí http://localhost:8090")
print("=" * 50)
