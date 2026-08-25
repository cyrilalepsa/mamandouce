"""
Authentication routes for MamanDouce
Handles: Register, Login, Get current user, Password Reset
"""
from fastapi import APIRouter, HTTPException, Depends, Header, Query
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, model_validator
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging
import secrets
import time
import traceback

from core.database import db, get_db, resolve_db_name
from core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ADMIN_EMAIL,
    app_public_url,
    email_brand_footer,
)
from core.security import pwd_context, create_access_token, get_current_user
from models.schemas import UserCreate, UserLogin, Token, User
from services.email import (
    public_email_config,
    send_resend_direct,
    send_resend_email,
    send_reset_password_email,
)
from core.privileges import (
    SUPER_ADMIN_EMAILS,
    SUPERADMIN_DB_SET,
    ensure_superadmin_privileges,
    is_superadmin_email,
    privilege_public_fields,
)
from services.user_lookup import (
    EMAIL_LOOKUP_FIELDS,
    collect_lookup_miss_diagnostics,
    find_user_by_email,
    inspect_reset_user,
    normalize_email,
    user_email_query,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])
_diag_bearer = HTTPBearer(auto_error=False)

DIAG_TEST_EMAIL_TO = "cyrilalepsa@gmail.com"
_DIRECT_SEND_MIN_INTERVAL_SEC = 15.0
_last_direct_send_monotonic = 0.0


def _force_vip_auth_fields(payload: dict) -> dict:
    """Force admin + premium + flags VIP pour les deux e-mails privilège.

    Ces champs doivent toujours être présents dans le JSON /login et /auth/me
    pour que AuthContext mette à jour l'état au chargement.
    """
    data = dict(payload or {})
    data.update(privilege_public_fields(data))
    email = (data.get("email") or "").strip().lower()
    if email in SUPER_ADMIN_EMAILS or email in (
        "cyrilalepsa@gmail.com",
        "superadmin@neriacorp.com",
    ):
        data["role"] = "admin"
        data["subscription_status"] = "premium"
        data["is_admin"] = True
        data["is_premium"] = True
        data["is_vip"] = True
        data["is_superadmin"] = True
    return data


def _issue_token(user: dict | None, email_fallback: str | None = None) -> Token:
    payload = dict(user or {})
    if email_fallback and not payload.get("email"):
        payload["email"] = email_fallback
    fields = _force_vip_auth_fields(payload)
    sub = fields.get("email") or email_fallback
    access_token = create_access_token(
        data={"sub": sub},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token, token_type="bearer", **fields)


def _admin_secret_matches(provided: str | None) -> bool:
    from core import config as cfg

    cfg.load_settings()
    expected = (cfg.ADMIN_SECRET or "").strip()
    got = (provided or "").strip()
    if not expected or not got or len(expected) != len(got):
        return False
    return secrets.compare_digest(expected, got)


async def require_email_diag_access(
    admin_secret: Optional[str] = Query(
        None, description="ADMIN_SECRET — diagnostic temporaire"
    ),
    x_admin_secret: Optional[str] = Header(None, alias="X-Admin-Secret"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_diag_bearer),
) -> str:
    """Admin JWT ou ADMIN_SECRET (header / query) — pas d'accès public."""
    if _admin_secret_matches(admin_secret) or _admin_secret_matches(x_admin_secret):
        return "admin_secret"
    if credentials is not None:
        user = await get_current_user(credentials)
        if user.role == "admin" or is_superadmin_email(user.email):
            return f"jwt:{user.email}"
    raise HTTPException(
        status_code=401,
        detail=(
            "Diagnostic Resend réservé aux admins. "
            "Utilisez un Bearer JWT admin, le header X-Admin-Secret, "
            "ou ?admin_secret="
        ),
    )

# Pydantic models for password reset
class ForgotPasswordRequest(BaseModel):
    email: Optional[EmailStr] = None
    user_email: Optional[EmailStr] = None

    @model_validator(mode="after")
    def require_email(self):
        if not (self.email or self.user_email):
            raise ValueError("email requis (clé JSON: email)")
        return self

    def resolved_email(self) -> str:
        return str(self.email or self.user_email or "")

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
    
    # Envoyer l'email de bienvenue (erreurs loguées dans send_resend_email)
    frontend_url = app_public_url()
    send_resend_email(
        to=user_email,
        subject=f"Bienvenue sur MamanDouce, {user_name} ! 💕",
        purpose="welcome",
        html=f"""
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
                        <a href="{frontend_url}" 
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
                    {email_brand_footer()}
                </div>
                """,
    )

@router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    database = get_db()
    existing = await find_user_by_email(str(user_data.email), database=database)
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    hashed_password = pwd_context.hash(user_data.password)
    user = User(
        email=normalize_email(str(user_data.email)),
        name=user_data.name,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        city=user_data.city,
        birth_date=user_data.birth_date,
        status=user_data.status,
        children_at_home=user_data.children_at_home,
        multiple_pregnancy=user_data.multiple_pregnancy,
    )
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    if is_superadmin_email(user.email):
        user_dict.update(SUPERADMIN_DB_SET)

    referral_code = (user_data.referral_code or "").strip().upper()
    if referral_code:
        user_dict["signed_up_via_referral"] = referral_code
        user_dict["neriacorp_onboarding_pending"] = "referral"
    else:
        user_dict["neriacorp_onboarding_pending"] = None

    user_dict.setdefault("neriacorp_portal_linked", False)
    user_dict.setdefault("neriacorp_onboarding_dismissed", False)
    
    await database.users.insert_one(user_dict)
    
    # Parrainage : créditer le sponsor et enregistrer le filleul
    if referral_code:
        from routes.referral import complete_referral_via_code

        try:
            await complete_referral_via_code(
                referral_code=referral_code,
                new_user_email=user.email,
                new_user_name=user.name,
            )
        except HTTPException:
            logger.warning("referral code invalid at register: %s", referral_code)
    
    # Cagnotte initiale (+3 N2O)
    from models.solidarity import UserWallet, WalletTransaction, WalletTransactionType

    wallet = UserWallet(user_id=user_dict["id"], balance=3.0, total_earned=3.0).dict()
    await db.wallets.insert_one(wallet)
    initial_tx = WalletTransaction(
        user_id=user_dict["id"],
        type=WalletTransactionType.INITIAL_BONUS,
        amount=3.0,
        description="Bonus de bienvenue - 3€ de votre abonnement",
    ).dict()
    await db.wallet_transactions.insert_one(initial_tx)
    
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
    
    return _issue_token(user_dict, user.email)

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
    result = send_resend_email(
        to=email,
        subject="Votre code de connexion MamanDouce",
        purpose="2fa",
        html=f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ec4899;">Code de connexion MamanDouce</h2>
                <p>Bonjour,</p>
                <p>Voici votre code de vérification à usage unique :</p>
                <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 20px 0;">
                    {code}
                </div>
                <p style="color: #666;">Ce code expire dans 10 minutes.</p>
                <p style="color: #999; font-size: 12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
                {email_brand_footer()}
            </div>
            """,
    )
    return bool(result.get("ok"))

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
    await ensure_superadmin_privileges(str(request.email))
    user = await find_user_by_email(str(request.email))
    return _issue_token(user, str(request.email))

# ==================== LOGIN ====================

@router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user and return JWT token"""
    user = await find_user_by_email(str(user_data.email))
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
    await ensure_superadmin_privileges(user.get("email") or str(user_data.email))
    
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
    
    return _issue_token(user, user.get("email"))

@router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user — flags VIP toujours présents dans le JSON."""
    payload = current_user.model_dump()
    payload.update(_force_vip_auth_fields(payload))
    return User(**payload)


from models.schemas import ProfileUpdate, build_full_name

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

    if profile_data.first_name is not None:
        first_name = profile_data.first_name.strip()
        if not first_name:
            raise HTTPException(status_code=400, detail="Le prénom est requis")
        if len(first_name) > 80:
            raise HTTPException(status_code=400, detail="Le prénom ne peut pas dépasser 80 caractères")
        update_fields["first_name"] = first_name

    if profile_data.last_name is not None:
        last_name = profile_data.last_name.strip()
        if len(last_name) > 80:
            raise HTTPException(status_code=400, detail="Le nom ne peut pas dépasser 80 caractères")
        update_fields["last_name"] = last_name
    
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

    if profile_data.children_at_home is not None:
        update_fields["children_at_home"] = profile_data.children_at_home

    if profile_data.multiple_pregnancy is not None:
        update_fields["multiple_pregnancy"] = profile_data.multiple_pregnancy

    if "first_name" in update_fields or "last_name" in update_fields:
        current_doc = await db.users.find_one(
            {"id": current_user.id},
            {"_id": 0, "first_name": 1, "last_name": 1, "name": 1},
        ) or {}
        merged_first = update_fields.get("first_name", current_doc.get("first_name") or "")
        merged_last = update_fields.get("last_name", current_doc.get("last_name") or "")
        full_name = build_full_name(merged_first, merged_last)
        if full_name:
            update_fields["name"] = full_name
    
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
@router.post("/v1/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email"""
    try:
        raw_email = request.resolved_email()
        requested_email = normalize_email(raw_email)
        database = get_db()
        db_used = database.name or resolve_db_name()
        print(
            f"[EMAIL] forgot-password payload raw={raw_email!r} normalized={requested_email!r} "
            f"db={db_used} collection=users",
            flush=True,
        )
        logger.info(
            "forgot-password payload raw_email=%r normalized=%r db=%s collection=users",
            raw_email,
            requested_email,
            db_used,
        )
        user = await find_user_by_email(requested_email, database=database)

        # Always return success to prevent email enumeration
        if not user:
            miss = await collect_lookup_miss_diagnostics(database, requested_email)
            print(
                f"[EMAIL] forgot-password user_found=False db={db_used} "
                f"users_count={miss.get('users_count')} to={requested_email!r} "
                f"— Resend NON appelé",
                flush=True,
            )
            logger.warning("User not found in DB for email: %s", requested_email)
            logger.error(
                "forgot-password user_found=False db=%s email=%s users_count=%s "
                "indexes=%s similar=%s — Resend NON appelé",
                db_used,
                requested_email,
                miss.get("users_count"),
                miss.get("indexes"),
                miss.get("similar"),
            )
            return {"success": True, "message": "Si cet email existe, un lien de réinitialisation a été envoyé."}

        stored_raw = None
        for field in EMAIL_LOOKUP_FIELDS:
            if user.get(field):
                stored_raw = user.get(field)
                break
        stored_email = normalize_email(stored_raw or requested_email)
        logger.info(
            "forgot-password user_found=True db=%s stored_email=%r requested=%r",
            db_used,
            stored_raw,
            requested_email,
        )

        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        # Store reset token in database (e-mail canonique stocké)
        await database.password_resets.delete_many(user_email_query(stored_email))
        await database.password_resets.insert_one({
            "email": stored_email,
            "token": reset_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
        # Send email with reset link — logs détaillés (clé, from, to, retour Resend)
        frontend_url = app_public_url()
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        print(
            f"[EMAIL] forgot-password user_found=True db={db_used} to={stored_email} "
            f"requested={requested_email} frontend_url={frontend_url} (token non logué)",
            flush=True,
        )

        logger.info("send_reset_password_email() calling to=%s db=%s", stored_email, db_used)
        print(f"[EMAIL] send_reset_password_email() to={stored_email} db={db_used}", flush=True)
        send_result = send_reset_password_email(
            to=stored_email,
            reset_link=reset_link,
            html=f"""
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
                                {email_brand_footer()}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
                    """,
        )

        if not send_result.get("ok"):
            err = send_result.get("error") or "envoi Resend échoué"
            tb = send_result.get("traceback") or ""
            print(f"[EMAIL] forgot-password FAILED to={stored_email}: {err}", flush=True)
            if tb:
                print(tb, flush=True)
            logger.error("forgot-password email failed to=%s: %s", stored_email, err)
            error_str = str(err)
            if "only send testing emails" in error_str.lower() or "verify a domain" in error_str.lower():
                print(
                    "[EMAIL] RESEND DOMAIN NOT VERIFIED — "
                    "Resend n'envoie qu'à l'e-mail du compte propriétaire",
                    flush=True,
                )
                logger.error(
                    "RESEND DOMAIN NOT VERIFIED - Emails can only be sent to the account owner's email"
                )

        # HTTP 200 volontaire (anti-énumération) — l'échec est dans les logs Railway
        if send_result.get("ok"):
            return {"success": True, "message": "Un email de réinitialisation a été envoyé à votre adresse."}
        return {
            "success": True,
            "message": "Si cet email existe, un lien de réinitialisation a été envoyé.",
            "note": "Si vous ne recevez pas l'email, vérifiez vos spams ou contactez le support.",
        }


    except Exception as e:
        tb = traceback.format_exc()
        logger.exception(e)
        print("[EMAIL] forgot_password EXCEPTION:", flush=True)
        print(tb, flush=True)
        return {
            "success": True,
            "message": "Si cet email existe, un lien de réinitialisation a été envoyé.",
            "note": "Erreur interne loguée — Resend peut ne pas avoir été appelé.",
        }


def _probe_email_allowed(email: str, admin_secret: str | None, x_admin_secret: str | None) -> bool:
    if normalize_email(email) == DIAG_TEST_EMAIL_TO:
        return True
    return _admin_secret_matches(admin_secret) or _admin_secret_matches(x_admin_secret)


@router.get("/v1/auth/forgot-password-probe", tags=["auth", "diagnostic"])
@router.get("/auth/forgot-password-probe", tags=["auth", "diagnostic"])
async def forgot_password_probe(
    email: str = DIAG_TEST_EMAIL_TO,
    admin_secret: Optional[str] = Query(None),
    x_admin_secret: Optional[str] = Header(None, alias="X-Admin-Secret"),
):
    """
    Diagnostic Mongo (sans envoi Resend) : le compte existe-t-il dans `users` ?

    Public uniquement pour cyrilalepsa@gmail.com. Les autres e-mails
    exigent ADMIN_SECRET.
    """
    if not _probe_email_allowed(email, admin_secret, x_admin_secret):
        raise HTTPException(
            status_code=401,
            detail="Probe limité à cyrilalepsa@gmail.com (ou ADMIN_SECRET).",
        )
    report = await inspect_reset_user(email)
    print(
        f"[EMAIL] forgot-password-probe db={report.get('db_name')} "
        f"user_found={report.get('user_found')} users_count={report.get('users_count')}",
        flush=True,
    )
    logger.info(
        "forgot-password-probe db=%s user_found=%s users_count=%s email=%r",
        report.get("db_name"),
        report.get("user_found"),
        report.get("users_count"),
        normalize_email(email),
    )
    return report


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


def _run_resend_diagnostic(*, requested_by: str) -> dict:
    """Envoi isolé vers la boîte admin — hors flux forgot-password."""
    cfg = public_email_config()
    print(
        f"[EMAIL] diagnostic-test-email requested_by={requested_by} to={DIAG_TEST_EMAIL_TO}",
        flush=True,
    )
    send_result = send_resend_email(
        to=DIAG_TEST_EMAIL_TO,
        subject="[MamanDouce] Diagnostic Resend — test isolé",
        purpose="diagnostic-test-email",
        html=f"""
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ec4899;">Diagnostic Resend</h2>
            <p>Cet e-mail a été envoyé par <code>GET /api/auth/test-email</code>
            (hors flux de réinitialisation de mot de passe).</p>
            <p>Expéditeur en vigueur : <strong>{cfg['SENDER_EMAIL']}</strong></p>
            <p>Horodatage UTC : {datetime.now(timezone.utc).isoformat()}</p>
            {email_brand_footer()}
        </div>
        """,
    )
    payload = {
        "ok": bool(send_result.get("ok")),
        "purpose": "diagnostic-test-email",
        "to": DIAG_TEST_EMAIL_TO,
        "from": cfg["from"],
        "SENDER_EMAIL": cfg["SENDER_EMAIL"],
        "SENDER_EMAIL_neriacorp_ok": cfg["SENDER_EMAIL_neriacorp_ok"],
        "RESEND_API_KEY_present": cfg["RESEND_API_KEY_present"],
        "RESEND_API_KEY_masked": cfg["RESEND_API_KEY_masked"],
        "email_id": send_result.get("email_id"),
        "http_status": send_result.get("http_status"),
        "skipped": bool(send_result.get("skipped")),
        "error": send_result.get("error"),
        "resend": send_result.get("resend"),
        "requested_by": requested_by,
        "note": (
            "Réponse brute Resend dans 'resend' (id e-mail ou erreur HTTP). "
            "Hors flux /auth/forgot-password."
        ),
    }
    print(f"[EMAIL] diagnostic-test-email JSON ok={payload['ok']} email_id={payload['email_id']}", flush=True)
    return payload


@router.get("/auth/test-email", tags=["auth", "diagnostic"])
async def test_resend_email(requested_by: str = Depends(require_email_diag_access)):
    """
    Diagnostic temporaire : envoie un e-mail Resend isolé à cyrilalepsa@gmail.com.

    Protégé par JWT admin ou ADMIN_SECRET (`X-Admin-Secret` / `?admin_secret=`).
    Retourne la config en vigueur (clé masquée, SENDER_EMAIL exact) et la
    réponse brute Resend (id ou erreur HTTP) — visible dans Swagger / le navigateur.
    """
    return _run_resend_diagnostic(requested_by=requested_by)


router.add_api_route(
    "/v1/auth/test-email",
    test_resend_email,
    methods=["GET"],
    tags=["auth", "diagnostic"],
)


@router.get("/v1/auth/debug-send-test", tags=["auth", "diagnostic"])
@router.get("/auth/debug-send-test", tags=["auth", "diagnostic"])
async def debug_send_test(requested_by: str = Depends(require_email_diag_access)):
    """
    Diagnostic temporaire : envoi Resend isolé vers cyrilalepsa@gmail.com.

    Renvoie la réponse brute SDK (`resend_response`) ou l'erreur + traceback.
    """
    cfg = public_email_config()
    try:
        send_result = send_resend_email(
            to=DIAG_TEST_EMAIL_TO,
            subject="[MamanDouce] debug-send-test",
            purpose="debug-send-test",
            html=(
                "<p>Test isolé GET /api/v1/auth/debug-send-test — "
                f"{datetime.now(timezone.utc).isoformat()}</p>"
            ),
        )
        if send_result.get("ok"):
            return {
                "status": "ok",
                "resend_response": send_result.get("resend"),
                "email_id": send_result.get("email_id"),
                "to": DIAG_TEST_EMAIL_TO,
                "from": cfg["from"],
                "SENDER_EMAIL": cfg["SENDER_EMAIL"],
                "RESEND_API_KEY_present": cfg["RESEND_API_KEY_present"],
                "RESEND_API_KEY_masked": cfg["RESEND_API_KEY_masked"],
                "requested_by": requested_by,
            }
        return {
            "status": "error",
            "resend_response": send_result.get("resend"),
            "error": send_result.get("error"),
            "traceback": send_result.get("traceback"),
            "http_status": send_result.get("http_status"),
            "to": DIAG_TEST_EMAIL_TO,
            "from": cfg["from"],
            "SENDER_EMAIL": cfg["SENDER_EMAIL"],
            "RESEND_API_KEY_present": cfg["RESEND_API_KEY_present"],
            "RESEND_API_KEY_masked": cfg["RESEND_API_KEY_masked"],
            "requested_by": requested_by,
        }
    except Exception as e:
        tb = traceback.format_exc()
        print(tb, flush=True)
        logger.error("debug-send-test exception:\n%s", tb)
        return {
            "status": "error",
            "error": f"{type(e).__name__}: {e}",
            "traceback": tb,
            "from": cfg["from"],
            "SENDER_EMAIL": cfg["SENDER_EMAIL"],
            "RESEND_API_KEY_present": cfg["RESEND_API_KEY_present"],
            "RESEND_API_KEY_masked": cfg["RESEND_API_KEY_masked"],
        }


@router.get("/v1/auth/test-resend-direct", tags=["auth", "diagnostic"])
@router.get("/auth/test-resend-direct", tags=["auth", "diagnostic"])
async def test_resend_direct():
    """
    Diagnostic temporaire SANS authentification (destinataire fixé).

    GET /api/v1/auth/test-resend-direct
    GET /api/auth/test-resend-direct

    Destinataire : cyrilalepsa@gmail.com
    Expéditeur : MamanDouce <noreply@neriacorp.com>
    Retourne la réponse brute Resend (id) ou l'erreur + traceback.
    """
    global _last_direct_send_monotonic
    now = time.monotonic()
    wait = _DIRECT_SEND_MIN_INTERVAL_SEC - (now - _last_direct_send_monotonic)
    if wait > 0:
        return JSONResponse(
            status_code=429,
            content={
                "status": "error",
                "error": f"rate_limited — réessayez dans {int(wait) + 1}s",
                "to": DIAG_TEST_EMAIL_TO,
            },
        )
    _last_direct_send_monotonic = now
    try:
        payload = send_resend_direct(
            to=DIAG_TEST_EMAIL_TO,
            from_address="noreply@neriacorp.com",
            subject="[MamanDouce] test-resend-direct",
            html=(
                "<p>Test isolé GET /api/v1/auth/test-resend-direct — "
                f"{datetime.now(timezone.utc).isoformat()}</p>"
            ),
        )
        payload["db_name"] = resolve_db_name()
        payload["requested_by"] = "public-diagnostic"
        return payload
    except Exception as e:
        tb = traceback.format_exc()
        print(tb, flush=True)
        logger.error("test-resend-direct exception:\n%s", tb)
        cfg = public_email_config()
        return {
            "status": "error",
            "error": f"{type(e).__name__}: {e}",
            "traceback": tb,
            "to": DIAG_TEST_EMAIL_TO,
            "from": cfg["from"],
            "SENDER_EMAIL": cfg["SENDER_EMAIL"],
            "RESEND_API_KEY_present": cfg["RESEND_API_KEY_present"],
            "RESEND_API_KEY_masked": cfg["RESEND_API_KEY_masked"],
            "db_name": resolve_db_name(),
        }


def mirror_auth_routes_under_v1() -> None:
    """Duplique /auth/* vers /v1/auth/* (préfixe FastAPI global = /api)."""
    from fastapi.routing import APIRoute

    existing = {getattr(route, "path", "") for route in router.routes}
    for route in list(router.routes):
        if not isinstance(route, APIRoute):
            continue
        path = route.path or ""
        if not path.startswith("/auth/"):
            continue
        alias = f"/v1{path}"
        if alias in existing:
            continue
        methods = set(route.methods or [])
        methods.discard("HEAD")
        if not methods:
            continue
        router.add_api_route(
            alias,
            route.endpoint,
            methods=sorted(methods),
            response_model=route.response_model,
            dependencies=route.dependencies,
            tags=list(route.tags or ["auth"]),
        )
        existing.add(alias)


mirror_auth_routes_under_v1()

