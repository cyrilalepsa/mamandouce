"""
Pydantic models/schemas for MamanDouce
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

# ==================== AUTH ====================
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
    role: str = "user"  # "user" or "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== PREGNANCY ====================
class PregnancyCalculation(BaseModel):
    last_period_date: str
    cycle_length: int = 28

class PregnancyProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    last_period_date: str
    cycle_length: int = 28
    estimated_due_date: str
    estimated_conception_date: str
    current_week: int

class WeeklyTip(BaseModel):
    week: int
    development: str
    advice: List[str]
    tips: List[str]
    medical: List[str]

# ==================== FOOD ====================
class FoodItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    category: str
    is_safe: bool
    safety_level: str  # "safe", "moderate", "avoid"
    notes: str
    barcode: Optional[str] = None

class SearchHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    food_name: str
    barcode: Optional[str] = None
    safety_level: str
    searched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Favorite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    food_name: str
    safety_level: str
    notes: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddFavoriteRequest(BaseModel):
    food_name: str
    safety_level: str
    notes: str = ""

class UserAddedFood(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    category: str
    is_safe: bool
    safety_level: str
    notes: str
    barcode: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddFoodRequest(BaseModel):
    name: str
    category: str
    is_safe: bool
    safety_level: str
    notes: str
    barcode: Optional[str] = None

# ==================== MEDICAL ====================
class MedicalAppointment(BaseModel):
    id: str
    title: str
    description: str
    recommended_week: int
    type: str  # "mandatory", "recommended", "optional"
    professional: str

class AppointmentNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    appointment_id: str
    weight: Optional[float] = None
    blood_pressure: Optional[str] = None
    baby_heart_rate: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentNoteRequest(BaseModel):
    weight: Optional[float] = None
    blood_pressure: Optional[str] = None
    baby_heart_rate: Optional[int] = None
    notes: Optional[str] = None

# ==================== NOTIFICATIONS ====================
class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # "appointment", "week_update", "tip", "food_alert"
    title: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    appointment_reminders: bool = True
    weekly_updates: bool = True
    food_alerts: bool = True
    tips: bool = True

# ==================== BIRTH LIST ====================
class BirthListItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    store: str
    url: Optional[str] = None
    price: Optional[float] = None
    quantity: int = 1
    notes: Optional[str] = None
    is_reserved: bool = False
    reserved_by: Optional[str] = None
    reserved_at: Optional[str] = None

class BirthList(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str = "Ma Liste de Naissance"
    share_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    items: List[BirthListItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddBirthListItemRequest(BaseModel):
    name: str
    store: str
    url: Optional[str] = None
    price: Optional[float] = None
    quantity: int = 1
    notes: Optional[str] = None

# ==================== PROMO CODES ====================
class PromoCode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str = Field(default_factory=lambda: f"BETA-{uuid.uuid4().hex[:5].upper()}")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    used: bool = False
    used_by: Optional[str] = None
    used_at: Optional[datetime] = None
    note: Optional[str] = None

class RedeemCodeRequest(BaseModel):
    code: str

# ==================== ADMIN MESSAGES ====================
class AdminMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    user_name: Optional[str] = None
    subject: str
    message: str
    is_read: bool = False
    admin_reply: Optional[str] = None
    replied_at: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageRequest(BaseModel):
    subject: str
    message: str

class AdminReplyRequest(BaseModel):
    reply: str

# ==================== PUSH NOTIFICATIONS ====================
class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscription(BaseModel):
    endpoint: str
    keys: PushSubscriptionKeys

class SubscribeRequest(BaseModel):
    subscription: PushSubscription
    user_email: Optional[str] = None
