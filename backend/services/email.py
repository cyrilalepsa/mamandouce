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
DEFAULT_SENDER_ADDRESS = "noreply@neriacorp.com"
DEFAULT_CONTACT_ADDRESS = "contact@neriacorp.com"


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


def extract_email_address(value: str | None) -> str:
    """Extrait l'adresse d'un header `Name <addr@dom>` ou d'une adresse nue."""
    text = (value or "").strip()
    if "<" in text and ">" in text:
        text = text[text.rfind("<") + 1 : text.rfind(">")].strip()
    return text


def coerce_neriacorp_sender(raw: str | None) -> tuple[str, str]:
    """
    Force un expéditeur @neriacorp.com.

    Returns:
        (adresse nue, header From `MamanDouce <addr>`)
    """
    addr = extract_email_address(raw)
    if not addr.lower().endswith(EXPECTED_FROM_SUFFIX):
        if addr:
            logger.warning(
                "SENDER_EMAIL %r n'utilise pas @neriacorp.com — forcé vers %s",
                addr,
                DEFAULT_SENDER_ADDRESS,
            )
            _print(
                f"[EMAIL] ⚠ SENDER_EMAIL={addr!r} rejeté "
                f"(pas {EXPECTED_FROM_SUFFIX}) → {DEFAULT_SENDER_ADDRESS}"
            )
        addr = DEFAULT_SENDER_ADDRESS
    return addr, f"MamanDouce <{addr}>"


def reload_email_settings() -> dict[str, str]:
    """Relit RESEND_API_KEY / SENDER_EMAIL depuis l'env (et core.config si dispo)."""
    try:
        from core import config as cfg

        cfg.load_settings()
    except Exception as exc:
        logger.warning("email: load_settings() a échoué, fallback os.environ: %s", exc)
        _print(f"[EMAIL] load_settings() failed, using os.environ: {exc}")
        cfg = None

    api_key = (os.environ.get("RESEND_API_KEY") or "").strip()
    sender_raw = (os.environ.get("SENDER_EMAIL") or "").strip()
    contact = (os.environ.get("CONTACT_EMAIL") or "").strip()
    if cfg is not None:
        api_key = api_key or (getattr(cfg, "RESEND_API_KEY", None) or "").strip()
        # Ne pas reprendre SENDER_EMAIL déjà coercé dans core.config :
        # on conserve la valeur brute d'environnement pour le log / le forçage.
        if not sender_raw:
            sender_raw = (getattr(cfg, "SENDER_EMAIL", None) or "").strip()
        contact = contact or (getattr(cfg, "CONTACT_EMAIL", None) or "").strip()

    sender, from_header = coerce_neriacorp_sender(sender_raw)
    if not contact:
        contact = DEFAULT_CONTACT_ADDRESS
    return {
        "RESEND_API_KEY": api_key,
        "SENDER_EMAIL": sender,
        "SENDER_EMAIL_RAW": sender_raw,
        "FROM_HEADER": from_header,
        "CONTACT_EMAIL": contact,
    }


def _jsonable(value: Any) -> Any:
    """Sérialise le retour Resend (dict / ResponseDict) pour une réponse HTTP JSON."""
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        out: dict[str, Any] = {}
        for key, item in value.items():
            name = str(key)
            if name.lower() == "authorization":
                continue
            out[name] = _jsonable(item)
        return out
    if isinstance(value, (list, tuple)):
        return [_jsonable(item) for item in value]
    if hasattr(value, "items"):
        try:
            return _jsonable(dict(value))
        except Exception:
            pass
    return repr(value)


def extract_email_id(result: Any) -> str | None:
    if result is None:
        return None
    if isinstance(result, dict):
        raw = result.get("id")
        return str(raw) if raw else None
    raw = getattr(result, "id", None)
    return str(raw) if raw else None


def serialize_resend_error(exc: BaseException) -> dict[str, Any]:
    detail: dict[str, Any] = {
        "exception": type(exc).__name__,
        "message": str(exc),
    }
    for attr in ("code", "error_type", "suggested_action"):
        if hasattr(exc, attr):
            detail[attr] = getattr(exc, attr)
    headers = getattr(exc, "headers", None)
    if isinstance(headers, dict) and headers:
        detail["headers"] = _jsonable(headers)
    return detail


def public_email_config() -> dict[str, Any]:
    """Variables e-mail en vigueur — clé masquée, SENDER_EMAIL en clair."""
    cfg = reload_email_settings()
    key = cfg["RESEND_API_KEY"]
    sender = cfg["SENDER_EMAIL"]
    from_addr = cfg["FROM_HEADER"]
    return {
        "RESEND_API_KEY_present": bool(key),
        "RESEND_API_KEY_masked": mask_api_key(key),
        "SENDER_EMAIL": sender,
        "SENDER_EMAIL_RAW": cfg.get("SENDER_EMAIL_RAW") or sender,
        "from": from_addr,
        "SENDER_EMAIL_neriacorp_ok": sender.lower().endswith(EXPECTED_FROM_SUFFIX),
        "CONTACT_EMAIL": cfg["CONTACT_EMAIL"],
    }


def log_email_config(*, purpose: str) -> dict[str, str]:
    cfg = reload_email_settings()
    key = cfg["RESEND_API_KEY"]
    sender = cfg["SENDER_EMAIL"]
    from_header = cfg["FROM_HEADER"]
    from_ok = sender.lower().endswith(EXPECTED_FROM_SUFFIX)
    _print("=" * 72)
    _print(f"[EMAIL] purpose={purpose}")
    _print(f"[EMAIL] RESEND_API_KEY loaded={bool(key)} masked={mask_api_key(key)}")
    _print(f"[EMAIL] SENDER_EMAIL_RAW={cfg.get('SENDER_EMAIL_RAW')!r}")
    _print(f"[EMAIL] SENDER_EMAIL / from={from_header} neriacorp_ok={from_ok}")
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
        from_header,
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
    from_addr = cfg.get("FROM_HEADER") or f"{from_name} <{sender}>"
    to_addr = (to or "").strip().lower()

    _print(f"[EMAIL] to={to_addr}")
    _print(f"[EMAIL] from={from_addr}")
    _print(f"[EMAIL] subject={subject}")
    logger.info("email send start purpose=%s to=%s from=%s", purpose, to_addr, from_addr)

    if not to_addr:
        msg = "destinataire (to) vide"
        _print(f"[EMAIL] ✗ SKIP: {msg}")
        logger.error("email skipped: %s", msg)
        return {
            "ok": False,
            "error": msg,
            "resend": None,
            "email_id": None,
            "http_status": None,
            "skipped": True,
        }

    if not api_key:
        msg = "RESEND_API_KEY manquante ou vide — e-mail non envoyé"
        _print(f"[EMAIL] ✗ SKIP: {msg}")
        logger.error("email skipped purpose=%s to=%s: %s", purpose, to_addr, msg)
        return {
            "ok": False,
            "error": msg,
            "resend": None,
            "email_id": None,
            "http_status": None,
            "skipped": True,
        }

    try:
        import resend
    except Exception as exc:
        msg = f"module resend introuvable: {exc}"
        _print(f"[EMAIL] ✗ IMPORT ERROR: {msg}")
        logger.exception("email: import resend failed")
        traceback.print_exc()
        return {
            "ok": False,
            "error": msg,
            "resend": None,
            "email_id": None,
            "http_status": None,
            "skipped": False,
        }

    resend.api_key = api_key
    # Syntaxe SDK Resend Python (Emails.send) — 4 champs requis.
    params: dict[str, Any] = {
        "from": from_addr,
        "to": [to_addr],
        "subject": subject,
        "html": html,
    }
    if extra:
        params.update(extra)
    _print(f"[EMAIL] payload keys={sorted(params.keys())}")
    _print(f"[EMAIL] params.from={params['from']!r} params.to={params['to']!r}")

    try:
        result = resend.Emails.send(params)
        raw = _jsonable(result)
        email_id = extract_email_id(result)
        _print(f"[EMAIL] ✓ Resend API returned: {raw!r}")
        _print(f"[EMAIL] email_id={email_id}")
        logger.info("email sent purpose=%s to=%s result=%s", purpose, to_addr, raw)
        _print("=" * 72)
        return {
            "ok": True,
            "result": result,
            "resend": raw,
            "email_id": email_id,
            "http_status": 200,
            "skipped": False,
            "traceback": None,
        }
    except Exception as e:
        tb = traceback.format_exc()
        detail = serialize_resend_error(e)
        http_status = detail.get("code")
        _print(f"[EMAIL] ✗ Resend exception ({type(e).__name__}): {e}")
        _print(f"[EMAIL] Resend error detail: {detail!r}")
        _print("[EMAIL] traceback complet:")
        _print(tb)
        logger.exception(
            "email FAILED purpose=%s to=%s from=%s: %s",
            purpose,
            to_addr,
            from_addr,
            e,
        )
        logger.error("Resend traceback:\n%s", tb)
        _print("=" * 72)
        return {
            "ok": False,
            "error": f"{type(e).__name__}: {e}",
            "resend": detail,
            "email_id": None,
            "http_status": http_status,
            "skipped": False,
            "traceback": tb,
        }


def send_resend_direct(
    *,
    to: str = "cyrilalepsa@gmail.com",
    from_address: str = DEFAULT_SENDER_ADDRESS,
    subject: str = "[MamanDouce] test-resend-direct",
    html: str | None = None,
) -> dict[str, Any]:
    """
    Appel SDK Resend isolé (4 champs) — hors flux forgot-password.

    `from_address` est forcé @neriacorp.com. Retourne un dict JSON-serializable
    avec la réponse brute ou l'erreur + traceback.
    """
    cfg = reload_email_settings()
    api_key = cfg["RESEND_API_KEY"]
    sender, from_header = coerce_neriacorp_sender(from_address or DEFAULT_SENDER_ADDRESS)
    to_addr = (to or "").strip().lower()
    body = html or (
        f"<p>Test direct Resend vers {to_addr} depuis {from_header}.</p>"
    )
    params = {
        "from": from_header,
        "to": [to_addr],
        "subject": subject,
        "html": body,
    }
    _print("=" * 72)
    _print("[EMAIL] test-resend-direct SDK call")
    _print(f"[EMAIL] RESEND_API_KEY loaded={bool(api_key)} masked={mask_api_key(api_key)}")
    _print(f"[EMAIL] params={ {k: params[k] for k in ('from', 'to', 'subject')} }")

    payload: dict[str, Any] = {
        "status": "error",
        "to": to_addr,
        "from": from_header,
        "SENDER_EMAIL": sender,
        "RESEND_API_KEY_present": bool(api_key),
        "RESEND_API_KEY_masked": mask_api_key(api_key),
        "resend_response": None,
        "error": None,
        "traceback": None,
    }
    if not api_key:
        payload["error"] = "RESEND_API_KEY manquante ou vide"
        _print(f"[EMAIL] ✗ {payload['error']}")
        return payload
    try:
        import resend
    except Exception as e:
        tb = traceback.format_exc()
        payload["error"] = f"{type(e).__name__}: {e}"
        payload["traceback"] = tb
        _print(tb)
        return payload

    resend.api_key = api_key
    try:
        result = resend.Emails.send(params)
        raw = _jsonable(result)
        _print(f"[EMAIL] ✓ Resend API returned: {raw!r}")
        _print("=" * 72)
        payload["status"] = "ok"
        payload["resend_response"] = raw
        payload["email_id"] = extract_email_id(result)
        return payload
    except Exception as e:
        tb = traceback.format_exc()
        _print(tb)
        logger.error("test-resend-direct traceback:\n%s", tb)
        payload["error"] = f"{type(e).__name__}: {e}"
        payload["resend_response"] = serialize_resend_error(e)
        payload["traceback"] = tb
        payload["http_status"] = getattr(e, "code", None)
        _print("=" * 72)
        return payload
