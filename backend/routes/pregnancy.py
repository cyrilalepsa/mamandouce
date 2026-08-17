"""
Pregnancy routes for MamanDouce
Handles: Pregnancy calculation, Profile management
With precise medical calculations based on cycle duration
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta, timezone
import logging

from core.database import db
from core.security import get_current_user
from core.cycle_dates import as_naive_utc, coerce_cycle_length, parse_last_period_datetime
from core.cycle_store import load_cycle_profile, persist_cycle_settings
from models.schemas import User, PregnancyCalculation, PregnancyProfile

logger = logging.getLogger("mamandouce.cycle")

router = APIRouter(tags=["pregnancy"])


def calculate_pregnancy_dates(last_period: datetime, cycle_duration: int):
    """
    Calculate all pregnancy-related dates with medical precision.
    
    Formulas used:
    - Ovulation: Cycle duration - 14 days (luteal phase is constant at ~14 days)
    - Fertile window: 5 days before ovulation to 1 day after
    - Implantation: 6-12 days after ovulation (average: 9 days)
    - Due date: Naegele's rule adjusted for cycle length
    - Next period: If not pregnant, cycle_duration days after last period
    """
    
    last_period = as_naive_utc(last_period)
    # Validate cycle duration (normal range: 21-35 days)
    cycle_duration = max(21, min(35, int(cycle_duration)))
    
    # === OVULATION ===
    # The luteal phase (after ovulation) is relatively constant at 14 days
    # So ovulation = cycle_duration - 14
    days_to_ovulation = cycle_duration - 14
    ovulation_date = last_period + timedelta(days=days_to_ovulation)
    
    # === FERTILE WINDOW ===
    # Sperm can survive 5 days, egg survives 12-24 hours
    # Fertile window: 5 days before ovulation to 1 day after
    fertile_window_start = ovulation_date - timedelta(days=5)
    fertile_window_end = ovulation_date + timedelta(days=1)
    
    # === CONCEPTION DATE ===
    # Typically on ovulation day or 1-2 days before
    conception_date = ovulation_date
    
    # === IMPLANTATION (NIDATION) ===
    # Occurs 6-12 days after ovulation, most commonly days 8-10
    implantation_start = ovulation_date + timedelta(days=6)
    implantation_end = ovulation_date + timedelta(days=12)
    implantation_most_likely = ovulation_date + timedelta(days=9)
    
    # === DUE DATE (Date Prévue d'Accouchement - DPA) ===
    # Naegele's rule: Last period + 280 days (for 28-day cycle)
    # Adjustment for different cycle lengths:
    # Add/subtract the difference from 28 days
    cycle_adjustment = cycle_duration - 28
    due_date = last_period + timedelta(days=280 + cycle_adjustment)
    
    # Due date range (±2 weeks is normal)
    due_date_earliest = due_date - timedelta(days=14)
    due_date_latest = due_date + timedelta(days=14)
    
    # === NEXT PERIOD (if not pregnant) ===
    next_period_date = last_period + timedelta(days=cycle_duration)
    
    # === PREGNANCY START DATE ===
    # Medically, pregnancy is counted from the first day of last period
    # But actual pregnancy (conception) starts at ovulation
    pregnancy_start_medical = last_period  # For calculating weeks
    pregnancy_start_actual = conception_date  # When it really begins
    
    # === CURRENT PREGNANCY WEEK ===
    today = datetime.now(timezone.utc).replace(tzinfo=None)
    days_pregnant = (today - last_period).days
    weeks_pregnant = days_pregnant // 7
    days_in_week = days_pregnant % 7
    
    # === TRIMESTER ===
    if weeks_pregnant <= 13:
        trimester = 1
    elif weeks_pregnant <= 26:
        trimester = 2
    else:
        trimester = 3
    
    # === GESTATIONAL AGE ===
    # Expressed as "X semaines + Y jours"
    gestational_age = f"{weeks_pregnant} SA + {days_in_week} jours"
    
    return {
        # Basic dates
        "last_period_date": last_period.isoformat(),
        "cycle_duration": cycle_duration,
        
        # Ovulation
        "ovulation_date": ovulation_date.isoformat(),
        "days_to_ovulation": days_to_ovulation,
        
        # Fertile window
        "fertile_window_start": fertile_window_start.isoformat(),
        "fertile_window_end": fertile_window_end.isoformat(),
        "fertile_days": 6,  # 5 before + ovulation day
        
        # Conception
        "conception_date": conception_date.isoformat(),
        
        # Implantation (Nidation)
        "implantation_date": implantation_most_likely.isoformat(),
        "implantation_window_start": implantation_start.isoformat(),
        "implantation_window_end": implantation_end.isoformat(),
        
        # Due date
        "due_date": due_date.isoformat(),
        "due_date_earliest": due_date_earliest.isoformat(),
        "due_date_latest": due_date_latest.isoformat(),
        
        # Next period (if not pregnant)
        "next_period_date": next_period_date.isoformat(),
        
        # Current pregnancy status
        "weeks_pregnant": weeks_pregnant,
        "days_in_current_week": days_in_week,
        "gestational_age": gestational_age,
        "trimester": trimester,
        "days_until_due": (due_date - today).days,
        
        # Explanations in French
        "explanations": {
            "ovulation": f"L'ovulation a lieu {days_to_ovulation} jours après le début des règles (jour {days_to_ovulation} du cycle).",
            "fertile_window": f"Période fertile : du jour {days_to_ovulation - 5} au jour {days_to_ovulation + 1} du cycle (6 jours).",
            "implantation": "La nidation se produit généralement entre 6 et 12 jours après l'ovulation.",
            "due_date": f"Date calculée selon la règle de Naegele, ajustée pour un cycle de {cycle_duration} jours.",
            "next_period": f"Si pas enceinte, prochaines règles attendues {cycle_duration} jours après les dernières."
        }
    }


@router.post("/pregnancy/calculate")
async def calculate_pregnancy(data: PregnancyCalculation, current_user: User = Depends(get_current_user)):
    """Calculate pregnancy dates based on last period with medical precision"""
    try:
        last_period = parse_last_period_datetime(data.last_period_date)
        cycle_duration = coerce_cycle_length(data.cycle_length)
    except ValueError as exc:
        logger.warning(
            "cycle save validation failed user_id=%s last_period_date=%r cycle_length=%r error=%s",
            current_user.id,
            data.last_period_date,
            data.cycle_length,
            exc,
        )
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    result = calculate_pregnancy_dates(last_period, cycle_duration)
    ymd = last_period.strftime("%Y-%m-%d")

    profile = PregnancyProfile(
        user_id=current_user.id,
        last_period_date=ymd,
        cycle_length=result["cycle_duration"],
        estimated_conception_date=result["conception_date"],
        estimated_due_date=result["due_date"],
        current_week=result["weeks_pregnant"]
    )

    profile_dict = profile.model_dump()
    profile_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    profile_dict["cycle_duration"] = result["cycle_duration"]
    profile_dict["ovulation_date"] = result["ovulation_date"]
    profile_dict["implantation_date"] = result["implantation_date"]
    profile_dict["trimester"] = result["trimester"]

    try:
        stored = await persist_cycle_settings(current_user.id, profile_dict)
        logger.info(
            "cycle settings saved user_id=%s last_period_date=%s cycle_length=%s store=%s",
            current_user.id,
            ymd,
            result["cycle_duration"],
            stored,
        )
        if stored == "none":
            logger.error(
                "cycle settings calculation ok but persist failed user_id=%s last_period_date=%s",
                current_user.id,
                ymd,
            )
    except Exception:
        logger.exception(
            "cycle settings persist unexpected error user_id=%s last_period_date=%s cycle_length=%s",
            current_user.id,
            ymd,
            result["cycle_duration"],
        )

    return result


@router.get("/pregnancy/profile")
async def get_pregnancy_profile(current_user: User = Depends(get_current_user)):
    """Get user's pregnancy profile with updated calculations"""
    profile = await load_cycle_profile(current_user.id)
    if not profile:
        return None
    
    # Recalculate current week and days
    if profile.get("last_period_date"):
        try:
            last_period = parse_last_period_datetime(profile["last_period_date"])
        except ValueError:
            logger.warning(
                "stored last_period_date invalid user_id=%s value=%r",
                current_user.id,
                profile.get("last_period_date"),
            )
            return profile
        today = datetime.now(timezone.utc).replace(tzinfo=None)
        days_pregnant = (today - last_period).days
        profile["current_week"] = days_pregnant // 7
        profile["days_in_current_week"] = days_pregnant % 7
        profile["gestational_age"] = f"{profile['current_week']} SA + {profile['days_in_current_week']} jours"
        
        if profile["current_week"] <= 13:
            profile["trimester"] = 1
        elif profile["current_week"] <= 26:
            profile["trimester"] = 2
        else:
            profile["trimester"] = 3
        
        if profile.get("estimated_due_date"):
            try:
                due_raw = str(profile["estimated_due_date"]).replace("Z", "+00:00")
                due_date = as_naive_utc(datetime.fromisoformat(due_raw))
                profile["days_until_due"] = (due_date - today).days
            except ValueError:
                logger.warning(
                    "stored estimated_due_date invalid user_id=%s value=%r",
                    current_user.id,
                    profile.get("estimated_due_date"),
                )
    
    return profile


@router.post("/pregnancy/calculate-cycle")
async def calculate_cycle_dates(data: PregnancyCalculation, current_user: User = Depends(get_current_user)):
    """
    Calculate cycle dates for women trying to conceive.
    Returns ovulation, fertile window, and next period predictions.
    """
    last_period = parse_last_period_datetime(data.last_period_date)
    cycle_duration = coerce_cycle_length(data.cycle_length)
    
    # Calculate dates
    result = calculate_pregnancy_dates(last_period, cycle_duration)
    
    # For women trying to conceive, focus on:
    return {
        "cycle_info": {
            "cycle_duration": result["cycle_duration"],
            "last_period": result["last_period_date"],
        },
        "ovulation": {
            "date": result["ovulation_date"],
            "day_of_cycle": result["days_to_ovulation"],
            "explanation": result["explanations"]["ovulation"]
        },
        "fertile_window": {
            "start": result["fertile_window_start"],
            "end": result["fertile_window_end"],
            "best_days": [
                (datetime.fromisoformat(result["ovulation_date"]) - timedelta(days=2)).isoformat(),
                (datetime.fromisoformat(result["ovulation_date"]) - timedelta(days=1)).isoformat(),
                result["ovulation_date"]
            ],
            "explanation": result["explanations"]["fertile_window"]
        },
        "implantation": {
            "earliest": result["implantation_window_start"],
            "latest": result["implantation_window_end"],
            "most_likely": result["implantation_date"],
            "explanation": result["explanations"]["implantation"]
        },
        "next_period": {
            "date": result["next_period_date"],
            "explanation": result["explanations"]["next_period"]
        },
        "pregnancy_test": {
            "earliest_reliable": (datetime.fromisoformat(result["next_period_date"])).isoformat(),
            "recommended": (datetime.fromisoformat(result["next_period_date"]) + timedelta(days=3)).isoformat(),
            "explanation": "Un test de grossesse est fiable à partir du jour prévu des règles, idéalement 3 jours après."
        }
    }


# ==================== FERTILITY REMINDERS ====================

@router.post("/pregnancy/fertility-reminders")
async def toggle_fertility_reminders(enable: bool, current_user: User = Depends(get_current_user)):
    """Enable or disable fertility window reminders"""
    await db.fertility_preferences.update_one(
        {"user_id": current_user.id},
        {"$set": {
            "enabled": enable,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"success": True, "enabled": enable}


@router.get("/pregnancy/fertility-reminders")
async def get_fertility_reminders_status(current_user: User = Depends(get_current_user)):
    """Get fertility reminders status"""
    pref = await db.fertility_preferences.find_one({"user_id": current_user.id}, {"_id": 0})
    return {"enabled": pref.get("enabled", False) if pref else False}


@router.get("/pregnancy/check-fertility-window")
async def check_fertility_window(current_user: User = Depends(get_current_user)):
    """
    Check if today is in the user's fertility window.
    Returns fertility status and sends push notification if enabled.
    """
    from routes.push_notifications import send_push_notification
    
    # Get user's pregnancy profile
    profile = await load_cycle_profile(current_user.id)
    if not profile or not profile.get("last_period_date"):
        return {"in_fertile_window": False, "message": "Profil de cycle non configuré"}
    
    # Get fertility preferences
    pref = await db.fertility_preferences.find_one({"user_id": current_user.id})
    reminders_enabled = pref.get("enabled", False) if pref else False
    
    # Calculate current cycle dates
    last_period = parse_last_period_datetime(profile["last_period_date"])
    cycle_length = coerce_cycle_length(profile.get("cycle_length", 28))
    
    # Calculate next cycle's dates
    today = datetime.now(timezone.utc).replace(tzinfo=None)
    days_since_period = (today - last_period).days
    
    # If more than cycle length, calculate for next cycle
    while days_since_period >= cycle_length:
        last_period = last_period + timedelta(days=cycle_length)
        days_since_period = (today - last_period).days
    
    result = calculate_pregnancy_dates(last_period, cycle_length)
    
    fertile_start = datetime.fromisoformat(result["fertile_window_start"])
    fertile_end = datetime.fromisoformat(result["fertile_window_end"])
    ovulation = datetime.fromisoformat(result["ovulation_date"])
    
    in_fertile_window = fertile_start <= today <= fertile_end
    is_ovulation_day = today.date() == ovulation.date()
    days_to_ovulation = (ovulation - today).days
    
    response = {
        "in_fertile_window": in_fertile_window,
        "is_ovulation_day": is_ovulation_day,
        "days_to_ovulation": days_to_ovulation,
        "fertile_window_start": result["fertile_window_start"],
        "fertile_window_end": result["fertile_window_end"],
        "ovulation_date": result["ovulation_date"],
        "reminders_enabled": reminders_enabled
    }
    
    # Send push notification if in fertile window and reminders enabled
    if reminders_enabled and in_fertile_window:
        # Check if we already sent notification today
        today_str = today.strftime("%Y-%m-%d")
        last_notification = await db.fertility_notifications.find_one({
            "user_id": current_user.id,
            "date": today_str
        })
        
        if not last_notification:
            # Send notification
            if is_ovulation_day:
                title = "Jour d'ovulation !"
                body = "C'est aujourd'hui votre jour d'ovulation. C'est le moment idéal pour concevoir."
            else:
                title = "Période fertile"
                body = f"Vous êtes dans votre fenêtre de fertilité. Ovulation dans {days_to_ovulation} jour(s)."
            
            try:
                await send_push_notification(
                    user_email=current_user.email,
                    title=title,
                    body=body,
                    url="/calculator"
                )
                # Record that we sent notification today
                await db.fertility_notifications.insert_one({
                    "user_id": current_user.id,
                    "date": today_str,
                    "sent_at": datetime.now(timezone.utc).isoformat()
                })
                response["notification_sent"] = True
            except Exception as e:
                response["notification_error"] = str(e)
    
    return response



# ============================================
# CYCLE INTELLIGENCE - Agent IA pour les cycles
# ============================================

@router.get("/cycle/intelligence")
async def get_cycle_analysis(current_user: User = Depends(get_current_user)):
    """
    Obtenir l'analyse intelligente des cycles de l'utilisateur
    Retourne les statistiques, la détection d'irrégularité et les recommandations
    """
    from services.cycle_intelligence import get_cycle_intelligence
    
    agent = await get_cycle_intelligence(current_user.id)
    analysis = agent.analyze_cycles()
    
    return {
        "user_id": current_user.id,
        "analysis": analysis
    }


@router.post("/cycle/intelligence/calculate")
async def calculate_intelligent_dates(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Calculer les dates avec l'intelligence IA (plages pour cycles irréguliers)
    """
    from services.cycle_intelligence import get_cycle_intelligence
    
    last_period_date = data.get("last_period_date")
    if not last_period_date:
        return {"error": "last_period_date is required"}
    
    agent = await get_cycle_intelligence(current_user.id)
    analysis = agent.analyze_cycles()
    dates = agent.calculate_dates_with_ranges(last_period_date)
    
    return {
        "analysis": analysis,
        "dates": dates,
        "recommended_cycle_length": analysis.get("recommended_cycle_length", 28)
    }


@router.post("/cycle/history/save")
async def save_cycle_to_history(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Enregistrer un cycle dans l'historique
    """
    from services.cycle_intelligence import get_cycle_intelligence
    
    start_date = data.get("start_date")
    cycle_length = data.get("cycle_length", 28)
    end_date = data.get("end_date")
    
    if not start_date:
        return {"error": "start_date is required"}
    
    agent = await get_cycle_intelligence(current_user.id)
    result = await agent.save_cycle(start_date, cycle_length, end_date)
    
    return {"success": True, "cycle": result}


@router.post("/cycle/history/initial")
async def save_initial_period_dates(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Sauvegarder les dates initiales pour un nouvel utilisateur
    Attend une liste de dates (minimum 3 recommandées)
    """
    from services.cycle_intelligence import get_cycle_intelligence
    
    period_dates = data.get("period_dates", [])
    
    if len(period_dates) < 2:
        return {"error": "Au moins 2 dates sont nécessaires", "success": False}
    
    agent = await get_cycle_intelligence(current_user.id)
    result = await agent.save_initial_dates(period_dates)
    
    # Recharger et analyser
    await agent.load_history()
    analysis = agent.analyze_cycles()
    
    return {
        "success": True,
        "result": result,
        "analysis": analysis
    }


@router.get("/cycle/history")
async def get_cycle_history(current_user: User = Depends(get_current_user)):
    """
    Obtenir l'historique complet des cycles de l'utilisateur
    """
    from services.cycle_intelligence import get_cycle_intelligence
    
    agent = await get_cycle_intelligence(current_user.id)
    
    return {
        "cycles": agent.cycle_history,
        "count": len(agent.cycle_history)
    }


@router.get("/cycle/report")
async def get_cycle_report(
    current_cycle_length: int = None,
    current_user: User = Depends(get_current_user)
):
    """
    Générer le rapport de fin de cycle
    """
    from services.cycle_intelligence import get_cycle_intelligence
    
    agent = await get_cycle_intelligence(current_user.id)
    agent.analyze_cycles()
    report = agent.generate_cycle_report(current_cycle_length)
    
    return report


@router.post("/cycle/dismiss-banner")
async def dismiss_irregularity_banner(current_user: User = Depends(get_current_user)):
    """
    Masquer la bannière d'irrégularité pour l'utilisateur
    """
    await db.user_preferences.update_one(
        {"user_id": current_user.id},
        {"$set": {"hide_irregularity_banner": True, "banner_dismissed_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"success": True}


@router.get("/cycle/banner-status")
async def get_banner_status(current_user: User = Depends(get_current_user)):
    """
    Vérifier si la bannière d'irrégularité doit être affichée
    """
    prefs = await db.user_preferences.find_one({"user_id": current_user.id})
    
    return {
        "show_banner": not (prefs and prefs.get("hide_irregularity_banner", False))
    }
