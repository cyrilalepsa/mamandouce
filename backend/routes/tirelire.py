"""
Tirelire (Piggy Bank) routes for MamanDouce
Handles: Referral bonus credits, savings accumulation, discounts application
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import Optional
import logging
import uuid

from core.database import db
from core.security import get_current_user
from models.schemas import User

logger = logging.getLogger(__name__)
router = APIRouter(tags=["tirelire"])

# Constants
REFERRAL_BONUS = 5.0  # 5€ bonus for users arriving via referral link
PREMIUM_PRICE = 30.0
POSTPARTUM_PRICE = 10.0


# ==================== USER TIRELIRE ====================

@router.get("/tirelire/balance")
async def get_tirelire_balance(current_user: User = Depends(get_current_user)):
    """Get user's tirelire (piggy bank) balance and history"""
    
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    # Get tirelire transactions
    transactions = await db.tirelire_transactions.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    balance = user_doc.get("tirelire_balance", 0.0)
    
    # Calculate available for gift (only for godmothers with active subscription)
    can_gift = (
        user_doc.get("subscription_status") == "premium" or 
        user_doc.get("postpartum_purchased")
    )
    gift_balance = user_doc.get("tirelire_gift_balance", 0.0) if can_gift else 0.0
    
    return {
        "balance": round(balance, 2),
        "gift_balance": round(gift_balance, 2),
        "can_gift": can_gift,
        "transactions": transactions,
        "can_apply_to_premium": balance > 0,
        "can_apply_to_postpartum": balance > 0,
        "premium_after_discount": max(0, PREMIUM_PRICE - balance),
        "postpartum_after_discount": max(0, POSTPARTUM_PRICE - balance)
    }


@router.post("/tirelire/apply-referral-bonus")
async def apply_referral_bonus(
    referral_code: str,
    current_user: User = Depends(get_current_user)
):
    """Apply referral bonus (5€) to new user's tirelire"""
    
    # Check if user already received a referral bonus
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    if user_doc.get("referral_bonus_received"):
        raise HTTPException(status_code=400, detail="Bonus de parrainage déjà reçu")
    
    # Validate referral code
    referrer = await db.referral_codes.find_one({"code": referral_code}, {"_id": 0})
    if not referrer:
        raise HTTPException(status_code=404, detail="Code de parrainage invalide")
    
    referrer_id = referrer.get("user_id")
    if referrer_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas utiliser votre propre code")
    
    # Credit 5€ to new user's tirelire
    current_balance = user_doc.get("tirelire_balance", 0.0)
    new_balance = current_balance + REFERRAL_BONUS
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "tirelire_balance": new_balance,
            "referral_bonus_received": True,
            "referred_by": referrer_id,
            "referred_by_code": referral_code
        }}
    )
    
    # Log transaction
    await db.tirelire_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "type": "referral_bonus",
        "amount": REFERRAL_BONUS,
        "description": "Bonus de bienvenue parrainage",
        "referral_code": referral_code,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Update referrer's completed referrals and gift balance
    referrer_user = await db.users.find_one({"id": referrer_id}, {"_id": 0})
    if referrer_user:
        current_referrals = referrer_user.get("referrals_completed", 0)
        current_gift_balance = referrer_user.get("tirelire_gift_balance", 0.0)
        
        # Credit referrer with gift balance (5€ per referral for gifting)
        await db.users.update_one(
            {"id": referrer_id},
            {"$set": {
                "referrals_completed": current_referrals + 1,
                "tirelire_gift_balance": current_gift_balance + REFERRAL_BONUS
            }}
        )
        
        # Log referrer's gift balance transaction
        await db.tirelire_transactions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": referrer_id,
            "type": "referral_earned",
            "amount": REFERRAL_BONUS,
            "description": f"Parrainage réussi de {current_user.email}",
            "referred_user_id": current_user.id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Mark referral as completed
        await db.referrals.insert_one({
            "id": str(uuid.uuid4()),
            "referrer_id": referrer_id,
            "referred_id": current_user.id,
            "code_used": referral_code,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    logger.info(f"Referral bonus applied: {current_user.email} received {REFERRAL_BONUS}€ from code {referral_code}")
    
    return {
        "success": True,
        "bonus_amount": REFERRAL_BONUS,
        "new_balance": new_balance,
        "message": f"🎁 {REFERRAL_BONUS}€ ont été crédités dans votre tirelire !"
    }


@router.post("/tirelire/use-for-purchase")
async def use_tirelire_for_purchase(
    package_type: str,  # 'premium' or 'postpartum'
    current_user: User = Depends(get_current_user)
):
    """Calculate and prepare tirelire discount for purchase"""
    
    if package_type not in ['premium', 'postpartum']:
        raise HTTPException(status_code=400, detail="Type de package invalide")
    
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    balance = user_doc.get("tirelire_balance", 0.0)
    
    if balance <= 0:
        raise HTTPException(status_code=400, detail="Tirelire vide")
    
    original_price = PREMIUM_PRICE if package_type == 'premium' else POSTPARTUM_PRICE
    discount = min(balance, original_price)
    final_price = max(0, original_price - discount)
    
    # Store pending discount for webhook processing
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "pending_tirelire_discount": discount,
            "pending_tirelire_package": package_type
        }}
    )
    
    return {
        "original_price": original_price,
        "discount": round(discount, 2),
        "final_price": round(final_price, 2),
        "tirelire_balance_after": round(balance - discount, 2),
        "is_free": final_price == 0
    }


@router.post("/tirelire/confirm-discount")
async def confirm_tirelire_discount(
    package_type: str,
    current_user: User = Depends(get_current_user)
):
    """Confirm and apply tirelire discount after successful payment or for free purchase"""
    
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    balance = user_doc.get("tirelire_balance", 0.0)
    
    original_price = PREMIUM_PRICE if package_type == 'premium' else POSTPARTUM_PRICE
    discount = min(balance, original_price)
    new_balance = balance - discount
    
    # Update user's tirelire balance
    update_data = {
        "tirelire_balance": new_balance,
        "pending_tirelire_discount": None,
        "pending_tirelire_package": None
    }
    
    # If it's a free purchase (discount covers full price)
    if discount >= original_price:
        if package_type == 'premium':
            update_data.update({
                "subscription_status": "premium",
                "premium_source": "tirelire_free",
                "subscription_start_date": datetime.now(timezone.utc).isoformat()
            })
        else:
            update_data.update({
                "postpartum_purchased": True,
                "postpartum_source": "tirelire_free",
                "postpartum_purchase_date": datetime.now(timezone.utc).isoformat()
            })
    
    await db.users.update_one({"id": current_user.id}, {"$set": update_data})
    
    # Log transaction
    await db.tirelire_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "type": "purchase_discount",
        "amount": -discount,
        "description": f"Réduction appliquée sur {package_type}",
        "package_type": package_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "discount_applied": discount,
        "new_balance": new_balance,
        "was_free": discount >= original_price
    }


# ==================== GODMOTHER GIFTING ====================

@router.post("/tirelire/send-gift")
async def send_gift(
    recipient_email: str,
    gift_type: str,  # 'premium' or 'postpartum'
    current_user: User = Depends(get_current_user)
):
    """Send a gift from godmother's gift balance"""
    from routes.push_notifications import send_push_notification
    
    if gift_type not in ['premium', 'postpartum']:
        raise HTTPException(status_code=400, detail="Type de cadeau invalide")
    
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    # Check if user has active subscription (required to gift)
    if not (user_doc.get("subscription_status") == "premium" or user_doc.get("postpartum_purchased")):
        raise HTTPException(status_code=403, detail="Vous devez avoir un abonnement actif pour offrir des cadeaux")
    
    gift_balance = user_doc.get("tirelire_gift_balance", 0.0)
    gift_cost = PREMIUM_PRICE if gift_type == 'premium' else POSTPARTUM_PRICE
    
    if gift_balance < gift_cost:
        raise HTTPException(
            status_code=400, 
            detail=f"Solde cadeau insuffisant ({gift_balance}€ disponible, {gift_cost}€ requis)"
        )
    
    # Find recipient
    recipient = await db.users.find_one({"email": recipient_email}, {"_id": 0})
    if not recipient:
        raise HTTPException(status_code=404, detail="Destinataire non trouvé")
    
    if recipient.get("id") == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous offrir un cadeau")
    
    # Check if recipient already has this subscription
    if gift_type == 'premium' and recipient.get("subscription_status") == "premium":
        raise HTTPException(status_code=400, detail="Cette personne est déjà Premium")
    if gift_type == 'postpartum' and recipient.get("postpartum_purchased"):
        raise HTTPException(status_code=400, detail="Cette personne a déjà le Post-partum")
    
    # Deduct from sender's gift balance
    new_gift_balance = gift_balance - gift_cost
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"tirelire_gift_balance": new_gift_balance}}
    )
    
    # Apply gift to recipient
    recipient_update = {}
    if gift_type == 'premium':
        recipient_update = {
            "subscription_status": "premium",
            "premium_source": f"gift_from_{current_user.id}",
            "subscription_start_date": datetime.now(timezone.utc).isoformat(),
            "gifted_by": current_user.email
        }
    else:
        recipient_update = {
            "postpartum_purchased": True,
            "postpartum_source": f"gift_from_{current_user.id}",
            "postpartum_purchase_date": datetime.now(timezone.utc).isoformat(),
            "gifted_by": current_user.email
        }
    
    await db.users.update_one({"id": recipient.get("id")}, {"$set": recipient_update})
    
    # Log transactions
    await db.tirelire_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "type": "gift_sent",
        "amount": -gift_cost,
        "description": f"Cadeau {gift_type} envoyé à {recipient_email}",
        "recipient_email": recipient_email,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    await db.tirelire_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": recipient.get("id"),
        "type": "gift_received",
        "amount": gift_cost,
        "description": f"Cadeau {gift_type} reçu de {current_user.email}",
        "sender_email": current_user.email,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Notify recipient
    try:
        gift_name = "Premium" if gift_type == 'premium' else "Post-partum"
        await send_push_notification(
            user_email=recipient_email,
            title="🎁 Cadeau reçu !",
            body=f"{current_user.name or current_user.email} vous offre l'accès {gift_name} !",
            url="/profile"
        )
    except Exception as e:
        logger.error(f"Error notifying gift recipient: {e}")
    
    return {
        "success": True,
        "gift_type": gift_type,
        "recipient": recipient_email,
        "new_gift_balance": new_gift_balance,
        "message": f"🎁 Cadeau {gift_type} envoyé à {recipient_email} !"
    }


# ==================== ADMIN: TIRELIRE STATS ====================

@router.get("/admin/tirelire/stats")
async def get_tirelire_stats(admin: User = Depends(get_current_user)):
    """Get tirelire statistics for admin"""
    
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Total tirelire balance across all users
    pipeline = [
        {"$group": {
            "_id": None,
            "total_balance": {"$sum": "$tirelire_balance"},
            "total_gift_balance": {"$sum": "$tirelire_gift_balance"},
            "users_with_balance": {"$sum": {"$cond": [{"$gt": ["$tirelire_balance", 0]}, 1, 0]}}
        }}
    ]
    
    result = await db.users.aggregate(pipeline).to_list(1)
    stats = result[0] if result else {"total_balance": 0, "total_gift_balance": 0, "users_with_balance": 0}
    
    # Recent transactions
    recent_transactions = await db.tirelire_transactions.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    return {
        "total_balance": round(stats.get("total_balance", 0), 2),
        "total_gift_balance": round(stats.get("total_gift_balance", 0), 2),
        "users_with_balance": stats.get("users_with_balance", 0),
        "recent_transactions": recent_transactions
    }
