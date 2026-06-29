from pydantic import BaseModel, Field
from typing import Optional

class ProductCreate(BaseModel):
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=200)
    description: Optional[str] = Field(default="", max_length=2000)
    category_id: Optional[int] = None
    cost_price: float = Field(default=0.0, ge=0)
    selling_price: float = Field(default=0.0, ge=0)
    min_stock: int = Field(default=5, ge=0)
    unit: str = Field(default="unidad", max_length=20)
    barcode: Optional[str] = Field(default=None, max_length=50)

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    category_id: Optional[int] = None
    cost_price: Optional[float] = Field(default=None, ge=0)
    selling_price: Optional[float] = Field(default=None, ge=0)
    min_stock: Optional[int] = Field(default=None, ge=0)
    unit: Optional[str] = Field(default=None, max_length=20)
    is_active: Optional[bool] = None
    barcode: Optional[str] = Field(default=None, max_length=50)

class ProductOut(BaseModel):
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

class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=100)
    parent_id: Optional[int] = None

class StockAdjustment(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)
    movement_type: str = Field(..., pattern="^(entry|exit|adjustment)$")
    notes: Optional[str] = Field(default=None, max_length=500)

class SaleItemData(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)

class SaleCreate(BaseModel):
    items: list[SaleItemData] = Field(..., min_length=1)
    discount: float = Field(default=0.0, ge=0)
    payment_method: str = Field(default="efectivo", max_length=50)
    notes: Optional[str] = Field(default=None, max_length=2000)
    cashier: Optional[str] = Field(default=None, max_length=100)

class AuditCreate(BaseModel):
    notes: Optional[str] = Field(default=None, max_length=2000)
    created_by: Optional[str] = Field(default=None, max_length=100)

class AuditItemUpdate(BaseModel):
    product_id: int
    counted_qty: float = Field(..., ge=0)
    notes: Optional[str] = Field(default=None, max_length=500)

class ScanRequest(BaseModel):
    product_code: str = Field(..., max_length=50)

class VendorCreate(BaseModel):
    dni: str = Field(..., max_length=20)
    name: str = Field(..., max_length=100)

class VendorLogin(BaseModel):
    dni: str = Field(..., max_length=20)

class PendingOrderItem(BaseModel):
    product_id: int
    code: str
    name: str
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)

class PendingOrderCreate(BaseModel):
    vendor_id: int
    items: list[PendingOrderItem]
