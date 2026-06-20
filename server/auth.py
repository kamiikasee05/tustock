from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import TUSTOCK_TOKEN
import os

_scheme = HTTPBearer(auto_error=False)

async def verify_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_scheme),
):
    token = None

    if credentials:
        token = credentials.credentials

    if not token:
        token = request.query_params.get("token")

    if not token:
        token = request.headers.get("X-TUSTOCK-Token")

    if not token or token != TUSTOCK_TOKEN:
        raise HTTPException(status_code=401, detail="Token invalido o faltante")

    return True
