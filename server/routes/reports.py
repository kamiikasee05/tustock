"""Generación y exportación de reportes diarios, de ventas, productos y vendedores."""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from services.report_service import (
    generate_daily_report, get_report, get_report_range,
    export_sales_csv, export_products_csv, export_vendors_csv,
    export_monthly_csv, csv_to_xlsx,
)

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/daily/{report_date}")
def daily_report(report_date: str, db: Session = Depends(get_db)):
    """Obtiene el reporte diario ya generado para una fecha específica."""
    try:
        d = date.fromisoformat(report_date)
    except ValueError:
        raise HTTPException(400, "Formato de fecha invalido. Usar YYYY-MM-DD")

    report = get_report(db, d)
    if not report:
        raise HTTPException(404, f"No hay reporte para {report_date}")
    return report

@router.post("/daily/generate")
def generate(report_date: str = None, db: Session = Depends(get_db)):
    """Genera o actualiza el reporte diario para la fecha indicada (o la actual)."""
    d = None
    if report_date:
        try:
            d = date.fromisoformat(report_date)
        except ValueError:
            raise HTTPException(400, "Formato de fecha invalido")
    return generate_daily_report(db, d)

@router.post("/daily/{report_date}")
def generate_for_date(report_date: str, db: Session = Depends(get_db)):
    """Genera el reporte diario para una fecha específica (vía POST)."""
    try:
        d = date.fromisoformat(report_date)
    except ValueError:
        raise HTTPException(400, "Formato de fecha invalido")
    return generate_daily_report(db, d)

def _export_response(csv_data: str, filename: str, fmt: str):
    """Devuelve un StreamingResponse con CSV o XLSX según el formato solicitado."""
    if fmt == "xlsx":
        xlsx = csv_to_xlsx(csv_data)
        return StreamingResponse(
            iter([xlsx]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}.xlsx"'},
        )
    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f'attachment; filename="{filename}.csv"'},
    )

@router.get("/export/sales")
def export_sales(
    start: str = Query(...), end: str = Query(...),
    vendor_id: int = None, format: str = "csv",
    db: Session = Depends(get_db),
):
    """Exporta ventas en un rango de fechas a CSV o XLSX, opcionalmente filtrado por vendedor."""
    try:
        s, e = date.fromisoformat(start), date.fromisoformat(end)
    except ValueError:
        raise HTTPException(400, "Formato de fecha invalido")
    csv_data = export_sales_csv(db, s, e, vendor_id)
    return _export_response(csv_data, f"ventas_{start}_{end}", format)

@router.get("/export/products")
def export_products(
    start: str = Query(...), end: str = Query(...),
    format: str = "csv", db: Session = Depends(get_db),
):
    """Exporta el rendimiento de productos en un rango de fechas a CSV o XLSX."""
    try:
        s, e = date.fromisoformat(start), date.fromisoformat(end)
    except ValueError:
        raise HTTPException(400, "Formato de fecha invalido")
    csv_data = export_products_csv(db, s, e)
    return _export_response(csv_data, f"productos_{start}_{end}", format)

@router.get("/export/vendors")
def export_vendors(
    start: str = Query(...), end: str = Query(...),
    format: str = "csv", db: Session = Depends(get_db),
):
    """Exporta el desempeño de vendedores en un rango de fechas a CSV o XLSX."""
    try:
        s, e = date.fromisoformat(start), date.fromisoformat(end)
    except ValueError:
        raise HTTPException(400, "Formato de fecha invalido")
    csv_data = export_vendors_csv(db, s, e)
    return _export_response(csv_data, f"vendedores_{start}_{end}", format)

@router.get("/export/monthly")
def export_monthly(
    year: int = Query(...), month: int = Query(...),
    format: str = "csv", db: Session = Depends(get_db),
):
    """Exporta un resumen mensual con ventas, costos y ganancia bruta a CSV o XLSX."""
    csv_data = export_monthly_csv(db, year, month)
    return _export_response(csv_data, f"mensual_{year}_{month:02d}", format)

@router.get("/range")
def range_reports(start: str, end: str, db: Session = Depends(get_db)):
    """Obtiene los reportes diarios dentro de un rango de fechas."""
    try:
        s = date.fromisoformat(start)
        e = date.fromisoformat(end)
    except ValueError:
        raise HTTPException(400, "Formato de fecha invalido")
    return get_report_range(db, s, e)
