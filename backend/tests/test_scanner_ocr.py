"""
Suite d'intégration Scanner / OCR & N2-Vault — MamanDouce × NeriaCorp.

Couvre :
  1. Chargement Vault / env (Gemini, Cloudinary, Mongo) sans fuite de secrets HTTP
  2. Scan image 200 (multipart /api/food/scan/upload + JSON /api/food/scan/image)
  3. OCR document /api/scanner/analyze-document
  4. Cas limites : vide, corrompu (400), MIME invalide (400), trop lourd (413)
"""
from __future__ import annotations

import base64
import io
import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.security import get_admin_user, get_current_user
from models.schemas import User
from server import app

ADMIN = User(id="admin-ocr", email="admin@test.com", name="Admin", role="admin")
PREMIUM = User(
    id="user-ocr",
    email="user@test.com",
    name="User",
    role="user",
    subscription_status="premium",
)

SECRET_TOKENS = (
    "GEMINI_API_KEY",
    "NERIACORP_MASTER_KEY",
    "CLOUDINARY_API_SECRET",
    "CLOUDINARY_API_KEY",
    "MONGO_URL",
    "N2_OCR_API_KEY",
    "OPENAI_API_KEY",
)

GEMINI_EXTRACT = {
    "product_name": "Yaourt nature",
    "brand": "Laiterie",
    "ingredients": "lait, ferments lactiques",
    "packaging_text": "Yaourt nature 125g — lait, ferments lactiques",
    "category": "Produits laitiers",
    "confidence": 0.93,
    "model": "gemini-2.0-flash",
}


def _font(size: int = 22):
    try:
        return ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size
        )
    except Exception:
        return ImageFont.load_default()


def make_label_image(fmt: str = "JPEG") -> bytes:
    """Étiquette ingrédients synthétique (ticket / packaging)."""
    img = Image.new("RGB", (640, 420), (255, 252, 245))
    draw = ImageDraw.Draw(img)
    draw.rectangle([12, 12, 628, 408], outline=(80, 50, 40), width=3)
    font = _font(26)
    small = _font(18)
    draw.text((36, 36), "YAOURT NATURE", fill=(40, 30, 20), font=font)
    draw.text((36, 90), "Ingrédients :", fill=(120, 40, 30), font=small)
    draw.text((36, 130), "lait, ferments lactiques", fill=(30, 30, 30), font=small)
    draw.text((36, 180), "125 g  —  à conserver au froid", fill=(30, 30, 30), font=small)
    buf = io.BytesIO()
    img.save(buf, format=fmt, quality=85)
    return buf.getvalue()


def _assert_no_secret_leak(response) -> None:
    blob = " ".join(f"{k}: {v}" for k, v in response.headers.items()).lower()
    for token in SECRET_TOKENS:
        assert token.lower() not in blob, f"Secret {token} fuité dans les en-têtes HTTP"
    for value in (
        os.environ.get("GEMINI_API_KEY") or "",
        os.environ.get("NERIACORP_MASTER_KEY") or "",
        os.environ.get("CLOUDINARY_API_SECRET") or "",
        os.environ.get("MONGO_URL") or "",
    ):
        if value and len(value) >= 8:
            assert value.lower() not in blob


def _assert_scan_success(body: dict) -> dict:
    status = body.get("status") or ("success" if body.get("success") is True else None)
    assert status == "success", body
    data = body.get("data") or body.get("result") or {}
    assert isinstance(data, dict) and data, body
    extracted = (
        data.get("ingredients")
        or data.get("packaging_text")
        or data.get("extracted_text")
        or data.get("explanation")
        or data.get("nutrients_info")
        or data.get("raw_text")
        or data.get("food_name")
    )
    assert extracted, f"data sans ingrédients / texte extrait : {data}"
    return data


@pytest.fixture
def food_db():
    mock_db = MagicMock()
    mock_db.users.find_one = AsyncMock(
        return_value={"subscription_status": "premium"}
    )
    mock_db.ai_food_scans.insert_one = AsyncMock()
    mock_db.ai_food_scans.count_documents = AsyncMock(return_value=0)
    mock_db.search_history.insert_one = AsyncMock()
    with patch("routes.food.db", mock_db):
        yield mock_db


@pytest.fixture
def client(food_db):
    async def _user():
        return PREMIUM

    async def _admin():
        return ADMIN

    app.dependency_overrides[get_current_user] = _user
    app.dependency_overrides[get_admin_user] = _admin
    with patch("routes.scanner_ai._audit_insert", new_callable=AsyncMock), patch(
        "routes.scanner_ai._pub_insert", new_callable=AsyncMock
    ):
        with TestClient(app) as test_client:
            yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def mock_gemini():
    async def fake_extract(image_b64, extra_context=None):
        return dict(GEMINI_EXTRACT)

    async def fake_doc(prompt, image_b64):
        return {
            "nom_produit": "Yaourt nature",
            "ingredients": "lait, ferments lactiques",
            "raw_text": "YAOURT NATURE — lait, ferments lactiques",
            "confidence": 0.9,
        }

    with patch("services.gemini_vision.extract_product", new=fake_extract), patch(
        "services.gemini_vision.gemini_vision_json", new=fake_doc
    ):
        yield


# ---------------------------------------------------------------------------
# 1. Vault & configuration
# ---------------------------------------------------------------------------


def test_vault_client_loads_empire_secrets_into_environ(monkeypatch):
    from n2_vault_client import reset_sync_state, sync_secrets

    reset_sync_state()
    monkeypatch.setenv("NERIACORP_MASTER_KEY", "qa-master-key")
    monkeypatch.setenv("N2_VAULT_SYNC", "on")
    monkeypatch.setenv("N2_VAULT_BASE_URL", "https://api.neriacorp.com")

    payload = {
        "secrets": {
            "GEMINI_API_KEY": "gemini-qa",
            "N2_OCR_API_KEY": "n2-ocr-qa",
            "MONGO_URL": "mongodb://vault-qa:27017",
            "CLOUDINARY_API_SECRET": "csecret-qa",
        }
    }

    class _Resp:
        status = 200

        def read(self):
            import json

            return json.dumps(payload).encode()

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

    with patch("n2_vault_client.urllib.request.urlopen", return_value=_Resp()):
        count = sync_secrets(force=True)
    assert count == 4
    assert os.environ["GEMINI_API_KEY"] == "gemini-qa"
    assert os.environ["MONGO_URL"] == "mongodb://vault-qa:27017"
    reset_sync_state()


def test_http_responses_do_not_leak_secrets(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "super-secret-gemini-key-qa")
    monkeypatch.setenv("NERIACORP_MASTER_KEY", "super-secret-master-key-qa")
    monkeypatch.setenv("CLOUDINARY_API_SECRET", "super-secret-cloudinary-qa")
    monkeypatch.setenv("MONGO_URL", "mongodb://secret-user:secret-pass@host/db")
    for path in ("/api/health", "/api/neriacorp/catalog", "/api/neriacorp/media"):
        r = client.get(path)
        assert r.status_code == 200, r.text
        _assert_no_secret_leak(r)
        body = r.text.lower()
        assert "super-secret-gemini-key-qa" not in body
        assert "super-secret-master-key-qa" not in body
        assert "super-secret-cloudinary-qa" not in body


# ---------------------------------------------------------------------------
# 2. Scan image 200 — multipart + JSON
# ---------------------------------------------------------------------------


def test_food_scan_upload_multipart_200(client, mock_gemini):
    jpeg = make_label_image("JPEG")
    r = client.post(
        "/api/food/scan/upload",
        files={"file": ("etiquette.jpg", jpeg, "image/jpeg")},
        data={"context": "S20"},
    )
    assert r.status_code == 200, r.text
    _assert_no_secret_leak(r)
    data = _assert_scan_success(r.json())
    assert data["food_name"]
    assert "lait" in (data.get("ingredients") or "").lower() or data.get("extracted_text")


def test_food_scan_upload_png_and_webp(client, mock_gemini):
    for fmt, mime, name in (
        ("PNG", "image/png", "ticket.png"),
        ("WEBP", "image/webp", "label.webp"),
    ):
        raw = make_label_image(fmt)
        r = client.post(
            "/api/food/scan/upload",
            files={"file": (name, raw, mime)},
        )
        assert r.status_code == 200, f"{name}: {r.text}"
        _assert_scan_success(r.json())


def test_food_scan_image_json_200(client, mock_gemini):
    b64 = base64.b64encode(make_label_image("JPEG")).decode("ascii")
    r = client.post("/api/food/scan/image", json={"image_base64": b64, "context": "S20"})
    assert r.status_code == 200, r.text
    _assert_no_secret_leak(r)
    data = _assert_scan_success(r.json())
    assert data.get("verdict") in {"autorise", "limite", "deconseille"}


def test_scanner_analyze_document_200(client, mock_gemini):
    b64 = base64.b64encode(make_label_image("PNG")).decode("ascii")
    r = client.post(
        "/api/scanner/analyze-document",
        json={"image_base64": b64, "category": "alimentation"},
    )
    assert r.status_code == 200, r.text
    _assert_no_secret_leak(r)
    body = r.json()
    data = body.get("data") or {}
    text = (
        data.get("ingredients")
        or data.get("raw_text")
        or body.get("raw_text")
        or data.get("nom_produit")
    )
    assert text, body


# ---------------------------------------------------------------------------
# 3. Erreurs & cas limites
# ---------------------------------------------------------------------------


def test_food_scan_empty_json_400(client):
    r = client.post("/api/food/scan/image", json={"image_base64": ""})
    assert r.status_code == 400, r.text
    detail = r.json()["detail"]
    assert isinstance(detail, dict)
    assert detail.get("code") == "empty_image"
    assert detail.get("message")


def test_food_scan_missing_payload_422_or_400(client):
    r = client.post("/api/food/scan/image", json={})
    assert r.status_code in (400, 422), r.text


def test_food_scan_corrupt_image_400(client):
    garbage = base64.b64encode(b"this-is-not-an-image-file-xxxx").decode("ascii")
    r = client.post("/api/food/scan/image", json={"image_base64": garbage})
    assert r.status_code == 400, r.text
    detail = r.json()["detail"]
    assert isinstance(detail, dict)
    assert detail.get("code") == "corrupt_image"


def test_food_scan_upload_empty_file_400(client):
    r = client.post(
        "/api/food/scan/upload",
        files={"file": ("vide.jpg", b"", "image/jpeg")},
    )
    assert r.status_code == 400, r.text
    assert r.json()["detail"]["code"] == "empty_image"


def test_food_scan_upload_bad_mime_400(client):
    r = client.post(
        "/api/food/scan/upload",
        files={"file": ("note.txt", b"hello world not an image", "text/plain")},
    )
    assert r.status_code == 400, r.text
    assert r.json()["detail"]["code"] == "bad_mime"


def test_food_scan_upload_too_large_413(client, mock_gemini):
    jpeg = make_label_image("JPEG")
    with patch("routes.food.MAX_FOOD_IMAGE_BYTES", 32):
        r = client.post(
            "/api/food/scan/upload",
            files={"file": ("huge.jpg", jpeg, "image/jpeg")},
        )
    assert r.status_code == 413, r.text
    assert r.json()["detail"]["code"] == "too_large"


def test_analyze_video_bad_mime_400(client):
    r = client.post(
        "/api/scanner/analyze-video",
        files={"file": ("note.txt", b"hello", "text/plain")},
    )
    assert r.status_code == 400, r.text
    assert "Format" in r.json()["detail"] or "supporté" in str(r.json()["detail"])


def test_analyze_video_too_large_413(client):
    with patch("routes.scanner_ai.MAX_VIDEO_BYTES", 16):
        r = client.post(
            "/api/scanner/analyze-video",
            files={"file": ("clip.mp4", b"x" * 64, "video/mp4")},
        )
    assert r.status_code == 413, r.text


def test_scanner_analyze_empty_400(client):
    r = client.post("/api/scanner/analyze", json={})
    assert r.status_code == 400, r.text
