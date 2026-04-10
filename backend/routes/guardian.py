"""
Guardian Routes - API endpoints pour le système de surveillance Gardien Maman Douce
Version 3.0 - Journal de Bord & Stratégie Zéro Bruit
"""
from fastapi import APIRouter, HTTPException, Depends, Response
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import io
import csv

from core.database import db
from core.security import get_current_user
from models.guardian import (
    IncidentLog, ComponentHealth, SystemHealthReport, GuardianStats,
    HealthStatus, IncidentSeverity, ComponentType
)
from services.guardian_agent import guardian_agent

router = APIRouter(prefix="/guardian", tags=["Guardian"])


# ============================================================================
# JOURNAL DE BORD - Nouveaux endpoints
# ============================================================================

@router.get("/health-reports")
async def get_health_reports(limit: int = 10):
    """
    Obtenir les derniers rapports de santé du Journal de Bord
    Retourne les 10 derniers rapports avec codes couleurs
    """
    try:
        reports = await db.health_reports.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return {
            "reports": reports,
            "total": len(reports),
            "max_stored": 10,
            "strategy": "zero_noise"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health-reports/latest")
async def get_latest_health_report():
    """Obtenir le dernier rapport de santé"""
    try:
        report = await db.health_reports.find_one(
            {},
            {"_id": 0},
            sort=[("timestamp", -1)]
        )
        
        if not report:
            return {
                "overall_status": "unknown",
                "overall_color": "gray",
                "message": "Aucun rapport disponible"
            }
        
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session-stats")
async def get_session_stats():
    """Obtenir les statistiques de la session courante du Gardien"""
    try:
        stats = guardian_agent.get_session_stats()
        return {
            "session_stats": stats,
            "guardian_running": guardian_agent.is_running,
            "strategy": "zero_noise",
            "emails_policy": "critical_only"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def get_system_health():
    """Obtenir l'état de santé global du système"""
    try:
        # Récupérer les statuts des composants
        component_status = guardian_agent.get_current_status()
        overall_status = guardian_agent.get_overall_status()
        
        # Compter les incidents actifs (non résolus)
        active_incidents = await db.guardian_incidents.count_documents({
            "resolved_at": None,
            "timestamp": {"$gte": (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()}
        })
        
        # Compter les auto-repairs des dernières 24h
        auto_repairs_24h = await db.guardian_incidents.count_documents({
            "auto_repair_success": True,
            "timestamp": {"$gte": (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()}
        })
        
        # Compter les incidents escaladés
        escalated = await db.guardian_incidents.count_documents({
            "alert_sent": True,
            "resolved_at": None
        })
        
        # Construire la liste des composants
        components = []
        for comp_type in ComponentType:
            if comp_type in component_status:
                components.append(component_status[comp_type])
            else:
                components.append(ComponentHealth(
                    component=comp_type,
                    status=HealthStatus.HEALTHY,
                    last_check=datetime.now(timezone.utc).isoformat()
                ))
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "overall_status": overall_status.value,
            "components": [c.dict() for c in components],
            "active_incidents": active_incidents,
            "auto_repairs_last_24h": auto_repairs_24h,
            "escalated_incidents": escalated,
            "guardian_running": guardian_agent.is_running
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status-indicator")
async def get_status_indicator():
    """
    Obtenir le voyant lumineux pour le header admin
    - green: Tout va bien
    - orange: Bug auto-réparé récemment
    - red: Problème nécessitant intervention
    """
    try:
        now = datetime.now(timezone.utc)
        last_24h = (now - timedelta(hours=24)).isoformat()
        
        # Vérifier s'il y a des incidents critiques non résolus
        critical_unresolved = await db.guardian_incidents.count_documents({
            "severity": IncidentSeverity.CRITICAL.value,
            "resolved_at": None,
            "timestamp": {"$gte": last_24h}
        })
        
        if critical_unresolved > 0:
            return {
                "color": "red",
                "label": "Intervention requise",
                "count": critical_unresolved
            }
        
        # Vérifier s'il y a eu des auto-repairs dans les dernières 24h
        auto_repairs = await db.guardian_incidents.count_documents({
            "auto_repair_success": True,
            "timestamp": {"$gte": last_24h}
        })
        
        if auto_repairs > 0:
            return {
                "color": "orange",
                "label": "Bug auto-réparé",
                "count": auto_repairs
            }
        
        return {
            "color": "green",
            "label": "Tous systèmes opérationnels",
            "count": 0
        }
    except Exception:
        return {
            "color": "red",
            "label": "Erreur de vérification",
            "count": 0
        }


@router.get("/incidents")
async def get_incidents(
    days: int = 30,
    severity: Optional[str] = None,
    component: Optional[str] = None,
    limit: int = 100
):
    """Obtenir l'historique des incidents"""
    try:
        # Construire le filtre
        since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        filter_query = {"timestamp": {"$gte": since}}
        
        if severity:
            filter_query["severity"] = severity
        if component:
            filter_query["component"] = component
        
        # Récupérer les incidents
        incidents = await db.guardian_incidents.find(
            filter_query,
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return {
            "incidents": incidents,
            "total": len(incidents),
            "period_days": days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_guardian_stats():
    """Obtenir les statistiques du Guardian sur 30 jours"""
    try:
        now = datetime.now(timezone.utc)
        last_30d = (now - timedelta(days=30)).isoformat()
        
        # Total incidents
        total_incidents = await db.guardian_incidents.count_documents({
            "timestamp": {"$gte": last_30d}
        })
        
        # Auto-repairs réussis
        auto_repairs_success = await db.guardian_incidents.count_documents({
            "auto_repair_success": True,
            "timestamp": {"$gte": last_30d}
        })
        
        # Auto-repairs échoués
        auto_repairs_failed = await db.guardian_incidents.count_documents({
            "auto_repair_attempted": True,
            "auto_repair_success": False,
            "timestamp": {"$gte": last_30d}
        })
        
        # Escaladés à l'admin
        escalated = await db.guardian_incidents.count_documents({
            "alert_sent": True,
            "timestamp": {"$gte": last_30d}
        })
        
        # Composant le plus affecté
        pipeline = [
            {"$match": {"timestamp": {"$gte": last_30d}}},
            {"$group": {"_id": "$component", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]
        most_affected_result = await db.guardian_incidents.aggregate(pipeline).to_list(1)
        most_affected = most_affected_result[0]["_id"] if most_affected_result else None
        
        # Calculer le uptime (approximatif)
        total_checks = 30 * 24 * 60 / 5  # 5 min intervals sur 30 jours
        failures = total_incidents
        uptime = max(0, ((total_checks - failures) / total_checks) * 100) if total_checks > 0 else 100
        
        return {
            "total_incidents_30d": total_incidents,
            "auto_repairs_success": auto_repairs_success,
            "auto_repairs_failed": auto_repairs_failed,
            "escalated_to_admin": escalated,
            "avg_response_time_ms": 0,  # TODO: calculer depuis les health checks
            "uptime_percentage": round(uptime, 2),
            "most_affected_component": most_affected
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report/csv")
async def download_report_csv(days: int = 30):
    """Télécharger le rapport d'incidents en CSV"""
    try:
        since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        
        incidents = await db.guardian_incidents.find(
            {"timestamp": {"$gte": since}},
            {"_id": 0}
        ).sort("timestamp", -1).to_list(1000)
        
        # Créer le CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # En-têtes
        writer.writerow([
            "Date/Heure", "Composant", "Sévérité", "Statut", 
            "Description", "Auto-réparé", "Tentatives", "Résolu à", "Alerte envoyée"
        ])
        
        # Données
        for incident in incidents:
            writer.writerow([
                incident.get("timestamp", ""),
                incident.get("component", ""),
                incident.get("severity", ""),
                incident.get("status", ""),
                incident.get("description", ""),
                "Oui" if incident.get("auto_repair_success") else "Non",
                incident.get("repair_attempts", 0),
                incident.get("resolved_at", ""),
                "Oui" if incident.get("alert_sent") else "Non"
            ])
        
        # Préparer la réponse
        output.seek(0)
        filename = f"rapport_guardian_{datetime.now().strftime('%Y%m%d')}.csv"
        
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report/pdf")
async def download_report_pdf(days: int = 30):
    """Télécharger le rapport d'incidents en PDF"""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        
        since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        
        # Récupérer les données
        incidents = await db.guardian_incidents.find(
            {"timestamp": {"$gte": since}},
            {"_id": 0}
        ).sort("timestamp", -1).to_list(1000)
        
        # Statistiques
        stats = await get_guardian_stats()
        
        # Créer le PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        elements = []
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#ec4899')
        )
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#64748b')
        )
        
        # Titre
        elements.append(Paragraph("🛡️ Rapport Gardien Maman Douce", title_style))
        elements.append(Paragraph(f"Période: {days} derniers jours", subtitle_style))
        elements.append(Spacer(1, 20))
        
        # Statistiques résumées
        stats_data = [
            ["Statistique", "Valeur"],
            ["Total incidents", str(stats["total_incidents_30d"])],
            ["Auto-réparations réussies", str(stats["auto_repairs_success"])],
            ["Auto-réparations échouées", str(stats["auto_repairs_failed"])],
            ["Escaladés à l'admin", str(stats["escalated_to_admin"])],
            ["Uptime", f"{stats['uptime_percentage']}%"],
            ["Composant le plus affecté", stats["most_affected_component"] or "Aucun"]
        ]
        
        stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ec4899')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#fdf2f8')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#f9a8d4')),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 30))
        
        # Historique des incidents
        elements.append(Paragraph("📜 Historique des incidents", subtitle_style))
        
        if incidents:
            incident_data = [["Date", "Composant", "Sévérité", "Statut"]]
            for inc in incidents[:50]:  # Limiter à 50 pour le PDF
                date_str = inc.get("timestamp", "")[:16].replace("T", " ")
                incident_data.append([
                    date_str,
                    inc.get("component", ""),
                    inc.get("severity", ""),
                    "✅" if inc.get("auto_repair_success") else "❌" if inc.get("alert_sent") else "⏳"
                ])
            
            incident_table = Table(incident_data, colWidths=[1.5*inch, 1.5*inch, 1*inch, 1*inch])
            incident_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c4b5fd')),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('TOPPADDING', (0, 1), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f3ff')]),
            ]))
            elements.append(incident_table)
        else:
            elements.append(Paragraph("Aucun incident enregistré sur cette période.", styles['Normal']))
        
        # Footer
        elements.append(Spacer(1, 40))
        elements.append(Paragraph(
            f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')} - Gardien Maman Douce",
            ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
        ))
        
        # Construire le PDF
        doc.build(elements)
        
        buffer.seek(0)
        filename = f"rapport_guardian_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ImportError:
        raise HTTPException(status_code=500, detail="ReportLab non installé pour la génération PDF")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resolve/{incident_id}")
async def resolve_incident(incident_id: str, user = Depends(get_current_user)):
    """Marquer un incident comme résolu manuellement"""
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    try:
        result = await db.guardian_incidents.update_one(
            {"id": incident_id},
            {"$set": {
                "resolved_at": datetime.now(timezone.utc).isoformat(),
                "status": "resolved"
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Incident non trouvé")
        
        return {"success": True, "message": "Incident marqué comme résolu"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-check")
async def trigger_health_check(user = Depends(get_current_user)):
    """Déclencher manuellement une vérification de santé (admin uniquement)"""
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    try:
        await guardian_agent._perform_health_checks()
        return {
            "success": True,
            "message": "Vérification de santé effectuée",
            "status": guardian_agent.get_current_status()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
