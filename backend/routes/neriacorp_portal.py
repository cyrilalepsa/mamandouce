"""
Endpoints publics pour le portail NeriaCorp.
MamanDouce est exposée en zone B2C.
"""
import os

from fastapi import APIRouter

from core.config import FRONTEND_URL, NERIACORP_PORTAL_URL, n2_ocr_base_url
from integrations.neriacorp.catalog import get_portal_catalog_entry, get_portal_catalog_payload

router = APIRouter(tags=["neriacorp-portal"])


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
    cloud = (os.environ.get("CLOUDINARY_CLOUD_NAME") or "").strip()
    folder = (os.environ.get("CLOUDINARY_FETUS_FOLDER") or "mamandouce/fetus").strip()
    transforms = (os.environ.get("CLOUDINARY_TRANSFORMS") or "f_auto,q_auto").strip()
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
    authorize_url = sso_login or f"{worker}/oauth/authorize"
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
            "token_url": f"{issuer}/oauth/token",
            "jwks_url": f"{issuer}/.well-known/jwks.json",
            "userinfo_url": f"{issuer}/oauth/userinfo",
            "scopes": ["openid", "profile", "email"],
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": callback,
            "local_login_url": f"{FRONTEND_URL}/auth",
        },
    }
