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
                                    <a href="https://femme-enceinte-app.preview.emergentagent.com/medical" 
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
    
    # Start the scheduler
    scheduler.start()
    print("[Scheduler] Background scheduler started - checking reminders every minute, weekly tips daily at 9:00 AM")


def stop_scheduler():
    """Stop the background scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Background scheduler stopped")
