"""Integración Mercado Pago via REST API — sin dependencias externas.

Usa urllib.request para crear preferencias de pago y verificar pagos.
API docs: https://www.mercadopago.com.ar/developers/es/reference
"""

import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

MP_API = "https://api.mercadopago.com"

SUBSCRIPTION_PLAN_ID = "492a6877398e4831a2d36f2159320f1c"
SUBSCRIPTION_PLAN_PRICE = 8000.0
SUBSCRIPTION_PLAN_URL = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=492a6877398e4831a2d36f2159320f1c"


def create_preference(access_token: str, plan: str, price: float, license_key: str,
                       customer_email: str = "", customer_name: str = "") -> dict:
    plan_names = {
        "basico": "TUSTOCK Básico - Pago único",
        "suscripcion": "TUSTOCK Suscripción - Primer mes",
        "pro": "TUSTOCK Pro - Pago único",
        "trial": "TUSTOCK - Activación",
    }
    title = plan_names.get(plan, f"TUSTOCK - {plan}")

    units = 1
    if plan == "suscripcion":
        title = "TUSTOCK Suscripción - Mensual"

    body = {
        "items": [{
            "title": title,
            "description": f"Licencia {plan} - Key: {license_key}",
            "quantity": 1,
            "currency_id": "ARS",
            "unit_price": price,
        }],
        "external_reference": license_key,
        "back_urls": {
            "success": "https://tustock.up.railway.app",
            "failure": "https://tustock.up.railway.app",
            "pending": "https://tustock.up.railway.app",
        },
        "auto_return": "approved",
        "notification_url": "https://tustock.up.railway.app/api/payments/webhook",
    }

    if customer_email:
        body["payer"] = {"email": customer_email}
        if customer_name:
            body["payer"]["name"] = customer_name

    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        f"{MP_API}/checkout/preferences",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
    )
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        result = json.loads(resp.read())
        return {
            "ok": True,
            "preference_id": result.get("id"),
            "init_point": result.get("init_point"),
            "sandbox_init_point": result.get("sandbox_init_point"),
        }
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        return {"ok": False, "error": f"MP error {e.code}: {error_body[:200]}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def get_payment(access_token: str, payment_id: str) -> dict:
    req = urllib.request.Request(
        f"{MP_API}/v1/payments/{payment_id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return json.loads(resp.read())
    except Exception as e:
        return {"error": str(e)}


def verify_webhook(access_token: str, data_id: str) -> dict:
    payment = get_payment(access_token, data_id)
    if "error" in payment:
        return {"ok": False, "error": payment["error"]}

    status = payment.get("status", "")
    external_reference = payment.get("external_reference", "")

    return {
        "ok": True,
        "status": status,
        "status_detail": payment.get("status_detail", ""),
        "external_reference": external_reference,
        "payment_id": payment.get("id"),
        "date_approved": payment.get("date_approved"),
        "transaction_amount": payment.get("transaction_amount"),
    }


def create_subscription(access_token: str, plan: str, price: float, license_key: str,
                         customer_email: str) -> dict:
    if not customer_email:
        return {"ok": False, "error": "Email del cliente requerido para suscripcion"}

    body = {
        "reason": f"TUSTOCK {plan.capitalize()} - Key: {license_key}",
        "external_reference": license_key,
        "payer_email": customer_email,
        "auto_recurring": {
            "frequency": 1,
            "frequency_type": "months",
            "transaction_amount": price,
            "currency_id": "ARS",
        },
        "back_url": "https://tustock.up.railway.app",
        "notification_url": "https://tustock.up.railway.app/api/payments/webhook",
        "status": "pending",
    }

    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        f"{MP_API}/preapproval",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
    )
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        result = json.loads(resp.read())
        return {
            "ok": True,
            "preapproval_id": result.get("id"),
            "init_point": result.get("init_point"),
        }
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        return {"ok": False, "error": f"MP error {e.code}: {error_body[:200]}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def get_subscription(access_token: str, preapproval_id: str) -> dict:
    req = urllib.request.Request(
        f"{MP_API}/preapproval/{preapproval_id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        return {"error": f"MP error {e.code}: {error_body[:200]}"}
    except Exception as e:
        return {"error": str(e)}


def cancel_subscription(access_token: str, preapproval_id: str) -> dict:
    body = json.dumps({"status": "cancelled"}).encode("utf-8")
    req = urllib.request.Request(
        f"{MP_API}/preapproval/{preapproval_id}",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
        method="PUT",
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return {"ok": True}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        return {"ok": False, "error": f"MP error {e.code}: {error_body[:200]}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def get_subscription_plan(access_token: str, plan_id: str) -> dict:
    req = urllib.request.Request(
        f"{MP_API}/preapproval_plan/{plan_id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        return {"error": f"MP error {e.code}: {error_body[:200]}"}
    except Exception as e:
        return {"error": str(e)}


def update_plan_notification_url(access_token: str, plan_id: str, notification_url: str) -> dict:
    body = json.dumps({"notification_url": notification_url}).encode("utf-8")
    req = urllib.request.Request(
        f"{MP_API}/preapproval_plan/{plan_id}",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
        method="PUT",
    )
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        result = json.loads(resp.read())
        return {"ok": True, "plan": result}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        return {"ok": False, "error": f"MP error {e.code}: {error_body[:200]}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}
