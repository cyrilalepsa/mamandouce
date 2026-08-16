"""
Session Cookie / JWT pour les sous-domaines NeriaCorp.

- JWT Bearer reste la source principale (PWA / localStorage).
- Cookie HttpOnly miroir pour le hub et *.app.neriacorp.com
  (Domain=.neriacorp.com, SameSite=Lax, Secure).
- En local : pas de Domain, Secure désactivé.
"""
from __future__ import annotations

import os
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import RedirectResponse, Response
from starlette.types import ASGIApp

from .config import ACCESS_TOKEN_EXPIRE_MINUTES
from .tenant import normalize_host

SESSION_COOKIE_NAME = os.environ.get("SESSION_COOKIE_NAME", "md_session")
DEFAULT_COOKIE_DOMAIN = ".neriacorp.com"


def cookie_domain_for_host(host: str | None) -> Optional[str]:
    hostname = normalize_host(host)
    override = (os.environ.get("SESSION_COOKIE_DOMAIN") or "").strip()
    if override.lower() in {"off", "none", "false", "-"}:
        return None
    if override:
        return override
    if hostname.endswith(".neriacorp.com") or hostname == "neriacorp.com":
        return DEFAULT_COOKIE_DOMAIN
    return None


def is_secure_request(request: Request | None = None, host: str | None = None) -> bool:
    hostname = normalize_host(host or (request.headers.get("host") if request is not None else ""))
    if hostname in {"localhost", "127.0.0.1", "0.0.0.0", "testserver"}:
        return False
    if request is not None:
        proto = (request.headers.get("x-forwarded-proto") or request.url.scheme or "").split(",")[0].strip()
        return proto == "https"
    return True


def session_cookie_kwargs(host: str | None = None, *, secure: bool | None = None) -> dict:
    hostname = normalize_host(host)
    if secure is None:
        secure = hostname not in {"localhost", "127.0.0.1", "0.0.0.0", "testserver", ""}
    return {
        "key": SESSION_COOKIE_NAME,
        "httponly": True,
        "secure": bool(secure),
        "samesite": "lax",
        "domain": cookie_domain_for_host(host),
        "path": "/",
        "max_age": int(ACCESS_TOKEN_EXPIRE_MINUTES) * 60,
    }


def set_session_cookie(response: Response, token: str, host: str | None = None, *, secure: bool | None = None) -> None:
    kwargs = session_cookie_kwargs(host, secure=secure)
    response.set_cookie(value=token, **kwargs)


def clear_session_cookie(response: Response, host: str | None = None) -> None:
    kwargs = session_cookie_kwargs(host, secure=False)
    response.delete_cookie(
        key=kwargs["key"],
        path=kwargs["path"],
        domain=kwargs["domain"],
    )


class SessionCookieMiddleware(BaseHTTPMiddleware):
    """Si Authorization est absent, recopie le cookie JWT en Bearer."""

    async def dispatch(self, request: Request, call_next):
        try:
            auth = request.headers.get("authorization") or ""
            if not auth.startswith("Bearer "):
                token = request.cookies.get(SESSION_COOKIE_NAME)
                if token:
                    headers = request.scope.setdefault("headers", [])
                    raw = [(k, v) for k, v in headers if k != b"authorization"]
                    raw.append((b"authorization", f"Bearer {token}".encode("latin-1")))
                    request.scope["headers"] = raw
        except Exception:
            pass
        return await call_next(request)


def force_https_enabled() -> bool:
    flag = (os.environ.get("FORCE_HTTPS") or "").strip().lower()
    if flag in {"0", "off", "false", "no"}:
        return False
    if flag in {"1", "on", "true", "yes"}:
        return True
    env = (os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("ENV") or "").strip().lower()
    return env in {"production", "prod"}


class ForwardedHttpsRedirectMiddleware(BaseHTTPMiddleware):
    """HTTP → HTTPS via X-Forwarded-Proto (Railway / proxy). Ignoré en local."""

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        if not force_https_enabled():
            return await call_next(request)

        host = normalize_host(request.headers.get("host"))
        if host in {"localhost", "127.0.0.1", "0.0.0.0", "testserver"}:
            return await call_next(request)

        proto = (request.headers.get("x-forwarded-proto") or request.url.scheme or "").split(",")[0].strip().lower()
        if proto == "http":
            https_url = request.url.replace(scheme="https")
            return RedirectResponse(str(https_url), status_code=308)

        response = await call_next(request)
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains",
        )
        return response
