#!/usr/bin/env python3
"""Envoi Resend isolé (hors HTTP) — même payload que GET /api/auth/test-email.

Usage (depuis backend/) :
    python3 scripts/test_resend_email.py
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.email import public_email_config, send_resend_email

TO = "cyrilalepsa@gmail.com"


def main() -> int:
    cfg = public_email_config()
    result = send_resend_email(
        to=TO,
        subject="[MamanDouce] Diagnostic Resend — script isolé",
        purpose="diagnostic-test-email-script",
        html=(
            "<p>Test Resend via scripts/test_resend_email.py "
            f"à {datetime.now(timezone.utc).isoformat()}</p>"
        ),
    )
    payload = {
        "ok": bool(result.get("ok")),
        "to": TO,
        "from": cfg["from"],
        "SENDER_EMAIL": cfg["SENDER_EMAIL"],
        "RESEND_API_KEY_present": cfg["RESEND_API_KEY_present"],
        "RESEND_API_KEY_masked": cfg["RESEND_API_KEY_masked"],
        "email_id": result.get("email_id"),
        "http_status": result.get("http_status"),
        "error": result.get("error"),
        "resend": result.get("resend"),
        "skipped": result.get("skipped"),
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))
    return 0 if payload["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
