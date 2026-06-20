from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    products = relationship("Product", back_populates="category")
    children = relationship("Category", backref="parent", remote_side=[id])

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    cost_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    min_stock = Column(Integer, default=5)
    unit = Column(String(20), default="unidad")
    image_path = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category = relationship("Category", back_populates="products")
