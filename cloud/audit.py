"""Audit log para la cloud API."""
import json
from datetime import datetime
from pathlib import Path

AUDIT_FILE = Path(__file__).parent / "audit.jsonl"


def log_event(event_type: str, details: dict, ip: str = ""):
    """Append an audit event to the log file."""
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event": event_type,
        "ip": ip,
        **details
    }
    with open(AUDIT_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
