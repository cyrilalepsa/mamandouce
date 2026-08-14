"""
Adaptateur OCR Noyau Neria (référence N2) pour MamanDouce.

Option A — API centralisée : par défaut POST vers le Worker
`https://api.neriacorp.com` (N2_OCR_BASE_URL). OPENAI_API_KEY n'est pas
requise. Fallback OpenAI uniquement si N2_OCR_BASE_URL=off.
Aucun import Emergent.
"""
from __future__ import annotations

import base64
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
    from core.config import n2_ocr_base_url as _configured

    return _configured()


def n2_ocr_api_key() -> str:
    return os.environ.get("N2_OCR_API_KEY") or ""


def n2_api_style() -> str:
    """n2-core = Worker live api.neriacorp.com ; legacy = JSON /ocr/analyze*."""
    explicit = (os.environ.get("N2_OCR_API_STYLE") or "").strip().lower()
    if explicit in ("legacy", "json"):
        return "legacy"
    if explicit in ("n2", "n2-core", "core"):
        return "n2-core"
    base = n2_ocr_base_url() or ""
    if "api.neriacorp.com" in base:
        return "n2-core"
    return "legacy"


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
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(connect=8.0, read=90.0, write=10.0, pool=10.0)
    ) as client:
        r = await client.post(f"{base}{path}", headers=headers, json=body)
        r.raise_for_status()
        return r.json()


def _n2_auth_headers() -> Dict[str, str]:
    headers: Dict[str, str] = {}
    key = n2_ocr_api_key()
    if key:
        headers["Authorization"] = f"Bearer {key}"
    return headers


async def _n2_extract_image(image_b64: str) -> Dict[str, Any]:
    """Contrat live n2-core : POST /api/n2/ocr/extract (multipart file)."""
    raw = base64.b64decode(image_b64)
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(connect=8.0, read=90.0, write=10.0, pool=10.0)
    ) as client:
        r = await client.post(
            f"{n2_ocr_base_url()}/api/n2/ocr/extract",
            headers=_n2_auth_headers(),
            files={"file": ("scan.jpg", raw, "image/jpeg")},
            params={"lang": "fra+eng"},
        )
        if r.status_code == 401:
            raise RuntimeError(
                "Worker N2 : authentification requise (N2_OCR_API_KEY Bearer)"
            )
        r.raise_for_status()
        return r.json() if r.content else {}


def _ocr_text_from_n2(data: Dict[str, Any]) -> str:
    if not isinstance(data, dict):
        return str(data or "")
    for key in ("text", "raw_text", "content", "ocr_text"):
        val = data.get(key)
        if isinstance(val, str) and val.strip():
            return val
    nested = data.get("result") or data.get("data") or {}
    if isinstance(nested, str):
        return nested
    if isinstance(nested, dict):
        for key in ("text", "raw_text"):
            val = nested.get(key)
            if isinstance(val, str) and val.strip():
                return val
    return json.dumps(data, ensure_ascii=False)[:2000]


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
            "explanation": "OCR N2 effectué — à vérifier dans la base aliments.",
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
        "explanation": best_meta.get("reason") or "Analyse Noyau N2.",
        "confidence": 0.75,
    }


async def analyze_neriacorp(
    *,
    image_base64: Optional[str] = None,
    text_input: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Point d'entrée OCR Intelligence (image / texte)."""
    image_b64 = _strip_data_url(image_base64)
    if n2_ocr_base_url():
        if n2_api_style() == "n2-core":
            if not image_b64:
                return _scan_from_n2_text(text_input or "", metadata=metadata)
            extracted = await _n2_extract_image(image_b64)
            return _scan_from_n2_text(
                _ocr_text_from_n2(extracted),
                n2_payload=extracted,
                text_input=text_input,
                metadata=metadata,
            )
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
        if n2_api_style() == "n2-core":
            extracted = await _n2_extract_image(image_b64 or "")
            text = _ocr_text_from_n2(extracted)
            return {
                "raw_text": text,
                "confidence": extracted.get("confidence", 0.7) if isinstance(extracted, dict) else 0.7,
                "n2": extracted,
            }
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
    """Scanner aliment grossesse — passerelle N2 (Option A) puis fallback OpenAI."""
    image_b64 = _strip_data_url(image_base64)
    if n2_ocr_base_url():
        if n2_api_style() == "n2-core":
            extracted = await _n2_extract_image(image_b64 or "")
            text = _ocr_text_from_n2(extracted)
            payload = _match_food_from_text(text)
            payload["raw_text"] = text[:500]
            payload.setdefault("confidence", 0.7)
            return payload
        try:
            raw = await _n2_post_json(
                "/ocr/analyze-food",
                {
                    "image_base64": image_b64,
                    "context": user_context,
                    "source_app": "mamandouce",
                },
            )
            return normalize_food_payload(raw)
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code if exc.response is not None else 0
            if status != 404:
                raise
            logger.info("[N2] /ocr/analyze-food absent — repli /ocr/analyze-document alimentation")
            doc = await _n2_post_json(
                "/ocr/analyze-document",
                {
                    "image_base64": image_b64,
                    "category": "alimentation",
                    "custom_prompt": user_context,
                },
            )
            return normalize_food_payload(doc)

    from services.llm import chat_vision, get_llm_api_key

    if not get_llm_api_key():
        raise RuntimeError(
            "Worker N2 (N2_OCR_BASE_URL) ou OPENAI_API_KEY requis pour le scanner aliment"
        )
    system_message = """Tu es un expert en nutrition prénatale.
Réponds UNIQUEMENT en JSON :
{"food_name":"...","verdict":"autorise|limite|deconseille","explanation":"...","nutrients_info":null,"alternatives":null,"confidence":0.0}
"""
    user_text = "Analyse cet aliment pour une femme enceinte. JSON uniquement."
    if user_context:
        user_text += f"\nContexte: {user_context}"
    raw = await chat_vision(
        system_message=system_message,
        user_text=user_text,
        image_base64=image_b64 or "",
        temperature=0.1,
    )
    return normalize_food_payload(parse_llm_json(raw))
