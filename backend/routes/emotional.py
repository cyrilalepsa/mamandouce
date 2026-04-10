"""
Intelligence Émotionnelle routes for MamanDouce
Handles: Cycle watchdog (J+15), pregnancy announcements, special dates
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import logging

from core.database import db
from core.security import get_current_user
from models.schemas import User

logger = logging.getLogger(__name__)
router = APIRouter(tags=["emotional"])

# ==================== CYCLE WATCHDOG ====================

@router.get("/emotional/cycle-status")
async def get_cycle_status(current_user: User = Depends(get_current_user)):
    """Check cycle status and return alerts for J+15 (potential pregnancy)"""
    
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    # Get last period date from user's cycle data
    last_period = user_doc.get("last_period_date")
    cycle_length = user_doc.get("cycle_length", 28)
    
    if not last_period:
        return {
            "status": "no_data",
            "message": "Aucune date de règles enregistrée",
            "show_alert": False
        }
    
    try:
        last_period_date = datetime.fromisoformat(last_period.replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        return {"status": "error", "message": "Format de date invalide", "show_alert": False}
    
    now = datetime.now(timezone.utc)
    days_since_period = (now - last_period_date).days
    days_late = days_since_period - cycle_length
    
    # J+15: 15 days late
    if days_late >= 15:
        return {
            "status": "potential_pregnancy",
            "days_late": days_late,
            "message": f"🌸 {days_late} jours de retard détectés...",
            "show_alert": True,
            "alert_type": "pregnancy_check",
            "suggestion": "Un petit test de grossesse pourrait lever le doute ! 💕"
        }
    elif days_late >= 7:
        return {
            "status": "late",
            "days_late": days_late,
            "message": f"📅 {days_late} jours de retard",
            "show_alert": True,
            "alert_type": "gentle_reminder"
        }
    elif days_late >= 0:
        return {
            "status": "expected",
            "days_late": days_late,
            "message": "Période attendue",
            "show_alert": False
        }
    else:
        days_until = abs(days_late)
        return {
            "status": "upcoming",
            "days_until_period": days_until,
            "message": f"Prochaines règles dans ~{days_until} jours",
            "show_alert": False
        }


@router.post("/emotional/pregnancy-announced")
async def announce_pregnancy(current_user: User = Depends(get_current_user)):
    """Trigger WOW effect when user announces pregnancy"""
    from routes.push_notifications import send_push_notification
    
    # Update user status
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "status": "enceinte",
            "pregnancy_announced_at": datetime.now(timezone.utc).isoformat(),
            "pregnancy_confirmation_celebrated": True
        }}
    )
    
    # Log the special event
    await db.emotional_events.insert_one({
        "user_id": current_user.id,
        "event_type": "pregnancy_announced",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "celebrated": True
    })
    
    return {
        "success": True,
        "trigger_celebration": True,
        "celebration_type": "pregnancy_announcement",
        "message": "🎉✨ Félicitations pour cette merveilleuse nouvelle ! ✨🎉",
        "subtitle": "Une nouvelle aventure commence... MamanDouce t'accompagne ! 💕"
    }


# ==================== SPECIAL DATES ====================

@router.get("/emotional/special-dates")
async def check_special_dates(current_user: User = Depends(get_current_user)):
    """Check for special dates (birthday, holidays) and return messages"""
    
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    now = datetime.now(timezone.utc)
    today = now.strftime("%m-%d")
    
    messages = []
    
    # Check user's birthday
    birth_date = user_doc.get("birth_date")
    if birth_date:
        try:
            birth = datetime.strptime(birth_date, "%Y-%m-%d")
            if birth.strftime("%m-%d") == today:
                age = now.year - birth.year
                messages.append({
                    "type": "birthday",
                    "icon": "🎂",
                    "title": f"Joyeux anniversaire {user_doc.get('name', 'belle maman')} !",
                    "message": f"Aujourd'hui tu fêtes tes {age} ans ! 🎉 Que cette année soit douce et pleine de bonheur 💕",
                    "celebration": True
                })
        except (ValueError, AttributeError):
            pass
    
    # Check fixed holidays
    holidays = {
        "12-25": {
            "type": "christmas",
            "icon": "🎄",
            "title": "Joyeux Noël !",
            "message": "MamanDouce te souhaite de merveilleuses fêtes entourée de ceux que tu aimes 🎁✨"
        },
        "01-01": {
            "type": "new_year",
            "icon": "🎆",
            "title": "Bonne année !",
            "message": "Que cette nouvelle année t'apporte santé, bonheur et de doux moments 💫"
        },
        "02-14": {
            "type": "valentine",
            "icon": "💝",
            "title": "Joyeuse Saint-Valentin !",
            "message": "Une journée pour célébrer l'amour sous toutes ses formes 💕"
        },
        "05-25": {  # Fête des mères (approximatif - dernier dimanche de mai)
            "type": "mothers_day",
            "icon": "💐",
            "title": "Bonne fête des mamans !",
            "message": "Une pensée toute douce pour la maman extraordinaire que tu es (ou que tu deviens) 🌸"
        }
    }
    
    if today in holidays:
        holiday = holidays[today]
        messages.append({
            "type": holiday["type"],
            "icon": holiday["icon"],
            "title": holiday["title"],
            "message": holiday["message"],
            "celebration": True
        })
    
    # Check pregnancy milestones
    if user_doc.get("status") == "enceinte":
        pregnancy_start = user_doc.get("pregnancy_announced_at") or user_doc.get("due_date_calculated_from")
        if pregnancy_start:
            try:
                start_date = datetime.fromisoformat(pregnancy_start.replace('Z', '+00:00'))
                weeks_pregnant = (now - start_date).days // 7
                
                milestone_weeks = {
                    12: "Premier trimestre terminé ! Le risque de fausse couche diminue fortement 🎉",
                    20: "Mi-parcours ! Tu as fait la moitié du chemin 🌟",
                    28: "Dernier trimestre ! Bébé grandit vite maintenant 💫",
                    37: "Bébé est considéré à terme ! Il peut arriver n'importe quand 🍼"
                }
                
                if weeks_pregnant in milestone_weeks:
                    messages.append({
                        "type": "pregnancy_milestone",
                        "icon": "🤰",
                        "title": f"Semaine {weeks_pregnant} de grossesse !",
                        "message": milestone_weeks[weeks_pregnant],
                        "celebration": True
                    })
            except (ValueError, AttributeError):
                pass
    
    return {
        "has_messages": len(messages) > 0,
        "messages": messages,
        "checked_at": now.isoformat()
    }


# ==================== EMOTIONAL NOTIFICATIONS SCHEDULER ====================

@router.get("/emotional/pending-notifications")
async def get_pending_emotional_notifications(current_user: User = Depends(get_current_user)):
    """Get any pending emotional notifications for the user"""
    
    # Check if user has seen today's special messages
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    last_emotional_check = user_doc.get("last_emotional_check")
    
    notifications = []
    
    if last_emotional_check != today:
        # Check special dates
        special = await check_special_dates(current_user)
        if special.get("has_messages"):
            notifications.extend(special.get("messages", []))
        
        # Check cycle status
        if user_doc.get("status") == "envie_bebe":
            cycle = await get_cycle_status(current_user)
            if cycle.get("show_alert"):
                notifications.append({
                    "type": "cycle_alert",
                    "icon": "📅",
                    "title": "Suivi de cycle",
                    "message": cycle.get("message"),
                    "suggestion": cycle.get("suggestion"),
                    "celebration": cycle.get("alert_type") == "pregnancy_check"
                })
        
        # Update last check
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"last_emotional_check": today}}
        )
    
    return {
        "notifications": notifications,
        "count": len(notifications)
    }


# ==================== CELEBRATION EVENTS LOG ====================

@router.post("/emotional/mark-celebrated")
async def mark_celebration_seen(
    event_type: str,
    current_user: User = Depends(get_current_user)
):
    """Mark a celebration event as seen by user"""
    
    await db.celebration_logs.insert_one({
        "user_id": current_user.id,
        "event_type": event_type,
        "celebrated_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True}
