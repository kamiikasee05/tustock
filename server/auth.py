"""Autenticación mediante token Bearer para proteger los endpoints."""

from fastapi import Request, HTTPException
from config import TUSTOCK_TOKEN

async def verify_token(request: Request):
    """Valida el token Bearer del header Authorization contra TUSTOCK_TOKEN."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido o faltante")
    token = auth_header[7:]
    if token != TUSTOCK_TOKEN:
        raise HTTPException(status_code=401, detail="Token inválido o faltante")
    return True
