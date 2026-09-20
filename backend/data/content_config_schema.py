"""Registre des contenus configurables (cockpit admin)."""

CONTENT_CONFIG_DEFINITIONS: dict[str, dict] = {
    "banner.home_hero": {
        "category": "banner",
        "label": "Bannière d'accueil (hero)",
        "type": "image",
    },
    "banner.home_welcome": {
        "category": "banner",
        "label": "Illustration zone bienvenue",
        "type": "image",
    },
    "banner.journey_header": {
        "category": "banner",
        "label": "Visuel en-tête parcours",
        "type": "image",
    },
    "banner.dynamic_promo": {
        "category": "banner",
        "label": "Bannière dynamique (promo / actu)",
        "type": "image",
    },
    "legal.mentions": {
        "category": "legal",
        "label": "Mentions légales",
        "type": "text",
    },
    "legal.cgu": {
        "category": "legal",
        "label": "Conditions générales d'utilisation (CGU)",
        "type": "text",
    },
    "legal.privacy": {
        "category": "legal",
        "label": "Politique de confidentialité",
        "type": "text",
    },
    "info.advice_box": {
        "category": "legal",
        "label": "Encadré d'information / conseils",
        "type": "text",
    },
}
