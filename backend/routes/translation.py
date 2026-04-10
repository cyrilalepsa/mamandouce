"""
Routes API pour la traduction automatique
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from services.translation_service import (
    translate_text, 
    translate_batch, 
    translate_dict,
    SUPPORTED_LANGUAGES,
    clear_cache,
    get_cache_stats
)

router = APIRouter(prefix="/translate", tags=["Translation"])


class TranslateTextRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: str = "fr"


class TranslateBatchRequest(BaseModel):
    texts: List[str]
    target_lang: str
    source_lang: str = "fr"


class TranslateDictRequest(BaseModel):
    data: Dict[str, Any]
    target_lang: str
    source_lang: str = "fr"
    fields_to_translate: Optional[List[str]] = None


class TranslateResponse(BaseModel):
    translated: str
    source_lang: str
    target_lang: str


class TranslateBatchResponse(BaseModel):
    translated: List[str]
    source_lang: str
    target_lang: str
    count: int


@router.get("/languages")
async def get_supported_languages():
    """Retourne la liste des langues supportées"""
    return {
        "languages": [
            {"code": code, "name": name}
            for code, name in SUPPORTED_LANGUAGES.items()
        ],
        "default": "fr"
    }


@router.post("/text", response_model=TranslateResponse)
async def translate_single_text(request: TranslateTextRequest):
    """
    Traduit un texte unique
    
    - **text**: Texte à traduire
    - **target_lang**: Code de la langue cible (en, es, pt, it, de)
    - **source_lang**: Code de la langue source (défaut: fr)
    """
    if request.target_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400, 
            detail=f"Langue non supportée: {request.target_lang}. Langues disponibles: {list(SUPPORTED_LANGUAGES.keys())}"
        )
    
    translated = await translate_text(
        request.text, 
        request.target_lang, 
        request.source_lang
    )
    
    return TranslateResponse(
        translated=translated,
        source_lang=request.source_lang,
        target_lang=request.target_lang
    )


@router.post("/batch", response_model=TranslateBatchResponse)
async def translate_multiple_texts(request: TranslateBatchRequest):
    """
    Traduit plusieurs textes en une requête (plus économique)
    
    - **texts**: Liste de textes à traduire
    - **target_lang**: Code de la langue cible
    - **source_lang**: Code de la langue source (défaut: fr)
    """
    if request.target_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400, 
            detail=f"Langue non supportée: {request.target_lang}"
        )
    
    if len(request.texts) > 50:
        raise HTTPException(
            status_code=400,
            detail="Maximum 50 textes par requête"
        )
    
    translated = await translate_batch(
        request.texts,
        request.target_lang,
        request.source_lang
    )
    
    return TranslateBatchResponse(
        translated=translated,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
        count=len(translated)
    )


@router.post("/dict")
async def translate_dictionary(request: TranslateDictRequest):
    """
    Traduit les champs d'un objet/dictionnaire
    
    - **data**: Objet à traduire
    - **target_lang**: Code de la langue cible
    - **source_lang**: Code de la langue source (défaut: fr)
    - **fields_to_translate**: Liste optionnelle des champs à traduire
    """
    if request.target_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400, 
            detail=f"Langue non supportée: {request.target_lang}"
        )
    
    translated = await translate_dict(
        request.data,
        request.target_lang,
        request.source_lang,
        request.fields_to_translate
    )
    
    return {
        "translated": translated,
        "source_lang": request.source_lang,
        "target_lang": request.target_lang
    }


@router.get("/cache/stats")
async def get_translation_cache_stats():
    """Retourne les statistiques du cache de traduction"""
    return get_cache_stats()


@router.delete("/cache")
async def clear_translation_cache():
    """Vide le cache de traduction"""
    clear_cache()
    return {"message": "Cache vidé", "success": True}
