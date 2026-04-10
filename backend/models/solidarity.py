"""
Models for Solidarity System - Cagnotte, Badges, Relais Maman
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


# ==================== ENUMS ====================

class BadgeType(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"


class ContributionStatus(str, Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"


class GiftCardStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    REDEEMED = "redeemed"
    EXPIRED = "expired"


class WalletTransactionType(str, Enum):
    INITIAL_BONUS = "initial_bonus"        # 3€ à l'inscription
    REFERRAL_BONUS = "referral_bonus"      # +3€ par parrainage réussi
    CONTRIBUTION = "contribution"           # Contribution validée
    DONATION_FRIEND = "donation_friend"     # Don à une amie
    DONATION_RELAY = "donation_relay"       # Don au Relais Maman
    ADMIN_CREDIT = "admin_credit"          # Crédit admin
    GIFT_RECEIVED = "gift_received"        # Bon d'achat reçu


# ==================== WALLET (CAGNOTTE) ====================

class WalletTransaction(BaseModel):
    """Transaction dans la cagnotte"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: WalletTransactionType
    amount: float  # Positif = crédit, Négatif = débit
    description: str
    reference_id: Optional[str] = None  # ID parrainage, contribution, etc.
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class UserWallet(BaseModel):
    """Cagnotte utilisateur"""
    user_id: str
    balance: float = 3.0  # Solde initial 3€
    total_earned: float = 3.0  # Total gagné
    total_donated: float = 0.0  # Total donné
    transactions_count: int = 1
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ==================== BADGES ====================

class UserBadge(BaseModel):
    """Badge utilisateur"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    badge_type: BadgeType
    earned_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    contributions_count: int = 0
    referrals_count: int = 0
    reward_claimed: bool = False  # Pour le badge Or (code invitation offert)


class BadgeProgress(BaseModel):
    """Progression vers les badges"""
    contributions_validated: int = 0
    referrals_completed: int = 0
    has_bronze: bool = False
    has_silver: bool = False
    has_gold: bool = False
    bronze_progress: float = 0.0  # 0-100%
    silver_progress: float = 0.0
    gold_progress: float = 0.0


# ==================== CONTRIBUTIONS ====================

class Contribution(BaseModel):
    """Contribution utilisateur (conseils, astuces, etc.)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    user_name: str
    type: str  # "tip", "recipe", "advice", "experience"
    title: str
    content: str
    category: Optional[str] = None  # "alimentation", "bien-être", "administratif", etc.
    status: ContributionStatus = ContributionStatus.PENDING
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ==================== GIFT CARDS (BONS D'ACHAT) ====================

class GiftCard(BaseModel):
    """Bon d'achat solidaire"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str = Field(default_factory=lambda: f"MM-{str(uuid.uuid4())[:8].upper()}")
    sender_id: str
    sender_email: str
    sender_name: str
    recipient_email: str
    recipient_name: Optional[str] = None
    amount: float
    message: Optional[str] = None
    status: GiftCardStatus = GiftCardStatus.PENDING
    sent_at: Optional[str] = None
    redeemed_by: Optional[str] = None
    redeemed_at: Optional[str] = None
    expires_at: str  # 1 an de validité
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ==================== RELAIS MAMAN (POT COMMUN) ====================

class RelaisMamanDonation(BaseModel):
    """Don au pot commun Relais Maman"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    donor_id: str
    donor_email: str
    donor_name: str
    amount: float
    source: str  # "account_closure", "voluntary", "subscription"
    message: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class RelaisMamanStats(BaseModel):
    """Statistiques du Relais Maman"""
    total_collected: float = 0.0
    total_distributed: float = 0.0
    donations_count: int = 0
    gift_cards_sent: int = 0
    beneficiaries_count: int = 0


class RelaisMamanDistribution(BaseModel):
    """Distribution d'un bon Relais Maman"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_email: str
    recipient_name: Optional[str] = None
    amount: float
    reason: str  # Raison de l'attribution
    gift_card_id: str
    distributed_by: str  # Admin ID
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ==================== ACCOUNT ARCHIVE ====================

class AccountArchiveRequest(BaseModel):
    """Demande d'archivage de compte"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    wallet_balance: float
    donation_choice: str  # "friend", "relay", "none"
    friend_email: Optional[str] = None
    friend_name: Optional[str] = None
    gift_card_id: Optional[str] = None
    relay_donation_id: Optional[str] = None
    reason: Optional[str] = None
    processed: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
