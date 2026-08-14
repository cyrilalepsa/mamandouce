"""
Endpoints publics pour le portail NeriaCorp.
MamanDouce est exposée en zone B2C.
"""
import os

from fastapi import APIRouter

from core.config import FRONTEND_URL
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


@router.get("/neriacorp/sso/status")
async def neriacorp_sso_status():
    """Découverte SSO pour le portail NeriaCorp (Noyau N2).

    Tant que NERIACORP_SSO_LOGIN_URL n'est pas posé, l'app reste en JWT local
    (`/auth`). Le portail peut quand même afficher le point d'entrée B2C.
    """
    sso_login = (os.environ.get("NERIACORP_SSO_LOGIN_URL") or "").rstrip("/")
    sso_issuer = (os.environ.get("NERIACORP_SSO_ISSUER") or "").rstrip("/")
    enabled = bool(sso_login and sso_issuer)
    return {
        "provider": "neriacorp-oidc" if enabled else "mamandouce-jwt",
        "sso_enabled": enabled,
        "issuer": sso_issuer or FRONTEND_URL,
        "login_url": sso_login or f"{FRONTEND_URL}/auth",
        "callback_url": os.environ.get("NERIACORP_SSO_CALLBACK_URL")
        or f"{FRONTEND_URL}/auth",
        "portal_zone": "B2C",
        "app_slug": "mamandouce",
    }
