"""
AI Food Scanner — Gemini Vision (Aevis) + moteur local de compatibilité grossesse.

Seul secret requis : GEMINI_API_KEY (+ GEMINI_VISION_MODEL optionnel).
"""
import gc
import json
import logging
import re
import unicodedata
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
    ingredients: Optional[str] = None
    packaging_text: Optional[str] = None
    confidence: float = 0.0
    scanned_at: str
    is_unknown: bool = False
    safe_for_pregnancy: str = "caution"
    analysis_source: str = "ai"
    can_contribute: bool = False


class AIFoodScanner:
    """Scanner alimentaire : Gemini Vision puis base grossesse MamanDouce."""

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
                safe_for_pregnancy="caution",
                analysis_source="fallback",
                can_contribute=True,
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
            safety_status = "safe"
        elif verdict_str in ["deconseille", "déconseillé", "danger", "avoid"]:
            verdict = FoodSafetyVerdict.DECONSEILLE
            color = "red"
            safety_status = "unsafe"
        else:
            verdict = FoodSafetyVerdict.LIMITE
            color = "orange"
            safety_status = "caution"

        confidence = float(data.get("confidence", 0.8) or 0.8)
        food_name = str(data.get("food_name") or "Aliment")
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
            ingredients=data.get("ingredients"),
            packaging_text=data.get("packaging_text"),
            confidence=confidence,
            scanned_at=datetime.now(timezone.utc).isoformat(),
            is_unknown=is_unknown,
            safe_for_pregnancy=safety_status,
            analysis_source="vision_ai",
            can_contribute=is_unknown,
        )

    async def analyze_food_text(
        self,
        food_name: str,
        ingredients: Optional[str] = None,
    ) -> FoodScanResult:
        """Conservative text fallback: always returns a useful verdict, never unknown."""
        from data.food_database import FOOD_SAFETY_DATABASE

        name = str(food_name or "Aliment à identifier").strip()
        composition = str(ingredients or "").strip()
        normalized = self._normalize_text(f"{name} {composition}")

        # Reuse the curated fixture first.
        for key, food in FOOD_SAFETY_DATABASE.items():
            known_name = self._normalize_text(food.get("name"))
            if (
                self._normalize_text(name) == self._normalize_text(key)
                or self._normalize_text(name) == known_name
            ):
                return self._from_known_food(food)

        unsafe_terms = (
            "alcool", "vin", "biere", "rhum", "vodka", "whisky",
            "lait cru", "fromage cru", "viande crue", "poisson cru",
            "tartare", "carpaccio", "sushi", "sashimi", "oeuf cru",
            "non pasteurise", "charcuterie artisanale crue",
        )
        caution_terms = (
            "cafe", "cafeine", "the", "soja", "tofu", "thon",
            "mercure", "foie", "fumee", "fume", "edulcorant",
            "boisson energisante", "reglisse", "sel",
        )
        safe_terms = (
            "fruit", "legume", "cereale", "pain", "pates", "riz",
            "lentille", "haricot", "pois chiche", "eau", "pasteurise",
            "bien cuit", "compote", "conserve", "avoine",
        )

        if any(self._contains_term(normalized, term) for term in unsafe_terms):
            verdict = FoodSafetyVerdict.DECONSEILLE
            status = "unsafe"
            color = "red"
            explanation = (
                "Interdit pendant la grossesse : la composition évoque un produit "
                "cru, non pasteurisé ou alcoolisé présentant un risque infectieux."
            )
        elif any(self._contains_term(normalized, term) for term in caution_terms):
            verdict = FoodSafetyVerdict.LIMITE
            status = "caution"
            color = "orange"
            explanation = (
                "À consommer avec précaution : limiter la quantité et vérifier "
                "la cuisson, la teneur en caféine, sel ou mercure."
            )
        elif any(self._contains_term(normalized, term) for term in safe_terms):
            verdict = FoodSafetyVerdict.AUTORISE
            status = "safe"
            color = "green"
            explanation = (
                "Autorisé pendant la grossesse avec les règles d'hygiène usuelles : "
                "bien laver, conserver au frais et cuire si nécessaire."
            )
        else:
            verdict = FoodSafetyVerdict.LIMITE
            status = "caution"
            color = "orange"
            explanation = (
                "Analyse conservatrice : aucun risque majeur n'a été identifié, "
                "mais la composition doit être vérifiée avant consommation régulière."
            )

        return FoodScanResult(
            food_name=name,
            verdict=verdict,
            verdict_color=color,
            explanation=explanation,
            ingredients=composition or None,
            confidence=0.65,
            scanned_at=datetime.now(timezone.utc).isoformat(),
            is_unknown=True,
            safe_for_pregnancy=status,
            analysis_source="text_fallback",
            can_contribute=True,
        )

    @staticmethod
    def _normalize_text(value: Optional[str]) -> str:
        raw = unicodedata.normalize("NFKD", str(value or ""))
        raw = "".join(char for char in raw if not unicodedata.combining(char))
        return re.sub(r"\s+", " ", raw.lower()).strip()

    @staticmethod
    def _contains_term(text: str, term: str) -> bool:
        return bool(
            re.search(
                rf"(?<!\w){re.escape(term.strip())}(?!\w)",
                text,
            )
        )

    def _from_known_food(self, food: dict) -> FoodScanResult:
        status = str(food.get("safe_for_pregnancy") or "caution")
        verdict_map = {
            "safe": (FoodSafetyVerdict.AUTORISE, "green"),
            "unsafe": (FoodSafetyVerdict.DECONSEILLE, "red"),
            "avoid": (FoodSafetyVerdict.DECONSEILLE, "red"),
            "caution": (FoodSafetyVerdict.LIMITE, "orange"),
        }
        verdict, color = verdict_map.get(
            status, (FoodSafetyVerdict.LIMITE, "orange")
        )
        return FoodScanResult(
            food_name=str(food.get("name") or "Aliment"),
            verdict=verdict,
            verdict_color=color,
            explanation=str(food.get("reason") or "Analyse effectuée."),
            confidence=1.0,
            scanned_at=datetime.now(timezone.utc).isoformat(),
            is_unknown=False,
            safe_for_pregnancy=status,
            analysis_source="curated_database",
            can_contribute=False,
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
