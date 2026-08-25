"""
Referral (Parrainage) and Subscription routes for MamanDouce
Handles: Referral system, Postpartum offer, Subscription tiers
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
import secrets
import string

from core.database import db
from core.security import get_current_user
from models.schemas import User
from integrations.neriacorp.nucleus_client import maybe_mark_first_n2o_trigger
from routes.push_notifications import send_admin_notification, send_push_notification

router = APIRouter(tags=["referral"])

# ==================== HELPER FUNCTIONS ====================

def generate_referral_code(length=8):
    """Generate a unique referral code"""
    # Use uppercase letters and digits, avoid confusing characters (0, O, I, L)
    alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# ==================== SCHEMAS ====================

class ReferralInput(BaseModel):
    referral1_email: str
    referral1_name: str
    referral2_email: Optional[str] = None
    referral2_name: Optional[str] = None

class ReferralStatus(BaseModel):
    referrals: List[dict]
    completed_count: int
    postpartum_unlocked: bool

# ==================== REFERRAL ENDPOINTS ====================

@router.get("/referral/status")
async def get_referral_status(current_user: User = Depends(get_current_user)):
    """Get referral status for current user"""
    
    # Récupérer les parrainages de l'utilisateur
    referrals = await db.referrals.find(
        {"sponsor_id": current_user.id},
        {"_id": 0}
    ).to_list(10)
    
    # Compter les parrainages complétés (filleuls inscrits)
    completed_count = len([r for r in referrals if r.get("status") == "completed"])
    
    # Vérifier si l'utilisateur a débloqué le post-partum gratuit
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    postpartum_free = user_doc.get("postpartum_free_via_referral", False)
    postpartum_purchased = user_doc.get("postpartum_purchased", False)
    
    return {
        "referrals": referrals,
        "completed_count": completed_count,
        "postpartum_unlocked": postpartum_free or postpartum_purchased,
        "postpartum_free_via_referral": postpartum_free
    }


# ==================== UNIQUE REFERRAL CODE ENDPOINTS ====================

@router.get("/referral/code")
async def get_referral_code(current_user: User = Depends(get_current_user)):
    """Get or generate unique referral code for current user"""
    
    # Check if user already has a referral code
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0, "referral_code": 1, "name": 1})
    
    if user_doc and user_doc.get("referral_code"):
        referral_code = user_doc["referral_code"]
    else:
        # Generate a unique code
        while True:
            referral_code = generate_referral_code()
            # Check if code is unique
            existing = await db.users.find_one({"referral_code": referral_code})
            if not existing:
                break
        
        # Save the code
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"referral_code": referral_code}}
        )
    
    # Count successful referrals via this code
    referrals_count = await db.referrals.count_documents({
        "sponsor_id": current_user.id,
        "source": "referral_code",
        "status": "completed"
    })
    
    # Get wallet balance
    wallet = await db.wallets.find_one({"user_id": current_user.id}, {"_id": 0, "balance": 1})
    balance = wallet.get("balance", 0) if wallet else 0
    
    return {
        "referral_code": referral_code,
        "referral_link": f"https://mamandouce.fr/invitation/{referral_code}",
        "sponsor_name": user_doc.get("name", "Une maman") if user_doc else "Une maman",
        "successful_referrals": referrals_count,
        "wallet_balance": balance
    }


@router.get("/referral/validate/{code}")
async def validate_referral_code(code: str):
    """Validate a referral code and get sponsor info (public endpoint for signup page)"""
    
    # Find user with this referral code
    sponsor = await db.users.find_one(
        {"referral_code": code.upper()},
        {"_id": 0, "id": 1, "name": 1, "email": 1}
    )
    
    if not sponsor:
        raise HTTPException(status_code=404, detail="Code de parrainage invalide")
    
    return {
        "valid": True,
        "sponsor_name": sponsor.get("name", "Une maman"),
        "sponsor_id": sponsor.get("id")
    }


@router.post("/referral/complete-via-code")
async def complete_referral_via_code(
    referral_code: str,
    new_user_email: str,
    new_user_name: str
):
    """
    Complete a referral when a new user signs up with a referral code.
    This is called during the signup process.
    """
    
    # Find the sponsor
    sponsor = await db.users.find_one(
        {"referral_code": referral_code.upper()},
        {"_id": 0, "id": 1, "email": 1, "name": 1}
    )
    
    if not sponsor:
        raise HTTPException(status_code=404, detail="Code de parrainage invalide")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Create the referral record
    referral_record = {
        "sponsor_id": sponsor["id"],
        "sponsor_email": sponsor.get("email"),
        "sponsor_name": sponsor.get("name"),
        "referral_email": new_user_email.lower(),
        "referral_name": new_user_name,
        "source": "referral_code",
        "referral_code": referral_code.upper(),
        "status": "completed",
        "created_at": now,
        "completed_at": now
    }
    
    # Check if this email is already referred
    existing = await db.referrals.find_one({
        "referral_email": new_user_email.lower(),
        "status": "completed"
    })
    
    if existing:
        return {"success": True, "message": "Parrainage déjà enregistré", "already_exists": True}
    
    await db.referrals.insert_one(referral_record)
    
    # Credit 3€ to sponsor's wallet
    wallet_result = await db.wallets.update_one(
        {"user_id": sponsor["id"]},
        {
            "$inc": {"balance": 3.0, "total_earned": 3.0, "referrals_count": 1},
            "$setOnInsert": {"user_id": sponsor["id"], "total_donated": 0}
        },
        upsert=True
    )
    
    # Create wallet transaction
    transaction = {
        "user_id": sponsor["id"],
        "type": "referral_bonus",
        "amount": 3.0,
        "description": f"Parrainage de {new_user_name}",
        "created_at": now
    }
    await db.wallet_transactions.insert_one(transaction)
    await maybe_mark_first_n2o_trigger(sponsor["id"], 3.0, "referral_bonus")
    updated_wallet = await db.wallets.find_one({"user_id": sponsor["id"]}, {"_id": 0, "balance": 1})
    new_balance = updated_wallet.get("balance", 0) if updated_wallet else 3.0
    
    # Notify sponsor about the referral
    try:
        await send_push_notification(
            user_email=sponsor["email"],
            title="🎉 Une nouvelle dans le cercle !",
            body=f"{new_user_name} a rejoint grâce à vous. +3€ dans votre cagnotte !",
            url="/referral"
        )
    except Exception as e:
        print(f"Error sending notification: {e}")
    
    # Check for wallet milestones and send special notifications
    milestones = [10, 20, 30]
    old_balance = new_balance - 3.0
    for milestone in milestones:
        if old_balance < milestone <= new_balance:
            try:
                if milestone == 30:
                    # Special notification for 30€ - can gift an invitation
                    await send_push_notification(
                        user_email=sponsor["email"],
                        title="🎁 30€ dans la cagnotte !",
                        body="Bravo ! Vous pouvez maintenant passer le relais à une amie !",
                        url="/referral"
                    )
                else:
                    await send_push_notification(
                        user_email=sponsor["email"],
                        title=f"💰 {milestone}€ dans votre cagnotte !",
                        body=f"Super ! Le cercle s'agrandit grâce à vous.",
                        url="/referral"
                    )
            except Exception as e:
                print(f"Error sending milestone notification: {e}")
    
    # Check if sponsor has 2+ completed referrals for free postpartum
    completed_count = await db.referrals.count_documents({
        "sponsor_id": sponsor["id"],
        "status": "completed"
    })
    
    if completed_count >= 2:
        # Check if this is the first time unlocking postpartum
        sponsor_doc = await db.users.find_one({"id": sponsor["id"]}, {"_id": 0, "postpartum_free_via_referral": 1})
        was_already_unlocked = sponsor_doc.get("postpartum_free_via_referral", False) if sponsor_doc else False
        
        await db.users.update_one(
            {"id": sponsor["id"]},
            {"$set": {"postpartum_free_via_referral": True}}
        )
        
        # Send special notification for postpartum unlock (only first time)
        if not was_already_unlocked:
            try:
                await send_push_notification(
                    user_email=sponsor["email"],
                    title="🌟 Post-partum offert !",
                    body="Le cercle vous remercie ! Grâce à vos 2 parrainages, le post-partum est maintenant GRATUIT.",
                    url="/postpartum"
                )
            except Exception as e:
                print(f"Error sending postpartum notification: {e}")
    
    return {
        "success": True,
        "message": "Parrainage complété",
        "sponsor_credited": True,
        "amount_credited": 3.0
    }


@router.post("/referral/submit")
async def submit_referrals(data: ReferralInput, current_user: User = Depends(get_current_user)):
    """Submit referral contacts"""
    
    now = datetime.now(timezone.utc).isoformat()
    referrals_to_create = []
    
    # Premier parrainage (obligatoire)
    if data.referral1_email and data.referral1_name:
        referrals_to_create.append({
            "sponsor_id": current_user.id,
            "sponsor_email": current_user.email,
            "sponsor_name": current_user.name,
            "referral_email": data.referral1_email.lower(),
            "referral_name": data.referral1_name,
            "status": "pending",
            "created_at": now
        })
    
    # Deuxième parrainage (optionnel)
    if data.referral2_email and data.referral2_name:
        referrals_to_create.append({
            "sponsor_id": current_user.id,
            "sponsor_email": current_user.email,
            "sponsor_name": current_user.name,
            "referral_email": data.referral2_email.lower(),
            "referral_name": data.referral2_name,
            "status": "pending",
            "created_at": now
        })
    
    if not referrals_to_create:
        raise HTTPException(status_code=400, detail="Au moins un parrainage requis")
    
    # Vérifier si les emails ne sont pas déjà parrainés par cet utilisateur
    for ref in referrals_to_create:
        existing = await db.referrals.find_one({
            "sponsor_id": current_user.id,
            "referral_email": ref["referral_email"]
        })
        if existing:
            raise HTTPException(
                status_code=400, 
                detail=f"Vous avez déjà parrainé {ref['referral_email']}"
            )
    
    # Insérer les parrainages
    if referrals_to_create:
        await db.referrals.insert_many(referrals_to_create)
    
    # Notifier l'admin
    try:
        await send_admin_notification(
            title="Nouveaux parrainages",
            body=f"{current_user.email} a soumis {len(referrals_to_create)} parrainage(s)",
            url="/admin",
            category="Parrainage"
        )
    except Exception as e:
        print(f"Erreur notification: {e}")
    
    return {
        "success": True,
        "message": f"{len(referrals_to_create)} parrainage(s) enregistré(s)",
        "referrals_count": len(referrals_to_create)
    }

@router.get("/referral/check-completion")
async def check_referral_completion(current_user: User = Depends(get_current_user)):
    """Check if referrals are completed and unlock postpartum if 2+ completed"""
    
    # Compter les parrainages complétés
    completed_referrals = await db.referrals.count_documents({
        "sponsor_id": current_user.id,
        "status": "completed"
    })
    
    if completed_referrals >= 2:
        # Débloquer le post-partum gratuit
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"postpartum_free_via_referral": True}}
        )
        
        # Notifier l'utilisateur
        try:
            await send_push_notification(
                user_email=current_user.email,
                title="Félicitations !",
                body="Vos 2 filleuls se sont inscrits. Le suivi post-partum est maintenant gratuit !",
                url="/settings"
            )
        except Exception:
            pass
        
        return {
            "completed": True,
            "postpartum_unlocked": True,
            "message": "Suivi post-partum débloqué gratuitement !"
        }
    
    return {
        "completed": False,
        "completed_count": completed_referrals,
        "remaining": 2 - completed_referrals
    }

# ==================== SUBSCRIPTION STATUS ENDPOINTS ====================

@router.get("/subscription/full-status")
async def get_full_subscription_status(current_user: User = Depends(get_current_user)):
    """Get complete subscription status including postpartum eligibility"""
    
    # Chercher par id d'abord, sinon par email
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    if not user_doc:
        user_doc = await db.users.find_one({"email": current_user.email}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    from core.privileges import is_superadmin_email
    
    subscription_status = user_doc.get("subscription_status", "free")
    subscription_start = user_doc.get("subscription_start_date")
    
    # Vérifier si l'essai est actif
    is_trial_active = False
    trial_days_remaining = 0
    if subscription_status == "trial":
        trial_end_date = user_doc.get("trial_end_date")
        if trial_end_date:
            try:
                end_date = datetime.fromisoformat(trial_end_date.replace('Z', '+00:00'))
                now = datetime.now(timezone.utc)
                if now < end_date:
                    is_trial_active = True
                    trial_days_remaining = (end_date - now).days + 1
                else:
                    # Essai expiré - rétrograder en version gratuite
                    await db.users.update_one(
                        {"id": current_user.id},
                        {"$set": {"subscription_status": "free"}}
                    )
                    subscription_status = "free"
            except Exception:
                pass
    
    # Premium si abonnement actif OU essai actif OU superadmin
    is_premium = subscription_status == "premium" or is_trial_active
    if is_superadmin_email(user_doc.get("email") or current_user.email):
        is_premium = True
        subscription_status = "premium"
    
    # Calculer si éligible au post-partum (6 mois d'abonnement)
    postpartum_eligible = False
    months_subscribed = 0
    
    if subscription_status == "premium" and subscription_start:
        try:
            start_date = datetime.fromisoformat(subscription_start.replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            diff = relativedelta(now, start_date)
            months_subscribed = diff.years * 12 + diff.months
            postpartum_eligible = months_subscribed >= 6
        except:
            pass
    
    # Vérifier si post-partum déjà acheté ou gratuit via parrainage
    postpartum_purchased = user_doc.get("postpartum_purchased", False)
    postpartum_free = user_doc.get("postpartum_free_via_referral", False)
    postpartum_unlocked = postpartum_purchased or postpartum_free
    if is_superadmin_email(user_doc.get("email") or current_user.email):
        postpartum_unlocked = True
        postpartum_eligible = True
        postpartum_purchased = True
    
    # Compter les parrainages complétés
    completed_referrals = await db.referrals.count_documents({
        "sponsor_id": current_user.id,
        "status": "completed"
    })
    
    # Compter les scans de cette semaine (pour utilisateurs gratuits)
    scans_this_week = 0
    if not is_premium:
        from datetime import timedelta
        week_start = datetime.now(timezone.utc) - timedelta(days=7)
        scans_this_week = await db.food_scans.count_documents({
            "user_id": current_user.id,
            "scanned_at": {"$gte": week_start.isoformat()}
        })
    
    return {
        "subscription_status": subscription_status,
        "is_premium": is_premium,
        "is_trial_active": is_trial_active,
        "trial_days_remaining": trial_days_remaining,
        "trial_used": user_doc.get("trial_used", False),
        "months_subscribed": months_subscribed,
        "postpartum_eligible": postpartum_eligible,
        "postpartum_unlocked": postpartum_unlocked,
        "postpartum_purchased": postpartum_purchased,
        "postpartum_free_via_referral": postpartum_free,
        "completed_referrals": completed_referrals,
        "referrals_needed_for_free": max(0, 2 - completed_referrals),
        "scans_this_week": scans_this_week,
        "scans_limit": 5 if not is_premium else -1  # -1 = illimité
    }

@router.post("/subscription/purchase-postpartum")
async def purchase_postpartum(current_user: User = Depends(get_current_user)):
    """Mark postpartum as purchased (called after successful Stripe payment)"""
    
    # Vérifier l'éligibilité (6 mois d'abonnement)
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    subscription_start = user_doc.get("subscription_start_date")
    
    if not subscription_start:
        raise HTTPException(status_code=400, detail="Abonnement premium requis")
    
    try:
        start_date = datetime.fromisoformat(subscription_start.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        diff = relativedelta(now, start_date)
        months_subscribed = diff.years * 12 + diff.months
        
        if months_subscribed < 6:
            raise HTTPException(
                status_code=400, 
                detail=f"6 mois d'abonnement requis. Actuellement: {months_subscribed} mois"
            )
    except HTTPException:
        raise
    except:
        raise HTTPException(status_code=400, detail="Erreur de calcul de l'éligibilité")
    
    # Activer le post-partum
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "postpartum_purchased": True,
            "postpartum_purchase_date": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Notifier l'admin
    try:
        await send_admin_notification(
            title="Achat Post-partum",
            body=f"{current_user.email} a acheté le suivi post-partum (8€)",
            url="/admin",
            category="Paiement"
        )
    except:
        pass
    
    return {"success": True, "message": "Suivi post-partum activé !"}

# ==================== ADMIN: COMPLETE REFERRAL ====================

@router.post("/admin/referral/complete/{referral_email}")
async def admin_complete_referral(referral_email: str, current_user: User = Depends(get_current_user)):
    """Mark a referral as completed when the referred user signs up (admin or system)"""
    
    # Cette fonction est appelée automatiquement lors de l'inscription
    # d'un utilisateur qui a été parrainé
    
    # Trouver tous les parrainages en attente pour cet email
    referrals = await db.referrals.find(
        {"referral_email": referral_email.lower(), "status": "pending"}
    ).to_list(100)
    
    for ref in referrals:
        # Marquer comme complété
        await db.referrals.update_one(
            {"_id": ref["_id"]},
            {"$set": {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Vérifier si le parrain a maintenant 2 parrainages complétés
        sponsor_id = ref["sponsor_id"]
        completed_count = await db.referrals.count_documents({
            "sponsor_id": sponsor_id,
            "status": "completed"
        })
        
        if completed_count >= 2:
            # Débloquer le post-partum gratuit pour le parrain
            await db.users.update_one(
                {"id": sponsor_id},
                {"$set": {"postpartum_free_via_referral": True}}
            )
            
            # Notifier le parrain
            sponsor = await db.users.find_one({"id": sponsor_id}, {"_id": 0, "email": 1})
            if sponsor:
                try:
                    await send_push_notification(
                        user_email=sponsor["email"],
                        title="Félicitations !",
                        body="Vos 2 filleuls se sont inscrits. Le suivi post-partum est offert !",
                        url="/postpartum"
                    )
                    
                    await send_admin_notification(
                        title="Post-partum offert",
                        body=f"{sponsor['email']} a obtenu le post-partum gratuit (2 parrainages)",
                        url="/admin",
                        category="Parrainage"
                    )
                except:
                    pass
    
    return {"success": True, "referrals_completed": len(referrals)}
