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
from typing import Dict, Any, Optional, List

import httpx

logger = logging.getLogger(__name__)

APP_REGISTRY: Dict[str, Dict[str, Any]] = {
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
    "Hysia": {
        "env_prefix": "HYSIA",
        "inject_path": "/api/neriacorp/inject",
        "theme_color": "#6366F1",
        "default_revenue": 35.0,
    },
}

CONNECT_TIMEOUT = 8.0
READ_TIMEOUT = 15.0
MAX_RETRIES = 2
BACKOFF_BASE = 0.5


def resolve_app_name(target_app: str) -> Optional[str]:
    """Accepte 'Aevis' ou 'aevis'."""
    if not target_app:
        return None
    if target_app in APP_REGISTRY:
        return target_app
    lowered = {name.lower(): name for name in APP_REGISTRY}
    return lowered.get(target_app.lower())


def _get_credentials(target_app: str) -> Optional[Dict[str, str]]:
    canonical = resolve_app_name(target_app)
    cfg = APP_REGISTRY.get(canonical) if canonical else None
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
                timeout=httpx.Timeout(
                    connect=CONNECT_TIMEOUT, read=READ_TIMEOUT, write=10.0, pool=10.0
                )
            ) as client:
                r = await client.post(url, headers=headers, json=body)
                r.raise_for_status()
                data = r.json()
                logger.info("[NeriaCorp] %s OK in attempt %s", url, attempt + 1)
                return {
                    "status": "published_live",
                    "remote_id": data.get("id") or data.get("reference"),
                    "remote_response": data,
                    "partial": False,
                }
        except httpx.HTTPError as e:
            last_error = str(e)
            logger.warning(
                "[NeriaCorp] %s attempt %s/%s failed: %s",
                url,
                attempt + 1,
                MAX_RETRIES + 1,
                e,
            )
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
    canonical = resolve_app_name(target_app)
    cfg = APP_REGISTRY.get(canonical) if canonical else None
    if not cfg:
        return {
            "status": "error",
            "partial": True,
            "error": f"App inconnue : {target_app}",
        }

    creds = _get_credentials(target_app)
    if not creds:
        logger.info("[NeriaCorp] %s: env non configuré, fallback mock", target_app)
        return {
            "status": "published_mock",
            "remote_id": None,
            "remote_response": None,
            "partial": True,
            "error": f"{cfg['env_prefix']}_BASE_URL / {cfg['env_prefix']}_API_KEY non configurés",
        }

    return await _real_http_call(creds, payload, scan_id, publication_id, admin_email)


def get_app_meta(target_app: str) -> Optional[Dict[str, Any]]:
    canonical = resolve_app_name(target_app)
    cfg = APP_REGISTRY.get(canonical) if canonical else None
    if not cfg:
        return None
    return {
        "name": canonical,
        "theme_color": cfg["theme_color"],
        "default_revenue": cfg["default_revenue"],
        "configured": _get_credentials(canonical) is not None,
    }


def list_registered_apps() -> List[Dict[str, Any]]:
    apps = []
    for name, cfg in APP_REGISTRY.items():
        apps.append(
            {
                "name": name,
                "theme_color": cfg["theme_color"],
                "estimated_revenue": cfg["default_revenue"],
                "color": cfg["theme_color"],
                "revenue": cfg["default_revenue"],
                "configured": _get_credentials(name) is not None,
            }
        )
    return apps
