"""
Medical routes for MamanDouce
Handles: Medical appointments, Notes, Health summary
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
import uuid

from core.database import db
from core.security import get_current_user
from models.schemas import User, AppointmentNote

router = APIRouter(tags=["medical"])

# Medical appointments data
MEDICAL_APPOINTMENTS = [
    {"id": "apt_1", "week_start": 5, "week_end": 8, "title": "1ère consultation prénatale", "description": "Confirmation de grossesse, prise de sang, examens de base", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_2", "week_start": 11, "week_end": 13, "title": "Échographie T1 (Datation)", "description": "Datation de la grossesse, dépistage trisomie 21, mesure clarté nucale", "type": "mandatory", "professional": "Échographiste"},
    {"id": "apt_3", "week_start": 12, "week_end": 14, "title": "Consultation 2ème mois", "description": "Suivi de grossesse, résultats des examens", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_4", "week_start": 16, "week_end": 18, "title": "Consultation 4ème mois", "description": "Suivi, écoute du cœur fœtal", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_5", "week_start": 20, "week_end": 22, "title": "Consultation 5ème mois", "description": "Suivi de grossesse", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_6", "week_start": 21, "week_end": 23, "title": "Échographie T2 (Morphologique)", "description": "Examen détaillé des organes du bébé, sexe si souhaité", "type": "mandatory", "professional": "Échographiste"},
    {"id": "apt_7", "week_start": 24, "week_end": 26, "title": "Consultation 6ème mois", "description": "Suivi, test de glucose (O'Sullivan)", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_8", "week_start": 26, "week_end": 28, "title": "Inscription maternité", "description": "Visite de la maternité, constitution du dossier", "type": "recommended", "professional": "Maternité"},
    {"id": "apt_9", "week_start": 28, "week_end": 30, "title": "Consultation 7ème mois", "description": "Suivi, 3ème prise de sang", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_10", "week_start": 31, "week_end": 33, "title": "Échographie T3 (Croissance)", "description": "Croissance du bébé, position, liquide amniotique", "type": "mandatory", "professional": "Échographiste"},
    {"id": "apt_11", "week_start": 32, "week_end": 34, "title": "Consultation 8ème mois (1)", "description": "Suivi de grossesse", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_12", "week_start": 34, "week_end": 36, "title": "Consultation 8ème mois (2)", "description": "Suivi, monitoring si nécessaire", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_13", "week_start": 35, "week_end": 37, "title": "Consultation anesthésiste", "description": "Rendez-vous obligatoire pour péridurale éventuelle", "type": "mandatory", "professional": "Anesthésiste"},
    {"id": "apt_14", "week_start": 35, "week_end": 37, "title": "Prélèvement vaginal", "description": "Dépistage streptocoque B", "type": "mandatory", "professional": "Laboratoire"},
    {"id": "apt_15", "week_start": 36, "week_end": 38, "title": "Consultation 9ème mois (1)", "description": "Suivi de grossesse", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_16", "week_start": 37, "week_end": 38, "title": "Valise maternité", "description": "Préparer la valise pour la maternité", "type": "recommended", "professional": "À domicile"},
    {"id": "apt_17", "week_start": 38, "week_end": 39, "title": "Consultation 9ème mois (2)", "description": "Suivi, vérification position bébé", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_18", "week_start": 39, "week_end": 40, "title": "Consultation 9ème mois (3)", "description": "Suivi pré-accouchement", "type": "mandatory", "professional": "Gynécologue/Sage-femme"},
    {"id": "apt_19", "week_start": 40, "week_end": 41, "title": "Surveillance terme", "description": "Monitoring, vérification bien-être bébé", "type": "mandatory", "professional": "Maternité"},
    {"id": "apt_20", "week_start": 41, "week_end": 42, "title": "Dépassement de terme", "description": "Surveillance renforcée, déclenchement possible", "type": "mandatory", "professional": "Maternité"},
]

async def get_medical_appointments():
    return MEDICAL_APPOINTMENTS

# ==================== APPOINTMENTS ====================

@router.get("/medical/appointments")
async def get_user_medical_appointments(current_user: User = Depends(get_current_user)):
    """Get all medical appointments based on user's pregnancy profile"""
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    
    if not profile or not profile.get("last_period_date"):
        return {"appointments": [], "message": "Veuillez d'abord configurer votre profil de grossesse"}
    
    current_week = profile.get("current_week", 1)
    last_period = datetime.fromisoformat(profile["last_period_date"])
    
    all_appointments = await get_medical_appointments()
    
    completed = await db.completed_appointments.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    completed_ids = {c["appointment_id"] for c in completed}
    
    appointments = []
    for apt in all_appointments:
        start_date = last_period + timedelta(weeks=apt["week_start"])
        end_date = last_period + timedelta(weeks=apt["week_end"])
        
        status = "completed" if apt["id"] in completed_ids else (
            "current" if apt["week_start"] <= current_week <= apt["week_end"] else (
                "upcoming" if current_week < apt["week_start"] else "past"
            )
        )
        
        appointments.append({
            **apt,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": status,
            "is_completed": apt["id"] in completed_ids
        })
    
    appointments.sort(key=lambda x: x["week_start"])
    
    return {
        "current_week": current_week,
        "appointments": appointments
    }

@router.get("/medical/upcoming")
async def get_upcoming_appointments(current_user: User = Depends(get_current_user)):
    """Get upcoming and current medical appointments for homepage display"""
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    
    if not profile or not profile.get("last_period_date"):
        return {"appointments": []}
    
    current_week = profile.get("current_week", 1)
    last_period = datetime.fromisoformat(profile["last_period_date"])
    
    all_appointments = await get_medical_appointments()
    
    completed = await db.completed_appointments.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    completed_ids = {c["appointment_id"] for c in completed}
    
    upcoming = []
    for apt in all_appointments:
        if apt["id"] in completed_ids:
            continue
            
        if apt["week_start"] <= current_week + 4 and apt["week_end"] >= current_week:
            start_date = last_period + timedelta(weeks=apt["week_start"])
            end_date = last_period + timedelta(weeks=apt["week_end"])
            
            is_urgent = apt["week_start"] <= current_week <= apt["week_end"]
            
            upcoming.append({
                **apt,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "is_urgent": is_urgent,
                "weeks_until": max(0, apt["week_start"] - current_week)
            })
    
    upcoming.sort(key=lambda x: (not x["is_urgent"], x["week_start"]))
    
    return {"appointments": upcoming[:5]}

@router.post("/medical/complete/{appointment_id}")
async def mark_appointment_completed(appointment_id: str, current_user: User = Depends(get_current_user)):
    """Mark a medical appointment as completed"""
    existing = await db.completed_appointments.find_one({
        "user_id": current_user.id,
        "appointment_id": appointment_id
    })
    
    if existing:
        return {"success": True, "message": "Rendez-vous déjà marqué comme complété"}
    
    await db.completed_appointments.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "appointment_id": appointment_id,
        "completed_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Rendez-vous marqué comme complété"}

@router.delete("/medical/complete/{appointment_id}")
async def unmark_appointment_completed(appointment_id: str, current_user: User = Depends(get_current_user)):
    """Unmark a medical appointment as completed"""
    result = await db.completed_appointments.delete_one({
        "user_id": current_user.id,
        "appointment_id": appointment_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")
    
    return {"success": True, "message": "Rendez-vous marqué comme non complété"}

# ==================== NOTES ====================

@router.post("/medical/notes/{appointment_id}")
async def save_appointment_note(appointment_id: str, note_data: dict, current_user: User = Depends(get_current_user)):
    """Save or update notes for a medical appointment"""
    existing = await db.appointment_notes.find_one({
        "user_id": current_user.id,
        "appointment_id": appointment_id
    })
    
    note_fields = {
        "weight": note_data.get("weight"),
        "blood_pressure_systolic": note_data.get("blood_pressure_systolic"),
        "blood_pressure_diastolic": note_data.get("blood_pressure_diastolic"),
        "baby_heartbeat": note_data.get("baby_heartbeat"),
        "baby_weight": note_data.get("baby_weight"),
        "baby_size": note_data.get("baby_size"),
        "notes": note_data.get("notes"),
        "doctor_name": note_data.get("doctor_name"),
        "next_appointment": note_data.get("next_appointment"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if existing:
        await db.appointment_notes.update_one(
            {"user_id": current_user.id, "appointment_id": appointment_id},
            {"$set": note_fields}
        )
        return {"success": True, "message": "Notes mises à jour", "id": existing["id"]}
    else:
        note_id = str(uuid.uuid4())
        note_dict = {
            "id": note_id,
            "user_id": current_user.id,
            "appointment_id": appointment_id,
            **note_fields,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.appointment_notes.insert_one(note_dict)
        return {"success": True, "message": "Notes enregistrées", "id": note_id}

@router.get("/medical/notes/{appointment_id}")
async def get_appointment_note(appointment_id: str, current_user: User = Depends(get_current_user)):
    """Get notes for a specific appointment"""
    note = await db.appointment_notes.find_one(
        {"user_id": current_user.id, "appointment_id": appointment_id},
        {"_id": 0}
    )
    return note or {}

@router.get("/medical/notes")
async def get_all_appointment_notes(current_user: User = Depends(get_current_user)):
    """Get all appointment notes for the user"""
    notes = await db.appointment_notes.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    
    notes_dict = {n["appointment_id"]: n for n in notes}
    return notes_dict

@router.get("/medical/health-summary")
async def get_health_summary(current_user: User = Depends(get_current_user)):
    """Get a summary of health metrics over time"""
    notes = await db.appointment_notes.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    weight_history = []
    blood_pressure_history = []
    baby_growth_history = []
    
    for note in notes:
        date = note.get("created_at", note.get("updated_at", ""))
        
        if note.get("weight"):
            weight_history.append({
                "date": date,
                "value": note["weight"],
                "appointment_id": note["appointment_id"]
            })
        
        if note.get("blood_pressure_systolic") and note.get("blood_pressure_diastolic"):
            blood_pressure_history.append({
                "date": date,
                "systolic": note["blood_pressure_systolic"],
                "diastolic": note["blood_pressure_diastolic"],
                "appointment_id": note["appointment_id"]
            })
        
        if note.get("baby_weight") or note.get("baby_size"):
            baby_growth_history.append({
                "date": date,
                "weight": note.get("baby_weight"),
                "size": note.get("baby_size"),
                "heartbeat": note.get("baby_heartbeat"),
                "appointment_id": note["appointment_id"]
            })
    
    return {
        "weight_history": weight_history,
        "blood_pressure_history": blood_pressure_history,
        "baby_growth_history": baby_growth_history
    }


# ==================== SCHEDULED REMINDERS ====================

@router.get("/medical/scheduled-reminders")
async def get_scheduled_reminders(current_user: User = Depends(get_current_user)):
    """Get all scheduled appointment reminders for the user"""
    reminders = await db.appointment_reminders.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    
    return {"reminders": reminders}

@router.post("/medical/schedule-reminder")
async def schedule_appointment_reminder(
    reminder_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Schedule a reminder for an appointment"""
    appointment_id = reminder_data.get("appointment_id")
    reminder_datetime = reminder_data.get("reminder_datetime")
    reminder_type = reminder_data.get("reminder_type", "push")  # push, email, both
    
    if not appointment_id or not reminder_datetime:
        raise HTTPException(status_code=400, detail="appointment_id et reminder_datetime requis")
    
    # Validate the appointment exists
    all_appointments = await get_medical_appointments()
    apt = next((a for a in all_appointments if a["id"] == appointment_id), None)
    if not apt:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")
    
    # Check for existing reminder
    existing = await db.appointment_reminders.find_one({
        "user_id": current_user.id,
        "appointment_id": appointment_id
    })
    
    reminder_doc = {
        "user_id": current_user.id,
        "user_email": current_user.email,
        "appointment_id": appointment_id,
        "appointment_title": apt["title"],
        "reminder_datetime": reminder_datetime,
        "reminder_type": reminder_type,
        "sent": False,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if existing:
        await db.appointment_reminders.update_one(
            {"user_id": current_user.id, "appointment_id": appointment_id},
            {"$set": reminder_doc}
        )
        return {"success": True, "message": "Rappel mis à jour", "id": existing.get("id")}
    else:
        reminder_id = str(uuid.uuid4())
        reminder_doc["id"] = reminder_id
        reminder_doc["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.appointment_reminders.insert_one(reminder_doc)
        return {"success": True, "message": "Rappel planifié", "id": reminder_id}

@router.delete("/medical/reminder/{appointment_id}")
async def delete_appointment_reminder(appointment_id: str, current_user: User = Depends(get_current_user)):
    """Delete a scheduled appointment reminder"""
    result = await db.appointment_reminders.delete_one({
        "user_id": current_user.id,
        "appointment_id": appointment_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rappel non trouvé")
    
    return {"success": True, "message": "Rappel supprimé"}

@router.post("/medical/send-due-reminders")
async def send_due_reminders():
    """Send all reminders that are due (called by cron job or manually)"""
    from routes.push_notifications import send_push_notification
    from core.config import RESEND_API_KEY, SENDER_EMAIL
    
    # Import resend for email
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
    
    sent_count = 0
    for reminder in due_reminders:
        try:
            reminder_type = reminder.get("reminder_type", "push")
            
            # Send push notification
            if reminder_type in ["push", "both"]:
                await send_push_notification(
                    user_email=reminder["user_email"],
                    title="Rappel RDV médical",
                    body=f"N'oubliez pas : {reminder['appointment_title']}",
                    url="/medical"
                )
            
            # Send email notification
            if reminder_type in ["email", "both"] and resend and RESEND_API_KEY:
                try:
                    resend.Emails.send({
                        "from": SENDER_EMAIL,
                        "to": reminder["user_email"],
                        "subject": f"Rappel: {reminder['appointment_title']}",
                        "html": f"""
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; border-radius: 20px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">Rappel RDV Médical</h1>
                            </div>
                            <div style="padding: 30px 20px;">
                                <h2 style="color: #334155; margin-top: 0;">{reminder['appointment_title']}</h2>
                                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                                    Bonjour,<br><br>
                                    Ceci est un rappel pour votre rendez-vous médical prévu prochainement.
                                </p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="https://premium-ui-27.preview.emergentagent.com/medical" 
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
                                    L'équipe MamanDouce
                                </p>
                            </div>
                        </div>
                        """
                    })
                except Exception as e:
                    print(f"Error sending email reminder: {e}")
            
            # Mark as sent
            await db.appointment_reminders.update_one(
                {"id": reminder["id"]},
                {"$set": {"sent": True, "sent_at": now.isoformat()}}
            )
            sent_count += 1
        except Exception as e:
            print(f"Error sending reminder: {e}")
    
    return {"success": True, "sent_count": sent_count}


@router.get("/medical/scheduler-status")
async def get_scheduler_status():
    """Get the status of the background scheduler"""
    from core.scheduler import scheduler
    
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None
        })
    
    # Count pending reminders
    now = datetime.now(timezone.utc)
    pending_count = await db.appointment_reminders.count_documents({
        "sent": False
    })
    due_count = await db.appointment_reminders.count_documents({
        "sent": False,
        "reminder_datetime": {"$lte": now.isoformat()}
    })
    
    return {
        "scheduler_running": scheduler.running,
        "jobs": jobs,
        "pending_reminders": pending_count,
        "due_reminders": due_count
    }
