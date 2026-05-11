"""
AI Document Scanner — Multi-category vision OCR
Categories:
  - menu        → Nom du plat, Prix, Catégorie
  - facture     → Fournisseur, Date, Articles, Prix unitaire HT, TVA
  - alimentation → Nom, Marque, Catégorie, Prix, Date péremption, Conformité grossesse
  - textile     → Article, Marque, Taille, État, Prix, Saison, Composition
  - auto        → Modèle, Marque, Année, Kilométrage, État, Prix, Carburant
  - documents   → Titre, Type, Auteur, Année, État, Référence
  - admin       → Nom du document, Date, Organisme, Statut, Critères de conformité
  - product     → Nom, Marque, Année, État, Prix, Référence

Returns STRICT JSON only. Marks 'null' for unreadable fields, never invents.
"""
import os
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from core.database import db
from core.security import get_current_user
from models.schemas import User

logger = logging.getLogger(__name__)
router = APIRouter(tags=["scanner-ai"])


# ============================================================
# Prompts spécialisés par catégorie (sortie JSON STRICT)
# ============================================================
CATEGORY_PROMPTS: Dict[str, Dict[str, Any]] = {
    "menu": {
        "label": "Menu / Carte de restaurant",
        "instruction": (
            "Tu reçois une photo d'un MENU de restaurant. Extrait UNIQUEMENT les plats visibles. "
            "Pour chaque plat, retourne : nom_du_plat, prix (avec devise si visible), categorie (entrée/plat/dessert/boisson)."
        ),
        "schema": {
            "items": [
                {"nom_du_plat": "string|null", "prix": "string|null", "categorie": "string|null"}
            ]
        },
    },
    "facture": {
        "label": "Facture / Reçu",
        "instruction": (
            "Tu reçois une photo d'une FACTURE ou d'un REÇU. Extrait les informations légales. "
            "Pour chaque article ligne par ligne, retourne le détail."
        ),
        "schema": {
            "fournisseur": "string|null",
            "date": "string|null (format YYYY-MM-DD si possible)",
            "numero_facture": "string|null",
            "articles": [
                {"libelle": "string|null", "quantite": "number|null", "prix_unitaire_ht": "number|null", "tva": "string|null"}
            ],
            "total_ht": "number|null",
            "total_ttc": "number|null"
        },
    },
    "alimentation": {
        "label": "Produit alimentaire",
        "instruction": (
            "Tu reçois une photo d'un PRODUIT ALIMENTAIRE (étiquette, emballage). "
            "Indique aussi si le produit est CONFORME pour une femme enceinte (oui/non/à vérifier) en te basant sur les listes officielles."
        ),
        "schema": {
            "nom_produit": "string|null",
            "marque": "string|null",
            "categorie": "string|null",
            "prix": "string|null",
            "date_peremption": "string|null",
            "ingredients_a_eviter_grossesse": ["string"],
            "conformite_grossesse": "oui|non|a_verifier|null",
            "raison_conformite": "string|null"
        },
    },
    "textile": {
        "label": "Vêtement / Textile",
        "instruction": "Tu reçois une photo d'un VÊTEMENT ou article TEXTILE. Extrait les caractéristiques.",
        "schema": {
            "article": "string|null",
            "marque": "string|null",
            "taille": "string|null",
            "etat": "neuf|excellent|bon|moyen|usage|null",
            "prix": "string|null",
            "saison": "ete|hiver|mi-saison|toutes_saisons|null",
            "composition": "string|null",
            "couleur": "string|null"
        },
    },
    "auto": {
        "label": "Véhicule / Auto",
        "instruction": "Tu reçois une photo d'un VÉHICULE ou de sa carte grise. Extrait les caractéristiques techniques et commerciales.",
        "schema": {
            "modele": "string|null",
            "marque": "string|null",
            "annee": "number|null",
            "kilometrage": "number|null",
            "etat": "neuf|excellent|bon|moyen|usage|null",
            "prix": "string|null",
            "carburant": "essence|diesel|hybride|electrique|gpl|null",
            "couleur": "string|null"
        },
    },
    "documents": {
        "label": "Document / Livre",
        "instruction": "Tu reçois une photo d'un DOCUMENT, d'un LIVRE ou d'une publication. Extrait les références bibliographiques.",
        "schema": {
            "titre": "string|null",
            "type": "livre|magazine|document_administratif|autre|null",
            "auteur": "string|null",
            "annee": "number|null",
            "editeur": "string|null",
            "etat": "neuf|excellent|bon|moyen|usage|null",
            "reference_isbn": "string|null"
        },
    },
    "admin": {
        "label": "Document administratif (CAF, Ameli, CPAM...)",
        "instruction": (
            "Tu reçois une photo d'un DOCUMENT ADMINISTRATIF (CAF, Ameli, CPAM, certificat, justificatif). "
            "Vérifie si le document est CONFORME (lisible, non périmé, complet)."
        ),
        "schema": {
            "nom_document": "string|null",
            "organisme": "string|null",
            "date_emission": "string|null",
            "date_validite": "string|null",
            "numero_dossier": "string|null",
            "destinataire": "string|null",
            "statut_conformite": "conforme|non_conforme|a_verifier|null",
            "criteres_verifies": ["string"]
        },
    },
    "product": {
        "label": "Annonce produit (générique)",
        "instruction": "Tu reçois une photo d'un PRODUIT à vendre. Génère une fiche d'annonce de vente.",
        "schema": {
            "nom_produit": "string|null",
            "marque": "string|null",
            "annee": "number|null",
            "etat": "neuf|excellent|bon|moyen|usage|null",
            "prix_suggere": "string|null",
            "description_courte": "string|null",
            "couleur": "string|null",
            "reference": "string|null"
        },
    },
}


# ============================================================
# Modèles Pydantic
# ============================================================
class ScanRequest(BaseModel):
    image_base64: str  # base64 brut SANS prefix data:image/...
    category: str       # une des clés de CATEGORY_PROMPTS
    custom_prompt: Optional[str] = None


class ScanResult(BaseModel):
    id: str
    category: str
    template_label: str
    data: Dict[str, Any]
    raw_text: Optional[str] = None
    confidence: float
    created_at: str


# ============================================================
# Helper : construction du prompt système
# ============================================================
def _build_system_prompt(category: str, custom_prompt: Optional[str] = None) -> str:
    cfg = CATEGORY_PROMPTS.get(category)
    if not cfg:
        valid = ", ".join(CATEGORY_PROMPTS.keys())
        raise HTTPException(status_code=400, detail=f"Catégorie invalide. Valides: {valid}")

    schema_str = json.dumps(cfg["schema"], ensure_ascii=False, indent=2)

    base = f"""Tu es un assistant d'extraction de données depuis des photos.

CATÉGORIE : {cfg['label']}

INSTRUCTION : {cfg['instruction']}

RÈGLES STRICTES :
1. Tu retournes UNIQUEMENT du JSON valide, sans markdown, sans commentaire, sans ```json.
2. Tu respectes EXACTEMENT le schéma ci-dessous (mêmes clés, mêmes types).
3. Si un champ est ILLISIBLE ou ABSENT, mets `null` (et non une chaîne vide).
4. N'INVENTE JAMAIS de données. Si tu hésites, mets `null`.
5. Pour les listes : retourne un tableau JSON (peut être vide `[]`).
6. Pour les nombres : retourne un nombre, pas une chaîne (ex: 12.5 et non "12.5").
7. À la fin, ajoute un champ `confidence` (0.0 à 1.0) reflétant ta confiance globale.
8. Ajoute aussi un champ `raw_text` contenant le texte brut visible sur l'image (max 500 caractères).

SCHÉMA ATTENDU :
{schema_str}

EXEMPLE DE RÉPONSE :
{{ ...données extraites selon le schéma..., "confidence": 0.92, "raw_text": "..." }}
"""

    if custom_prompt:
        base += f"\n\nINFOS COMPLÉMENTAIRES DE L'UTILISATEUR : {custom_prompt}"

    return base


# ============================================================
# Endpoint principal
# ============================================================
@router.post("/scanner/analyze-document", response_model=ScanResult)
async def analyze_document(
    payload: ScanRequest,
    current_user: User = Depends(get_current_user),
):
    """Analyse une image via GPT-4o Vision et retourne un JSON structuré par catégorie."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Service IA non configuré (EMERGENT_LLM_KEY manquante)")

    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="Image manquante")

    # Nettoyer base64 (retirer le prefix éventuel)
    image_b64 = payload.image_base64
    if image_b64.startswith("data:"):
        image_b64 = image_b64.split(",", 1)[1] if "," in image_b64 else image_b64

    system_prompt = _build_system_prompt(payload.category, payload.custom_prompt)

    try:
        session_id = f"scan_{current_user.id}_{uuid.uuid4().hex[:8]}"
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_prompt,
        ).with_model("openai", "gpt-4o")

        image_content = ImageContent(image_base64=image_b64)
        user_msg = UserMessage(
            text=(
                "Analyse cette image selon les règles strictes du système. "
                "Retourne UNIQUEMENT le JSON, rien d'autre."
            ),
            file_contents=[image_content],
        )

        raw_response = await chat.send_message(user_msg)

        # Parser le JSON
        text = raw_response.strip()
        # Strip markdown si jamais présent
        if text.startswith("```"):
            text = text.split("```", 2)[1] if text.count("```") >= 2 else text
            if text.lower().startswith("json"):
                text = text[4:].strip()
        text = text.strip("` \n\t")

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as je:
            logger.error(f"JSON parse error: {je}. Raw: {text[:200]}")
            # Fallback : retourner le texte brut sans parsing
            parsed = {"error": "json_parse_failed", "raw_response": raw_response}

        confidence = float(parsed.pop("confidence", 0.0)) if isinstance(parsed, dict) else 0.0
        raw_text = parsed.pop("raw_text", None) if isinstance(parsed, dict) else None

        cfg = CATEGORY_PROMPTS[payload.category]
        result = ScanResult(
            id=str(uuid.uuid4()),
            category=payload.category,
            template_label=cfg["label"],
            data=parsed,
            raw_text=raw_text,
            confidence=confidence,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

        # Sauvegarder l'historique
        await db.scanner_history.insert_one({
            **result.model_dump(),
            "user_id": current_user.id,
            "user_email": current_user.email,
        })

        logger.info(f"Scan IA OK : user={current_user.email} category={payload.category} confidence={confidence}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Erreur analyse document : {e}")
        raise HTTPException(status_code=500, detail=f"Erreur IA : {str(e)}")


# ============================================================
# Liste catégories (pour le frontend)
# ============================================================
@router.get("/scanner/categories")
async def list_categories(current_user: User = Depends(get_current_user)):
    """Retourne la liste des catégories de scan disponibles avec leur label."""
    return {
        "categories": [
            {"id": k, "label": v["label"], "fields": list(v["schema"].keys())}
            for k, v in CATEGORY_PROMPTS.items()
        ]
    }


# ============================================================
# Historique
# ============================================================
@router.get("/scanner/history")
async def get_scan_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
):
    """Historique des derniers scans de l'utilisateur."""
    items = await db.scanner_history.find(
        {"user_id": current_user.id},
        {"_id": 0, "user_id": 0, "user_email": 0},
    ).sort("created_at", -1).to_list(limit)
    return {"scans": items}
