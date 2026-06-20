from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, date
from database import Base

class StockAudit(Base):
    __tablename__ = "stock_audits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    audit_date = Column(Date, nullable=False, default=date.today)
    status = Column(String(20), default="draft")  # draft, in_progress, completed
    notes = Column(Text, nullable=True)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    items = relationship("AuditItem", back_populates="audit", cascade="all, delete-orphan")

class AuditItem(Base):
    __tablename__ = "audit_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    audit_id = Column(Integer, ForeignKey("stock_audits.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    theoretical_qty = Column(Float, nullable=False)
    counted_qty = Column(Float, nullable=True)
    difference = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    audit = relationship("StockAudit", back_populates="items")
