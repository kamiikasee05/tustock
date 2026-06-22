from fastapi import Request, HTTPException
from config import TUSTOCK_TOKEN

async def verify_token(request: Request):
    token = None
    auth_header = request.headers.get("Authorization", "")

    if auth_header.startswith("Bearer "):
        token = auth_header[7:]

    if not token:
        token = request.query_params.get("token")

    if not token:
        token = request.headers.get("X-TUSTOCK-Token")

    if not token or token != TUSTOCK_TOKEN:
        raise HTTPException(status_code=401, detail="Token invalido o faltante")

    return True
