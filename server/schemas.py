"""Esquemas Pydantic para validación y serialización de datos en requests/responses."""

from datetime import date
from pydantic import BaseModel, Field
from typing import Optional

class ProductCreate(BaseModel):
    """Datos para crear un nuevo producto."""
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=200)
    description: Optional[str] = Field(default="", max_length=2000)
    category_id: Optional[int] = None
    cost_price: float = Field(default=0.0, ge=0)
    selling_price: float = Field(default=0.0, ge=0)
    min_stock: int = Field(default=5, ge=0)
    unit: str = Field(default="unidad", max_length=20)
    barcode: Optional[str] = Field(default=None, max_length=50)
    expiry_date: Optional[date] = None
    initial_stock: float = Field(default=0.0, ge=0)

class ProductUpdate(BaseModel):
    """Datos para actualizar un producto existente (todos los campos son opcionales)."""
    name: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    category_id: Optional[int] = None
    cost_price: Optional[float] = Field(default=None, ge=0)
    selling_price: Optional[float] = Field(default=None, ge=0)
    min_stock: Optional[int] = Field(default=None, ge=0)
    unit: Optional[str] = Field(default=None, max_length=20)
    is_active: Optional[bool] = None
    barcode: Optional[str] = Field(default=None, max_length=50)
    expiry_date: Optional[date] = None
    initial_stock: Optional[float] = Field(default=None, ge=0)

class ProductOut(BaseModel):
    """Respuesta pública con los datos de un producto."""
    id: int
    code: str
    name: str
    description: str
    category_id: Optional[int]
    cost_price: float
    selling_price: float
    min_stock: int
    unit: str
    is_active: bool
    barcode: Optional[str] = None
    expiry_date: Optional[date] = None

class CategoryCreate(BaseModel):
    """Datos para crear una nueva categoría."""
    name: str = Field(..., max_length=100)
    parent_id: Optional[int] = None

class StockAdjustment(BaseModel):
    """Datos para realizar un ajuste de stock (entrada, salida o ajuste manual)."""
    product_id: int
    quantity: float = Field(..., gt=0)
    movement_type: str = Field(..., pattern="^(entry|exit|adjustment)$")
    notes: Optional[str] = Field(default=None, max_length=500)

class SaleItemData(BaseModel):
    """Datos de un producto individual dentro de una venta."""
    product_id: int
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)

class SaleCreate(BaseModel):
    """Datos para registrar una nueva venta con sus productos."""
    items: list[SaleItemData] = Field(..., min_length=1)
    discount: float = Field(default=0.0, ge=0)
    payment_method: str = Field(default="efectivo", max_length=50)
    notes: Optional[str] = Field(default=None, max_length=2000)
    cashier: Optional[str] = Field(default=None, max_length=100)
    customer_id: Optional[int] = Field(default=None)

class AuditCreate(BaseModel):
    """Datos para crear una nueva auditoría de stock."""
    notes: Optional[str] = Field(default=None, max_length=2000)
    created_by: Optional[str] = Field(default=None, max_length=100)

class AuditItemUpdate(BaseModel):
    """Datos para actualizar el conteo de un producto en una auditoría."""
    product_id: int
    counted_qty: float = Field(..., ge=0)
    notes: Optional[str] = Field(default=None, max_length=500)

class ScanRequest(BaseModel):
    """Código de producto escaneado durante una auditoría."""
    product_code: str = Field(..., max_length=50)

class VendorCreate(BaseModel):
    """Datos para registrar un nuevo vendedor."""
    dni: str = Field(..., max_length=20)
    name: str = Field(..., max_length=100)

class VendorLogin(BaseModel):
    """DNI del vendedor para inicio de sesión."""
    dni: str = Field(..., max_length=20)

class PendingOrderItem(BaseModel):
    """Producto individual dentro de un pedido pendiente."""
    product_id: int
    code: str
    name: str
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)

class PendingOrderCreate(BaseModel):
    """Datos para crear un nuevo pedido pendiente a un vendedor."""
    vendor_id: int
    items: list[PendingOrderItem]


class ProductListResponse(BaseModel):
    """Respuesta paginada de productos."""
    products: list[ProductOut]
    total: int
    page: int
    page_size: int
    total_pages: int
