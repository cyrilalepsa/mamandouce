"""
Configuration settings for MamanDouce
"""
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Security
SECRET_KEY = os.environ.get("SECRET_KEY", "votre-cle-secrete-changez-moi")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Email
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

# Admin
ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "Cyca-admin2026")
ADMIN_EMAIL = "cyrilalepsa@gmail.com"

# Push Notifications (VAPID)
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "").replace("\\n", "\n")
VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_CLAIMS_EMAIL = os.environ.get("VAPID_CLAIMS_EMAIL", "cyrilalepsa@gmail.com")

# Stripe
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")
