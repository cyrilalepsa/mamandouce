"""
Authentication routes for MamanDouce
Handles: Register, Login, Get current user, Password Reset
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
import logging
import secrets

from core.database import db
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES, ADMIN_EMAIL, RESEND_API_KEY, SENDER_EMAIL
from core.security import pwd_context, create_access_token, get_current_user
from models.schemas import UserCreate, UserLogin, Token, User

# Optional import for email
try:
    import resend
    if RESEND_API_KEY:
        resend.api_key = RESEND_API_KEY
except ImportError:
    resend = None

logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])

# Pydantic models for password reset
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyResetTokenRequest(BaseModel):
    token: str

async def notify_admin_new_user(user_name: str, user_email: str):
    """Send push notification to admin for new registration"""
    from routes.push_notifications import send_push_notification
    try:
        await send_push_notification(
            user_email=ADMIN_EMAIL,
            title="Nouvelle inscription MamanDouce",
            body=f"{user_name} ({user_email}) vient de s'inscrire !",
            url="/admin"
        )
    except Exception as e:
        logger.error(f"Error notifying admin: {e}")

@router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    hashed_password = pwd_context.hash(user_data.password)
    user = User(email=user_data.email, name=user_data.name)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Track visitor/registration
    await db.site_stats.update_one(
        {"type": "registrations"},
        {"$inc": {"count": 1}, "$set": {"last_updated": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    # Notify admin
    await notify_admin_new_user(user_data.name, user_data.email)
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token, token_type="bearer")

# Configuration blocage de compte
MAX_LOGIN_ATTEMPTS = 4
LOCKOUT_DURATION_MINUTES = 30

@router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user and return JWT token"""
    user = await db.users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Email ou mot de passe incorrect")
    
    # Vérifier si le compte est bloqué
    if user.get("locked_until"):
        locked_until = datetime.fromisoformat(user["locked_until"].replace('Z', '+00:00'))
        if datetime.now(timezone.utc) < locked_until:
            remaining_minutes = int((locked_until - datetime.now(timezone.utc)).total_seconds() / 60)
            raise HTTPException(
                status_code=423,
                detail=f"Compte temporairement bloqué. Réessayez dans {remaining_minutes} minute(s)."
            )
        else:
            # Débloquer le compte et réinitialiser les tentatives
            await db.users.update_one(
                {"email": user_data.email},
                {"$unset": {"locked_until": ""}, "$set": {"failed_login_attempts": 0}}
            )
            user["failed_login_attempts"] = 0
    
    # Vérifier le mot de passe
    if not pwd_context.verify(user_data.password, user["hashed_password"]):
        # Incrémenter le compteur de tentatives
        failed_attempts = user.get("failed_login_attempts", 0) + 1
        update_data = {"failed_login_attempts": failed_attempts}
        
        if failed_attempts >= MAX_LOGIN_ATTEMPTS:
            # Bloquer le compte
            locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            update_data["locked_until"] = locked_until.isoformat()
            await db.users.update_one({"email": user_data.email}, {"$set": update_data})
            raise HTTPException(
                status_code=423,
                detail=f"Compte bloqué après {MAX_LOGIN_ATTEMPTS} tentatives échouées. Réessayez dans {LOCKOUT_DURATION_MINUTES} minutes."
            )
        
        await db.users.update_one({"email": user_data.email}, {"$set": update_data})
        remaining = MAX_LOGIN_ATTEMPTS - failed_attempts
        raise HTTPException(
            status_code=400,
            detail=f"Email ou mot de passe incorrect. {remaining} tentative(s) restante(s)."
        )
    
    # Connexion réussie - réinitialiser le compteur
    await db.users.update_one(
        {"email": user_data.email},
        {"$set": {"failed_login_attempts": 0}, "$unset": {"locked_until": ""}}
    )
    
    # Track login/visit
    await db.site_stats.update_one(
        {"type": "visits"},
        {"$inc": {"count": 1}, "$set": {"last_updated": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token, token_type="bearer")

@router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user


# ==================== PASSWORD RESET ====================

@router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email"""
    user = await db.users.find_one({"email": request.email})
    
    # Always return success to prevent email enumeration
    if not user:
        return {"success": True, "message": "Si cet email existe, un lien de réinitialisation a été envoyé."}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token in database
    await db.password_resets.delete_many({"email": request.email})  # Remove old tokens
    await db.password_resets.insert_one({
        "email": request.email,
        "token": reset_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Send email with reset link
    if resend and RESEND_API_KEY:
        try:
            # Get frontend URL from environment or use default
            import os
            frontend_url = os.environ.get("FRONTEND_URL", "https://femme-enceinte-app.preview.emergentagent.com")
            reset_link = f"{frontend_url}/reset-password?token={reset_token}"
            
            resend.Emails.send({
                "from": SENDER_EMAIL,
                "to": request.email,
                "subject": "Réinitialisation de votre mot de passe MamanDouce",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; border-radius: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">MamanDouce</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Réinitialisation de mot de passe</p>
                    </div>
                    <div style="padding: 30px 20px;">
                        <p style="color: #374151; font-size: 16px;">Bonjour,</p>
                        <p style="color: #374151; font-size: 16px;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
                        <p style="color: #374151; font-size: 16px;">Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{reset_link}" style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">
                                Réinitialiser mon mot de passe
                            </a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 1 heure.</p>
                        <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        <p style="color: #9ca3af; font-size: 12px; text-align: center;">L'équipe MamanDouce</p>
                    </div>
                </div>
                """
            })
            logger.info(f"Password reset email sent to {request.email}")
        except Exception as e:
            logger.error(f"Error sending reset email: {e}")
    
    return {"success": True, "message": "Si cet email existe, un lien de réinitialisation a été envoyé."}


@router.post("/auth/verify-reset-token")
async def verify_reset_token(request: VerifyResetTokenRequest):
    """Verify if reset token is valid"""
    reset_record = await db.password_resets.find_one({"token": request.token})
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré")
    
    expires_at = datetime.fromisoformat(reset_record["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        await db.password_resets.delete_one({"token": request.token})
        raise HTTPException(status_code=400, detail="Ce lien a expiré. Veuillez en demander un nouveau.")
    
    return {"valid": True, "email": reset_record["email"]}


@router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with valid token"""
    reset_record = await db.password_resets.find_one({"token": request.token})
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré")
    
    expires_at = datetime.fromisoformat(reset_record["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        await db.password_resets.delete_one({"token": request.token})
        raise HTTPException(status_code=400, detail="Ce lien a expiré. Veuillez en demander un nouveau.")
    
    # Validate password
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères")
    
    # Update user password
    hashed_password = pwd_context.hash(request.new_password)
    result = await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Utilisateur non trouvé")
    
    # Delete used token
    await db.password_resets.delete_one({"token": request.token})
    
    return {"success": True, "message": "Votre mot de passe a été réinitialisé avec succès."}

# ==================== PASSWORD UPDATE ====================

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/auth/update-password")
async def update_password(request: UpdatePasswordRequest, current_user: User = Depends(get_current_user)):
    """Update user password - requires current password verification"""
    # Récupérer l'utilisateur depuis la base de données
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Vérifier le mot de passe actuel
    if not pwd_context.verify(request.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    
    # Valider le nouveau mot de passe
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit contenir au moins 6 caractères")
    
    # Mettre à jour le mot de passe
    hashed_password = pwd_context.hash(request.new_password)
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "hashed_password": hashed_password,
            "password_updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Mot de passe mis à jour avec succès"}

# ==================== EMAIL UPDATE ====================

class UpdateEmailRequest(BaseModel):
    new_email: EmailStr

@router.post("/auth/update-email")
async def update_email(request: UpdateEmailRequest, current_user: User = Depends(get_current_user)):
    """Update user email address"""
    new_email = request.new_email.lower()
    
    # Vérifier si le nouvel email n'est pas déjà utilisé
    existing = await db.users.find_one({"email": new_email})
    if existing and existing.get("id") != current_user.id:
        raise HTTPException(status_code=400, detail="Cette adresse email est déjà utilisée")
    
    # Mettre à jour l'email
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "email": new_email,
            "email_updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Adresse email mise à jour", "new_email": new_email}

# ==================== END PREMIUM (AFTER BIRTH) ====================

@router.post("/auth/end-premium")
async def end_premium(current_user: User = Depends(get_current_user)):
    """End premium subscription after birth confirmation"""
    from routes.push_notifications import send_admin_notification
    
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    if user.get("subscription_status") != "premium":
        raise HTTPException(status_code=400, detail="Aucun abonnement premium actif")
    
    # Mettre fin au premium
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "subscription_status": "free",
            "premium_ended_at": datetime.now(timezone.utc).isoformat(),
            "premium_ended_reason": "birth_confirmed"
        }}
    )
    
    # Notifier l'admin
    try:
        await send_admin_notification(
            title="Fin d'abonnement - Accouchement",
            body=f"{current_user.email} a confirmé son accouchement et mis fin à son abonnement premium",
            url="/admin",
            category="Abonnement"
        )
    except:
        pass
    
    return {"success": True, "message": "Votre abonnement premium a été terminé. Vous avez maintenant accès au suivi post-partum."}

