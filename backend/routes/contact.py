"""
Contact routes for MamanDouce
Handles: User messages to admin, Message history
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone

from core.database import db
from core.security import get_current_user
from models.schemas import User, AdminMessage, ContactMessageRequest

router = APIRouter(tags=["contact"])

@router.post("/contact/send")
async def send_contact_message(request: ContactMessageRequest, current_user: User = Depends(get_current_user)):
    """Send a message to admin from user"""
    user = await db.users.find_one({"email": current_user.email}, {"_id": 0})
    
    message = AdminMessage(
        user_id=current_user.id,
        user_email=current_user.email,
        user_name=user.get("name") if user else None,
        subject=request.subject,
        message=request.message
    )
    
    message_dict = message.model_dump()
    message_dict["created_at"] = message_dict["created_at"].isoformat()
    await db.admin_messages.insert_one(message_dict)
    
    return {"success": True, "message": "Message envoyé à l'administratrice"}

@router.get("/contact/my-messages")
async def get_my_messages(current_user: User = Depends(get_current_user)):
    """Get all messages sent by the current user with admin replies"""
    messages = await db.admin_messages.find(
        {"user_email": current_user.email},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"messages": messages}
