"""
What's New routes — dynamic novelty bubble (14-day visibility window).
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core.database import db
from core.security import get_admin_user
from models.schemas import User

router = APIRouter(tags=["whats-new"])

VISIBILITY_DAYS = 14


def _serialize_item(doc: dict) -> dict:
    return {
        "id": doc.get("id"),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "created_at": doc.get("created_at"),
        "is_published": bool(doc.get("is_published", True)),
    }


def _cutoff_iso() -> str:
    cutoff = datetime.now(timezone.utc) - timedelta(days=VISIBILITY_DAYS)
    return cutoff.isoformat()


class WhatsNewAdminRequest(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    id: Optional[str] = None


@router.get("/whats-new")
async def get_public_whats_new():
    """Published items from the last 14 days."""
    cutoff = _cutoff_iso()
    cursor = db.whats_new.find(
        {"is_published": True, "created_at": {"$gte": cutoff}},
        {"_id": 0},
    ).sort("created_at", -1)

    items: List[dict] = []
    async for doc in cursor:
        items.append(_serialize_item(doc))

    return {"items": items, "visibility_days": VISIBILITY_DAYS}


@router.get("/admin/whats-new")
async def get_admin_whats_new(admin: User = Depends(get_admin_user)):
    """All novelty entries for the admin cockpit."""
    items = await db.whats_new.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"items": [_serialize_item(item) for item in items]}


@router.post("/admin/whats-new")
async def upsert_whats_new(body: WhatsNewAdminRequest, admin: User = Depends(get_admin_user)):
    """Create a novelty or refresh created_at on an existing one."""
    now_iso = datetime.now(timezone.utc).isoformat()

    if body.id:
        existing = await db.whats_new.find_one({"id": body.id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Nouveauté introuvable")

        update = {
            "created_at": now_iso,
            "updated_at": now_iso,
            "is_published": True,
        }
        if body.title is not None and body.title.strip():
            update["title"] = body.title.strip()
        if body.description is not None and body.description.strip():
            update["description"] = body.description.strip()

        await db.whats_new.update_one({"id": body.id}, {"$set": update})
        refreshed = await db.whats_new.find_one({"id": body.id}, {"_id": 0})
        return {"success": True, "action": "refreshed", "item": _serialize_item(refreshed)}

    title = (body.title or "").strip()
    description = (body.description or "").strip()
    if not title or not description:
        raise HTTPException(status_code=400, detail="Le titre et la description sont requis")

    item = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "created_at": now_iso,
        "updated_at": now_iso,
        "is_published": True,
        "created_by": admin.email,
    }
    await db.whats_new.insert_one(item)
    return {"success": True, "action": "created", "item": _serialize_item(item)}
