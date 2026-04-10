"""
Baby Names routes for MamanDouce
Handles: Gold godmother moderation
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
router = APIRouter(tags=["babynames"])


# ==================== GOLD GODMOTHER MODERATION ====================

@router.get("/babynames/moderation/pending")
async def get_pending_contributions_for_gold(current_user: User = Depends(get_current_user)):
    """Get pending contributions for Gold godmother moderation"""
    
    # Check if user has gold status
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    if not user_doc.get("gold_status"):
        raise HTTPException(status_code=403, detail="Accès réservé aux Marraines Or")
    
    # Get pending contributions (limit for gold moderators)
    contributions = await db.contributions.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    return {
        "contributions": contributions,
        "count": len(contributions),
        "moderator_level": "gold"
    }


@router.post("/babynames/moderation/{contribution_id}/vote")
async def vote_on_contribution(
    contribution_id: str,
    approve: bool,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Gold godmother votes on a contribution"""
    from routes.push_notifications import send_push_notification
    
    # Check gold status
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    if not user_doc.get("gold_status"):
        raise HTTPException(status_code=403, detail="Accès réservé aux Marraines Or")
    
    # Get contribution
    contribution = await db.contributions.find_one({"id": contribution_id}, {"_id": 0})
    if not contribution:
        raise HTTPException(status_code=404, detail="Contribution non trouvée")
    
    if contribution.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Contribution déjà traitée")
    
    # Record the vote
    await db.moderation_votes.insert_one({
        "id": str(uuid.uuid4()),
        "contribution_id": contribution_id,
        "moderator_id": current_user.id,
        "moderator_email": current_user.email,
        "vote": "approve" if approve else "reject",
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Count votes
    approve_count = await db.moderation_votes.count_documents({
        "contribution_id": contribution_id,
        "vote": "approve"
    })
    reject_count = await db.moderation_votes.count_documents({
        "contribution_id": contribution_id,
        "vote": "reject"
    })
    
    # If 3 approvals or 2 rejections, finalize
    final_status = None
    if approve_count >= 3:
        final_status = "approved"
    elif reject_count >= 2:
        final_status = "rejected"
    
    if final_status:
        await db.contributions.update_one(
            {"id": contribution_id},
            {"$set": {
                "status": final_status,
                "reviewed_by": "gold_moderation",
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "approve_votes": approve_count,
                "reject_votes": reject_count
            }}
        )
        
        # Update contributor's stats if approved
        if final_status == "approved":
            await db.users.update_one(
                {"id": contribution.get("user_id")},
                {"$inc": {"contributions_validated": 1}}
            )
        
        # Notify contributor
        try:
            await send_push_notification(
                user_email=contribution.get("user_email"),
                title="✅ Contribution modérée" if final_status == "approved" else "Contribution non retenue",
                body="Ta contribution a été validée par la communauté !" if final_status == "approved" else "Ta contribution n'a pas été retenue par la communauté.",
                url="/trophies"
            )
        except Exception:
            pass
    
    return {
        "success": True,
        "your_vote": "approve" if approve else "reject",
        "current_approves": approve_count,
        "current_rejects": reject_count,
        "finalized": final_status is not None,
        "final_status": final_status
    }


@router.get("/babynames/moderation/my-votes")
async def get_my_moderation_votes(current_user: User = Depends(get_current_user)):
    """Get gold godmother's moderation history"""
    
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    if not user_doc.get("gold_status"):
        raise HTTPException(status_code=403, detail="Accès réservé aux Marraines Or")
    
    votes = await db.moderation_votes.find(
        {"moderator_id": current_user.id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    
    stats = {
        "total_votes": len(votes),
        "approvals": len([v for v in votes if v.get("vote") == "approve"]),
        "rejections": len([v for v in votes if v.get("vote") == "reject"])
    }
    
    return {"votes": votes, "stats": stats}


# Routes de modération Gold uniquement - TTS et Comparateur supprimés
