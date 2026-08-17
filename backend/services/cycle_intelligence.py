"""
Cycle Intelligence Service - Agent IA pour l'analyse des cycles menstruels
Analyse l'historique des cycles pour détecter les irrégularités et calculer des prédictions personnalisées
"""
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional, Tuple
from statistics import mean, stdev
import math

from core.database import db


class CycleIntelligenceAgent:
    """Agent IA pour l'analyse intelligente des cycles menstruels"""
    
    # Constantes médicales
    MIN_CYCLE_LENGTH = 21
    MAX_CYCLE_LENGTH = 35
    NORMAL_CYCLE_LENGTH = 28
    LUTEAL_PHASE = 14  # Phase lutéale constante
    IRREGULARITY_THRESHOLD = 3  # Écart en jours pour détecter l'irrégularité
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.cycle_history: List[Dict] = []
        self.analysis_result: Optional[Dict] = None
    
    async def load_history(self) -> List[Dict]:
        """Charger l'historique des cycles depuis la base de données (6 derniers mois)"""
        six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
        
        try:
            cycles = await db.cycle_history.find({
                "user_id": self.user_id,
                "start_date": {"$gte": six_months_ago.isoformat()}
            }).sort("start_date", -1).to_list(12)
            self.cycle_history = cycles or []
        except Exception:
            import logging
            logging.getLogger("mamandouce.cycle").exception(
                "cycle_history read failed user_id=%s", self.user_id
            )
            self.cycle_history = []
        return self.cycle_history
    
    async def save_cycle(self, start_date: str, cycle_length: int, end_date: str = None) -> Dict:
        """Enregistrer un nouveau cycle dans l'historique"""
        cycle_entry = {
            "user_id": self.user_id,
            "start_date": start_date,
            "end_date": end_date,
            "cycle_length": cycle_length,
            "recorded_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Vérifier si ce cycle existe déjà
        existing = await db.cycle_history.find_one({
            "user_id": self.user_id,
            "start_date": start_date
        })
        
        if existing:
            await db.cycle_history.update_one(
                {"_id": existing["_id"]},
                {"$set": cycle_entry}
            )
        else:
            await db.cycle_history.insert_one(cycle_entry)
        
        return cycle_entry
    
    async def save_initial_dates(self, period_dates: List[str]) -> Dict:
        """
        Sauvegarder les dates initiales pour un nouvel utilisateur
        Calcule automatiquement les durées de cycles entre les dates
        """
        if len(period_dates) < 2:
            return {"error": "Au moins 2 dates sont nécessaires"}
        
        # Trier les dates
        sorted_dates = sorted(period_dates)
        cycles_saved = []
        
        for i in range(len(sorted_dates) - 1):
            start = datetime.fromisoformat(sorted_dates[i].replace('Z', '+00:00').replace('+00:00', ''))
            end = datetime.fromisoformat(sorted_dates[i + 1].replace('Z', '+00:00').replace('+00:00', ''))
            
            cycle_length = (end - start).days
            
            # Valider la durée
            if self.MIN_CYCLE_LENGTH <= cycle_length <= self.MAX_CYCLE_LENGTH:
                saved = await self.save_cycle(
                    start_date=sorted_dates[i],
                    cycle_length=cycle_length,
                    end_date=sorted_dates[i + 1]
                )
                cycles_saved.append(saved)
        
        # Recharger l'historique
        await self.load_history()
        
        return {
            "cycles_saved": len(cycles_saved),
            "dates_processed": len(period_dates)
        }
    
    def analyze_cycles(self) -> Dict:
        """
        Analyser l'historique des cycles pour détecter les patterns et irrégularités
        """
        if len(self.cycle_history) < 2:
            return {
                "has_enough_data": False,
                "message": "Pas assez de données pour l'analyse (minimum 2 cycles)",
                "recommended_cycle_length": self.NORMAL_CYCLE_LENGTH,
                "is_irregular": False
            }
        
        # Extraire les durées de cycles
        cycle_lengths = [c.get("cycle_length", self.NORMAL_CYCLE_LENGTH) for c in self.cycle_history]
        
        # Calculs statistiques
        avg_length = mean(cycle_lengths)
        
        # Écart-type (variation)
        if len(cycle_lengths) >= 2:
            variation = stdev(cycle_lengths) if len(cycle_lengths) > 1 else 0
        else:
            variation = 0
        
        # Détection d'irrégularité
        max_diff = 0
        for i in range(len(cycle_lengths) - 1):
            diff = abs(cycle_lengths[i] - cycle_lengths[i + 1])
            max_diff = max(max_diff, diff)
        
        is_irregular = max_diff > self.IRREGULARITY_THRESHOLD or variation > self.IRREGULARITY_THRESHOLD
        
        # Calculer la marge de sécurité pour les cycles irréguliers
        safety_margin = math.ceil(variation) if is_irregular else 0
        
        # Calculer le pourcentage de régularité (comparé à la moyenne)
        regularity_score = max(0, 100 - (variation / avg_length * 100)) if avg_length > 0 else 100
        
        # Durée recommandée (arrondie)
        recommended_length = round(avg_length)
        recommended_length = max(self.MIN_CYCLE_LENGTH, min(self.MAX_CYCLE_LENGTH, recommended_length))
        
        self.analysis_result = {
            "has_enough_data": True,
            "cycle_count": len(cycle_lengths),
            "average_length": round(avg_length, 1),
            "recommended_cycle_length": recommended_length,
            "variation_days": round(variation, 1),
            "max_difference": max_diff,
            "is_irregular": is_irregular,
            "safety_margin": safety_margin,
            "regularity_score": round(regularity_score, 1),
            "shortest_cycle": min(cycle_lengths),
            "longest_cycle": max(cycle_lengths),
            "cycle_lengths": cycle_lengths
        }
        
        return self.analysis_result
    
    def calculate_dates_with_ranges(self, last_period_date: str) -> Dict:
        """
        Calculer toutes les dates importantes avec des plages pour les cycles irréguliers
        """
        if not self.analysis_result:
            self.analyze_cycles()
        
        analysis = self.analysis_result or {}
        cycle_length = analysis.get("recommended_cycle_length", self.NORMAL_CYCLE_LENGTH)
        is_irregular = analysis.get("is_irregular", False)
        safety_margin = analysis.get("safety_margin", 0)
        
        # Parser la date
        try:
            last_period = datetime.fromisoformat(last_period_date.replace('Z', '+00:00').replace('+00:00', ''))
        except:
            last_period = datetime.strptime(last_period_date[:10], "%Y-%m-%d")
        
        # Calculs de base
        ovulation_day = cycle_length - self.LUTEAL_PHASE
        ovulation_date = last_period + timedelta(days=ovulation_day)
        
        # Fenêtre fertile
        fertile_start = ovulation_date - timedelta(days=5)
        fertile_end = ovulation_date + timedelta(days=1)
        
        # Nidation (implantation)
        implantation_start = ovulation_date + timedelta(days=6)
        implantation_end = ovulation_date + timedelta(days=12)
        
        # Prochaines règles
        next_period = last_period + timedelta(days=cycle_length)
        
        # Date test de grossesse
        test_date = next_period + timedelta(days=1)
        
        # Si cycle irrégulier, ajouter des plages
        if is_irregular and safety_margin > 0:
            result = {
                "is_range": True,
                "safety_margin": safety_margin,
                "ovulation": {
                    "start": (ovulation_date - timedelta(days=safety_margin)).isoformat(),
                    "end": (ovulation_date + timedelta(days=safety_margin)).isoformat(),
                    "most_likely": ovulation_date.isoformat()
                },
                "fertile_window": {
                    "start": (fertile_start - timedelta(days=safety_margin)).isoformat(),
                    "end": (fertile_end + timedelta(days=safety_margin)).isoformat()
                },
                "next_period": {
                    "start": (next_period - timedelta(days=safety_margin)).isoformat(),
                    "end": (next_period + timedelta(days=safety_margin)).isoformat(),
                    "most_likely": next_period.isoformat()
                },
                "implantation": {
                    "start": implantation_start.isoformat(),
                    "end": implantation_end.isoformat()
                },
                "test_date": {
                    "start": (test_date - timedelta(days=safety_margin)).isoformat(),
                    "end": (test_date + timedelta(days=safety_margin)).isoformat(),
                    "recommended": (test_date + timedelta(days=safety_margin)).isoformat()
                }
            }
        else:
            result = {
                "is_range": False,
                "safety_margin": 0,
                "ovulation": {
                    "date": ovulation_date.isoformat()
                },
                "fertile_window": {
                    "start": fertile_start.isoformat(),
                    "end": fertile_end.isoformat()
                },
                "next_period": {
                    "date": next_period.isoformat()
                },
                "implantation": {
                    "start": implantation_start.isoformat(),
                    "end": implantation_end.isoformat()
                },
                "test_date": {
                    "date": test_date.isoformat()
                }
            }
        
        return result
    
    def generate_cycle_report(self, current_cycle_length: int = None) -> Dict:
        """
        Générer un rapport de fin de cycle
        Compare le cycle actuel avec l'historique
        """
        if not self.analysis_result:
            self.analyze_cycles()
        
        analysis = self.analysis_result or {}
        
        if not analysis.get("has_enough_data"):
            return {
                "has_report": False,
                "message": "Pas assez de données pour générer un rapport"
            }
        
        avg_length = analysis.get("average_length", 28)
        variation = analysis.get("variation_days", 0)
        regularity_score = analysis.get("regularity_score", 100)
        
        # Si on a la durée du cycle actuel, calculer la différence
        if current_cycle_length:
            diff_from_avg = current_cycle_length - avg_length
            
            # Calculer l'amélioration de régularité
            # Si le cycle actuel est plus proche de la moyenne que la variation habituelle
            if abs(diff_from_avg) < variation:
                improvement = round((1 - abs(diff_from_avg) / max(variation, 1)) * 15, 1)
            else:
                improvement = -round((abs(diff_from_avg) - variation) / max(variation, 1) * 10, 1)
        else:
            diff_from_avg = 0
            improvement = 0
        
        # Générer le message du rapport
        if regularity_score >= 90:
            status = "excellent"
            status_emoji = "🌟"
            status_message = "Votre cycle est très régulier"
        elif regularity_score >= 75:
            status = "good"
            status_emoji = "✨"
            status_message = "Votre cycle est régulier"
        elif regularity_score >= 60:
            status = "moderate"
            status_emoji = "📊"
            status_message = "Votre cycle présente quelques variations"
        else:
            status = "irregular"
            status_emoji = "🔄"
            status_message = "Votre cycle est irrégulier"
        
        return {
            "has_report": True,
            "status": status,
            "status_emoji": status_emoji,
            "status_message": status_message,
            "average_length": round(avg_length),
            "variation_days": round(variation, 1),
            "regularity_score": regularity_score,
            "improvement_percentage": improvement,
            "improvement_message": f"{'Amélioration' if improvement > 0 else 'Variation'} de {abs(improvement)}% ce mois-ci" if improvement != 0 else "Stable ce mois-ci",
            "cycle_count": analysis.get("cycle_count", 0),
            "recommendation": self._get_recommendation(regularity_score, variation)
        }
    
    def _get_recommendation(self, regularity_score: float, variation: float) -> str:
        """Générer une recommandation personnalisée"""
        if regularity_score >= 85:
            return "Continuez à noter vos cycles, votre régularité est excellente !"
        elif regularity_score >= 70:
            return "Pensez à noter vos symptômes quotidiens pour affiner les prédictions."
        elif regularity_score >= 50:
            return "Les variations sont normales. L'IA ajuste automatiquement vos fenêtres de fertilité."
        else:
            return "Consultez un professionnel de santé si vos cycles sont très irréguliers."


async def get_cycle_intelligence(user_id: str) -> CycleIntelligenceAgent:
    """Factory function pour obtenir un agent d'intelligence de cycle"""
    agent = CycleIntelligenceAgent(user_id)
    await agent.load_history()
    return agent
