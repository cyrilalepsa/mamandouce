"""Contenus configurables (bannières, textes légaux) — cockpit admin."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from core.database import db
from core.security import get_admin_user
from data.content_config_schema import CONTENT_CONFIG_DEFINITIONS
from models.schemas import User

router = APIRouter(tags=["content-config"])

BANNER_IMAGE_MIMES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}
MAX_BANNER_BYTES = 10 * 1024 * 1024


class ContentConfigUpsert(BaseModel):
    key: str = Field(..., min_length=3, max_length=120)
    value: str = Field(..., max_length=500_000)


def _definition(key: str) -> dict:
    definition = CONTENT_CONFIG_DEFINITIONS.get(key)
    if not definition:
        raise HTTPException(status_code=422, detail=f"Clé inconnue : {key}")
    return definition


def _serialize_item(key: str, document: dict | None) -> dict:
    definition = CONTENT_CONFIG_DEFINITIONS[key]
    document = document or {}
    return {
        "key": key,
        "label": definition["label"],
        "category": definition["category"],
        "type": definition["type"],
        "value": document.get("value"),
        "image_url": document.get("image_url"),
        "updated_at": document.get("updated_at"),
        "updated_by": document.get("updated_by"),
    }


@router.get("/content-configs")
async def get_public_content_configs():
    """Lecture publique des contenus (sans secrets)."""
    documents = await db.content_configs.find({}, {"_id": 0}).to_list(100)
    by_key = {doc["key"]: doc for doc in documents if doc.get("key")}
    values = {}
    for key, definition in CONTENT_CONFIG_DEFINITIONS.items():
        doc = by_key.get(key)
        if not doc:
            continue
        if definition["type"] == "image":
            url = doc.get("image_url") or doc.get("value")
            if url:
                values[key] = url
        elif doc.get("value"):
            values[key] = doc["value"]
    return {"values": values, "updated_at": max(
        (doc.get("updated_at") or "" for doc in documents),
        default=None,
    )}


@router.get("/admin/content-configs")
async def list_admin_content_configs(admin: User = Depends(get_admin_user)):
    documents = await db.content_configs.find({}, {"_id": 0}).to_list(100)
    by_key = {doc["key"]: doc for doc in documents if doc.get("key")}
    return {
        "items": [
            _serialize_item(key, by_key.get(key))
            for key in CONTENT_CONFIG_DEFINITIONS
        ],
    }


@router.put("/admin/content-configs")
async def upsert_content_config(
    body: ContentConfigUpsert,
    admin: User = Depends(get_admin_user),
):
    definition = _definition(body.key)
    if definition["type"] != "text":
        raise HTTPException(
            status_code=400,
            detail="Cette clé attend un upload image, pas du texte",
        )
    now = datetime.now(timezone.utc).isoformat()
    document = {
        "key": body.key,
        "category": definition["category"],
        "type": "text",
        "value": body.value.strip(),
        "updated_at": now,
        "updated_by": admin.email,
    }
    await db.content_configs.update_one(
        {"key": body.key},
        {"$set": document},
        upsert=True,
    )
    return _serialize_item(body.key, document)


async def _read_banner_upload(file: UploadFile) -> tuple[bytes, str, str]:
    mime = (file.content_type or "").lower().split(";")[0].strip()
    filename = file.filename or "banner.jpg"
    if mime not in BANNER_IMAGE_MIMES:
        lowered = filename.lower()
        if not (
            lowered.endswith((".heic", ".heif", ".jpg", ".jpeg", ".png", ".webp"))
        ):
            raise HTTPException(
                status_code=400,
                detail="Format accepté : JPEG, PNG, WEBP, HEIC ou HEIF",
            )
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Image vide")
    if len(content) > MAX_BANNER_BYTES:
        raise HTTPException(status_code=413, detail="Image trop volumineuse (max 10 Mo)")
    from services.fetus_image_normalize import normalize_fetus_image

    try:
        return normalize_fetus_image(content, mime, filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/admin/content-configs/{key}/upload")
async def upload_content_config_image(
    key: str,
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
):
    definition = _definition(key)
    if definition["type"] != "image":
        raise HTTPException(status_code=400, detail="Cette clé n'accepte pas d'image")
    content, mime, filename = await _read_banner_upload(file)
    from services.cloudinary_upload import upload_app_banner

    try:
        uploaded = await asyncio.to_thread(
            upload_app_banner,
            content,
            filename=filename,
            content_type=mime,
            asset_key=key,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    now = datetime.now(timezone.utc).isoformat()
    document = {
        "key": key,
        "category": definition["category"],
        "type": "image",
        "image_url": uploaded["image_url"],
        "value": uploaded["image_url"],
        "public_id": uploaded.get("public_id"),
        "updated_at": now,
        "updated_by": admin.email,
    }
    await db.content_configs.update_one(
        {"key": key},
        {"$set": document},
        upsert=True,
    )
    return _serialize_item(key, document)


@router.delete("/admin/content-configs/{key}")
async def delete_content_config(
    key: str,
    admin: User = Depends(get_admin_user),
):
    _definition(key)
    result = await db.content_configs.delete_one({"key": key})
    return {"success": True, "deleted": bool(result.deleted_count), "key": key}
