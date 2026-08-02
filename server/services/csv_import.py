"""Import de toma de stock desde CSV generado por la app Stock.

Formato definido (Opción E):
    barcode;cantidad;nombre;timestamp
    Separador: ';'  |  Encoding: UTF-8 con BOM (opcional)  |  Quoting RFC 4180
    Header opcional (barcode;cantidad;nombre;fecha).
    Duplicados: append aditivo — dos líneas con el mismo barcode se SUMAN.
    El nombre del CSV es solo referencia legible; la verdad la pone el barcode.
"""

from collections import OrderedDict

from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.audit import StockAudit, AuditItem
from models.product import Product
from services.audit_service import create_audit, update_audit_item
from services.stock_service import get_current_stock

MAX_FILE_SIZE = 10 * 1024 * 1024


def decode_csv_bytes(content: bytes) -> str:
    """Decodifica el CSV respetando BOM UTF-8 o UTF-16 (Excel suele guardarlo así)."""
    if content[:2] in (b"\xff\xfe", b"\xfe\xff"):
        return content.decode("utf-16", errors="replace")
    if content[:3] == b"\xef\xbb\xbf":
        return content[3:].decode("utf-8", errors="replace")
    return content.decode("utf-8", errors="replace")


def split_csv_fields(data: str) -> list[list[str]]:
    """Divide el texto CSV en filas de campos respetando quoting RFC 4180."""
    rows: list[list[str]] = []
    row: list[str] = []
    field: list[str] = []
    in_quotes = False
    i = 0
    n = len(data)
    while i < n:
        ch = data[i]
        if in_quotes:
            if ch == '"':
                if i + 1 < n and data[i + 1] == '"':
                    field.append('"')
                    i += 2
                    continue
                in_quotes = False
                i += 1
                continue
            field.append(ch)
            i += 1
            continue
        if ch == '"':
            in_quotes = True
            i += 1
            continue
        if ch == ";":
            row.append("".join(field))
            field = []
            i += 1
            continue
        if ch == "\n":
            row.append("".join(field))
            rows.append(row)
            row = []
            field = []
            i += 1
            continue
        if ch == "\r":
            i += 1
            continue
        field.append(ch)
        i += 1
    if field or row:
        row.append("".join(field))
        rows.append(row)
    return rows


def parse_quantity(raw: str):
    """Convierte la cantidad a float, tolerando coma decimal y espacios."""
    s = raw.replace(" ", "").replace("\u00a0", "")
    if "," in s and "." not in s:
        s = s.replace(",", ".")
    try:
        v = float(s)
        if v < 0:
            return None
        return v
    except ValueError:
        return None


def parse_stock_csv(content: bytes) -> dict:
    """Parsea el CSV de toma de stock y devuelve filas válidas y errores de formato."""
    text = decode_csv_bytes(content)
    raw_rows = split_csv_fields(text)

    rows = []
    malformed = []
    skipped = 0
    first_data = True
    for idx, fields in enumerate(raw_rows):
        line_no = idx + 1
        cleaned = [f.strip() for f in fields]
        if not any(cleaned):
            skipped += 1
            continue
        if len(cleaned) < 2:
            malformed.append({"line": line_no, "message": "Línea incompleta (faltan columnas)"})
            continue

        barcode, qty_raw = cleaned[0], cleaned[1]
        name = cleaned[2] if len(cleaned) > 2 else ""
        if name.strip().lower() in ("(no registrado)", "no registrado"):
            name = ""

        if first_data:
            first_data = False
            lower0 = barcode.lower()
            if lower0 in ("barcode", "codigo", "código", "code", "sku", "ean", "gtin") or \
               qty_raw.lower().startswith("cantidad") or parse_quantity(qty_raw) is None:
                continue

        if not barcode:
            malformed.append({"line": line_no, "message": "Código de barras vacío"})
            continue

        qty = parse_quantity(qty_raw)
        if qty is None:
            malformed.append({
                "line": line_no, "barcode": barcode, "name": name,
                "message": f"Cantidad inválida: {qty_raw}",
            })
            continue

        rows.append({"line": line_no, "barcode": barcode, "quantity": qty, "name": name})

    return {"rows": rows, "malformed": malformed, "skipped": skipped}


def resolve_products(db: Session, barcodes: list[str]) -> dict:
    """Resuelve barcodes a productos (por barcode o code) en una sola consulta."""
    by_barcode: dict = {}
    by_code: dict = {}
    if barcodes:
        products = (
            db.query(Product)
            .filter(Product.is_active == True)
            .filter(or_(Product.barcode.in_(barcodes), Product.code.in_(barcodes)))
            .all()
        )
        for p in products:
            if p.barcode and p.barcode not in by_barcode:
                by_barcode[p.barcode] = p
            if p.code and p.code not in by_code:
                by_code[p.code] = p
    lookup = {}
    for b in barcodes:
        if b in by_barcode:
            lookup[b] = by_barcode[b]
        elif b in by_code:
            lookup[b] = by_code[b]
    return lookup


def import_stock_csv(db: Session, content: bytes, notes: str = None) -> dict:
    """Crea una auditoría draft con el conteo del CSV y devuelve el preview para la UI.

    NO aplica correcciones — el cliente confirma desde la web (POST /audits/{id}/complete).
    """
    if not content:
        raise ValueError("El archivo está vacío")
    if len(content) > MAX_FILE_SIZE:
        raise ValueError("El archivo supera los 10 MB")

    parsed = parse_stock_csv(content)

    aggregated: OrderedDict = OrderedDict()
    for r in parsed["rows"]:
        key = r["barcode"]
        if key not in aggregated:
            aggregated[key] = {"quantity": 0.0, "name": r["name"], "lines": []}
        aggregated[key]["quantity"] += r["quantity"]
        aggregated[key]["lines"].append(r["line"])
        if not aggregated[key]["name"] and r["name"]:
            aggregated[key]["name"] = r["name"]

    barcodes = list(aggregated.keys())
    lookup = resolve_products(db, barcodes)

    matched = []
    errors = []
    for barcode in barcodes:
        info = aggregated[barcode]
        product = lookup.get(barcode)
        if not product:
            errors.append({
                "line": info["lines"][0],
                "barcode": barcode,
                "name": info["name"],
                "quantity": info["quantity"],
                "message": "Producto no registrado",
            })
            continue
        matched.append({"product": product, "scanned": barcode, "counted": info["quantity"]})

    audit_id = None
    items = []
    registerable = [e for e in errors if e.get("barcode")]
    if matched or registerable:
        created = create_audit(
            db, notes=notes, created_by="import-csv",
            product_ids=[m["product"].id for m in matched],
        )
        audit_id = created["id"]
        for m in matched:
            upd = update_audit_item(db, audit_id, m["product"].id, m["counted"])
            items.append({
                "product_id": m["product"].id,
                "code": m["product"].code,
                "barcode": m["product"].barcode or m["scanned"],
                "scanned": m["scanned"],
                "name": m["product"].name,
                "theoretical_qty": upd["theoretical"],
                "counted_qty": upd["counted"],
                "difference": upd["difference"],
            })

    return {
        "audit_id": audit_id,
        "status": "draft" if audit_id else "none",
        "total_items": len(barcodes),
        "matched": len(matched),
        "skipped": parsed["skipped"],
        "malformed": parsed["malformed"],
        "errors": errors,
        "items": items,
    }


def register_product_from_import(db: Session, audit_id: int, barcode: str, name: str, quantity: float) -> dict:
    """Registra un producto nuevo y lo agrega a la auditoría de import con su conteo.

    El stock se aplica recién cuando la auditoría se completa (like el resto del import).
    """
    import random
    import string

    from sqlalchemy.exc import IntegrityError

    from services.license_service import can_add_product

    barcode = (barcode or "").strip()
    name = (name or "").strip()
    if not barcode:
        raise ValueError("Código de barras vacío")
    if not name:
        raise ValueError("Nombre requerido")

    audit = db.query(StockAudit).filter(StockAudit.id == audit_id).first()
    if not audit:
        raise ValueError("Auditoría no encontrada")
    if audit.status == "completed":
        raise ValueError("La auditoría ya fue completada")

    ok, msg = can_add_product(db)
    if not ok:
        raise PermissionError(msg)

    existing = db.query(Product).filter((Product.barcode == barcode) | (Product.code == barcode)).first()
    if existing:
        raise ValueError("El código de barras ya está registrado")

    code = "TST" + "".join(random.choices(string.digits, k=10))
    while db.query(Product).filter(Product.code == code).first():
        code = "TST" + "".join(random.choices(string.digits, k=10))

    product = Product(
        code=code,
        name=name[:200],
        barcode=barcode,
        description="",
        cost_price=0.0,
        selling_price=0.0,
        min_stock=0,
        unit="unidad",
        is_active=True,
    )
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("El código de barras ya está registrado")
    db.refresh(product)

    theoretical = get_current_stock(db, product.id)
    item = AuditItem(
        audit_id=audit.id,
        product_id=product.id,
        theoretical_qty=theoretical,
        counted_qty=float(quantity),
        difference=float(quantity),
    )
    db.add(item)
    db.commit()

    return {
        "product_id": product.id,
        "code": product.code,
        "barcode": product.barcode,
        "scanned": barcode,
        "name": product.name,
        "theoretical_qty": theoretical,
        "counted_qty": float(quantity),
        "difference": float(quantity),
    }


def register_products_batch(db: Session, audit_id: int, products: list[dict]) -> dict:
    """Registra en lote los productos nuevos (barcodes no registrados) del import CSV.

    products: lista de {"barcode", "name", "quantity"}. Todo se hace en una sola
    transacción. Respeta el límite de productos del plan y responde errores por fila.
    """
    import random
    import string

    from services.license_service import can_add_product, get_license

    audit = db.query(StockAudit).filter(StockAudit.id == audit_id).first()
    if not audit:
        raise ValueError("Auditoría no encontrada")
    if audit.status == "completed":
        raise ValueError("La auditoría ya fue completada")

    lic = get_license(db)
    if not lic:
        raise PermissionError("No hay licencia activa")
    active_count = db.query(Product).filter(Product.is_active == True).count()
    allowed = (lic.max_products - active_count) if lic else 0

    seen: OrderedDict = OrderedDict()
    for item in products:
        barcode = (item.get("barcode") or "").strip()
        if not barcode:
            continue
        name = (item.get("name") or "").strip()
        if name.lower() in ("(no registrado)", "no registrado"):
            name = ""
        if barcode not in seen:
            seen[barcode] = {"name": "", "quantity": 0.0}
        seen[barcode]["quantity"] += float(item.get("quantity") or 0)
        if not seen[barcode]["name"] and name:
            seen[barcode]["name"] = name

    existing = resolve_products(db, list(seen.keys()))

    created = []
    errors = []
    for barcode, info in seen.items():
        if barcode in existing:
            errors.append({
                "barcode": barcode, "name": info["name"],
                "message": "El código de barras ya está registrado",
            })
            continue
        if not info["name"]:
            errors.append({"barcode": barcode, "name": "", "message": "Nombre requerido"})
            continue
        if allowed <= 0:
            errors.append({
                "barcode": barcode, "name": info["name"],
                "message": "Límite de productos alcanzado",
            })
            continue

        code = "TST" + "".join(random.choices(string.digits, k=10))
        while db.query(Product).filter(Product.code == code).first():
            code = "TST" + "".join(random.choices(string.digits, k=10))

        product = Product(
            code=code,
            name=info["name"][:200],
            barcode=barcode,
            description="",
            cost_price=0.0,
            selling_price=0.0,
            min_stock=0,
            unit="unidad",
            is_active=True,
        )
        db.add(product)
        db.flush()

        theoretical = get_current_stock(db, product.id)
        db.add(AuditItem(
            audit_id=audit.id,
            product_id=product.id,
            theoretical_qty=theoretical,
            counted_qty=info["quantity"],
            difference=info["quantity"],
        ))
        allowed -= 1
        created.append({
            "product_id": product.id,
            "code": product.code,
            "barcode": product.barcode,
            "scanned": barcode,
            "name": product.name,
            "theoretical_qty": theoretical,
            "counted_qty": info["quantity"],
            "difference": info["quantity"],
        })

    db.commit()
    return {"created": created, "errors": errors, "total": len(seen)}
