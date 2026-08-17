"""Tests enregistrement du calendrier de fertilité / cycle."""
import asyncio
import os
import sys
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.cycle_dates import coerce_cycle_length, normalize_iso_date
from core.security import get_current_user
from models.schemas import User
from server import app

USER = User(id="user-cycle-1", email="cycle@test.com", name="Cycle User", role="user")


@pytest.fixture
def user_client():
    async def _user():
        return USER

    app.dependency_overrides[get_current_user] = _user
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def test_normalize_iso_date_accepts_ymd_and_strips_time():
    assert normalize_iso_date("2026-08-17") == "2026-08-17"
    assert normalize_iso_date("2026-08-17T14:30:00+00:00") == "2026-08-17"
    assert normalize_iso_date("17/08/2026") == "2026-08-17"


def test_normalize_iso_date_rejects_garbage():
    with pytest.raises(ValueError, match="YYYY-MM-DD"):
        normalize_iso_date("17 août 2026")


def test_coerce_cycle_length_int_and_string():
    assert coerce_cycle_length("28") == 28
    assert coerce_cycle_length(30) == 30
    assert coerce_cycle_length("30.0") == 30
    with pytest.raises(ValueError):
        coerce_cycle_length("abc")
    with pytest.raises(ValueError):
        coerce_cycle_length(10)


def test_calculate_saves_ymd_and_integer_cycle_length(user_client):
    with patch("routes.pregnancy.persist_cycle_settings", new_callable=AsyncMock) as persist:
        persist.return_value = "mongo"
        response = user_client.post(
            "/api/pregnancy/calculate",
            json={
                "last_period_date": "2026-08-17T00:00:00.000Z",
                "cycle_length": "28",
            },
        )
    assert response.status_code == 200, response.text
    persist.assert_awaited()
    user_id, saved = persist.await_args.args
    assert user_id == USER.id
    assert saved["last_period_date"] == "2026-08-17"
    assert saved["cycle_length"] == 28
    assert isinstance(saved["cycle_length"], int)


def test_calculate_rejects_invalid_date_with_422(user_client):
    response = user_client.post(
        "/api/pregnancy/calculate",
        json={"last_period_date": "17 août 2026", "cycle_length": 28},
    )
    assert response.status_code == 422
    body = response.json()
    assert "detail" in body


def test_sqlite_fallback_when_mongo_fails(tmp_path, monkeypatch):
    db_file = tmp_path / "cycle.sqlite"
    monkeypatch.setenv("CYCLE_SETTINGS_SQLITE", str(db_file))
    from core import cycle_store

    failing = AsyncMock(side_effect=RuntimeError("mongo down"))
    with patch.object(cycle_store.db.pregnancy_profiles, "update_one", failing), patch.object(
        cycle_store.db.user_cycle_settings, "update_one", failing
    ), patch.object(cycle_store.db.users, "update_one", failing):
        store = asyncio.run(
            cycle_store.persist_cycle_settings(
                "user-cycle-1",
                {"last_period_date": "2026-08-17", "cycle_length": 29},
            )
        )
    assert store == "sqlite"
    loaded = cycle_store.sqlite_get("user-cycle-1")
    assert loaded["last_period_date"] == "2026-08-17"
    assert loaded["cycle_length"] == 29


def test_cycle_intelligence_ok_without_history(user_client):
    empty_cursor = AsyncMock()
    empty_cursor.sort = lambda *a, **k: empty_cursor
    empty_cursor.to_list = AsyncMock(return_value=[])
    with patch("services.cycle_intelligence.db") as mock_db:
        mock_db.cycle_history.find.return_value = empty_cursor
        response = user_client.get("/api/cycle/intelligence")
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["analysis"]["has_enough_data"] is False
    assert body["analysis"]["recommended_cycle_length"] == 28


def test_cycle_status_ok_when_user_has_no_cycle_fields(user_client):
    with patch("routes.emotional.db") as mock_db:
        mock_db.users.find_one = AsyncMock(return_value=None)
        response = user_client.get("/api/emotional/cycle-status")
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "no_data"
    assert body["show_alert"] is False


def test_vapid_key_returns_unconfigured_instead_of_500(user_client, monkeypatch):
    monkeypatch.setattr("routes.push_notifications.VAPID_PUBLIC_KEY", "")
    response = user_client.get("/api/notifications/vapid-public-key")
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["configured"] is False
    assert body["publicKey"] == ""
