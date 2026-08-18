"""Tests GET /api/auth/test-email (diagnostic Resend isolé)."""
import os
import sys
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.schemas import User
from routes.auth import DIAG_TEST_EMAIL_TO
from server import app

ADMIN = User(id="admin-diag", email="cyrilalepsa@gmail.com", name="Admin", role="admin")
USER = User(id="user-diag", email="user@test.com", name="User", role="user")

FAKE_SEND = {
    "ok": True,
    "result": {"id": "msg_diag_1"},
    "resend": {"id": "msg_diag_1"},
    "email_id": "msg_diag_1",
    "http_status": 200,
    "skipped": False,
    "error": None,
}


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_test_email_requires_auth(client):
    r = client.get("/api/auth/test-email")
    assert r.status_code == 401
    r2 = client.get("/api/v1/auth/test-email")
    assert r2.status_code == 401


def test_test_email_rejects_regular_user(client):
    async def _user(credentials=None):
        return USER

    with patch("routes.auth.get_current_user", _user):
        r = client.get("/api/auth/test-email", headers={"Authorization": "Bearer fake"})
    assert r.status_code == 401


def test_test_email_admin_secret_returns_resend_json(client, monkeypatch):
    monkeypatch.setenv("ADMIN_SECRET", "diag-secret-unit-test")
    monkeypatch.setenv("RESEND_API_KEY", "re_abcdefghijklmnopqrstuvwxyz")
    monkeypatch.setenv("SENDER_EMAIL", "noreply@neriacorp.com")

    with patch("routes.auth.send_resend_email", return_value=FAKE_SEND) as send:
        r = client.get("/api/auth/test-email", params={"admin_secret": "diag-secret-unit-test"})

    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert data["to"] == DIAG_TEST_EMAIL_TO
    assert data["to"] == "cyrilalepsa@gmail.com"
    assert data["SENDER_EMAIL"] == "noreply@neriacorp.com"
    assert data["from"] == "MamanDouce <noreply@neriacorp.com>"
    assert data["RESEND_API_KEY_present"] is True
    assert data["RESEND_API_KEY_masked"].startswith("re_abc")
    assert "re_abcdefghijklmnopqrstuvwxyz" not in r.text
    assert data["email_id"] == "msg_diag_1"
    assert data["resend"] == {"id": "msg_diag_1"}
    assert data["http_status"] == 200
    send.assert_called_once()
    assert send.call_args.kwargs["to"] == "cyrilalepsa@gmail.com"
    assert send.call_args.kwargs["purpose"] == "diagnostic-test-email"


def test_test_email_v1_alias_and_header_secret(client, monkeypatch):
    monkeypatch.setenv("ADMIN_SECRET", "diag-secret-unit-test")
    monkeypatch.setenv("SENDER_EMAIL", "hello@neriacorp.com")
    with patch("routes.auth.send_resend_email", return_value=FAKE_SEND):
        r = client.get(
            "/api/v1/auth/test-email",
            headers={"X-Admin-Secret": "diag-secret-unit-test"},
        )
    assert r.status_code == 200
    assert r.json()["SENDER_EMAIL"] == "hello@neriacorp.com"
    assert r.json()["to"] == "cyrilalepsa@gmail.com"


def test_test_email_returns_resend_http_error(client, monkeypatch):
    monkeypatch.setenv("ADMIN_SECRET", "diag-secret-unit-test")
    failed = {
        "ok": False,
        "error": "InvalidApiKeyError: API key is invalid",
        "resend": {
            "exception": "InvalidApiKeyError",
            "code": 401,
            "message": "API key is invalid",
            "error_type": "invalid_api_key",
        },
        "email_id": None,
        "http_status": 401,
        "skipped": False,
    }
    with patch("routes.auth.send_resend_email", return_value=failed):
        r = client.get(
            "/api/auth/test-email",
            headers={"X-Admin-Secret": "diag-secret-unit-test"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is False
    assert data["http_status"] == 401
    assert data["resend"]["code"] == 401
    assert data["error"]


def test_test_email_admin_jwt(client, monkeypatch):
    async def _admin(credentials=None):
        return ADMIN

    monkeypatch.setenv("SENDER_EMAIL", "noreply@neriacorp.com")
    with (
        patch("routes.auth.get_current_user", _admin),
        patch("routes.auth.send_resend_email", return_value=FAKE_SEND),
    ):
        r = client.get("/api/auth/test-email", headers={"Authorization": "Bearer fake"})
    assert r.status_code == 200
    assert r.json()["requested_by"].startswith("jwt:")


def test_wrong_admin_secret_rejected(client, monkeypatch):
    monkeypatch.setenv("ADMIN_SECRET", "diag-secret-unit-test")
    r = client.get("/api/auth/test-email", params={"admin_secret": "nope"})
    assert r.status_code == 401


def test_debug_send_test_returns_resend_json(client, monkeypatch):
    monkeypatch.setenv("ADMIN_SECRET", "diag-secret-unit-test")
    monkeypatch.setenv("SENDER_EMAIL", "noreply@neriacorp.com")
    with patch("routes.auth.send_resend_email", return_value=FAKE_SEND):
        r = client.get(
            "/api/v1/auth/debug-send-test",
            headers={"X-Admin-Secret": "diag-secret-unit-test"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["resend_response"] == {"id": "msg_diag_1"}
    assert data["SENDER_EMAIL"] == "noreply@neriacorp.com"
    assert data["to"] == "cyrilalepsa@gmail.com"


def test_debug_send_test_requires_auth(client):
    r = client.get("/api/v1/auth/debug-send-test")
    assert r.status_code == 401


def test_debug_send_test_returns_error_payload(client, monkeypatch):
    monkeypatch.setenv("ADMIN_SECRET", "diag-secret-unit-test")
    failed = {
        "ok": False,
        "error": "RuntimeError: boom",
        "resend": {"exception": "RuntimeError", "message": "boom"},
        "traceback": "Traceback (most recent call last):\n boom",
        "email_id": None,
        "http_status": 500,
        "skipped": False,
    }
    with patch("routes.auth.send_resend_email", return_value=failed):
        r = client.get(
            "/api/auth/debug-send-test",
            params={"admin_secret": "diag-secret-unit-test"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "error"
    assert "boom" in data["error"]
    assert "Traceback" in data["traceback"]
