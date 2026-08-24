"""Admin fetus visual upload and public week mapping."""
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
from routes.admin import get_fetus_visuals, upload_fetus_visual
from routes.pregnancy import get_public_fetus_visuals
from services.cloudinary_upload import upload_fetus_visual as cloudinary_upload
from server import app


class _Cursor:
    def __init__(self, documents):
        self.documents = documents

    async def to_list(self, _limit):
        return [dict(document) for document in self.documents]


def _admin():
    return User(id="admin", email="admin@example.com", name="Admin", role="admin")


def test_fetus_visual_routes_are_registered():
    routes = {
        (method, route.path)
        for route in app.routes
        for method in getattr(route, "methods", set())
    }
    assert ("GET", "/api/admin/fetus-visuals") in routes
    assert ("POST", "/api/admin/fetus-visuals/{week}") in routes
    assert ("DELETE", "/api/admin/fetus-visuals/{week}") in routes
    assert ("GET", "/api/pregnancy/fetus-visuals") in routes


def test_admin_list_always_returns_all_40_weeks():
    fake_db = SimpleNamespace(
        fetus_visuals=SimpleNamespace(
            find=lambda *_args: _Cursor([
                {"week": 12, "image_url": "https://cdn.example/week-12.jpg"}
            ])
        )
    )
    with patch("routes.admin.db", fake_db):
        result = asyncio.run(get_fetus_visuals(_admin()))

    assert result["folder"] == "mamandouce/foetus"
    assert len(result["visuals"]) == 40
    assert result["visuals"][0] == {
        "week": 1,
        "image_url": None,
        "public_id": None,
        "width": None,
        "height": None,
        "format": None,
        "updated_at": None,
        "updated_by": None,
    }
    assert result["visuals"][11]["image_url"].endswith("week-12.jpg")


def test_admin_upload_saves_cloudinary_url_by_week():
    collection = SimpleNamespace(update_one=AsyncMock())
    fake_db = SimpleNamespace(fetus_visuals=collection)
    upload = UploadFile(
        filename="foetus-24.png",
        file=io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"x" * 32),
        headers=Headers({"content-type": "image/png"}),
    )
    cloudinary_result = {
        "image_url": "https://res.cloudinary.com/demo/image/upload/mamandouce/foetus/week-24.png",
        "public_id": "mamandouce/foetus/week-24",
        "folder": "mamandouce/foetus",
        "width": 800,
        "height": 800,
        "format": "png",
    }

    with (
        patch("routes.admin.db", fake_db),
        patch(
            "services.cloudinary_upload.upload_fetus_visual",
            return_value=cloudinary_result,
        ),
    ):
        result = asyncio.run(upload_fetus_visual(24, upload, _admin()))

    assert result["week"] == 24
    assert result["image_url"] == cloudinary_result["image_url"]
    update = collection.update_one.await_args
    assert update.args[0] == {"week": 24}
    assert update.kwargs["upsert"] is True


def test_public_mapping_returns_only_saved_urls():
    fake_db = SimpleNamespace(
        fetus_visuals=SimpleNamespace(
            find=lambda *_args: _Cursor([
                {
                    "week": 8,
                    "image_url": "https://cdn.example/week-08.webp",
                    "updated_at": "2026-08-24T16:00:00+00:00",
                },
                {"week": 9, "image_url": None},
            ])
        )
    )
    with patch("routes.pregnancy.db", fake_db):
        result = asyncio.run(get_public_fetus_visuals())

    assert result["images"] == {"8": "https://cdn.example/week-08.webp"}


def test_cloudinary_upload_targets_required_folder_without_exposing_secret():
    response = SimpleNamespace(
        status_code=200,
        text="ok",
        json=lambda: {
            "secure_url": "https://res.cloudinary.com/demo/image/upload/mamandouce/foetus/week-05.jpg",
            "public_id": "mamandouce/foetus/week-05",
            "format": "jpg",
        },
    )
    with (
        patch("services.cloudinary_upload.config.load_settings"),
        patch("services.cloudinary_upload.config.CLOUDINARY_CLOUD_NAME", "demo"),
        patch("services.cloudinary_upload.config.CLOUDINARY_API_KEY", "api-key"),
        patch("services.cloudinary_upload.config.CLOUDINARY_API_SECRET", "top-secret"),
        patch("services.cloudinary_upload.requests.post", return_value=response) as post,
        patch.dict(
            os.environ,
            {"CLOUDINARY_FETUS_VISUALS_FOLDER": "mamandouce/foetus"},
            clear=False,
        ),
    ):
        result = cloudinary_upload(
            b"jpeg-bytes",
            filename="week5.jpg",
            content_type="image/jpeg",
            week=5,
        )

    request = post.call_args
    assert request.args[0].endswith("/demo/image/upload")
    assert request.kwargs["data"]["folder"] == "mamandouce/foetus"
    assert request.kwargs["data"]["public_id"] == "week-05"
    assert request.kwargs["data"]["overwrite"] == "true"
    assert "top-secret" not in str(request.kwargs["data"])
    assert result["image_url"].startswith("https://res.cloudinary.com/")
