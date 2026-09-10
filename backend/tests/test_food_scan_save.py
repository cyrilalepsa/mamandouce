"""Tests for POST /api/food/scan/save (personal library + community contribution)."""
import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.security import get_current_user
from models.schemas import User
from server import app

USER = User(id="food-scan-user", email="food@test.com", name="Food User", role="user")


@pytest.fixture
def user_client():
    async def _user():
        return USER

    app.dependency_overrides[get_current_user] = _user
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def test_scan_save_personal_only(user_client):
    favorites = MagicMock()
    favorites.find_one = AsyncMock(return_value=None)
    favorites.insert_one = AsyncMock()

    with patch("routes.food.db") as mock_db:
        mock_db.favorites = favorites
        response = user_client.post(
            "/api/food/scan/save",
            json={
                "name": "Pain complet bio",
                "safety_level": "safe",
                "category": "Céréales",
                "contribute_to_community": False,
            },
        )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["personal_saved"] is True
    assert body["contribution_submitted"] is False
    favorites.insert_one.assert_awaited()


def test_scan_save_community_submission(user_client):
    favorites = MagicMock()
    favorites.find_one = AsyncMock(return_value=None)
    favorites.insert_one = AsyncMock()
    user_added = MagicMock()
    user_added.find_one = AsyncMock(return_value=None)
    user_added.insert_one = AsyncMock()
    contributions = MagicMock()
    contributions.insert_one = AsyncMock()

    with patch("routes.food.db") as mock_db, patch(
        "routes.food.get_food_safety_database",
        new_callable=AsyncMock,
    ) as mock_db_fn:
        mock_db_fn.return_value = {}
        mock_db.favorites = favorites
        mock_db.user_added_foods = user_added
        mock_db.contributions = contributions

        response = user_client.post(
            "/api/food/scan/save",
            json={
                "name": "Barre protéinée XYZ",
                "safety_level": "caution",
                "category": "Analyse IA",
                "notes": "Soumis via scanner",
                "contribute_to_community": True,
            },
        )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["personal_saved"] is True
    assert body["contribution_submitted"] is True
    assert body.get("contribution_id")
    user_added.insert_one.assert_awaited()
    contributions.insert_one.assert_awaited()
