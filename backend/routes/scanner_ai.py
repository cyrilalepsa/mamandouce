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
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
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
    """Liste des 5 apps NeriaCorp avec leurs couleurs et prix de référence."""
    return {
        "apps": [
            {"name": name, **cfg} for name, cfg in APP_DEFAULTS.items()
        ],
        "operation_mode": "Admin_Only",
    }
