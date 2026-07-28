"""
Catalogue NeriaCorp — identité produit MamanDouce pour le portail.

Zone cible : B2C (Business-to-Consumer)
Le portail NeriaCorp consomme ce manifeste pour afficher MamanDouce
dans la zone B2C (vs apps B2B/verticales : VisaTrace, Heritia, Aevis…).
"""
from __future__ import annotations

import os
from typing import Any, Dict

from core.config import FRONTEND_URL

APP_SLUG = "mamandouce"
APP_ID = "com.mamandouce.app"
PORTAL_ZONE = "B2C"
THEME_COLOR = "#ec4899"


def get_portal_catalog_entry() -> Dict[str, Any]:
    """Entrée unique destinée au portail NeriaCorp (zone B2C)."""
    public_url = os.environ.get("PUBLIC_APP_URL", FRONTEND_URL).rstrip("/") or "https://mamandouce.app"
    api_base = os.environ.get("PUBLIC_API_URL", "").rstrip("/")

    return {
        "id": APP_ID,
        "slug": APP_SLUG,
        "name": "MamanDouce",
        "tagline": "Compagnon de grossesse",
        "description": (
            "Application B2C de suivi de grossesse : calculateur, alimentation, "
            "rendez-vous médicaux, liste de naissance, postpartum et accompagnement IA."
        ),
        "zone": PORTAL_ZONE,
        "ecosystem": "NeriaCorp",
        "audience": "consumer",
        "category": "health-family",
        "theme_color": THEME_COLOR,
        "icon": f"{public_url}/app-icon-512.png",
        "urls": {
            "app": public_url,
            "privacy": f"{public_url}/privacy",
            "pricing": f"{public_url}/pricing",
            "api_docs": f"{api_base}/api/docs" if api_base else None,
            "health": f"{api_base}/api/health" if api_base else None,
            "catalog": f"{api_base}/api/neriacorp/catalog" if api_base else None,
        },
        "capabilities": [
            "pregnancy-tracking",
            "food-safety",
            "medical-reminders",
            "birth-list",
            "postpartum",
            "baby-names",
            "chatbot-ai",
            "pwa",
            "android-capacitor",
        ],
        "billing": {
            "model": "freemium",
            "currency": "EUR",
            "products": ["premium", "postpartum"],
        },
        "status": os.environ.get("NERIACORP_PORTAL_STATUS", "active"),
        "portal": {
            "visible": True,
            "zone": PORTAL_ZONE,
            "featured": True,
            "sort_order": int(os.environ.get("NERIACORP_PORTAL_SORT", "10")),
        },
        "version": "2.1.0",
    }


def get_portal_catalog_payload() -> Dict[str, Any]:
    """Payload complet attendu par le portail (liste zone B2C)."""
    entry = get_portal_catalog_entry()
    return {
        "ecosystem": "NeriaCorp",
        "zone": PORTAL_ZONE,
        "apps": [entry],
        "count": 1,
    }
