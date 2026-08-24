"""Canonical /api/v1/food/favorites contract and legacy compatibility."""
import asyncio
import os
import sys
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.schemas import AddFavoriteRequest, User
from routes.food import add_favorite, get_favorites, remove_favorite
from server import app


class _Cursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, *_args):
        return self

    async def to_list(self, _limit):
        return [dict(item) for item in self.documents]


class _Favorites:
    def __init__(self):
        self.documents = []

    async def find_one(self, query):
        return next((
            item for item in self.documents
            if item["user_id"] == query["user_id"]
            and item["food_name"] == query["food_name"]
        ), None)

    async def insert_one(self, document):
        self.documents.append(dict(document))
        return SimpleNamespace(inserted_id=document["id"])

    def find(self, query, _projection):
        return _Cursor([
            item for item in self.documents
            if item["user_id"] == query["user_id"]
        ])

    async def delete_one(self, query):
        before = len(self.documents)
        self.documents = [
            item for item in self.documents
            if not (
                item["user_id"] == query["user_id"]
                and item["food_name"] == query["food_name"]
            )
        ]
        return SimpleNamespace(deleted_count=before - len(self.documents))


def test_v1_favorite_routes_are_registered():
    routes = {
        (method, route.path)
        for route in app.routes
        for method in getattr(route, "methods", set())
    }
    assert ("POST", "/api/v1/food/favorites") in routes
    assert ("GET", "/api/v1/food/favorites") in routes
    assert ("DELETE", "/api/v1/food/favorites/{food_name}") in routes


def test_add_list_delete_favorite_uses_food_name_contract():
    collection = _Favorites()
    fake_db = SimpleNamespace(favorites=collection)
    user = User(id="u1", email="maman@example.com", name="Maman")
    request = AddFavoriteRequest(
        food_name="Abricot",
        safety_level="safe",
        notes="Bien laver",
        category="Fruits",
    )

    with patch("routes.food.db", fake_db):
        added = asyncio.run(add_favorite(request, user))
        listed = asyncio.run(get_favorites(user))
        removed = asyncio.run(remove_favorite("Abricot", user))

    assert added["favorite"]["name"] == "Abricot"
    assert added["favorite"]["status"] == "safe"
    assert listed[0]["food_name"] == "Abricot"
    assert listed[0]["name"] == "Abricot"
    assert listed[0]["category"] == "Fruits"
    assert removed["success"] is True
    assert collection.documents == []
