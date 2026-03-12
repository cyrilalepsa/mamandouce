from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import httpx
import io
import cv2
import numpy as np
from pyzbar.pyzbar import decode
import resend
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ.get("SECRET_KEY", "votre-cle-secrete-changez-moi")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

logger = logging.getLogger(__name__)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PregnancyProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    last_period_date: Optional[str] = None
    estimated_conception_date: Optional[str] = None
    estimated_due_date: Optional[str] = None
    current_week: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PregnancyCalculation(BaseModel):
    last_period_date: str

class SearchHistoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    query: str
    result_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    date: str
    time: Optional[str] = None
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WeeklyTip(BaseModel):
    week: int
    title: str
    description: str
    embryo_size: str
    development: str

class NotificationPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    email_notifications: bool = True
    weekly_tips: bool = True
    appointment_reminders: bool = True
    email_address: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FavoriteFood(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    status: str  # safe, caution, avoid, unsafe
    reason: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    appointment_id: str
    weight: Optional[float] = None  # Poids en kg
    blood_pressure_systolic: Optional[int] = None  # Tension systolique
    blood_pressure_diastolic: Optional[int] = None  # Tension diastolique
    baby_heartbeat: Optional[int] = None  # Battements cardiaques bébé
    baby_weight: Optional[float] = None  # Poids estimé du bébé en g
    baby_size: Optional[float] = None  # Taille du bébé en cm
    notes: Optional[str] = None  # Notes personnelles libres
    doctor_name: Optional[str] = None  # Nom du médecin
    next_appointment: Optional[str] = None  # Date prochain RDV
    attachments: List[str] = []  # URLs des documents joints
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmailRequest(BaseModel):
    recipient_email: EmailStr
    subject: str
    html_content: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token invalide")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    return User(**user)

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    hashed_password = pwd_context.hash(user_data.password)
    user = User(email=user_data.email, name=user_data.name)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token, token_type="bearer")

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Email ou mot de passe incorrect")
    
    if not pwd_context.verify(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Email ou mot de passe incorrect")
    
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token, token_type="bearer")

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/pregnancy/calculate")
async def calculate_pregnancy(data: PregnancyCalculation, current_user: User = Depends(get_current_user)):
    from datetime import datetime
    last_period = datetime.fromisoformat(data.last_period_date)
    
    ovulation_date = last_period + timedelta(days=14)
    conception_date = ovulation_date
    due_date = last_period + timedelta(days=280)
    
    today = datetime.now()
    weeks_pregnant = (today - last_period).days // 7
    
    profile = PregnancyProfile(
        user_id=current_user.id,
        last_period_date=last_period.isoformat(),
        estimated_conception_date=conception_date.isoformat(),
        estimated_due_date=due_date.isoformat(),
        current_week=weeks_pregnant
    )
    
    existing = await db.pregnancy_profiles.find_one({"user_id": current_user.id})
    profile_dict = profile.model_dump()
    profile_dict["created_at"] = profile_dict["created_at"].isoformat()
    profile_dict["updated_at"] = profile_dict["updated_at"].isoformat()
    
    if existing:
        await db.pregnancy_profiles.update_one(
            {"user_id": current_user.id},
            {"$set": profile_dict}
        )
    else:
        await db.pregnancy_profiles.insert_one(profile_dict)
    
    return {
        "last_period_date": last_period.isoformat(),
        "ovulation_date": ovulation_date.isoformat(),
        "conception_date": conception_date.isoformat(),
        "due_date": due_date.isoformat(),
        "weeks_pregnant": weeks_pregnant
    }

@api_router.get("/pregnancy/profile")
async def get_pregnancy_profile(current_user: User = Depends(get_current_user)):
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    if not profile:
        return None
    return profile

@api_router.post("/scan/barcode")
async def scan_barcode(barcode: str, current_user: User = Depends(get_current_user)):
    try:
        food_safety_db = await get_food_safety_database()
        product_info = food_safety_db.get(barcode, None)
        
        if not product_info:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json",
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == 1:
                        product = data.get("product", {})
                        product_info = {
                            "barcode": barcode,
                            "name": product.get("product_name", "Produit inconnu"),
                            "brand": product.get("brands", ""),
                            "image_url": product.get("image_url", ""),
                            "categories": product.get("categories", ""),
                            "ingredients": product.get("ingredients_text_fr", ""),
                            "safe_for_pregnancy": "unknown"
                        }
        
        if product_info:
            history = SearchHistoryItem(
                user_id=current_user.id,
                query=barcode,
                result_type="barcode"
            )
            history_dict = history.model_dump()
            history_dict["created_at"] = history_dict["created_at"].isoformat()
            await db.search_history.insert_one(history_dict)
        
        return product_info or {"barcode": barcode, "name": "Produit non trouvé", "safe_for_pregnancy": "unknown"}
    except Exception as e:
        logger.error(f"Erreur scan barcode: {str(e)}")
        return {"barcode": barcode, "name": "Erreur lors du scan", "safe_for_pregnancy": "unknown"}

@api_router.post("/scan/search")
async def search_food(query: str, current_user: User = Depends(get_current_user)):
    food_safety_db = await get_food_safety_database()
    results = []
    
    for key, value in food_safety_db.items():
        if query.lower() in value["name"].lower():
            results.append(value)
    
    if results:
        history = SearchHistoryItem(
            user_id=current_user.id,
            query=query,
            result_type="search"
        )
        history_dict = history.model_dump()
        history_dict["created_at"] = history_dict["created_at"].isoformat()
        await db.search_history.insert_one(history_dict)
    
    return results[:10]

@api_router.get("/foods/safe")
async def get_safe_foods(current_user: User = Depends(get_current_user)):
    food_db = await get_food_safety_database()
    safe_foods = [v for v in food_db.values() if v["safe_for_pregnancy"] == "safe"]
    return safe_foods

@api_router.get("/history/search")
async def get_search_history(current_user: User = Depends(get_current_user)):
    history = await db.search_history.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    return history

@api_router.post("/notifications", response_model=NotificationItem)
async def create_notification(notification: NotificationItem, current_user: User = Depends(get_current_user)):
    notification.user_id = current_user.id
    notif_dict = notification.model_dump()
    notif_dict["created_at"] = notif_dict["created_at"].isoformat()
    await db.notifications.insert_one(notif_dict)
    return notification

@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("date", 1).to_list(100)
    return notifications

@api_router.put("/notifications/{notification_id}")
async def update_notification(notification_id: str, completed: bool, current_user: User = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"completed": completed}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    return {"success": True}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, current_user: User = Depends(get_current_user)):
    result = await db.notifications.delete_one({"id": notification_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    return {"success": True}

# Email endpoints
@api_router.post("/email/send")
async def send_email(email_data: dict, current_user: User = Depends(get_current_user)):
    """Send an email using Resend"""
    if not RESEND_API_KEY or RESEND_API_KEY == "re_votre_cle_api_resend":
        raise HTTPException(status_code=500, detail="API Resend non configurée")
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [email_data.get("to", current_user.email)],
            "subject": email_data.get("subject", "Message de MamanDouce"),
            "html": email_data.get("html", "<p>Contenu du message</p>")
        }
        
        email_response = resend.Emails.send(params)
        return {"success": True, "message": "Email envoyé", "id": email_response.get("id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur envoi email: {str(e)}")

@api_router.post("/email/send-weekly-tip")
async def send_weekly_tip_email(current_user: User = Depends(get_current_user)):
    """Send the weekly pregnancy tip by email"""
    if not RESEND_API_KEY or RESEND_API_KEY == "re_votre_cle_api_resend":
        raise HTTPException(status_code=500, detail="API Resend non configurée")
    
    # Get user's pregnancy profile
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    if not profile or not profile.get("current_week"):
        raise HTTPException(status_code=400, detail="Profil de grossesse non configuré")
    
    current_week = profile.get("current_week", 1)
    
    # Get the weekly tip
    tips = await get_weekly_tips_database()
    tip = next((t for t in tips if t["week"] == current_week), None)
    
    if not tip:
        raise HTTPException(status_code=404, detail="Conseil non trouvé pour cette semaine")
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #87CEEB 0%, #F472B6 100%); padding: 20px; border-radius: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">MamanDouce</h1>
            <p style="color: white; opacity: 0.9;">Semaine {current_week} de votre grossesse</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-top: 20px;">
            <h2 style="color: #0ea5e9;">🍼 {tip['title']}</h2>
            <p style="color: #64748b; line-height: 1.6;">{tip['description']}</p>
            
            <div style="background: white; padding: 15px; border-radius: 10px; margin-top: 15px;">
                <p style="margin: 0;"><strong>📏 Taille de votre bébé:</strong> {tip['embryo_size']}</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            <p>Cet email a été envoyé par MamanDouce</p>
        </div>
    </div>
    """
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [current_user.email],
            "subject": f"🍼 Semaine {current_week} - {tip['title']}",
            "html": html_content
        }
        
        email_response = resend.Emails.send(params)
        return {"success": True, "message": f"Conseil semaine {current_week} envoyé à {current_user.email}", "id": email_response.get("id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur envoi email: {str(e)}")

# Favorites endpoints
@api_router.post("/favorites")
async def add_favorite(food_data: dict, current_user: User = Depends(get_current_user)):
    existing = await db.favorites.find_one({
        "user_id": current_user.id,
        "name": food_data.get("name")
    })
    if existing:
        return {"success": True, "message": "Déjà en favoris", "id": existing["id"]}
    
    favorite = FavoriteFood(
        user_id=current_user.id,
        name=food_data.get("name", ""),
        status=food_data.get("status", "unknown"),
        reason=food_data.get("reason"),
        category=food_data.get("category")
    )
    fav_dict = favorite.model_dump()
    fav_dict["created_at"] = fav_dict["created_at"].isoformat()
    await db.favorites.insert_one(fav_dict)
    return {"success": True, "message": "Ajouté aux favoris", "id": favorite.id}

@api_router.get("/favorites")
async def get_favorites(current_user: User = Depends(get_current_user)):
    favorites = await db.favorites.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return favorites

@api_router.delete("/favorites/{food_name}")
async def remove_favorite(food_name: str, current_user: User = Depends(get_current_user)):
    result = await db.favorites.delete_one({
        "user_id": current_user.id,
        "name": food_name
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favori non trouvé")
    return {"success": True, "message": "Retiré des favoris"}

@api_router.get("/favorites/check/{food_name}")
async def check_favorite(food_name: str, current_user: User = Depends(get_current_user)):
    existing = await db.favorites.find_one({
        "user_id": current_user.id,
        "name": food_name
    })
    return {"is_favorite": existing is not None}

@api_router.get("/alerts/personalized")
async def get_personalized_alerts(current_user: User = Depends(get_current_user)):
    # Get user's pregnancy profile
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    current_week = profile.get("current_week", 1) if profile else 1
    
    # Get user's favorite foods
    favorites = await db.favorites.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    
    alerts = []
    
    # Generate alerts based on food safety and pregnancy week
    for fav in favorites:
        if fav["status"] == "avoid":
            alerts.append({
                "type": "warning",
                "title": f"Attention: {fav['name']}",
                "message": f"Cet aliment favori est à éviter pendant la grossesse. {fav.get('reason', '')}",
                "food_name": fav["name"],
                "priority": "high"
            })
        elif fav["status"] == "caution":
            alerts.append({
                "type": "caution",
                "title": f"Précaution: {fav['name']}",
                "message": f"Consommez avec modération. {fav.get('reason', '')}",
                "food_name": fav["name"],
                "priority": "medium"
            })
        elif fav["status"] == "safe":
            alerts.append({
                "type": "safe",
                "title": f"Recommandé: {fav['name']}",
                "message": "Cet aliment est sûr et recommandé pendant la grossesse.",
                "food_name": fav["name"],
                "priority": "low"
            })
    
    # Add week-specific tips
    if current_week <= 12:
        alerts.append({
            "type": "tip",
            "title": "Premier trimestre",
            "message": "Privilégiez les aliments riches en acide folique : légumes verts, oranges, légumineuses.",
            "priority": "info"
        })
    elif current_week <= 24:
        alerts.append({
            "type": "tip",
            "title": "Deuxième trimestre",
            "message": "Augmentez votre apport en fer et calcium pour le développement osseux du bébé.",
            "priority": "info"
        })
    else:
        alerts.append({
            "type": "tip",
            "title": "Troisième trimestre",
            "message": "Consommez des protéines de qualité et des oméga-3 pour le développement cérébral.",
            "priority": "info"
        })
    
    return {
        "current_week": current_week,
        "alerts": sorted(alerts, key=lambda x: {"high": 0, "medium": 1, "low": 2, "info": 3}.get(x["priority"], 4))
    }

@api_router.get("/tips/weekly/{week}")
async def get_weekly_tip(week: int, current_user: User = Depends(get_current_user)):
    tips = await get_weekly_tips_database()
    tip = next((t for t in tips if t["week"] == week), None)
    if not tip:
        return {"week": week, "title": "Semaine " + str(week), "description": "Informations à venir"}
    return tip

@api_router.get("/embryo/week/{week}")
async def get_embryo_development(week: int, current_user: User = Depends(get_current_user)):
    tips = await get_weekly_tips_database()
    tip = next((t for t in tips if t["week"] == week), None)
    if not tip:
        return {"week": week, "development": "Informations à venir", "embryo_size": "N/A"}
    return {
        "week": week,
        "development": tip["development"],
        "embryo_size": tip["embryo_size"]
    }

@api_router.get("/location/services")
async def get_location_services(lat: Optional[float] = None, lng: Optional[float] = None, postal_code: Optional[str] = None):
    if postal_code:
        return {
            "caf": {
                "name": "CAF locale",
                "url": "https://www.caf.fr",
                "phone": "0810 25 75 10"
            },
            "ameli": {
                "name": "Ameli Assurance Maladie",
                "url": "https://www.ameli.fr",
                "phone": "36 46"
            },
            "mairie": {
                "name": "Mairie locale",
                "url": f"https://www.google.com/search?q=mairie+{postal_code}",
                "phone": "Rechercher en ligne"
            }
        }
    return {
        "caf": {"name": "CAF", "url": "https://www.caf.fr"},
        "ameli": {"name": "Ameli", "url": "https://www.ameli.fr"},
        "mairie": {"name": "Mairie", "url": "https://www.service-public.fr/particuliers/vosdroits/F1175"}
    }

@api_router.get("/notifications/preferences")
async def get_notification_preferences(current_user: User = Depends(get_current_user)):
    prefs = await db.notification_preferences.find_one({"user_id": current_user.id}, {"_id": 0})
    if not prefs:
        default_prefs = NotificationPreferences(
            user_id=current_user.id,
            email_address=current_user.email
        )
        return default_prefs.model_dump()
    return prefs

@api_router.post("/notifications/preferences")
async def update_notification_preferences(preferences: NotificationPreferences, current_user: User = Depends(get_current_user)):
    preferences.user_id = current_user.id
    prefs_dict = preferences.model_dump()
    prefs_dict["updated_at"] = prefs_dict["updated_at"].isoformat()
    
    await db.notification_preferences.update_one(
        {"user_id": current_user.id},
        {"$set": prefs_dict},
        upsert=True
    )
    return {"success": True, "message": "Préférences mises à jour"}

@api_router.post("/email/send")
async def send_email(request: EmailRequest, current_user: User = Depends(get_current_user)):
    if not RESEND_API_KEY or RESEND_API_KEY == "re_votre_cle_api_resend":
        raise HTTPException(status_code=503, detail="Service email non configuré. Veuillez ajouter votre clé API Resend.")
    
    params = {
        "from": SENDER_EMAIL,
        "to": [request.recipient_email],
        "subject": request.subject,
        "html": request.html_content
    }
    
    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        return {
            "status": "success",
            "message": f"Email envoyé à {request.recipient_email}",
            "email_id": email.get("id")
        }
    except Exception as e:
        logger.error(f"Erreur envoi email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'envoi de l'email: {str(e)}")

@api_router.post("/email/send-reminder")
async def send_reminder_email(notification_id: str, current_user: User = Depends(get_current_user)):
    notification = await db.notifications.find_one({"id": notification_id, "user_id": current_user.id}, {"_id": 0})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    
    prefs = await db.notification_preferences.find_one({"user_id": current_user.id}, {"_id": 0})
    if not prefs or not prefs.get("email_notifications") or not prefs.get("appointment_reminders"):
        return {"success": False, "message": "Notifications email désactivées"}
    
    if not RESEND_API_KEY or RESEND_API_KEY == "re_votre_cle_api_resend":
        raise HTTPException(status_code=503, detail="Service email non configuré")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #F8FAFC; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .title {{ color: #87CEEB; font-size: 32px; font-weight: bold; margin: 0; }}
            .content {{ background: linear-gradient(to bottom right, #FED7E2, #BFDBFE); border-radius: 16px; padding: 24px; margin: 20px 0; }}
            .notification-title {{ color: #1E293B; font-size: 24px; font-weight: bold; margin-bottom: 10px; }}
            .notification-desc {{ color: #475569; font-size: 16px; line-height: 1.6; }}
            .date-info {{ background: white; border-radius: 12px; padding: 16px; margin-top: 16px; }}
            .footer {{ text-align: center; color: #94A3B8; font-size: 14px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">MamanDouce 💕</h1>
                <p style="color: #64748B;">Votre compagnon de grossesse</p>
            </div>
            
            <div class="content">
                <h2 class="notification-title">📅 Rappel : {notification["title"]}</h2>
                <p class="notification-desc">{notification.get("description", "")}</p>
                <div class="date-info">
                    <strong>📆 Date :</strong> {notification["date"]}<br>
                    {f'<strong>🕐 Heure :</strong> {notification["time"]}' if notification.get("time") else ''}
                </div>
            </div>
            
            <div class="footer">
                <p>Cet email est envoyé automatiquement depuis MamanDouce</p>
                <p>Vous pouvez désactiver les notifications dans vos préférences</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [prefs["email_address"]],
        "subject": f"Rappel MamanDouce : {notification['title']}",
        "html": html_content
    }
    
    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        return {
            "status": "success",
            "message": "Email de rappel envoyé",
            "email_id": email.get("id")
        }
    except Exception as e:
        logger.error(f"Erreur envoi rappel: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/email/send-weekly-tip")
async def send_weekly_tip_email(week: int, current_user: User = Depends(get_current_user)):
    prefs = await db.notification_preferences.find_one({"user_id": current_user.id}, {"_id": 0})
    if not prefs or not prefs.get("email_notifications") or not prefs.get("weekly_tips"):
        return {"success": False, "message": "Notifications email désactivées"}
    
    if not RESEND_API_KEY or RESEND_API_KEY == "re_votre_cle_api_resend":
        raise HTTPException(status_code=503, detail="Service email non configuré")
    
    tips = await get_weekly_tips_database()
    tip = next((t for t in tips if t["week"] == week), None)
    if not tip:
        raise HTTPException(status_code=404, detail="Conseil introuvable")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #F8FAFC; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .title {{ color: #87CEEB; font-size: 32px; font-weight: bold; margin: 0; }}
            .week-badge {{ display: inline-block; background: linear-gradient(to right, #14B8A6, #06B6D4); color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }}
            .content {{ background: linear-gradient(to bottom right, #E0F2FE, #D1FAE5); border-radius: 16px; padding: 24px; margin: 20px 0; }}
            .tip-title {{ color: #1E293B; font-size: 24px; font-weight: bold; margin-bottom: 16px; }}
            .tip-desc {{ color: #475569; font-size: 16px; line-height: 1.8; }}
            .info-box {{ background: white; border-radius: 12px; padding: 16px; margin-top: 16px; }}
            .footer {{ text-align: center; color: #94A3B8; font-size: 14px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">MamanDouce 💕</h1>
                <p style="color: #64748B;">Votre conseil hebdomadaire</p>
                <span class="week-badge">Semaine {week}</span>
            </div>
            
            <div class="content">
                <h2 class="tip-title">{tip["title"]}</h2>
                <p class="tip-desc">{tip["description"]}</p>
                
                <div class="info-box">
                    <p><strong>📏 Taille de l'embryon :</strong> {tip["embryo_size"]}</p>
                    <p style="margin-top: 12px;"><strong>🌱 Développement :</strong><br>{tip["development"]}</p>
                </div>
            </div>
            
            <div class="footer">
                <p>Continuez à prendre soin de vous ! 🤰</p>
                <p>Vous pouvez désactiver ces conseils dans vos préférences</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [prefs["email_address"]],
        "subject": f"Semaine {week} : {tip['title']} 🤰",
        "html": html_content
    }
    
    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        return {
            "status": "success",
            "message": "Conseil hebdomadaire envoyé par email",
            "email_id": email.get("id")
        }
    except Exception as e:
        logger.error(f"Erreur envoi conseil: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_food_safety_database():
    from data.food_database import FOOD_SAFETY_DATABASE
    return FOOD_SAFETY_DATABASE

async def get_weekly_tips_database():
    from data.weekly_tips import WEEKLY_TIPS
    return WEEKLY_TIPS

async def get_medical_appointments():
    from data.medical_appointments import MEDICAL_APPOINTMENTS, PREPARATION_COURSES
    return MEDICAL_APPOINTMENTS + PREPARATION_COURSES

# Medical Appointments endpoints
@api_router.get("/medical/appointments")
async def get_user_medical_appointments(current_user: User = Depends(get_current_user)):
    """Get all medical appointments based on user's pregnancy profile"""
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    
    if not profile or not profile.get("last_period_date"):
        return {"appointments": [], "message": "Veuillez d'abord configurer votre profil de grossesse"}
    
    current_week = profile.get("current_week", 1)
    last_period = datetime.fromisoformat(profile["last_period_date"])
    
    all_appointments = await get_medical_appointments()
    
    # Get user's completed appointments
    completed = await db.completed_appointments.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    completed_ids = {c["appointment_id"] for c in completed}
    
    appointments = []
    for apt in all_appointments:
        # Calculate the date range for this appointment
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
    
    # Sort by week_start
    appointments.sort(key=lambda x: x["week_start"])
    
    return {
        "current_week": current_week,
        "appointments": appointments
    }

@api_router.get("/medical/upcoming")
async def get_upcoming_appointments(current_user: User = Depends(get_current_user)):
    """Get upcoming and current medical appointments for homepage display"""
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    
    if not profile or not profile.get("last_period_date"):
        return {"appointments": []}
    
    current_week = profile.get("current_week", 1)
    last_period = datetime.fromisoformat(profile["last_period_date"])
    
    all_appointments = await get_medical_appointments()
    
    # Get user's completed appointments
    completed = await db.completed_appointments.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    completed_ids = {c["appointment_id"] for c in completed}
    
    upcoming = []
    for apt in all_appointments:
        if apt["id"] in completed_ids:
            continue
            
        # Show appointments within current week or up to 4 weeks ahead
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
    
    # Sort by urgency and week
    upcoming.sort(key=lambda x: (not x["is_urgent"], x["week_start"]))
    
    return {"appointments": upcoming[:5]}  # Return max 5 appointments

@api_router.post("/medical/complete/{appointment_id}")
async def mark_appointment_completed(appointment_id: str, current_user: User = Depends(get_current_user)):
    """Mark a medical appointment as completed"""
    # Check if already completed
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

@api_router.delete("/medical/complete/{appointment_id}")
async def unmark_appointment_completed(appointment_id: str, current_user: User = Depends(get_current_user)):
    """Unmark a medical appointment as completed"""
    result = await db.completed_appointments.delete_one({
        "user_id": current_user.id,
        "appointment_id": appointment_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")
    
    return {"success": True, "message": "Rendez-vous marqué comme non complété"}

# Appointment Notes endpoints
@api_router.post("/medical/notes/{appointment_id}")
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
        note = AppointmentNote(
            user_id=current_user.id,
            appointment_id=appointment_id,
            **{k: v for k, v in note_fields.items() if k != "updated_at"}
        )
        note_dict = note.model_dump()
        note_dict["created_at"] = note_dict["created_at"].isoformat()
        note_dict["updated_at"] = note_dict["updated_at"].isoformat()
        await db.appointment_notes.insert_one(note_dict)
        return {"success": True, "message": "Notes enregistrées", "id": note.id}

@api_router.get("/medical/notes/{appointment_id}")
async def get_appointment_note(appointment_id: str, current_user: User = Depends(get_current_user)):
    """Get notes for a specific appointment"""
    note = await db.appointment_notes.find_one(
        {"user_id": current_user.id, "appointment_id": appointment_id},
        {"_id": 0}
    )
    return note or {}

@api_router.get("/medical/notes")
async def get_all_appointment_notes(current_user: User = Depends(get_current_user)):
    """Get all appointment notes for the user"""
    notes = await db.appointment_notes.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    
    # Convert to dict keyed by appointment_id
    notes_dict = {n["appointment_id"]: n for n in notes}
    return notes_dict

@api_router.get("/medical/health-summary")
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

app.include_router(api_router)

# Intégrer le router de paiements
try:
    from routes.payments import router as payments_router
    app.include_router(payments_router, prefix="/api/payments", tags=["payments"])
except Exception as e:
    logger.error(f"Erreur chargement router payments: {str(e)}")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
