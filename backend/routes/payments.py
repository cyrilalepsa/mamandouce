# Routes pour les paiements Stripe
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Optional
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
billing_logger = logging.getLogger("billing_alerts")

# Setup billing alerts file handler - relative path for Railway compatibility
try:
    _log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "billing_alerts.log")
    _billing_handler = logging.FileHandler(_log_path)
    _billing_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    billing_logger.addHandler(_billing_handler)
except Exception:
    # Fallback: log to stderr if file creation fails (e.g. read-only filesystem)
    pass
billing_logger.setLevel(logging.WARNING)

router = APIRouter()

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
stripe.api_key = STRIPE_API_KEY
# Route through Emergent proxy if using test key
if "sk_test_emergent" in STRIPE_API_KEY:
    stripe.api_base = "https://integrations.emergentagent.com/stripe"

SUBSCRIPTION_PACKAGES = {
    "annual": {
        "name": "MamanDouce Premium - 9 mois d'accès",
        "price_id": "annual",
        "amount": 30.00,
        "currency": "eur"
    },
    "postpartum": {
        "name": "MamanDouce Suivi Post-partum - 6 mois",
        "price_id": "postpartum",
        "amount": 10.00,
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


async def _record_billing_alert(alert_type: str, details: dict):
    """Record a billing alert in DB and log file"""
    alert_doc = {
        "type": alert_type,
        "details": details,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "resolved": False
    }
    await db.billing_alerts.insert_one(alert_doc)
    billing_logger.warning(f"BILLING ALERT [{alert_type}]: {details}")


class SecureCheckoutRequest(BaseModel):
    price_id: Optional[str] = None
    package_id: Optional[str] = None  # Legacy compat
    origin_url: str
    promo_code: Optional[str] = None


@router.post("/checkout/session")
async def create_checkout_session(checkout_req: SecureCheckoutRequest, request: Request):
    """Créer une session de paiement Stripe — prix serveur + codes promo Stripe activés"""
    pkg_key = checkout_req.price_id or checkout_req.package_id
    if not pkg_key or pkg_key not in SUBSCRIPTION_PACKAGES:
        raise HTTPException(status_code=400, detail="Package invalide")
    
    package = SUBSCRIPTION_PACKAGES[pkg_key]
    server_amount = package["amount"]
    amount_cents = int(server_amount * 100)
    
    success_url = f"{checkout_req.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/subscription/cancel"
    
    metadata = {
        "package_id": pkg_key,
        "package_name": package["name"],
        "server_expected_amount": str(server_amount),
    }
    
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": package["currency"],
                    "product_data": {"name": package["name"]},
                    "unit_amount": amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata,
            allow_promotion_codes=True,
        )
        return {"url": session.url, "session_id": session.id}
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
    """Gérer les webhooks Stripe - avec vérification de montant (Garagiste)"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    logger.info(f"Webhook received with signature: {signature[:30] if signature else 'None'}...")
    
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
        import json
        try:
            event = json.loads(body)
            logger.warning("Webhook received without signature verification (no secret configured)")
        except Exception:
            pass
    
    if event:
        event_type = event.get('type', '')
        
        if event_type == 'checkout.session.completed':
            session = event['data']['object']
            customer_email = session.get('customer_email') or session.get('customer_details', {}).get('email')
            payment_intent_id = session.get('payment_intent')
            metadata = session.get('metadata', {})
            package_id = metadata.get('package_id', 'unknown')
            
            amount_total = session.get('amount_total', 0) / 100  # cents → euros
            
            # === LE GARAGISTE: Vérification du montant ===
            server_expected = metadata.get('server_expected_amount')
            if server_expected:
                expected_amount = float(server_expected)
                # Check if Stripe applied a promotion code (discount)
                total_details = session.get('total_details', {})
                stripe_discount = (total_details.get('amount_discount', 0) or 0) / 100
                
                if stripe_discount > 0:
                    # Promo code used on Stripe — verify discounted amount is correct
                    expected_after_discount = expected_amount - stripe_discount
                    if amount_total > expected_amount + 0.01:
                        # Paid MORE than full price — suspicious
                        alert_details = {
                            "customer_email": customer_email or "unknown",
                            "package_id": package_id,
                            "expected_amount": expected_amount,
                            "received_amount": amount_total,
                            "stripe_discount": stripe_discount,
                            "difference": round(amount_total - expected_amount, 2),
                            "payment_intent": payment_intent_id,
                            "session_id": session.get('id', 'unknown')
                        }
                        await _record_billing_alert("AMOUNT_OVER_EXPECTED", alert_details)
                        logger.error(f"BILLING ALERT: Overpayment! Expected max {expected_amount}€, got {amount_total}€")
                    else:
                        logger.info(f"Amount OK with Stripe promo: {amount_total}€ (base {expected_amount}€, discount -{stripe_discount}€)")
                else:
                    # No discount — amount must match exactly
                    if abs(amount_total - expected_amount) > 0.01:
                        alert_details = {
                            "customer_email": customer_email or "unknown",
                            "package_id": package_id,
                            "expected_amount": expected_amount,
                            "received_amount": amount_total,
                            "difference": round(amount_total - expected_amount, 2),
                            "payment_intent": payment_intent_id,
                            "session_id": session.get('id', 'unknown')
                        }
                        await _record_billing_alert("AMOUNT_MISMATCH", alert_details)
                        logger.error(f"BILLING ALERT: Amount mismatch! Expected {expected_amount}€, got {amount_total}€ for {customer_email}")
                    else:
                        logger.info(f"Amount verified OK: {amount_total}€ matches expected {expected_amount}€")
            
            logger.info(f"Checkout completed for {customer_email}, package: {package_id}")
            
            if customer_email:
                update_data = {
                    "stripe_payment_intent_id": payment_intent_id,
                    "last_payment_date": datetime.now(timezone.utc).isoformat()
                }
                
                if package_id == 'postpartum' or amount_total == 10:
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
                    await notify_admin_new_subscription(customer_email, package_id, amount_total)
                else:
                    logger.warning(f"No user found with email {customer_email}")
        
        elif event_type == 'charge.refunded':
            charge = event['data']['object']
            payment_intent_id = charge.get('payment_intent')
            logger.info(f"Refund processed for payment_intent: {payment_intent_id}")
    
    return {"status": "success", "received": True}


# ==================== BILLING ALERTS (Le Garagiste) ====================

@router.get("/billing-alerts")
async def get_billing_alerts(current_user: User = Depends(get_current_user)):
    """Get billing alerts for admin dashboard"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    alerts = await db.billing_alerts.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    unresolved_count = await db.billing_alerts.count_documents({"resolved": False})
    
    return {
        "alerts": alerts,
        "unresolved_count": unresolved_count,
        "has_critical": unresolved_count > 0
    }


@router.post("/billing-alerts/{alert_index}/resolve")
async def resolve_billing_alert(alert_index: int, current_user: User = Depends(get_current_user)):
    """Mark a billing alert as resolved"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    alerts = await db.billing_alerts.find(
        {"resolved": False}
    ).sort("created_at", -1).to_list(100)
    
    if alert_index < 0 or alert_index >= len(alerts):
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    
    await db.billing_alerts.update_one(
        {"_id": alerts[alert_index]["_id"]},
        {"$set": {"resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Alerte résolue"}

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


# ==================== ESSAI GRATUIT ====================

@router.post("/trial/start")
async def start_free_trial(current_user: User = Depends(get_current_user)):
    """Démarrer l'essai gratuit de 7 jours"""
    from datetime import timedelta
    
    # Vérifier si l'utilisateur a déjà utilisé son essai gratuit
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    if user_doc.get("trial_used"):
        raise HTTPException(
            status_code=400, 
            detail="Vous avez déjà utilisé votre essai gratuit"
        )
    
    if user_doc.get("subscription_status") == "premium":
        raise HTTPException(
            status_code=400, 
            detail="Vous êtes déjà abonnée Premium"
        )
    
    # Activer l'essai gratuit pour 7 jours
    trial_end = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "subscription_status": "trial",
            "trial_start_date": datetime.now(timezone.utc).isoformat(),
            "trial_end_date": trial_end.isoformat(),
            "trial_used": True
        }}
    )
    
    logger.info(f"Free trial started for {current_user.email}")
    
    return {
        "success": True,
        "message": "Votre essai gratuit de 7 jours a commencé !",
        "trial_end_date": trial_end.isoformat()
    }

@router.get("/trial/status")
async def get_trial_status(current_user: User = Depends(get_current_user)):
    """Vérifier le statut de l'essai gratuit"""
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    trial_used = user_doc.get("trial_used", False)
    trial_end_date = user_doc.get("trial_end_date")
    subscription_status = user_doc.get("subscription_status", "free")
    
    is_trial_active = False
    days_remaining = 0
    
    if subscription_status == "trial" and trial_end_date:
        try:
            end_date = datetime.fromisoformat(trial_end_date.replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            if now < end_date:
                is_trial_active = True
                days_remaining = (end_date - now).days
            else:
                # Essai expiré - rétrograder en version gratuite
                await db.users.update_one(
                    {"id": current_user.id},
                    {"$set": {"subscription_status": "free"}}
                )
        except Exception as e:
            logger.error(f"Error parsing trial end date: {e}")
    
    return {
        "trial_used": trial_used,
        "is_trial_active": is_trial_active,
        "days_remaining": days_remaining,
        "trial_end_date": trial_end_date
    }

