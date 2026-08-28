"""Unit tests for dynamic what's-new endpoints."""
import os
import sys
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.security import get_admin_user
from models.schemas import User
from server import app

ADMIN = User(id="admin-1", email="admin@test.com", name="Admin", role="admin")


@pytest.fixture
def admin_client():
    async def _admin():
        return ADMIN

    app.dependency_overrides[get_admin_user] = _admin
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def _recent_item(item_id: str, days_ago: int = 1):
    created = (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()
    return {
        "id": item_id,
        "title": "Nouvelle fonction",
        "description": "Description test",
        "created_at": created,
        "is_published": True,
    }


def test_public_whats_new_returns_only_recent_published():
    recent = _recent_item("w1", days_ago=2)

    mock_cursor = MagicMock()
    mock_cursor.sort.return_value = mock_cursor
    mock_cursor.__aiter__ = lambda self: self
    mock_cursor._items = iter([recent])

    mock_find = MagicMock(return_value=mock_cursor)

    with patch("routes.whats_new.db") as mock_db:
        mock_db.whats_new.find = mock_find
        with TestClient(app) as client:
            response = client.get("/api/whats-new")

    assert response.status_code == 200
    data = response.json()
    assert data["visibility_days"] == 14
    assert len(data["items"]) == 1
    assert data["items"][0]["id"] == "w1"
    query = mock_find.call_args.args[0]
    assert query["is_published"] is True
    assert "$gte" in query["created_at"]


def test_admin_create_whats_new(admin_client):
    with patch("routes.whats_new.db") as mock_db:
        mock_db.whats_new.insert_one = AsyncMock()
        response = admin_client.post(
            "/api/admin/whats-new",
            json={"title": "Scanner amélioré", "description": "Nouveau flux OCR"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["action"] == "created"
    assert body["item"]["title"] == "Scanner amélioré"
    mock_db.whats_new.insert_one.assert_awaited_once()


def test_admin_refresh_whats_new_updates_created_at(admin_client):
    existing = _recent_item("w-refresh", days_ago=10)

    with patch("routes.whats_new.db") as mock_db:
        mock_db.whats_new.find_one = AsyncMock(
            side_effect=[existing, {**existing, "created_at": datetime.now(timezone.utc).isoformat()}]
        )
        mock_db.whats_new.update_one = AsyncMock()
        response = admin_client.post(
            "/api/admin/whats-new",
            json={"id": "w-refresh"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["action"] == "refreshed"
    mock_db.whats_new.update_one.assert_awaited_once()


def test_admin_create_requires_title_and_description(admin_client):
    response = admin_client.post("/api/admin/whats-new", json={"title": "Sans description"})
    assert response.status_code == 400
