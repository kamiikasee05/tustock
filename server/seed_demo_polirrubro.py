"""Datos DEMO para mostrar en reunión de ventas: polirrubro de barrio argentino.

Polirrubro realista (kiosco/almacén de barrio): bebidas, almacén, lácteos,
limpieza, snacks, verdulería y panificación. Incluye productos con fecha de
vencimiento próxima (alerta en dashboard), stock bajo, stock cero, ventas de
hoy con todos los métodos de pago, clientes con fiado, vendedores, un
presupuesto, un pedido pendiente y el informe diario de hoy.
"""

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
from datetime import datetime, timezone, date, timedelta, time
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
    "Bebidas": ["Gaseosas", "Aguas", "Cervezas", "Jugos"],
    "Almacén": ["Yerba y Café", "Azúcar y Dulces", "Harinas y Pastas", "Arroces y Legumbres", "Aceites y Conservas"],
    "Lácteos": ["Leches", "Yogures", "Quesos"],
    "Limpieza": ["Detergentes", "Lavandina y Desinfectantes", "Esponjas y Cepillos", "Papel"],
    "Snacks": ["Galletitas", "Chocolates", "Papas Fritas"],
    "Verdulería": ["Verduras"],
    "Panificación": ["Pan", "Facturas"],
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
# (code, name, cost, price, min_stock, initial_stock, expiry_days (None = sin vencimiento), parent_cat, sub_cat)
products_data = [
    # Bebidas
    ("BEB001", "Coca-Cola 1.5L", 2600, 3500, 12, 48, None, "Bebidas", "Gaseosas"),
    ("BEB002", "Sprite 1.5L", 2400, 3200, 12, 36, None, "Bebidas", "Gaseosas"),
    ("BEB003", "Agua Mineral 2.25L", 1200, 1800, 12, 60, None, "Bebidas", "Aguas"),
    ("BEB004", "Cerveza Quilmes 1L", 2200, 3000, 12, 30, None, "Bebidas", "Cervezas"),
    ("BEB005", "Jugo Baggio Naranja 1L", 1800, 2600, 8, 20, 90, "Bebidas", "Jugos"),
    ("BEB006", "Té Frío Durazno 1L", 1500, 2200, 6, 12, 75, "Bebidas", "Jugos"),
    ("BEB007", "Gatorade 1L", 2200, 3000, 6, 4, None, "Bebidas", "Jugos"),
    # Almacén
    ("ALM001", "Yerba Playadito 1kg", 3400, 4800, 10, 25, 240, "Almacén", "Yerba y Café"),
    ("ALM002", "Yerba Taragüí 1kg", 3000, 4200, 10, 18, 260, "Almacén", "Yerba y Café"),
    ("ALM003", "Café La Virginia 500g", 4500, 6200, 6, 4, 300, "Almacén", "Yerba y Café"),
    ("ALM004", "Azúcar Ledesma 1kg", 1300, 1900, 15, 42, None, "Almacén", "Azúcar y Dulces"),
    ("ALM005", "Dulce de Leche Vacalin 400g", 2000, 2900, 8, 3, 150, "Almacén", "Azúcar y Dulces"),
    ("ALM006", "Harina 0000 Blancaflor 1kg", 1200, 1700, 15, 35, None, "Almacén", "Harinas y Pastas"),
    ("ALM007", "Fideos Tallarín Matarazzo 500g", 1100, 1600, 20, 55, None, "Almacén", "Harinas y Pastas"),
    ("ALM008", "Arroz Gallo 1kg", 1700, 2500, 15, 30, 400, "Almacén", "Arroces y Legumbres"),
    ("ALM009", "Arroz Doble Carolina 1kg", 1500, 2200, 10, 6, None, "Almacén", "Arroces y Legumbres"),
    ("ALM010", "Aceite Cocinero 1.5L", 2800, 3900, 12, 26, None, "Almacén", "Aceites y Conservas"),
    ("ALM011", "Tomate Triturado 500g", 1000, 1500, 15, 40, 300, "Almacén", "Aceites y Conservas"),
    ("ALM012", "Atún en Lata 170g", 2600, 3600, 10, 22, 500, "Almacén", "Aceites y Conservas"),
    ("ALM013", "Puré de Tomate 500g", 1100, 1700, 10, 0, None, "Almacén", "Aceites y Conservas"),
    ("ALM014", "Mayonesa Hellmann's 475g", 2500, 3400, 8, 12, 240, "Almacén", "Aceites y Conservas"),
    # Lácteos
    ("LAC001", "Leche Entera La Serenísima 1L", 1400, 2000, 15, 20, 5, "Lácteos", "Leches"),
    ("LAC002", "Leche Descremada 1L", 1400, 2000, 8, 5, 6, "Lácteos", "Leches"),
    ("LAC003", "Yogur Bebible La Serenísima 1L", 1900, 2800, 8, 12, 3, "Lácteos", "Yogures"),
    ("LAC004", "Yogur Firme x4", 1600, 2300, 6, 8, 7, "Lácteos", "Yogures"),
    ("LAC005", "Queso Cremoso 500g", 3500, 5000, 5, 7, 10, "Lácteos", "Quesos"),
    ("LAC006", "Queso Rallado 120g", 1500, 2200, 8, 14, 90, "Lácteos", "Quesos"),
    ("LAC007", "Manteca 200g", 1600, 2400, 8, 4, 15, "Lácteos", "Quesos"),
    # Limpieza
    ("LIM001", "Detergente Cif Limón 750ml", 1500, 2300, 10, 25, None, "Limpieza", "Detergentes"),
    ("LIM002", "Detergente Magistral 750ml", 1300, 2000, 10, 5, None, "Limpieza", "Detergentes"),
    ("LIM003", "Lavandina Ayudín 2L", 1100, 1700, 12, 33, None, "Limpieza", "Lavandina y Desinfectantes"),
    ("LIM004", "Desinfectante Pino 1L", 1300, 2000, 8, 18, None, "Limpieza", "Lavandina y Desinfectantes"),
    ("LIM005", "Esponja Virulana x3", 600, 1000, 15, 45, None, "Limpieza", "Esponjas y Cepillos"),
    ("LIM006", "Jabón en Polvo Ala 800g", 2300, 3300, 8, 16, None, "Limpieza", "Esponjas y Cepillos"),
    ("LIM007", "Papel Higiénico x4", 1900, 2900, 10, 22, None, "Limpieza", "Papel"),
    # Snacks
    ("SNK001", "Galletitas Oreo 300g", 1300, 1900, 12, 30, 200, "Snacks", "Galletitas"),
    ("SNK002", "Galletitas Surtidas 350g", 1100, 1600, 12, 8, 180, "Snacks", "Galletitas"),
    ("SNK003", "Chocolinas 250g", 1200, 1800, 10, 20, 180, "Snacks", "Chocolates"),
    ("SNK004", "Chocolate con Leche Milka 80g", 1700, 2400, 8, 15, 250, "Snacks", "Chocolates"),
    ("SNK005", "Papas Fritas Lays 160g", 1300, 1900, 15, 38, None, "Snacks", "Papas Fritas"),
    # Verdulería
    ("VER001", "Papa 1kg", 800, 1400, 15, 40, 14, "Verdulería", "Verduras"),
    ("VER002", "Cebolla 1kg", 900, 1500, 15, 35, 21, "Verdulería", "Verduras"),
    ("VER003", "Tomate 1kg", 1300, 2200, 10, 12, 6, "Verdulería", "Verduras"),
    ("VER004", "Zanahoria 1kg", 700, 1200, 10, 20, 10, "Verdulería", "Verduras"),
    ("VER005", "Lechuga (unidad)", 700, 1200, 8, 0, 2, "Verdulería", "Verduras"),
    # Panificación
    ("PAN001", "Pan Francés 1kg", 2000, 3000, 10, 8, 1, "Panificación", "Pan"),
    ("PAN002", "Pan de Molde 560g", 1600, 2400, 8, 6, 4, "Panificación", "Pan"),
    ("PAN003", "Facturas x6", 1500, 2200, 6, 10, 2, "Panificación", "Facturas"),
]

product_map = {}
now = datetime.now(timezone.utc)
barcode_start = 1000000000
for i, (code, name, cost, price, min_stock, stock, expiry_days, parent_cat, sub_cat) in enumerate(products_data):
    expiry = None
    if expiry_days is not None:
        expiry = date.today() + timedelta(days=expiry_days)
    p = Product(
        code=code, name=name, cost_price=cost, selling_price=price,
        min_stock=min_stock, unit="unidad", category_id=cat_map.get(sub_cat),
        description=f"{name} - Categoría: {parent_cat}",
        barcode=f"779{barcode_start + i:010d}",
        expiry_date=expiry,
    )
    db.add(p)
    db.flush()
    product_map[code] = p.id

    cs = CurrentStock(product_id=p.id, quantity=stock)
    db.add(cs)

    # Entrada inicial reciente para productos perecederos (coherente con el vencimiento)
    if expiry_days is not None and expiry_days <= 21:
        days_ago = max(0, expiry_days - random.randint(1, 5))
    else:
        days_ago = random.randint(1, 15)
    db.add(StockMovement(
        product_id=p.id, quantity=stock, movement_type="entry",
        reference_type="manual", notes="Carga inicial",
        created_at=now - timedelta(days=days_ago),
    ))

db.commit()

# === VENDORS ===
vendor_data = [("30123456", "María López"), ("30987654", "Carlos Pérez"), ("30111222", "Ana Gómez")]
vendor_map = {}
for dni, name in vendor_data:
    v = Vendor(dni=dni, name=name)
    db.add(v)
    db.flush()
    vendor_map[name] = v.id

# === CUSTOMERS ===
customers_data = [
    ("Juan Pérez", "20123456", "11 5678-9012", "Fiado, paga quincenal"),
    ("María García", "24123456", "11 6789-0123", "Cuenta corriente"),
    ("Pedro Rodríguez", "27123456", "11 7890-1234", "Paga siempre, sin deudas"),
    ("Ana Martínez", "29123456", "11 8901-2345", "Cliente nueva"),
]
customer_map = {}
for name, dni, phone, notes in customers_data:
    c = Customer(name=name, dni=dni, phone=phone, notes=notes)
    db.add(c)
    db.flush()
    customer_map[name] = c.id

    if name == "Juan Pérez":
        db.add(CustomerTransaction(customer_id=c.id, type="debt", amount=8500, notes="Compra fiado", created_at=now - timedelta(days=5)))
        db.add(CustomerTransaction(customer_id=c.id, type="payment", amount=5000, notes="Pago parcial", created_at=now - timedelta(days=2)))
    elif name == "María García":
        db.add(CustomerTransaction(customer_id=c.id, type="debt", amount=12300, notes="Compra fiado", created_at=now - timedelta(days=3)))
    elif name == "Pedro Rodríguez":
        db.add(CustomerTransaction(customer_id=c.id, type="debt", amount=4800, notes="Compra fiado", created_at=now - timedelta(days=4)))
        db.add(CustomerTransaction(customer_id=c.id, type="payment", amount=4800, notes="Pago total", created_at=now - timedelta(days=1)))

db.commit()

# === SALES (today, deterministas, con todos los métodos de pago) ===
# (hora, payment_method, cashier/vendor, customer_name (None = mostrador), discount, [(code, qty)])
today = date.today()
sales_data = [
    ("09:15", "efectivo", "María López", None, 0, [("BEB001", 2), ("SNK005", 2)]),
    ("10:30", "debito", "Carlos Pérez", None, 0, [("LAC001", 3), ("PAN001", 1), ("LAC003", 2)]),
    ("12:05", "credito", "Ana Gómez", None, 0, [("BEB004", 6), ("SNK005", 1)]),
    ("14:40", "transferencia", "María López", None, 0, [("ALM010", 2), ("ALM008", 2), ("ALM001", 1)]),
    ("16:20", "efectivo", "Carlos Pérez", None, 0, [("LIM001", 2), ("LIM003", 2), ("LIM005", 3)]),
    ("18:00", "fiado", "María López", "Juan Pérez", 0, [("VER003", 2), ("VER002", 1), ("VER004", 1), ("PAN001", 2)]),
    ("19:30", "debito", "Ana Gómez", None, 0, [("PAN003", 6), ("ALM005", 1)]),
    ("21:10", "efectivo", "María López", None, 0, [("SNK001", 3), ("SNK003", 2), ("ALM004", 1)]),
]

sales_today = []
for hora, pm, cashier, customer_name, discount, items in sales_data:
    hh, mm = map(int, hora.split(":"))
    sale = Sale(
        sale_date=today, total=0, discount=discount,
        payment_method=pm, cashier=cashier,
        vendor_id=vendor_map[cashier],
        customer_id=customer_map.get(customer_name) if customer_name else None,
        created_at=datetime.combine(today, time(hh, mm)),
    )
    db.add(sale)
    db.flush()
    total = 0
    for code, qty in items:
        price = next(p[3] for p in products_data if p[0] == code)
        subtotal = price * qty
        total += subtotal
        db.add(SaleItem(sale_id=sale.id, product_id=product_map[code], quantity=qty, unit_price=price, subtotal=subtotal))
        cs = db.query(CurrentStock).filter(CurrentStock.product_id == product_map[code]).first()
        if cs:
            cs.quantity = max(0, cs.quantity - qty)
        db.add(StockMovement(
            product_id=product_map[code], quantity=qty, movement_type="exit",
            reference_type="sale", reference_id=sale.id,
            created_at=datetime.combine(today, time(hh, mm)),
        ))
    sale.total = total - discount

    # Compra fiado registrada como deuda del cliente
    if customer_name:
        db.add(CustomerTransaction(customer_id=customer_map[customer_name], type="debt", amount=sale.total, sale_id=sale.id, notes="Compra fiado", created_at=datetime.combine(today, time(hh, mm))))
    sales_today.append(sale)

db.commit()

# === BUDGET ===
budget_items = [
    {"product_id": product_map["BEB001"], "code": "BEB001", "name": "Coca-Cola 1.5L", "quantity": 6, "unit_price": 3500},
    {"product_id": product_map["ALM008"], "code": "ALM008", "name": "Arroz Gallo 1kg", "quantity": 5, "unit_price": 2500},
    {"product_id": product_map["ALM010"], "code": "ALM010", "name": "Aceite Cocinero 1.5L", "quantity": 4, "unit_price": 3900},
    {"product_id": product_map["ALM007"], "code": "ALM007", "name": "Fideos Tallarín Matarazzo 500g", "quantity": 6, "unit_price": 1600},
    {"product_id": product_map["ALM011"], "code": "ALM011", "name": "Tomate Triturado 500g", "quantity": 10, "unit_price": 1500},
    {"product_id": product_map["ALM001"], "code": "ALM001", "name": "Yerba Playadito 1kg", "quantity": 4, "unit_price": 4800},
]
b = Budget(customer_name="Comedor Barrial", total=sum(i["quantity"] * i["unit_price"] for i in budget_items), items_json=json.dumps(budget_items), status="pending")
db.add(b)

# === PENDING ORDER ===
order_items = [
    {"product_id": product_map["ALM001"], "code": "ALM001", "name": "Yerba Playadito 1kg", "quantity": 10, "unit_price": 4800},
    {"product_id": product_map["LAC001"], "code": "LAC001", "name": "Leche Entera La Serenísima 1L", "quantity": 12, "unit_price": 2000},
    {"product_id": product_map["LAC003"], "code": "LAC003", "name": "Yogur Bebible La Serenísima 1L", "quantity": 6, "unit_price": 2800},
    {"product_id": product_map["LIM003"], "code": "LIM003", "name": "Lavandina Ayudín 2L", "quantity": 12, "unit_price": 1700},
    {"product_id": product_map["LIM007"], "code": "LIM007", "name": "Papel Higiénico x4", "quantity": 8, "unit_price": 2900},
]
po = PendingOrder(vendor_id=vendor_map["Carlos Pérez"], total=sum(i["quantity"] * i["unit_price"] for i in order_items), items_json=json.dumps(order_items), status="pending")
db.add(po)

# === DAILY REPORT (today) ===
sales_today_db = db.query(Sale).filter(Sale.sale_date == today).all()
total_sales = sum(s.total for s in sales_today_db)
items_today = sum(len(s.items) for s in sales_today_db)
cash = sum(s.total for s in sales_today_db if s.payment_method == "efectivo")
card = sum(s.total for s in sales_today_db if s.payment_method in ("debito", "credito"))
other = sum(s.total for s in sales_today_db if s.payment_method not in ("efectivo", "debito", "credito"))

name_by_id = {p.id: p.name for p in db.query(Product).all()}
top = {}
for s in sales_today_db:
    for it in s.items:
        top.setdefault(name_by_id.get(it.product_id, "?"), {"quantity": 0.0, "revenue": 0.0})
        top[name_by_id.get(it.product_id, "?")]["quantity"] += it.quantity
        top[name_by_id.get(it.product_id, "?")]["revenue"] += it.subtotal
top_items = [
    {"name": name, "quantity": round(v["quantity"], 2), "revenue": round(v["revenue"], 2)}
    for name, v in sorted(top.items(), key=lambda kv: kv[1]["revenue"], reverse=True)
]

dr = DailyReport(
    report_date=today, total_sales=total_sales, total_transactions=len(sales_today_db),
    total_items_sold=items_today, cash_sales=cash, card_sales=card, other_sales=other,
    discounts=sum(s.discount for s in sales_today_db),
    report_data=json.dumps({"by_payment": {"efectivo": cash, "tarjeta": card, "otro": other}, "top_items": top_items}, default=str),
)
db.add(dr)
db.commit()

db.close()

# === RESUMEN ===
near_expiry = [p for p in products_data if p[6] is not None and p[6] <= 30]
low_stock = [p for p in products_data if p[5] < p[4] and p[5] > 0]
zero_stock = [p for p in products_data if p[5] == 0]

print("=" * 52)
print("  DATOS DEMO POLIRRUBRO CARGADOS")
print("=" * 52)
print(f"  Categorías:     {len(cats) + sum(len(v) for v in cats.values())}")
print(f"  Productos:      {len(products_data)}")
print(f"  Ventas hoy:     {len(sales_today_db)} (${total_sales:,.0f})")
print(f"  Clientes:       {len(customers_data)}")
print(f"  Vendedores:     {len(vendor_data)}")
print(f"  Presupuesto:    1 pendiente")
print(f"  Pedido móvil:   1 pendiente")
print("  ---- Alertas para mostrar ----")
print(f"  Próximos a vencer (<=30d):  {len(near_expiry)}")
print(f"    - " + "; ".join(f"{p[1]} ({p[6]}d)" for p in sorted(near_expiry, key=lambda x: x[6])))
print(f"  Stock bajo (por debajo del mínimo): {len(low_stock)}")
print(f"    - " + "; ".join(p[1] for p in low_stock))
print(f"  Stock cero:     {len(zero_stock)}")
print(f"    - " + "; ".join(p[1] for p in zero_stock))
print("=" * 52)
print("  Abrí http://localhost:8090")
print("=" * 52)
