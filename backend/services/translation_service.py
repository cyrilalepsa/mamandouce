"""
Service de traduction automatique utilisant GPT via Emergent Key
Traduit le contenu du français vers les autres langues supportées
"""
import os
import json
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, List
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

# Langues supportées
SUPPORTED_LANGUAGES = {
    'fr': 'Français',
    'en': 'English',
    'es': 'Español',
    'pt': 'Português',
    'it': 'Italiano',
    'de': 'Deutsch'
}

# Cache en mémoire pour éviter les traductions répétées
translation_cache: Dict[str, Dict[str, str]] = {}


def get_cache_key(text: str, target_lang: str) -> str:
    """Génère une clé de cache unique pour un texte et une langue"""
    hash_input = f"{text}:{target_lang}"
    return hashlib.md5(hash_input.encode()).hexdigest()


async def translate_text(
    text: str, 
    target_lang: str, 
    source_lang: str = 'fr',
    use_cache: bool = True
) -> str:
    """
    Traduit un texte vers la langue cible
    
    Args:
        text: Texte à traduire
        target_lang: Code de la langue cible (en, es, pt, it, de)
        source_lang: Code de la langue source (défaut: fr)
        use_cache: Utiliser le cache (défaut: True)
    
    Returns:
        Texte traduit
    """
    # Si la langue cible est la même que la source, retourner le texte original
    if target_lang == source_lang:
        return text
    
    # Si le texte est vide, retourner vide
    if not text or not text.strip():
        return text
    
    # Vérifier le cache
    cache_key = get_cache_key(text, target_lang)
    if use_cache and cache_key in translation_cache:
        return translation_cache[cache_key]
    
    # Vérifier que la langue est supportée
    if target_lang not in SUPPORTED_LANGUAGES:
        return text
    
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            print("Warning: EMERGENT_LLM_KEY not found, returning original text")
            return text
        
        # Initialiser le chat GPT
        chat = LlmChat(
            api_key=api_key,
            session_id=f"translation-{cache_key[:8]}",
            system_message=f"""Tu es un traducteur professionnel. 
Traduis le texte suivant du {SUPPORTED_LANGUAGES[source_lang]} vers le {SUPPORTED_LANGUAGES[target_lang]}.
Règles importantes:
- Garde le même ton et style
- Préserve les balises HTML si présentes
- Ne traduis PAS les noms propres, marques ou termes techniques
- Retourne UNIQUEMENT la traduction, sans commentaire ni explication
- Si le texte contient des emojis, garde-les"""
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=text)
        translated = await chat.send_message(user_message)
        
        # Nettoyer la réponse (enlever guillemets si présents)
        translated = translated.strip().strip('"').strip("'")
        
        # Mettre en cache
        if use_cache:
            translation_cache[cache_key] = translated
        
        return translated
        
    except Exception as e:
        print(f"Translation error: {e}")
        return text


async def translate_batch(
    texts: List[str],
    target_lang: str,
    source_lang: str = 'fr'
) -> List[str]:
    """
    Traduit plusieurs textes en une seule requête pour optimiser les coûts
    
    Args:
        texts: Liste de textes à traduire
        target_lang: Code de la langue cible
        source_lang: Code de la langue source
    
    Returns:
        Liste de textes traduits
    """
    if target_lang == source_lang:
        return texts
    
    if not texts:
        return texts
    
    # Filtrer les textes vides et garder leurs indices
    non_empty_indices = [(i, t) for i, t in enumerate(texts) if t and t.strip()]
    
    if not non_empty_indices:
        return texts
    
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return texts
        
        # Préparer le texte avec des séparateurs
        separator = "\n---SEPARATOR---\n"
        combined_text = separator.join([t for _, t in non_empty_indices])
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"batch-translation-{datetime.now(timezone.utc).timestamp()}",
            system_message=f"""Tu es un traducteur professionnel.
Traduis les textes suivants du {SUPPORTED_LANGUAGES[source_lang]} vers le {SUPPORTED_LANGUAGES[target_lang]}.
Les textes sont séparés par "---SEPARATOR---".
Règles:
- Garde le même ton et style pour chaque texte
- Préserve les balises HTML
- Ne traduis PAS les noms propres ou marques
- Retourne les traductions séparées par "---SEPARATOR---" dans le même ordre
- Pas de commentaires, juste les traductions"""
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=combined_text)
        response = await chat.send_message(user_message)
        
        # Parser la réponse
        translated_parts = response.split("---SEPARATOR---")
        translated_parts = [p.strip() for p in translated_parts]
        
        # Reconstruire la liste avec les textes vides
        result = list(texts)
        for idx, (original_idx, _) in enumerate(non_empty_indices):
            if idx < len(translated_parts):
                result[original_idx] = translated_parts[idx]
        
        return result
        
    except Exception as e:
        print(f"Batch translation error: {e}")
        return texts


async def translate_dict(
    data: Dict,
    target_lang: str,
    source_lang: str = 'fr',
    fields_to_translate: Optional[List[str]] = None
) -> Dict:
    """
    Traduit les champs spécifiés d'un dictionnaire
    
    Args:
        data: Dictionnaire à traduire
        target_lang: Langue cible
        source_lang: Langue source
        fields_to_translate: Liste des champs à traduire (si None, traduit tous les strings)
    
    Returns:
        Dictionnaire avec les champs traduits
    """
    if target_lang == source_lang:
        return data
    
    result = dict(data)
    
    for key, value in data.items():
        if fields_to_translate and key not in fields_to_translate:
            continue
            
        if isinstance(value, str) and value.strip():
            result[key] = await translate_text(value, target_lang, source_lang)
        elif isinstance(value, list):
            translated_list = []
            for item in value:
                if isinstance(item, str):
                    translated_list.append(await translate_text(item, target_lang, source_lang))
                elif isinstance(item, dict):
                    translated_list.append(await translate_dict(item, target_lang, source_lang, fields_to_translate))
                else:
                    translated_list.append(item)
            result[key] = translated_list
        elif isinstance(value, dict):
            result[key] = await translate_dict(value, target_lang, source_lang, fields_to_translate)
    
    return result


def clear_cache():
    """Vide le cache de traduction"""
    global translation_cache
    translation_cache = {}


def get_cache_stats() -> Dict:
    """Retourne les statistiques du cache"""
    return {
        "entries": len(translation_cache),
        "languages": list(set(k.split(':')[-1] for k in translation_cache.keys()) if translation_cache else [])
    }
