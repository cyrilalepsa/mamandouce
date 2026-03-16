"""
Admin routes for MamanDouce
Handles: Users management, Promo codes, Food validation, Messages
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import logging
import json

from core.database import db
from core.config import RESEND_API_KEY, SENDER_EMAIL, VAPID_PRIVATE_KEY, VAPID_CLAIMS_EMAIL
from core.security import get_admin_user
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
async def generate_promo_codes(count: int = 1, note: str = "", admin: User = Depends(get_admin_user)):
    """Generate promo codes for beta testers (admin only)"""
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
async def list_promo_codes(admin: User = Depends(get_admin_user)):
    """List all promo codes (admin only)"""
    codes = await db.promo_codes.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {
        "codes": codes,
        "total": len(codes),
        "used": len([c for c in codes if c.get("used")]),
        "available": len([c for c in codes if not c.get("used")])
    }

# ==================== USERS ====================

@router.get("/admin/users")
async def get_admin_users(admin: User = Depends(get_admin_user)):
    """Get all registered users with their status"""
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

@router.get("/admin/stats")
async def get_admin_stats(admin: User = Depends(get_admin_user)):
    """Get global statistics for admin dashboard"""
    # Count users by status
    users = await db.users.find({}, {"_id": 0, "subscription_status": 1, "premium_source": 1}).to_list(10000)
    
    premium_count = 0
    beta_count = 0
    free_count = 0
    
    for user in users:
        sub_status = user.get("subscription_status", "free")
        premium_source = user.get("premium_source", "")
        
        if sub_status == "premium":
            if premium_source == "promo_code":
                beta_count += 1
            else:
                premium_count += 1
        else:
            free_count += 1
    
    # Get visit stats
    visits_doc = await db.site_stats.find_one({"type": "visits"}, {"_id": 0})
    registrations_doc = await db.site_stats.find_one({"type": "registrations"}, {"_id": 0})
    
    # Get unread messages count
    unread_messages = await db.admin_messages.count_documents({"is_read": False})
    
    # Get pending foods count
    pending_foods = await db.user_added_foods.count_documents({"status": "pending"})
    
    return {
        "users": {
            "total": len(users),
            "premium": premium_count,
            "beta_tester": beta_count,
            "free": free_count
        },
        "visits": visits_doc.get("count", 0) if visits_doc else 0,
        "registrations": registrations_doc.get("count", 0) if registrations_doc else len(users),
        "unread_messages": unread_messages,
        "pending_foods": pending_foods
    }

# ==================== USER MANAGEMENT ====================

@router.post("/admin/user/{user_id}/set-premium")
async def set_user_premium(user_id: str, premium: bool = True, admin: User = Depends(get_admin_user)):
    """Passer une utilisatrice en premium ou retirer le premium (admin only)"""
    from routes.push_notifications import send_push_notification
    
    # Trouver l'utilisateur
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisatrice non trouvée")
    
    if premium:
        # Passer en premium
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "subscription_status": "premium",
                "premium_source": "admin_granted",
                "subscription_start_date": datetime.now(timezone.utc).isoformat(),
                "premium_granted_by": admin.email,
                "premium_granted_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Notifier l'utilisatrice
        try:
            await send_push_notification(
                user_email=user["email"],
                title="Accès Premium activé !",
                body="Félicitations ! Vous avez maintenant accès à toutes les fonctionnalités premium.",
                url="/"
            )
        except:
            pass
        
        return {
            "success": True,
            "message": f"Premium activé pour {user['email']}",
            "user_email": user["email"]
        }
    else:
        # Retirer le premium
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "subscription_status": "free",
                "premium_removed_by": admin.email,
                "premium_removed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {
            "success": True,
            "message": f"Premium retiré pour {user['email']}",
            "user_email": user["email"]
        }

@router.post("/admin/user/{user_id}/set-postpartum")
async def set_user_postpartum(user_id: str, enabled: bool = True, admin: User = Depends(get_admin_user)):
    """Activer ou désactiver l'accès post-partum pour une utilisatrice (admin only)"""
    from routes.push_notifications import send_push_notification
    
    # Trouver l'utilisateur
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisatrice non trouvée")
    
    if enabled:
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "postpartum_purchased": True,
                "postpartum_source": "admin_granted",
                "postpartum_granted_by": admin.email,
                "postpartum_granted_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        try:
            await send_push_notification(
                user_email=user["email"],
                title="Suivi Post-partum activé !",
                body="Vous avez maintenant accès au suivi post-partum.",
                url="/postpartum"
            )
        except:
            pass
        
        return {"success": True, "message": f"Post-partum activé pour {user['email']}"}
    else:
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"postpartum_purchased": False}}
        )
        return {"success": True, "message": f"Post-partum désactivé pour {user['email']}"}

# ==================== ADMIN ROLE MANAGEMENT ====================

@router.post("/admin/user/{user_id}/set-role")
async def set_user_role(user_id: str, role: str = "user", admin: User = Depends(get_admin_user)):
    """Promouvoir ou révoquer un administrateur (admin only)"""
    from routes.push_notifications import send_push_notification
    
    if role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Role invalide (admin ou user)")
    
    # Trouver l'utilisateur
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisatrice non trouvée")
    
    # Empêcher de se retirer ses propres droits admin
    if user.get("email") == admin.email and role == "user":
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous retirer vos propres droits admin")
    
    # Mettre à jour le rôle
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "role": role,
            "role_changed_by": admin.email,
            "role_changed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Notifier l'utilisateur
    try:
        if role == "admin":
            await send_push_notification(
                user_email=user["email"],
                title="Droits administrateur accordés !",
                body="Vous avez maintenant accès au panneau d'administration.",
                url="/admin"
            )
        else:
            await send_push_notification(
                user_email=user["email"],
                title="Droits administrateur retirés",
                body="Vos droits d'administration ont été révoqués.",
                url="/"
            )
    except:
        pass
    
    action = "promu administrateur" if role == "admin" else "rétrogradé en utilisateur"
    return {
        "success": True,
        "message": f"{user['email']} a été {action}",
        "user_email": user["email"],
        "new_role": role
    }

# ==================== FOODS ====================

@router.get("/admin/pending-foods")
async def get_pending_foods(admin: User = Depends(get_admin_user)):
    """Get all user-submitted foods pending approval"""
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
async def update_food_status(food_id: str, status: str, admin: User = Depends(get_admin_user)):
    """Approve or reject a user-submitted food"""
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
async def get_admin_messages(admin: User = Depends(get_admin_user)):
    """Get all messages sent to admin"""
    messages = await db.admin_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    stats = {
        "total": len(messages),
        "unread": len([m for m in messages if not m.get("is_read")])
    }
    
    return {"messages": messages, "stats": stats}

@router.post("/admin/messages/{message_id}/read")
async def mark_message_read(message_id: str, admin: User = Depends(get_admin_user)):
    """Mark a message as read"""
    result = await db.admin_messages.update_one(
        {"id": message_id},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    return {"success": True}

@router.post("/admin/messages/{message_id}/reply")
async def reply_to_message(message_id: str, request: AdminReplyRequest, admin: User = Depends(get_admin_user)):
    """Reply to a user message and send email + push notification"""
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



# ==================== REMINDERS DASHBOARD ====================

@router.get("/admin/reminders/dashboard")
async def get_reminders_dashboard(admin: User = Depends(get_admin_user)):
    """Get dashboard data for appointment reminders"""
    from core.scheduler import scheduler
    
    now = datetime.now(timezone.utc)
    
    # Get all reminders
    all_reminders = await db.appointment_reminders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    # Get reminder history (sent reminders with status)
    reminder_history = await db.reminder_history.find({}, {"_id": 0}).sort("sent_at", -1).to_list(100)
    
    # Calculate stats
    total_reminders = len(all_reminders)
    pending_reminders = len([r for r in all_reminders if not r.get("sent")])
    sent_reminders = len([r for r in all_reminders if r.get("sent")])
    
    # Due reminders (should have been sent)
    due_reminders = [r for r in all_reminders if not r.get("sent") and r.get("reminder_datetime", "") <= now.isoformat()]
    
    # Scheduler status
    scheduler_status = {
        "running": scheduler.running,
        "jobs": [{"id": job.id, "name": job.name, "next_run": job.next_run_time.isoformat() if job.next_run_time else None} for job in scheduler.get_jobs()]
    }
    
    # Group by type
    by_type = {"push": 0, "email": 0, "both": 0}
    for r in all_reminders:
        rtype = r.get("reminder_type", "push")
        by_type[rtype] = by_type.get(rtype, 0) + 1
    
    # Group by user
    users_with_reminders = {}
    for r in all_reminders:
        email = r.get("user_email", "unknown")
        if email not in users_with_reminders:
            users_with_reminders[email] = {"pending": 0, "sent": 0}
        if r.get("sent"):
            users_with_reminders[email]["sent"] += 1
        else:
            users_with_reminders[email]["pending"] += 1
    
    return {
        "stats": {
            "total": total_reminders,
            "pending": pending_reminders,
            "sent": sent_reminders,
            "due_now": len(due_reminders),
            "by_type": by_type
        },
        "scheduler": scheduler_status,
        "users_with_reminders": users_with_reminders,
        "recent_reminders": all_reminders[:20],
        "history": reminder_history[:50]
    }


@router.get("/admin/reminders/all")
async def get_all_reminders(
    status: str = "all",  # all, pending, sent
    admin: User = Depends(get_admin_user)
):
    """Get all reminders with optional filtering"""
    query = {}
    if status == "pending":
        query["sent"] = False
    elif status == "sent":
        query["sent"] = True
    
    reminders = await db.appointment_reminders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    return {
        "reminders": reminders,
        "total": len(reminders),
        "filter": status
    }


@router.get("/admin/reminders/history")
async def get_reminder_history(limit: int = 100, admin: User = Depends(get_admin_user)):
    """Get history of sent reminders with success/failure status"""
    history = await db.reminder_history.find({}, {"_id": 0}).sort("sent_at", -1).to_list(limit)
    
    # Calculate success rate
    total = len(history)
    success = len([h for h in history if h.get("status") == "success"])
    failed = len([h for h in history if h.get("status") == "failed"])
    partial = len([h for h in history if h.get("status") == "partial"])
    
    return {
        "history": history,
        "stats": {
            "total": total,
            "success": success,
            "failed": failed,
            "partial": partial,
            "success_rate": round(success / total * 100, 1) if total > 0 else 0
        }
    }


@router.post("/admin/reminders/send-now")
async def admin_send_due_reminders(admin: User = Depends(get_admin_user)):
    """Manually trigger sending of all due reminders (admin only)"""
    from core.scheduler import send_due_reminders_job
    
    await send_due_reminders_job()
    
    return {"success": True, "message": "Rappels dus envoyés"}


@router.delete("/admin/reminders/{reminder_id}")
async def admin_delete_reminder(reminder_id: str, admin: User = Depends(get_admin_user)):
    """Delete a specific reminder (admin only)"""
    result = await db.appointment_reminders.delete_one({"id": reminder_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rappel non trouvé")
    
    return {"success": True, "message": "Rappel supprimé"}
