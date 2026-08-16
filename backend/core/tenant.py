"""
Résolution multi-tenant depuis Host / X-Tenant.

Schéma DNS prod (SSL Cloudflare) : {slug}.neriacorp.com
  - odelicesenfamille.neriacorp.com → boutique B2B
  - mamandouce.neriacorp.com → app standalone (réservé)
  - hub / api / cockpit → plateformes (pas un tenant B2B)

Jamais de crash si l'hôte est inattendu.
"""
from __future__ import annotations

import re
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp

APP_SLUG_MAMANDOUCE = "mamandouce"
NERIA_SUFFIX = ".neriacorp.com"

# Labels de premier niveau qui ne sont PAS des boutiques B2B.
RESERVED_LABELS = frozenset(
    {
        "hub",
        "api",
        "cockpit",
        "mamandouce",
        "www",
        "portal",
        "app",
        "mail",
        "cdn",
    }
)

STANDALONE_HOST_SLUGS = {
    "mamandouce.neriacorp.com": APP_SLUG_MAMANDOUCE,
    "www.mamandouce.neriacorp.com": APP_SLUG_MAMANDOUCE,
    "mamandouce.app": APP_SLUG_MAMANDOUCE,
    "www.mamandouce.app": APP_SLUG_MAMANDOUCE,
}

_SLUG_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")


def normalize_host(value: str | None) -> str:
    host = "" if value is None else str(value)
    host = host.split(":")[0].strip().lower()
    if host.startswith("[") and host.endswith("]"):
        host = host[1:-1]
    return host


def sanitize_tenant_slug(value: str | None) -> Optional[str]:
    slug = ("" if value is None else str(value)).strip().lower()
    if not slug or slug in RESERVED_LABELS:
        return None
    if not _SLUG_RE.fullmatch(slug):
        return None
    return slug


def _first_label(hostname: str) -> str:
    labels = [part for part in hostname.split(".") if part]
    if not labels:
        return ""
    if labels[0] == "www" and len(labels) >= 2:
        return labels[1]
    return labels[0]


def resolve_tenant(host: str | None = None, x_tenant: str | None = None) -> dict:
    """Retourne {slug, kind, host} sans lever.

    kind: platform | standalone | boutique | unknown
    slug: None sur les hôtes réservés (sauf X-Tenant boutique valide).
    """
    try:
        header_slug = sanitize_tenant_slug(x_tenant)
        hostname = normalize_host(host)

        standalone = STANDALONE_HOST_SLUGS.get(hostname)
        if standalone:
            return {"slug": header_slug or standalone, "kind": "standalone", "host": hostname}

        if hostname.endswith(NERIA_SUFFIX) or hostname == "neriacorp.com":
            label = _first_label(hostname)
            if hostname in {"neriacorp.com", "www.neriacorp.com"} or label in RESERVED_LABELS:
                return {"slug": header_slug, "kind": "platform", "host": hostname}
            slug = sanitize_tenant_slug(label)
            if slug:
                return {"slug": header_slug or slug, "kind": "boutique", "host": hostname}
            return {"slug": header_slug, "kind": "unknown", "host": hostname}

        return {"slug": header_slug, "kind": "unknown", "host": hostname}
    except Exception:
        return {"slug": None, "kind": "unknown", "host": normalize_host(host)}


class TenantMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        try:
            info = resolve_tenant(
                host=request.headers.get("host"),
                x_tenant=request.headers.get("x-tenant"),
            )
        except Exception:
            info = {"slug": None, "kind": "unknown", "host": ""}

        request.state.tenant_slug = info.get("slug")
        request.state.tenant_kind = info.get("kind") or "unknown"
        request.state.tenant_host = info.get("host") or ""

        response = await call_next(request)
        try:
            if info.get("slug"):
                response.headers["X-Tenant"] = str(info["slug"])
            response.headers["X-Tenant-Kind"] = str(info.get("kind") or "unknown")
        except Exception:
            pass
        return response
