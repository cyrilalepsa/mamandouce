"""
Configuration settings for MamanDouce
"""
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Security
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    # Fail-soft en local uniquement ; en prod SECRET_KEY DOIT être défini
    import logging
    logging.getLogger("mamandouce.config").warning(
        "SECRET_KEY manquant — utilisation d'une clé de développement NON sécurisée"
    )
    SECRET_KEY = "votre-cle-secrete-changez-moi"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Email
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

# Admin
ADMIN_SECRET = os.environ.get("ADMIN_SECRET")
if not ADMIN_SECRET:
    import logging
    logging.getLogger("mamandouce.config").warning(
        "ADMIN_SECRET manquant — valeur de développement NON sécurisée"
    )
    ADMIN_SECRET = "NeriaCorp-admin-dev-only"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "cyrilalepsa@gmail.com")

# Push Notifications (VAPID)
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "").replace("\\n", "\n")
VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_CLAIMS_EMAIL = os.environ.get("VAPID_CLAIMS_EMAIL", "cyrilalepsa@gmail.com")

# Stripe
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

# Frontend (liens emails, reset password, deep links)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")

# LLM (OpenAI — chatbot / traduction uniquement, PAS le scanner)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "") or os.environ.get("EMERGENT_LLM_KEY", "")
OPENAI_CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini")
OPENAI_VISION_MODEL = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o")

# Gemini Vision — moteur scanner Aevis / N2 (seul provider requis pour le scan)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""
GEMINI_VISION_MODEL = (
    os.environ.get("GEMINI_VISION_MODEL")
    or os.environ.get("AEVIS_GEMINI_VISION_MODEL")
    or "gemini-2.0-flash"
)

# Cloudinary — nomenclature prod (upload fœtus)
CLOUDINARY_CLOUD_NAME = (os.environ.get("CLOUDINARY_CLOUD_NAME") or "").strip()
CLOUDINARY_API_KEY = (os.environ.get("CLOUDINARY_API_KEY") or "").strip()
CLOUDINARY_API_SECRET = (os.environ.get("CLOUDINARY_API_SECRET") or "").strip()
CLOUDINARY_FETUS_FOLDER = (os.environ.get("CLOUDINARY_FETUS_FOLDER") or "mamandouce/fetus").strip()
CLOUDINARY_TRANSFORMS = (os.environ.get("CLOUDINARY_TRANSFORMS") or "f_auto,q_auto").strip()

# Noyau N2 — API centralisée (Option A)
DEFAULT_N2_WORKER_URL = "https://api.neriacorp.com"
NERIACORP_PORTAL_URL = os.environ.get("NERIACORP_PORTAL_URL", "https://neriacorp.com").rstrip("/")


def n2_ocr_base_url() -> str:
    """Worker OCR NeriaCorp (optionnel — le scanner aliment n'en a pas besoin).

    Défaut prod = api.neriacorp.com. N2_OCR_BASE_URL=off désactive l'URL.
    """
    if "N2_OCR_BASE_URL" not in os.environ:
        return DEFAULT_N2_WORKER_URL
    stripped = os.environ.get("N2_OCR_BASE_URL", "").strip().rstrip("/")
    if stripped.lower() in ("", "off", "none", "local", "-"):
        return ""
    return stripped


# CORS — origines NeriaCorp toujours acceptées ; CORS_ORIGINS ajoute / surcharge
NERIACORP_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://mamandouce.app",
    "https://www.mamandouce.app",
    "https://neriacorp.com",
    "https://www.neriacorp.com",
    "https://portal.neriacorp.com",
    "https://app.neriacorp.com",
    "https://api.neriacorp.com",
]
_cors_raw = os.environ.get("CORS_ORIGINS", "")
_cors_extra = [o.strip() for o in _cors_raw.split(",") if o.strip()]
if _cors_extra == ["*"]:
    CORS_ORIGINS = ["*"]
else:
    _seen = []
    for origin in NERIACORP_CORS_ORIGINS + _cors_extra:
        if origin not in _seen:
            _seen.append(origin)
    CORS_ORIGINS = _seen
