"""
NeriaCorp business app adapters (plug-and-play).

Each adapter binds to ONE business app (VisaTrace, Heritia, VeoVision, Vellumia, Aevis).
Configuration is fully env-driven:
  - {APP}_BASE_URL  → e.g.  VISATRACE_BASE_URL=https://api.visatrace.com
  - {APP}_API_KEY   → Bearer token

Behaviour:
  - If both env vars are set → real HTTP call POST {base_url}/api/neriacorp/inject
  - If either is missing → graceful fallback `published_mock` with `partial=True`
  - On network error → 2 retries with exponential backoff, then fallback `published_mock`
  - Timeouts: 8s connect / 15s read

Public API: `publish_to_app(target_app, payload, scan_id, admin_email) -> Dict`
"""
import os
import asyncio
import logging
from typing import Dict, Any, Optional

import httpx

logger = logging.getLogger(__name__)

# ============================================================
# Configuration des 5 apps
# ============================================================
APP_REGISTRY: Dict[str, Dict[str, str]] = {
    "VisaTrace": {
        "env_prefix": "VISATRACE",
        "inject_path": "/api/neriacorp/inject",
        "theme_color": "#1A5CAD",
        "default_revenue": 29.99,
    },
    "Heritia": {
        "env_prefix": "HERITIA",
        "inject_path": "/api/neriacorp/inject",
        "theme_color": "#8B4513",
        "default_revenue": 60.0,
    },
    "VeoVision": {
        "env_prefix": "VEOVISION",
        "inject_path": "/api/neriacorp/inject",
        "theme_color": "#000000",
        "default_revenue": 40.0,
    },
    "Vellumia": {
        "env_prefix": "VELLUMIA",
        "inject_path": "/api/neriacorp/inject",
        "theme_color": "#D4AF37",
        "default_revenue": 60.0,
    },
    "Aevis": {
        "env_prefix": "AEVIS",
        "inject_path": "/api/neriacorp/inject",
        "theme_color": "#2E8B57",
        "default_revenue": 40.0,
    },
}

CONNECT_TIMEOUT = 8.0
READ_TIMEOUT = 15.0
MAX_RETRIES = 2
BACKOFF_BASE = 0.5  # 0.5s, 1.0s


def _get_credentials(target_app: str) -> Optional[Dict[str, str]]:
    """Lit (BASE_URL, API_KEY) depuis l'env. Retourne None si non configuré."""
    cfg = APP_REGISTRY.get(target_app)
    if not cfg:
        return None
    base_url = os.environ.get(f"{cfg['env_prefix']}_BASE_URL")
    api_key = os.environ.get(f"{cfg['env_prefix']}_API_KEY")
    if not base_url or not api_key:
        return None
    return {
        "base_url": base_url.rstrip("/"),
        "api_key": api_key,
        "inject_path": cfg["inject_path"],
    }


async def _real_http_call(
    creds: Dict[str, str],
    payload: Dict[str, Any],
    scan_id: Optional[str],
    publication_id: str,
    admin_email: str,
) -> Dict[str, Any]:
    """Tentative d'appel HTTP réel avec retry exponentiel."""
    url = f"{creds['base_url']}{creds['inject_path']}"
    headers = {
        "Authorization": f"Bearer {creds['api_key']}",
        "Content-Type": "application/json",
        "X-NeriaCorp-Publication-Id": publication_id,
        "X-NeriaCorp-Admin": admin_email,
    }
    body = {
        "publication_id": publication_id,
        "scan_id": scan_id,
        "payload": payload,
    }

    last_error = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(connect=CONNECT_TIMEOUT, read=READ_TIMEOUT, write=10.0, pool=10.0)
            ) as client:
                r = await client.post(url, headers=headers, json=body)
                r.raise_for_status()
                data = r.json()
                logger.info(f"[NeriaCorp] {url} OK in attempt {attempt + 1}")
                return {
                    "status": "published_live",
                    "remote_id": data.get("id") or data.get("reference"),
                    "remote_response": data,
                    "partial": False,
                }
        except httpx.HTTPError as e:
            last_error = str(e)
            logger.warning(f"[NeriaCorp] {url} attempt {attempt + 1}/{MAX_RETRIES + 1} failed: {e}")
            if attempt < MAX_RETRIES:
                await asyncio.sleep(BACKOFF_BASE * (2 ** attempt))

    return {
        "status": "published_mock",
        "remote_id": None,
        "remote_response": None,
        "partial": True,
        "error": f"Network error after {MAX_RETRIES + 1} attempts: {last_error}",
    }


async def publish_to_app(
    target_app: str,
    payload: Dict[str, Any],
    scan_id: Optional[str],
    publication_id: str,
    admin_email: str,
) -> Dict[str, Any]:
    """Point d'entrée unique. Décide entre real HTTP call vs fallback mock.
    Toujours retourne un dict (jamais d'exception non-prévue)."""
    cfg = APP_REGISTRY.get(target_app)
    if not cfg:
        return {
            "status": "error",
            "partial": True,
            "error": f"App inconnue : {target_app}",
        }

    creds = _get_credentials(target_app)
    if not creds:
        logger.info(f"[NeriaCorp] {target_app}: env non configuré, fallback mock")
        return {
            "status": "published_mock",
            "remote_id": None,
            "remote_response": None,
            "partial": True,
            "error": f"{cfg['env_prefix']}_BASE_URL / {cfg['env_prefix']}_API_KEY non configurés",
        }

    return await _real_http_call(creds, payload, scan_id, publication_id, admin_email)


def get_app_meta(target_app: str) -> Optional[Dict[str, Any]]:
    """Retourne theme_color + default_revenue + configured flag."""
    cfg = APP_REGISTRY.get(target_app)
    if not cfg:
        return None
    return {
        "theme_color": cfg["theme_color"],
        "default_revenue": cfg["default_revenue"],
        "configured": _get_credentials(target_app) is not None,
    }
