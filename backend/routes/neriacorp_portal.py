"""
Endpoints publics pour le portail NeriaCorp.
MamanDouce est exposée en zone B2C.
"""
import os
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core.config import (
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_FETUS_FOLDER,
    CLOUDINARY_TRANSFORMS,
    FRONTEND_URL,
    NERIACORP_PORTAL_URL,
    n2_ocr_base_url,
)
from core.database import db
from core.security import get_current_user
from integrations.neriacorp.catalog import get_portal_catalog_entry, get_portal_catalog_payload
from integrations.neriacorp.nucleus_client import (
    build_cross_app_entitlements,
    push_cross_app_entitlements,
    sync_b2c_profile,
)
from models.schemas import User

router = APIRouter(tags=["neriacorp-portal"])

PORTAL_APP_URL = os.environ.get("NERIACORP_PORTAL_APP_URL", "https://app.neriacorp.com").rstrip("/")


class PortalOnboardingAck(BaseModel):
    action: Literal["link", "skip"]
    gdpr_consent: bool = False


@router.get("/neriacorp/onboarding/status")
async def neriacorp_onboarding_status(current_user: User = Depends(get_current_user)):
    """Indique si la modale portail NeriaCorp doit s'afficher (parrainage ou premier N2O)."""
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0}) or {}
    wallet = await db.wallets.find_one({"user_id": current_user.id}, {"_id": 0, "balance": 1})
    balance = float(wallet.get("balance", 0) if wallet else 0)

    pending = user_doc.get("neriacorp_onboarding_pending")
    linked = bool(user_doc.get("neriacorp_portal_linked"))
    dismissed = bool(user_doc.get("neriacorp_onboarding_dismissed"))

    show_modal = bool(pending) and not linked and not dismissed
    entitlements = build_cross_app_entitlements(user_doc, balance)

    sso = await neriacorp_sso_status()
    return {
        "show_modal": show_modal,
        "trigger": pending,
        "portal_linked": linked,
        "portal_url": PORTAL_APP_URL,
        "portal_home": NERIACORP_PORTAL_URL,
        "wallet_balance": balance,
        "cross_app": entitlements,
        "sso": sso,
        "gdpr_notice": (
            "Votre compte NeriaCorp centralise vos applications B2C (MamanDouce, Héritia). "
            "Nous partageons uniquement email, nom et statut d'abonnement. "
            "Vous pouvez refuser ou supprimer votre compte depuis le portail."
        ),
    }


@router.post("/neriacorp/onboarding/ack")
async def neriacorp_onboarding_ack(
    body: PortalOnboardingAck,
    current_user: User = Depends(get_current_user),
):
    """Lie ou ignore l'adhésion portail NeriaCorp après la modale."""
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0}) or {}
    wallet = await db.wallets.find_one({"user_id": current_user.id}, {"_id": 0, "balance": 1})
    balance = float(wallet.get("balance", 0) if wallet else 0)

    update = {
        "neriacorp_onboarding_dismissed": True,
        "neriacorp_onboarding_pending": None,
        "neriacorp_gdpr_consent_at": None,
    }

    sync_result = None
    cross_app = None

    if body.action == "link":
        if not body.gdpr_consent:
            raise HTTPException(
                status_code=400,
                detail="Consentement RGPD requis pour lier le compte NeriaCorp",
            )
        from datetime import datetime, timezone

        update["neriacorp_portal_linked"] = True
        update["neriacorp_gdpr_consent_at"] = datetime.now(timezone.utc).isoformat()
        sync_result = await sync_b2c_profile(user_doc)
        cross_app = await push_cross_app_entitlements(user_doc, balance)

    await db.users.update_one({"id": current_user.id}, {"$set": update})

    return {
        "success": True,
        "action": body.action,
        "portal_linked": body.action == "link",
        "sync": sync_result,
        "cross_app": cross_app,
        "portal_url": PORTAL_APP_URL,
    }


@router.get("/neriacorp/cross-app/entitlements")
async def neriacorp_cross_app_entitlements(current_user: User = Depends(get_current_user)):
    """Droits cross-app (Héritia) dérivés de l'abonnement MamanDouce."""
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0}) or {}
    wallet = await db.wallets.find_one({"user_id": current_user.id}, {"_id": 0, "balance": 1})
    balance = float(wallet.get("balance", 0) if wallet else 0)
    stored = await db.cross_app_entitlements.find_one({"user_id": current_user.id}, {"_id": 0})
    entitlements = build_cross_app_entitlements(user_doc, balance)
    return {
        "entitlements": entitlements,
        "stored_push": stored,
        "portal_url": PORTAL_APP_URL,
    }


@router.post("/neriacorp/profile/sync")
async def neriacorp_profile_sync(current_user: User = Depends(get_current_user)):
    """Synchronise le profil B2C vers le Noyau NeriaCorp."""
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0}) or {}
    wallet = await db.wallets.find_one({"user_id": current_user.id}, {"_id": 0, "balance": 1})
    balance = float(wallet.get("balance", 0) if wallet else 0)
    sync_result = await sync_b2c_profile(user_doc)
    cross_app = await push_cross_app_entitlements(user_doc, balance)
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"neriacorp_portal_linked": True}},
    )
    return {"success": True, "sync": sync_result, "cross_app": cross_app}


@router.get("/neriacorp/catalog")
async def neriacorp_catalog():
    """
    Catalogue découvrable par le portail NeriaCorp.
    Place MamanDouce dans la zone B2C.
    """
    return get_portal_catalog_payload()


@router.get("/neriacorp/app")
async def neriacorp_app_identity():
    """Identité produit unique (fiche B2C)."""
    return get_portal_catalog_entry()


@router.get("/neriacorp/media")
async def neriacorp_media():
    """Config CDN publique (aucun secret). Le front hydrate Cloudinary sans rebuild."""
    cloud = CLOUDINARY_CLOUD_NAME
    folder = CLOUDINARY_FETUS_FOLDER or "mamandouce/fetus"
    transforms = CLOUDINARY_TRANSFORMS or "f_auto,q_auto"
    cdn_host = "https://res.cloudinary.com"
    delivery_base = (
        f"{cdn_host}/{cloud}/image/upload/{transforms}" if cloud else None
    )
    return {
        "provider": "cloudinary",
        "cdn_host": cdn_host,
        "cloud_name": cloud or None,
        "folder": folder,
        "transforms": transforms,
        "enabled": bool(cloud),
        "delivery_base": delivery_base,
    }


@router.get("/neriacorp/sso/status")
async def neriacorp_sso_status():
    """Découverte SSO + handoff de session pour le portail NeriaCorp.

    Le portail appelle cet endpoint (CORS) pour savoir où rediriger
    l'utilisatrice (authorize / token / callback). Tant que
    NERIACORP_SSO_LOGIN_URL + NERIACORP_SSO_ISSUER ne sont pas posés,
    `sso_enabled` reste false et MamanDouce authentifie en JWT local.
    """
    worker = n2_ocr_base_url() or "https://api.neriacorp.com"
    sso_login = (os.environ.get("NERIACORP_SSO_LOGIN_URL") or "").rstrip("/")
    sso_issuer = (os.environ.get("NERIACORP_SSO_ISSUER") or "").rstrip("/")
    callback = (
        os.environ.get("NERIACORP_SSO_CALLBACK_URL") or f"{FRONTEND_URL}/auth"
    ).rstrip("/")
    client_id = os.environ.get("NERIACORP_SSO_CLIENT_ID") or "mamandouce"
    enabled = bool(sso_login and sso_issuer)
    issuer = sso_issuer or worker
    authorize_url = sso_login or f"{worker}/api/auth/oauth/google/start"
    return {
        "provider": "neriacorp-oidc" if enabled else "mamandouce-jwt",
        "sso_enabled": enabled,
        "issuer": issuer,
        "login_url": authorize_url if enabled else f"{FRONTEND_URL}/auth",
        "callback_url": callback,
        "portal_url": NERIACORP_PORTAL_URL,
        "portal_zone": "B2C",
        "app_slug": "mamandouce",
        "session": {
            "handoff": "authorization_code",
            "authorize_url": authorize_url,
            "token_url": f"{issuer}/api/auth/refresh",
            "jwks_url": f"{issuer}/.well-known/jwks.json",
            "userinfo_url": f"{issuer}/api/auth/me",
            "n2_login_url": f"{worker}/api/auth/login",
            "scopes": ["openid", "profile", "email"],
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": callback,
            "local_login_url": f"{FRONTEND_URL}/auth",
        },
    }
