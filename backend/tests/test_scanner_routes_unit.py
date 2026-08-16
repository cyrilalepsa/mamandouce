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


def test_cors_allows_mamandouce_neriacorp_subdomain(anon_client):
    origin = "https://mamandouce.neriacorp.com"
    r = anon_client.options(
        "/api/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert r.status_code in (200, 204)
    assert r.headers.get("access-control-allow-origin") == origin


def test_cors_allows_n2_worker(anon_client):
    r = anon_client.get(
        "/api/neriacorp/catalog",
        headers={"Origin": "https://api.neriacorp.com"},
    )
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == "https://api.neriacorp.com"


def test_cors_allows_b2b_neriacorp_subdomain(anon_client):
    origin = "https://odelicesenfamille.neriacorp.com"
    r = anon_client.options(
        "/api/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert r.status_code in (200, 204)
    assert r.headers.get("access-control-allow-origin") == origin
    allow_methods = (r.headers.get("access-control-allow-methods") or "").upper()
    for method in ("GET", "POST", "PUT", "DELETE"):
        assert method in allow_methods
    allow_headers = (r.headers.get("access-control-allow-headers") or "").lower()
    assert "authorization" in allow_headers
    assert "content-type" in allow_headers


def test_parse_cors_origins_csv_and_aliases(monkeypatch):
    monkeypatch.setenv(
        "CORS_ORIGINS",
        "https://odelicesenfamille.neriacorp.com, https://mamandouce.app/",
    )
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    monkeypatch.setenv("FRONTEND_URL", "https://front.example")
    monkeypatch.setenv("PUBLIC_APP_URL", "https://mamandouce.app")
    from core.config import parse_cors_origins

    origins = parse_cors_origins()
    assert "https://odelicesenfamille.neriacorp.com" in origins
    assert "https://mamandouce.app" in origins
    assert "https://front.example" in origins
    assert "https://neriacorp.com" in origins


def test_parse_cors_origins_allowed_origins_alias(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://extra.example,http://localhost:5173")
    from core.config import parse_cors_origins

    origins = parse_cors_origins()
    assert "https://extra.example" in origins
    assert origins.count("http://localhost:5173") == 1


def test_parse_cors_includes_mamandouce_neriacorp_by_default(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    from core.config import parse_cors_origins

    origins = parse_cors_origins()
    required = (
        "https://mamandouce.neriacorp.com",
        "https://www.mamandouce.neriacorp.com",
        "https://neriacorp.com",
        "https://" + "".join(("cyca", "family", ".com")),
        "https://www." + "".join(("cyca", "family", ".com")),
    )
    for origin in required:
        assert origin in origins
    assert len(origins) == len(set(origins))
    assert all(not origin.endswith("/") for origin in origins)


def test_email_defaults_use_neriacorp_domain(monkeypatch):
    monkeypatch.delenv("SENDER_EMAIL", raising=False)
    monkeypatch.delenv("CONTACT_EMAIL", raising=False)
    from core.config import load_settings
    import core.config as cfg

    load_settings()
    assert cfg.SENDER_EMAIL == "noreply@neriacorp.com"
    assert cfg.CONTACT_EMAIL == "contact@neriacorp.com"


def test_n2_ocr_defaults_to_central_worker(monkeypatch):
    monkeypatch.delenv("N2_OCR_BASE_URL", raising=False)
    from integrations.neriacorp.scanner_adapter import n2_ocr_base_url

    assert n2_ocr_base_url() == "https://api.neriacorp.com"


def test_n2_ocr_can_be_disabled(monkeypatch):
    monkeypatch.setenv("N2_OCR_BASE_URL", "off")
    from integrations.neriacorp.scanner_adapter import n2_ocr_base_url

    assert n2_ocr_base_url() == ""


def test_analyze_food_uses_gemini_then_local_engine(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_VISION_MODEL", "gemini-2.0-flash")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("N2_OCR_API_KEY", raising=False)
    monkeypatch.setenv("N2_OCR_BASE_URL", "off")

    async def fake_extract(image_b64, extra_context=None):
        assert extra_context == "S20"
        return {
            "product_name": "Pomme Golden",
            "brand": "Verger",
            "ingredients": "pomme",
            "packaging_text": "Pomme golden 4 fruits",
            "category": "Fruits",
            "confidence": 0.91,
            "model": "gemini-2.0-flash",
        }

    import asyncio
    import base64 as b64
    from integrations.neriacorp.scanner_adapter import analyze_food

    with patch(
        "services.gemini_vision.extract_product",
        new=fake_extract,
    ), patch(
        "integrations.neriacorp.scanner_adapter._scan_from_n2_text",
        side_effect=AssertionError("N2 OCR ne doit pas être appelé"),
    ):
        data = asyncio.run(
            analyze_food(image_base64=b64.b64encode(b"fakeimg").decode(), user_context="S20")
        )
    assert data["food_name"] == "Pomme Golden"
    assert data["verdict"] == "autorise"
    assert data["engine"] == "gemini-vision+local-pregnancy"
    assert data["ingredients"] == "pomme"
    assert data["packaging_text"] == "Pomme golden 4 fruits"
    assert data["product_name"] == "Pomme Golden"


def test_analyze_food_source_requires_only_gemini():
    import inspect
    from integrations.neriacorp.scanner_adapter import analyze_food
    from services.gemini_vision import PRODUCT_EXTRACT_PROMPT

    src = inspect.getsource(analyze_food)
    assert "extract_product" in src
    assert "apply_pregnancy_engine" in src
    assert "openai" not in src.lower()
    assert "n2/ocr" not in src
    assert "_n2_extract" not in src
    for field in ("product_name", "ingredients", "packaging_text"):
        assert field in PRODUCT_EXTRACT_PROMPT


def test_pregnancy_engine_flags_raw_milk():
    from integrations.neriacorp.scanner_adapter import apply_pregnancy_engine

    data = apply_pregnancy_engine(
        {
            "product_name": "Camembert fermier",
            "ingredients": "lait cru, sel, ferments",
            "packaging_text": "Camembert",
            "confidence": 0.8,
        }
    )
    assert data["verdict"] == "deconseille"
    assert "lait cru" in data["explanation"].lower()


def test_gemini_vision_model_default(monkeypatch):
    monkeypatch.delenv("GEMINI_VISION_MODEL", raising=False)
    monkeypatch.delenv("AEVIS_GEMINI_VISION_MODEL", raising=False)
    from services.gemini_vision import gemini_vision_model

    assert gemini_vision_model() == "gemini-2.0-flash"


def test_cloudinary_prod_env_names():
    from pathlib import Path
    from core import config as cfg

    assert hasattr(cfg, "CLOUDINARY_CLOUD_NAME")
    assert hasattr(cfg, "CLOUDINARY_API_KEY")
    assert hasattr(cfg, "CLOUDINARY_API_SECRET")

    backend = Path(__file__).resolve().parents[1]
    upload_src = (backend / "scripts" / "upload_fetus_cloudinary.py").read_text(encoding="utf-8")
    for name in ("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"):
        assert f'os.environ.get("{name}")' in upload_src
        assert name in upload_src

    portal_src = (backend / "routes" / "neriacorp_portal.py").read_text(encoding="utf-8")
    assert "CLOUDINARY_CLOUD_NAME" in portal_src
    # L'endpoint public n'expose jamais les secrets
    media_fn = portal_src.split("async def neriacorp_media")[-1].split("async def ")[0]
    assert "CLOUDINARY_API_KEY" not in media_fn
    assert "CLOUDINARY_API_SECRET" not in media_fn

