"""Comptes superadmin MamanDouce — admin + premium permanents.

Deux adresses uniquement (réactivation à la connexion /auth/me) :
  - cyrilalepsa@gmail.com
  - superadmin@neriacorp.com
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

HARDCODED_SUPERADMIN_EMAILS = (
    "cyrilalepsa@gmail.com",
    "superadmin@neriacorp.com",
)

SUPERADMIN_DB_SET = {
    "role": "admin",
    "subscription_status": "premium",
    "premium_source": "superadmin",
    "gold_status": True,
    "postpartum_purchased": True,
    "postpartum_free_unlocked": True,
    "postpartum_free_via_referral": True,
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
    """Force rôle admin + premium en mémoire (sans attendre le write Mongo)."""
    if not user:
        return user
    if not is_superadmin_email(user.get("email")):
        return user
    patched = dict(user)
    patched.update(SUPERADMIN_DB_SET)
    return patched


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
