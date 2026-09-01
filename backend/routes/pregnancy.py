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
from core.pregnancy_country import COUNTRY_FR, country_label
from core.pregnancy_dates import (
    calculate_dpa,
    resolve_pregnancy_country,
    trimester_from_sa,
    weeks_amenorrhea,
)
from models.schemas import User, PregnancyCalculation, PregnancyProfile

logger = logging.getLogger("mamandouce.cycle")

router = APIRouter(tags=["pregnancy"])


async def _user_pregnancy_country(user_id: str) -> str:
    user_doc = await db.users.find_one({"id": str(user_id)}, {"_id": 0, "city": 1}) or {}
    return resolve_pregnancy_country(user_doc.get("city"))


@router.get("/pregnancy/fetus-visuals")
async def get_public_fetus_visuals():
    """Public week→Cloudinary URL mapping; contains no credentials."""
    try:
        documents = await db.fetus_visuals.find(
            {
                "week": {"$gte": 1, "$lte": 40},
                "image_url": {"$type": "string"},
            },
            {"_id": 0, "week": 1, "image_url": 1, "updated_at": 1},
        ).to_list(40)
    except Exception as exc:
        logger.warning("fetus visual mapping unavailable: %s", exc)
        documents = []
    return {
        "images": {
            str(document["week"]): document["image_url"]
            for document in documents
            if document.get("image_url")
        },
        "updated_at": max(
            (document.get("updated_at") or "" for document in documents),
            default=None,
        ),
    }


def calculate_pregnancy_dates(last_period: datetime, cycle_duration: int, country: str = COUNTRY_FR):
    """
    Calculate all pregnancy-related dates with medical precision.

    France (CPAM): DPA = DDG + 9 calendar months (41 SA social security calendar).
    UK (NHS): DPA = Naegele rule (280 days, adjusted for cycle length).
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
    ddg_date = conception_date.date()
    due_date_dt = calculate_dpa(ddg_date, country, cycle_duration)
    due_date = datetime.combine(due_date_dt, datetime.min.time())
    
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
    ddr_date = last_period.date()
    days_pregnant = (today.date() - ddr_date).days
    weeks_pregnant = weeks_amenorrhea(ddr_date, today.date())
    days_in_week = days_pregnant % 7
    trimester = trimester_from_sa(weeks_pregnant)
    
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
        
        "pregnancy_country": country,
        "pregnancy_calendar": country_label(country),
        "explanations": {
            "ovulation": f"L'ovulation a lieu {days_to_ovulation} jours après le début des règles (jour {days_to_ovulation} du cycle).",
            "fertile_window": f"Période fertile : du jour {days_to_ovulation - 5} au jour {days_to_ovulation + 1} du cycle (6 jours).",
            "implantation": "La nidation se produit généralement entre 6 et 12 jours après l'ovulation.",
            "due_date": (
                "Date calculée selon le calendrier CPAM (DDG + 9 mois)."
                if country == COUNTRY_FR
                else f"Date calculée selon la règle de Naegele (280 jours), ajustée pour un cycle de {cycle_duration} jours."
            ),
            "next_period": f"Si pas enceinte, prochaines règles attendues {cycle_duration} jours après les dernières.",
        },
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

    country = await _user_pregnancy_country(current_user.id)
    result = calculate_pregnancy_dates(last_period, cycle_duration, country)
    ymd = last_period.strftime("%Y-%m-%d")

    profile = PregnancyProfile(
        user_id=str(current_user.id),
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
        stored = await persist_cycle_settings(str(current_user.id), profile_dict)
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
    profile = await load_cycle_profile(str(current_user.id))
    if not profile:
        return None

    user_doc = await db.users.find_one(
        {"id": str(current_user.id)},
        {"_id": 0, "status": 1, "is_pregnant": 1, "pregnancy_status": 1, "city": 1},
    ) or {}
    raw_status = str(
        user_doc.get("pregnancy_status") or user_doc.get("status") or ""
    ).strip().lower()
    if user_doc.get("is_pregnant") is True or raw_status in {
        "pregnant", "pregnancy", "enceinte", "active", "confirmed",
    }:
        profile["is_pregnant"] = True
        profile["pregnancy_status"] = "pregnant"
    elif user_doc.get("is_pregnant") is False or raw_status in {
        "not_pregnant", "non_enceinte", "trying", "trying_to_conceive",
        "envie_bebe", "cycle",
    }:
        profile["is_pregnant"] = False
        profile["pregnancy_status"] = "not_pregnant"
    
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
        country = resolve_pregnancy_country(user_doc.get("city"))
        cycle_length = coerce_cycle_length(profile.get("cycle_length", profile.get("cycle_duration", 28)))
        cycle_length = coerce_cycle_length(profile.get("cycle_length", profile.get("cycle_duration", 28)))
        days_to_ovulation = cycle_length - 14
        ddg_date = last_period.date() + timedelta(days=days_to_ovulation)
        due_date_dt = calculate_dpa(ddg_date, country, cycle_length)
        due_date = datetime.combine(due_date_dt, datetime.min.time())
        profile["estimated_due_date"] = due_date.isoformat()
        profile["pregnancy_country"] = country
        profile["pregnancy_calendar"] = country_label(country)

        ddr_date = last_period.date()
        profile["current_week"] = weeks_amenorrhea(ddr_date, today.date())
        days_pregnant = (today.date() - ddr_date).days
        profile["days_in_current_week"] = days_pregnant % 7
        profile["gestational_age"] = f"{profile['current_week']} SA + {profile['days_in_current_week']} jours"
        profile["trimester"] = trimester_from_sa(profile["current_week"])
        
        profile["days_until_due"] = (due_date - today).days
    
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
    country = await _user_pregnancy_country(current_user.id)
    result = calculate_pregnancy_dates(last_period, cycle_duration, country)
    
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
    profile = await load_cycle_profile(str(current_user.id))
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
    
    country = await _user_pregnancy_country(current_user.id)
    result = calculate_pregnancy_dates(last_period, cycle_length, country)
    
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
    from services.cycle_intelligence import CycleIntelligenceAgent, get_cycle_intelligence

    try:
        agent = await get_cycle_intelligence(current_user.id)
        analysis = agent.analyze_cycles()
    except Exception:
        logger.exception("cycle intelligence failed user_id=%s", current_user.id)
        analysis = CycleIntelligenceAgent(current_user.id).analyze_cycles()

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
