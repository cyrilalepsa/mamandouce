"""
NeriaCorp Noyau central — sync profil B2C et entitlements cross-app (Héritia).
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import httpx

from core.config import NERIACORP_PORTAL_URL, n2_ocr_base_url
from core.database import db
from integrations.neriacorp.adapters import publish_to_app

logger = logging.getLogger("mamandouce.neriacorp.nucleus")

CONNECT_TIMEOUT = 8.0
READ_TIMEOUT = 15.0
NUCLEUS_SYNC_PATH = "/api/neriacorp/b2c/sync"


def _parse_iso(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def subscription_days_remaining(user_doc: dict) -> int:
    end = _parse_iso(user_doc.get("subscription_end_date"))
    if not end:
        return 0
    now = datetime.now(timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    delta = (end - now).days
    return max(0, delta)


def is_active_subscription(user_doc: dict) -> bool:
    status = str(user_doc.get("subscription_status") or "").lower()
    if user_doc.get("is_premium") or user_doc.get("is_vip"):
        return True
    if status in {"premium", "trial", "postpartum"}:
        if status == "trial":
            return subscription_days_remaining(user_doc) > 0
        return True
    return subscription_days_remaining(user_doc) > 0


def build_b2c_profile_payload(user_doc: dict) -> Dict[str, Any]:
    email = str(user_doc.get("email") or "").strip().lower()
    return {
        "source_app": "mamandouce",
        "user_id": user_doc.get("id"),
        "email": email,
        "first_name": user_doc.get("first_name") or "",
        "last_name": user_doc.get("last_name") or "",
        "name": user_doc.get("name") or "",
        "city": user_doc.get("city"),
        "locale": user_doc.get("locale") or "fr",
        "subscription_status": user_doc.get("subscription_status"),
        "subscription_end_date": user_doc.get("subscription_end_date"),
        "is_premium": bool(user_doc.get("is_premium")),
        "portal_zone": "B2C",
        "synced_at": datetime.now(timezone.utc).isoformat(),
    }


def build_cross_app_entitlements(user_doc: dict, wallet_balance: float = 0.0) -> Dict[str, Any]:
    active = is_active_subscription(user_doc)
    days = subscription_days_remaining(user_doc) if active else 0
    until = user_doc.get("subscription_end_date")
    return {
        "mamandouce": {
            "active": active,
            "days_remaining": days,
            "until": until,
            "n2o_balance": wallet_balance,
        },
        "heritia": {
            "active": active,
            "days_remaining": days,
            "until": until,
            "benefit": "subscription_transfer",
            "description": "Durée restante MamanDouce transférée vers Héritia",
        },
    }


async def _remote_sync(payload: Dict[str, Any]) -> bool:
    worker = (n2_ocr_base_url() or "https://api.neriacorp.com").rstrip("/")
    url = f"{worker}{NUCLEUS_SYNC_PATH}"
    headers = {}
    api_key = os.environ.get("NERIACORP_NUCLEUS_API_KEY") or os.environ.get("N2_OCR_API_KEY")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(READ_TIMEOUT, connect=CONNECT_TIMEOUT)) as client:
            response = await client.post(url, json=payload, headers=headers)
        if response.status_code < 300:
            return True
        logger.warning("nucleus remote sync HTTP %s: %s", response.status_code, response.text[:200])
    except Exception as exc:
        logger.warning("nucleus remote sync failed: %s", exc)
    return False


async def sync_b2c_profile(user_doc: dict) -> Dict[str, Any]:
    """Crée ou met à jour le profil B2C sur le Noyau (local + push optionnel)."""
    payload = build_b2c_profile_payload(user_doc)
    user_id = str(user_doc.get("id") or "")
    if not user_id:
        return {"success": False, "error": "missing_user_id"}

    await db.neriacorp_profiles.update_one(
        {"user_id": user_id},
        {
            "$set": {
                **payload,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        },
        upsert=True,
    )

    remote_ok = await _remote_sync(payload)
    return {
        "success": True,
        "local": True,
        "remote": remote_ok,
        "portal_url": NERIACORP_PORTAL_URL,
    }


async def push_cross_app_entitlements(user_doc: dict, wallet_balance: float = 0.0) -> Dict[str, Any]:
    """Transmet les droits MamanDouce vers Héritia via les adaptateurs NeriaCorp."""
    entitlements = build_cross_app_entitlements(user_doc, wallet_balance)
    inject_payload = {
        "type": "cross_app_entitlement",
        "source_app": "mamandouce",
        "user_email": user_doc.get("email"),
        "user_id": user_doc.get("id"),
        "entitlements": entitlements,
        "pushed_at": datetime.now(timezone.utc).isoformat(),
    }

    results: Dict[str, Any] = {}
    for app_name in ("Heritia",):
        try:
            results[app_name] = await publish_to_app(
                app_name,
                inject_payload,
                scan_id=f"mamandouce-{user_doc.get('id')}",
                admin_email=user_doc.get("email") or "system@mamandouce",
            )
        except Exception as exc:
            logger.warning("cross-app push %s failed: %s", app_name, exc)
            results[app_name] = {"status": "error", "detail": str(exc)}

    await db.cross_app_entitlements.update_one(
        {"user_id": user_doc.get("id")},
        {
            "$set": {
                "entitlements": entitlements,
                "push_results": results,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$setOnInsert": {
                "user_email": user_doc.get("email"),
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        },
        upsert=True,
    )

    return {"entitlements": entitlements, "push_results": results}


async def maybe_mark_first_n2o_trigger(user_id: str, credit_amount: float, tx_type: str) -> None:
    """Déclenche l'onboarding portail au premier N2O gagné (hors bonus initial)."""
    if credit_amount <= 0 or tx_type == "initial_bonus":
        return
    user = await db.users.find_one(
        {"id": user_id},
        {
            "_id": 0,
            "neriacorp_portal_linked": 1,
            "neriacorp_onboarding_dismissed": 1,
            "neriacorp_onboarding_pending": 1,
        },
    )
    if not user:
        return
    if user.get("neriacorp_portal_linked") or user.get("neriacorp_onboarding_dismissed"):
        return
    if user.get("neriacorp_onboarding_pending"):
        return
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"neriacorp_onboarding_pending": "first_n2o"}},
    )
