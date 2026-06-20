from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from services.report_service import generate_daily_report, get_report, get_report_range

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/daily/{report_date}")
def daily_report(report_date: str, db: Session = Depends(get_db)):
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
    d = None
    if report_date:
        try:
            d = date.fromisoformat(report_date)
        except ValueError:
            raise HTTPException(400, "Formato de fecha invalido")
    return generate_daily_report(db, d)

@router.post("/daily/{report_date}")
def generate_for_date(report_date: str, db: Session = Depends(get_db)):
    try:
        d = date.fromisoformat(report_date)
    except ValueError:
        raise HTTPException(400, "Formato de fecha invalido")
    return generate_daily_report(db, d)

@router.get("/range")
def range_reports(start: str, end: str, db: Session = Depends(get_db)):
    try:
        s = date.fromisoformat(start)
        e = date.fromisoformat(end)
    except ValueError:
        raise HTTPException(400, "Formato de fecha invalido")
    return get_report_range(db, s, e)
