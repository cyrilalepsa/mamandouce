"""
AI Food Scanner Service - Analyse d'images alimentaires pour femmes enceintes
Utilise GPT-4o Vision pour identifier les aliments et évaluer leur sécurité
"""
import os
import base64
import logging
import tempfile
import gc
from datetime import datetime, timezone
from typing import Optional, Dict
from pydantic import BaseModel
from enum import Enum
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class FoodSafetyVerdict(str, Enum):
    AUTORISE = "autorise"      # Vert - Sûr à consommer
    LIMITE = "limite"          # Orange - Avec modération
    DECONSEILLE = "deconseille"  # Rouge - À éviter


class FoodScanResult(BaseModel):
    """Résultat de l'analyse alimentaire"""
    food_name: str
    verdict: FoodSafetyVerdict
    verdict_color: str  # green, orange, red
    explanation: str
    nutrients_info: Optional[str] = None
    alternatives: Optional[str] = None
    confidence: float = 0.0
    scanned_at: str
    is_unknown: bool = False  # True si l'aliment n'a pas pu être identifié


class AIFoodScanner:
    """Scanner alimentaire IA utilisant GPT-4o Vision"""
    
    def __init__(self):
        from services.llm import get_llm_api_key
        self.api_key = get_llm_api_key()
        if not self.api_key:
            logger.warning("[FoodScanner] OPENAI_API_KEY not configured")
    
    async def analyze_food_image(self, image_base64: str, user_context: Optional[str] = None) -> FoodScanResult:
        """
        Analyse une image d'aliment et retourne le verdict de sécurité
        
        Args:
            image_base64: Image encodée en base64 (JPEG/PNG)
            user_context: Contexte optionnel (ex: "enceinte de 20 semaines")
        
        Returns:
            FoodScanResult avec verdict et explications
        """
        from services.llm import chat_vision
        
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY non configurée")
        
        # Créer le contexte système
        system_message = """Tu es un expert en nutrition prénatale et sécurité alimentaire pour les femmes enceintes.

Ton rôle est d'analyser les images d'aliments et de donner un verdict clair sur leur sécurité pendant la grossesse.

RÈGLES STRICTES:
1. Tu dois TOUJOURS répondre en JSON valide avec la structure suivante:
{
  "food_name": "Nom de l'aliment identifié",
  "verdict": "autorise" | "limite" | "deconseille",
  "explanation": "Explication courte et bienveillante (max 150 caractères)",
  "nutrients_info": "Info nutritionnelle positive si autorisé (optionnel)",
  "alternatives": "Suggestions d'alternatives si déconseillé (optionnel)",
  "confidence": 0.0 à 1.0
}

CRITÈRES DE VERDICT:
- AUTORISÉ (autorise): Aliments sûrs et bénéfiques (fruits, légumes cuits, viandes bien cuites, etc.)
- LIMITÉ (limite): Consommation avec modération (caféine, certains poissons, charcuterie de qualité)
- DÉCONSEILLÉ (deconseille): Risques pour la grossesse (fromages au lait cru, poisson cru, alcool, certains charcuteries)

ALIMENTS À SURVEILLER:
- Fromages: lait cru = DÉCONSEILLÉ, pasteurisé = AUTORISÉ
- Poisson: cru/fumé = DÉCONSEILLÉ, bien cuit = AUTORISÉ (attention mercure)
- Viande: saignante = DÉCONSEILLÉ, bien cuite = AUTORISÉ
- Charcuterie: crue = DÉCONSEILLÉ, cuite (jambon blanc) = LIMITÉ
- Œufs: crus/mollets = DÉCONSEILLÉ, bien cuits = AUTORISÉ
- Alcool: TOUJOURS DÉCONSEILLÉ
- Café/Thé: LIMITÉ (max 200mg caféine/jour)

Sois bienveillante et rassurante dans tes explications. Utilise un ton maternel et encourageant."""

        try:
            user_text = "Analyse cet aliment pour une femme enceinte. Réponds UNIQUEMENT en JSON valide."
            if user_context:
                user_text += f"\nContexte: {user_context}"
            
            response = await chat_vision(
                system_message=system_message,
                user_text=user_text,
                image_base64=image_base64,
            )
            
            # Parser la réponse JSON
            result = self._parse_response(response)
            
            logger.info(f"[FoodScanner] Analyse: {result.food_name} -> {result.verdict}")
            return result
            
        except Exception as e:
            logger.error(f"[FoodScanner] Erreur analyse: {e}")
            # Retourner un résultat par défaut en cas d'erreur - marquer comme inconnu
            return FoodScanResult(
                food_name="Aliment non identifié",
                verdict=FoodSafetyVerdict.LIMITE,
                verdict_color="orange",
                explanation="Impossible d'analyser l'image. Vérifiez que la photo est nette et bien éclairée.",
                confidence=0.0,
                scanned_at=datetime.now(timezone.utc).isoformat(),
                is_unknown=True
            )
        finally:
            # Nettoyage mémoire après analyse
            gc.collect()
    
    def _parse_response(self, response: str) -> FoodScanResult:
        """Parse la réponse JSON de l'IA"""
        import json
        
        # Extraire le JSON de la réponse (peut être entouré de ```json```)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            data = json.loads(response)
        except json.JSONDecodeError:
            # Tenter de trouver le JSON dans la réponse
            import re
            json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
            else:
                raise ValueError("Impossible de parser la réponse JSON")
        
        # Mapper le verdict
        verdict_str = data.get("verdict", "limite").lower()
        if verdict_str in ["autorise", "autorisé", "safe", "ok"]:
            verdict = FoodSafetyVerdict.AUTORISE
            color = "green"
        elif verdict_str in ["deconseille", "déconseillé", "danger", "avoid"]:
            verdict = FoodSafetyVerdict.DECONSEILLE
            color = "red"
        else:
            verdict = FoodSafetyVerdict.LIMITE
            color = "orange"
        
        # Déterminer si l'aliment est inconnu (confiance faible ou nom générique)
        confidence = float(data.get("confidence", 0.8))
        food_name = data.get("food_name", "Aliment")
        is_unknown = (
            confidence < 0.5 or 
            food_name.lower() in ["aliment", "aliment non identifié", "inconnu", "unknown", "produit", "objet"]
        )
        
        return FoodScanResult(
            food_name=food_name,
            verdict=verdict,
            verdict_color=color,
            explanation=data.get("explanation", "Analyse effectuée."),
            nutrients_info=data.get("nutrients_info"),
            alternatives=data.get("alternatives"),
            confidence=confidence,
            scanned_at=datetime.now(timezone.utc).isoformat(),
            is_unknown=is_unknown
        )


# Instance globale
food_scanner = AIFoodScanner()
