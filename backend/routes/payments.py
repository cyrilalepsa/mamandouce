# Routes pour les paiements Stripe
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict
from datetime import datetime, timezone
import os
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

router = APIRouter()

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")

SUBSCRIPTION_PACKAGES = {
    "annual": {
        "name": "MamanDouce Premium - 12 mois d'accès",
        "amount": 27.00,
        "currency": "eur"
    }
}

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
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        # Traiter l'événement (update DB, etc.)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
