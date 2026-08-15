"""
Configuration settings for MamanDouce

Les secrets Empire (Gemini, Cloudinary, Mongo, SSO, …) sont lus dans os.environ
après injection N2-Vault (n2_vault_client.sync_secrets) — jamais depuis un fichier
coffre. load_settings() peut être rappelé si le Vault hydrate l'env après import.
"""
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / ".env", override=False)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
DEFAULT_N2_WORKER_URL = "https://api.neriacorp.com"

NERIACORP_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://mamandouce.app",
    "https://www.mamandouce.app",
    "https://neriacorp.com",
    "https://www.neriacorp.com",
    "https://mamandouce.neriacorp.com",
    "https://www.mamandouce.neriacorp.com",
    "https://portal.neriacorp.com",
    "https://app.neriacorp.com",
    "https://api.neriacorp.com",
]

# Frontends Railway (ex. https://mamandouce-frontend-production.up.railway.app)
RAILWAY_CORS_ORIGIN_REGEX = r"https://[a-zA-Z0-9.-]+\.(up\.)?railway\.app"


def _normalize_origin(value: str) -> str:
    return (value or "").strip().strip("\"'").rstrip("/")


def parse_cors_origins(raw: str | None = None) -> list[str]:
    """CORS_ORIGINS / ALLOWED_ORIGINS : chaîne CSV (ou JSON) → liste.

    Fusionne les origines NeriaCorp + FRONTEND_URL / PUBLIC_APP_URL (front prod).
    """
    if raw is None:
        raw = os.environ.get("CORS_ORIGINS") or os.environ.get("ALLOWED_ORIGINS") or ""
    text = (raw or "").strip()
    extras: list[str] = []
    if text.startswith("["):
        try:
            import json

            parsed = json.loads(text)
            if isinstance(parsed, list):
                extras = [_normalize_origin(str(item)) for item in parsed if str(item).strip()]
        except json.JSONDecodeError:
            extras = []
    if not extras and text:
        extras = [_normalize_origin(part) for part in text.split(",") if part.strip()]

    if extras == ["*"] or text == "*":
        return ["*"]

    origins: list[str] = []
    for candidate in (
        list(NERIACORP_CORS_ORIGINS)
        + extras
        + [
            os.environ.get("FRONTEND_URL") or "",
            os.environ.get("PUBLIC_APP_URL") or "",
        ]
    ):
        origin = _normalize_origin(candidate)
        if origin and origin not in origins:
            origins.append(origin)
    return origins


def load_settings() -> None:
    """Relit os.environ (post N2-Vault) dans les constantes de module."""
    global SECRET_KEY, RESEND_API_KEY, SENDER_EMAIL, CONTACT_EMAIL, ADMIN_SECRET, ADMIN_EMAIL
    global VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, VAPID_CLAIMS_EMAIL
    global STRIPE_API_KEY, FRONTEND_URL
    global OPENAI_API_KEY, OPENAI_CHAT_MODEL, OPENAI_VISION_MODEL
    global GEMINI_API_KEY, GEMINI_VISION_MODEL
    global CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
    global CLOUDINARY_FETUS_FOLDER, CLOUDINARY_TRANSFORMS
    global NERIACORP_PORTAL_URL, CORS_ORIGINS

    SECRET_KEY = os.environ.get("SECRET_KEY")
    if not SECRET_KEY:
        import logging

        logging.getLogger("mamandouce.config").warning(
            "SECRET_KEY manquant — utilisation d'une clé de développement NON sécurisée"
        )
        SECRET_KEY = "votre-cle-secrete-changez-moi"

    RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
    SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "noreply@neriacorp.com")
    CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "contact@neriacorp.com")

    ADMIN_SECRET = os.environ.get("ADMIN_SECRET")
    if not ADMIN_SECRET:
        import logging

        logging.getLogger("mamandouce.config").warning(
            "ADMIN_SECRET manquant — valeur de développement NON sécurisée"
        )
        ADMIN_SECRET = "NeriaCorp-admin-dev-only"
    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "cyrilalepsa@gmail.com")

    VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "").replace("\\n", "\n")
    VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
    VAPID_CLAIMS_EMAIL = os.environ.get("VAPID_CLAIMS_EMAIL", "contact@neriacorp.com")

    STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")

    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "") or os.environ.get("EMERGENT_LLM_KEY", "")
    OPENAI_CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini")
    OPENAI_VISION_MODEL = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o")

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""
    GEMINI_VISION_MODEL = (
        os.environ.get("GEMINI_VISION_MODEL")
        or os.environ.get("AEVIS_GEMINI_VISION_MODEL")
        or "gemini-2.0-flash"
    )

    CLOUDINARY_CLOUD_NAME = (os.environ.get("CLOUDINARY_CLOUD_NAME") or "").strip()
    CLOUDINARY_API_KEY = (os.environ.get("CLOUDINARY_API_KEY") or "").strip()
    CLOUDINARY_API_SECRET = (os.environ.get("CLOUDINARY_API_SECRET") or "").strip()
    CLOUDINARY_FETUS_FOLDER = (os.environ.get("CLOUDINARY_FETUS_FOLDER") or "mamandouce/fetus").strip()
    CLOUDINARY_TRANSFORMS = (os.environ.get("CLOUDINARY_TRANSFORMS") or "f_auto,q_auto").strip()

    NERIACORP_PORTAL_URL = os.environ.get("NERIACORP_PORTAL_URL", "https://neriacorp.com").rstrip("/")

    CORS_ORIGINS = parse_cors_origins()


load_settings()


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
