"""
Pregnancy routes for MamanDouce
Handles: Pregnancy calculation, Profile management
With precise medical calculations based on cycle duration
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone

from core.database import db
from core.security import get_current_user
from models.schemas import User, PregnancyCalculation, PregnancyProfile

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
    
    # Validate cycle duration (normal range: 21-35 days)
    cycle_duration = max(21, min(35, cycle_duration))
    
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
    last_period = datetime.fromisoformat(data.last_period_date)
    
    # Get cycle duration from data
    cycle_duration = data.cycle_length
    if hasattr(data, 'cycle_duration') and data.cycle_duration:
        cycle_duration = data.cycle_duration
    
    # Calculate all dates
    result = calculate_pregnancy_dates(last_period, cycle_duration)
    
    # Save profile to database
    profile = PregnancyProfile(
        user_id=current_user.id,
        last_period_date=last_period.isoformat(),
        cycle_length=result["cycle_duration"],
        estimated_conception_date=result["conception_date"],
        estimated_due_date=result["due_date"],
        current_week=result["weeks_pregnant"]
    )
    
    existing = await db.pregnancy_profiles.find_one({"user_id": current_user.id})
    profile_dict = profile.model_dump()
    profile_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    profile_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    profile_dict["cycle_duration"] = result["cycle_duration"]
    profile_dict["ovulation_date"] = result["ovulation_date"]
    profile_dict["implantation_date"] = result["implantation_date"]
    profile_dict["trimester"] = result["trimester"]
    
    if existing:
        await db.pregnancy_profiles.update_one(
            {"user_id": current_user.id},
            {"$set": profile_dict}
        )
    else:
        await db.pregnancy_profiles.insert_one(profile_dict)
    
    return result


@router.get("/pregnancy/profile")
async def get_pregnancy_profile(current_user: User = Depends(get_current_user)):
    """Get user's pregnancy profile with updated calculations"""
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    if not profile:
        return None
    
    # Recalculate current week and days
    if profile.get("last_period_date"):
        last_period = datetime.fromisoformat(profile["last_period_date"])
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
            due_date = datetime.fromisoformat(profile["estimated_due_date"])
            profile["days_until_due"] = (due_date - today).days
    
    return profile


@router.post("/pregnancy/calculate-cycle")
async def calculate_cycle_dates(data: PregnancyCalculation, current_user: User = Depends(get_current_user)):
    """
    Calculate cycle dates for women trying to conceive.
    Returns ovulation, fertile window, and next period predictions.
    """
    last_period = datetime.fromisoformat(data.last_period_date)
    cycle_duration = data.cycle_length
    
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
