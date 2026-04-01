"""
Scheduler module for automated tasks like sending reminders.
Uses APScheduler for background job scheduling.
"""
import asyncio
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

# Global scheduler instance
scheduler = AsyncIOScheduler()

async def send_due_reminders_job():
    """Job to send all due reminders - runs every minute"""
    from core.database import db
    from routes.push_notifications import send_push_notification
    from core.config import RESEND_API_KEY, SENDER_EMAIL
    import uuid
    
    try:
        import resend
        if RESEND_API_KEY:
            resend.api_key = RESEND_API_KEY
    except ImportError:
        resend = None
    
    now = datetime.now(timezone.utc)
    
    # Find reminders that are due and not yet sent
    due_reminders = await db.appointment_reminders.find({
        "sent": False,
        "reminder_datetime": {"$lte": now.isoformat()}
    }).to_list(100)
    
    if not due_reminders:
        return
    
    print(f"[Scheduler] Found {len(due_reminders)} due reminders to send")
    
    for reminder in due_reminders:
        history_entry = {
            "id": str(uuid.uuid4()),
            "reminder_id": reminder.get("id"),
            "user_email": reminder.get("user_email"),
            "appointment_title": reminder.get("appointment_title"),
            "reminder_type": reminder.get("reminder_type", "push"),
            "sent_at": now.isoformat(),
            "push_status": None,
            "email_status": None,
            "status": "pending",
            "error_details": []
        }
        
        try:
            reminder_type = reminder.get("reminder_type", "push")
            user_email = reminder["user_email"]
            appointment_title = reminder["appointment_title"]
            
            push_success = False
            email_success = False
            
            # Send push notification
            if reminder_type in ["push", "both"]:
                try:
                    await send_push_notification(
                        user_email=user_email,
                        title="Rappel RDV médical",
                        body=f"N'oubliez pas : {appointment_title}",
                        url="/medical"
                    )
                    push_success = True
                    history_entry["push_status"] = "success"
                    print(f"[Scheduler] Push notification sent to {user_email}")
                except Exception as e:
                    history_entry["push_status"] = "failed"
                    history_entry["error_details"].append(f"Push: {str(e)}")
                    print(f"[Scheduler] Push notification error: {e}")
            
            # Send email notification
            if reminder_type in ["email", "both"] and resend and RESEND_API_KEY and SENDER_EMAIL:
                try:
                    resend.Emails.send({
                        "from": SENDER_EMAIL,
                        "to": user_email,
                        "subject": f"Rappel: {appointment_title}",
                        "html": f"""
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; border-radius: 20px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">Rappel RDV Médical</h1>
                            </div>
                            <div style="padding: 30px 20px;">
                                <h2 style="color: #334155; margin-top: 0;">{appointment_title}</h2>
                                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                                    Bonjour,<br><br>
                                    Ceci est un rappel pour votre rendez-vous médical prévu prochainement.
                                    N'oubliez pas de préparer vos documents et questions pour le médecin.
                                </p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="https://journey-steps-ui.preview.emergentagent.com/medical" 
                                       style="background: linear-gradient(135deg, #ec4899, #8b5cf6); 
                                              color: white; 
                                              text-decoration: none; 
                                              padding: 14px 32px; 
                                              border-radius: 50px; 
                                              font-weight: bold;
                                              display: inline-block;">
                                        Voir mes rendez-vous
                                    </a>
                                </div>
                                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                                    L'équipe MamanDouce vous souhaite une belle grossesse !
                                </p>
                            </div>
                        </div>
                        """
                    })
                    email_success = True
                    history_entry["email_status"] = "success"
                    print(f"[Scheduler] Email sent to {user_email}")
                except Exception as e:
                    history_entry["email_status"] = "failed"
                    history_entry["error_details"].append(f"Email: {str(e)}")
                    print(f"[Scheduler] Email error: {e}")
            
            # Determine overall status
            if reminder_type == "push":
                history_entry["status"] = "success" if push_success else "failed"
            elif reminder_type == "email":
                history_entry["status"] = "success" if email_success else "failed"
            else:  # both
                if push_success and email_success:
                    history_entry["status"] = "success"
                elif push_success or email_success:
                    history_entry["status"] = "partial"
                else:
                    history_entry["status"] = "failed"
            
            # Mark as sent
            await db.appointment_reminders.update_one(
                {"id": reminder["id"]},
                {"$set": {"sent": True, "sent_at": now.isoformat()}}
            )
            print(f"[Scheduler] Reminder {reminder['id']} marked as sent")
            
        except Exception as e:
            history_entry["status"] = "failed"
            history_entry["error_details"].append(f"General: {str(e)}")
            print(f"[Scheduler] Error processing reminder {reminder.get('id')}: {e}")
        
        # Save history entry
        await db.reminder_history.insert_one(history_entry)


async def send_weekly_tips_push_job():
    """Job to send weekly tips push notifications - runs every day at 9:00 AM"""
    from core.database import db
    from routes.push_notifications import send_push_notification
    from datetime import datetime, timezone, timedelta
    
    now = datetime.now(timezone.utc)
    
    # Find users with push enabled and weekly tips enabled
    users_with_push = await db.notification_preferences.find({
        "push_enabled": True,
        "push_weekly_tips": True
    }).to_list(1000)
    
    if not users_with_push:
        return
    
    print(f"[Scheduler] Sending weekly tips push to {len(users_with_push)} users")
    
    for user_pref in users_with_push:
        user_id = user_pref.get("user_id")
        user_email = user_pref.get("email_address")
        
        if not user_email:
            # Get email from user record
            user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1})
            if user:
                user_email = user.get("email")
        
        if not user_email:
            continue
        
        # Get user's pregnancy week
        profile = await db.pregnancy_profiles.find_one({"user_id": user_id})
        if not profile:
            continue
        
        # Calculate current week
        dpa = profile.get("due_date")
        if dpa:
            try:
                due_date = datetime.fromisoformat(dpa.replace('Z', '+00:00'))
                conception_date = due_date - timedelta(weeks=40)
                days_pregnant = (now - conception_date).days
                current_week = max(1, min(42, days_pregnant // 7))
                
                await send_push_notification(
                    user_email=user_email,
                    title=f"Semaine {current_week} de grossesse",
                    body="De nouveaux conseils vous attendent ! Découvrez ce qui se passe cette semaine.",
                    url="/tips"
                )
                print(f"[Scheduler] Weekly tip push sent to {user_email}")
            except Exception as e:
                print(f"[Scheduler] Error sending weekly tip push: {e}")


async def send_trial_expiry_reminders_job():
    """Job to send reminders for trial expiring soon - runs every hour"""
    from core.database import db
    from routes.push_notifications import send_push_notification
    from core.config import RESEND_API_KEY, SENDER_EMAIL
    from datetime import timedelta
    
    try:
        import resend
        if RESEND_API_KEY:
            resend.api_key = RESEND_API_KEY
    except ImportError:
        resend = None
    
    now = datetime.now(timezone.utc)
    
    # Find users whose trial expires in 1 day (23-25 hours from now)
    one_day_from_now_start = (now + timedelta(hours=23)).isoformat()
    one_day_from_now_end = (now + timedelta(hours=25)).isoformat()
    
    users_expiring_tomorrow = await db.users.find({
        "subscription_status": "trial",
        "trial_end_date": {
            "$gte": one_day_from_now_start,
            "$lte": one_day_from_now_end
        },
        "trial_reminder_1day_sent": {"$ne": True}
    }, {"_id": 0}).to_list(100)
    
    for user in users_expiring_tomorrow:
        user_email = user.get("email")
        user_name = user.get("name", "").split()[0] or "Maman"
        
        try:
            # Send push notification
            await send_push_notification(
                user_email=user_email,
                title="Votre essai Premium expire demain !",
                body=f"{user_name}, profitez de 27€ pour 9 mois d'accès illimité à toutes les fonctionnalités.",
                url="/pricing"
            )
            print(f"[Scheduler] Trial expiry reminder (1 day) sent to {user_email}")
            
            # Mark as sent
            await db.users.update_one(
                {"email": user_email},
                {"$set": {"trial_reminder_1day_sent": True}}
            )
            
            # Send email if available
            if resend and RESEND_API_KEY and SENDER_EMAIL:
                try:
                    resend.Emails.send({
                        "from": f"MamanDouce <{SENDER_EMAIL}>",
                        "to": [user_email],
                        "reply_to": "support@cycafamily.com",
                        "subject": "⏰ Votre essai Premium expire demain !",
                        "tags": [
                            {"name": "category", "value": "trial-reminder"},
                            {"name": "app", "value": "mamandouce"}
                        ],
                        "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
                    <tr>
                        <td align="center" style="background-color: #8b5cf6; padding: 30px 20px; border-radius: 20px 20px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MamanDouce</h1>
                            <p style="color: #e9d5ff; margin: 10px 0 0 0;">Votre essai se termine bientôt</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 20px 20px;">
                            <h2 style="color: #334155; margin: 0 0 20px 0;">Bonjour {user_name} !</h2>
                            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Votre essai gratuit Premium se termine <strong>demain</strong>.</p>
                            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Pour continuer à profiter de toutes les fonctionnalités :</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
                                <tr><td style="padding: 8px 0; color: #64748b;">✅ Scanner d'aliments illimité</td></tr>
                                <tr><td style="padding: 8px 0; color: #64748b;">✅ Conseils des 41 semaines</td></tr>
                                <tr><td style="padding: 8px 0; color: #64748b;">✅ Chatbot IA personnel</td></tr>
                                <tr><td style="padding: 8px 0; color: #64748b;">✅ Sac de maternité complet</td></tr>
                            </table>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="https://journey-steps-ui.preview.emergentagent.com/pricing" target="_blank" style="background-color: #8b5cf6; border-radius: 30px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; padding: 16px 40px; text-decoration: none;">Passer à Premium - 27€ pour 9 mois</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #94a3b8; font-size: 14px; text-align: center;">Soit seulement 3€/mois • Satisfait ou remboursé 30 jours</p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            <p style="color: #9ca3af; font-size: 12px; text-align: center;">L'équipe MamanDouce 💕</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                        """
                    })
                except Exception as e:
                    print(f"[Scheduler] Error sending trial expiry email: {e}")
                    
        except Exception as e:
            print(f"[Scheduler] Error sending trial reminder to {user_email}: {e}")
    
    # Find users whose trial expires today (in 0-2 hours)
    expiring_now_end = (now + timedelta(hours=2)).isoformat()
    
    users_expiring_now = await db.users.find({
        "subscription_status": "trial",
        "trial_end_date": {
            "$lte": expiring_now_end,
            "$gte": now.isoformat()
        },
        "trial_reminder_final_sent": {"$ne": True}
    }, {"_id": 0}).to_list(100)
    
    for user in users_expiring_now:
        user_email = user.get("email")
        user_name = user.get("name", "").split()[0] or "Maman"
        
        try:
            # Send push notification
            await send_push_notification(
                user_email=user_email,
                title="Dernière chance ! Votre essai expire bientôt",
                body=f"{user_name}, passez à Premium maintenant pour ne pas perdre vos avantages !",
                url="/pricing"
            )
            print(f"[Scheduler] Final trial expiry reminder sent to {user_email}")
            
            # Mark as sent
            await db.users.update_one(
                {"email": user_email},
                {"$set": {"trial_reminder_final_sent": True}}
            )
            
        except Exception as e:
            print(f"[Scheduler] Error sending final trial reminder to {user_email}: {e}")
    
    # Check for expired trials and downgrade to free
    expired_trials = await db.users.find({
        "subscription_status": "trial",
        "trial_end_date": {"$lt": now.isoformat()}
    }, {"_id": 0}).to_list(100)
    
    for user in expired_trials:
        user_email = user.get("email")
        try:
            await db.users.update_one(
                {"email": user_email},
                {"$set": {"subscription_status": "free"}}
            )
            print(f"[Scheduler] Trial expired, downgraded {user_email} to free")
            
            # Send notification
            await send_push_notification(
                user_email=user_email,
                title="Votre essai Premium est terminé",
                body="Vous pouvez toujours passer à Premium à tout moment pour retrouver tous vos avantages !",
                url="/pricing"
            )
        except Exception as e:
            print(f"[Scheduler] Error downgrading {user_email}: {e}")


def start_scheduler():
    """Start the background scheduler"""
    from apscheduler.triggers.cron import CronTrigger
    
    # Add job to check reminders every minute
    scheduler.add_job(
        send_due_reminders_job,
        IntervalTrigger(minutes=1),
        id='send_due_reminders',
        name='Send due appointment reminders',
        replace_existing=True
    )
    
    # Add job for weekly tips push - every day at 9:00 AM UTC
    scheduler.add_job(
        send_weekly_tips_push_job,
        CronTrigger(hour=9, minute=0),
        id='send_weekly_tips_push',
        name='Send weekly tips push notifications',
        replace_existing=True
    )
    
    # Add job for trial expiry reminders - every hour
    scheduler.add_job(
        send_trial_expiry_reminders_job,
        IntervalTrigger(hours=1),
        id='send_trial_expiry_reminders',
        name='Send trial expiry reminders',
        replace_existing=True
    )
    
    # Start the scheduler
    scheduler.start()
    print("[Scheduler] Background scheduler started - reminders every minute, weekly tips daily at 9:00 AM, trial expiry every hour")


def stop_scheduler():
    """Stop the background scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Background scheduler stopped")
