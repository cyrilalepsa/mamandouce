"""
Envoi d'e-mails via Resend — logs détaillés pour Railway / FastAPI.

La clé et l'expéditeur sont relus à chaque envoi (N2-Vault peut hydrater
l'environnement après l'import initial de core.config).
"""
from __future__ import annotations

import logging
import os
import traceback
from typing import Any

logger = logging.getLogger("mamandouce.email")

# Domaine d'expédition attendu (aligné DNS / Resend).
EXPECTED_FROM_SUFFIX = "@neriacorp.com"


def _print(msg: str) -> None:
    """stdout flush — visible dans les logs Railway / uvicorn."""
    print(msg, flush=True)


def mask_api_key(key: str | None) -> str:
    raw = (key or "").strip()
    if not raw:
        return "<EMPTY>"
    if len(raw) <= 8:
        return f"<SET len={len(raw)}>"
    return f"{raw[:6]}…{raw[-4:]} (len={len(raw)})"


def reload_email_settings() -> dict[str, str]:
    """Relit RESEND_API_KEY / SENDER_EMAIL depuis l'env (et core.config si dispo)."""
    api_key = (os.environ.get("RESEND_API_KEY") or "").strip()
    sender = (os.environ.get("SENDER_EMAIL") or "").strip()
    contact = (os.environ.get("CONTACT_EMAIL") or "").strip()
    try:
        from core import config as cfg

        cfg.load_settings()
        api_key = (getattr(cfg, "RESEND_API_KEY", None) or api_key or "").strip()
        sender = (getattr(cfg, "SENDER_EMAIL", None) or sender or "").strip()
        contact = (getattr(cfg, "CONTACT_EMAIL", None) or contact or "").strip()
    except Exception as exc:
        logger.warning("email: load_settings() a échoué, fallback os.environ: %s", exc)
        _print(f"[EMAIL] load_settings() failed, using os.environ: {exc}")

    if not sender:
        sender = "noreply@neriacorp.com"
    if not contact:
        contact = "contact@neriacorp.com"
    return {
        "RESEND_API_KEY": api_key,
        "SENDER_EMAIL": sender,
        "CONTACT_EMAIL": contact,
    }


def log_email_config(*, purpose: str) -> dict[str, str]:
    cfg = reload_email_settings()
    key = cfg["RESEND_API_KEY"]
    sender = cfg["SENDER_EMAIL"]
    from_ok = sender.lower().endswith(EXPECTED_FROM_SUFFIX)
    _print("=" * 72)
    _print(f"[EMAIL] purpose={purpose}")
    _print(f"[EMAIL] RESEND_API_KEY loaded={bool(key)} masked={mask_api_key(key)}")
    _print(f"[EMAIL] SENDER_EMAIL / from={sender} neriacorp_ok={from_ok}")
    if not key:
        _print("[EMAIL] ⚠ RESEND_API_KEY is None/empty — Resend will NOT send")
    if not from_ok:
        _print(
            f"[EMAIL] ⚠ from address does not end with {EXPECTED_FROM_SUFFIX} "
            "(Resend may reject the domain)"
        )
    logger.info(
        "email config purpose=%s key_loaded=%s key=%s from=%s neriacorp_ok=%s",
        purpose,
        bool(key),
        mask_api_key(key),
        sender,
        from_ok,
    )
    return cfg


def send_resend_email(
    *,
    to: str,
    subject: str,
    html: str,
    purpose: str,
    from_name: str = "MamanDouce",
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Envoie un e-mail via Resend.

    Returns:
        {"ok": True, "result": ...} ou {"ok": False, "error": "...", "skipped": bool}
    """
    cfg = log_email_config(purpose=purpose)
    api_key = cfg["RESEND_API_KEY"]
    sender = cfg["SENDER_EMAIL"]
    from_addr = f"{from_name} <{sender}>"
    to_addr = (to or "").strip()

    _print(f"[EMAIL] to={to_addr}")
    _print(f"[EMAIL] from={from_addr}")
    _print(f"[EMAIL] subject={subject}")
    logger.info("email send start purpose=%s to=%s from=%s", purpose, to_addr, from_addr)

    if not to_addr:
        msg = "destinataire (to) vide"
        _print(f"[EMAIL] ✗ SKIP: {msg}")
        logger.error("email skipped: %s", msg)
        return {"ok": False, "error": msg, "skipped": True}

    if not api_key:
        msg = "RESEND_API_KEY manquante ou vide — e-mail non envoyé"
        _print(f"[EMAIL] ✗ SKIP: {msg}")
        logger.error("email skipped purpose=%s to=%s: %s", purpose, to_addr, msg)
        return {"ok": False, "error": msg, "skipped": True}

    try:
        import resend
    except Exception as exc:
        msg = f"module resend introuvable: {exc}"
        _print(f"[EMAIL] ✗ IMPORT ERROR: {msg}")
        logger.exception("email: import resend failed")
        traceback.print_exc()
        return {"ok": False, "error": msg, "skipped": False}

    resend.api_key = api_key
    payload: dict[str, Any] = {
        "from": from_addr,
        "to": [to_addr],
        "subject": subject,
        "html": html,
    }
    if extra:
        payload.update(extra)
    _print(f"[EMAIL] payload keys={sorted(payload.keys())}")

    try:
        result = resend.Emails.send(payload)
        _print(f"[EMAIL] ✓ Resend API returned: {result!r}")
        logger.info("email sent purpose=%s to=%s result=%s", purpose, to_addr, result)
        _print("=" * 72)
        return {"ok": True, "result": result, "skipped": False}
    except Exception as exc:
        _print(f"[EMAIL] ✗ Resend exception ({type(exc).__name__}): {exc}")
        _print("[EMAIL] traceback:")
        traceback.print_exc()
        logger.exception(
            "email FAILED purpose=%s to=%s from=%s: %s",
            purpose,
            to_addr,
            from_addr,
            exc,
        )
        _print("=" * 72)
        return {"ok": False, "error": f"{type(exc).__name__}: {exc}", "skipped": False}
