"""
Client LLM autonome (OpenAI officiel).
Utilise uniquement OPENAI_API_KEY (injectée par N2-Vault ou l'environnement).

Routage dynamique:
  - tâches simples  → OPENAI_CHAT_MODEL / OPENAI_FAST_MODEL (défaut gpt-4o-mini)
  - tâches complexes → OPENAI_COMPLEX_MODEL / OPENAI_VISION_MODEL (défaut gpt-4o)
  - fallback automatique si un modèle est indisponible
"""
from __future__ import annotations

import logging
import os
import re
from typing import List, Literal, Optional

from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

Complexity = Literal["fast", "complex", "vision"]

DEFAULT_CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL") or os.environ.get(
    "OPENAI_FAST_MODEL", "gpt-4o-mini"
)
DEFAULT_COMPLEX_MODEL = os.environ.get("OPENAI_COMPLEX_MODEL") or os.environ.get(
    "OPENAI_VISION_MODEL", "gpt-4o"
)
DEFAULT_VISION_MODEL = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o")

# Heuristiques complexité (symptômes / médical → modèle haute perf)
_COMPLEX_PATTERNS = re.compile(
    r"("
    r"sympt[oô]me|douleur|saignement|fi[eè]vre|contraction|"
    r"m[eé]dicament|ordonnance|diagnostic|analyse|"
    r"sang|tension|diab[eè]te|pr[eé][eé]clamps|"
    r"accouchement|urgence|h[oô]pital|perte\s+de\s+liquide|"
    r"d[eé]taille|explique\s+en\s+profondeur|pourquoi\s+est[- ]ce"
    r")",
    re.IGNORECASE,
)


def get_llm_api_key() -> Optional[str]:
    return os.environ.get("OPENAI_API_KEY") or None


def require_llm_api_key() -> str:
    key = get_llm_api_key()
    if not key:
        raise ValueError("Clé LLM manquante — définir OPENAI_API_KEY")
    return key


def get_async_client(api_key: Optional[str] = None) -> AsyncOpenAI:
    return AsyncOpenAI(api_key=api_key or require_llm_api_key())


def detect_complexity(user_message: str, hint: Optional[Complexity] = None) -> Complexity:
    """Détermine fast vs complex selon le contenu (ou un hint explicite)."""
    if hint in ("fast", "complex", "vision"):
        return hint
    text = user_message or ""
    if len(text) > 500 or _COMPLEX_PATTERNS.search(text):
        return "complex"
    return "fast"


def resolve_model(complexity: Complexity = "fast", explicit: Optional[str] = None) -> str:
    if explicit:
        return explicit
    if complexity == "vision":
        return DEFAULT_VISION_MODEL
    if complexity == "complex":
        return DEFAULT_COMPLEX_MODEL
    return DEFAULT_CHAT_MODEL


def _fallback_model(primary: str) -> Optional[str]:
    """Modèle de secours si le primaire échoue."""
    if primary == DEFAULT_COMPLEX_MODEL and DEFAULT_CHAT_MODEL != primary:
        return DEFAULT_CHAT_MODEL
    if primary == DEFAULT_CHAT_MODEL and DEFAULT_COMPLEX_MODEL != primary:
        return DEFAULT_COMPLEX_MODEL
    if primary == DEFAULT_VISION_MODEL and DEFAULT_CHAT_MODEL != primary:
        return DEFAULT_CHAT_MODEL
    return None


async def _create_with_fallback(client: AsyncOpenAI, *, model: str, **kwargs) -> str:
    try:
        response = await client.chat.completions.create(model=model, **kwargs)
        content = response.choices[0].message.content
        return (content or "").strip()
    except Exception as primary_err:
        alt = _fallback_model(model)
        if not alt:
            raise
        logger.warning(
            "OpenAI model %s failed (%s) — fallback → %s",
            model,
            primary_err,
            alt,
        )
        response = await client.chat.completions.create(model=alt, **kwargs)
        content = response.choices[0].message.content
        return (content or "").strip()


async def chat_text(
    *,
    system_message: str,
    user_message: str,
    model: Optional[str] = None,
    temperature: float = 0.7,
    complexity: Optional[Complexity] = None,
) -> str:
    """Appel chat texte simple (system + user) avec routage + fallback."""
    client = get_async_client()
    level = detect_complexity(user_message, complexity)
    chosen = resolve_model(level, model)
    return await _create_with_fallback(
        client,
        model=chosen,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
    )


async def chat_vision(
    *,
    system_message: str,
    user_text: str,
    image_base64: str,
    mime_type: str = "image/jpeg",
    model: Optional[str] = None,
    temperature: float = 0.2,
) -> str:
    """Appel vision (image base64 + prompt) — modèle vision + fallback."""
    client = get_async_client()
    chosen = resolve_model("vision", model)
    data_url = f"data:{mime_type};base64,{image_base64}"
    return await _create_with_fallback(
        client,
        model=chosen,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system_message},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_text},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            },
        ],
    )


async def chat_messages(
    *,
    messages: List[dict],
    model: Optional[str] = None,
    temperature: float = 0.7,
    complexity: Complexity = "fast",
) -> str:
    """Appel chat avec liste de messages déjà formattée."""
    client = get_async_client()
    chosen = resolve_model(complexity, model)
    return await _create_with_fallback(
        client,
        model=chosen,
        temperature=temperature,
        messages=messages,
    )
