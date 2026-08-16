"""Audit sécurité / routage post-infra (hub, *.app.neriacorp.com, alias B2B)."""
import os
import re
import sys

import pytest
from fastapi.testclient import TestClient
from starlette.responses import Response

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.config import CORS_ORIGIN_REGEX, parse_cors_origins
from core.session import (
    SESSION_COOKIE_NAME,
    cookie_domain_for_host,
    session_cookie_kwargs,
    set_session_cookie,
)
from core.tenant import resolve_tenant
from server import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_cors_defaults_include_hub_and_b2b_aliases(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    monkeypatch.delenv("N2_B2B_ALIASES", raising=False)
    monkeypatch.delenv("B2B_ALIASES", raising=False)
    origins = parse_cors_origins()
    for origin in (
        "https://hub.neriacorp.com",
        "https://www.hub.neriacorp.com",
        "https://heritia.neriacorp.com",
        "https://visatrace.neriacorp.com",
        "https://mamandouce.neriacorp.com",
    ):
        assert origin in origins
    assert "*" not in origins


def test_cors_star_wildcard_is_ignored(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "*")
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    origins = parse_cors_origins()
    assert "*" not in origins
    assert "https://hub.neriacorp.com" in origins


def test_cors_b2b_alias_env(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.setenv("N2_B2B_ALIASES", "marque.neriacorp.com,https://autre.neriacorp.com/")
    origins = parse_cors_origins()
    assert "https://marque.neriacorp.com" in origins
    assert "https://autre.neriacorp.com" in origins


def test_cors_regex_allows_app_subdomains_not_apex_wildcard():
    assert re.fullmatch(CORS_ORIGIN_REGEX, "https://boutique.app.neriacorp.com")
    assert re.fullmatch(CORS_ORIGIN_REGEX, "https://md.app.neriacorp.com")
    assert not re.fullmatch(CORS_ORIGIN_REGEX, "https://boutique.neriacorp.com")
    assert not re.fullmatch(CORS_ORIGIN_REGEX, "https://evil.neriacorp.com")
    assert not re.fullmatch(CORS_ORIGIN_REGEX, "https://hub.neriacorp.com")
    assert not re.fullmatch(CORS_ORIGIN_REGEX, "https://www.app.neriacorp.com")
    assert re.fullmatch(CORS_ORIGIN_REGEX, "https://mamandouce-frontend-production.up.railway.app")


def test_cors_preflight_hub_and_app_host(client):
    for origin in (
        "https://hub.neriacorp.com",
        "https://boutique.app.neriacorp.com",
        "https://heritia.neriacorp.com",
    ):
        r = client.options(
            "/api/health",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization,content-type,x-tenant",
            },
        )
        assert r.status_code in (200, 204), origin
        assert r.headers.get("access-control-allow-origin") == origin, origin
        assert r.headers.get("access-control-allow-credentials") == "true"


def test_cors_rejects_unknown_neriacorp_subdomain(client):
    r = client.options(
        "/api/health",
        headers={
            "Origin": "https://evil.neriacorp.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert r.status_code in (200, 204, 400)
    assert r.headers.get("access-control-allow-origin") != "https://evil.neriacorp.com"


@pytest.mark.parametrize(
    "host,x_tenant,slug,kind",
    [
        ("hub.neriacorp.com", None, None, "platform"),
        ("www.hub.neriacorp.com", None, None, "platform"),
        ("mamandouce.neriacorp.com", None, "mamandouce", "standalone"),
        ("www.mamandouce.neriacorp.com", None, "mamandouce", "standalone"),
        ("boutique.app.neriacorp.com", None, "boutique", "boutique"),
        ("md.app.neriacorp.com", None, "md", "boutique"),
        ("heritia.neriacorp.com", None, "heritia", "b2b-alias"),
        ("random.neriacorp.com", None, None, "unknown"),
        ("hub.neriacorp.com", "boutique", "boutique", "platform"),
        ("mamandouce.neriacorp.com", "../etc", "mamandouce", "standalone"),
        ("", "not a slug!!", None, "unknown"),
        (None, None, None, "unknown"),
    ],
)
def test_resolve_tenant_never_crashes(host, x_tenant, slug, kind):
    info = resolve_tenant(host=host, x_tenant=x_tenant)
    assert info["kind"] == kind
    assert info["slug"] == slug


def test_health_tenant_headers_hub_and_standalone(client):
    hub = client.get("/api/health", headers={"Host": "hub.neriacorp.com"})
    assert hub.status_code == 200
    assert hub.headers.get("x-tenant-kind") == "platform"
    assert "x-tenant" not in {k.lower() for k in hub.headers.keys()} or not hub.headers.get("x-tenant")

    md = client.get("/api/health", headers={"Host": "mamandouce.neriacorp.com"})
    assert md.status_code == 200
    assert md.headers.get("x-tenant") == "mamandouce"
    assert md.headers.get("x-tenant-kind") == "standalone"

    shop = client.get(
        "/api/health",
        headers={"Host": "boutique.app.neriacorp.com", "X-Tenant": "boutique"},
    )
    assert shop.status_code == 200
    assert shop.headers.get("x-tenant") == "boutique"
    assert shop.headers.get("x-tenant-kind") == "boutique"


def test_session_cookie_domain_and_samesite():
    kwargs = session_cookie_kwargs("boutique.app.neriacorp.com")
    assert kwargs["domain"] == ".neriacorp.com"
    assert kwargs["samesite"] == "lax"
    assert kwargs["secure"] is True
    assert kwargs["httponly"] is True
    assert kwargs["key"] == SESSION_COOKIE_NAME

    local = session_cookie_kwargs("localhost")
    assert local["domain"] is None
    assert local["secure"] is False
    assert cookie_domain_for_host("hub.neriacorp.com") == ".neriacorp.com"


def test_set_session_cookie_header():
    response = Response()
    set_session_cookie(response, "jwt-token", host="md.app.neriacorp.com")
    header = response.headers.get("set-cookie") or ""
    assert SESSION_COOKIE_NAME in header
    assert "jwt-token" in header
    assert "HttpOnly" in header
    assert re.search(r"domain=\.neriacorp\.com", header, re.I)
    assert re.search(r"samesite=lax", header, re.I)


def test_https_redirect_on_forwarded_proto(client, monkeypatch):
    monkeypatch.setenv("FORCE_HTTPS", "1")
    r = client.get(
        "/api/health",
        headers={
            "Host": "mamandouce.app.neriacorp.com",
            "X-Forwarded-Proto": "http",
        },
        follow_redirects=False,
    )
    assert r.status_code == 308
    assert str(r.headers.get("location", "")).startswith("https://")


def test_https_not_forced_on_localhost(client, monkeypatch):
    monkeypatch.setenv("FORCE_HTTPS", "1")
    r = client.get("/api/health", headers={"Host": "localhost"})
    assert r.status_code == 200
