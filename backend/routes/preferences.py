"""
Preferences & Subscription routes
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional, List
import uuid

from core.database import db
from core.security import get_current_user
from models.schemas import User

router = APIRouter(tags=["preferences"])

class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    weekly_tips: bool = True
    appointment_reminders: bool = True
    email_address: Optional[str] = None

class CustomReminder(BaseModel):
    title: str
    description: Optional[str] = None
    date: str
    time: Optional[str] = None

# ==================== CUSTOM REMINDERS ====================

@router.get("/notifications")
async def get_reminders(current_user: User = Depends(get_current_user)):
    """Get all custom reminders for user"""
    reminders = await db.custom_reminders.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("date", 1).to_list(100)
    return reminders

@router.post("/notifications")
async def create_reminder(reminder: CustomReminder, current_user: User = Depends(get_current_user)):
    """Create a new custom reminder"""
    reminder_dict = reminder.model_dump()
    reminder_dict["id"] = str(uuid.uuid4())
    reminder_dict["user_id"] = current_user.id
    reminder_dict["completed"] = False
    reminder_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.custom_reminders.insert_one(reminder_dict)
    
    return {"success": True, "id": reminder_dict["id"], "message": "Rappel créé"}

@router.put("/notifications/{reminder_id}")
async def update_reminder(reminder_id: str, completed: bool, current_user: User = Depends(get_current_user)):
    """Toggle reminder completed status"""
    result = await db.custom_reminders.update_one(
        {"id": reminder_id, "user_id": current_user.id},
        {"$set": {"completed": completed, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rappel non trouvé")
    
    return {"success": True, "message": "Rappel mis à jour"}

@router.delete("/notifications/{reminder_id}")
async def delete_reminder(reminder_id: str, current_user: User = Depends(get_current_user)):
    """Delete a custom reminder"""
    result = await db.custom_reminders.delete_one(
        {"id": reminder_id, "user_id": current_user.id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rappel non trouvé")
    
    return {"success": True, "message": "Rappel supprimé"}

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
