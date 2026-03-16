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
        try:
            reminder_type = reminder.get("reminder_type", "push")
            user_email = reminder["user_email"]
            appointment_title = reminder["appointment_title"]
            
            # Send push notification
            if reminder_type in ["push", "both"]:
                try:
                    await send_push_notification(
                        user_email=user_email,
                        title="Rappel RDV médical",
                        body=f"N'oubliez pas : {appointment_title}",
                        url="/medical"
                    )
                    print(f"[Scheduler] Push notification sent to {user_email}")
                except Exception as e:
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
                    print(f"[Scheduler] Email sent to {user_email}")
                except Exception as e:
                    print(f"[Scheduler] Email error: {e}")
            
            # Mark as sent
            await db.appointment_reminders.update_one(
                {"id": reminder["id"]},
                {"$set": {"sent": True, "sent_at": now.isoformat()}}
            )
            print(f"[Scheduler] Reminder {reminder['id']} marked as sent")
            
        except Exception as e:
            print(f"[Scheduler] Error processing reminder {reminder.get('id')}: {e}")


def start_scheduler():
    """Start the background scheduler"""
    # Add job to check reminders every minute
    scheduler.add_job(
        send_due_reminders_job,
        IntervalTrigger(minutes=1),
        id='send_due_reminders',
        name='Send due appointment reminders',
        replace_existing=True
    )
    
    # Start the scheduler
    scheduler.start()
    print("[Scheduler] Background scheduler started - checking reminders every minute")


def stop_scheduler():
    """Stop the background scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Background scheduler stopped")
