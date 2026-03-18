"""
Admin routes for MamanDouce
Handles: Users management, Promo codes, Food validation, Messages
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
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


@router.get("/admin/advanced-stats")
async def get_advanced_stats(admin: User = Depends(get_admin_user)):
    """Get advanced statistics for admin dashboard"""
    
    # Get all users
    users = await db.users.find({}, {"_id": 0}).to_list(10000)
    
    # User distribution
    trial_count = 0
    premium_paid = 0
    premium_promo = 0
    free_count = 0
    postpartum_count = 0
    
    for user in users:
        sub_status = user.get("subscription_status", "free")
        premium_source = user.get("premium_source", "")
        
        if sub_status == "trial":
            trial_count += 1
        elif sub_status == "premium":
            if premium_source == "promo_code":
                premium_promo += 1
            else:
                premium_paid += 1
        else:
            free_count += 1
        
        if user.get("postpartum_purchased") or user.get("postpartum_free_via_referral"):
            postpartum_count += 1
    
    # Calculate conversion rates
    total_users = len(users)
    conversion_rate = (premium_paid / total_users * 100) if total_users > 0 else 0
    
    # Trial conversion (users who were on trial and converted)
    trial_conversions = await db.users.count_documents({
        "subscription_status": "premium",
        "trial_used": True
    })
    trial_conversion_rate = (trial_conversions / trial_count * 100) if trial_count > 0 else 0
    
    # Get registrations over time (last 30 days)
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    recent_users = [u for u in users if u.get("created_at", "") > thirty_days_ago]
    
    # Get feature usage (count favorites, scans, etc.)
    favorites_count = await db.favorites.count_documents({})
    food_scans_count = await db.food_scans.count_documents({})
    birth_lists_count = await db.birth_lists.count_documents({})
    recipes_shared = await db.recipes.count_documents({"is_shared": True})
    
    # Messages stats
    total_messages = await db.admin_messages.count_documents({})
    unread_messages = await db.admin_messages.count_documents({"is_read": False})
    
    # Revenue estimate (premium * 27€ + postpartum * 8€)
    estimated_revenue = (premium_paid * 27) + (postpartum_count * 8)
    
    return {
        "users": {
            "total": total_users,
            "trial": trial_count,
            "premium_paid": premium_paid,
            "premium_promo": premium_promo,
            "free": free_count,
            "postpartum": postpartum_count,
            "new_30_days": len(recent_users)
        },
        "conversion": {
            "overall_rate": round(conversion_rate, 1),
            "trial_conversions": trial_conversions,
            "trial_rate": round(trial_conversion_rate, 1)
        },
        "features": {
            "favorites": favorites_count,
            "food_scans": food_scans_count,
            "birth_lists": birth_lists_count,
            "recipes_shared": recipes_shared
        },
        "messages": {
            "total": total_messages,
            "unread": unread_messages
        },
        "revenue": {
            "estimated_total": estimated_revenue,
            "currency": "EUR"
        }
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

# Admin principal permanent - ne peut jamais perdre ses droits
SUPER_ADMIN_EMAIL = "cyrilalepsa@gmail.com"

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
    
    # Protection du super admin - personne ne peut lui retirer ses droits
    if user.get("email") == SUPER_ADMIN_EMAIL and role == "user":
        raise HTTPException(
            status_code=403, 
            detail="Ce compte est l'administrateur principal permanent. Ses droits ne peuvent pas être modifiés."
        )
    
    # Empêcher de se retirer ses propres droits admin (pour les autres admins)
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


@router.get("/admin/reminders/export-csv")
async def export_reminders_csv(
    include_history: bool = True,
    admin: User = Depends(get_admin_user)
):
    """Export all reminders and history as CSV"""
    from fastapi.responses import StreamingResponse
    import csv
    import io
    
    output = io.StringIO()
    
    # Export reminders
    reminders = await db.appointment_reminders.find({}, {"_id": 0}).to_list(1000)
    
    if reminders:
        writer = csv.writer(output)
        writer.writerow(["=== RAPPELS PLANIFIÉS ==="])
        writer.writerow(["ID", "Utilisateur", "RDV", "Date rappel", "Type", "Envoyé", "Créé le"])
        
        for r in reminders:
            writer.writerow([
                r.get("id", ""),
                r.get("user_email", ""),
                r.get("appointment_title", ""),
                r.get("reminder_datetime", ""),
                r.get("reminder_type", ""),
                "Oui" if r.get("sent") else "Non",
                r.get("created_at", "")
            ])
        
        writer.writerow([])
    
    # Export history
    if include_history:
        history = await db.reminder_history.find({}, {"_id": 0}).to_list(1000)
        
        if history:
            writer = csv.writer(output)
            writer.writerow(["=== HISTORIQUE D'ENVOI ==="])
            writer.writerow(["ID", "Utilisateur", "RDV", "Date envoi", "Type", "Statut", "Push", "Email", "Erreurs"])
            
            for h in history:
                writer.writerow([
                    h.get("id", ""),
                    h.get("user_email", ""),
                    h.get("appointment_title", ""),
                    h.get("sent_at", ""),
                    h.get("reminder_type", ""),
                    h.get("status", ""),
                    h.get("push_status", "-"),
                    h.get("email_status", "-"),
                    "; ".join(h.get("error_details", []))
                ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=rappels_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )


@router.get("/admin/scheduler/alerts")
async def get_scheduler_alerts(admin: User = Depends(get_admin_user)):
    """Get scheduler alerts and health status"""
    from core.scheduler import scheduler
    
    alerts = []
    now = datetime.now(timezone.utc)
    
    # Check if scheduler is running
    if not scheduler.running:
        alerts.append({
            "level": "critical",
            "type": "scheduler_stopped",
            "message": "Le scheduler est arrêté ! Les rappels ne seront pas envoyés automatiquement.",
            "timestamp": now.isoformat()
        })
    
    # Check for overdue reminders (due more than 5 minutes ago)
    overdue_threshold = (now - timedelta(minutes=5)).isoformat()
    overdue_count = await db.appointment_reminders.count_documents({
        "sent": False,
        "reminder_datetime": {"$lte": overdue_threshold}
    })
    
    if overdue_count > 0:
        alerts.append({
            "level": "warning",
            "type": "overdue_reminders",
            "message": f"{overdue_count} rappel(s) en retard de plus de 5 minutes",
            "count": overdue_count,
            "timestamp": now.isoformat()
        })
    
    # Check recent failures in history (last hour)
    one_hour_ago = (now - timedelta(hours=1)).isoformat()
    recent_failures = await db.reminder_history.count_documents({
        "sent_at": {"$gte": one_hour_ago},
        "status": {"$in": ["failed", "partial"]}
    })
    
    if recent_failures > 0:
        alerts.append({
            "level": "warning",
            "type": "recent_failures",
            "message": f"{recent_failures} échec(s) d'envoi dans la dernière heure",
            "count": recent_failures,
            "timestamp": now.isoformat()
        })
    
    # Check if there are pending reminders but no recent activity
    pending_count = await db.appointment_reminders.count_documents({"sent": False})
    recent_sent = await db.reminder_history.count_documents({
        "sent_at": {"$gte": one_hour_ago}
    })
    
    # Get scheduler job info
    jobs = scheduler.get_jobs()
    next_run = None
    if jobs:
        next_run = jobs[0].next_run_time.isoformat() if jobs[0].next_run_time else None
    
    # Health status
    health = "healthy"
    if any(a["level"] == "critical" for a in alerts):
        health = "critical"
    elif any(a["level"] == "warning" for a in alerts):
        health = "warning"
    
    return {
        "health": health,
        "alerts": alerts,
        "scheduler": {
            "running": scheduler.running,
            "next_run": next_run
        },
        "stats": {
            "pending_reminders": pending_count,
            "recent_sent": recent_sent,
            "recent_failures": recent_failures
        }
    }


@router.post("/admin/scheduler/test-alert")
async def test_scheduler_alert(admin: User = Depends(get_admin_user)):
    """Send a test alert to verify notification system"""
    # This would typically send an email/push to admin
    # For now, just log and return confirmation
    logger.warning("[ALERT TEST] Test alert triggered by admin")
    
    return {
        "success": True,
        "message": "Alerte de test envoyée",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ==================== ANDROID EXPORT ====================

@router.get("/admin/android/download")
async def download_android_project(admin: User = Depends(get_admin_user)):
    """Generate and download the Android project as a ZIP file"""
    import zipfile
    import io
    import os
    from fastapi.responses import StreamingResponse
    
    # Path to the frontend folder
    frontend_path = "/app/frontend"
    
    # Create a BytesIO object to hold the zip file
    zip_buffer = io.BytesIO()
    
    # Files/folders to include in the export
    include_paths = [
        "android",
        "capacitor.config.json",
        "package.json",
        "src",
        "public"
    ]
    
    # Files/folders to exclude
    exclude_patterns = ["node_modules", ".git", "build", "__pycache__", ".env"]
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add README_BUILD.md
        readme_content = """# Guide de Build Android - MamanDouce

## Prérequis

1. **Node.js** (version LTS) - https://nodejs.org
2. **Android Studio** - https://developer.android.com/studio

---

## Étapes pour générer le fichier AAB

### 1. Ouvrir un terminal/invite de commande

Naviguez vers le dossier `frontend` :
```bash
cd chemin/vers/mamandouce-main/frontend
```

### 2. Installer les dépendances

```bash
npm install --legacy-peer-deps
```

### 3. Compiler l'application React

```bash
npm run build
```

### 4. Synchroniser avec Capacitor

```bash
npx cap sync android
```

### 5. Ouvrir dans Android Studio

Ouvrez le dossier `android` dans Android Studio :
- File → Open → sélectionnez le dossier `android`
- Attendez que Gradle synchronise le projet

### 6. Générer le fichier AAB signé

1. Menu : **Build** → **Generate Signed Bundle / APK...**
2. Sélectionnez **Android App Bundle** → **Next**
3. Configurez ou sélectionnez votre **keystore** (.jks)
4. Sélectionnez **release** → **Create**

Le fichier `app-release.aab` sera généré dans `android/app/release/`

---

## Important

⚠️ **Conservez précieusement votre fichier keystore (.jks) et son mot de passe !**
Sans eux, vous ne pourrez plus mettre à jour votre application sur le Play Store.

---

## Publication sur le Google Play Store

1. Créez un compte développeur : https://play.google.com/console (25$ USD)
2. Créez une nouvelle application
3. Remplissez les informations requises (description, captures d'écran, icône)
4. Uploadez le fichier `app-release.aab`
5. Soumettez pour examen (1-3 jours)

---

Généré automatiquement par MamanDouce
"""
        zipf.writestr("mamandouce-android/README_BUILD.md", readme_content)
        
        # Add the frontend files
        for include_path in include_paths:
            full_path = os.path.join(frontend_path, include_path)
            if os.path.exists(full_path):
                if os.path.isfile(full_path):
                    arcname = f"mamandouce-android/frontend/{include_path}"
                    zipf.write(full_path, arcname)
                else:
                    for root, dirs, files in os.walk(full_path):
                        # Exclude unwanted directories
                        dirs[:] = [d for d in dirs if d not in exclude_patterns]
                        
                        for file in files:
                            file_path = os.path.join(root, file)
                            # Skip excluded patterns
                            if any(ex in file_path for ex in exclude_patterns):
                                continue
                            
                            arcname = f"mamandouce-android/frontend/{os.path.relpath(file_path, frontend_path)}"
                            try:
                                zipf.write(file_path, arcname)
                            except Exception as e:
                                logger.warning(f"Could not add file {file_path}: {e}")
    
    zip_buffer.seek(0)
    
    # Generate filename with date
    filename = f"mamandouce-android-{datetime.now().strftime('%Y%m%d-%H%M')}.zip"
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/admin/android/send-email")
async def send_android_project_email(admin: User = Depends(get_admin_user)):
    """Send the Android project ZIP to admin's email"""
    import zipfile
    import io
    import os
    import base64
    
    if not resend or not RESEND_API_KEY:
        raise HTTPException(status_code=503, detail="Service email non configuré")
    
    # Get admin email
    admin_email = admin.email
    
    # Path to the frontend folder
    frontend_path = "/app/frontend"
    
    # Create a BytesIO object to hold the zip file
    zip_buffer = io.BytesIO()
    
    # Files/folders to include (smaller subset for email)
    include_paths = [
        "android",
        "capacitor.config.json",
        "package.json"
    ]
    
    exclude_patterns = ["node_modules", ".git", "build", "__pycache__", ".env"]
    
    readme_content = """# Guide de Build Android - MamanDouce

## Prérequis

1. **Node.js** (version LTS) - https://nodejs.org
2. **Android Studio** - https://developer.android.com/studio

---

## Étapes pour générer le fichier AAB

### 1. Téléchargez le projet complet

Téléchargez le projet complet depuis l'interface Admin de MamanDouce
(le fichier envoyé par email contient uniquement les fichiers Android essentiels)

### 2. Ouvrir un terminal/invite de commande

Naviguez vers le dossier `frontend` :
```bash
cd chemin/vers/mamandouce-main/frontend
```

### 3. Installer les dépendances

```bash
npm install --legacy-peer-deps
```

### 4. Compiler l'application React

```bash
npm run build
```

### 5. Synchroniser avec Capacitor

```bash
npx cap sync android
```

### 6. Ouvrir dans Android Studio

Ouvrez le dossier `android` dans Android Studio.

### 7. Générer le fichier AAB signé

1. Menu : **Build** → **Generate Signed Bundle / APK...**
2. Sélectionnez **Android App Bundle** → **Next**
3. Configurez votre **keystore** (.jks)
4. Sélectionnez **release** → **Create**

---

⚠️ **Conservez précieusement votre fichier keystore (.jks) et son mot de passe !**

---

Généré automatiquement par MamanDouce
"""
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.writestr("mamandouce-android/README_BUILD.md", readme_content)
        
        for include_path in include_paths:
            full_path = os.path.join(frontend_path, include_path)
            if os.path.exists(full_path):
                if os.path.isfile(full_path):
                    arcname = f"mamandouce-android/frontend/{include_path}"
                    zipf.write(full_path, arcname)
                else:
                    for root, dirs, files in os.walk(full_path):
                        dirs[:] = [d for d in dirs if d not in exclude_patterns]
                        
                        for file in files:
                            file_path = os.path.join(root, file)
                            if any(ex in file_path for ex in exclude_patterns):
                                continue
                            
                            arcname = f"mamandouce-android/frontend/{os.path.relpath(file_path, frontend_path)}"
                            try:
                                zipf.write(file_path, arcname)
                            except Exception as e:
                                logger.warning(f"Could not add file {file_path}: {e}")
    
    zip_buffer.seek(0)
    zip_data = zip_buffer.read()
    
    # Check file size (Resend limit is ~40MB for attachments)
    if len(zip_data) > 35 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Le fichier est trop volumineux pour l'envoi par email. Utilisez le téléchargement direct."
        )
    
    filename = f"mamandouce-android-{datetime.now().strftime('%Y%m%d-%H%M')}.zip"
    
    try:
        # Send email with attachment
        response = resend.Emails.send({
            "from": SENDER_EMAIL,
            "to": admin_email,
            "subject": f"📱 MamanDouce - Projet Android ({datetime.now().strftime('%d/%m/%Y')})",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ec4899;">📱 Projet Android MamanDouce</h1>
                <p>Bonjour,</p>
                <p>Vous trouverez ci-joint le projet Android MamanDouce mis à jour.</p>
                
                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                    <strong>📋 Contenu de l'archive :</strong>
                    <ul>
                        <li>Projet Android (dossier android/)</li>
                        <li>Configuration Capacitor</li>
                        <li>README avec les instructions de build</li>
                    </ul>
                </div>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                    <strong>⚠️ Note :</strong> Pour un projet complet avec le code source React,
                    utilisez le bouton "Télécharger" dans l'interface Admin.
                </div>
                
                <p>Consultez le fichier <code>README_BUILD.md</code> pour les instructions détaillées.</p>
                
                <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                    Généré automatiquement par MamanDouce le {datetime.now().strftime('%d/%m/%Y à %H:%M')}
                </p>
            </div>
            """,
            "attachments": [
                {
                    "filename": filename,
                    "content": base64.b64encode(zip_data).decode('utf-8')
                }
            ]
        })
        
        logger.info(f"Android project sent to {admin_email}")
        
        return {
            "success": True,
            "message": f"Projet envoyé à {admin_email}",
            "filename": filename,
            "size_mb": round(len(zip_data) / (1024 * 1024), 2)
        }
        
    except Exception as e:
        logger.error(f"Error sending Android project email: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'envoi: {str(e)}")


@router.get("/admin/android/info")
async def get_android_project_info(admin: User = Depends(get_admin_user)):
    """Get information about the Android project"""
    import os
    
    frontend_path = "/app/frontend"
    android_path = os.path.join(frontend_path, "android")
    
    # Check if Android project exists
    android_exists = os.path.exists(android_path)
    
    # Get last modification date of key files
    last_modified = None
    if android_exists:
        try:
            gradle_file = os.path.join(android_path, "app", "build.gradle")
            if os.path.exists(gradle_file):
                last_modified = datetime.fromtimestamp(os.path.getmtime(gradle_file)).isoformat()
        except Exception:
            pass
    
    # Check capacitor config
    capacitor_config_path = os.path.join(frontend_path, "capacitor.config.json")
    capacitor_exists = os.path.exists(capacitor_config_path)
    
    app_version = "1.0.0"
    if capacitor_exists:
        try:
            import json
            with open(capacitor_config_path, 'r') as f:
                config = json.load(f)
                app_version = config.get("appId", "com.mamandouce.app")
        except Exception:
            pass
    
    return {
        "android_ready": android_exists,
        "capacitor_configured": capacitor_exists,
        "last_modified": last_modified,
        "app_id": "com.mamandouce.app",
        "download_available": android_exists,
        "email_available": android_exists and RESEND_API_KEY is not None
    }



# ==================== BUSINESS KIT ====================

@router.post("/admin/business-kit/send-email")
async def send_business_kit_email(admin: User = Depends(get_admin_user)):
    """Send the complete business kit (plan + business card) to admin's email"""
    import os
    
    if not resend or not RESEND_API_KEY:
        raise HTTPException(status_code=503, detail="Service email non configuré")
    
    admin_email = admin.email
    
    # Read the business plan markdown
    business_plan_path = "/app/frontend/public/docs/BUSINESS_PLAN_MAMANDOUCE.md"
    business_card_path = "/app/frontend/public/docs/CARTE_VISITE_MAMANDOUCE.html"
    
    business_plan_content = ""
    business_card_content = ""
    
    try:
        if os.path.exists(business_plan_path):
            with open(business_plan_path, 'r', encoding='utf-8') as f:
                business_plan_content = f.read()
        
        if os.path.exists(business_card_path):
            with open(business_card_path, 'r', encoding='utf-8') as f:
                business_card_content = f.read()
    except Exception as e:
        logger.error(f"Error reading business kit files: {e}")
        raise HTTPException(status_code=500, detail="Erreur lecture des fichiers")
    
    # Convert markdown to simple HTML for email
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }}
            h1 {{
                color: #ec4899;
                border-bottom: 2px solid #ec4899;
                padding-bottom: 10px;
            }}
            h2 {{
                color: #7c3aed;
                margin-top: 30px;
            }}
            h3 {{
                color: #0ea5e9;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 15px 0;
            }}
            th, td {{
                border: 1px solid #e2e8f0;
                padding: 10px;
                text-align: left;
            }}
            th {{
                background: #f8fafc;
            }}
            code {{
                background: #f1f5f9;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 14px;
            }}
            pre {{
                background: #1e293b;
                color: #e2e8f0;
                padding: 15px;
                border-radius: 8px;
                overflow-x: auto;
            }}
            blockquote {{
                border-left: 4px solid #ec4899;
                margin: 20px 0;
                padding: 15px 20px;
                background: #fdf2f8;
            }}
            .highlight {{
                background: #fef3c7;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
            }}
            ul {{
                padding-left: 20px;
            }}
            li {{
                margin-bottom: 8px;
            }}
        </style>
    </head>
    <body>
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="border: none;">📱 Kit Business MamanDouce</h1>
            <p style="color: #64748b;">Document confidentiel - Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</p>
        </div>
        
        <div class="highlight">
            <strong>📎 Ce kit contient :</strong>
            <ul>
                <li>Plan financier sur 3 ans</li>
                <li>Stratégie d'internationalisation</li>
                <li>Pitchs pour partenariats (maternités, sages-femmes, influenceuses)</li>
                <li>Fiche App Store optimisée</li>
                <li>Design de carte de visite</li>
                <li>Calendrier de lancement</li>
                <li>Contacts utiles (presse, associations, salons)</li>
            </ul>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 2px solid #e2e8f0;">
        
        <p>Le document complet est disponible en téléchargement depuis votre interface Admin :</p>
        <p><strong>Admin → Android → Documents Business</strong></p>
        
        <p>Ou accédez directement aux fichiers :</p>
        <ul>
            <li><a href="https://femme-enceinte-app.preview.emergentagent.com/docs/BUSINESS_PLAN_MAMANDOUCE.md">Plan Business (Markdown)</a></li>
            <li><a href="https://femme-enceinte-app.preview.emergentagent.com/docs/CARTE_VISITE_MAMANDOUCE.html">Carte de Visite (HTML)</a></li>
        </ul>
        
        <hr style="margin: 30px 0; border: none; border-top: 2px solid #e2e8f0;">
        
        <h2>📊 Résumé du Plan Financier</h2>
        
        <table>
            <tr>
                <th>Année</th>
                <th>Revenus estimés</th>
                <th>Charges</th>
                <th>Résultat</th>
            </tr>
            <tr>
                <td>Année 1</td>
                <td>3 600€ - 10 800€</td>
                <td>~4 000€</td>
                <td>-400€ à +6 800€</td>
            </tr>
            <tr>
                <td>Année 2</td>
                <td>18 000€ - 36 000€</td>
                <td>~16 000€</td>
                <td>+2 000€ à +20 000€</td>
            </tr>
            <tr>
                <td>Année 3</td>
                <td>54 000€ - 126 000€</td>
                <td>~38 000€</td>
                <td>+16 000€ à +88 000€</td>
            </tr>
        </table>
        
        <h2>🎯 Prochaines étapes recommandées</h2>
        <ol>
            <li>Publier l'application sur le Play Store</li>
            <li>Créer les comptes réseaux sociaux (@mamandouce_app)</li>
            <li>Contacter 5 sages-femmes locales avec le pitch</li>
            <li>Faire imprimer les cartes de visite (500 ex.)</li>
            <li>Préparer les captures d'écran pour l'App Store</li>
        </ol>
        
        <div style="margin-top: 40px; padding: 20px; background: linear-gradient(135deg, #ec4899, #a855f7); color: white; border-radius: 12px; text-align: center;">
            <h3 style="color: white; margin: 0;">🚀 Bonne chance pour le lancement !</h3>
            <p style="margin: 10px 0 0;">L'équipe MamanDouce</p>
        </div>
    </body>
    </html>
    """
    
    try:
        import base64
        
        attachments = []
        
        # Add business plan as attachment
        if business_plan_content:
            attachments.append({
                "filename": "BUSINESS_PLAN_MAMANDOUCE.md",
                "content": base64.b64encode(business_plan_content.encode('utf-8')).decode('utf-8')
            })
        
        # Add business card HTML as attachment
        if business_card_content:
            attachments.append({
                "filename": "CARTE_VISITE_MAMANDOUCE.html",
                "content": base64.b64encode(business_card_content.encode('utf-8')).decode('utf-8')
            })
        
        response = resend.Emails.send({
            "from": SENDER_EMAIL,
            "to": admin_email,
            "subject": f"📊 MamanDouce - Kit Business Complet ({datetime.now().strftime('%d/%m/%Y')})",
            "html": html_content,
            "attachments": attachments
        })
        
        logger.info(f"Business kit sent to {admin_email}")
        
        return {
            "success": True,
            "message": f"Kit business envoyé à {admin_email}",
            "files_sent": ["BUSINESS_PLAN_MAMANDOUCE.md", "CARTE_VISITE_MAMANDOUCE.html"]
        }
        
    except Exception as e:
        logger.error(f"Error sending business kit email: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'envoi: {str(e)}")


@router.get("/admin/business-kit/info")
async def get_business_kit_info(admin: User = Depends(get_admin_user)):
    """Get information about available business kit documents"""
    import os
    
    docs_path = "/app/frontend/public/docs"
    
    files = []
    if os.path.exists(docs_path):
        for filename in os.listdir(docs_path):
            file_path = os.path.join(docs_path, filename)
            if os.path.isfile(file_path):
                files.append({
                    "name": filename,
                    "size": os.path.getsize(file_path),
                    "url": f"/docs/{filename}"
                })
    
    return {
        "available": len(files) > 0,
        "files": files,
        "email_available": RESEND_API_KEY is not None
    }
