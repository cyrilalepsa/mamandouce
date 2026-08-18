"""Tests POST /auth/forgot-password : lookup Mongo insensible à la casse."""
import os
import sys
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from routes.auth import normalize_email, user_email_query
from server import app

FAKE_SEND = {
    "ok": True,
    "result": {"id": "msg_reset_1"},
    "resend": {"id": "msg_reset_1"},
    "email_id": "msg_reset_1",
    "http_status": 200,
    "skipped": False,
    "error": None,
}


def test_normalize_email_lower_and_strip():
    assert normalize_email("  CyrilAlepsa@Gmail.com ") == "cyrilalepsa@gmail.com"


def test_user_email_query_is_case_insensitive():
    q = user_email_query("CyrilAlepsa@Gmail.com")
    assert "$or" in q
    exact = [c["email"] for c in q["$or"] if isinstance(c["email"], str)]
    assert "cyrilalepsa@gmail.com" in exact
    assert "CyrilAlepsa@Gmail.com" in exact
    regex = next(c["email"] for c in q["$or"] if isinstance(c["email"], dict))
    assert regex["$options"] == "i"
    assert "cyrilalepsa@gmail.com" in regex["$regex"].replace("\\", "")


def test_forgot_password_sends_when_db_email_has_different_case(caplog):
    captured = {}

    async def fake_find_user(email):
        captured["lookup_email"] = email
        return {"id": "u1", "email": "CyrilAlepsa@gmail.com", "name": "Cyril"}

    async def fake_delete_many(*_a, **_k):
        return None

    async def fake_insert_one(doc):
        captured["reset"] = doc
        return None

    fake_db = SimpleNamespace(
        name="mamandouce",
        password_resets=SimpleNamespace(
            delete_many=fake_delete_many,
            insert_one=fake_insert_one,
        )
    )

    with (
        patch("routes.auth.find_user_by_email", fake_find_user),
        patch("routes.auth.get_db", lambda: fake_db),
        patch("routes.auth.db", fake_db),
        patch("routes.auth.send_resend_email", return_value=FAKE_SEND) as send,
        TestClient(app) as client,
    ):
        r = client.post(
            "/api/auth/forgot-password",
            json={"email": "cyrilalepsa@gmail.com"},
        )

    assert r.status_code == 200
    assert r.json()["success"] is True
    assert captured["lookup_email"] == "cyrilalepsa@gmail.com"
    send.assert_called_once()
    assert send.call_args.kwargs["to"] == "cyrilalepsa@gmail.com"
    assert send.call_args.kwargs["purpose"] == "reset-password"
    assert "extra" not in send.call_args.kwargs
    assert captured["reset"]["email"] == "cyrilalepsa@gmail.com"

    with (
        patch("routes.auth.find_user_by_email", fake_find_user),
        patch("routes.auth.get_db", lambda: fake_db),
        patch("routes.auth.send_resend_email", return_value=FAKE_SEND),
        TestClient(app) as client,
    ):
        r_v1 = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "cyrilalepsa@gmail.com"},
        )
    assert r_v1.status_code == 200


def test_forgot_password_logs_user_not_found(caplog):
    async def fake_find_user(_email):
        return None

    with (
        patch("routes.auth.find_user_by_email", fake_find_user),
        patch("routes.auth.send_resend_email") as send,
        TestClient(app) as client,
        caplog.at_level("WARNING", logger="routes.auth"),
    ):
        r = client.post(
            "/api/auth/forgot-password",
            json={"email": "cyrilalepsa@gmail.com"},
        )

    assert r.status_code == 200
    send.assert_not_called()
    assert any(
        "User not found in DB for email: cyrilalepsa@gmail.com" in rec.message
        for rec in caplog.records
    )


def test_resolve_db_name_defaults_to_mamandouce(monkeypatch):
    monkeypatch.delenv("DB_NAME", raising=False)
    from core.database import resolve_db_name

    assert resolve_db_name() == "mamandouce"
