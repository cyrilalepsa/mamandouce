"""Contract tests for GET /api/admin/users."""
import asyncio
import os
import sys
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch

from bson import ObjectId

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.schemas import RegisteredUserResponse, RegisteredUsersResponse, User
from routes.admin import get_admin_users


def test_registered_user_converts_object_id_and_datetime_to_strings():
    mongo_id = ObjectId()
    created_at = datetime(2026, 8, 20, 10, 0, tzinfo=timezone.utc)
    user = RegisteredUserResponse.model_validate(
        {
            "_id": mongo_id,
            "email": "maman@example.com",
            "name": None,
            "created_at": created_at,
            "subscription_status": None,
        }
    )

    assert user.id == str(mongo_id)
    assert user.name == ""
    assert user.subscription_status == "free"
    assert user.created_at == created_at.isoformat()
    dumped = user.model_dump()
    assert "_id" not in dumped
    assert isinstance(dumped["id"], str)


class _UsersCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, *_args):
        return self

    async def to_list(self, _limit):
        return [dict(document) for document in self.documents]


class _UsersCollection:
    def __init__(self, documents):
        self.documents = documents
        self.projection = None

    def find(self, _query, projection):
        self.projection = projection
        return _UsersCursor(self.documents)


def test_admin_users_endpoint_returns_exact_serializable_wrapper():
    real_id = ObjectId()
    test_id = ObjectId()
    collection = _UsersCollection(
        [
            {
                "_id": real_id,
                "email": "real@mamandouce.fr",
                "name": "Alice",
                "created_at": datetime(2026, 8, 20, tzinfo=timezone.utc),
                "subscription_status": "trial",
                "hashed_password": "must-not-leak",
            },
            {
                "_id": test_id,
                "email": "test@example.com",
                "name": None,
                "created_at": None,
                "subscription_status": "premium",
                "premium_source": "promo_code",
            },
        ]
    )
    fake_db = SimpleNamespace(users=collection)
    admin = User(email="admin@mamandouce.fr", name="Admin", role="admin")

    with patch("routes.admin.db", fake_db):
        result = asyncio.run(get_admin_users(admin))

    payload = RegisteredUsersResponse.model_validate(result).model_dump()
    assert payload["users"][0]["id"] == str(real_id)
    assert payload["users"][0]["created_at"].startswith("2026-08-20")
    assert payload["users"][0]["display_status"] == "trial"
    assert payload["test_users"][0]["id"] == str(test_id)
    assert payload["stats"] == {
        "total": 1,
        "premium": 0,
        "beta_tester": 0,
        "trial": 1,
        "free": 0,
        "test_users_count": 1,
    }
    assert collection.projection["hashed_password"] == 0
    assert collection.projection.get("_id") is None
    assert "hashed_password" not in payload["users"][0]
