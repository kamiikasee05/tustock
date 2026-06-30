"""Modelos de stock actual y movimientos de stock."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class CurrentStock(Base):
    """Cantidad actual disponible de cada producto en el inventario."""
    __tablename__ = "current_stock"

    product_id = Column(Integer, ForeignKey("products.id"), primary_key=True)
    quantity = Column(Float, nullable=False, default=0.0)

class StockMovement(Base):
    """Registro histórico de entrada, salida o ajuste de stock de un producto."""
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    movement_type = Column(String(20), nullable=False)  # entry, exit, adjustment, audit_correction
    reference_type = Column(String(50), nullable=True)   # purchase, sale, audit, manual
    reference_id = Column(Integer, nullable=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
