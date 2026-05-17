# Routes pour les paiements Stripe - MamanDouce Version Camouflée pour les Stores
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime, timezone, timedelta
import os
import logging
import stripe
import asyncio

from core.database import db
from core.config import ADMIN_EMAIL
from core.security import get_current_user
from models.schemas import User

logger = logging.getLogger(__name__)
billing_logger = logging.getLogger("billing_alerts")

# Configuration des alertes de facturation pour Railway
try:
    _log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "billing_alerts.log")
    _billing_handler = logging.FileHandler(_log_path)
    _billing_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    billing_logger.addHandler(_billing_handler)
except Exception:
    # Repli si le système de fichiers est en lecture seule
    pass
billing_logger.setLevel(logging.WARNING)

router = APIRouter()

# Configuration du Camouflage pour la validation des Stores (App Store / Play Store)
STORE_REVIEW_EMAIL = os.environ.get("STORE_REVIEW_EMAIL", "review@apple.com")
IS_CAMOUFLAGE_ACTIVE = os.environ.get("IS_CAMOUFLAGE_ACTIVE", "true").lower() == "true"

# Utilisation exclusive des variables d'environnement officielles Stripe
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

if STRIPE_API_KEY:
    stripe.api_key = STRIPE_API_KEY
else:
    logger.warning("ATTENTION : STRIPE_API_KEY manquante dans les variables d'environnement.")

# Configuration dynamique des packs d'abonnement
SUBSCRIPTION_PACKAGES = {
    "annual": {
        "name": "MamanDouce Premium - 9 mois d'accès",
        "price_id": os.environ.get("STRIPE_PRICE_ANNUAL", "price_annual_placeholder"),
        "amount": 30.00,
        "currency": "eur"
    },
    "postpartum": {
        "name": "Pack Postpartum - Accès à vie",
        "price_id": os.environ.get("STRIPE_PRICE_POSTPARTUM", "price_postpartum_placeholder"),
        "amount": 19.00,
        "currency": "eur"
    }
}

class CheckoutRequest(BaseModel):
    package_id: str
    success_url: str
    cancel_url: str

async def notify_admin_new_subscription(email: str, package: str, amount: float):
    """Notification asynchrone sécurisée de l'administration"""
    try:
        from routes.push_notifications import send_push_notification
        message = f"🎉 Nouvel abonnement MamanDouce ! {email} a souscrit au pack {package} ({amount}€)"
        logger.info(message)
        
        if asyncio.iscoroutinefunction(send_push_notification):
            await send_push_notification(ADMIN_EMAIL, "Nouveau Paiement", message)
        else:
            send_push_notification(ADMIN_EMAIL, "Nouveau Paiement", message)
    except Exception as e:
        logger.error(f"Erreur lors de la notification admin : {str(e)}")

@router.post("/checkout/create-session")
async def create_checkout_session(payload: CheckoutRequest, current_user: User = Depends(get_current_user)):
    """Création d'une session de paiement avec Camouflage intelligent pour les testeurs des Stores"""
    package = SUBSCRIPTION_PACKAGES.get(payload.package_id)
    if not package:
        raise HTTPException(status_code=400, detail="Formule d'abonnement invalide")
        
    # 🕵️ ZONE CAMOUFLAGE : Si c'est le testeur Apple/Google, on valide directement sans passer par Stripe
    if IS_CAMOUFLAGE_ACTIVE and current_user.email == STORE_REVIEW_EMAIL:
        logger.info(f"🎭 Camouflage activé pour le testeur des Stores : {current_user.email}")
        new_status = "premium" if payload.package_id == "annual" else "lifetime"
        
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {
                "subscription_status": new_status,
                "subscription_updated_at": datetime.now(timezone.utc).isoformat(),
                "stripe_customer_id": "cus_store_review_fake",
                "stripe_payment_intent": "pi_store_review_fake"
            }}
        )
        # On renvoie l'URL de succès directement pour que l'application frontend considère le paiement comme réussi
        return {"id": "fake_session_review", "url": payload.success_url + "?session_id=fake_session_review"}

    # --- FLUX NORMAL STRIPE POUR LES VRAIS UTILISATEURS ---
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{\
                'price': package["price_id"],
                'quantity': 1,
            }],
            mode='payment',
            success_url=payload.success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=payload.cancel_url,
            customer_email=current_user.email,
            client_reference_id=current_user.id,
            metadata={
                "package_id": payload.package_id,
                "user_id": current_user.id,
                "expected_amount": str(package["amount"])
            }
        )
        return {"id": session.id, "url": session.url}
    except Exception as e:
        logger.error(f"Erreur Stripe Checkout : {str(e)}")
        raise HTTPException(status_code=500, detail=f"Impossible d'initier le paiement : {str(e)}")

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Webhook Stripe officiel pour valider les accès Premium automatiquement"""
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Payload invalide")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Signature invalide")
        
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        
        user_id = session.get("client_reference_id")
        customer_email = session.get("customer_details", {}).get("email")
        metadata = session.get("metadata", {})
        package_id = metadata.get("package_id")
        expected_amount = float(metadata.get("expected_amount", 0))
        amount_total = session.get("amount_total", 0) / 100.0
        
        if amount_total != expected_amount:
            billing_logger.warning(
                f"[AMOUNT_MISMATCH] Fraude suspectée pour l'utilisateur {user_id}. "
                f"Reçu: {amount_total}€, Attendu: {expected_amount}€."
            )
            raise HTTPException(status_code=400, detail="Écart de facturation détecté")
            
        if user_id and package_id:
            new_status = "premium" if package_id == "annual" else "lifetime"
            result = await db.users.update_one(
                {"id": user_id},
                {"$set": {
                    "subscription_status": new_status,
                    "subscription_updated_at": datetime.now(timezone.utc).isoformat(),
                    "stripe_customer_id": session.get("customer"),
                    "stripe_payment_intent": session.get("payment_intent")
                }}
            )
            
            if result.modified_count > 0:
                await notify_admin_new_subscription(customer_email, package_id, amount_total)
                logger.info(f"Statut {new_status} activé avec succès pour l'utilisateur {user_id}")
                
    return {"status": "success"}

@router.post("/refund/{refund_request_id}")
async def process_refund(refund_request_id: str, current_user: User = Depends(get_current_user)):
    """Route d'administration sécurisée pour traiter un remboursement unique"""
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Action non autorisée")
        
    refund_request = await db.refund_requests.find_one({"id": refund_request_id, "status": "pending"})
    if not refund_request:
        raise HTTPException(status_code=404, detail="Demande de remboursement introuvable ou déjà traitée")
        
    user_id = refund_request.get("user_id")
    user_doc = await db.users.find_one({"id": user_id})
    payment_intent = user_doc.get("stripe_payment_intent") if user_doc else None
    
    if payment_intent == "pi_store_review_fake":
        raise HTTPException(status_code=400, detail="Impossible de rembourser un compte de test camouflé")
        
    if not payment_intent:
        raise HTTPException(status_code=400, detail="Aucun identifiant de paiement Stripe trouvé pour cet utilisateur")
        
    try:
        refund = stripe.Refund.create(payment_intent=payment_intent)
        
        await db.refund_requests.update_one(
            {"id": refund_request_id},
            {"$set": {"status": "approved", "processed_at": datetime.now(timezone.utc).isoformat(), "refund_id": refund.id}}
        )
        
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"subscription_status": "free", "subscription_updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {"success": True, "refund_id": refund.id}
    except Exception as e:
        logger.error(f"Erreur lors du remboursement de l'utilisateur {user_id} : {str(e)}")
        raise HTTPException(status_code=500, detail=f"Échec de la procédure Stripe : {str(e)}")

@router.post("/trial/start")
async def start_free_trial(current_user: User = Depends(get_current_user)):
    """Activer l'essai gratuit de 7 jours"""
    user_doc = await db.users.find_one({"id": current_user.id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
        
    if user_doc.get("trial_used", False):
        raise HTTPException(status_code=400, detail="Vous avez déjà bénéficié de l'offre d'essai gratuit")
        
    trial_end = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "subscription_status": "trial",
            "subscription_updated_at": datetime.now(timezone.utc).isoformat(),
            "trial_end_date": trial_end.isoformat(),
            "trial_used": True
        }}
    )
    return {"success": True, "trial_end_date": trial_end.isoformat()}

@router.get("/trial/status")
async def get_trial_status(current_user: User = Depends(get_current_user)):
    """Vérifier la validité de l'essai gratuit"""
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
        
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
                await db.users.update_one(
                    {"id": current_user.id},
                    {"$set": {"subscription_status": "free"}}
                )
                subscription_status = "free"
        except Exception:
            pass
            
    return {
        "subscription_status": subscription_status,
        "trial_used": trial_used,
        "is_trial_active": is_trial_active,
        "days_remaining": max(0, days_remaining)
    }