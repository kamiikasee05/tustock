import uvicorn
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import init_db
from config import API_HOST, API_PORT, WEB_DIR, CORS_ORIGINS
from auth import verify_token

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
    except:
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

app.include_router(products_router, dependencies=[Depends(verify_token)])
app.include_router(stock_router, dependencies=[Depends(verify_token)])
app.include_router(sales_router, dependencies=[Depends(verify_token)])
app.include_router(audits_router, dependencies=[Depends(verify_token)])
app.include_router(reports_router, dependencies=[Depends(verify_token)])

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
    init_db()
    print(f"TUSTOCK corriendo en http://{API_HOST}:{API_PORT}")
    uvicorn.run(app, host=API_HOST, port=API_PORT)
