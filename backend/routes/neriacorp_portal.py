"""
Endpoints publics pour le portail NeriaCorp.
MamanDouce est exposée en zone B2C.
"""
from fastapi import APIRouter

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
