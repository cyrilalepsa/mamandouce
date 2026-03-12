# Routes et logique pour les paiements Stripe
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime, timezone
import os
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# Récupérer la clé Stripe depuis l'environnement
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

# Définir les packages (montants fixes définis côté backend pour la sécurité)
SUBSCRIPTION_PACKAGES = {
    "annual": {
        "name": "MamanDouce Premium - Annuel",
        "amount": 15.00,  # 15€/an
        "currency": "eur",
        "interval": "year"
    }
}

router = APIRouter(prefix="/api/payments")

class CheckoutRequest(BaseModel):
    package_id: str  # "annual"
    origin_url: str  # Frontend origin pour construire success/cancel URLs

class PaymentTransaction(BaseModel):
    id: str
    user_id: str
    session_id: str
    package_id: str
    amount: float
    currency: str
    payment_status: str  # "pending", "paid", "expired", "cancelled"
    metadata: Dict
    created_at: datetime
    updated_at: datetime

@router.post("/checkout/session")
async def create_checkout_session(
    checkout_req: CheckoutRequest,
    request: Request,
    current_user = Depends(lambda: get_current_user_for_payment())
):
    """Créer une session de paiement Stripe"""
    
    # Valider le package
    if checkout_req.package_id not in SUBSCRIPTION_PACKAGES:
        raise HTTPException(status_code=400, detail="Package invalide")
    
    package = SUBSCRIPTION_PACKAGES[checkout_req.package_id]
    
    # Construire les URLs de retour dynamiquement
    success_url = f"{checkout_req.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/subscription/cancel"
    
    # Initialiser Stripe Checkout
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Créer la session de paiement
    metadata = {
        "user_id": current_user.id,
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
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Enregistrer la transaction en base de données (statut pending)
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_url = os.environ['MONGO_URL']
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ['DB_NAME']]
        
        transaction = {
            "user_id": current_user.id,
            "session_id": session.session_id,
            "package_id": checkout_req.package_id,
            "amount": package["amount"],
            "currency": package["currency"],
            "payment_status": "pending",
            "metadata": metadata,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "url": session.url,
            "session_id": session.session_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création session: {str(e)}")

@router.get("/checkout/status/{session_id}")
async def get_checkout_status(
    session_id: str,
    current_user = Depends(lambda: get_current_user_for_payment())
):
    """Vérifier le statut d'une session de paiement"""
    
    # Initialiser Stripe Checkout
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    try:
        # Récupérer le statut depuis Stripe
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Mettre à jour la transaction en base de données
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_url = os.environ['MONGO_URL']
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ['DB_NAME']]
        
        # Vérifier que la transaction n'a pas déjà été traitée (éviter les doublons)
        existing = await db.payment_transactions.find_one({
            "session_id": session_id,
            "payment_status": "paid"
        })
        
        if not existing and status.payment_status == "paid":
            # Mettre à jour la transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "payment_status": "paid",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Activer l'abonnement de l'utilisateur
            expiry_date = datetime.now(timezone.utc)
            # Ajouter 1 an
            expiry_date = expiry_date.replace(year=expiry_date.year + 1)
            
            await db.users.update_one(
                {"id": current_user.id},
                {
                    "$set": {
                        "subscription_status": "active",
                        "subscription_expiry": expiry_date.isoformat()
                    }
                }
            )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur vérification statut: {str(e)}")

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Gérer les webhooks Stripe"""
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Traiter l'événement
        if webhook_response.event_type == "checkout.session.completed":
            # Paiement réussi
            session_id = webhook_response.session_id
            user_id = webhook_response.metadata.get("user_id")
            
            if user_id:
                from motor.motor_asyncio import AsyncIOMotorClient
                mongo_url = os.environ['MONGO_URL']
                client = AsyncIOMotorClient(mongo_url)
                db = client[os.environ['DB_NAME']]
                
                # Mettre à jour la transaction
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "payment_status": "paid",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
                # Activer l'abonnement
                expiry_date = datetime.now(timezone.utc).replace(year=datetime.now(timezone.utc).year + 1)
                
                await db.users.update_one(
                    {"id": user_id},
                    {
                        "$set": {
                            "subscription_status": "active",
                            "subscription_expiry": expiry_date.isoformat()
                        }
                    }
                )
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def get_current_user_for_payment():
    """Helper pour obtenir l'utilisateur courant (à adapter selon votre auth)"""
    # Cette fonction doit être remplacée par votre véritable logique d'auth
    # Pour l'instant, on retourne un objet factice
    class User:
        id = "user_id"
    return User()
