"""Admin content-config API (bannières & textes légaux)."""
import asyncio
import io
import os
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import UploadFile
from starlette.datastructures import Headers

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.schemas import User
from routes.content_config import (
    get_public_content_configs,
    list_admin_content_configs,
    upload_content_config_image,
    upsert_content_config,
    ContentConfigUpsert,
)
from server import app


def _admin():
    return User(id="admin", email="admin@example.com", name="Admin", role="admin")


def test_content_config_routes_registered():
    routes = {
        (method, route.path)
        for route in app.routes
        for method in getattr(route, "methods", set())
    }
    assert ("GET", "/api/admin/content-configs") in routes
    assert ("PUT", "/api/admin/content-configs") in routes
    assert ("POST", "/api/admin/content-configs/{key}/upload") in routes
    assert ("GET", "/api/content-configs") in routes


def test_admin_list_returns_all_schema_keys():
    class _Cursor:
        async def to_list(self, _limit):
            return [
                {
                    "key": "legal.privacy",
                    "value": "Texte RGPD",
                    "updated_at": "2026-01-01T00:00:00+00:00",
                }
            ]

    fake_db = SimpleNamespace(
        content_configs=SimpleNamespace(find=lambda *_a, **_k: _Cursor())
    )
    with patch("routes.content_config.db", fake_db):
        result = asyncio.run(list_admin_content_configs(_admin()))
    assert len(result["items"]) >= 8
    privacy = next(item for item in result["items"] if item["key"] == "legal.privacy")
    assert privacy["value"] == "Texte RGPD"
    assert privacy["type"] == "text"


def test_upsert_text_saves_to_db():
    collection = SimpleNamespace(update_one=AsyncMock())
    fake_db = SimpleNamespace(content_configs=collection)
    with patch("routes.content_config.db", fake_db):
        result = asyncio.run(
            upsert_content_config(
                ContentConfigUpsert(key="legal.cgu", value="CGU version 2"),
                _admin(),
            )
        )
    assert result["key"] == "legal.cgu"
    assert result["value"] == "CGU version 2"
    assert collection.update_one.await_args.kwargs["upsert"] is True


def test_public_mapping_exposes_saved_values():
    class _Cursor:
        async def to_list(self, _limit):
            return [
                {"key": "banner.home_hero", "image_url": "https://cdn.example/hero.jpg"},
                {"key": "legal.mentions", "value": "Mentions"},
            ]

    fake_db = SimpleNamespace(
        content_configs=SimpleNamespace(find=lambda *_a, **_k: _Cursor())
    )
    with patch("routes.content_config.db", fake_db):
        result = asyncio.run(get_public_content_configs())
    assert result["values"]["banner.home_hero"] == "https://cdn.example/hero.jpg"
    assert result["values"]["legal.mentions"] == "Mentions"
