"""
SDK N2-Vault (NoyauNeria 2.0 / PR #85) — chargement des secrets Empire en RAM.

Appelle POST /api/v1/vault/sync avec NERIACORP_MASTER_KEY, injecte les paires
clé/valeur dans os.environ, et n'écrit jamais sur disque (.env, fichiers, cache).

Usage (tout en haut du point d'entrée, avant Mongo / Gemini / Cloudinary) :

    from n2_vault_client import sync_secrets
    sync_secrets()
"""
from __future__ import annotations

import json
import logging
import os
import socket
import urllib.error
import urllib.request
from typing import Any, Dict, Mapping, Optional

logger = logging.getLogger("n2_vault")

DEFAULT_VAULT_BASE_URL = "https://api.neriacorp.com"
VAULT_SYNC_PATH = "/api/v1/vault/sync"
DEFAULT_APP_ID = "mamandouce"
DEFAULT_PLANET = "mamandouce"
REQUEST_TIMEOUT_SEC = 12

# Métadonnées de réponse — jamais injectées comme secrets.
_META_KEYS = {
    "ok",
    "status",
    "message",
    "detail",
    "error",
    "app_id",
    "planet",
    "hostname",
    "count",
    "synced",
    "source",
    "ts",
    "timestamp",
}

# Ne jamais laisser le payload Vault écraser la clé maître locale.
_PROTECTED_ENV = {"NERIACORP_MASTER_KEY", "N2_VAULT_SYNC"}
# Clés d'un ancien fournisseur LLM — jamais injectées (OPENAI_API_KEY uniquement).
_BLOCKED_INJECT = {"".join(("EME", "RGENT", "_LLM_KEY"))}

_state: Dict[str, Any] = {"done": False, "count": 0}


class VaultMasterKeyError(RuntimeError):
    """NERIACORP_MASTER_KEY absente au boot — le coffre ne peut pas s'ouvrir."""


def reset_sync_state() -> None:
    """Réservé aux tests unitaires."""
    _state["done"] = False
    _state["count"] = 0


def vault_sync_url() -> str:
    base = (
        os.environ.get("N2_VAULT_BASE_URL")
        or os.environ.get("N2_OCR_BASE_URL")
        or DEFAULT_VAULT_BASE_URL
    ).strip().rstrip("/")
    if base.lower() in ("", "off", "none", "-"):
        base = DEFAULT_VAULT_BASE_URL
    return f"{base}{VAULT_SYNC_PATH}"


def _vault_disabled() -> bool:
    flag = (os.environ.get("N2_VAULT_SYNC") or "").strip().lower()
    return flag in ("off", "skip", "0", "false", "local")


def _require_master_key() -> str:
    key = (os.environ.get("NERIACORP_MASTER_KEY") or "").strip()
    if not key:
        raise VaultMasterKeyError(
            "NERIACORP_MASTER_KEY est requise : clé maître du Vault NeriaCorp "
            "pour charger les secrets Empire (Gemini, Cloudinary, Mongo, SSO) "
            "en mémoire au démarrage. Aucun secret n'est écrit sur disque."
        )
    return key


def _secrets_from_payload(data: Any) -> Dict[str, str]:
    if not isinstance(data, dict):
        return {}

    for nest in ("secrets", "env", "environment", "values"):
        inner = data.get(nest)
        if isinstance(inner, dict) and inner:
            return _coerce_secret_map(inner)

    nested = data.get("data")
    if isinstance(nested, dict):
        for nest in ("secrets", "env", "values"):
            inner = nested.get(nest)
            if isinstance(inner, dict) and inner:
                return _coerce_secret_map(inner)
        coerced = _coerce_secret_map(nested)
        if coerced:
            return coerced

    for list_key in ("items", "keys"):
        items = data.get(list_key)
        if isinstance(items, list):
            out: Dict[str, str] = {}
            for item in items:
                if not isinstance(item, dict):
                    continue
                name = item.get("key") or item.get("name") or item.get("id")
                value = item.get("value")
                if value is None:
                    value = item.get("secret")
                if name:
                    out[str(name)] = "" if value is None else str(value)
            if out:
                return out

    return _coerce_secret_map(
        {k: v for k, v in data.items() if k not in _META_KEYS}
    )


def _coerce_secret_map(raw: Mapping[str, Any]) -> Dict[str, str]:
    out: Dict[str, str] = {}
    for key, value in raw.items():
        name = str(key).strip()
        if not name or name in _PROTECTED_ENV or name in _BLOCKED_INJECT:
            continue
        if value is None:
            continue
        if isinstance(value, (dict, list)):
            continue
        text = str(value)
        if text == "":
            continue
        out[name] = text
    return out


def _inject_environ(secrets: Mapping[str, str]) -> int:
    """Injecte en RAM uniquement — jamais de fichier."""
    count = 0
    for key, value in secrets.items():
        os.environ[key] = value
        count += 1
    return count


def _refresh_downstream_config() -> None:
    """Si core.config a déjà snapshoté l'env, le relire après injection Vault."""
    try:
        from core import config as cfg

        reload_fn = getattr(cfg, "load_settings", None)
        if callable(reload_fn):
            reload_fn()
    except Exception:
        logger.debug("core.config reload skipped", exc_info=True)


def _post_sync(url: str, payload: Dict[str, Any], master_key: str) -> Any:
    body = json.dumps(payload).encode("utf-8")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "MamanDouce-N2Vault/1.0",
        "Authorization": f"Bearer {master_key}",
        "X-NeriaCorp-Master-Key": master_key,
    }
    request = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SEC) as response:
            raw = response.read()
            status = int(getattr(response, "status", 200) or 200)
    except urllib.error.HTTPError as exc:
        detail = ""
        try:
            detail = exc.read().decode("utf-8", errors="replace")[:400]
        except Exception:
            detail = str(exc)
        raise RuntimeError(
            f"N2-Vault sync a échoué (HTTP {exc.code}) sur {VAULT_SYNC_PATH}: {detail}"
        ) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"N2-Vault injoignable ({url}): {exc.reason}"
        ) from exc

    if status >= 400:
        raise RuntimeError(f"N2-Vault sync a échoué (HTTP {status}) sur {VAULT_SYNC_PATH}")
    if not raw:
        return {}
    try:
        return json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError("N2-Vault a renvoyé un corps non-JSON") from exc


def sync_secrets(*, force: bool = False) -> int:
    """Charge les secrets Vault dans os.environ (RAM). Retourne le nombre injecté.

    Si N2_VAULT_SYNC=off (tests / local sans coffre), no-op.
    Sinon NERIACORP_MASTER_KEY est obligatoire.
    """
    if _state["done"] and not force:
        return int(_state["count"] or 0)

    if _vault_disabled():
        logger.info("N2-Vault sync ignoré (N2_VAULT_SYNC=off) — secrets locaux / env process")
        _state["done"] = True
        _state["count"] = 0
        return 0

    master_key = _require_master_key()
    url = vault_sync_url()
    payload = {
        "app_id": (os.environ.get("N2_VAULT_APP_ID") or DEFAULT_APP_ID).strip()[:64],
        "planet": (os.environ.get("N2_VAULT_PLANET") or DEFAULT_PLANET).strip()[:64],
        "hostname": (os.environ.get("N2_VAULT_HOSTNAME") or socket.gethostname() or "")[:256],
    }
    logger.info("N2-Vault sync %s app_id=%s", VAULT_SYNC_PATH, payload["app_id"])
    data = _post_sync(url, payload, master_key)
    secrets = _secrets_from_payload(data)
    count = _inject_environ(secrets)
    _refresh_downstream_config()
    _state["done"] = True
    _state["count"] = count
    logger.info("N2-Vault : %s secret(s) chargés en mémoire (aucun fichier écrit)", count)
    return count


def sync_secrets_at_boot() -> int:
    """Boot Railway : ne jamais faire crasher uvicorn si le coffre timeout/5xx.

    Les variables déjà injectées par Railway restent disponibles.
    """
    try:
        return sync_secrets()
    except Exception as exc:
        print(f"[VAULT] boot sync failed ({type(exc).__name__}): {exc}", flush=True)
        logger.exception(
            "N2-Vault boot sync failed — continuing with process environment"
        )
        _state["done"] = True
        _state["count"] = 0
        return 0
