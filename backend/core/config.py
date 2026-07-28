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

# LLM (OpenAI officiel — autonomie hors Emergent)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "") or os.environ.get("EMERGENT_LLM_KEY", "")
OPENAI_CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini")
OPENAI_VISION_MODEL = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o")

# CORS — liste séparée par virgules ; "*" autorisé en local uniquement
_cors_raw = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
CORS_ORIGINS = [o.strip() for o in _cors_raw.split(",") if o.strip()]
