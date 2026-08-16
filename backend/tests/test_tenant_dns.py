"""DNS prod : {slug}.neriacorp.com — tenant, CORS, zéro ancien wildcard."""
import os
import re
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.config import NERIACORP_ORIGIN_REGEX
from core.tenant import resolve_tenant
from server import app

REPO = Path(__file__).resolve().parents[2]
_LEGACY_APP_WILDCARD = "." + "app" + ".neriacorp.com"
_LEGACY_RAILWAY = "." + "up" + ".railway.app"
_SKIP_DIRS = {".git", "node_modules", "__pycache__", "dist", "build", ".venv", ".pytest_cache"}
_SKIP_SUFFIXES = {".pyc", ".pyo", ".so"}


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.mark.parametrize(
    "host,x_tenant,slug,kind",
    [
        ("hub.neriacorp.com", None, None, "platform"),
        ("api.neriacorp.com", None, None, "platform"),
        ("cockpit.neriacorp.com", None, None, "platform"),
        ("mamandouce.neriacorp.com", None, "mamandouce", "standalone"),
        ("www.mamandouce.neriacorp.com", None, "mamandouce", "standalone"),
        ("odelicesenfamille.neriacorp.com", None, "odelicesenfamille", "boutique"),
        ("www.odelicesenfamille.neriacorp.com", None, "odelicesenfamille", "boutique"),
        ("hub.neriacorp.com", "odelicesenfamille", "odelicesenfamille", "platform"),
        ("", None, None, "unknown"),
    ],
)
def test_resolve_tenant_first_level_neriacorp(host, x_tenant, slug, kind):
    info = resolve_tenant(host=host, x_tenant=x_tenant)
    assert info["kind"] == kind
    assert info["slug"] == slug


def test_health_tenant_headers(client):
    hub = client.get("/api/health", headers={"Host": "hub.neriacorp.com"})
    assert hub.status_code == 200
    assert hub.headers.get("x-tenant-kind") == "platform"

    shop = client.get("/api/health", headers={"Host": "odelicesenfamille.neriacorp.com"})
    assert shop.status_code == 200
    assert shop.headers.get("x-tenant") == "odelicesenfamille"
    assert shop.headers.get("x-tenant-kind") == "boutique"

    md = client.get("/api/health", headers={"Host": "mamandouce.neriacorp.com"})
    assert md.status_code == 200
    assert md.headers.get("x-tenant") == "mamandouce"
    assert md.headers.get("x-tenant-kind") == "standalone"


def test_cors_regex_allows_neria_subdomains_not_global_star():
    assert re.fullmatch(NERIACORP_ORIGIN_REGEX, "https://odelicesenfamille.neriacorp.com")
    assert re.fullmatch(NERIACORP_ORIGIN_REGEX, "https://hub.neriacorp.com")
    assert re.fullmatch(NERIACORP_ORIGIN_REGEX, "https://mamandouce.neriacorp.com")
    assert not re.fullmatch(NERIACORP_ORIGIN_REGEX, "https://evil.example.com")
    assert "*" not in NERIACORP_ORIGIN_REGEX


def test_cors_preflight_b2b_and_hub(client):
    for origin in (
        "https://odelicesenfamille.neriacorp.com",
        "https://hub.neriacorp.com",
        "https://cockpit.neriacorp.com",
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


def test_repo_has_zero_legacy_app_wildcard():
    hits = []
    for path in REPO.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() in _SKIP_SUFFIXES:
            continue
        if any(part in _SKIP_DIRS for part in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        rel = str(path.relative_to(REPO)).replace("\\", "/")
        if _LEGACY_APP_WILDCARD in text:
            hits.append(rel)
    assert hits == [], "Ancien wildcard encore présent :\n" + "\n".join(hits)


def test_src_has_zero_legacy_railway_frontend_hosts():
    hits = []
    roots = [REPO / "frontend" / "src", REPO / "backend" / "core", REPO / "backend" / "tests"]
    for root in roots:
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() in _SKIP_SUFFIXES:
                continue
            if any(part in _SKIP_DIRS for part in path.parts):
                continue
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            if _LEGACY_RAILWAY in text:
                hits.append(str(path.relative_to(REPO)))
    assert hits == [], "Anciennes URL Railway encore présentes :\n" + "\n".join(hits)
