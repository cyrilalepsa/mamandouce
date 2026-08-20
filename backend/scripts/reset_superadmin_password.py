#!/usr/bin/env python3
"""Maintenance ponctuelle : réinitialiser le mot de passe superadmin dans MongoDB.

Usage (depuis backend/, MONGO_URL / DB_NAME dans l'environnement ou .env) :

    python3 scripts/reset_superadmin_password.py
    python3 scripts/reset_superadmin_password.py cyrilalepsa@gmail.com 'MonSuperMDP2026!'

Par défaut : cyrilalepsa@gmail.com / mot de passe NEW_PASSWORD ou MonSuperMDP2026!

- Hash bcrypt identique à l'inscription (passlib pwd_context)
- Champ Mongo : hashed_password
- Déblocage : failed_login_attempts / login_attempts / failed_attempts = 0,
  suppression de locked_until
- N'imprime jamais le mot de passe en clair ni le hash complet
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

try:
    from n2_vault_client import sync_secrets_at_boot

    sync_secrets_at_boot()
except Exception:
    pass

from passlib.context import CryptContext  # noqa: E402

from services.user_lookup import (  # noqa: E402
    normalize_email,
    user_email_query,
)

TARGET_EMAIL = "cyrilalepsa@gmail.com"
DEFAULT_PASSWORD = os.environ.get("NEW_PASSWORD") or os.environ.get("SUPERADMIN_RESET_PASSWORD") or "MonSuperMDP2026!"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

LOCKOUT_COUNTER_FIELDS = (
    "failed_login_attempts",
    "login_attempts",
    "failed_attempts",
)


def hash_password(plain: str) -> str:
    if not str(plain or "").strip():
        raise ValueError("mot de passe vide")
    return pwd_context.hash(plain)


def build_password_reset_update(hashed: str) -> dict:
    """$set / $unset alignés sur routes.auth (login + lockout)."""
    now = datetime.now(timezone.utc).isoformat()
    counters = {field: 0 for field in LOCKOUT_COUNTER_FIELDS}
    return {
        "$set": {
            "hashed_password": hashed,
            "password_updated_at": now,
            **counters,
        },
        "$unset": {
            "locked_until": "",
            "password": "",
        },
    }


def hash_prefix(hashed: str) -> str:
    raw = str(hashed or "")
    return raw[:7] if raw.startswith("$2") else "unknown"


def reset_password_sync(email: str, plain_password: str) -> dict:
    from pymongo import MongoClient

    from core.database import resolve_db_name

    needle = normalize_email(email)
    if needle != TARGET_EMAIL:
        return {
            "ok": False,
            "error": f"refusé : ce script ne cible que {TARGET_EMAIL}",
            "email": needle,
        }

    hashed = hash_password(plain_password)
    if not pwd_context.verify(plain_password, hashed):
        return {"ok": False, "error": "le hash bcrypt ne vérifie pas le mot de passe"}

    db_name = resolve_db_name()
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    client = MongoClient(mongo_url, serverSelectionTimeoutMS=8000)
    try:
        client.admin.command("ping")
    except Exception as exc:
        return {
            "ok": False,
            "error": f"{type(exc).__name__}: {exc}",
            "mongo_url_host": (mongo_url or "").split("@")[-1],
            "db_name": db_name,
        }

    users = client[db_name]["users"]
    query = user_email_query(email)
    before = users.find_one(query, {"_id": 0, "email": 1, "hashed_password": 1, "locked_until": 1, "failed_login_attempts": 1})
    if not before:
        return {
            "ok": False,
            "error": "utilisateur introuvable",
            "email": needle,
            "db_name": db_name,
        }

    result = users.update_one(query, build_password_reset_update(hashed))
    after = users.find_one(query, {"_id": 0, "hashed_password": 1, "failed_login_attempts": 1, "login_attempts": 1, "failed_attempts": 1, "locked_until": 1, "email": 1})
    verified = bool(after and pwd_context.verify(plain_password, after.get("hashed_password") or ""))

    return {
        "ok": bool(result.matched_count and verified),
        "email": after.get("email") if after else needle,
        "db_name": db_name,
        "matched": result.matched_count,
        "modified": result.modified_count,
        "bcrypt_prefix": hash_prefix((after or {}).get("hashed_password") or hashed),
        "password_verified": verified,
        "failed_login_attempts": (after or {}).get("failed_login_attempts"),
        "login_attempts": (after or {}).get("login_attempts"),
        "failed_attempts": (after or {}).get("failed_attempts"),
        "locked_until": (after or {}).get("locked_until"),
        "had_lock": bool(before.get("locked_until")),
        "previous_failed_login_attempts": before.get("failed_login_attempts"),
    }


def main() -> int:
    email = sys.argv[1] if len(sys.argv) > 1 else TARGET_EMAIL
    password = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_PASSWORD
    report = reset_password_sync(email, password)
    print(json.dumps(report, ensure_ascii=False, indent=2, default=str))
    return 0 if report.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
