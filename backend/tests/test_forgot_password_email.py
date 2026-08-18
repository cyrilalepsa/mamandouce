"""Tests POST /auth/forgot-password : lookup Mongo insensible à la casse."""
import os
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

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


class _EmptyAsyncCursor:
    def limit(self, _n):
        return self

    def __aiter__(self):
        return self

    async def __anext__(self):
        raise StopAsyncIteration


def _fake_users_db(name="mamandouce"):
    users = MagicMock()
    users.count_documents = AsyncMock(return_value=0)
    users.index_information = AsyncMock(return_value={"_id_": {"key": [("_id", 1)]}})
    users.find.return_value = _EmptyAsyncCursor()
    users.aggregate.return_value = SimpleNamespace(to_list=AsyncMock(return_value=[]))

    async def fake_delete_many(*_a, **_k):
        return None

    async def fake_insert_one(_doc):
        return None

    return SimpleNamespace(
        name=name,
        users=users,
        password_resets=SimpleNamespace(
            delete_many=fake_delete_many,
            insert_one=fake_insert_one,
        ),
    )


def test_normalize_email_lower_and_strip():
    assert normalize_email("  CyrilAlepsa@Gmail.com ") == "cyrilalepsa@gmail.com"


def test_normalize_email_strips_nbsp_and_zero_width():
    raw = "\u200b  CyrilAlepsa@Gmail.com\u00a0"
    assert normalize_email(raw) == "cyrilalepsa@gmail.com"


def test_user_email_query_is_case_insensitive():
    q = user_email_query("CyrilAlepsa@Gmail.com")
    assert "$or" in q
    exact = [c["email"] for c in q["$or"] if "email" in c and isinstance(c["email"], str)]
    assert "cyrilalepsa@gmail.com" in exact
    assert "CyrilAlepsa@Gmail.com" in exact
    regex = next(c["email"] for c in q["$or"] if "email" in c and isinstance(c["email"], dict))
    assert regex["$options"] == "i"
    assert "cyrilalepsa@gmail.com" in regex["$regex"].replace("\\", "")
    alt_fields = {key for clause in q["$or"] for key in clause}
    assert "Email" in alt_fields
    assert "user_email" in alt_fields


def test_forgot_password_sends_when_db_email_has_different_case(caplog):
    captured = {}

    async def fake_find_user(email, database=None):
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
        ),
    )

    with (
        patch("routes.auth.find_user_by_email", fake_find_user),
        patch("routes.auth.get_db", lambda: fake_db),
        patch("routes.auth.db", fake_db),
        patch("routes.auth.send_reset_password_email", return_value=FAKE_SEND) as send,
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
    assert "html" in send.call_args.kwargs
    assert "extra" not in send.call_args.kwargs
    assert captured["reset"]["email"] == "cyrilalepsa@gmail.com"

    with (
        patch("routes.auth.find_user_by_email", fake_find_user),
        patch("routes.auth.get_db", lambda: fake_db),
        patch("routes.auth.send_reset_password_email", return_value=FAKE_SEND),
        TestClient(app) as client,
    ):
        r_v1 = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "cyrilalepsa@gmail.com"},
        )
    assert r_v1.status_code == 200


def test_forgot_password_logs_user_not_found(caplog):
    async def fake_find_user(_email, database=None):
        return None

    fake_db = _fake_users_db()

    with (
        patch("routes.auth.find_user_by_email", fake_find_user),
        patch("routes.auth.get_db", lambda: fake_db),
        patch("routes.auth.send_reset_password_email") as send,
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


def test_forgot_password_swallows_exceptions(caplog):
    async def boom(_email, database=None):
        raise RuntimeError("token boom before resend")

    with (
        patch("routes.auth.find_user_by_email", boom),
        patch("routes.auth.get_db", lambda: _fake_users_db()),
        patch("routes.auth.send_reset_password_email") as send,
        TestClient(app) as client,
        caplog.at_level("ERROR", logger="routes.auth"),
    ):
        r = client.post(
            "/api/auth/forgot-password",
            json={"email": "cyrilalepsa@gmail.com"},
        )

    assert r.status_code == 200
    assert r.json()["success"] is True
    send.assert_not_called()
    assert any("token boom before resend" in rec.message for rec in caplog.records)


def test_resolve_db_name_defaults_to_mamandouce(monkeypatch):
    monkeypatch.delenv("DB_NAME", raising=False)
    from core.database import resolve_db_name

    assert resolve_db_name() == "mamandouce"


def test_forgot_password_accepts_user_email_alias():
    async def fake_find_user(email, database=None):
        return {"id": "u1", "email": email, "name": "Cyril"}

    async def fake_delete_many(*_a, **_k):
        return None

    async def fake_insert_one(_doc):
        return None

    fake_db = SimpleNamespace(
        name="mamandouce",
        password_resets=SimpleNamespace(
            delete_many=fake_delete_many,
            insert_one=fake_insert_one,
        ),
    )

    with (
        patch("routes.auth.find_user_by_email", fake_find_user),
        patch("routes.auth.get_db", lambda: fake_db),
        patch("routes.auth.send_reset_password_email", return_value=FAKE_SEND) as send,
        TestClient(app) as client,
    ):
        r = client.post(
            "/api/auth/forgot-password",
            json={"user_email": "cyrilalepsa@gmail.com"},
        )
    assert r.status_code == 200
    send.assert_called_once()
    assert send.call_args.kwargs["to"] == "cyrilalepsa@gmail.com"


def test_forgot_password_probe_public_for_diag_email():
    async def fake_inspect(email, database=None):
        return {
            "db_name": "mamandouce",
            "collection": "users",
            "user_found": False,
            "users_count": 0,
            "requested": {"normalized": email},
            "resend_called_only_if_user_found": True,
        }

    with (
        patch("routes.auth.inspect_reset_user", fake_inspect),
        TestClient(app) as client,
    ):
        r = client.get("/api/v1/auth/forgot-password-probe")

    assert r.status_code == 200
    data = r.json()
    assert data["user_found"] is False
    assert data["db_name"] == "mamandouce"
    assert data["resend_called_only_if_user_found"] is True


def test_forgot_password_probe_other_email_requires_auth():
    with TestClient(app) as client:
        r = client.get(
            "/api/auth/forgot-password-probe",
            params={"email": "other@example.com"},
        )
    assert r.status_code == 401
