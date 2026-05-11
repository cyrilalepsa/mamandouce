"""
Contributions routes for MamanDouce
Handles: User contributions (food scans, maternity bag items, recipes)
With admin validation system for badge progression
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import Optional
import logging
import uuid

from core.database import db
from core.security import get_current_user, get_admin_user
from models.schemas import User, ContributionSubmit

logger = logging.getLogger(__name__)
router = APIRouter(tags=["contributions"])

# ==================== BADGE THRESHOLDS ====================
BADGE_THRESHOLDS = {
    "bronze": {"contributions": 3, "referrals": 0},
    "silver": {"contributions": 2, "referrals": 1},  # 1 parrainage + 2 contributions
    "gold": {"contributions": 5, "referrals": 3}    # 3 parrainages + 5 contributions = Marraine Or
}

BADGE_NAMES = {
    "bronze": "Contributrice Bronze",
    "silver": "Contributrice Argent", 
    "gold": "Marraine Or"
}


# ==================== GAMIFICATION OPT-IN ====================

@router.post("/contributions/gamification-optin")
async def toggle_gamification_optin(
    current_user: User = Depends(get_current_user)
):
    """Toggle gamification opt-in (contribuer ou pas)"""
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "gamification_optin": 1})
    current_status = user.get("gamification_optin", False) if user else False
    new_status = not current_status
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"gamification_optin": new_status}}
    )
    
    return {
        "gamification_optin": new_status,
        "message": "Gamification activée ! Contribuez pour gagner des badges." if new_status else "Gamification désactivée."
    }

@router.get("/contributions/gamification-status")
async def get_gamification_status(
    current_user: User = Depends(get_current_user)
):
    """Get gamification opt-in status"""
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "gamification_optin": 1})
    return {"gamification_optin": user.get("gamification_optin", False) if user else False}


# ==================== USER CONTRIBUTION SUBMISSION ====================

@router.post("/contributions/submit")
async def submit_contribution(
    contribution: ContributionSubmit,
    current_user: User = Depends(get_current_user)
):
    """Submit a new contribution (food scan, maternity bag item, recipe)"""
    
    # Validate contribution type
    valid_types = ["food_scan", "maternity_bag", "recipe", "birth_list_item"]
    if contribution.contribution_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Type invalide. Types valides: {valid_types}")
    
    contribution_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "user_email": current_user.email,
        "contribution_type": contribution.contribution_type,
        "title": contribution.title,
        "description": contribution.description,
        "data": contribution.data,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.contributions.insert_one(contribution_doc)
    
    logger.info(f"New contribution submitted by {current_user.email}: {contribution.title}")
    
    return {
        "success": True,
        "message": "Contribution soumise avec succès ! Elle sera examinée par notre équipe.",
        "contribution_id": contribution_doc["id"]
    }


@router.get("/contributions/my")
async def get_my_contributions(current_user: User = Depends(get_current_user)):
    """Get all contributions submitted by the current user"""
    
    contributions = await db.contributions.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    stats = {
        "total": len(contributions),
        "pending": len([c for c in contributions if c.get("status") == "pending"]),
        "approved": len([c for c in contributions if c.get("status") == "approved"]),
        "rejected": len([c for c in contributions if c.get("status") == "rejected"])
    }
    
    return {"contributions": contributions, "stats": stats}


# ==================== BADGE PROGRESS ====================

@router.get("/contributions/badge-progress")
async def get_badge_progress(current_user: User = Depends(get_current_user)):
    """Get badge progression for current user"""
    
    # Get user's validated contributions count
    contributions_validated = await db.contributions.count_documents({
        "user_id": current_user.id,
        "status": "approved"
    })
    
    # Get referrals count
    referrals_completed = await db.referrals.count_documents({
        "referrer_id": current_user.id,
        "status": "completed"
    })
    
    # Get current badges
    user_badges = await db.user_badges.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(10)
    
    current_badges = [b.get("badge_type") for b in user_badges]
    
    # Calculate progress towards each badge
    progress = {
        "contributions_validated": contributions_validated,
        "referrals_completed": referrals_completed,
        "badges_earned": current_badges,
        "bronze": {
            "earned": "bronze" in current_badges,
            "progress_contributions": min(contributions_validated, 3),
            "required_contributions": 3,
            "progress_referrals": 0,
            "required_referrals": 0
        },
        "silver": {
            "earned": "silver" in current_badges,
            "progress_contributions": min(contributions_validated, 2),
            "required_contributions": 2,
            "progress_referrals": min(referrals_completed, 1),
            "required_referrals": 1
        },
        "gold": {
            "earned": "gold" in current_badges,
            "progress_contributions": min(contributions_validated, 5),
            "required_contributions": 5,
            "progress_referrals": min(referrals_completed, 3),
            "required_referrals": 3
        }
    }
    
    # Check for new unlocked badges (to trigger celebration)
    new_badge = None
    
    # Check Bronze: 3 contributions validées
    if contributions_validated >= 3 and "bronze" not in current_badges:
        new_badge = "bronze"
        await db.user_badges.insert_one({
            "user_id": current_user.id,
            "badge_type": "bronze",
            "unlocked_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Check Silver: 1 parrainage + 2 contributions
    if (referrals_completed >= 1 and contributions_validated >= 2 and 
        "silver" not in current_badges):
        new_badge = "silver"
        await db.user_badges.insert_one({
            "user_id": current_user.id,
            "badge_type": "silver",
            "unlocked_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Check Gold: 3 parrainages + 5 contributions (Marraine Or)
    if (referrals_completed >= 3 and contributions_validated >= 5 and 
        "gold" not in current_badges):
        new_badge = "gold"
        await db.user_badges.insert_one({
            "user_id": current_user.id,
            "badge_type": "gold",
            "unlocked_at": datetime.now(timezone.utc).isoformat()
        })
        # Update user's gold_status
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"gold_status": True}}
        )
    
    progress["new_badge_unlocked"] = new_badge
    progress["badge_names"] = BADGE_NAMES
    
    return progress


# ==================== CLASSEMENT COMMUNAUTAIRE ANONYME ====================

@router.get("/contributions/community-stats")
async def get_community_stats(current_user: User = Depends(get_current_user)):
    """Get anonymous community statistics for gamification leaderboard"""
    
    # Count total contributors
    total_contributors = await db.contributions.distinct("user_id", {"status": "approved"})
    
    # Count badges per level
    bronze_count = await db.user_badges.count_documents({"badge_type": "bronze"})
    silver_count = await db.user_badges.count_documents({"badge_type": "silver"})
    gold_count = await db.user_badges.count_documents({"badge_type": "gold"})
    
    # Total approved contributions
    total_contributions = await db.contributions.count_documents({"status": "approved"})
    
    # Total recipes shared
    total_recipes = await db.contributions.count_documents({
        "status": "approved", 
        "contribution_type": "recipe"
    })
    
    # Total referrals completed
    total_referrals = await db.referrals.count_documents({"status": "completed"})
    
    return {
        "total_contributors": len(total_contributors),
        "total_contributions": total_contributions,
        "total_recipes": total_recipes,
        "total_referrals": total_referrals,
        "badges": {
            "bronze": bronze_count,
            "silver": silver_count,
            "gold": gold_count
        },
        "badge_names": BADGE_NAMES
    }


# ==================== GIFT SYSTEM (PARRAINAGE) ====================

@router.get("/contributions/gift-eligibility")
async def check_gift_eligibility(current_user: User = Depends(get_current_user)):
    """Check if user is eligible to give gifts based on referrals"""
    
    # Count completed referrals
    referrals_completed = await db.referrals.count_documents({
        "referrer_id": current_user.id,
        "status": "completed"
    })
    
    # Check if user already claimed free post-partum
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    postpartum_free_claimed = user_doc.get("postpartum_free_via_referral", False)
    
    # 2 parrainages = Post-partum gratuit personnel
    can_claim_free_postpartum = referrals_completed >= 2 and not postpartum_free_claimed
    
    # After claiming free postpartum, can gift others
    # 3+ referrals = can gift post-partum
    # 5+ referrals = can gift premium
    gifts_available = []
    if referrals_completed >= 3 and postpartum_free_claimed:
        gifts_available.append({
            "type": "postpartum",
            "name": "Suivi Post-partum",
            "value": 10
        })
    if referrals_completed >= 5 and postpartum_free_claimed:
        gifts_available.append({
            "type": "premium",
            "name": "Abonnement Premium",
            "value": 30
        })
    
    return {
        "referrals_completed": referrals_completed,
        "can_claim_free_postpartum": can_claim_free_postpartum,
        "postpartum_claimed": postpartum_free_claimed,
        "gifts_available": gifts_available
    }


@router.post("/contributions/claim-free-postpartum")
async def claim_free_postpartum(current_user: User = Depends(get_current_user)):
    """Claim free post-partum after 2 referrals"""
    from routes.push_notifications import send_push_notification
    
    referrals_completed = await db.referrals.count_documents({
        "referrer_id": current_user.id,
        "status": "completed"
    })
    
    if referrals_completed < 2:
        raise HTTPException(
            status_code=400, 
            detail="Vous devez avoir au moins 2 parrainages réussis"
        )
    
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    if user_doc.get("postpartum_free_via_referral"):
        raise HTTPException(status_code=400, detail="Vous avez déjà réclamé votre post-partum gratuit")
    
    # Unlock free post-partum
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "postpartum_purchased": True,
            "postpartum_free_via_referral": True,
            "postpartum_unlocked": True,
            "postpartum_unlocked_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send notification
    try:
        await send_push_notification(
            user_email=current_user.email,
            title="🎁 Post-partum débloqué !",
            body="Grâce à vos 2 parrainages, le suivi post-partum est maintenant gratuit !",
            url="/postpartum"
        )
    except Exception:
        pass
    
    return {
        "success": True,
        "message": "Félicitations ! Votre suivi post-partum est maintenant gratuit !"
    }


# ==================== ADMIN: CONTRIBUTION VALIDATION ====================

@router.get("/admin/contributions/pending")
async def get_pending_contributions(admin: User = Depends(get_admin_user)):
    """Get all pending contributions for validation"""
    
    contributions = await db.contributions.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with user info
    for contrib in contributions:
        user = await db.users.find_one(
            {"id": contrib.get("user_id")}, 
            {"_id": 0, "name": 1, "email": 1}
        )
        if user:
            contrib["user_name"] = user.get("name")
    
    stats = {
        "pending": len(contributions),
        "total_today": await db.contributions.count_documents({
            "created_at": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()}
        })
    }
    
    return {"contributions": contributions, "stats": stats}


@router.post("/admin/contributions/{contribution_id}/validate")
async def validate_contribution(
    contribution_id: str,
    approved: bool,
    admin_notes: Optional[str] = None,
    admin: User = Depends(get_admin_user)
):
    """Approve or reject a contribution"""
    from routes.push_notifications import send_push_notification
    
    contribution = await db.contributions.find_one({"id": contribution_id}, {"_id": 0})
    if not contribution:
        raise HTTPException(status_code=404, detail="Contribution non trouvée")
    
    if contribution.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Cette contribution a déjà été traitée")
    
    new_status = "approved" if approved else "rejected"
    
    # Update contribution
    await db.contributions.update_one(
        {"id": contribution_id},
        {"$set": {
            "status": new_status,
            "reviewed_by": admin.email,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "admin_notes": admin_notes
        }}
    )
    
    user_id = contribution.get("user_id")
    user_email = contribution.get("user_email")
    
    # If approved, update user's contribution count and check for badges
    if approved:
        # Increment validated contributions
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {"contributions_validated": 1}}
        )
        
        # Get updated count
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        contributions_validated = user_doc.get("contributions_validated", 0)
        referrals_completed = user_doc.get("referrals_completed", 0)
        
        # Check for new badges
        new_badge = None
        
        # Bronze: 3 contributions
        if contributions_validated >= 3:
            existing = await db.user_badges.find_one({"user_id": user_id, "badge_type": "bronze"})
            if not existing:
                new_badge = "bronze"
                await db.user_badges.insert_one({
                    "user_id": user_id,
                    "badge_type": "bronze",
                    "unlocked_at": datetime.now(timezone.utc).isoformat()
                })
                await db.users.update_one({"id": user_id}, {"$set": {"badge_level": "bronze"}})
        
        # Silver: 2 contributions + 1 parrainage
        if contributions_validated >= 2 and referrals_completed >= 1:
            existing = await db.user_badges.find_one({"user_id": user_id, "badge_type": "silver"})
            if not existing:
                new_badge = "silver"
                await db.user_badges.insert_one({
                    "user_id": user_id,
                    "badge_type": "silver",
                    "unlocked_at": datetime.now(timezone.utc).isoformat()
                })
                await db.users.update_one({"id": user_id}, {"$set": {"badge_level": "silver"}})
        
        # Gold: 5 contributions + 3 parrainages (Marraine Or)
        if contributions_validated >= 5 and referrals_completed >= 3:
            existing = await db.user_badges.find_one({"user_id": user_id, "badge_type": "gold"})
            if not existing:
                new_badge = "gold"
                await db.user_badges.insert_one({
                    "user_id": user_id,
                    "badge_type": "gold",
                    "unlocked_at": datetime.now(timezone.utc).isoformat()
                })
                await db.users.update_one({"id": user_id}, {"$set": {
                    "badge_level": "gold",
                    "gold_status": True
                }})
        
        # Send notification to user
        try:
            if new_badge:
                badge_names = {"bronze": "Bronze", "silver": "Argent", "gold": "Or"}
                await send_push_notification(
                    user_email=user_email,
                    title=f"🏆 Badge {badge_names[new_badge]} débloqué !",
                    body="Félicitations ! Votre contribution a été validée et vous avez gagné un nouveau badge !",
                    url="/trophies"
                )
            else:
                await send_push_notification(
                    user_email=user_email,
                    title="✅ Contribution validée !",
                    body="Votre contribution a été approuvée. Merci de votre participation !",
                    url="/trophies"
                )
        except Exception:
            pass
    else:
        # Rejected - notify user
        try:
            await send_push_notification(
                user_email=user_email,
                title="Contribution non retenue",
                body=admin_notes or "Votre contribution n'a pas pu être validée. Vous pouvez en soumettre une nouvelle.",
                url="/trophies"
            )
        except Exception:
            pass
    
    return {
        "success": True,
        "status": new_status,
        "message": f"Contribution {'approuvée' if approved else 'refusée'}"
    }


@router.get("/admin/contributions/all")
async def get_all_contributions(
    status: Optional[str] = None,
    admin: User = Depends(get_admin_user)
):
    """Get all contributions with optional status filter"""
    
    query = {}
    if status:
        query["status"] = status
    
    contributions = await db.contributions.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    stats = {
        "total": len(contributions),
        "pending": await db.contributions.count_documents({"status": "pending"}),
        "approved": await db.contributions.count_documents({"status": "approved"}),
        "rejected": await db.contributions.count_documents({"status": "rejected"})
    }
    
    return {"contributions": contributions, "stats": stats}
