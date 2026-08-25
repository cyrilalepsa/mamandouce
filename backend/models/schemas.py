"""
Pydantic models/schemas for MamanDouce
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator, model_validator
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

# ==================== AUTH ====================
MULTIPLE_PREGNANCY_VALUES = frozenset({"none", "twins", "triplets_or_more"})


def normalize_multiple_pregnancy(value: Optional[str]) -> str:
    raw = str(value or "none").strip().lower()
    if raw in MULTIPLE_PREGNANCY_VALUES:
        return raw
    return "none"


def build_full_name(first_name: Optional[str], last_name: Optional[str]) -> str:
    return " ".join(
        part for part in [str(first_name or "").strip(), str(last_name or "").strip()] if part
    )


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str = ""
    last_name: str = ""
    name: Optional[str] = None
    city: Optional[str] = None
    birth_date: Optional[str] = None  # Date de naissance format YYYY-MM-DD
    status: Optional[str] = None  # 'envie_bebe' ou 'enceinte'
    children_at_home: int = 0
    multiple_pregnancy: str = "none"
    referral_code: Optional[str] = None

    @model_validator(mode="after")
    def normalize_registration_names(self):
        first = self.first_name.strip()
        last = self.last_name.strip()
        legacy_name = (self.name or "").strip()
        if not first and not last and legacy_name:
            parts = legacy_name.split(None, 1)
            first = parts[0]
            last = parts[1] if len(parts) > 1 else ""
        if not first:
            raise ValueError("first_name is required")
        self.first_name = first
        self.last_name = last
        if not legacy_name:
            self.name = build_full_name(first, last)
        else:
            self.name = legacy_name
        return self

    @field_validator("children_at_home", mode="before")
    @classmethod
    def coerce_children_at_home(cls, value):
        if value is None or value == "":
            return 0
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            raise ValueError("children_at_home must be a non-negative integer")
        if parsed < 0:
            raise ValueError("children_at_home must be a non-negative integer")
        return parsed

    @field_validator("multiple_pregnancy", mode="before")
    @classmethod
    def coerce_multiple_pregnancy(cls, value):
        return normalize_multiple_pregnancy(value)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: Optional[str] = None
    role: Optional[str] = None
    subscription_status: Optional[str] = None
    is_superadmin: Optional[bool] = False
    is_admin: Optional[bool] = False
    is_premium: Optional[bool] = False
    is_vip: Optional[bool] = False

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    display_name: Optional[str] = None  # Nom personnalisé pour l'affichage
    avatar: Optional[str] = None  # URL ou base64 de l'avatar
    avatar_config: Optional[dict] = None  # Configuration de l'avatar personnalisé
    city: Optional[str] = None  # Ville de l'utilisatrice
    birth_date: Optional[str] = None  # Date de naissance format YYYY-MM-DD
    status: Optional[str] = None  # 'envie_bebe' ou 'enceinte'
    is_pregnant: Optional[bool] = None
    pregnancy_status: Optional[str] = None
    children_at_home: int = 0
    multiple_pregnancy: str = "none"
    role: str = "user"  # "user" or "admin"

    @field_validator("children_at_home", mode="before")
    @classmethod
    def coerce_user_children_at_home(cls, value):
        if value is None or value == "":
            return 0
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return 0
        return max(0, parsed)

    @field_validator("multiple_pregnancy", mode="before")
    @classmethod
    def coerce_user_multiple_pregnancy(cls, value):
        return normalize_multiple_pregnancy(value)
    subscription_status: Optional[str] = "free"  # "free", "trial", "premium"
    is_superadmin: Optional[bool] = False
    is_admin: Optional[bool] = False
    is_premium: Optional[bool] = False
    is_vip: Optional[bool] = False
    gold_status: Optional[bool] = False  # Statut Marraine Or (3 parrainages + 5 contributions)
    badge_level: Optional[str] = None  # 'bronze', 'silver', 'gold'
    contributions_validated: Optional[int] = 0  # Nombre de contributions validées
    referrals_completed: Optional[int] = 0  # Nombre de parrainages réussis
    postpartum_free_unlocked: Optional[bool] = False  # Post-partum gratuit via 2 parrainages
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RegisteredUserResponse(BaseModel):
    """Stable public contract for one row in the admin registered-users list."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    id: str
    email: str = ""
    name: str = ""
    created_at: Optional[str] = None
    role: str = "user"
    subscription_status: str = "free"
    premium_source: str = ""
    display_status: str = "free"
    is_test_user: bool = False
    postpartum_purchased: bool = False
    postpartum_free_via_referral: bool = False

    @model_validator(mode="before")
    @classmethod
    def normalize_mongo_document(cls, value):
        """Convert Mongo ObjectId/datetimes and tolerate historical null fields."""
        if not isinstance(value, dict):
            return value
        data = dict(value)
        raw_id = data.get("id") or data.get("_id")
        if raw_id is not None:
            data["id"] = str(raw_id)
        created_at = data.get("created_at")
        if isinstance(created_at, datetime):
            data["created_at"] = created_at.isoformat()
        elif created_at is not None:
            data["created_at"] = str(created_at)
        string_defaults = {
            "email": "",
            "name": "",
            "role": "user",
            "subscription_status": "free",
            "premium_source": "",
            "display_status": "free",
        }
        for field_name, default in string_defaults.items():
            if data.get(field_name) is None:
                data[field_name] = default
        for field_name in (
            "is_test_user",
            "postpartum_purchased",
            "postpartum_free_via_referral",
        ):
            if data.get(field_name) is None:
                data[field_name] = False
        data.pop("_id", None)
        return data


class RegisteredUsersStats(BaseModel):
    total: int = 0
    premium: int = 0
    beta_tester: int = 0
    trial: int = 0
    free: int = 0
    test_users_count: int = 0


class RegisteredUsersResponse(BaseModel):
    """Exact wrapper consumed by AdminPage/UsersTab."""

    users: List[RegisteredUserResponse] = Field(default_factory=list)
    test_users: List[RegisteredUserResponse] = Field(default_factory=list)
    stats: RegisteredUsersStats = Field(default_factory=RegisteredUsersStats)


class ProfileUpdate(BaseModel):
    """Modèle pour la mise à jour du profil utilisateur"""
    display_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar: Optional[str] = None  # Base64 encoded image
    avatar_config: Optional[dict] = None  # Configuration de l'avatar personnalisé
    city: Optional[str] = None  # Ville de l'utilisatrice
    children_at_home: Optional[int] = None
    multiple_pregnancy: Optional[str] = None

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def strip_name_parts(cls, value):
        if value is None:
            return None
        return str(value).strip()

    @field_validator("children_at_home", mode="before")
    @classmethod
    def coerce_profile_children_at_home(cls, value):
        if value is None or value == "":
            return None
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            raise ValueError("children_at_home must be a non-negative integer")
        if parsed < 0:
            raise ValueError("children_at_home must be a non-negative integer")
        return parsed

    @field_validator("multiple_pregnancy", mode="before")
    @classmethod
    def coerce_profile_multiple_pregnancy(cls, value):
        if value is None or value == "":
            return None
        return normalize_multiple_pregnancy(value)

# ==================== PREGNANCY ====================
class PregnancyCalculation(BaseModel):
    last_period_date: str
    cycle_length: int = 28

    @field_validator("last_period_date")
    @classmethod
    def normalize_last_period_date(cls, value: str) -> str:
        from core.cycle_dates import normalize_iso_date

        return normalize_iso_date(value)

    @field_validator("cycle_length", mode="before")
    @classmethod
    def coerce_cycle_length(cls, value):
        from core.cycle_dates import coerce_cycle_length

        return coerce_cycle_length(value)

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
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddFavoriteRequest(BaseModel):
    food_name: str
    safety_level: str
    notes: str = ""
    category: Optional[str] = None

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


class ReminderCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    datetime: datetime
    type: str = "rdv"
    reminder_type: str = "push"

    @field_validator("title")
    @classmethod
    def clean_reminder_title(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Le titre est requis")
        return cleaned

    @field_validator("reminder_type")
    @classmethod
    def validate_reminder_type(cls, value: str) -> str:
        if value not in {"push", "email", "both"}:
            raise ValueError("reminder_type doit être push, email ou both")
        return value


class ReminderResponse(BaseModel):
    id: str
    title: str
    datetime: str
    type: str = "rdv"
    reminder_type: str = "push"
    sent: bool = False


class RemindersResponse(BaseModel):
    reminders: List[ReminderResponse] = Field(default_factory=list)


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
    images: Optional[List[str]] = None  # Liste d'images en base64
    is_read: bool = False
    admin_reply: Optional[str] = None
    admin_reply_images: Optional[List[str]] = None  # Images dans la réponse admin
    replied_at: Optional[str] = None
    user_read_reply: bool = False
    conversation: Optional[List[dict]] = None  # Historique avec images
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageRequest(BaseModel):
    subject: Optional[str] = None
    message: str
    images: Optional[List[str]] = None  # Liste d'images en base64 (max 3)

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



# ==================== CONTRIBUTIONS ====================
class Contribution(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    contribution_type: str  # 'food_scan', 'maternity_bag', 'recipe'
    title: str
    description: Optional[str] = None
    data: Optional[Dict[str, Any]] = None  # Données spécifiques selon le type
    status: str = "pending"  # 'pending', 'approved', 'rejected'
    admin_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContributionSubmit(BaseModel):
    contribution_type: str
    title: str
    description: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

# ==================== EXPERT COMPTABLE IA ====================
class AccountingChatMessage(BaseModel):
    role: str  # 'user' ou 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AccountingChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class AccountingKPIs(BaseModel):
    ca_brut: float
    frais_stripe: float  # 2.9% + 0.25€ par transaction
    cotisations_urssaf: float  # 26% du CA
    benefice_net: float
    total_premium: int
    total_postpartum: int
    month: str
