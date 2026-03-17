"""
Contact routes for MamanDouce
Handles: User messages to admin, Message history, Image attachments
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import logging

from core.database import db
from core.config import ADMIN_EMAIL
from core.security import get_current_user
from models.schemas import User, AdminMessage, ContactMessageRequest

logger = logging.getLogger(__name__)
router = APIRouter(tags=["contact"])

MAX_IMAGES_PER_MESSAGE = 3
MAX_IMAGE_SIZE = 700000  # ~500KB en base64

def validate_images(images: list) -> list:
    """Validate and limit images"""
    if not images:
        return []
    
    validated = []
    for img in images[:MAX_IMAGES_PER_MESSAGE]:
        if not img:
            continue
        if len(img) > MAX_IMAGE_SIZE:
            continue  # Skip images too large
        if not img.startswith("data:image/"):
            continue  # Skip invalid format
        validated.append(img)
    
    return validated

async def notify_admin_new_message(user_name: str, subject: str, has_images: bool = False):
    """Send push notification to admin for new message"""
    from routes.push_notifications import send_push_notification
    try:
        image_text = " (avec photos)" if has_images else ""
        await send_push_notification(
            user_email=ADMIN_EMAIL,
            title="Nouveau message MamanDouce",
            body=f"{user_name} vous a envoyé un message{image_text} : {subject}",
            url="/admin"
        )
    except Exception as e:
        logger.error(f"Error notifying admin: {e}")

@router.post("/contact/send")
async def send_contact_message(request: ContactMessageRequest, current_user: User = Depends(get_current_user)):
    """Send a message to admin from user (with optional images)"""
    user = await db.users.find_one({"email": current_user.email}, {"_id": 0})
    
    # Validate images
    validated_images = validate_images(request.images) if request.images else []
    
    message = AdminMessage(
        user_id=current_user.id,
        user_email=current_user.email,
        user_name=user.get("name") if user else None,
        subject=request.subject or "Sans sujet",
        message=request.message,
        images=validated_images if validated_images else None
    )
    
    message_dict = message.model_dump()
    message_dict["created_at"] = message_dict["created_at"].isoformat()
    await db.admin_messages.insert_one(message_dict)
    
    # Notify admin
    await notify_admin_new_message(
        user.get("name", "Une utilisatrice"), 
        request.subject or "Sans sujet",
        has_images=bool(validated_images)
    )
    
    return {
        "success": True, 
        "message": "Message envoyé à l'administratrice",
        "images_count": len(validated_images)
    }

@router.get("/contact/my-messages")
async def get_my_messages(current_user: User = Depends(get_current_user)):
    """Get all messages sent by the current user with admin replies"""
    messages = await db.admin_messages.find(
        {"user_email": current_user.email},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    # Count unread replies
    unread_count = len([m for m in messages if m.get("admin_reply") and not m.get("user_read_reply")])
    
    return {"messages": messages, "unread_replies": unread_count}

@router.post("/contact/messages/{message_id}/mark-read")
async def mark_reply_as_read(message_id: str, current_user: User = Depends(get_current_user)):
    """Mark admin reply as read by user"""
    result = await db.admin_messages.update_one(
        {"id": message_id, "user_email": current_user.email},
        {"$set": {"user_read_reply": True}}
    )
    
    if result.matched_count == 0:
        return {"success": False, "message": "Message non trouvé"}
    
    return {"success": True}

@router.post("/contact/messages/{message_id}/reply")
async def user_reply_to_conversation(message_id: str, request: ContactMessageRequest, current_user: User = Depends(get_current_user)):
    """User replies to an existing conversation (with optional images)"""
    import uuid
    
    # Find the original message
    original = await db.admin_messages.find_one(
        {"id": message_id, "user_email": current_user.email},
        {"_id": 0}
    )
    
    if not original:
        return {"success": False, "message": "Conversation non trouvée"}
    
    # Validate images
    validated_images = validate_images(request.images) if request.images else []
    
    # Add user reply to conversation history
    conversation = original.get("conversation", [])
    reply_entry = {
        "id": str(uuid.uuid4())[:8],
        "from": "user",
        "message": request.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    if validated_images:
        reply_entry["images"] = validated_images
    
    conversation.append(reply_entry)
    
    # Update the message
    await db.admin_messages.update_one(
        {"id": message_id},
        {
            "$set": {
                "conversation": conversation,
                "is_read": False,  # Mark as unread for admin
                "last_update": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Notify admin
    user = await db.users.find_one({"email": current_user.email}, {"_id": 0})
    await notify_admin_new_message(
        user.get("name", "Une utilisatrice"), 
        f"Re: {original.get('subject', 'Sans sujet')}",
        has_images=bool(validated_images)
    )
    
    return {"success": True, "message": "Réponse envoyée", "images_count": len(validated_images)}


@router.delete("/contact/messages/{message_id}")
async def delete_message(message_id: str, current_user: User = Depends(get_current_user)):
    """Supprimer un message (utilisateur peut supprimer ses propres messages)"""
    # Vérifier que le message appartient à l'utilisateur
    message = await db.admin_messages.find_one({"id": message_id, "user_id": current_user.id})
    
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    # Supprimer le message
    await db.admin_messages.delete_one({"id": message_id})
    
    return {"success": True, "message": "Message supprimé"}


@router.delete("/admin/messages/{message_id}")
async def admin_delete_message(message_id: str, current_user: User = Depends(get_current_user)):
    """Supprimer un message (admin seulement)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    # Vérifier que le message existe
    message = await db.admin_messages.find_one({"id": message_id})
    
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    # Supprimer le message
    await db.admin_messages.delete_one({"id": message_id})
    
    return {"success": True, "message": "Message supprimé"}

