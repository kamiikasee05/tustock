"""Creación, ejecución y finalización de auditorías de stock."""

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from database import get_db
from schemas import AuditCreate, AuditItemUpdate, ScanRequest, ImportRegister, ImportRegisterBatch
from services.audit_service import (
    create_audit, start_audit, update_audit_item,
    complete_audit, get_audit_detail, list_audits, scan_to_audit,
)

router = APIRouter(prefix="/api/audits", tags=["audits"])

@router.get("")
def list_all(db: Session = Depends(get_db)):
    """Lista todas las auditorías ordenadas por fecha de creación descendente."""
    return list_audits(db)

@router.post("")
def new_audit(data: AuditCreate, db: Session = Depends(get_db)):
    """Crea una nueva auditoría con todos los productos activos y su stock teórico."""
    return create_audit(db, data.notes, data.created_by or "local")

@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Importa una toma de stock desde CSV (barcode;cantidad;nombre;timestamp).

    Crea una auditoría en borrador con el conteo del CSV y devuelve un preview
    editable. NO aplica correcciones — el cliente confirma con POST /{id}/complete.
    """
    from services.csv_import import import_stock_csv, MAX_FILE_SIZE

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "El archivo supera los 10 MB")
    if not content:
        raise HTTPException(400, "El archivo está vacío")
    try:
        result = import_stock_csv(db, content, notes=f"Import CSV: {file.filename or 'toma de stock'}")
    except ValueError as e:
        raise HTTPException(400, str(e))
    return result

@router.post("/import-register")
def import_register(data: ImportRegister, db: Session = Depends(get_db)):
    """Registra un producto nuevo (barcode no registrado) y lo agrega a la auditoría
    del import con su conteo. El stock se aplica al completar la auditoría."""
    from services.csv_import import register_product_from_import

    try:
        return register_product_from_import(db, data.audit_id, data.barcode, data.name, data.quantity)
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.post("/import-register-batch")
def import_register_batch(data: ImportRegisterBatch, db: Session = Depends(get_db)):
    """Registra en lote todos los barcodes no registrados del import CSV en una sola
    transacción (loop server-side). Usa el nombre que vino en el CSV."""
    from services.csv_import import register_products_batch

    try:
        return register_products_batch(db, data.audit_id, [p.model_dump() for p in data.products])
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.get("/{audit_id}")
def detail(audit_id: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de una auditoría con sus items que tienen diferencias."""
    result = get_audit_detail(db, audit_id)
    if not result:
        raise HTTPException(404, "Auditoria no encontrada")
    return result

@router.post("/{audit_id}/start")
def start(audit_id: int, db: Session = Depends(get_db)):
    """Cambia el estado de la auditoría a 'en progreso'."""
    result = start_audit(db, audit_id)
    if not result:
        raise HTTPException(404, "Auditoria no encontrada")
    return result

@router.put("/{audit_id}/items")
def update_item(audit_id: int, data: AuditItemUpdate, db: Session = Depends(get_db)):
    """Actualiza el conteo real de un producto dentro de una auditoría en curso."""
    result = update_audit_item(db, audit_id, data.product_id, data.counted_qty, data.notes)
    if not result:
        raise HTTPException(404, "Item no encontrado en esta auditoria")
    return result

@router.post("/{audit_id}/scan")
def scan(audit_id: int, data: ScanRequest, db: Session = Depends(get_db)):
    """Incrementa el conteo de un producto escaneando su código durante la auditoría."""
    result = scan_to_audit(db, audit_id, data.product_code)
    if "error" in result:
        raise HTTPException(404, result["error"])
    return result

@router.post("/{audit_id}/complete")
def complete(audit_id: int, apply_corrections: bool = True, db: Session = Depends(get_db)):
    """Finaliza una auditoría y opcionalmente aplica correcciones al stock según diferencias."""
    result = complete_audit(db, audit_id, apply_corrections)
    if not result:
        raise HTTPException(404, "Auditoria no encontrada")
    return result
