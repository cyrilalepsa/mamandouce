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

async def get_food_safety_database():
    return {
        "3017620422003": {"barcode": "3017620422003", "name": "Nutella", "safe_for_pregnancy": "safe", "category": "Pâte à tartiner"},
        "3228020000000": {"barcode": "3228020000000", "name": "Lait pasteurisé", "safe_for_pregnancy": "safe", "category": "Laitages"},
        "3250391600007": {"barcode": "3250391600007", "name": "Emmental", "safe_for_pregnancy": "safe", "category": "Fromage à pâte dure"},
        "saumon-fume": {"barcode": "saumon-fume", "name": "Saumon fumé", "safe_for_pregnancy": "caution", "category": "Poisson fumé"},
        "camembert": {"barcode": "camembert", "name": "Camembert au lait cru", "safe_for_pregnancy": "avoid", "category": "Fromage à pâte molle"},
        "raw-fish": {"barcode": "raw-fish", "name": "Poisson cru (sushi)", "safe_for_pregnancy": "unsafe", "category": "Poisson cru"}
    }

async def get_weekly_tips_database():
    return [
        {"week": 1, "title": "Début de grossesse", "description": "Prenez de l'acide folique quotidiennement.", "embryo_size": "< 1mm", "development": "Implantation dans l'utérus"},
        {"week": 4, "title": "Semaine 4", "description": "L'embryon mesure environ 2mm.", "embryo_size": "2mm", "development": "Formation du tube neural"},
        {"week": 8, "title": "Semaine 8", "description": "Tous les organes principaux se forment.", "embryo_size": "1.6cm", "development": "Bras et jambes se développent"},
        {"week": 12, "title": "Semaine 12", "description": "Fin du premier trimestre.", "embryo_size": "5.4cm", "development": "Les organes fonctionnent"},
        {"week": 20, "title": "Semaine 20", "description": "Mi-parcours de la grossesse.", "embryo_size": "16cm", "development": "Mouvements perceptibles"},
        {"week": 32, "title": "Semaine 32", "description": "Bébé prend du poids rapidement.", "embryo_size": "42cm", "development": "Poumons en maturation"},
        {"week": 40, "title": "Semaine 40", "description": "Date prévue d'accouchement.", "embryo_size": "50cm", "development": "Prêt pour la naissance"}
    ]

app.include_router(api_router)

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
