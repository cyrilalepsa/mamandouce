"""
Guardian Models - Modèles pour le système de surveillance Gardien Maman Douce
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class IncidentSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    DETECTED = "detected"
    AUTO_REPAIR_ATTEMPTED = "auto_repair_attempted"
    AUTO_REPAIR_SUCCESS = "auto_repair_success"
    AUTO_REPAIR_FAILED = "auto_repair_failed"
    ESCALATED = "escalated"
    RESOLVED = "resolved"


class ComponentType(str, Enum):
    API_SERVER = "api_server"
    DATABASE = "database"
    STRIPE = "stripe"
    FOOD_SCANNER = "food_scanner"
    CYCLE_TRACKING = "cycle_tracking"
    PUSH_NOTIFICATIONS = "push_notifications"
    EMAIL_SERVICE = "email_service"


class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"


class IncidentLog(BaseModel):
    """Modèle pour un incident enregistré"""
    id: str = Field(..., description="Identifiant unique de l'incident")
    timestamp: str = Field(..., description="Date/heure de détection (ISO format)")
    component: ComponentType = Field(..., description="Composant affecté")
    severity: IncidentSeverity = Field(..., description="Niveau de gravité")
    status: IncidentStatus = Field(..., description="Statut de l'incident")
    description: str = Field(..., description="Description du problème")
    error_details: Optional[str] = Field(None, description="Détails techniques de l'erreur")
    auto_repair_attempted: bool = Field(False, description="Tentative de réparation auto")
    auto_repair_success: bool = Field(False, description="Réparation réussie")
    repair_attempts: int = Field(0, description="Nombre de tentatives de réparation")
    resolved_at: Optional[str] = Field(None, description="Date/heure de résolution")
    alert_sent: bool = Field(False, description="Alerte envoyée à l'admin")
    alert_sent_at: Optional[str] = Field(None, description="Date/heure d'envoi de l'alerte")


class ComponentHealth(BaseModel):
    """État de santé d'un composant"""
    component: ComponentType
    status: HealthStatus
    last_check: str
    response_time_ms: Optional[float] = None
    error_message: Optional[str] = None


class SystemHealthReport(BaseModel):
    """Rapport de santé global du système"""
    timestamp: str
    overall_status: HealthStatus
    components: List[ComponentHealth]
    active_incidents: int
    auto_repairs_last_24h: int
    escalated_incidents: int


class GuardianStats(BaseModel):
    """Statistiques du Guardian pour le dashboard"""
    total_incidents_30d: int
    auto_repairs_success: int
    auto_repairs_failed: int
    escalated_to_admin: int
    avg_response_time_ms: float
    uptime_percentage: float
    most_affected_component: Optional[str] = None


class AlertConfig(BaseModel):
    """Configuration des alertes"""
    admin_email: str = "cyrilalepsa@gmail.com"
    max_repair_attempts: int = 3
    check_interval_minutes: int = 5
    alert_on_warning: bool = False
    alert_on_critical: bool = True
