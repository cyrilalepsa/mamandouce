# Routes pour les paiements Stripe
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict
from datetime import datetime, timezone
import os
import logging
import stripe
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

from core.database import db
from core.config import ADMIN_EMAIL
from core.security import get_current_user
from models.schemas import User

logger = logging.getLogger(__name__)
router = APIRouter()

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
stripe.api_key = STRIPE_API_KEY

SUBSCRIPTION_PACKAGES = {
    "annual": {
        "name": "MamanDouce Premium - 9 mois d'accès",
        "amount": 27.00,
        "currency": "eur"
    },
    "postpartum": {
        "name": "MamanDouce Suivi Post-partum - 6 mois",
        "amount": 8.00,
        "currency": "eur"
    }
}

async def notify_admin_new_subscription(user_email: str, package_name: str, amount: float):
    """Send push notification to admin for new subscription"""
    from routes.push_notifications import send_push_notification
    try:
        await send_push_notification(
            user_email=ADMIN_EMAIL,
            title="Nouvel abonnement Premium !",
            body=f"{user_email} vient de s'abonner ({amount}€)",
            url="/admin"
        )
    except Exception as e:
        logger.error(f"Error notifying admin: {e}")

class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str

@router.post("/checkout/session")
async def create_checkout_session(checkout_req: CheckoutRequest, request: Request):
    """Créer une session de paiement Stripe"""
    if checkout_req.package_id not in SUBSCRIPTION_PACKAGES:
        raise HTTPException(status_code=400, detail="Package invalide")
    
    package = SUBSCRIPTION_PACKAGES[checkout_req.package_id]
    
    success_url = f"{checkout_req.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/subscription/cancel"
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/payments/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    metadata = {
        "package_id": checkout_req.package_id,
        "package_name": package["name"]
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=package["amount"],
        currency=package["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    try:
        session = await stripe_checkout.create_checkout_session(checkout_request)
        return {"url": session.url, "session_id": session.session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    """Vérifier le statut d'une session"""
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    try:
        status = await stripe_checkout.get_checkout_status(session_id)
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Gérer les webhooks Stripe"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    logger.info(f"Webhook received with signature: {signature[:30] if signature else 'None'}...")
    
    # Vérifier la signature du webhook si le secret est configuré
    event = None
    if STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(
                body, signature, STRIPE_WEBHOOK_SECRET
            )
            logger.info(f"Webhook signature verified. Event type: {event['type']}")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature")
        except Exception as e:
            logger.error(f"Webhook error: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    else:
        # Fallback sans vérification (développement)
        import json
        try:
            event = json.loads(body)
            logger.warning("Webhook received without signature verification (no secret configured)")
        except Exception:
            pass
    
    # Traiter les événements Stripe
    if event:
        event_type = event.get('type', '')
        
        # Paiement réussi
        if event_type == 'checkout.session.completed':
            session = event['data']['object']
            customer_email = session.get('customer_email') or session.get('customer_details', {}).get('email')
            payment_intent_id = session.get('payment_intent')
            metadata = session.get('metadata', {})
            package_id = metadata.get('package_id', 'unknown')
            
            logger.info(f"Checkout completed for {customer_email}, package: {package_id}")
            
            if customer_email:
                # Déterminer le type d'abonnement basé sur le metadata ou le montant
                amount_total = session.get('amount_total', 0) / 100  # Convertir centimes en euros
                
                update_data = {
                    "stripe_payment_intent_id": payment_intent_id,
                    "last_payment_date": datetime.now(timezone.utc).isoformat()
                }
                
                if package_id == 'postpartum' or amount_total == 8:
                    update_data["postpartum_purchased"] = True
                    update_data["postpartum_purchase_date"] = datetime.now(timezone.utc).isoformat()
                    update_data["postpartum_unlocked"] = True
                    logger.info(f"Activating postpartum access for {customer_email}")
                else:
                    update_data["subscription_status"] = "premium"
                    update_data["subscription_start_date"] = datetime.now(timezone.utc).isoformat()
                    logger.info(f"Activating premium subscription for {customer_email}")
                
                result = await db.users.update_one(
                    {"email": customer_email.lower()},
                    {"$set": update_data}
                )
                
                if result.modified_count > 0:
                    logger.info(f"User {customer_email} updated successfully")
                    # Notifier l'admin
                    await notify_admin_new_subscription(customer_email, package_id, amount_total)
                else:
                    logger.warning(f"No user found with email {customer_email}")
        
        # Remboursement effectué
        elif event_type == 'charge.refunded':
            charge = event['data']['object']
            payment_intent_id = charge.get('payment_intent')
            logger.info(f"Refund processed for payment_intent: {payment_intent_id}")
    
    return {"status": "success", "received": True}

# ==================== REFUND ENDPOINT ====================

@router.post("/refund/{user_id}")
async def process_refund(user_id: str, current_user: User = Depends(get_current_user)):
    """Effectuer un remboursement Stripe (admin uniquement)"""
    from routes.push_notifications import send_push_notification, send_admin_notification
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    # Récupérer la demande de remboursement
    refund_request = await db.refund_requests.find_one({"user_id": user_id, "status": "pending"})
    if not refund_request:
        raise HTTPException(status_code=404, detail="Demande de remboursement non trouvée")
    
    # Récupérer l'utilisateur et son payment_intent_id
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    payment_intent_id = user.get("stripe_payment_intent_id")
    if not payment_intent_id:
        raise HTTPException(
            status_code=400, 
            detail="Aucun paiement Stripe trouvé pour cet utilisateur. Remboursement manuel requis."
        )
    
    # Calculer le montant en centimes pour Stripe
    refund_amount_cents = int(refund_request["refund_amount"] * 100)
    
    try:
        # Effectuer le remboursement via Stripe
        refund = stripe.Refund.create(
            payment_intent=payment_intent_id,
            amount=refund_amount_cents,  # Remboursement partiel au prorata
            reason="requested_by_customer"
        )
        
        if refund.status == "succeeded":
            # Mettre à jour la demande de remboursement
            await db.refund_requests.update_one(
                {"user_id": user_id, "status": "pending"},
                {"$set": {
                    "status": "approved",
                    "stripe_refund_id": refund.id,
                    "processed_at": datetime.now(timezone.utc).isoformat(),
                    "processed_by": current_user.email
                }}
            )
            
            # Mettre à jour le statut de l'utilisateur
            await db.users.update_one(
                {"id": user_id},
                {"$set": {
                    "subscription_status": "refunded",
                    "refund_date": datetime.now(timezone.utc).isoformat(),
                    "refund_amount": refund_request["refund_amount"]
                }}
            )
            
            # Notifier l'utilisateur
            try:
                await send_push_notification(
                    user_email=user["email"],
                    title="Remboursement effectué",
                    body=f"Votre remboursement de {refund_request['refund_amount']}€ a été effectué sur votre carte.",
                    url="/settings"
                )
            except Exception:
                pass
            
            return {
                "success": True,
                "message": f"Remboursement de {refund_request['refund_amount']}€ effectué",
                "stripe_refund_id": refund.id
            }
        else:
            raise HTTPException(status_code=500, detail=f"Statut du remboursement: {refund.status}")
            
    except stripe.error.StripeError as e:
        logger.error(f"Stripe refund error: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur Stripe: {str(e)}")

