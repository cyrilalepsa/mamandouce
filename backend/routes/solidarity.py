"""
Solidarity Routes - Cagnotte, Badges, Relais Maman, Account Archive
API endpoints for the solidarity system
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

from core.database import db
from core.security import get_current_user
from core.gamification import badge_progress_percent, eligible_badges
from models.schemas import User
from models.solidarity import (
    WalletTransaction, WalletTransactionType, UserWallet,
    BadgeType, BadgeProgress, UserBadge,
    Contribution, ContributionStatus,
    GiftCard, GiftCardStatus,
    RelaisMamanDonation, RelaisMamanStats,
    AccountArchiveRequest
)

router = APIRouter(prefix="/solidarity", tags=["Solidarity"])


# ==================== SCHEMAS ====================

class DonateToFriendInput(BaseModel):
    recipient_email: EmailStr
    recipient_name: Optional[str] = None
    message: Optional[str] = None


class ContributionInput(BaseModel):
    type: str  # "tip", "recipe", "advice", "experience"
    title: str
    content: str
    category: Optional[str] = None


class ArchiveAccountInput(BaseModel):
    donation_choice: str  # "friend", "relay", "none"
    friend_email: Optional[str] = None
    friend_name: Optional[str] = None
    reason: Optional[str] = None


# ==================== WALLET (CAGNOTTE) ====================

@router.get("/wallet")
async def get_wallet(current_user: User = Depends(get_current_user)):
    """Get current user's wallet balance and transactions"""
    
    # Récupérer ou créer le wallet
    wallet = await db.wallets.find_one({"user_id": current_user.id}, {"_id": 0})
    
    if not wallet:
        # Créer le wallet avec le bonus initial de 3€
        wallet = UserWallet(
            user_id=current_user.id,
            balance=3.0,
            total_earned=3.0
        ).dict()
        await db.wallets.insert_one(wallet)
        
        # Créer la transaction initiale
        initial_tx = WalletTransaction(
            user_id=current_user.id,
            type=WalletTransactionType.INITIAL_BONUS,
            amount=3.0,
            description="Bonus de bienvenue - 3€ de votre abonnement"
        ).dict()
        await db.wallet_transactions.insert_one(initial_tx)
    
    # Récupérer les 10 dernières transactions
    transactions = await db.wallet_transactions.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "balance": wallet.get("balance", 0),
        "total_earned": wallet.get("total_earned", 0),
        "total_donated": wallet.get("total_donated", 0),
        "transactions": transactions
    }


@router.post("/wallet/credit-referral")
async def credit_referral_bonus(current_user: User = Depends(get_current_user)):
    """Credit 3€ for a successful referral (called when referral is completed)"""
    
    # Cette fonction est appelée quand un parrainage est validé
    amount = 3.0
    
    # Mettre à jour le wallet
    result = await db.wallets.update_one(
        {"user_id": current_user.id},
        {
            "$inc": {
                "balance": amount,
                "total_earned": amount,
                "transactions_count": 1
            },
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        },
        upsert=True
    )
    
    # Créer la transaction
    tx = WalletTransaction(
        user_id=current_user.id,
        type=WalletTransactionType.REFERRAL_BONUS,
        amount=amount,
        description="Bonus parrainage réussi +3€"
    ).dict()
    await db.wallet_transactions.insert_one(tx)
    
    return {"success": True, "amount_credited": amount}


# ==================== BADGES ====================

@router.get("/badges")
async def get_badges(current_user: User = Depends(get_current_user)):
    """Get user's badges and progress"""
    
    # Compter les contributions validées (via le système contributions)
    contributions_validated = await db.contributions.count_documents({
        "user_id": current_user.id,
        "status": {"$in": ["approved", "validated"]},
    })
    
    # Ajouter les aliments approuvés par l'admin
    foods_approved = await db.user_added_foods.count_documents({
        "user_id": current_user.id,
        "status": "approved"
    })
    
    # Vérifier aussi dans badge_progress (mis à jour par admin)
    badge_progress_doc = await db.badge_progress.find_one({"user_id": current_user.id}, {"_id": 0})
    progress_contributions = badge_progress_doc.get("contributions_validated", 0) if badge_progress_doc else 0
    
    # Total des contributions = max des différentes sources
    contributions_validated = max(contributions_validated + foods_approved, progress_contributions)
    
    # Compter les parrainages réussis
    referrals_completed = await db.referrals.count_documents({
        "sponsor_id": current_user.id,
        "status": "completed"
    })
    
    # Récupérer les badges existants
    badges = await db.user_badges.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(10)
    
    badge_types = [b.get("badge_type") for b in badges]
    
    # Calculer la progression
    progress = BadgeProgress(
        contributions_validated=contributions_validated,
        referrals_completed=referrals_completed,
        has_bronze=BadgeType.BRONZE in badge_types,
        has_silver=BadgeType.SILVER in badge_types,
        has_gold=BadgeType.GOLD in badge_types,
        bronze_progress=badge_progress_percent(
            "bronze", contributions_validated, referrals_completed
        ),
        silver_progress=badge_progress_percent(
            "silver", contributions_validated, referrals_completed
        ),
        gold_progress=badge_progress_percent(
            "gold", contributions_validated, referrals_completed
        ),
    )
    
    # Vérifier si nouveaux badges à attribuer
    new_badges = []
    
    for badge_name in eligible_badges(
        contributions_validated, referrals_completed
    ):
        badge_type = BadgeType(badge_name)
        if badge_name in badge_types:
            continue
        badge = UserBadge(
            user_id=current_user.id,
            badge_type=badge_type,
            contributions_count=contributions_validated,
            referrals_count=referrals_completed,
        ).model_dump()
        await db.user_badges.insert_one(badge)
        new_badges.append(badge_type)
    
    return {
        "badges": badges,
        "progress": progress.dict(),
        "new_badges": new_badges
    }


@router.post("/badges/claim-gold-reward")
async def claim_gold_reward(current_user: User = Depends(get_current_user)):
    """Claim the Gold badge reward (1 free Premium invitation code)"""
    
    # Vérifier le badge Or
    gold_badge = await db.user_badges.find_one({
        "user_id": current_user.id,
        "badge_type": BadgeType.GOLD
    })
    
    if not gold_badge:
        raise HTTPException(status_code=400, detail="Badge Or requis")
    
    if gold_badge.get("reward_claimed"):
        raise HTTPException(status_code=400, detail="Récompense déjà réclamée")
    
    # Générer un code d'invitation Premium
    invite_code = f"GOLD-{str(uuid.uuid4())[:8].upper()}"
    
    # Marquer comme réclamé
    await db.user_badges.update_one(
        {"_id": gold_badge["_id"]},
        {"$set": {"reward_claimed": True, "reward_code": invite_code}}
    )
    
    # Enregistrer le code
    await db.premium_codes.insert_one({
        "code": invite_code,
        "created_by": current_user.id,
        "type": "gold_reward",
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "invite_code": invite_code,
        "message": "Code invitation Premium offert !"
    }


# ==================== CONTRIBUTIONS ====================

@router.post("/contributions")
async def submit_contribution(data: ContributionInput, current_user: User = Depends(get_current_user)):
    """Submit a new contribution (tip, recipe, advice)"""
    
    contribution = Contribution(
        user_id=current_user.id,
        user_email=current_user.email,
        user_name=current_user.name,
        type=data.type,
        title=data.title,
        content=data.content,
        category=data.category
    ).dict()
    
    await db.contributions.insert_one(contribution)
    
    return {
        "success": True,
        "contribution_id": contribution["id"],
        "message": "Contribution soumise ! Elle sera validée par notre équipe."
    }


@router.get("/contributions")
async def get_my_contributions(current_user: User = Depends(get_current_user)):
    """Get user's contributions"""
    
    contributions = await db.contributions.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"contributions": contributions}


# ==================== RELAIS MAMAN ====================

@router.get("/relais-maman/stats")
async def get_relais_maman_stats():
    """Get Relais Maman statistics (public)"""
    
    # Total collecté
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    donations_result = await db.relais_donations.aggregate(pipeline).to_list(1)
    total_collected = donations_result[0]["total"] if donations_result else 0
    
    # Nombre de donations
    donations_count = await db.relais_donations.count_documents({})
    
    # Bons distribués
    gift_cards_sent = await db.gift_cards.count_documents({"status": {"$in": ["sent", "redeemed"]}})
    
    # Bénéficiaires uniques
    beneficiaries = await db.gift_cards.distinct("recipient_email", {"status": {"$in": ["sent", "redeemed"]}})
    
    return {
        "total_collected": round(total_collected, 2),
        "donations_count": donations_count,
        "gift_cards_sent": gift_cards_sent,
        "beneficiaries_count": len(beneficiaries)
    }


# ==================== ACCOUNT ARCHIVE (CLÔTURE) ====================

@router.post("/archive-account")
async def archive_account(data: ArchiveAccountInput, current_user: User = Depends(get_current_user)):
    """Archive account and handle wallet donation"""
    
    # Récupérer le solde de la cagnotte
    wallet = await db.wallets.find_one({"user_id": current_user.id})
    balance = wallet.get("balance", 0) if wallet else 0
    
    archive_request = AccountArchiveRequest(
        user_id=current_user.id,
        user_email=current_user.email,
        wallet_balance=balance,
        donation_choice=data.donation_choice,
        friend_email=data.friend_email,
        friend_name=data.friend_name,
        reason=data.reason
    )
    
    gift_card_id = None
    relay_donation_id = None
    
    # Traiter le choix de donation
    if balance > 0:
        if data.donation_choice == "friend" and data.friend_email:
            # Créer un bon d'achat pour l'amie
            expires_at = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()
            gift_card = GiftCard(
                sender_id=current_user.id,
                sender_email=current_user.email,
                sender_name=current_user.name,
                recipient_email=data.friend_email,
                recipient_name=data.friend_name,
                amount=balance,
                message=f"Un cadeau de la part de {current_user.name} via Maman Douce",
                status=GiftCardStatus.PENDING,
                expires_at=expires_at
            ).dict()
            await db.gift_cards.insert_one(gift_card)
            gift_card_id = gift_card["id"]
            
            # TODO: Envoyer l'email avec le bon d'achat
            
        elif data.donation_choice == "relay":
            # Don au Relais Maman
            donation = RelaisMamanDonation(
                donor_id=current_user.id,
                donor_email=current_user.email,
                donor_name=current_user.name,
                amount=balance,
                source="account_closure"
            ).dict()
            await db.relais_donations.insert_one(donation)
            relay_donation_id = donation["id"]
        
        # Vider la cagnotte
        await db.wallets.update_one(
            {"user_id": current_user.id},
            {"$set": {"balance": 0, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Enregistrer la transaction
        tx = WalletTransaction(
            user_id=current_user.id,
            type=WalletTransactionType.DONATION_FRIEND if data.donation_choice == "friend" else (
                WalletTransactionType.DONATION_RELAY if data.donation_choice == "relay" else WalletTransactionType.ADMIN_CREDIT
            ),
            amount=-balance,
            description=f"Don {'à une amie' if data.donation_choice == 'friend' else 'au Relais Maman' if data.donation_choice == 'relay' else 'solde non récupéré'}"
        ).dict()
        await db.wallet_transactions.insert_one(tx)
    
    # Sauvegarder la demande d'archivage
    archive_request.gift_card_id = gift_card_id
    archive_request.relay_donation_id = relay_donation_id
    await db.archive_requests.insert_one(archive_request.dict())
    
    # Marquer le compte comme archivé (pas supprimé)
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "archived": True,
            "archived_at": datetime.now(timezone.utc).isoformat(),
            "subscription_status": "archived"
        }}
    )
    
    return {
        "success": True,
        "balance_donated": balance if data.donation_choice in ["friend", "relay"] else 0,
        "donation_choice": data.donation_choice,
        "gift_card_code": gift_card_id[:8].upper() if gift_card_id else None,
        "message": "Compte archivé avec succès. Merci pour votre confiance !"
    }


@router.get("/archive-preview")
async def get_archive_preview(current_user: User = Depends(get_current_user)):
    """Get preview info for account archive modal"""
    
    wallet = await db.wallets.find_one({"user_id": current_user.id}, {"_id": 0})
    balance = wallet.get("balance", 0) if wallet else 0
    
    # Stats utilisateur
    contributions = await db.contributions.count_documents({
        "user_id": current_user.id,
        "status": "validated"
    })
    
    referrals = await db.referrals.count_documents({
        "sponsor_id": current_user.id,
        "status": "completed"
    })
    
    return {
        "wallet_balance": balance,
        "contributions_count": contributions,
        "referrals_count": referrals,
        "relais_maman_info": {
            "description": "Le Relais Maman aide les futures mamans qui n'ont pas les moyens de s'offrir un accompagnement premium.",
            "impact": f"Votre don de {balance}€ pourrait offrir une invitation sérénité à une maman dans le besoin."
        }
    }


# ==================== GIFT CARDS ====================

@router.get("/gift-cards")
async def get_my_gift_cards(current_user: User = Depends(get_current_user)):
    """Get gift cards sent and received"""
    
    sent = await db.gift_cards.find(
        {"sender_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    received = await db.gift_cards.find(
        {"recipient_email": current_user.email},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    return {
        "sent": sent,
        "received": received
    }


@router.post("/gift-cards/redeem/{code}")
async def redeem_gift_card(code: str, current_user: User = Depends(get_current_user)):
    """Redeem a gift card"""
    
    # Chercher le bon d'achat
    gift_card = await db.gift_cards.find_one({
        "code": code.upper(),
        "status": {"$in": ["pending", "sent"]}
    })
    
    if not gift_card:
        raise HTTPException(status_code=404, detail="Bon d'achat non trouvé ou déjà utilisé")
    
    # Vérifier l'expiration
    expires = datetime.fromisoformat(gift_card["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Bon d'achat expiré")
    
    # Créditer la cagnotte
    amount = gift_card["amount"]
    await db.wallets.update_one(
        {"user_id": current_user.id},
        {
            "$inc": {"balance": amount, "total_earned": amount},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        },
        upsert=True
    )
    
    # Transaction
    tx = WalletTransaction(
        user_id=current_user.id,
        type=WalletTransactionType.GIFT_RECEIVED,
        amount=amount,
        description=f"Bon d'achat de {gift_card['sender_name']}",
        reference_id=gift_card["id"]
    ).dict()
    await db.wallet_transactions.insert_one(tx)
    
    # Marquer comme utilisé
    await db.gift_cards.update_one(
        {"_id": gift_card["_id"]},
        {"$set": {
            "status": GiftCardStatus.REDEEMED,
            "redeemed_by": current_user.id,
            "redeemed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "success": True,
        "amount": amount,
        "message": f"{amount}€ crédités sur votre cagnotte !"
    }


# ==================== ADMIN ROUTES ====================

@router.get("/admin/contributions")
async def admin_get_contributions(
    status: Optional[str] = "pending",
    current_user: User = Depends(get_current_user)
):
    """Admin: Get contributions to review"""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    query = {}
    if status:
        query["status"] = status
    
    contributions = await db.contributions.find(
        query, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"contributions": contributions}


@router.post("/admin/contributions/{contribution_id}/validate")
async def admin_validate_contribution(
    contribution_id: str,
    current_user: User = Depends(get_current_user)
):
    """Admin: Validate a contribution"""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.contributions.update_one(
        {"id": contribution_id},
        {"$set": {
            "status": ContributionStatus.VALIDATED,
            "reviewed_by": current_user.id,
            "reviewed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Contribution non trouvée")
    
    # Note: Plus de crédit 1€ pour les contributions (supprimé)
    # Les récompenses viennent uniquement des badges
    
    return {"success": True, "message": "Contribution validée"}


@router.post("/admin/contributions/{contribution_id}/reject")
async def admin_reject_contribution(
    contribution_id: str,
    reason: str = "Non conforme",
    current_user: User = Depends(get_current_user)
):
    """Admin: Reject a contribution"""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.contributions.update_one(
        {"id": contribution_id},
        {"$set": {
            "status": ContributionStatus.REJECTED,
            "reviewed_by": current_user.id,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "rejection_reason": reason
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Contribution non trouvée")
    
    return {"success": True, "message": "Contribution rejetée"}


@router.get("/admin/relais-maman")
async def admin_get_relais_maman(current_user: User = Depends(get_current_user)):
    """Admin: Get Relais Maman dashboard data"""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Donations
    donations = await db.relais_donations.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Total disponible
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    total_result = await db.relais_donations.aggregate(pipeline).to_list(1)
    total_collected = total_result[0]["total"] if total_result else 0
    
    # Total distribué
    distributed_result = await db.relais_distributions.aggregate(pipeline).to_list(1)
    total_distributed = distributed_result[0]["total"] if distributed_result else 0
    
    # Demandes d'archivage
    archive_requests = await db.archive_requests.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {
        "donations": donations,
        "total_collected": total_collected,
        "total_distributed": total_distributed,
        "available_balance": total_collected - total_distributed,
        "archive_requests": archive_requests
    }


@router.post("/admin/relais-maman/distribute")
async def admin_distribute_relais(
    recipient_email: str,
    amount: float,
    reason: str,
    current_user: User = Depends(get_current_user)
):
    """Admin: Distribute Relais Maman funds to a beneficiary"""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Vérifier le solde disponible
    donations_total = await db.relais_donations.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    distributed_total = await db.relais_distributions.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    collected = donations_total[0]["total"] if donations_total else 0
    distributed = distributed_total[0]["total"] if distributed_total else 0
    available = collected - distributed
    
    if amount > available:
        raise HTTPException(status_code=400, detail=f"Solde insuffisant. Disponible: {available}€")
    
    # Créer un bon d'achat
    expires_at = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()
    gift_card = GiftCard(
        sender_id="relais_maman",
        sender_email="relais@neriacorp.com",
        sender_name="Le Relais Maman",
        recipient_email=recipient_email,
        amount=amount,
        message=f"Un cadeau du Relais Maman: {reason}",
        status=GiftCardStatus.SENT,
        sent_at=datetime.now(timezone.utc).isoformat(),
        expires_at=expires_at
    ).dict()
    await db.gift_cards.insert_one(gift_card)
    
    # Enregistrer la distribution
    distribution = {
        "id": str(uuid.uuid4()),
        "recipient_email": recipient_email,
        "amount": amount,
        "reason": reason,
        "gift_card_id": gift_card["id"],
        "distributed_by": current_user.id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.relais_distributions.insert_one(distribution)
    
    # TODO: Envoyer l'email au bénéficiaire
    
    return {
        "success": True,
        "gift_card_code": gift_card["code"],
        "message": f"Bon de {amount}€ envoyé à {recipient_email}"
    }
