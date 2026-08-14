"""
NeriaCorp Intelligence — Scanner OCR Admin-Only (Noyau N2 rebranché).
"""
from __future__ import annotations

import json
import logging
import os
import shutil
import tempfile
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel

from core.database import db
from core.security import get_admin_user, get_current_user
from integrations.neriacorp.adapters import (
    APP_REGISTRY,
    get_app_meta,
    list_registered_apps,
    publish_to_app,
)
from integrations.neriacorp.scanner_adapter import (
    CATEGORY_PROMPTS,
    analyze_document,
    analyze_neriacorp,
    analyze_video,
)
from models.schemas import User

logger = logging.getLogger(__name__)
router = APIRouter(tags=["scanner-ai-admin"])

APP_DEFAULTS = {
    name: {"theme_color": cfg["theme_color"], "estimated_revenue": cfg["default_revenue"]}
    for name, cfg in APP_REGISTRY.items()
}

MAX_VIDEO_BYTES = 50 * 1024 * 1024
ACCEPTED_VIDEO_MIMES = {
    "video/mp4",
    "video/quicktime",
    "video/x-quicktime",
    "video/webm",
    "video/x-matroska",
    "video/mpeg",
}


class ScanRequest(BaseModel):
    image_base64: Optional[str] = None
    text_input: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ScanResult(BaseModel):
    id: str
    metadata: Dict[str, Any]
    business: Dict[str, Any]
    display_card: Dict[str, Any]
    financial: Dict[str, Any]
    created_at: str


class DocumentScanRequest(BaseModel):
    image_base64: str
    category: str
    custom_prompt: Optional[str] = None


class PublishRequest(BaseModel):
    target_app: str
    scan_id: Optional[str] = None
    payload: Dict[str, Any] = {}


def _normalize_neriacorp(parsed: Dict[str, Any]) -> Dict[str, Any]:
    metadata = parsed.get("metadata") or {}
    business = parsed.get("business") or parsed.get("modules") or {}
    display_card = parsed.get("display_card") or {}
    financial = parsed.get("financial") or {}
    source_app = metadata.get("source_app")
    if source_app in APP_DEFAULTS:
        defaults = APP_DEFAULTS[source_app]
        display_card.setdefault("theme_color", defaults["theme_color"])
        financial.setdefault("estimated_revenue", defaults["estimated_revenue"])
    financial.setdefault("currency", "EUR")
    metadata.setdefault("operation_mode", "Admin_Only")
    return {
        "metadata": metadata,
        "business": business,
        "display_card": display_card,
        "financial": financial,
    }


async def _audit_insert(entry: Dict[str, Any]) -> None:
    try:
        await db.scanner_audit.insert_one(entry)
    except Exception as exc:
        logger.warning("scanner_audit insert skipped: %s", exc)


async def _pub_insert(entry: Dict[str, Any]) -> None:
    try:
        await db.scanner_publications.insert_one(entry)
    except Exception as exc:
        logger.warning("scanner_publications insert skipped: %s", exc)


def _http_from_ocr_error(exc: Exception) -> HTTPException:
    if isinstance(exc, json.JSONDecodeError):
        return HTTPException(status_code=502, detail=f"Réponse IA non-JSON : {str(exc)[:200]}")
    if isinstance(exc, ValueError):
        return HTTPException(status_code=400, detail=str(exc))
    if isinstance(exc, RuntimeError):
        return HTTPException(status_code=503, detail=str(exc))
    logger.exception("OCR error")
    return HTTPException(status_code=500, detail=f"Erreur IA : {exc}")


@router.post("/scanner/analyze", response_model=ScanResult)
async def analyze_neriacorp_route(
    payload: ScanRequest,
    admin: User = Depends(get_admin_user),
):
    if not (payload.image_base64 or payload.text_input or payload.metadata):
        raise HTTPException(
            status_code=400, detail="Aucune entrée (image_base64, text_input ou metadata)"
        )
    try:
        parsed = await analyze_neriacorp(
            image_base64=payload.image_base64,
            text_input=payload.text_input,
            metadata=payload.metadata,
        )
    except Exception as exc:
        raise _http_from_ocr_error(exc) from exc

    norm = _normalize_neriacorp(parsed)
    result = ScanResult(
        id=str(uuid.uuid4()),
        created_at=datetime.now(timezone.utc).isoformat(),
        **norm,
    )
    await _audit_insert(
        {
            "id": result.id,
            "admin_id": admin.id,
            "admin_email": admin.email,
            "source_app": result.metadata.get("source_app"),
            "source_type": "image" if payload.image_base64 else "text",
            "confidence_score": result.metadata.get("confidence_score"),
            "estimated_revenue": result.financial.get("estimated_revenue"),
            "currency": result.financial.get("currency"),
            "created_at": result.created_at,
        }
    )
    return result


@router.get("/scanner/audit")
async def get_scanner_audit(limit: int = 50, admin: User = Depends(get_admin_user)):
    try:
        items = await db.scanner_audit.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    except Exception:
        items = []
    total_revenue = sum((it.get("estimated_revenue") or 0) for it in items)
    by_app: Dict[str, Dict[str, Any]] = {}
    for it in items:
        app = it.get("source_app") or "Unknown"
        bucket = by_app.setdefault(app, {"count": 0, "revenue": 0.0})
        bucket["count"] += 1
        bucket["revenue"] += float(it.get("estimated_revenue") or 0)
    return {
        "scans": items,
        "total_count": len(items),
        "total_revenue": round(total_revenue, 2),
        "currency": "EUR",
        "by_app": by_app,
    }


@router.get("/scanner/apps")
async def list_apps(admin: User = Depends(get_admin_user)):
    return {"apps": list_registered_apps(), "operation_mode": "Admin_Only"}


@router.post("/scanner/analyze-video", response_model=ScanResult)
async def analyze_video_route(
    request: Request,
    file: Optional[UploadFile] = File(None),
    text_input: Optional[str] = Form(None),
    admin: User = Depends(get_admin_user),
):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Aucun fichier video fourni")
    mime = file.content_type or "video/mp4"
    if mime.lower() not in ACCEPTED_VIDEO_MIMES:
        raise HTTPException(status_code=400, detail=f"Format vidéo non supporté : {mime}")

    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit():
        if int(content_length) > MAX_VIDEO_BYTES + 1024:
            raise HTTPException(status_code=413, detail="Vidéo trop volumineuse (max 50 MB)")

    tmp_dir = tempfile.mkdtemp(prefix="neriacorp_video_")
    ext = ".mp4"
    if mime == "video/webm":
        ext = ".webm"
    elif mime in ("video/quicktime", "video/x-quicktime"):
        ext = ".mov"
    tmp_path = os.path.join(tmp_dir, f"upload{ext}")
    bytes_written = 0
    try:
        with open(tmp_path, "wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                bytes_written += len(chunk)
                if bytes_written > MAX_VIDEO_BYTES:
                    raise HTTPException(status_code=413, detail="Vidéo trop volumineuse (max 50 MB)")
                out.write(chunk)

        parsed = await analyze_video(
            file_path=tmp_path, mime_type=mime, text_input=text_input
        )
        norm = _normalize_neriacorp(parsed)
        norm["display_card"].setdefault("visual_type", "REPORT")
        if not norm["display_card"].get("main_action"):
            norm["display_card"]["main_action"] = "Publier l'annonce"

        result = ScanResult(
            id=str(uuid.uuid4()),
            created_at=datetime.now(timezone.utc).isoformat(),
            **norm,
        )
        await _audit_insert(
            {
                "id": result.id,
                "admin_id": admin.id,
                "admin_email": admin.email,
                "source_app": result.metadata.get("source_app"),
                "source_type": "video",
                "video_size_kb": bytes_written // 1024,
                "confidence_score": result.metadata.get("confidence_score"),
                "estimated_revenue": result.financial.get("estimated_revenue"),
                "currency": result.financial.get("currency"),
                "created_at": result.created_at,
            }
        )
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_from_ocr_error(exc) from exc
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@router.get("/scanner/categories")
async def list_categories(current_user: User = Depends(get_current_user)):
    return {
        "categories": [
            {"id": key, "label": val["label"]} for key, val in CATEGORY_PROMPTS.items()
        ]
    }


@router.post("/scanner/analyze-document")
async def analyze_document_route(
    payload: DocumentScanRequest,
    current_user: User = Depends(get_current_user),
):
    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 requis")
    try:
        parsed = await analyze_document(
            image_base64=payload.image_base64,
            category=payload.category,
            custom_prompt=payload.custom_prompt,
        )
    except Exception as exc:
        raise _http_from_ocr_error(exc) from exc

    confidence = float(parsed.pop("confidence", parsed.get("confidence_score") or 0.8) or 0.8)
    raw_text = parsed.pop("raw_text", None)
    result = {
        "id": str(uuid.uuid4()),
        "category": payload.category,
        "template_label": CATEGORY_PROMPTS[payload.category]["label"],
        "data": parsed,
        "raw_text": raw_text,
        "confidence": confidence,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _audit_insert(
        {
            "id": result["id"],
            "admin_id": current_user.id,
            "admin_email": current_user.email,
            "source_type": "document",
            "category": payload.category,
            "confidence_score": confidence,
            "created_at": result["created_at"],
        }
    )
    return result


@router.get("/scanner/history")
async def get_scan_history(
    limit: int = 20, current_user: User = Depends(get_current_user)
):
    try:
        items = (
            await db.scanner_audit.find(
                {"admin_id": current_user.id}, {"_id": 0}
            )
            .sort("created_at", -1)
            .to_list(limit)
        )
    except Exception:
        items = []
    return {"scans": items}


@router.post("/scanner/publish")
async def publish_to_target_app(
    payload: PublishRequest,
    admin: User = Depends(get_admin_user),
):
    app_meta = get_app_meta(payload.target_app)
    if not app_meta:
        raise HTTPException(
            status_code=400,
            detail=f"App inconnue. Valides : {list(APP_DEFAULTS.keys())}",
        )

    canonical = app_meta["name"]
    publication_id = f"NC-{canonical[:3].upper()}-{uuid.uuid4().hex[:8].upper()}"
    adapter_result = await publish_to_app(
        target_app=canonical,
        payload=payload.payload,
        scan_id=payload.scan_id,
        publication_id=publication_id,
        admin_email=admin.email,
    )
    log_entry = {
        "id": str(uuid.uuid4()),
        "publication_id": publication_id,
        "target_app": canonical,
        "scan_id": payload.scan_id,
        "admin_id": admin.id,
        "admin_email": admin.email,
        "revenue_estimated": app_meta["default_revenue"],
        "currency": "EUR",
        "status": adapter_result["status"],
        "partial": adapter_result.get("partial", False),
        "remote_id": adapter_result.get("remote_id"),
        "error": adapter_result.get("error"),
        "configured": app_meta["configured"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _pub_insert(log_entry)
    return {
        "publication_id": publication_id,
        "target_app": canonical,
        "theme_color": app_meta["theme_color"],
        "revenue_billed": app_meta["default_revenue"],
        "currency": "EUR",
        "status": adapter_result["status"],
        "partial": adapter_result.get("partial", False),
        "remote_id": adapter_result.get("remote_id"),
        "configured": app_meta["configured"],
        "warning": adapter_result.get("error"),
        "message": (
            f"✅ Données injectées dans {canonical} (live)."
            if adapter_result["status"] == "published_live"
            else f"⚠️ {canonical} non branchée — mode mock."
        ),
        "created_at": log_entry["created_at"],
    }


@router.get("/scanner/publications")
async def list_publications(limit: int = 50, admin: User = Depends(get_admin_user)):
    try:
        items = (
            await db.scanner_publications.find({}, {"_id": 0})
            .sort("created_at", -1)
            .to_list(limit)
        )
    except Exception:
        items = []
    total_revenue = sum(float(it.get("revenue_estimated") or 0) for it in items)
    by_target: Dict[str, int] = {}
    for it in items:
        app = it.get("target_app") or "Unknown"
        by_target[app] = by_target.get(app, 0) + 1
    return {
        "publications": items,
        "total_count": len(items),
        "total_revenue": round(total_revenue, 2),
        "currency": "EUR",
        "by_target": by_target,
    }


@router.get("/scanner/publications/{publication_id}")
async def resolve_publication(
    publication_id: str, admin: User = Depends(get_admin_user)
):
    try:
        pub = await db.scanner_publications.find_one(
            {"publication_id": publication_id},
            {"_id": 0, "admin_id": 0},
        )
    except Exception:
        pub = None
    if not pub:
        raise HTTPException(
            status_code=404, detail=f"Publication {publication_id} introuvable"
        )
    target_app = pub.get("target_app")
    app_meta = APP_DEFAULTS.get(target_app, {})
    pub["theme_color"] = app_meta.get("theme_color")
    return pub
