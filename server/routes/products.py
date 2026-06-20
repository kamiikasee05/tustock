from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.product import Product, Category
from schemas import ProductCreate, ProductUpdate, ProductOut, CategoryCreate
from services.stock_service import get_current_stock, get_low_stock

router = APIRouter(prefix="/api/products", tags=["products"])

def to_product_out(p: Product) -> dict:
    return ProductOut(
        id=p.id, code=p.code, name=p.name, description=p.description or "",
        category_id=p.category_id, cost_price=p.cost_price,
        selling_price=p.selling_price, min_stock=p.min_stock,
        unit=p.unit, is_active=p.is_active,
    ).model_dump()

@router.get("/")
def list_products(
    db: Session = Depends(get_db),
    search: str = Query(default="", max_length=200),
    category_id: int = None,
):
    q = db.query(Product).filter(Product.is_active == True)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%") | Product.code.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(Product.category_id == category_id)
    return [to_product_out(p) for p in q.order_by(Product.name).all()]

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    return to_product_out(p)

@router.post("/")
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.code == data.code).first()
    if existing:
        raise HTTPException(400, "El codigo ya esta en uso")
    p = Product(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return to_product_out(p)

@router.put("/{product_id}")
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    return to_product_out(p)

@router.delete("/{product_id}")
def deactivate_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    p.is_active = False
    db.commit()
    return {"ok": True}

@router.get("/scan/{code}")
def scan_product(code: str, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.code == code).first()
    if not p:
        raise HTTPException(404, "Codigo no encontrado")
    return {
        "id": p.id,
        "code": p.code,
        "name": p.name,
        "description": p.description,
        "selling_price": p.selling_price,
        "stock": get_current_stock(db, p.id),
        "unit": p.unit,
    }

@router.get("/alerts/low-stock")
def low_stock_alerts(db: Session = Depends(get_db)):
    return get_low_stock(db)

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/categories")
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    c = Category(**data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c
