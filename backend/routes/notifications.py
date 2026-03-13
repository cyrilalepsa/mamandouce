"""
Push Notifications Routes for MamanDouce
Handles Web Push subscription and notification sending
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import os
import json

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

# VAPID configuration
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "").replace("\\n", "\n")
VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_CLAIMS_EMAIL = os.environ.get("VAPID_CLAIMS_EMAIL", "cyrilalepsa@gmail.com")

# Try to import pywebpush
try:
    from pywebpush import webpush, WebPushException
    WEBPUSH_AVAILABLE = True
except ImportError:
    WEBPUSH_AVAILABLE = False
    print("Warning: pywebpush not installed, push notifications disabled")

class PushSubscription(BaseModel):
    endpoint: str
    keys: dict

class SubscriptionRequest(BaseModel):
    subscription: PushSubscription
    user_id: Optional[str] = None

@router.get("/vapid-public-key")
async def get_vapid_public_key():
    """Get the VAPID public key for client-side subscription"""
    if not VAPID_PUBLIC_KEY:
        raise HTTPException(status_code=500, detail="VAPID key not configured")
    return {"publicKey": VAPID_PUBLIC_KEY}

@router.post("/subscribe")
async def subscribe_to_push(request: SubscriptionRequest, db=None):
    """Subscribe a user to push notifications"""
    from core.database import db as database
    db = database
    
    subscription_data = {
        "endpoint": request.subscription.endpoint,
        "keys": request.subscription.keys,
        "user_id": request.user_id,
        "active": True
    }
    
    # Upsert subscription (update if exists, insert if new)
    await db.push_subscriptions.update_one(
        {"endpoint": request.subscription.endpoint},
        {"$set": subscription_data},
        upsert=True
    )
    
    return {"success": True, "message": "Abonné aux notifications"}

@router.post("/unsubscribe")
async def unsubscribe_from_push(request: SubscriptionRequest):
    """Unsubscribe from push notifications"""
    from core.database import db
    
    await db.push_subscriptions.delete_one(
        {"endpoint": request.subscription.endpoint}
    )
    
    return {"success": True, "message": "Désabonné des notifications"}

async def send_push_notification(user_email: str, title: str, body: str, url: str = "/profile"):
    """Send a push notification to a specific user"""
    if not WEBPUSH_AVAILABLE or not VAPID_PRIVATE_KEY:
        print("Push notifications not available")
        return False
    
    from core.database import db
    
    # Find user's subscription
    user = await db.users.find_one({"email": user_email}, {"_id": 0, "id": 1})
    if not user:
        return False
    
    subscriptions = await db.push_subscriptions.find(
        {"user_id": user.get("id"), "active": True}
    ).to_list(10)
    
    if not subscriptions:
        # Also try by endpoint stored with email
        subscriptions = await db.push_subscriptions.find(
            {"user_email": user_email, "active": True}
        ).to_list(10)
    
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
        except WebPushException as e:
            print(f"Push notification failed: {e}")
            # If subscription is invalid, mark as inactive
            if e.response and e.response.status_code in [404, 410]:
                await db.push_subscriptions.update_one(
                    {"endpoint": sub["endpoint"]},
                    {"$set": {"active": False}}
                )
        except Exception as e:
            print(f"Push error: {e}")
    
    return success_count > 0
