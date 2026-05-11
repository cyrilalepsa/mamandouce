"""
NeriaCorp Intelligence — Scanner IA Admin-Only
═══════════════════════════════════════════════════════════════════
Cerveau central NeriaCorp pour 5 apps métier :
  - VisaTrace   (#1A5CAD) — inventaire social + risk + facturation visa
  - Heritia     (#8B4513) — inventaire + hook recette + statut club
  - VeoVision   (#000000) — authenticité + multi-diffusion annonces
  - Vellumia    (#D4AF37) — analyse artistique + scènes + options premium
  - Aevis       (#2E8B57) — items POS (restauration) + layout

Mode opérationnel : Admin_Only (super-admin uniquement).
Pas de log persistant des données métier sensibles (No-Log).
"""
import os
import uuid
import json
import shutil
import tempfile
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from core.database import db
from core.security import get_admin_user  # Admin-only gate
from models.schemas import User

logger = logging.getLogger(__name__)
router = APIRouter(tags=["scanner-ai-admin"])


# ============================================================
# Prompt système NeriaCorp Intelligence
# ============================================================
NERIACORP_SYSTEM_PROMPT = """Tu es le cerveau central "NeriaCorp Intelligence". Analyse l'entrée (image, texte ou métadonnées) et retourne UNIQUEMENT un objet JSON structuré.

### 1. SECTION METADATA (Maison Mère)
- source_app: Déduis l'application (VisaTrace, Heritia, VeoVision, Vellumia, Aevis).
- confidence_score: Note de 0.0 à 1.0.
- operation_mode: 'Admin_Only'.

### 2. MODULES MÉTIERS (Logique Business Plans)
- SI VisaTrace : {profile_detected, social_inventory: [], risk_assessment, billing_suggestion}.
- SI Heritia : {inventory_update: [], recipe_hook, club_status}.
- SI VeoVision : {authenticity_report, multi_diffusion_ads: {}, ad_status}.
- SI Vellumia : {artistic_analysis, scene_breakdown, premium_options}.
- SI Aevis : {pos_items: [], pos_layout}.

### 3. SECTION UI FRONTEND (Visualisation isolée)
- display_card:
    * title: Titre dynamique (ex: "Scan Rôtisserie Fabrice").
    * summary: Texte court descriptif des éléments trouvés.
    * main_action: Libellé du bouton (ex: "Valider & Injecter").
    * theme_color: Code Hex selon l'app (ex: VisaTrace=#1A5CAD, Vellumia=#D4AF37).
    * visual_type: 'LIST', 'GRID' ou 'REPORT' (indique au frontend comment afficher les données).

### 4. SECTION FINANCIÈRE (Dashboard Admin)
- estimated_revenue: Prix du pack selon les BP (ex: 29.99, 60.0, 40.0).
- currency: "EUR".

### CONSIGNE STRICTE :
Ne réponds jamais par du texte libre. Si une donnée manque, mets null. Respecte la confidentialité No-Log.

Format de réponse attendu (exemple — adapte selon ce que tu détectes) :
{
  "metadata": {"source_app": "Aevis", "confidence_score": 0.92, "operation_mode": "Admin_Only"},
  "business": {"pos_items": [{"name": "Café", "price": 2.5}], "pos_layout": "grid_3x3"},
  "display_card": {
    "title": "Scan Carte Café Central",
    "summary": "12 articles boissons détectés",
    "main_action": "Valider & Injecter",
    "theme_color": "#2E8B57",
    "visual_type": "GRID"
  },
  "financial": {"estimated_revenue": 40.0, "currency": "EUR"}
}
"""

# ============================================================
# Couleurs / prix par app (référence)
# ============================================================
APP_DEFAULTS: Dict[str, Dict[str, Any]] = {
    "VisaTrace": {"theme_color": "#1A5CAD", "estimated_revenue": 29.99},
    "Heritia":   {"theme_color": "#8B4513", "estimated_revenue": 60.0},
    "VeoVision": {"theme_color": "#000000", "estimated_revenue": 40.0},
    "Vellumia":  {"theme_color": "#D4AF37", "estimated_revenue": 60.0},
    "Aevis":     {"theme_color": "#2E8B57", "estimated_revenue": 40.0},
}


# ============================================================
# Modèles Pydantic
# ============================================================
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


# ============================================================
# Endpoint principal — ADMIN ONLY
# ============================================================
@router.post("/scanner/analyze", response_model=ScanResult)
async def analyze_neriacorp(
    payload: ScanRequest,
    admin: User = Depends(get_admin_user),   # ← Gate admin-only
):
    """NeriaCorp Intelligence — analyse multi-modale (image/texte/métadonnées).
    Retourne uniquement le JSON structuré exigé par le prompt.
    Réservé au super-admin (operation_mode='Admin_Only')."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="EMERGENT_LLM_KEY manquante")

    if not (payload.image_base64 or payload.text_input or payload.metadata):
        raise HTTPException(status_code=400, detail="Aucune entrée (image_base64, text_input ou metadata)")

    # Nettoyer base64 (retirer prefix data: si présent)
    image_b64 = payload.image_base64
    if image_b64 and image_b64.startswith("data:") and "," in image_b64:
        image_b64 = image_b64.split(",", 1)[1]

    # Construire le message utilisateur
    parts = []
    if payload.text_input:
        parts.append(f"TEXTE FOURNI :\n{payload.text_input}")
    if payload.metadata:
        parts.append(f"MÉTADONNÉES :\n{json.dumps(payload.metadata, ensure_ascii=False)}")
    parts.append("Analyse selon les règles strictes. Retourne UNIQUEMENT le JSON conforme au schéma.")
    user_text = "\n\n".join(parts)

    try:
        session_id = f"neriacorp_{admin.id}_{uuid.uuid4().hex[:8]}"
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=NERIACORP_SYSTEM_PROMPT,
        ).with_model("openai", "gpt-4o")

        msg_kwargs: Dict[str, Any] = {"text": user_text}
        if image_b64:
            msg_kwargs["file_contents"] = [ImageContent(image_base64=image_b64)]

        user_msg = UserMessage(**msg_kwargs)
        raw_response = await chat.send_message(user_msg)

        # Parser le JSON strictement
        text = raw_response.strip()
        if text.startswith("```"):
            text = text.split("```", 2)[1] if text.count("```") >= 2 else text
            if text.lower().startswith("json"):
                text = text[4:].strip()
        text = text.strip("` \n\t")

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as je:
            logger.error(f"NeriaCorp JSON parse error : {je}. Raw[:200]: {text[:200]}")
            raise HTTPException(status_code=502, detail=f"Réponse IA non-JSON : {text[:200]}")

        # Garantir les sections obligatoires
        metadata = parsed.get("metadata") or {}
        business = parsed.get("business") or parsed.get("modules") or {}
        display_card = parsed.get("display_card") or {}
        financial = parsed.get("financial") or {}

        # Backfill theme_color + estimated_revenue depuis APP_DEFAULTS si absent
        source_app = metadata.get("source_app")
        if source_app in APP_DEFAULTS:
            defaults = APP_DEFAULTS[source_app]
            if not display_card.get("theme_color"):
                display_card["theme_color"] = defaults["theme_color"]
            if not financial.get("estimated_revenue"):
                financial["estimated_revenue"] = defaults["estimated_revenue"]

        if not financial.get("currency"):
            financial["currency"] = "EUR"
        if not metadata.get("operation_mode"):
            metadata["operation_mode"] = "Admin_Only"

        result = ScanResult(
            id=str(uuid.uuid4()),
            metadata=metadata,
            business=business,
            display_card=display_card,
            financial=financial,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

        # No-Log policy : on ne sauvegarde QUE l'horodatage + l'app détectée + confidence + revenu,
        # pas le contenu métier sensible (business) ni les images.
        await db.scanner_audit.insert_one({
            "id": result.id,
            "admin_id": admin.id,
            "admin_email": admin.email,
            "source_app": source_app,
            "confidence_score": metadata.get("confidence_score"),
            "estimated_revenue": financial.get("estimated_revenue"),
            "currency": financial.get("currency"),
            "created_at": result.created_at,
        })

        logger.info(
            f"NeriaCorp scan : admin={admin.email} app={source_app} "
            f"confidence={metadata.get('confidence_score')} revenue={financial.get('estimated_revenue')}€"
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"NeriaCorp error : {e}")
        raise HTTPException(status_code=500, detail=f"Erreur IA : {str(e)}")


# ============================================================
# Audit / Dashboard financier (admin)
# ============================================================
@router.get("/scanner/audit")
async def get_scanner_audit(
    limit: int = 50,
    admin: User = Depends(get_admin_user),
):
    """Historique des scans (audit No-Log : pas de contenu métier)."""
    items = await db.scanner_audit.find(
        {},
        {"_id": 0},
    ).sort("created_at", -1).to_list(limit)

    # Agrégations
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


# ============================================================
# Méta-info (apps + couleurs) pour le frontend admin
# ============================================================
@router.get("/scanner/apps")
async def list_apps(admin: User = Depends(get_admin_user)):
    """Liste des 5 apps NeriaCorp avec leurs couleurs, prix de référence, et statut de configuration."""
    from integrations.neriacorp.adapters import get_app_meta
    apps_list = []
    for name, cfg in APP_DEFAULTS.items():
        meta = get_app_meta(name) or {}
        apps_list.append({
            "name": name,
            **cfg,
            "configured": meta.get("configured", False),
        })
    return {
        "apps": apps_list,
        "operation_mode": "Admin_Only",
    }



# ============================================================
# Endpoint VIDÉO — Gemini multimodal — Annonce de vente 30s
# ============================================================
MAX_VIDEO_BYTES = 50 * 1024 * 1024  # 50 MB
ACCEPTED_VIDEO_MIMES = {
    "video/mp4", "video/quicktime", "video/x-quicktime",
    "video/webm", "video/x-matroska", "video/mpeg",
}

VIDEO_AD_PROMPT_SUFFIX = """

CONTEXTE SPÉCIAL VIDÉO :
La source est une vidéo de ~30 secondes. Tu dois analyser :
1. Le ou les produits visibles (état, marque, couleur, dimensions estimées)
2. Les caractéristiques mises en avant par le filmeur
3. Les défauts ou points négatifs éventuels

Produis une **annonce de vente** prête à publier dans le champ `display_card.summary` :
- Titre accrocheur dans `display_card.title`
- Pitch commercial dans `display_card.summary` (3-5 phrases, prêt à copier-coller)
- Bouton d'action : "Publier l'annonce"
- `display_card.visual_type` = 'REPORT' (rapport détaillé)
- `business.video_analysis` doit contenir : {duration_seconds, key_moments: [], detected_objects: [], suggested_keywords: []}
"""


@router.post("/scanner/analyze-video", response_model=ScanResult)
async def analyze_video(
    request: Request,
    file: UploadFile = File(...),
    text_input: Optional[str] = Form(None),
    admin: User = Depends(get_admin_user),
):
    """Analyse une vidéo ~30s via Gemini multimodal et génère une annonce de vente.
    Réservé au super-admin (Admin_Only)."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="EMERGENT_LLM_KEY manquante")

    # Validation MIME
    mime = file.content_type or "video/mp4"
    if mime.lower() not in ACCEPTED_VIDEO_MIMES:
        raise HTTPException(status_code=400, detail=f"Format vidéo non supporté : {mime}")

    # Early-reject via Content-Length (évite d'écrire 50 MB+ inutilement)
    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit():
        if int(content_length) > MAX_VIDEO_BYTES + 1024:  # +1KB tolérance pour multipart overhead
            raise HTTPException(status_code=413, detail="Vidéo trop volumineuse (max 50 MB)")

    # Sauvegarder vers fichier temporaire (chunked)
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
                chunk = await file.read(1024 * 1024)  # 1 MB chunks
                if not chunk:
                    break
                bytes_written += len(chunk)
                if bytes_written > MAX_VIDEO_BYTES:
                    raise HTTPException(status_code=413, detail="Vidéo trop volumineuse (max 50 MB)")
                out.write(chunk)
        logger.info(f"Vidéo reçue : {bytes_written // 1024} KB → {tmp_path}")

        # Appel Gemini avec FileContentWithMimeType
        session_id = f"neriacorp_video_{admin.id}_{uuid.uuid4().hex[:8]}"
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=NERIACORP_SYSTEM_PROMPT + VIDEO_AD_PROMPT_SUFFIX,
        ).with_model("gemini", "gemini-3.1-pro-preview")

        video_attachment = FileContentWithMimeType(file_path=tmp_path, mime_type=mime)
        user_text = text_input or "Analyse cette vidéo et génère une annonce de vente prête à publier. Retourne UNIQUEMENT le JSON."
        user_msg = UserMessage(text=user_text, file_contents=[video_attachment])

        raw_response = await chat.send_message(user_msg)

        # Parser JSON
        text = raw_response.strip()
        if text.startswith("```"):
            text = text.split("```", 2)[1] if text.count("```") >= 2 else text
            if text.lower().startswith("json"):
                text = text[4:].strip()
        text = text.strip("` \n\t")

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as je:
            logger.error(f"Video JSON parse error : {je}. Raw[:200]: {text[:200]}")
            raise HTTPException(status_code=502, detail=f"Réponse IA non-JSON : {text[:200]}")

        metadata = parsed.get("metadata") or {}
        business = parsed.get("business") or {}
        display_card = parsed.get("display_card") or {}
        financial = parsed.get("financial") or {}

        # Backfill defaults
        source_app = metadata.get("source_app")
        if source_app in APP_DEFAULTS:
            defaults = APP_DEFAULTS[source_app]
            display_card.setdefault("theme_color", defaults["theme_color"])
            financial.setdefault("estimated_revenue", defaults["estimated_revenue"])
        financial.setdefault("currency", "EUR")
        metadata.setdefault("operation_mode", "Admin_Only")
        display_card.setdefault("visual_type", "REPORT")
        if not display_card.get("main_action"):
            display_card["main_action"] = "Publier l'annonce"

        result = ScanResult(
            id=str(uuid.uuid4()),
            metadata=metadata,
            business=business,
            display_card=display_card,
            financial=financial,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

        # Audit No-Log
        await db.scanner_audit.insert_one({
            "id": result.id,
            "admin_id": admin.id,
            "admin_email": admin.email,
            "source_app": source_app,
            "source_type": "video",
            "video_size_kb": bytes_written // 1024,
            "confidence_score": metadata.get("confidence_score"),
            "estimated_revenue": financial.get("estimated_revenue"),
            "currency": financial.get("currency"),
            "created_at": result.created_at,
        })

        logger.info(
            f"NeriaCorp VIDEO : admin={admin.email} app={source_app} "
            f"size={bytes_written // 1024}KB revenue={financial.get('estimated_revenue')}€"
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"NeriaCorp video error : {e}")
        raise HTTPException(status_code=500, detail=f"Erreur IA Vidéo : {str(e)}")
    finally:
        # Nettoyage du fichier temporaire (No-Log)
        try:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        except Exception:
            pass



# ============================================================
# Publication 1-clic vers l'app cible (orchestration NeriaCorp)
# ============================================================
class PublishRequest(BaseModel):
    target_app: str          # VisaTrace | Heritia | VeoVision | Vellumia | Aevis
    scan_id: Optional[str] = None
    payload: Dict[str, Any]  # business + display_card du scan


@router.post("/scanner/publish")
async def publish_to_target_app(
    payload: PublishRequest,
    admin: User = Depends(get_admin_user),
):
    """Orchestration NeriaCorp : envoie le résultat d'un scan vers l'app métier cible.
    Stratégie :
      - Si les env vars `{APP}_BASE_URL` + `{APP}_API_KEY` sont configurées → appel HTTP réel
        (POST {base_url}/api/neriacorp/inject avec Bearer auth) avec retry 2x backoff.
      - Sinon (ou si réseau KO après retries) → fallback `published_mock` avec `partial=true`.
    """
    from integrations.neriacorp.adapters import publish_to_app, get_app_meta

    app_meta = get_app_meta(payload.target_app)
    if not app_meta:
        raise HTTPException(
            status_code=400,
            detail=f"App inconnue. Valides : {list(APP_DEFAULTS.keys())}"
        )

    publication_id = f"NC-{payload.target_app[:3].upper()}-{uuid.uuid4().hex[:8].upper()}"

    # === Dispatch via adapter ===
    adapter_result = await publish_to_app(
        target_app=payload.target_app,
        payload=payload.payload,
        scan_id=payload.scan_id,
        publication_id=publication_id,
        admin_email=admin.email,
    )

    log_entry = {
        "id": str(uuid.uuid4()),
        "publication_id": publication_id,
        "target_app": payload.target_app,
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
    await db.scanner_publications.insert_one(log_entry)

    logger.info(
        f"NeriaCorp publish : admin={admin.email} → {payload.target_app} "
        f"id={publication_id} status={adapter_result['status']} configured={app_meta['configured']}"
    )

    return {
        "publication_id": publication_id,
        "target_app": payload.target_app,
        "theme_color": app_meta["theme_color"],
        "revenue_billed": app_meta["default_revenue"],
        "currency": "EUR",
        "status": adapter_result["status"],          # published_live | published_mock
        "partial": adapter_result.get("partial", False),
        "remote_id": adapter_result.get("remote_id"),
        "configured": app_meta["configured"],
        "warning": adapter_result.get("error"),
        "message": (
            f"✅ Données injectées dans {payload.target_app} (live)."
            if adapter_result["status"] == "published_live"
            else f"⚠️ {payload.target_app} non branchée — mode mock."
        ),
        "created_at": log_entry["created_at"],
    }


@router.get("/scanner/publications")
async def list_publications(
    limit: int = 50,
    admin: User = Depends(get_admin_user),
):
    """Historique des publications NeriaCorp (orchestration mock)."""
    items = await db.scanner_publications.find(
        {},
        {"_id": 0},
    ).sort("created_at", -1).to_list(limit)

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
