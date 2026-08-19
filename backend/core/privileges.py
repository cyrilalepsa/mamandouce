"""Comptes superadmin MamanDouce — admin + premium permanents.

Deux adresses uniquement (réactivation à la connexion /auth/me) :
  - cyrilalepsa@gmail.com
  - superadmin@neriacorp.com
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

SUPER_ADMIN_EMAILS = [
    "cyrilalepsa@gmail.com",
    "superadmin@neriacorp.com",
]
HARDCODED_SUPERADMIN_EMAILS = tuple(SUPER_ADMIN_EMAILS)

SUPERADMIN_DB_SET = {
    "role": "admin",
    "subscription_status": "premium",
    "premium_source": "superadmin",
    "gold_status": True,
    "postpartum_purchased": True,
    "postpartum_free_unlocked": True,
    "postpartum_free_via_referral": True,
    "is_superadmin": True,
    "is_admin": True,
    "is_premium": True,
    "is_vip": True,
}


def normalize_priv_email(email: str | None) -> str:
    return (email or "").strip().lower()


def superadmin_emails() -> frozenset[str]:
    emails = {normalize_priv_email(item) for item in HARDCODED_SUPERADMIN_EMAILS}
    try:
        from core.config import ADMIN_EMAIL

        extra = normalize_priv_email(ADMIN_EMAIL)
        if extra and "@" in extra and not extra.endswith("@example.com"):
            emails.add(extra)
    except Exception:
        pass
    return frozenset(emails)


def is_superadmin_email(email: str | None) -> bool:
    return normalize_priv_email(email) in superadmin_emails()


def apply_superadmin_overlay(user: dict[str, Any] | None) -> dict[str, Any] | None:
    """Force rôle admin + premium + flags is_admin / is_superadmin en mémoire."""
    if not user:
        return user
    patched = dict(user)
    if is_superadmin_email(patched.get("email")):
        patched.update(SUPERADMIN_DB_SET)
        patched["role"] = "admin"
        patched["subscription_status"] = "premium"
        patched["is_superadmin"] = True
        patched["is_admin"] = True
        patched["is_premium"] = True
        patched["is_vip"] = True
        return patched
    role = str(patched.get("role") or "user").lower()
    patched["is_superadmin"] = False
    patched["is_admin"] = role == "admin"
    status = str(patched.get("subscription_status") or "").lower()
    patched["is_premium"] = bool(
        patched.get("is_premium") or patched["is_admin"] or status in ("premium", "trial")
    )
    patched["is_vip"] = bool(patched.get("is_vip"))
    return patched


def privilege_public_fields(user: dict[str, Any] | None) -> dict[str, Any]:
    """Champs renvoyés au login /me pour le frontend (AuthContext)."""
    overlaid = apply_superadmin_overlay(user) or {}
    return {
        "email": overlaid.get("email"),
        "role": overlaid.get("role") or "user",
        "subscription_status": overlaid.get("subscription_status") or "free",
        "is_superadmin": bool(overlaid.get("is_superadmin")),
        "is_admin": bool(overlaid.get("is_admin")),
        "is_premium": bool(overlaid.get("is_premium")),
        "is_vip": bool(overlaid.get("is_vip")),
    }


async def ensure_superadmin_privileges(email: str | None, database=None) -> bool:
    """Réécrit en BDD les droits superadmin. True si un document a matché."""
    needle = normalize_priv_email(email)
    if not needle or not is_superadmin_email(needle):
        return False
    if database is None:
        from core.database import get_db

        database = get_db()
    fields = dict(SUPERADMIN_DB_SET)
    fields["privileges_ensured_at"] = datetime.now(timezone.utc).isoformat()
    result = await database.users.update_one(
        {
            "$or": [
                {"email": needle},
                {"email": {"$regex": f"^{re.escape(needle)}$", "$options": "i"}},
            ]
        },
        {"$set": fields},
    )
    return bool(getattr(result, "matched_count", 0))
