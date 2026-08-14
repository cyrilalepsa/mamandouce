"""
Adaptateur scanner MamanDouce — moteur Vision Aevis / N2 = Gemini.

Flux aliment :
  1. Gemini Vision (GEMINI_API_KEY + GEMINI_VISION_MODEL) extrait nom / ingrédients / texte.
  2. Le moteur local FOOD_SAFETY_DATABASE tranche la compatibilité grossesse.

Aucun OpenAI ni OCR Worker n'est requis pour le scanner.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

NERIACORP_SYSTEM_PROMPT = """Tu es le cerveau central "NeriaCorp Intelligence". Analyse l'entrée (image, texte ou métadonnées) et retourne UNIQUEMENT un objet JSON structuré.

### 1. SECTION METADATA (Maison Mère)
- source_app: Déduis l'application (VisaTrace, Heritia, VeoVision, Vellumia, Aevis).
- confidence_score: Note de 0.0 à 1.0.
- operation_mode: 'Admin_Only'.

### 2. MODULES MÉTIERS
- SI VisaTrace : {profile_detected, social_inventory: [], risk_assessment, billing_suggestion}.
- SI Heritia : {inventory_update: [], recipe_hook, club_status}.
- SI VeoVision : {authenticity_report, multi_diffusion_ads: {}, ad_status}.
- SI Vellumia : {artistic_analysis, scene_breakdown, premium_options}.
- SI Aevis : {pos_items: [], pos_layout}.

### 3. SECTION UI FRONTEND
- display_card: title, summary, main_action, theme_color (hex), visual_type (LIST|GRID|REPORT).

### 4. SECTION FINANCIÈRE
- estimated_revenue (nombre), currency: "EUR".

Ne réponds jamais par du texte libre. Si une donnée manque, mets null.
"""

VIDEO_AD_PROMPT_SUFFIX = """

CONTEXTE SPÉCIAL VIDÉO :
La source est une vidéo de ~30 secondes. Produis une annonce de vente :
- display_card.title accrocheur
- display_card.summary pitch 3-5 phrases
- display_card.main_action = "Publier l'annonce"
- display_card.visual_type = 'REPORT'
- business.video_analysis = {duration_seconds, key_moments: [], detected_objects: [], suggested_keywords: []}
"""

CATEGORY_PROMPTS: Dict[str, Dict[str, Any]] = {
    "menu": {
        "label": "Menu / Carte de restaurant",
        "instruction": (
            "Tu reçois une photo d'un MENU de restaurant. Extrait UNIQUEMENT les plats visibles. "
            "Pour chaque plat : nom_du_plat, prix, categorie (entrée/plat/dessert/boisson)."
        ),
        "schema": {
            "items": [
                {"nom_du_plat": "string|null", "prix": "string|null", "categorie": "string|null"}
            ]
        },
    },
    "facture": {
        "label": "Facture / Reçu",
        "instruction": "Tu reçois une photo d'une FACTURE. Extrait fournisseur, date, articles, totaux.",
        "schema": {
            "fournisseur": "string|null",
            "date": "string|null",
            "numero_facture": "string|null",
            "articles": [
                {
                    "libelle": "string|null",
                    "quantite": "number|null",
                    "prix_unitaire_ht": "number|null",
                    "tva": "string|null",
                }
            ],
            "total_ht": "number|null",
            "total_ttc": "number|null",
        },
    },
    "alimentation": {
        "label": "Produit alimentaire",
        "instruction": "Photo d'un PRODUIT ALIMENTAIRE. Conformité grossesse si possible.",
        "schema": {
            "nom_produit": "string|null",
            "marque": "string|null",
            "categorie": "string|null",
            "prix": "string|null",
            "date_peremption": "string|null",
            "conformite_grossesse": "oui|non|a_verifier|null",
        },
    },
    "textile": {
        "label": "Vêtement / Textile",
        "instruction": "Photo d'un VÊTEMENT. Extrait les caractéristiques.",
        "schema": {
            "article": "string|null",
            "marque": "string|null",
            "taille": "string|null",
            "etat": "string|null",
            "prix": "string|null",
        },
    },
    "auto": {
        "label": "Véhicule / Auto",
        "instruction": "Photo d'un VÉHICULE. Extrait caractéristiques.",
        "schema": {
            "modele": "string|null",
            "marque": "string|null",
            "annee": "number|null",
            "prix": "string|null",
        },
    },
    "documents": {
        "label": "Document / Livre",
        "instruction": "Photo d'un DOCUMENT ou LIVRE.",
        "schema": {
            "titre": "string|null",
            "type": "string|null",
            "auteur": "string|null",
            "annee": "number|null",
        },
    },
    "admin": {
        "label": "Document administratif",
        "instruction": "Photo d'un DOCUMENT ADMINISTRATIF (CAF, Ameli…).",
        "schema": {
            "nom_document": "string|null",
            "organisme": "string|null",
            "date_emission": "string|null",
            "statut_conformite": "conforme|non_conforme|a_verifier|null",
        },
    },
    "product": {
        "label": "Annonce produit",
        "instruction": "Photo d'un PRODUIT à vendre. Fiche d'annonce.",
        "schema": {
            "nom_produit": "string|null",
            "marque": "string|null",
            "etat": "string|null",
            "prix_suggere": "string|null",
            "description_courte": "string|null",
        },
    },
}


def n2_ocr_base_url() -> str:
    from core.config import n2_ocr_base_url as _configured

    return _configured()


def n2_ocr_api_key() -> str:
    """Clé Worker N2 — optionnelle, jamais requise par le scanner aliment."""
    return os.environ.get("N2_OCR_API_KEY") or ""


def parse_llm_json(raw: str) -> Dict[str, Any]:
    text = (raw or "").strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) >= 2 else text
        if text.lower().startswith("json"):
            text = text[4:].strip()
    text = text.strip("` \n\t")
    return json.loads(text)


def _strip_data_url(image_b64: Optional[str]) -> Optional[str]:
    if image_b64 and image_b64.startswith("data:") and "," in image_b64:
        return image_b64.split(",", 1)[1]
    return image_b64


def _scan_from_n2_text(
    text: str,
    *,
    n2_payload: Optional[Dict[str, Any]] = None,
    text_input: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    summary = (text or text_input or "").strip()
    source = (metadata or {}).get("source_app") or "Aevis"
    confidence = 0.7
    if isinstance(n2_payload, dict):
        try:
            confidence = float(n2_payload.get("confidence") or confidence)
        except (TypeError, ValueError):
            pass
    return {
        "metadata": {
            "source_app": source,
            "confidence_score": confidence,
            "operation_mode": "Admin_Only",
            "ocr_engine": "n2-core",
        },
        "business": {
            "raw_text": summary,
            "n2": n2_payload or {},
        },
        "display_card": {
            "title": "Scan Noyau N2",
            "summary": summary[:280] or "Extraction OCR Worker NeriaCorp",
            "main_action": "Valider & Injecter",
            "theme_color": "#2E8B57",
            "visual_type": "REPORT",
        },
        "financial": {"estimated_revenue": 40.0, "currency": "EUR"},
    }


def _match_food_from_text(text: str) -> Dict[str, Any]:
    blob = (text or "").lower()
    try:
        from data.food_database import FOOD_SAFETY_DATABASE
    except Exception:
        FOOD_SAFETY_DATABASE = {}
    best_meta = None
    best_len = 0
    for key, meta in FOOD_SAFETY_DATABASE.items():
        candidates = [key.replace("-", " "), str(meta.get("name") or "").lower()]
        for name in candidates:
            if name and name in blob and len(name) > best_len:
                best_meta = meta
                best_len = len(name)
    if not best_meta:
        label = (text or "Aliment").split("\n")[0].strip()[:80] or "Aliment"
        return {
            "food_name": label,
            "verdict": "limite",
            "explanation": "Produit lu par Gemini Vision — à vérifier dans la base aliments.",
            "confidence": 0.4,
        }
    safety = best_meta.get("safe_for_pregnancy") or "caution"
    verdict = {
        "safe": "autorise",
        "caution": "limite",
        "unsafe": "deconseille",
        "avoid": "deconseille",
    }.get(safety, "limite")
    return {
        "food_name": best_meta.get("name") or "Aliment",
        "verdict": verdict,
        "explanation": best_meta.get("reason") or "Vérification grossesse locale.",
        "confidence": 0.75,
    }


def apply_pregnancy_engine(extracted: Dict[str, Any]) -> Dict[str, Any]:
    """Injecte l'extraction Gemini dans le moteur local de compatibilité grossesse."""
    haystack = " ".join(
        str(extracted.get(k) or "")
        for k in ("product_name", "brand", "ingredients", "packaging_text", "category")
    )
    match = _match_food_from_text(haystack)
    ingredients = (extracted.get("ingredients") or "").lower()
    if "lait cru" in ingredients or "raw milk" in ingredients:
        match["verdict"] = "deconseille"
        match["explanation"] = (
            "Ingrédients : lait cru détecté — risque de listériose pendant la grossesse."
        )
    if any(token in ingredients for token in ("alcool", " wine", "vodka", "rhum")):
        match["verdict"] = "deconseille"
        match["explanation"] = "Ingrédients : alcool détecté — déconseillé pendant la grossesse."
    product_name = extracted.get("product_name") or match["food_name"]
    match["food_name"] = product_name
    match["product_name"] = product_name
    match["brand"] = extracted.get("brand")
    match["ingredients"] = extracted.get("ingredients")
    match["packaging_text"] = extracted.get("packaging_text")
    match["category"] = extracted.get("category")
    match["confidence"] = float(extracted.get("confidence") or match.get("confidence") or 0.7)
    match["engine"] = "gemini-vision+local-pregnancy"
    match["vision_model"] = extracted.get("model")
    return match


async def analyze_neriacorp(
    *,
    image_base64: Optional[str] = None,
    text_input: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Point d'entrée OCR Intelligence (image / texte) — Vision Gemini Aevis."""
    image_b64 = _strip_data_url(image_base64)
    if image_b64:
        from services.gemini_vision import gemini_vision_json, gemini_api_key

        if gemini_api_key():
            parsed = await gemini_vision_json(
                NERIACORP_SYSTEM_PROMPT
                + "\n\nAnalyse l'image. JSON strict metadata/business/display_card/financial.",
                image_b64,
            )
            if parsed.get("metadata") or parsed.get("business"):
                return parsed
            return _scan_from_n2_text(
                parsed.get("packaging_text") or parsed.get("product_name") or "",
                n2_payload=parsed,
                text_input=text_input,
                metadata=metadata,
            )
        raise RuntimeError(
            "GEMINI_API_KEY requis pour le scanner Vision (moteur Aevis / N2)"
        )
    return _scan_from_n2_text(text_input or "", metadata=metadata)


def document_system_prompt(category: str, custom_prompt: Optional[str] = None) -> str:
    cfg = CATEGORY_PROMPTS.get(category)
    if not cfg:
        valid = ", ".join(CATEGORY_PROMPTS.keys())
        raise ValueError(f"Catégorie invalide. Valides: {valid}")
    schema_str = json.dumps(cfg["schema"], ensure_ascii=False, indent=2)
    base = f"""Tu es un assistant d'extraction de données depuis des photos.

CATÉGORIE : {cfg['label']}
INSTRUCTION : {cfg['instruction']}

RÈGLES STRICTES :
1. UNIQUEMENT du JSON valide, sans markdown.
2. Respecte EXACTEMENT le schéma (mêmes clés).
3. Champ illisible → null. N'invente jamais.
4. Ajoute `confidence` (0.0–1.0) et `raw_text` (max 500 caractères).

SCHÉMA :
{schema_str}
"""
    if custom_prompt:
        base += f"\nINFOS COMPLÉMENTAIRES : {custom_prompt}"
    return base


async def analyze_document(
    *,
    image_base64: str,
    category: str,
    custom_prompt: Optional[str] = None,
) -> Dict[str, Any]:
    if category not in CATEGORY_PROMPTS:
        valid = ", ".join(CATEGORY_PROMPTS.keys())
        raise ValueError(f"Catégorie invalide. Valides: {valid}")
    image_b64 = _strip_data_url(image_base64)
    from services.gemini_vision import gemini_vision_json

    return await gemini_vision_json(
        document_system_prompt(category, custom_prompt),
        image_b64 or "",
    )


async def analyze_video(
    *,
    file_path: str,
    mime_type: str,
    text_input: Optional[str] = None,
) -> Dict[str, Any]:
    from services.gemini_vision import gemini_api_key

    if gemini_api_key():
        return await _analyze_video_gemini(file_path, mime_type, text_input, gemini_api_key())
    raise RuntimeError("GEMINI_API_KEY requis pour l'analyse vidéo (moteur Aevis / N2)")


async def _analyze_video_gemini(
    file_path: str, mime_type: str, text_input: Optional[str], api_key: str
) -> Dict[str, Any]:
    import asyncio

    def _run() -> str:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        from services.gemini_vision import gemini_vision_model

        model = genai.GenerativeModel(gemini_vision_model())
        uploaded = genai.upload_file(path=file_path, mime_type=mime_type)
        prompt = text_input or (
            "Analyse cette vidéo et génère une annonce de vente. Retourne UNIQUEMENT le JSON."
        )
        resp = model.generate_content(
            [NERIACORP_SYSTEM_PROMPT + VIDEO_AD_PROMPT_SUFFIX, uploaded, prompt]
        )
        return (resp.text or "").strip()

    raw = await asyncio.to_thread(_run)
    return parse_llm_json(raw)


def normalize_food_payload(data: Dict[str, Any]) -> Dict[str, Any]:
    """Aligne une réponse N2 (food dédié ou document alimentation) sur le contrat food scanner."""
    if not isinstance(data, dict):
        return {
            "food_name": "Aliment",
            "verdict": "limite",
            "explanation": "Réponse N2 inattendue.",
            "confidence": 0.0,
        }
    if data.get("food_name") and data.get("verdict"):
        return data
    inner = data.get("data") if isinstance(data.get("data"), dict) else data
    name = (
        inner.get("nom_produit")
        or inner.get("food_name")
        or inner.get("name")
        or "Aliment"
    )
    flag = str(inner.get("conformite_grossesse") or inner.get("verdict") or "").lower()
    if flag in ("oui", "autorise", "autorisé", "safe", "ok"):
        verdict = "autorise"
    elif flag in ("non", "deconseille", "déconseillé", "danger", "avoid"):
        verdict = "deconseille"
    else:
        verdict = "limite"
    return {
        "food_name": name,
        "verdict": verdict,
        "explanation": inner.get("explanation")
        or inner.get("description_courte")
        or "Analyse Noyau N2.",
        "nutrients_info": inner.get("nutrients_info"),
        "alternatives": inner.get("alternatives"),
        "confidence": float(data.get("confidence") or inner.get("confidence") or 0.8),
    }


async def analyze_food(
    *,
    image_base64: str,
    user_context: Optional[str] = None,
) -> Dict[str, Any]:
    """Scanner aliment : Gemini Vision (Aevis) puis moteur grossesse local."""
    from services.gemini_vision import extract_product

    image_b64 = _strip_data_url(image_base64)
    extracted = await extract_product(image_b64 or "", extra_context=user_context)
    return apply_pregnancy_engine(extracted)
