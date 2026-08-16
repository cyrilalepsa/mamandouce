"""
Résolution multi-tenant (X-Tenant / Host) — jamais de crash.

Après PR #99 :
  - boutiques = {slug}.app.neriacorp.com
  - hub / api / portal = plateformes (pas de slug boutique)
  - mamandouce.neriacorp.com = app standalone (slug = mamandouce)
  - alias courts B2B = allowlist explicite, pas un wildcard *.neriacorp.com
"""
from __future__ import annotations

import re
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp

APP_SLUG_MAMANDOUCE = "mamandouce"
APP_HOST_SUFFIX = ".app.neriacorp.com"

PLATFORM_HOSTS = frozenset(
    {
        "hub.neriacorp.com",
        "www.hub.neriacorp.com",
        "neriacorp.com",
        "www.neriacorp.com",
        "api.neriacorp.com",
        "portal.neriacorp.com",
        "app.neriacorp.com",
        "www.app.neriacorp.com",
    }
)

STANDALONE_HOST_SLUGS = {
    "mamandouce.neriacorp.com": APP_SLUG_MAMANDOUCE,
    "www.mamandouce.neriacorp.com": APP_SLUG_MAMANDOUCE,
    "mamandouce.app": APP_SLUG_MAMANDOUCE,
    "www.mamandouce.app": APP_SLUG_MAMANDOUCE,
}

# Alias courts B2B (premier label uniquement, hôte = {slug}.neriacorp.com).
B2B_SHORT_ALIAS_SLUGS = frozenset(
    {
        "heritia",
        "visatrace",
        "aevis",
        "veovision",
        "vellumia",
    }
)

_SLUG_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")


def normalize_host(value: str | None) -> str:
    host = "" if value is None else str(value)
    host = host.split(":")[0].strip().lower()
    if host.startswith("[") and host.endswith("]"):
        host = host[1:-1]
    return host


def sanitize_tenant_slug(value: str | None) -> Optional[str]:
    slug = ("" if value is None else str(value)).strip().lower()
    if not slug or slug in {"www", "hub", "api", "portal", "app"}:
        return None
    if not _SLUG_RE.fullmatch(slug):
        return None
    return slug


def resolve_tenant(host: str | None = None, x_tenant: str | None = None) -> dict:
    """Retourne {slug, kind, host} sans lever d'exception.

    kind: platform | standalone | boutique | b2b-alias | unknown
    slug: None sur les hôtes plateforme (hub, api, …) sauf si X-Tenant est fourni.
    """
    try:
        header_slug = sanitize_tenant_slug(x_tenant)
        hostname = normalize_host(host)

        if hostname in PLATFORM_HOSTS:
            return {"slug": header_slug, "kind": "platform", "host": hostname}

        standalone = STANDALONE_HOST_SLUGS.get(hostname)
        if standalone:
            return {"slug": header_slug or standalone, "kind": "standalone", "host": hostname}

        if hostname.endswith(APP_HOST_SUFFIX):
            label = hostname[: -len(APP_HOST_SUFFIX)]
            slug = sanitize_tenant_slug(label)
            if slug:
                return {"slug": header_slug or slug, "kind": "boutique", "host": hostname}
            return {"slug": header_slug, "kind": "unknown", "host": hostname}

        if hostname.endswith(".neriacorp.com"):
            labels = [part for part in hostname.split(".") if part]
            candidate = labels[1] if labels and labels[0] == "www" and len(labels) >= 3 else (labels[0] if labels else "")
            if candidate in B2B_SHORT_ALIAS_SLUGS:
                return {
                    "slug": header_slug or candidate,
                    "kind": "b2b-alias",
                    "host": hostname,
                }
            return {"slug": header_slug, "kind": "unknown", "host": hostname}

        if hostname.startswith("mamandouce.") or hostname.startswith("www.mamandouce."):
            return {"slug": header_slug or APP_SLUG_MAMANDOUCE, "kind": "standalone", "host": hostname}

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
