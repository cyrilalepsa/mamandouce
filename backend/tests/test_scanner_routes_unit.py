"""Tests unitaires /api/scanner et SSO NeriaCorp (TestClient, sans Mongo live)."""
import os
import sys
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.security import get_admin_user, get_current_user
from models.schemas import User
from server import app

ADMIN = User(id="admin-1", email="admin@test.com", name="Admin", role="admin")
USER = User(id="user-1", email="user@test.com", name="User", role="user")


@pytest.fixture(autouse=True)
def _skip_mongo_writes():
    with patch("routes.scanner_ai._audit_insert", new_callable=AsyncMock), patch(
        "routes.scanner_ai._pub_insert", new_callable=AsyncMock
    ):
        yield


@pytest.fixture
def admin_client():
    async def _admin():
        return ADMIN

    app.dependency_overrides[get_admin_user] = _admin
    app.dependency_overrides[get_current_user] = _admin
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def user_client():
    async def _user():
        return USER

    app.dependency_overrides[get_current_user] = _user
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def anon_client():
    app.dependency_overrides.clear()
    with TestClient(app) as client:
        yield client


def test_scanner_apps_200(admin_client):
    r = admin_client.get("/api/scanner/apps")
    assert r.status_code == 200, r.text
    data = r.json()
    names = {a["name"] for a in data["apps"]}
    assert names == {"VisaTrace", "Heritia", "VeoVision", "Vellumia", "Aevis"}
    assert data["operation_mode"] == "Admin_Only"
    aevis = next(a for a in data["apps"] if a["name"] == "Aevis")
    assert aevis["theme_color"] == "#2E8B57"
    assert aevis["estimated_revenue"] == 40.0
    assert aevis["color"] == "#2E8B57"
    assert aevis["revenue"] == 40.0
    assert "configured" in aevis


def test_scanner_apps_403_non_admin(user_client):
    r = user_client.get("/api/scanner/apps")
    assert r.status_code == 403


def test_scanner_apps_401_anon(anon_client):
    r = anon_client.get("/api/scanner/apps")
    assert r.status_code in (401, 403)


def test_analyze_empty_400(admin_client):
    r = admin_client.post("/api/scanner/analyze", json={})
    assert r.status_code == 400


def test_analyze_forbidden_user(user_client):
    r = user_client.post("/api/scanner/analyze", json={"text_input": "hello"})
    assert r.status_code == 403


def test_analyze_text_ok(admin_client):
    fake = {
        "metadata": {
            "source_app": "Heritia",
            "confidence_score": 0.9,
            "operation_mode": "Admin_Only",
        },
        "business": {"title": "T", "description": "D"},
        "display_card": {"title": "T", "theme_color": "#8B4513"},
        "financial": {"estimated_revenue": 60.0, "currency": "EUR"},
    }
    with patch("routes.scanner_ai.analyze_neriacorp", new_callable=AsyncMock, return_value=fake):
        r = admin_client.post("/api/scanner/analyze", json={"text_input": "un texte"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["metadata"]["source_app"] == "Heritia"
    assert "id" in body
    assert body["financial"]["currency"] == "EUR"


def test_publish_unknown_app(admin_client):
    r = admin_client.post(
        "/api/scanner/publish",
        json={"scan_id": "x", "target_app": "inconnu", "payload": {"title": "T"}},
    )
    assert r.status_code == 400
    assert "App inconnue" in r.json()["detail"]


def test_publish_mock_unconfigured(admin_client):
    r = admin_client.post(
        "/api/scanner/publish",
        json={
            "scan_id": "scan-1",
            "target_app": "aevis",
            "payload": {"title": "Offre", "price": 10, "category": "POS"},
        },
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "published_mock"
    assert body["partial"] is True
    assert body["target_app"] == "Aevis"
    warn = (body.get("warning") or "").upper()
    assert "AEVIS_BASE_URL" in warn or "AEVIS_API_KEY" in warn


def test_analyze_video_invalid_mime(admin_client):
    r = admin_client.post(
        "/api/scanner/analyze-video",
        files={"file": ("note.txt", b"hello", "text/plain")},
        data={"text_input": ""},
    )
    assert r.status_code == 400
    assert "Format" in r.json()["detail"]


def test_analyze_video_too_large(admin_client):
    with patch("routes.scanner_ai.MAX_VIDEO_BYTES", 16):
        r = admin_client.post(
            "/api/scanner/analyze-video",
            files={"file": ("clip.mp4", b"x" * 64, "video/mp4")},
            data={"text_input": ""},
        )
    assert r.status_code == 413


def test_analyze_video_missing_file(admin_client):
    r = admin_client.post("/api/scanner/analyze-video")
    assert r.status_code == 400


def test_categories_auth_user(user_client):
    r = user_client.get("/api/scanner/categories")
    assert r.status_code == 200
    cats = r.json()["categories"]
    names = {c["id"] for c in cats}
    for expected in (
        "alimentation",
        "textile",
        "auto",
        "documents",
        "menu",
        "facture",
        "admin",
        "product",
    ):
        assert expected in names


def test_sso_status_public(anon_client, monkeypatch):
    monkeypatch.delenv("NERIACORP_SSO_LOGIN_URL", raising=False)
    monkeypatch.delenv("NERIACORP_SSO_ISSUER", raising=False)
    r = anon_client.get("/api/neriacorp/sso/status")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["sso_enabled"] is False
    assert body["provider"] == "mamandouce-jwt"
    assert body["portal_url"]
    session = body["session"]
    assert session["handoff"] == "authorization_code"
    assert session["authorize_url"].startswith("https://")
    assert session["token_url"]
    assert session["jwks_url"]
    assert "openid" in session["scopes"]
    assert session["client_id"] == "mamandouce"


def test_catalog_capabilities(anon_client):
    r = anon_client.get("/api/neriacorp/catalog")
    assert r.status_code == 200
    body = r.json()
    assert "ocr-scanner" in body["capabilities"]
    assert "sso" in body["capabilities"]
    assert "ocr-scanner" in body["apps"][0]["capabilities"]


def test_media_endpoint_public(anon_client):
    r = anon_client.get("/api/neriacorp/media")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["cdn_host"] == "https://res.cloudinary.com"
    assert body["folder"] == "mamandouce/fetus"
    assert "enabled" in body


def test_cors_allows_neriacorp_portal(anon_client):
    r = anon_client.options(
        "/api/neriacorp/sso/status",
        headers={
            "Origin": "https://neriacorp.com",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization",
        },
    )
    assert r.status_code in (200, 204)
    assert r.headers.get("access-control-allow-origin") == "https://neriacorp.com"


def test_cors_allows_n2_worker(anon_client):
    r = anon_client.get(
        "/api/neriacorp/catalog",
        headers={"Origin": "https://api.neriacorp.com"},
    )
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == "https://api.neriacorp.com"


def test_n2_ocr_defaults_to_central_worker(monkeypatch):
    monkeypatch.delenv("N2_OCR_BASE_URL", raising=False)
    from integrations.neriacorp.scanner_adapter import n2_ocr_base_url

    assert n2_ocr_base_url() == "https://api.neriacorp.com"


def test_n2_ocr_can_be_disabled(monkeypatch):
    monkeypatch.setenv("N2_OCR_BASE_URL", "off")
    from integrations.neriacorp.scanner_adapter import n2_ocr_base_url

    assert n2_ocr_base_url() == ""


def test_analyze_food_uses_n2_gateway(monkeypatch):
    monkeypatch.setenv("N2_OCR_BASE_URL", "https://api.neriacorp.com")
    posted = {}

    class FakeResp:
        status_code = 200

        def raise_for_status(self):
            return None

        def json(self):
            return {
                "food_name": "Pomme",
                "verdict": "autorise",
                "explanation": "Fruit sûr",
                "confidence": 0.95,
            }

    class FakeClient:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return None

        async def post(self, url, headers=None, json=None):
            posted["url"] = url
            posted["json"] = json
            return FakeResp()

    import asyncio
    from integrations.neriacorp.scanner_adapter import analyze_food

    with patch("integrations.neriacorp.scanner_adapter.httpx.AsyncClient", FakeClient):
        data = asyncio.run(analyze_food(image_base64="abc", user_context="S20"))
    assert posted["url"] == "https://api.neriacorp.com/ocr/analyze-food"
    assert posted["json"]["source_app"] == "mamandouce"
    assert data["food_name"] == "Pomme"
    assert data["verdict"] == "autorise"
