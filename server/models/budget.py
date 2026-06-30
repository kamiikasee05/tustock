"""Modelo de presupuestos (cotizaciones) para clientes."""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, timezone
from database import Base

class Budget(Base):
    """Presupuesto con items en JSON, total, estado (pending/approved/rejected) y nombre del cliente."""
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_name = Column(String(200), nullable=True)
    total = Column(Float, nullable=False, default=0.0)
    items_json = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processed_at = Column(DateTime, nullable=True)
