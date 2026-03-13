"""
Pregnancy routes for MamanDouce
Handles: Pregnancy calculation, Profile management
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta

from core.database import db
from core.security import get_current_user
from models.schemas import User, PregnancyCalculation, PregnancyProfile

router = APIRouter(tags=["pregnancy"])

@router.post("/pregnancy/calculate")
async def calculate_pregnancy(data: PregnancyCalculation, current_user: User = Depends(get_current_user)):
    """Calculate pregnancy dates based on last period"""
    last_period = datetime.fromisoformat(data.last_period_date)
    
    # Use custom cycle duration (default 28 days)
    cycle_duration = data.cycle_length
    if hasattr(data, 'cycle_duration'):
        cycle_duration = data.cycle_duration
    cycle_duration = max(24, min(34, cycle_duration))  # Clamp between 24-34
    
    # Ovulation occurs approximately 14 days before the next period
    ovulation_day = cycle_duration - 14
    ovulation_date = last_period + timedelta(days=ovulation_day)
    conception_date = ovulation_date
    due_date = last_period + timedelta(days=280)
    
    today = datetime.now()
    weeks_pregnant = (today - last_period).days // 7
    
    profile = PregnancyProfile(
        user_id=current_user.id,
        last_period_date=last_period.isoformat(),
        cycle_length=cycle_duration,
        estimated_conception_date=conception_date.isoformat(),
        estimated_due_date=due_date.isoformat(),
        current_week=weeks_pregnant
    )
    
    existing = await db.pregnancy_profiles.find_one({"user_id": current_user.id})
    profile_dict = profile.model_dump()
    profile_dict["created_at"] = datetime.now().isoformat()
    profile_dict["updated_at"] = datetime.now().isoformat()
    profile_dict["cycle_duration"] = cycle_duration
    
    if existing:
        await db.pregnancy_profiles.update_one(
            {"user_id": current_user.id},
            {"$set": profile_dict}
        )
    else:
        await db.pregnancy_profiles.insert_one(profile_dict)
    
    return {
        "last_period_date": last_period.isoformat(),
        "ovulation_date": ovulation_date.isoformat(),
        "conception_date": conception_date.isoformat(),
        "due_date": due_date.isoformat(),
        "weeks_pregnant": weeks_pregnant,
        "cycle_duration": cycle_duration,
        "next_period_date": (last_period + timedelta(days=cycle_duration)).isoformat(),
        "implantation_date": (ovulation_date + timedelta(days=9)).isoformat()
    }

@router.get("/pregnancy/profile")
async def get_pregnancy_profile(current_user: User = Depends(get_current_user)):
    """Get user's pregnancy profile"""
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    if not profile:
        return None
    return profile
