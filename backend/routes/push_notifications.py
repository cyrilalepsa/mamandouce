"""
Push Notifications routes for MamanDouce
Handles: VAPID key, Subscribe/Unsubscribe, Sending notifications
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import json
import logging

from core.database import db
from core.config import VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CLAIMS_EMAIL
from core.security import get_current_user
from models.schemas import User, SubscribeRequest

logger = logging.getLogger(__name__)
router = APIRouter(tags=["notifications"])

# Check if webpush is available
try:
    from pywebpush import webpush, WebPushException
    WEBPUSH_AVAILABLE = True
except ImportError:
    WEBPUSH_AVAILABLE = False
    logger.warning("pywebpush not installed, push notifications disabled")

@router.get("/notifications/vapid-public-key")
async def get_vapid_public_key():
    """Get the VAPID public key for client-side subscription"""
    if not VAPID_PUBLIC_KEY:
        logger.warning("VAPID public key not configured — push disabled")
        return {"publicKey": "", "configured": False}
    return {"publicKey": VAPID_PUBLIC_KEY, "configured": True}

@router.post("/notifications/subscribe")
async def subscribe_to_push(request: SubscribeRequest, current_user: User = Depends(get_current_user)):
    """Subscribe a user to push notifications"""
    subscription_data = {
        "endpoint": request.subscription.endpoint,
        "keys": {
            "p256dh": request.subscription.keys.p256dh,
            "auth": request.subscription.keys.auth
        },
        "user_email": current_user.email,
        "user_id": current_user.id,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.push_subscriptions.update_one(
        {"endpoint": request.subscription.endpoint},
        {"$set": subscription_data},
        upsert=True
    )
    
    return {"success": True, "message": "Notifications activées"}

@router.post("/notifications/unsubscribe")
async def unsubscribe_from_push(request: SubscribeRequest, current_user: User = Depends(get_current_user)):
    """Unsubscribe from push notifications"""
    await db.push_subscriptions.delete_one(
        {"endpoint": request.subscription.endpoint}
    )
    
    return {"success": True, "message": "Notifications désactivées"}

async def send_push_notification(user_email: str, title: str, body: str, url: str = "/profile"):
    """Send a push notification to a specific user"""
    if not WEBPUSH_AVAILABLE or not VAPID_PRIVATE_KEY:
        logger.warning("Push notifications not available")
        return False
    
    subscriptions = await db.push_subscriptions.find(
        {"user_email": user_email, "active": True},
        {"_id": 0}
    ).to_list(10)
    
    if not subscriptions:
        return False
    
    success_count = 0
    for sub in subscriptions:
        try:
            subscription_info = {
                "endpoint": sub["endpoint"],
                "keys": sub["keys"]
            }
            
            data = json.dumps({
                "title": title,
                "body": body,
                "url": url
            })
            
            webpush(
                subscription_info=subscription_info,
                data=data,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{VAPID_CLAIMS_EMAIL}"}
            )
            success_count += 1
            logger.info(f"Push notification sent to {user_email}")
        except WebPushException as e:
            logger.error(f"Push notification failed: {e}")
            if e.response and e.response.status_code in [404, 410]:
                await db.push_subscriptions.update_one(
                    {"endpoint": sub["endpoint"]},
                    {"$set": {"active": False}}
                )
        except Exception as e:
            logger.error(f"Push error: {e}")
    
    return success_count > 0

async def send_admin_notification(title: str, body: str, url: str = "/admin", category: str = None):
    """Send a push notification to admin with optional category"""
    from core.config import ADMIN_EMAIL
    
    # Ajouter la catégorie au titre si fournie
    if category:
        title = f"[{category}] {title}"
    
    return await send_push_notification(
        user_email=ADMIN_EMAIL,
        title=title,
        body=body,
        url=url
    )
