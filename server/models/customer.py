"""Modelos de clientes y sus transacciones (deudas y pagos)."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from datetime import datetime, timezone
from database import Base

class Customer(Base):
    """Cliente con datos de contacto, DNI y estado de actividad."""
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    dni = Column(String(20), nullable=True)
    phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CustomerTransaction(Base):
    """Movimiento de deuda o pago asociado a un cliente."""
    __tablename__ = "customer_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    type = Column(String(20), nullable=False)  # debt (compra fiado), payment (pago)
    amount = Column(Float, nullable=False)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
