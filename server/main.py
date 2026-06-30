import uvicorn
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from fastapi import HTTPException
from database import init_db, get_db
from config import API_HOST, API_PORT, WEB_DIR, CORS_ORIGINS
from auth import verify_token
from sqlalchemy.orm import Session
from models.product import Product

app = FastAPI(
    title="TUSTOCK",
    description="Sistema de gestion de stock para polirrubros",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/server-info")
def server_info():
    import socket

    VIRTUAL_RANGES = [
        ("192.168.56.", "VirtualBox"),
        ("172.17.", "Docker"),
        ("172.18.", "Docker"),
        ("172.19.", "Docker"),
        ("172.20.", "Docker"),
        ("172.21.", "Docker"),
    ]

    hostname = socket.gethostname()
    all_ips = []
    try:
        for info in socket.getaddrinfo(hostname, None):
            ip = info[4][0]
            if ip not in all_ips and not ip.startswith("127.") and ":" not in ip:
                all_ips.append(ip)
    except Exception:
        pass

    real_ips = []
    virtual_ips = []
    for ip in all_ips:
        is_virtual = any(ip.startswith(prefix) for prefix, _ in VIRTUAL_RANGES)
        if is_virtual:
            virtual_ips.append(ip)
        else:
            real_ips.append(ip)

    primary_ip = real_ips[0] if real_ips else (all_ips[0] if all_ips else "localhost")
    displayed_ips = real_ips + virtual_ips

    return {
        "hostname": hostname,
        "primary_ip": primary_ip,
        "ips": displayed_ips,
        "port": API_PORT,
        "urls": [f"http://{ip}:{API_PORT}" for ip in displayed_ips],
        "primary_url": f"http://{primary_ip}:{API_PORT}",
    }

from routes.products import router as products_router
from routes.stock import router as stock_router
from routes.sales import router as sales_router
from routes.audits import router as audits_router
from routes.reports import router as reports_router
from routes.vendors import router as vendors_router
from routes.pending_orders import router as pending_orders_router
from routes.customers import router as customers_router
from routes.budgets import router as budgets_router
from routes.license import router as license_router

@app.get("/api/products/{product_id}/barcode.png")
def public_barcode_image(product_id: int, db: Session = Depends(get_db)):
    from io import BytesIO
    import barcode
    from barcode.writer import ImageWriter
    from PIL import Image, ImageDraw, ImageFont
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Producto no encontrado")
    code = p.barcode or p.code
    try:
        Code128 = barcode.get_barcode_class("code128")
        writer = ImageWriter()
        bc = Code128(code, writer=writer).render()

        draw = ImageDraw.Draw(bc)
        try:
            font = ImageFont.truetype("segoeui.ttf", 16)
            font_price = ImageFont.truetype("segoeui.ttf", 20)
        except:
            font = ImageFont.load_default()
            font_price = font

        name = p.name
        price = f"${p.selling_price:,.0f}"
        line_h = 22
        padding = 16

        bc_w, bc_h = bc.size
        total_h = bc_h + line_h * 2 + padding

        label = Image.new("RGB", (bc_w, total_h), "white")
        label.paste(bc, (0, 0))

        draw = ImageDraw.Draw(label)
        name_bbox = draw.textbbox((0, 0), name, font=font)
        name_w = name_bbox[2] - name_bbox[0]
        price_bbox = draw.textbbox((0, 0), price, font=font_price)
        price_w = price_bbox[2] - price_bbox[0]

        draw.text(((bc_w - name_w) // 2, bc_h + 2), name, fill="black", font=font)
        draw.text(((bc_w - price_w) // 2, bc_h + line_h + 2), price, fill="black", font=font_price)

        buf = BytesIO()
        label.save(buf, format="PNG")
        buf.seek(0)
        return Response(content=buf.getvalue(), media_type="image/png")
    except:
        raise HTTPException(400, "No se pudo generar la imagen del codigo")

app.include_router(products_router, dependencies=[Depends(verify_token)])
app.include_router(stock_router, dependencies=[Depends(verify_token)])
app.include_router(sales_router, dependencies=[Depends(verify_token)])
app.include_router(audits_router, dependencies=[Depends(verify_token)])
app.include_router(reports_router, dependencies=[Depends(verify_token)])
app.include_router(vendors_router, dependencies=[Depends(verify_token)])
app.include_router(pending_orders_router, dependencies=[Depends(verify_token)])
app.include_router(customers_router, dependencies=[Depends(verify_token)])
app.include_router(budgets_router, dependencies=[Depends(verify_token)])
app.include_router(license_router, dependencies=[Depends(verify_token)])

if WEB_DIR.exists():
    @app.middleware("http")
    async def spa_fallback(request: Request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and not request.url.path.startswith("/api"):
            index = WEB_DIR / "index.html"
            if index.exists():
                return FileResponse(index)
        return response

    if (WEB_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(WEB_DIR / "assets")), name="assets")

if __name__ == "__main__":
    import signal, sys, os, traceback

    log_dir = Path(__file__).resolve().parent / "logs"
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / "server.log"

    def log(msg):
        with open(log_file, "a") as f:
            f.write(f"[{datetime.now().isoformat()}] {msg}\n")

    pid_file = log_dir / "server.pid"

    try:
        init_db()
        log("Base de datos iniciada")

        from database import SessionLocal
        from services.license_service import init_license
        _lic_db = SessionLocal()
        try:
            lic = init_license(_lic_db)
            log(f"Licencia activa: {lic.plan} ({lic.key})")
        finally:
            _lic_db.close()

        with open(pid_file, "w") as f:
            f.write(str(os.getpid()))

        def handle_exit(*_):
            pid_file.unlink(missing_ok=True)
            sys.exit(0)

        signal.signal(signal.SIGTERM, handle_exit)
        signal.signal(signal.SIGINT, handle_exit)

        log(f"Iniciando servidor en http://{API_HOST}:{API_PORT}")
        uvicorn.run(app, host=API_HOST, port=API_PORT, log_config=None)
    except SystemExit:
        pass
    except KeyboardInterrupt:
        pass
    except Exception as e:
        log(f"ERROR: {e}")
        with open(log_file, "a") as f:
            traceback.print_exc(file=f)
    finally:
        pid_file.unlink(missing_ok=True)
        log("Servidor detenido\n")
