"""
AI Food Scanner Service - Analyse d'images alimentaires pour femmes enceintes.

Option A : passerelle Noyau N2 (`N2_OCR_BASE_URL`, défaut api.neriacorp.com).
OPENAI_API_KEY optionnelle — fallback uniquement si le Worker est désactivé.
"""
import gc
import json
import logging
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel
from enum import Enum
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class FoodSafetyVerdict(str, Enum):
    AUTORISE = "autorise"
    LIMITE = "limite"
    DECONSEILLE = "deconseille"


class FoodScanResult(BaseModel):
    """Résultat de l'analyse alimentaire"""
    food_name: str
    verdict: FoodSafetyVerdict
    verdict_color: str
    explanation: str
    nutrients_info: Optional[str] = None
    alternatives: Optional[str] = None
    confidence: float = 0.0
    scanned_at: str
    is_unknown: bool = False


class AIFoodScanner:
    """Scanner alimentaire via Worker N2 (Option A) ou GPT-4o Vision en repli."""

    async def analyze_food_image(self, image_base64: str, user_context: Optional[str] = None) -> FoodScanResult:
        from integrations.neriacorp.scanner_adapter import analyze_food

        try:
            payload = await analyze_food(image_base64=image_base64, user_context=user_context)
            result = self._from_payload(payload)
            logger.info("[FoodScanner] Analyse: %s -> %s", result.food_name, result.verdict)
            return result
        except Exception as e:
            logger.error("[FoodScanner] Erreur analyse: %s", e)
            return FoodScanResult(
                food_name="Aliment non identifié",
                verdict=FoodSafetyVerdict.LIMITE,
                verdict_color="orange",
                explanation="Impossible d'analyser l'image. Vérifiez que la photo est nette et bien éclairée.",
                confidence=0.0,
                scanned_at=datetime.now(timezone.utc).isoformat(),
                is_unknown=True,
            )
        finally:
            gc.collect()

    def _from_payload(self, data) -> FoodScanResult:
        if isinstance(data, str):
            data = self._parse_json_string(data)
        if not isinstance(data, dict):
            raise ValueError("Réponse scanner invalide")

        verdict_str = str(data.get("verdict", "limite")).lower()
        if verdict_str in ["autorise", "autorisé", "safe", "ok"]:
            verdict = FoodSafetyVerdict.AUTORISE
            color = "green"
        elif verdict_str in ["deconseille", "déconseillé", "danger", "avoid"]:
            verdict = FoodSafetyVerdict.DECONSEILLE
            color = "red"
        else:
            verdict = FoodSafetyVerdict.LIMITE
            color = "orange"

        confidence = float(data.get("confidence", 0.8) or 0.8)
        food_name = data.get("food_name", "Aliment")
        is_unknown = (
            confidence < 0.5
            or food_name.lower()
            in ["aliment", "aliment non identifié", "inconnu", "unknown", "produit", "objet"]
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
            is_unknown=is_unknown,
        )

    def _parse_json_string(self, response: str) -> dict:
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re

            json_match = re.search(r"\{[^{}]*\}", response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            raise ValueError("Impossible de parser la réponse JSON")


food_scanner = AIFoodScanner()
