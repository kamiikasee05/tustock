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
