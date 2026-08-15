"""
Guardian Agent - Service de surveillance 24h/24 pour Maman Douce
Version 3.0 - Stratégie "Zéro Bruit" & Journal de Bord Admin

Fonctionnalités:
- Journal de Bord: Rapports stockés en DB (pas d'emails)
- Stratégie Zéro Bruit: Emails UNIQUEMENT pour pannes critiques
- Optimisation RAM: Limite de 10 rapports en historique
- Codes couleurs: Vert (OK), Orange (Dégradé), Rouge (Down)
"""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional, List
from collections import defaultdict
import logging
import httpx
import os

from models.guardian import (
    IncidentLog, IncidentSeverity, IncidentStatus, ComponentType,
    HealthStatus, ComponentHealth, SystemHealthReport, GuardianStats, AlertConfig
)
from core.config import app_public_url, email_brand_footer

logger = logging.getLogger(__name__)

# Configuration par défaut
DEFAULT_CONFIG = AlertConfig(
    admin_email="cyrilalepsa@gmail.com",
    max_repair_attempts=3,
    check_interval_minutes=5,
    alert_on_warning=False,
    alert_on_critical=True
)

# URL du dashboard admin (FRONTEND_URL / PUBLIC_APP_URL, sinon mamandouce.neriacorp.com)
ADMIN_DASHBOARD_URL = os.environ.get("ADMIN_DASHBOARD_URL") or f"{app_public_url()}/admin"

# ============================================================================
# STRATÉGIE "ZÉRO BRUIT" - CONFIGURATION
# ============================================================================

# Emails UNIQUEMENT pour ces composants ET si totalement DOWN
CRITICAL_EMAIL_COMPONENTS = {
    ComponentType.API_SERVER,      # Crash serveur complet
    ComponentType.DATABASE,        # Base de données inaccessible
    ComponentType.STRIPE,          # Paiements impossibles
}

# Debounce: éviter le spam d'emails
DEBOUNCE_WINDOW_SECONDS = 300     # 5 minutes entre emails pour même composant
DEBOUNCE_THRESHOLD = 3            # 3 échecs consécutifs avant email

# Journal de Bord: Nombre max de rapports en DB
MAX_HEALTH_REPORTS = 10           # Garder seulement les 10 derniers rapports

# Intervalle de nettoyage des vieux rapports
CLEANUP_OLD_REPORTS_DAYS = 7      # Supprimer les rapports > 7 jours


class GuardianAgent:
    """Agent de surveillance - Version 3.0 Zéro Bruit"""
    
    def __init__(self, config: AlertConfig = DEFAULT_CONFIG):
        self.config = config
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self._component_status: Dict[ComponentType, ComponentHealth] = {}
        self._last_check_time: Optional[datetime] = None
        
        # Debounce tracking
        self._consecutive_failures: Dict[ComponentType, int] = defaultdict(int)
        self._last_email_sent: Dict[ComponentType, datetime] = {}
        
        # Stats session
        self._session_stats = {
            "checks_performed": 0,
            "incidents_detected": 0,
            "auto_repairs_success": 0,
            "auto_repairs_failed": 0,
            "emails_sent": 0,
            "emails_blocked": 0,  # Bloqués par Zéro Bruit
        }
        
    async def start(self):
        """Démarrer l'agent de surveillance"""
        if self.is_running:
            logger.warning("[Guardian] Agent already running")
            return
            
        self.is_running = True
        self._task = asyncio.create_task(self._monitoring_loop())
        
        logger.info("=" * 60)
        logger.info("[Guardian] 🛡️ GARDIEN MAMAN DOUCE v3.0 - ZÉRO BRUIT")
        logger.info(f"[Guardian] 📊 Surveillance toutes les {self.config.check_interval_minutes} min")
        logger.info(f"[Guardian] 📧 Emails critiques: {[c.value for c in CRITICAL_EMAIL_COMPONENTS]}")
        logger.info(f"[Guardian] 📝 Journal de Bord: {MAX_HEALTH_REPORTS} rapports max")
        logger.info("[Guardian] 🔇 Mode Zéro Bruit: Aucun email pour succès/routine")
        logger.info("=" * 60)
        
    async def stop(self):
        """Arrêter l'agent de surveillance"""
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("[Guardian] 🛡️ Gardien arrêté")
        
    async def _monitoring_loop(self):
        """Boucle principale de surveillance"""
        while self.is_running:
            try:
                await self._perform_health_checks()
                self._last_check_time = datetime.now(timezone.utc)
                self._session_stats["checks_performed"] += 1
            except Exception as e:
                logger.error(f"[Guardian] Erreur surveillance: {e}")
            
            await asyncio.sleep(self.config.check_interval_minutes * 60)
    
    async def _perform_health_checks(self):
        """Effectuer les vérifications et sauvegarder dans le Journal de Bord"""
        from core.database import db
        
        logger.info("[Guardian] 🔍 Vérification de santé...")
        
        checks = [
            self._check_api_server(),
            self._check_database(),
            self._check_stripe(),
            self._check_food_scanner(),
            self._check_cycle_tracking(),
            self._check_email_service(),
        ]
        
        results = await asyncio.gather(*checks, return_exceptions=True)
        
        # Collecter les résultats
        components_health = []
        healthy_count = 0
        degraded_count = 0
        down_count = 0
        
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"[Guardian] ❌ Erreur check: {result}")
            elif isinstance(result, ComponentHealth):
                self._component_status[result.component] = result
                components_health.append(result.dict())
                
                if result.status == HealthStatus.HEALTHY:
                    healthy_count += 1
                    self._consecutive_failures[result.component] = 0  # Reset
                elif result.status == HealthStatus.DEGRADED:
                    degraded_count += 1
                    await self._handle_degraded(result)
                elif result.status == HealthStatus.DOWN:
                    down_count += 1
                    await self._handle_failure(result)
        
        # Déterminer le statut global
        if down_count > 0:
            overall_status = "down"
            overall_color = "red"
        elif degraded_count > 0:
            overall_status = "degraded"
            overall_color = "orange"
        else:
            overall_status = "healthy"
            overall_color = "green"
        
        # Récupérer les stats mémoire
        memory_stats = await self._get_memory_stats()
        
        # === JOURNAL DE BORD: Sauvegarder le rapport en DB ===
        health_report = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "overall_status": overall_status,
            "overall_color": overall_color,
            "components": components_health,
            "summary": {
                "healthy": healthy_count,
                "degraded": degraded_count,
                "down": down_count
            },
            "memory": memory_stats,
            "session_stats": self._session_stats.copy()
        }
        
        await db.health_reports.insert_one(health_report)
        
        # Nettoyer les vieux rapports (garder seulement MAX_HEALTH_REPORTS)
        await self._cleanup_old_reports()
        
        # Log résumé
        logger.info(f"[Guardian] 📊 {overall_color.upper()}: ✅{healthy_count} ⚠️{degraded_count} ❌{down_count}")
    
    async def _cleanup_old_reports(self):
        """Nettoyer les vieux rapports pour optimiser la RAM"""
        from core.database import db
        
        try:
            # Compter les rapports
            count = await db.health_reports.count_documents({})
            
            if count > MAX_HEALTH_REPORTS:
                # Garder seulement les MAX_HEALTH_REPORTS plus récents
                excess = count - MAX_HEALTH_REPORTS
                
                # Trouver les plus anciens
                old_reports = await db.health_reports.find(
                    {}, {"_id": 1}
                ).sort("timestamp", 1).limit(excess).to_list(excess)
                
                if old_reports:
                    old_ids = [r["_id"] for r in old_reports]
                    await db.health_reports.delete_many({"_id": {"$in": old_ids}})
                    logger.debug(f"[Guardian] 🗑️ {len(old_ids)} vieux rapports supprimés")
            
            # Supprimer aussi les rapports > 7 jours
            cutoff = (datetime.now(timezone.utc) - timedelta(days=CLEANUP_OLD_REPORTS_DAYS)).isoformat()
            result = await db.health_reports.delete_many({"timestamp": {"$lt": cutoff}})
            if result.deleted_count > 0:
                logger.debug(f"[Guardian] 🗑️ {result.deleted_count} rapports > {CLEANUP_OLD_REPORTS_DAYS}j supprimés")
                
        except Exception as e:
            logger.error(f"[Guardian] Erreur nettoyage rapports: {e}")
    
    async def _get_memory_stats(self) -> dict:
        """Obtenir les statistiques mémoire"""
        try:
            import resource
            usage = resource.getrusage(resource.RUSAGE_SELF)
            mem_mb = usage.ru_maxrss / 1024
            
            return {
                "ram_mb": round(mem_mb, 1),
                "status": "green" if mem_mb < 300 else ("orange" if mem_mb < 450 else "red")
            }
        except:
            return {"ram_mb": 0, "status": "unknown"}
    
    # =========================================================================
    # STRATÉGIE ZÉRO BRUIT - GESTION DES INCIDENTS
    # =========================================================================
    
    def _should_send_critical_email(self, component: ComponentType) -> bool:
        """
        Vérifie si un email CRITIQUE doit être envoyé.
        Conditions:
        1. Le composant est dans la liste critique
        2. Assez d'échecs consécutifs (debounce)
        3. Pas d'email récent pour ce composant
        """
        # 1. Composant critique?
        if component not in CRITICAL_EMAIL_COMPONENTS:
            self._session_stats["emails_blocked"] += 1
            logger.info(f"[Guardian] 🔇 Email bloqué: {component.value} non critique")
            return False
        
        # 2. Assez d'échecs consécutifs?
        self._consecutive_failures[component] += 1
        if self._consecutive_failures[component] < DEBOUNCE_THRESHOLD:
            self._session_stats["emails_blocked"] += 1
            logger.info(f"[Guardian] 🔇 Email différé: {component.value} ({self._consecutive_failures[component]}/{DEBOUNCE_THRESHOLD})")
            return False
        
        # 3. Email récent?
        now = datetime.now(timezone.utc)
        if component in self._last_email_sent:
            elapsed = (now - self._last_email_sent[component]).total_seconds()
            if elapsed < DEBOUNCE_WINDOW_SECONDS:
                self._session_stats["emails_blocked"] += 1
                logger.info(f"[Guardian] 🔇 Email cooldown: {component.value} ({int(elapsed)}s/{DEBOUNCE_WINDOW_SECONDS}s)")
                return False
        
        # OK, envoyer l'email
        self._last_email_sent[component] = now
        return True
    
    async def _handle_degraded(self, health: ComponentHealth):
        """Gérer un composant dégradé - LOG INTERNE UNIQUEMENT"""
        from core.database import db
        
        incident = IncidentLog(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc).isoformat(),
            component=health.component,
            severity=IncidentSeverity.WARNING,
            status=IncidentStatus.DETECTED,
            description=f"{health.component.value} dégradé",
            error_details=health.error_message,
            auto_repair_attempted=False,
            auto_repair_success=False,
            repair_attempts=0
        )
        
        await db.guardian_incidents.insert_one(incident.dict())
        
        # LOG uniquement - PAS D'EMAIL (Zéro Bruit)
        logger.info(f"[Guardian] ⚠️ Dégradation: {health.component.value} (log only)")
    
    async def _handle_failure(self, health: ComponentHealth):
        """Gérer une panne de composant"""
        from core.database import db
        
        self._session_stats["incidents_detected"] += 1
        
        incident = IncidentLog(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc).isoformat(),
            component=health.component,
            severity=IncidentSeverity.CRITICAL,
            status=IncidentStatus.DETECTED,
            description=f"{health.component.value} en panne",
            error_details=health.error_message,
            auto_repair_attempted=False,
            auto_repair_success=False,
            repair_attempts=0
        )
        
        await db.guardian_incidents.insert_one(incident.dict())
        logger.warning(f"[Guardian] 🚨 PANNE: {health.component.value}")
        
        await self._attempt_auto_repair(incident)
    
    async def _attempt_auto_repair(self, incident: IncidentLog):
        """Tenter une réparation automatique"""
        from core.database import db
        
        for attempt in range(1, self.config.max_repair_attempts + 1):
            logger.info(f"[Guardian] 🔧 Réparation {attempt}/{self.config.max_repair_attempts}: {incident.component.value}")
            
            await db.guardian_incidents.update_one(
                {"id": incident.id},
                {"$set": {
                    "status": IncidentStatus.AUTO_REPAIR_ATTEMPTED.value,
                    "auto_repair_attempted": True,
                    "repair_attempts": attempt
                }}
            )
            
            success = await self._do_repair(incident.component)
            
            if success:
                await db.guardian_incidents.update_one(
                    {"id": incident.id},
                    {"$set": {
                        "status": IncidentStatus.AUTO_REPAIR_SUCCESS.value,
                        "auto_repair_success": True,
                        "resolved_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                logger.info(f"[Guardian] ✅ Réparation réussie: {incident.component.value}")
                self._session_stats["auto_repairs_success"] += 1
                self._consecutive_failures[incident.component] = 0  # Reset
                return
            
            await asyncio.sleep(10)
        
        # Échec total
        await db.guardian_incidents.update_one(
            {"id": incident.id},
            {"$set": {"status": IncidentStatus.ESCALATED.value, "auto_repair_success": False}}
        )
        
        self._session_stats["auto_repairs_failed"] += 1
        logger.error(f"[Guardian] ❌ Échec réparation: {incident.component.value}")
        
        # === STRATÉGIE ZÉRO BRUIT: Vérifier si email autorisé ===
        if self._should_send_critical_email(incident.component):
            await self._send_critical_alert(incident)
    
    async def _do_repair(self, component: ComponentType) -> bool:
        """Effectuer la réparation pour un composant"""
        try:
            if component == ComponentType.DATABASE:
                from core.database import client
                await client.admin.command('ping')
                return True
            elif component == ComponentType.API_SERVER:
                return False  # Nécessite restart externe
            elif component in [ComponentType.FOOD_SCANNER, ComponentType.CYCLE_TRACKING]:
                await asyncio.sleep(5)
                if component == ComponentType.FOOD_SCANNER:
                    check = await self._check_food_scanner()
                else:
                    check = await self._check_cycle_tracking()
                return check.status == HealthStatus.HEALTHY
            elif component == ComponentType.STRIPE:
                check = await self._check_stripe()
                return check.status == HealthStatus.HEALTHY
            elif component == ComponentType.EMAIL_SERVICE:
                check = await self._check_email_service()
                return check.status == HealthStatus.HEALTHY
            return False
        except Exception as e:
            logger.error(f"[Guardian] Erreur réparation: {e}")
            return False
    
    # =========================================================================
    # HEALTH CHECKS
    # =========================================================================
    
    async def _check_api_server(self) -> ComponentHealth:
        start_time = datetime.now()
        port = os.environ.get('PORT', '8001')
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"http://localhost:{port}/api/health")
                response_time = (datetime.now() - start_time).total_seconds() * 1000
                if response.status_code == 200:
                    return ComponentHealth(
                        component=ComponentType.API_SERVER, status=HealthStatus.HEALTHY,
                        last_check=datetime.now(timezone.utc).isoformat(), response_time_ms=response_time)
                else:
                    return ComponentHealth(
                        component=ComponentType.API_SERVER, status=HealthStatus.DEGRADED,
                        last_check=datetime.now(timezone.utc).isoformat(), response_time_ms=response_time,
                        error_message=f"Status: {response.status_code}")
        except Exception as e:
            return ComponentHealth(
                component=ComponentType.API_SERVER, status=HealthStatus.DOWN,
                last_check=datetime.now(timezone.utc).isoformat(), error_message=str(e))
    
    async def _check_database(self) -> ComponentHealth:
        from core.database import client
        start_time = datetime.now()
        try:
            await client.admin.command('ping')
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            return ComponentHealth(
                component=ComponentType.DATABASE, status=HealthStatus.HEALTHY,
                last_check=datetime.now(timezone.utc).isoformat(), response_time_ms=response_time)
        except Exception as e:
            return ComponentHealth(
                component=ComponentType.DATABASE, status=HealthStatus.DOWN,
                last_check=datetime.now(timezone.utc).isoformat(), error_message=str(e))
    
    async def _check_stripe(self) -> ComponentHealth:
        start_time = datetime.now()
        stripe_key = os.environ.get('STRIPE_SECRET_KEY')
        if not stripe_key:
            return ComponentHealth(
                component=ComponentType.STRIPE, status=HealthStatus.HEALTHY,
                last_check=datetime.now(timezone.utc).isoformat(), error_message="Non configuré")
        try:
            import stripe
            stripe.api_key = stripe_key
            await asyncio.get_event_loop().run_in_executor(None, stripe.Balance.retrieve)
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            return ComponentHealth(
                component=ComponentType.STRIPE, status=HealthStatus.HEALTHY,
                last_check=datetime.now(timezone.utc).isoformat(), response_time_ms=response_time)
        except Exception as e:
            return ComponentHealth(
                component=ComponentType.STRIPE, status=HealthStatus.DOWN,
                last_check=datetime.now(timezone.utc).isoformat(), error_message=str(e))
    
    async def _check_food_scanner(self) -> ComponentHealth:
        start_time = datetime.now()
        port = os.environ.get('PORT', '8001')
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"http://localhost:{port}/api/food/library")
                response_time = (datetime.now() - start_time).total_seconds() * 1000
                if response.status_code in [200, 401, 403, 404]:
                    return ComponentHealth(
                        component=ComponentType.FOOD_SCANNER, status=HealthStatus.HEALTHY,
                        last_check=datetime.now(timezone.utc).isoformat(), response_time_ms=response_time)
                else:
                    return ComponentHealth(
                        component=ComponentType.FOOD_SCANNER, status=HealthStatus.DEGRADED,
                        last_check=datetime.now(timezone.utc).isoformat(), response_time_ms=response_time,
                        error_message=f"Status: {response.status_code}")
        except Exception as e:
            return ComponentHealth(
                component=ComponentType.FOOD_SCANNER, status=HealthStatus.DOWN,
                last_check=datetime.now(timezone.utc).isoformat(), error_message=str(e))
    
    async def _check_cycle_tracking(self) -> ComponentHealth:
        start_time = datetime.now()
        port = os.environ.get('PORT', '8001')
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"http://localhost:{port}/api/pregnancy/profile")
                response_time = (datetime.now() - start_time).total_seconds() * 1000
                if response.status_code in [200, 401, 403, 404]:
                    return ComponentHealth(
                        component=ComponentType.CYCLE_TRACKING, status=HealthStatus.HEALTHY,
                        last_check=datetime.now(timezone.utc).isoformat(), response_time_ms=response_time)
                else:
                    return ComponentHealth(
                        component=ComponentType.CYCLE_TRACKING, status=HealthStatus.DEGRADED,
                        last_check=datetime.now(timezone.utc).isoformat(), response_time_ms=response_time,
                        error_message=f"Status: {response.status_code}")
        except Exception as e:
            return ComponentHealth(
                component=ComponentType.CYCLE_TRACKING, status=HealthStatus.DOWN,
                last_check=datetime.now(timezone.utc).isoformat(), error_message=str(e))
    
    async def _check_email_service(self) -> ComponentHealth:
        resend_key = os.environ.get('RESEND_API_KEY')
        if not resend_key:
            return ComponentHealth(
                component=ComponentType.EMAIL_SERVICE, status=HealthStatus.DEGRADED,
                last_check=datetime.now(timezone.utc).isoformat(), error_message="Non configuré")
        return ComponentHealth(
            component=ComponentType.EMAIL_SERVICE, status=HealthStatus.HEALTHY,
            last_check=datetime.now(timezone.utc).isoformat())
    
    # =========================================================================
    # ALERTE EMAIL CRITIQUE (Zéro Bruit)
    # =========================================================================
    
    async def _send_critical_alert(self, incident: IncidentLog):
        """Envoyer une ALERTE ROUGE - Uniquement pour pannes totales"""
        from core.database import db
        from core.config import RESEND_API_KEY, SENDER_EMAIL
        
        try:
            import resend
            if not RESEND_API_KEY:
                logger.error("[Guardian] ❌ RESEND_API_KEY manquante")
                return
            
            resend.api_key = RESEND_API_KEY
            now = datetime.now(timezone.utc)
            
            # Actions recommandées
            troubleshooting = self._get_troubleshooting_steps(incident.component)
            
            resend.Emails.send({
                "from": f"ALERTE MAMAN DOUCE <{SENDER_EMAIL}>",
                "to": [self.config.admin_email],
                "subject": f"[ALERTE ROUGE - MAMAN DOUCE] {incident.component.value} HORS SERVICE",
                "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#1a1a1a;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
<tr><td align="center" style="background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);padding:40px 20px;border-radius:20px 20px 0 0;">
<h1 style="color:#fff;margin:0;font-size:28px;">🚨 ALERTE ROUGE</h1>
<p style="color:#fecaca;margin:10px 0 0 0;font-size:18px;">Service Interrompu - Intervention Requise</p>
</td></tr>
<tr><td style="background:#fff;padding:40px 30px;border-radius:0 0 20px 20px;">

<div style="background:#fef2f2;border:2px solid #dc2626;border-radius:12px;padding:20px;margin-bottom:25px;">
<h2 style="color:#991b1b;margin:0 0 15px 0;font-size:20px;">🔴 {incident.component.value.upper()}</h2>
<table style="width:100%;">
<tr><td style="padding:8px 0;color:#64748b;">Détecté</td><td style="color:#334155;font-weight:bold;">{incident.timestamp[:19].replace('T', ' ')} UTC</td></tr>
<tr><td style="padding:8px 0;color:#64748b;">Tentatives de réparation</td><td style="color:#334155;font-weight:bold;">{incident.repair_attempts}/{self.config.max_repair_attempts} échouées</td></tr>
<tr><td style="padding:8px 0;color:#64748b;">Erreur</td><td style="color:#dc2626;font-family:monospace;font-size:12px;">{incident.error_details or 'N/A'}</td></tr>
</table>
</div>

{troubleshooting}

<div style="text-align:center;margin:30px 0;">
<a href="{ADMIN_DASHBOARD_URL}" style="background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);border-radius:30px;color:#fff;display:inline-block;font-size:16px;font-weight:bold;padding:18px 50px;text-decoration:none;">ACCÉDER AU DASHBOARD</a>
</div>

<hr style="border:none;border-top:1px solid #fee2e2;margin:30px 0;">
<p style="color:#9ca3af;font-size:11px;text-align:center;">
🛡️ Gardien Maman Douce v3.0 - Stratégie Zéro Bruit<br>
Cet email est envoyé uniquement pour les pannes critiques totales.
</p>
{email_brand_footer()}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
                """
            })
            
            await db.guardian_incidents.update_one(
                {"id": incident.id},
                {"$set": {"alert_sent": True, "alert_sent_at": now.isoformat()}}
            )
            
            self._session_stats["emails_sent"] += 1
            logger.info(f"[Guardian] 📧 ALERTE ROUGE envoyée: {incident.component.value}")
            
        except Exception as e:
            logger.error(f"[Guardian] ❌ Erreur envoi alerte: {e}")
    
    def _get_troubleshooting_steps(self, component: ComponentType) -> str:
        steps = {
            ComponentType.API_SERVER: """
<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:0 8px 8px 0;">
<h3 style="color:#92400e;margin:0 0 10px 0;">🔧 Actions Serveur API</h3>
<ol style="color:#78350f;margin:0;padding-left:20px;line-height:1.8;">
<li>Vérifier logs Railway</li>
<li>Cliquer "Redeploy" dans Railway</li>
<li>Vérifier variables d'environnement</li>
<li>Vérifier limites RAM/CPU</li>
</ol>
</div>""",
            ComponentType.DATABASE: """
<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:0 8px 8px 0;">
<h3 style="color:#92400e;margin:0 0 10px 0;">🔧 Actions Base de Données</h3>
<ol style="color:#78350f;margin:0;padding-left:20px;line-height:1.8;">
<li>Vérifier MongoDB Atlas</li>
<li>Vérifier IP autorisées (0.0.0.0/0)</li>
<li>Vérifier MONGO_URL</li>
<li>Vérifier quotas connexions</li>
</ol>
</div>""",
            ComponentType.STRIPE: """
<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:0 8px 8px 0;">
<h3 style="color:#92400e;margin:0 0 10px 0;">🔧 Actions Stripe</h3>
<ol style="color:#78350f;margin:0;padding-left:20px;line-height:1.8;">
<li>Vérifier dashboard.stripe.com</li>
<li>Vérifier STRIPE_API_KEY</li>
<li>Vérifier mode Test/Live</li>
</ol>
</div>""",
        }
        return steps.get(component, "")
    
    # =========================================================================
    # PUBLIC API
    # =========================================================================
    
    def get_current_status(self) -> Dict[ComponentType, ComponentHealth]:
        return self._component_status.copy()
    
    def get_overall_status(self) -> HealthStatus:
        if not self._component_status:
            return HealthStatus.HEALTHY
        statuses = [h.status for h in self._component_status.values()]
        if HealthStatus.DOWN in statuses:
            return HealthStatus.DOWN
        elif HealthStatus.DEGRADED in statuses:
            return HealthStatus.DEGRADED
        return HealthStatus.HEALTHY
    
    def get_session_stats(self) -> dict:
        return self._session_stats.copy()


# Instance globale
guardian_agent = GuardianAgent()
