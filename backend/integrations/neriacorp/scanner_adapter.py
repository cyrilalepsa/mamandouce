"""
Adaptateur OCR Noyau Neria (référence N2) pour MamanDouce.

Délègue à N2_OCR_BASE_URL si configuré, sinon au LLM local (OpenAI vision).
Aucun import Emergent.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, Optional

import httpx

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
    return (os.environ.get("N2_OCR_BASE_URL") or "").rstrip("/")


def n2_ocr_api_key() -> str:
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


async def _n2_post_json(path: str, body: Dict[str, Any]) -> Dict[str, Any]:
    base = n2_ocr_base_url()
    headers = {"Content-Type": "application/json"}
    key = n2_ocr_api_key()
    if key:
        headers["Authorization"] = f"Bearer {key}"
    async with httpx.AsyncClient(timeout=90.0) as client:
        r = await client.post(f"{base}{path}", headers=headers, json=body)
        r.raise_for_status()
        return r.json()


async def analyze_neriacorp(
    *,
    image_base64: Optional[str] = None,
    text_input: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Point d'entrée OCR Intelligence (image / texte)."""
    image_b64 = _strip_data_url(image_base64)
    if n2_ocr_base_url():
        return await _n2_post_json(
            "/ocr/analyze",
            {
                "image_base64": image_b64,
                "text_input": text_input,
                "metadata": metadata,
            },
        )

    from services.llm import chat_text, chat_vision, get_llm_api_key

    if not get_llm_api_key():
        raise RuntimeError("OPENAI_API_KEY (ou N2_OCR_BASE_URL) manquant pour l'OCR")

    parts = []
    if text_input:
        parts.append(f"TEXTE FOURNI :\n{text_input}")
    if metadata:
        parts.append(f"MÉTADONNÉES :\n{json.dumps(metadata, ensure_ascii=False)}")
    parts.append("Analyse selon les règles strictes. Retourne UNIQUEMENT le JSON conforme au schéma.")
    user_text = "\n\n".join(parts)

    if image_b64:
        raw = await chat_vision(
            system_message=NERIACORP_SYSTEM_PROMPT,
            user_text=user_text,
            image_base64=image_b64,
            temperature=0.15,
        )
    else:
        raw = await chat_text(
            system_message=NERIACORP_SYSTEM_PROMPT,
            user_message=user_text,
            complexity="complex",
            temperature=0.15,
        )
    return parse_llm_json(raw)


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
    if n2_ocr_base_url():
        return await _n2_post_json(
            "/ocr/analyze-document",
            {
                "image_base64": image_b64,
                "category": category,
                "custom_prompt": custom_prompt,
            },
        )
    from services.llm import chat_vision, get_llm_api_key

    if not get_llm_api_key():
        raise RuntimeError("OPENAI_API_KEY (ou N2_OCR_BASE_URL) manquant pour l'OCR")
    raw = await chat_vision(
        system_message=document_system_prompt(category, custom_prompt),
        user_text="Extrais les données de cette image. JSON uniquement.",
        image_base64=image_b64 or "",
        temperature=0.1,
    )
    return parse_llm_json(raw)


async def analyze_video(
    *,
    file_path: str,
    mime_type: str,
    text_input: Optional[str] = None,
) -> Dict[str, Any]:
    if n2_ocr_base_url():
        base = n2_ocr_base_url()
        headers = {}
        key = n2_ocr_api_key()
        if key:
            headers["Authorization"] = f"Bearer {key}"
        with open(file_path, "rb") as fh:
            files = {"file": (os.path.basename(file_path), fh, mime_type)}
            data = {}
            if text_input:
                data["text_input"] = text_input
            async with httpx.AsyncClient(timeout=180.0) as client:
                r = await client.post(
                    f"{base}/ocr/analyze-video",
                    headers=headers,
                    files=files,
                    data=data,
                )
                r.raise_for_status()
                return r.json()

    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key:
        return await _analyze_video_gemini(file_path, mime_type, text_input, gemini_key)

    raise RuntimeError(
        "Analyse vidéo : définir N2_OCR_BASE_URL ou GEMINI_API_KEY / GOOGLE_API_KEY"
    )


async def _analyze_video_gemini(
    file_path: str, mime_type: str, text_input: Optional[str], api_key: str
) -> Dict[str, Any]:
    import asyncio

    def _run() -> str:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
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
