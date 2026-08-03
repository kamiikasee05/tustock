"""Consulta y gestión de productos y categorías."""

from datetime import date, timedelta
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import get_db
from models.product import Product, Category
from models.stock import CurrentStock
from schemas import ProductCreate, ProductUpdate, ProductOut, CategoryCreate, ProductListResponse
from services.stock_service import get_current_stock, get_low_stock

router = APIRouter(prefix="/api/products", tags=["products"])

def to_product_out(p: Product, stock: float = None) -> dict:
    """Convierte un modelo Product en diccionario con nombre de categoría incluido."""
    data = ProductOut(
        id=p.id, code=p.code, name=p.name, description=p.description or "",
        category_id=p.category_id, cost_price=p.cost_price,
        selling_price=p.selling_price, min_stock=p.min_stock,
        unit=p.unit, is_active=p.is_active, barcode=p.barcode,
        expiry_date=p.expiry_date,
        stock=stock if stock is not None else 0.0,
    ).model_dump()
    data["category_name"] = p.category.name if p.category else None
    return data

@router.get("", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    search: str = Query(default="", max_length=200),
    category_id: int = None,
    include_inactive: bool = False,
    near_expiry: int = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
):
    """Lista productos con paginación, búsqueda (name/code/barcode) y filtros opcionales.
    
    Query params:
    - search: filtra por name, code o barcode (ILIKE)
    - category_id: filtra por categoría
    - include_inactive: incluye productos desactivados (default false)
    - near_expiry: productos que vencen en N días
    - page: página (1-based, default 1)
    - page_size: items por página (1-200, default 50)
    """
    q = db.query(Product)
    if not include_inactive:
        q = q.filter(Product.is_active == True)
    if search:
        s = f"%{search}%"
        q = q.filter(
            Product.name.ilike(s) 
            | Product.code.ilike(s) 
            | Product.barcode.ilike(s)
        )
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if near_expiry:
        cutoff = date.today() + timedelta(days=near_expiry)
        q = q.filter(Product.expiry_date <= cutoff)
    
    total = q.count()
    total_pages = (total + page_size - 1) // page_size
    offset = (page - 1) * page_size
    products = q.order_by(Product.name).offset(offset).limit(page_size).all()

    stock_map = {}
    if products:
        cs_rows = (
            db.query(CurrentStock)
            .filter(CurrentStock.product_id.in_([p.id for p in products]))
            .all()
        )
        stock_map = {cs.product_id: cs.quantity for cs in cs_rows}

    return {
        "products": [to_product_out(p, stock=stock_map.get(p.id, 0.0)) for p in products],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

@router.get("/generate-code")
def generate_barcode(db: Session = Depends(get_db)):
    """Genera un código único aleatorio con prefijo TST para un nuevo producto."""
    import random, string
    prefix = "TST"
    while True:
        code = prefix + "".join(random.choices(string.digits, k=10))
        existing = db.query(Product).filter(Product.code == code).first()
        if not existing:
            break
    return {"code": code}

@router.get("/scan/{code}")
def scan_product(code: str, db: Session = Depends(get_db)):
    """Busca un producto por código o código de barras y devuelve su info básica con stock actual."""
    p = db.query(Product).filter((Product.code == code) | (Product.barcode == code)).first()
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

@router.get("/barcode/next")
def next_barcode(db: Session = Depends(get_db)):
    """Genera un código de barras numérico único de 12 dígitos comenzando con 2."""
    import random
    while True:
        code = "2" + "".join(random.choices("0123456789", k=11))
        existing = db.query(Product).filter(Product.barcode == code).first()
        if not existing:
            break
    return {"barcode": code}

@router.post("/{product_id}/barcode")
def generate_product_barcode(product_id: int, db: Session = Depends(get_db)):
    """Asigna un código de barras único a un producto que aún no tenga uno."""
    import random
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    if p.barcode:
        return {"barcode": p.barcode}
    for _ in range(100):
        code = "2" + "".join(random.choices("0123456789", k=11))
        existing = db.query(Product).filter(Product.barcode == code).first()
        if not existing:
            p.barcode = code
            db.commit()
            return {"barcode": code}
    raise HTTPException(500, "No se pudo generar un codigo unico")

@router.get("/alerts/low-stock")
def low_stock_alerts(db: Session = Depends(get_db)):
    """Devuelve los productos cuyo stock actual es menor o igual al stock mínimo."""
    return get_low_stock(db)

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    """Obtiene la lista completa de categorías."""
    return db.query(Category).all()

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Obtiene un producto por su ID con toda su información."""
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    return to_product_out(p, stock=get_current_stock(db, p.id))

@router.post("")
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    from services.license_service import can_add_product
    from services.stock_service import adjust_stock
    from sqlalchemy.exc import IntegrityError
    ok, msg = can_add_product(db)
    if not ok:
        raise HTTPException(403, msg)
    existing = db.query(Product).filter(Product.code == data.code).first()
    if existing:
        raise HTTPException(400, "El codigo ya esta en uso")
    payload = data.model_dump()
    if payload.get("barcode") == "":
        payload["barcode"] = None
    initial_stock_val = payload.pop("initial_stock", 0) or 0
    p = Product(**payload)
    db.add(p)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "El código o código de barras ya está en uso")
    db.refresh(p)
    if initial_stock_val > 0:
        adjust_stock(db, p.id, float(initial_stock_val), "adjustment", notes="Stock inicial")
    return to_product_out(p, stock=get_current_stock(db, p.id))

@router.put("/{product_id}")
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    """Actualiza los campos enviados de un producto existente."""
    from sqlalchemy.exc import IntegrityError
    from services.stock_service import get_current_stock, adjust_stock
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    payload = data.model_dump(exclude_unset=True)
    initial_stock_val = payload.pop("initial_stock", None)
    for k, v in payload.items():
        setattr(p, k, v)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "El código o código de barras ya está en uso")
    db.refresh(p)
    if initial_stock_val is not None:
        current = get_current_stock(db, product_id)
        if current != initial_stock_val:
            adjust_stock(db, product_id, float(initial_stock_val), "adjustment", notes="Stock inicial (edición)")
    return to_product_out(p, stock=get_current_stock(db, p.id))

@router.delete("/{product_id}")
def deactivate_product(product_id: int, db: Session = Depends(get_db)):
    """Desactiva un producto (borrado lógico) sin eliminarlo de la base de datos."""
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    p.is_active = False
    db.commit()
    return {"ok": True}

@router.post("/{product_id}/reactivate")
def reactivate_product(product_id: int, db: Session = Depends(get_db)):
    """Reactivar un producto previamente desactivado."""
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    p.is_active = True
    db.commit()
    return {"ok": True}

@router.get("/barcodes/pdf")
def barcodes_pdf(
    db: Session = Depends(get_db),
    search: str = Query(default="", max_length=200),
    category_id: int = Query(default=None),
):
    """Genera un PDF imprimible A4 con etiquetas de código de barras en grilla 3×N."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas
    from reportlab.graphics.barcode import createBarcodeDrawing

    q = db.query(Product).filter(Product.barcode.isnot(None), Product.is_active == True)
    if search:
        s = search
        q = q.filter(Product.name.ilike(f"%{s}%") | Product.barcode.ilike(f"%{s}%"))
    if category_id:
        q = q.filter(Product.category_id == category_id)
    products = q.order_by(Product.name).all()
    if not products:
        raise HTTPException(404, {"error": "No hay productos con código de barras"})

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    pw, ph = A4

    mx = 8 * mm
    my = 8 * mm
    lw = (pw - 2 * mx) / 3
    lh = 27 * mm
    gap = 2 * mm
    cols = 3
    rows = int((ph - 2 * my) / (lh + gap))

    for i, p in enumerate(products):
        pi = i % (cols * rows)
        if pi == 0 and i > 0:
            c.showPage()
        col = pi % cols
        row = pi // cols
        x = mx + col * (lw + gap)
        y = ph - my - (row + 1) * (lh + gap)

        c.setStrokeColorRGB(0.85, 0.85, 0.85)
        c.rect(x, y, lw, lh)

        code_val = p.barcode or p.code
        try:
            d = createBarcodeDrawing('Code128', value=code_val, barHeight=9*mm, barWidth=0.2*mm)
            d.drawOn(c, x + 1.5*mm, y + lh - 13.5*mm)
        except Exception:
            pass

        c.setFont("Helvetica", 5)
        c.drawCentredString(x + lw / 2, y + lh - 15.5*mm, code_val)

        c.setFont("Helvetica", 6.5)
        name = p.name[:48] if p.name else ""
        c.drawCentredString(x + lw / 2, y + 5.5*mm, name)

        c.setFont("Helvetica-Bold", 8)
        price = f"${p.selling_price:,.0f}"
        c.drawCentredString(x + lw / 2, y + 1*mm, price)

    c.save()
    buf.seek(0)
    return Response(
        content=buf.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": 'inline; filename="etiquetas.pdf"'},
    )

@router.post("/categories")
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    """Crea una nueva categoría o subcategoría."""
    c = Category(**data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c
