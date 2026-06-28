import csv, io, json
from datetime import date, datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from models.sale import Sale, SaleItem
from models.product import Product
from models.vendor import Vendor
from models.report import DailyReport

def generate_daily_report(db: Session, report_date: date = None):
    if report_date is None:
        report_date = date.today()

    existing = db.query(DailyReport).filter(DailyReport.report_date == report_date).first()

    sales = db.query(Sale).filter(Sale.sale_date == report_date).all()

    total_sales = sum(s.total for s in sales)
    total_transactions = len(sales)
    total_items = sum(len(s.items) for s in sales)
    discounts = sum(s.discount for s in sales)

    cash_sales = sum(s.total for s in sales if s.payment_method == "efectivo")
    card_sales = sum(s.total for s in sales if s.payment_method in ("debito", "credito"))
    other_sales = sum(s.total for s in sales if s.payment_method not in ("efectivo", "debito", "credito"))

    # Top selling items
    items_data = (
        db.query(
            SaleItem.product_id,
            Product.name,
            func.sum(SaleItem.quantity).label("total_qty"),
            func.sum(SaleItem.subtotal).label("total_revenue"),
        )
        .join(Product, SaleItem.product_id == Product.id)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .filter(Sale.sale_date == report_date)
        .group_by(SaleItem.product_id, Product.name)
        .order_by(func.sum(SaleItem.subtotal).desc())
        .limit(20)
        .all()
    )

    top_items = [
        {"product_id": pid, "name": name, "quantity": float(qty), "revenue": float(rev)}
        for pid, name, qty, rev in items_data
    ]

    report_data = {
        "by_payment": {"efectivo": cash_sales, "tarjeta": card_sales, "otro": other_sales},
        "top_items": top_items,
    }

    if existing:
        existing.total_sales = total_sales
        existing.total_transactions = total_transactions
        existing.total_items_sold = total_items
        existing.cash_sales = cash_sales
        existing.card_sales = card_sales
        existing.other_sales = other_sales
        existing.discounts = discounts
        existing.report_data = json.dumps(report_data, default=str)
        existing.generated_at = datetime.now(timezone.utc)
    else:
        dr = DailyReport(
            report_date=report_date,
            total_sales=total_sales,
            total_transactions=total_transactions,
            total_items_sold=total_items,
            cash_sales=cash_sales,
            card_sales=card_sales,
            other_sales=other_sales,
            discounts=discounts,
            report_data=json.dumps(report_data, default=str),
        )
        db.add(dr)
        existing = dr

    db.commit()

    return {
        "date": str(report_date),
        "total_sales": total_sales,
        "total_transactions": total_transactions,
        "total_items_sold": total_items,
        "discounts": discounts,
        "cash_sales": cash_sales,
        "card_sales": card_sales,
        "other_sales": other_sales,
        "top_items": top_items,
    }

def get_report(db: Session, report_date: date = None):
    if report_date is None:
        report_date = date.today()

    dr = db.query(DailyReport).filter(DailyReport.report_date == report_date).first()
    if not dr:
        return None

    return {
        "date": str(dr.report_date),
        "total_sales": dr.total_sales,
        "total_transactions": dr.total_transactions,
        "total_items_sold": dr.total_items_sold,
        "discounts": dr.discounts,
        "cash_sales": dr.cash_sales,
        "card_sales": dr.card_sales,
        "other_sales": dr.other_sales,
        "top_items": json.loads(dr.report_data)["top_items"] if dr.report_data else [],
        "generated_at": str(dr.generated_at) if dr.generated_at else None,
    }

def get_report_range(db: Session, start: date, end: date):
    reports = db.query(DailyReport).filter(
        DailyReport.report_date >= start,
        DailyReport.report_date <= end,
    ).order_by(DailyReport.report_date.desc()).all()

    return [
        {
            "date": str(r.report_date),
            "total_sales": r.total_sales,
            "total_transactions": r.total_transactions,
            "cash_sales": r.cash_sales,
            "card_sales": r.card_sales,
        }
        for r in reports
    ]

def export_sales_csv(db: Session, start: date, end: date, vendor_id: int = None):
    q = (
        db.query(
            Sale.sale_date, Sale.created_at, Vendor.name.label("vendor_name"),
            Vendor.dni.label("vendor_dni"), Sale.cashier, Product.name.label("product_name"),
            Product.code.label("product_code"), SaleItem.quantity,
            SaleItem.unit_price, SaleItem.subtotal, Sale.total, Sale.discount,
            Sale.payment_method, Sale.notes,
        )
        .select_from(SaleItem)
        .join(Sale)
        .join(Product)
        .outerjoin(Vendor, Sale.vendor_id == Vendor.id)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .order_by(Sale.sale_date, Sale.created_at)
    )
    if vendor_id:
        q = q.filter(Sale.vendor_id == vendor_id)

    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["Fecha","Hora","Vendedor","DNI Vendedor","Cajero","Producto","Código","Cantidad","P.Unitario","Subtotal","Total Venta","Descuento","Método Pago","Notas"])
    for r in q.all():
        w.writerow([
            r.sale_date, r.created_at.strftime("%H:%M") if r.created_at else "",
            r.vendor_name or "", r.vendor_dni or "", r.cashier or "",
            r.product_name, r.product_code, r.quantity, r.unit_price, r.subtotal,
            r.total, r.discount, r.payment_method or "", r.notes or "",
        ])
    return out.getvalue()

def export_products_csv(db: Session, start: date, end: date):
    data = (
        db.query(
            Product.name, Product.code, Product.cost_price,
            func.sum(SaleItem.quantity).label("qty"),
            func.sum(SaleItem.subtotal).label("revenue"),
        )
        .join(SaleItem, Product.id == SaleItem.product_id)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .group_by(Product.id, Product.name, Product.code, Product.cost_price)
        .order_by(func.sum(SaleItem.subtotal).desc())
        .all()
    )
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["Producto","Código","Cant. Vendida","Ingresos","Costo Total","Margen Bruto","% Margen"])
    for r in data:
        cost_total = r.qty * r.cost_price
        margin = r.revenue - cost_total
        pct = (margin / r.revenue * 100) if r.revenue else 0
        w.writerow([r.name, r.code, r.qty, round(r.revenue,2), round(cost_total,2), round(margin,2), f"{pct:.1f}%"])
    return out.getvalue()

def export_vendors_csv(db: Session, start: date, end: date):
    data = (
        db.query(
            Vendor.name, Vendor.dni,
            func.count(Sale.id.distinct()).label("sales_count"),
            func.sum(Sale.total).label("total_sold"),
        )
        .join(Sale, Vendor.id == Sale.vendor_id)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .group_by(Vendor.id, Vendor.name, Vendor.dni)
        .order_by(func.sum(Sale.total).desc())
        .all()
    )
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["Vendedor","DNI","Ventas","Total Vendido","Ticket Promedio"])
    for r in data:
        avg = r.total_sold / r.sales_count if r.sales_count else 0
        w.writerow([r.name, r.dni, r.sales_count, round(r.total_sold,2), round(avg,2)])
    return out.getvalue()

def export_monthly_csv(db: Session, year: int, month: int):
    from calendar import monthrange
    start = date(year, month, 1)
    end = date(year, month, monthrange(year, month)[1])

    sales = db.query(Sale).filter(Sale.sale_date >= start, Sale.sale_date <= end).all()
    total_sales = sum(s.total for s in sales)
    transactions = len(sales)
    items = sum(len(s.items) for s in sales)
    discounts = sum(s.discount for s in sales)
    cash = sum(s.total for s in sales if s.payment_method == "efectivo")
    card = sum(s.total for s in sales if s.payment_method in ("debito","credito"))
    other = sum(s.total for s in sales if s.payment_method not in ("efectivo","debito","credito"))

    cost_data = (
        db.query(
            func.sum(SaleItem.quantity * Product.cost_price).label("cost_total")
        )
        .join(Product, SaleItem.product_id == Product.id)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .filter(Sale.sale_date >= start, Sale.sale_date <= end)
        .first()
    )
    cost_total = cost_data.cost_total or 0
    gross_profit = total_sales - cost_total

    month_label = f"{year}-{month:02d}"
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["Mes","Ventas","Transacciones","Items","Efectivo","Tarjeta","Otros","Descuentos","Costo Total","Ganancia Bruta"])
    w.writerow([month_label, round(total_sales,2), transactions, items, round(cash,2), round(card,2), round(other,2), round(discounts,2), round(cost_total,2), round(gross_profit,2)])
    return out.getvalue()

def csv_to_xlsx(csv_content: str, sheet_name: str = "Reporte") -> bytes:
    import openpyxl
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = sheet_name
    reader = csv.reader(io.StringIO(csv_content))
    for row in reader:
        ws.append(row)
    out = io.BytesIO()
    wb.save(out)
    return out.getvalue()
