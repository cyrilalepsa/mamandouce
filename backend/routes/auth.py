"""
Authentication routes for MamanDouce
Handles: Register, Login, Get current user, Password Reset
"""
from fastapi import APIRouter, HTTPException, Depends, Query
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

async def send_welcome_notification(user_name: str, user_email: str):
    """Send welcome push notification and email to new user"""
    from routes.push_notifications import send_push_notification
    
    # Envoyer la notification push
    try:
        await send_push_notification(
            user_email=user_email,
            title=f"Bienvenue {user_name} ! 💕",
            body="Découvrez comment MamanDouce vous accompagne tout au long de votre grossesse.",
            url="/guide"
        )
    except Exception as e:
        logger.error(f"Error sending welcome push: {e}")
    
    # Envoyer l'email de bienvenue
    if resend and RESEND_API_KEY:
        try:
            resend.Emails.send({
                "from": SENDER_EMAIL,
                "to": user_email,
                "subject": f"Bienvenue sur MamanDouce, {user_name} ! 💕",
                "html": f"""
                <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #ec4899; font-size: 32px; margin: 0;">MamanDouce</h1>
                        <p style="color: #64748b; font-size: 14px;">Votre compagnon de grossesse</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #fce7f3, #f0f9ff); border-radius: 20px; padding: 30px; margin-bottom: 20px;">
                        <h2 style="color: #334155; margin-top: 0;">Bienvenue {user_name} ! 🎉</h2>
                        <p style="color: #475569; line-height: 1.6;">
                            Nous sommes ravis de vous accompagner dans cette belle aventure qu'est la maternité.
                        </p>
                    </div>
                    
                    <div style="background: white; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                        <h3 style="color: #ec4899; margin-top: 0;">Pour bien démarrer :</h3>
                        <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
                            <li><strong>Calculez vos dates clés</strong> - DPA, trimestres, rendez-vous</li>
                            <li><strong>Scannez vos aliments</strong> - Vérifiez ce que vous pouvez manger</li>
                            <li><strong>Suivez vos rendez-vous</strong> - Ne manquez aucun RDV médical</li>
                            <li><strong>Créez votre liste de naissance</strong> - Partagez-la avec vos proches</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://premium-ui-27.preview.emergentagent.com" 
                           style="background: linear-gradient(135deg, #ec4899, #8b5cf6); 
                                  color: white; 
                                  text-decoration: none; 
                                  padding: 14px 32px; 
                                  border-radius: 50px; 
                                  font-weight: bold;
                                  display: inline-block;">
                            Commencer l'aventure
                        </a>
                    </div>
                    
                    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
                        Des questions ? Contactez-nous directement depuis l'application.<br>
                        À très bientôt ! 💕
                    </p>
                </div>
                """
            })
            logger.info(f"Welcome email sent to {user_email}")
        except Exception as e:
            logger.error(f"Error sending welcome email: {e}")

@router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    hashed_password = pwd_context.hash(user_data.password)
    user = User(
        email=user_data.email, 
        name=user_data.name, 
        city=user_data.city,
        birth_date=user_data.birth_date,
        status=user_data.status
    )
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
    
    # Send welcome notification and email to new user
    await send_welcome_notification(user_data.name, user_data.email)
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token, token_type="bearer")

# Configuration blocage de compte
MAX_LOGIN_ATTEMPTS = 4
LOCKOUT_DURATION_MINUTES = 30

# ==================== 2FA SYSTEM ====================

class Enable2FARequest(BaseModel):
    enable: bool

class Verify2FARequest(BaseModel):
    email: EmailStr
    code: str
    password: str

async def send_2fa_code(email: str, code: str):
    """Send 2FA code by email"""
    if not resend or not RESEND_API_KEY:
        logger.warning("Resend not configured, cannot send 2FA code")
        return False
    
    try:
        resend.Emails.send({
            "from": SENDER_EMAIL,
            "to": email,
            "subject": "Votre code de connexion MamanDouce",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ec4899;">Code de connexion MamanDouce</h2>
                <p>Bonjour,</p>
                <p>Voici votre code de vérification à usage unique :</p>
                <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 20px 0;">
                    {code}
                </div>
                <p style="color: #666;">Ce code expire dans 10 minutes.</p>
                <p style="color: #999; font-size: 12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </div>
            """
        })
        return True
    except Exception as e:
        logger.error(f"Error sending 2FA code: {e}")
        return False

@router.post("/auth/2fa/toggle")
async def toggle_2fa(request: Enable2FARequest, current_user: User = Depends(get_current_user)):
    """Enable or disable 2FA for user account"""
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "two_factor_enabled": request.enable,
            "two_factor_updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    status = "activée" if request.enable else "désactivée"
    return {"success": True, "message": f"Authentification à deux facteurs {status}"}

@router.get("/auth/2fa/status")
async def get_2fa_status(current_user: User = Depends(get_current_user)):
    """Get 2FA status for current user"""
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "two_factor_enabled": 1})
    return {"two_factor_enabled": user.get("two_factor_enabled", False) if user else False}

@router.post("/auth/2fa/request-code")
async def request_2fa_code(email: str = Query(..., description="User email address")):
    """Request a 2FA code for login (step 1 of 2FA login)"""
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if not user:
        # Don't reveal if user exists
        return {"success": True, "message": "Si ce compte existe, un code a été envoyé"}
    
    # Check if 2FA is enabled
    if not user.get("two_factor_enabled", False):
        return {"success": True, "two_factor_required": False}
    
    # Generate 6-digit code
    code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Store code with expiration (10 minutes)
    await db.two_factor_codes.update_one(
        {"email": email},
        {"$set": {
            "code": code,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
            "attempts": 0
        }},
        upsert=True
    )
    
    # Send code by email
    await send_2fa_code(email, code)
    
    return {"success": True, "two_factor_required": True, "message": "Code envoyé par email"}

@router.post("/auth/2fa/verify", response_model=Token)
async def verify_2fa_code(request: Verify2FARequest):
    """Verify 2FA code and complete login (step 2 of 2FA login)"""
    user = await db.users.find_one({"email": request.email})
    
    if not user:
        raise HTTPException(status_code=400, detail="Code invalide")
    
    # Verify password first
    if not pwd_context.verify(request.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Mot de passe incorrect")
    
    # Get stored code
    code_doc = await db.two_factor_codes.find_one({"email": request.email})
    
    if not code_doc:
        raise HTTPException(status_code=400, detail="Code expiré, veuillez en demander un nouveau")
    
    # Check expiration
    expires_at = datetime.fromisoformat(code_doc["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        await db.two_factor_codes.delete_one({"email": request.email})
        raise HTTPException(status_code=400, detail="Code expiré, veuillez en demander un nouveau")
    
    # Check attempts (max 3)
    if code_doc.get("attempts", 0) >= 3:
        await db.two_factor_codes.delete_one({"email": request.email})
        raise HTTPException(status_code=400, detail="Trop de tentatives, veuillez en demander un nouveau code")
    
    # Verify code
    if code_doc["code"] != request.code:
        await db.two_factor_codes.update_one(
            {"email": request.email},
            {"$inc": {"attempts": 1}}
        )
        remaining = 3 - code_doc.get("attempts", 0) - 1
        raise HTTPException(status_code=400, detail=f"Code incorrect. {remaining} tentative(s) restante(s)")
    
    # Success - delete code and create token
    await db.two_factor_codes.delete_one({"email": request.email})
    
    # Reset failed login attempts
    await db.users.update_one(
        {"email": request.email},
        {"$set": {"failed_login_attempts": 0}, "$unset": {"locked_until": ""}}
    )
    
    access_token = create_access_token(
        data={"sub": request.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token, token_type="bearer")

# ==================== LOGIN ====================

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
    
    # Vérifier si 2FA est activé
    if user.get("two_factor_enabled", False):
        # Générer et envoyer le code 2FA
        code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
        
        await db.two_factor_codes.update_one(
            {"email": user_data.email},
            {"$set": {
                "code": code,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
                "attempts": 0
            }},
            upsert=True
        )
        
        # Envoyer le code par email
        await send_2fa_code(user_data.email, code)
        
        # Retourner une erreur 403 pour indiquer que 2FA est requis
        raise HTTPException(
            status_code=403,
            detail="2FA required",
            headers={"X-2FA-Required": "true"}
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


from models.schemas import ProfileUpdate

@router.put("/auth/profile")
async def update_profile(profile_data: ProfileUpdate, current_user: User = Depends(get_current_user)):
    """Update user profile (display name, avatar, city)"""
    update_fields = {}
    
    if profile_data.display_name is not None:
        # Nettoyer et valider le nom
        display_name = profile_data.display_name.strip()
        if len(display_name) > 50:
            raise HTTPException(status_code=400, detail="Le nom ne peut pas dépasser 50 caractères")
        update_fields["display_name"] = display_name if display_name else None
    
    if profile_data.avatar is not None:
        # Valider la taille de l'image (max 500KB en base64)
        if len(profile_data.avatar) > 700000:  # ~500KB in base64
            raise HTTPException(status_code=400, detail="L'image est trop grande (max 500KB)")
        # Vérifier le format base64 image
        if profile_data.avatar and not (
            profile_data.avatar.startswith("data:image/") or 
            profile_data.avatar == ""
        ):
            raise HTTPException(status_code=400, detail="Format d'image invalide")
        update_fields["avatar"] = profile_data.avatar if profile_data.avatar else None
    
    # Gérer la configuration de l'avatar personnalisé
    if profile_data.avatar_config is not None:
        if profile_data.avatar_config:
            # Valider les champs de la config
            valid_keys = {'faceShape', 'skinTone', 'hairStyle', 'hairColor', 'glasses', 'age'}
            if not all(k in valid_keys for k in profile_data.avatar_config.keys()):
                raise HTTPException(status_code=400, detail="Configuration d'avatar invalide")
            update_fields["avatar_config"] = profile_data.avatar_config
        else:
            update_fields["avatar_config"] = None
    
    # Gérer le champ ville
    if profile_data.city is not None:
        city = profile_data.city.strip()
        if len(city) > 100:
            raise HTTPException(status_code=400, detail="Le nom de ville ne peut pas dépasser 100 caractères")
        update_fields["city"] = city if city else None
    
    if not update_fields:
        return {"success": True, "message": "Aucune modification"}
    
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_fields}
    )
    
    # Retourner l'utilisateur mis à jour
    updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "password_hash": 0})
    return {"success": True, "message": "Profil mis à jour", "user": updated_user}


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
    email_sent = False
    if resend and RESEND_API_KEY:
        try:
            # Get frontend URL from environment or use default
            import os
            frontend_url = os.environ.get("FRONTEND_URL", "https://premium-ui-27.preview.emergentagent.com")
            reset_link = f"{frontend_url}/reset-password?token={reset_token}"
            
            resend.Emails.send({
                "from": f"MamanDouce <{SENDER_EMAIL}>",
                "to": [request.email],
                "reply_to": "support@cycafamily.com",
                "subject": "Réinitialisation de votre mot de passe MamanDouce",
                "headers": {
                    "X-Entity-Ref-ID": f"password-reset-{reset_token[:8]}",
                },
                "tags": [
                    {"name": "category", "value": "password-reset"},
                    {"name": "app", "value": "mamandouce"}
                ],
                "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #ec4899; padding: 30px 20px; border-radius: 20px 20px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">MamanDouce</h1>
                            <p style="color: #fce7f3; margin: 10px 0 0 0; font-size: 14px;">Réinitialisation de mot de passe</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 20px 20px;">
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour,</p>
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Vous avez demandé la réinitialisation de votre mot de passe sur MamanDouce.</p>
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                            
                            <!-- Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="padding: 10px 0 30px 0;">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{reset_link}" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="50%" strokecolor="#ec4899" fillcolor="#ec4899">
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Réinitialiser mon mot de passe</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="{reset_link}" target="_blank" style="background-color: #ec4899; border: 2px solid #ec4899; border-radius: 30px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 280px; -webkit-text-size-adjust: none;">Réinitialiser mon mot de passe</a>
                                        <!--<![endif]-->
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">⏰ Ce lien expire dans <strong>1 heure</strong>.</p>
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
                            
                            <!-- Fallback link -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 10px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;">Si le bouton ne fonctionne pas, copiez ce lien :</p>
                                        <p style="color: #ec4899; font-size: 11px; word-break: break-all; margin: 0;"><a href="{reset_link}" style="color: #ec4899;">{reset_link}</a></p>
                                    </td>
                                </tr>
                            </table>
                            
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">L'équipe MamanDouce 💕</p>
                            <p style="color: #d1d5db; font-size: 10px; text-align: center; margin: 10px 0 0 0;">Cet email a été envoyé par MamanDouce • cycafamily.com</p>
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
            email_sent = True
            logger.info(f"Password reset email sent to {request.email}")
        except Exception as e:
            logger.error(f"Error sending reset email to {request.email}: {e}")
            # Check if it's a Resend domain verification error
            error_str = str(e)
            if "only send testing emails" in error_str.lower() or "verify a domain" in error_str.lower():
                logger.error("RESEND DOMAIN NOT VERIFIED - Emails can only be sent to the account owner's email")
    
    # Return appropriate message
    if email_sent:
        return {"success": True, "message": "Un email de réinitialisation a été envoyé à votre adresse."}
    else:
        # Return the token directly for testing/development or when email fails
        # In production with verified domain, this should only return success message
        return {
            "success": True, 
            "message": "Si cet email existe, un lien de réinitialisation a été envoyé.",
            "note": "Si vous ne recevez pas l'email, vérifiez vos spams ou contactez le support."
        }


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
    except Exception as e:
        print(f"Erreur notification admin: {e}")
    
    return {"success": True, "message": "Votre abonnement premium a été terminé. Vous avez maintenant accès au suivi post-partum."}

