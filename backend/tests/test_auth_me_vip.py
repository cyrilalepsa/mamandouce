"""Login /auth/me : flags VIP toujours présents dans le JSON."""
import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.privileges import SUPER_ADMIN_EMAILS
from core.security import get_current_user
from models.schemas import Token, User
from routes.auth import _force_vip_auth_fields, _issue_token
from server import app

VIP_EMAILS = ["cyrilalepsa@gmail.com", "superadmin@neriacorp.com"]


def test_force_vip_auth_fields_for_both_emails():
    assert SUPER_ADMIN_EMAILS == VIP_EMAILS
    for email in VIP_EMAILS:
        data = _force_vip_auth_fields(
            {"email": email, "role": "user", "subscription_status": "free"}
        )
        assert data["role"] == "admin"
        assert data["subscription_status"] == "premium"
        assert data["is_admin"] is True
        assert data["is_premium"] is True
        assert data["is_vip"] is True
        assert data["is_superadmin"] is True


def test_force_vip_auth_fields_case_insensitive():
    data = _force_vip_auth_fields(
        {"email": "CyrilAlepsa@Gmail.com", "role": "user", "subscription_status": "free"}
    )
    assert data["role"] == "admin"
    assert data["is_vip"] is True


def test_regular_user_keeps_free_flags():
    data = _force_vip_auth_fields(
        {"email": "maman@test.com", "role": "user", "subscription_status": "free"}
    )
    assert data["role"] == "user"
    assert data["subscription_status"] == "free"
    assert data["is_admin"] is False
    assert data["is_premium"] is False
    assert data["is_vip"] is False


def test_user_schema_serializes_premium_and_vip():
    user = User(
        **_force_vip_auth_fields(
            {
                "id": "u1",
                "email": "cyrilalepsa@gmail.com",
                "name": "Cyril",
                "role": "user",
                "subscription_status": "free",
            }
        )
    )
    dumped = user.model_dump()
    assert dumped["role"] == "admin"
    assert dumped["subscription_status"] == "premium"
    assert dumped["is_admin"] is True
    assert dumped["is_premium"] is True
    assert dumped["is_vip"] is True


def test_token_schema_serializes_premium_and_vip():
    token = _issue_token(
        {"email": "superadmin@neriacorp.com", "role": "user", "subscription_status": "free"}
    )
    dumped = token.model_dump()
    assert dumped["role"] == "admin"
    assert dumped["subscription_status"] == "premium"
    assert dumped["is_admin"] is True
    assert dumped["is_premium"] is True
    assert dumped["is_vip"] is True
    assert "access_token" in dumped


def test_token_model_fields_include_privilege_flags():
    names = set(Token.model_fields)
    for field in ("role", "subscription_status", "is_admin", "is_premium", "is_vip"):
        assert field in names


@pytest.fixture
def vip_me_client():
    vip = User(
        id="u-vip",
        email="cyrilalepsa@gmail.com",
        name="Cyril",
        role="user",
        subscription_status="free",
        is_admin=False,
        is_premium=False,
        is_vip=False,
    )

    async def _user():
        return vip

    app.dependency_overrides[get_current_user] = _user
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def test_get_me_always_returns_vip_flags(vip_me_client):
    for path in ("/api/auth/me", "/api/v1/auth/me"):
        response = vip_me_client.get(path)
        assert response.status_code == 200, response.text
        data = response.json()
        assert data["email"] == "cyrilalepsa@gmail.com"
        assert data["role"] == "admin"
        assert data["subscription_status"] == "premium"
        assert data["is_admin"] is True
        assert data["is_premium"] is True
        assert data["is_vip"] is True
        assert data["is_superadmin"] is True
