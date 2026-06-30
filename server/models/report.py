"""Modelo de reporte diario de ventas."""

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text
from datetime import datetime, timezone
from database import Base

class DailyReport(Base):
    """Reporte resumen de ventas de un día específico con totales, métodos de pago y top productos."""
    __tablename__ = "daily_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_date = Column(Date, nullable=False, unique=True)
    total_sales = Column(Float, default=0.0)
    total_transactions = Column(Integer, default=0)
    total_items_sold = Column(Integer, default=0)
    cash_sales = Column(Float, default=0.0)
    card_sales = Column(Float, default=0.0)
    other_sales = Column(Float, default=0.0)
    discounts = Column(Float, default=0.0)
    report_data = Column(Text, nullable=True)  # JSON snapshot
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
