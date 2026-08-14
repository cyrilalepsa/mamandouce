"""
Client Gemini Vision — même contrat qu'Aevis / Noyau N2.

Variables :
  GEMINI_API_KEY          (ou GOOGLE_API_KEY)
  GEMINI_VISION_MODEL     (défaut gemini-2.0-flash)

Aucun autre provider (OpenAI, Worker OCR) n'est requis.
"""
from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
import os
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

DEFAULT_GEMINI_VISION_MODEL = "gemini-2.0-flash"

PRODUCT_EXTRACT_PROMPT = """Tu es le moteur Vision Aevis / NeriaCorp.
Analyse la photo d'un produit (emballage, étiquette, aliment) et extrais les données visibles.

Réponds UNIQUEMENT en JSON valide, sans markdown :
{
  "product_name": "nom commercial du produit ou de l'aliment",
  "brand": "marque ou null",
  "ingredients": "liste d'ingrédients / INCI si lisible, sinon null",
  "packaging_text": "texte OCR brut de l'emballage (max 800 caractères)",
  "category": "catégorie courte ou null",
  "confidence": 0.0
}

Règles :
- N'invente pas. Champ illisible → null.
- packaging_text reprend le texte réellement visible.
- confidence entre 0.0 et 1.0.
"""


def gemini_api_key() -> str:
    return (
        os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GOOGLE_API_KEY")
        or ""
    ).strip()


def gemini_vision_model() -> str:
    return (
        os.environ.get("GEMINI_VISION_MODEL")
        or os.environ.get("AEVIS_GEMINI_VISION_MODEL")
        or DEFAULT_GEMINI_VISION_MODEL
    ).strip()


def require_gemini_api_key() -> str:
    key = gemini_api_key()
    if not key:
        raise RuntimeError(
            "GEMINI_API_KEY (ou GOOGLE_API_KEY) requis pour le scanner Vision Aevis/N2"
        )
    return key


def _decode_image_bytes(image_b64: str) -> bytes:
    payload = image_b64 or ""
    if payload.startswith("data:") and "," in payload:
        payload = payload.split(",", 1)[1]
    return base64.b64decode(payload)


def _parse_json_loose(raw: str) -> Dict[str, Any]:
    text = (raw or "").strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) >= 2 else text
        if text.lower().startswith("json"):
            text = text[4:].strip()
    text = text.strip("` \n\t")
    try:
        data = json.loads(text)
        return data if isinstance(data, dict) else {"packaging_text": text}
    except json.JSONDecodeError:
        import re

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {"packaging_text": text, "product_name": None, "confidence": 0.4}


def _generate_sync(prompt: str, image_b64: str) -> str:
    import google.generativeai as genai
    from PIL import Image

    genai.configure(api_key=require_gemini_api_key())
    model = genai.GenerativeModel(gemini_vision_model())
    image = Image.open(io.BytesIO(_decode_image_bytes(image_b64)))
    resp = model.generate_content([prompt, image])
    return (resp.text or "").strip()


async def gemini_vision_text(prompt: str, image_b64: str) -> str:
    """Appel Vision synchrone isolé dans un thread (SDK google.generativeai)."""
    return await asyncio.to_thread(_generate_sync, prompt, image_b64)


async def extract_product(image_b64: str, extra_context: Optional[str] = None) -> Dict[str, Any]:
    """Extraction produit style Aevis : nom, ingrédients, texte emballage."""
    prompt = PRODUCT_EXTRACT_PROMPT
    if extra_context:
        prompt += f"\nContexte additionnel : {extra_context}"
    raw = await gemini_vision_text(prompt, image_b64)
    data = _parse_json_loose(raw)
    data.setdefault("product_name", data.get("nom_produit") or data.get("name"))
    data.setdefault("ingredients", None)
    data.setdefault("packaging_text", data.get("raw_text"))
    data.setdefault("brand", None)
    data.setdefault("category", None)
    try:
        data["confidence"] = float(data.get("confidence") or 0.7)
    except (TypeError, ValueError):
        data["confidence"] = 0.7
    data["engine"] = "gemini-vision"
    data["model"] = gemini_vision_model()
    return data


async def gemini_vision_json(prompt: str, image_b64: str) -> Dict[str, Any]:
    raw = await gemini_vision_text(prompt, image_b64)
    return _parse_json_loose(raw)
