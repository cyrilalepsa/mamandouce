"""
Preferences & Subscription routes
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional

from core.database import db
from core.security import get_current_user
from models.schemas import User

router = APIRouter(tags=["preferences"])

class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    weekly_tips: bool = True
    appointment_reminders: bool = True
    email_address: Optional[str] = None

# ==================== NOTIFICATION PREFERENCES ====================

@router.get("/notifications/preferences")
async def get_notification_preferences(current_user: User = Depends(get_current_user)):
    """Get user notification preferences"""
    prefs = await db.notification_preferences.find_one(
        {"user_id": current_user.id}, 
        {"_id": 0}
    )
    
    if not prefs:
        # Return defaults with user email
        user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "email": 1})
        return {
            "email_notifications": True,
            "weekly_tips": True,
            "appointment_reminders": True,
            "email_address": user.get("email", "") if user else ""
        }
    
    return prefs

@router.post("/notifications/preferences")
async def update_notification_preferences(
    prefs: NotificationPreferences,
    current_user: User = Depends(get_current_user)
):
    """Update user notification preferences"""
    prefs_dict = prefs.model_dump()
    prefs_dict["user_id"] = current_user.id
    prefs_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.notification_preferences.update_one(
        {"user_id": current_user.id},
        {"$set": prefs_dict},
        upsert=True
    )
    
    return {"success": True, "message": "Préférences mises à jour"}

# ==================== SUBSCRIPTION STATUS ====================

@router.get("/subscription-status")
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    """Get current subscription status"""
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    if not user:
        return {"subscription_status": "free"}
    
    return {
        "subscription_status": user.get("subscription_status", "free"),
        "premium_source": user.get("premium_source"),
        "subscription_start_date": user.get("subscription_start_date"),
        "subscription_end_date": user.get("subscription_end_date"),
        "postpartum_purchased": user.get("postpartum_purchased", False),
        "postpartum_free_via_referral": user.get("postpartum_free_via_referral", False)
    }
