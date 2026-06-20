import json
from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.sale import Sale, SaleItem
from models.product import Product
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
