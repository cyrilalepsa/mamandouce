"""
Admin routes for MamanDouce
Handles: Users management, Promo codes, Food validation, Messages
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import logging
import json

from core.database import db
from core.config import ADMIN_SECRET, RESEND_API_KEY, SENDER_EMAIL, VAPID_PRIVATE_KEY, VAPID_CLAIMS_EMAIL
from core.security import get_current_user
from models.schemas import (
    User, PromoCode, AdminMessage, ContactMessageRequest, AdminReplyRequest,
    SubscribeRequest
)

# Optional imports
try:
    import resend
    if RESEND_API_KEY:
        resend.api_key = RESEND_API_KEY
except ImportError:
    resend = None

try:
    from pywebpush import webpush, WebPushException
    WEBPUSH_AVAILABLE = True
except ImportError:
    WEBPUSH_AVAILABLE = False

logger = logging.getLogger(__name__)
router = APIRouter(tags=["admin"])

# ==================== PROMO CODES ====================

@router.post("/admin/generate-codes")
async def generate_promo_codes(count: int = 1, note: str = "", admin_secret: str = ""):
    """Generate promo codes for beta testers (admin only)"""
    if admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    if count < 1 or count > 20:
        raise HTTPException(status_code=400, detail="Nombre de codes entre 1 et 20")
    
    codes = []
    for _ in range(count):
        promo = PromoCode(note=note)
        promo_dict = promo.model_dump()
        promo_dict["created_at"] = promo_dict["created_at"].isoformat()
        await db.promo_codes.insert_one(promo_dict)
        codes.append({"code": promo.code, "note": note})
    
    return {"success": True, "message": f"{count} code(s) généré(s)", "codes": codes}

@router.get("/admin/promo-codes")
async def list_promo_codes(admin_secret: str = ""):
    """List all promo codes (admin only)"""
    if admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    codes = await db.promo_codes.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {
        "codes": codes,
        "total": len(codes),
        "used": len([c for c in codes if c.get("used")]),
        "available": len([c for c in codes if not c.get("used")])
    }

# ==================== USERS ====================

@router.get("/admin/users")
async def get_admin_users(admin_secret: str = ""):
    """Get all registered users with their status"""
    if admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).sort("created_at", -1).to_list(1000)
    
    for user in users:
        sub_status = user.get("subscription_status", "free")
        premium_source = user.get("premium_source", "")
        
        if sub_status == "premium":
            user["display_status"] = "beta_tester" if premium_source == "promo_code" else "premium"
        else:
            user["display_status"] = "free"
    
    stats = {
        "total": len(users),
        "premium": len([u for u in users if u.get("display_status") == "premium"]),
        "beta_tester": len([u for u in users if u.get("display_status") == "beta_tester"]),
        "free": len([u for u in users if u.get("display_status") == "free"])
    }
    
    return {"users": users, "stats": stats}

# ==================== FOODS ====================

@router.get("/admin/pending-foods")
async def get_pending_foods(admin_secret: str = ""):
    """Get all user-submitted foods pending approval"""
    if admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    pending = await db.user_added_foods.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for food in pending:
        user = await db.users.find_one({"id": food.get("user_id")}, {"_id": 0, "email": 1})
        food["user_email"] = user.get("email") if user else "Inconnu"
    
    all_foods = await db.user_added_foods.find({}, {"_id": 0, "status": 1}).to_list(1000)
    stats = {
        "pending": len([f for f in all_foods if f.get("status") == "pending"]),
        "approved": len([f for f in all_foods if f.get("status") == "approved"]),
        "rejected": len([f for f in all_foods if f.get("status") == "rejected"])
    }
    
    return {"foods": pending, "stats": stats}

@router.post("/admin/food-status/{food_id}")
async def update_food_status(food_id: str, status: str, admin_secret: str = ""):
    """Approve or reject a user-submitted food"""
    if admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status invalide")
    
    result = await db.user_added_foods.update_one(
        {"id": food_id},
        {"$set": {"status": status, "reviewed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Aliment non trouvé")
    
    return {"success": True, "status": status}

# ==================== MESSAGES ====================

@router.get("/admin/messages")
async def get_admin_messages(admin_secret: str = ""):
    """Get all messages sent to admin"""
    if admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    messages = await db.admin_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    stats = {
        "total": len(messages),
        "unread": len([m for m in messages if not m.get("is_read")])
    }
    
    return {"messages": messages, "stats": stats}

@router.post("/admin/messages/{message_id}/read")
async def mark_message_read(message_id: str, admin_secret: str = ""):
    """Mark a message as read"""
    if admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    result = await db.admin_messages.update_one(
        {"id": message_id},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    return {"success": True}

@router.post("/admin/messages/{message_id}/reply")
async def reply_to_message(message_id: str, request: AdminReplyRequest, admin_secret: str = ""):
    """Reply to a user message and send email + push notification"""
    if admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    message = await db.admin_messages.find_one({"id": message_id}, {"_id": 0})
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    replied_at = datetime.now(timezone.utc).isoformat()
    await db.admin_messages.update_one(
        {"id": message_id},
        {"$set": {"admin_reply": request.reply, "replied_at": replied_at, "is_read": True}}
    )
    
    # Send email
    email_sent = False
    if resend and RESEND_API_KEY and message.get("user_email"):
        try:
            resend.Emails.send({
                "from": SENDER_EMAIL,
                "to": message["user_email"],
                "subject": f"Réponse à votre message : {message.get('subject', 'Sans sujet')}",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 20px; border-radius: 15px; text-align: center;">
                        <h1 style="color: white; margin: 0;">MamanDouce</h1>
                    </div>
                    <div style="padding: 30px 20px;">
                        <p style="color: #374151;">Bonjour {message.get('user_name', 'Chère utilisatrice')},</p>
                        <p style="color: #374151;">Vous avez reçu une réponse à votre message :</p>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;"><strong>Votre message :</strong></p>
                            <p style="color: #374151; margin: 0;">{message.get('message', '')}</p>
                        </div>
                        <div style="background: linear-gradient(135deg, #fdf2f8, #f5f3ff); padding: 15px; border-radius: 10px; border-left: 4px solid #ec4899;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;"><strong>Notre réponse :</strong></p>
                            <p style="color: #374151; margin: 0;">{request.reply}</p>
                        </div>
                        <p style="color: #374151; margin-top: 30px;">À bientôt sur MamanDouce !</p>
                        <p style="color: #9ca3af; font-size: 12px;">L'équipe MamanDouce</p>
                    </div>
                </div>
                """
            })
            email_sent = True
        except Exception as e:
            logger.error(f"Error sending reply email: {e}")
    
    # Send push notification
    push_sent = False
    if WEBPUSH_AVAILABLE and VAPID_PRIVATE_KEY and message.get("user_email"):
        try:
            push_sent = await send_push_notification_to_user(
                user_email=message["user_email"],
                title="Nouvelle réponse MamanDouce",
                body=f"Vous avez reçu une réponse à votre message : {message.get('subject', 'Sans sujet')}",
                url="/profile"
            )
        except Exception as e:
            logger.error(f"Error sending push notification: {e}")
    
    return {
        "success": True,
        "email_sent": email_sent,
        "push_sent": push_sent,
        "message": "Réponse envoyée" + (" et email envoyé" if email_sent else "") + (" et notification push envoyée" if push_sent else "")
    }

# ==================== HELPER FUNCTIONS ====================

async def send_push_notification_to_user(user_email: str, title: str, body: str, url: str = "/profile"):
    """Send a push notification to a specific user"""
    if not WEBPUSH_AVAILABLE or not VAPID_PRIVATE_KEY:
        return False
    
    subscriptions = await db.push_subscriptions.find(
        {"user_email": user_email, "active": True},
        {"_id": 0}
    ).to_list(10)
    
    if not subscriptions:
        return False
    
    success_count = 0
    for sub in subscriptions:
        try:
            subscription_info = {"endpoint": sub["endpoint"], "keys": sub["keys"]}
            data = json.dumps({"title": title, "body": body, "url": url})
            
            webpush(
                subscription_info=subscription_info,
                data=data,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{VAPID_CLAIMS_EMAIL}"}
            )
            success_count += 1
        except WebPushException as e:
            if e.response and e.response.status_code in [404, 410]:
                await db.push_subscriptions.update_one(
                    {"endpoint": sub["endpoint"]},
                    {"$set": {"active": False}}
                )
        except Exception as e:
            logger.error(f"Push error: {e}")
    
    return success_count > 0
