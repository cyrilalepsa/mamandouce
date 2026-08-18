"""
Database configuration for MamanDouce
Shared database connection for all modules
"""
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import logging
import os

ROOT_DIR = Path(__file__).parent.parent
# override=False : N2-Vault (RAM) prime sur le .env disque
load_dotenv(ROOT_DIR / '.env', override=False)

logger = logging.getLogger("mamandouce.db")

DEFAULT_DB_NAME = "mamandouce"
mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")

client = AsyncIOMotorClient(mongo_url)


def resolve_db_name() -> str:
    """Relit DB_NAME à chaque appel (Vault peut hydrater l'env après l'import)."""
    name = (os.environ.get("DB_NAME") or "").strip()
    if not name:
        logger.warning(
            "DB_NAME manquant — fallback %s (l'ancien défaut test_database "
            "faisait rater les comptes en production)",
            DEFAULT_DB_NAME,
        )
        return DEFAULT_DB_NAME
    if name == "test_database":
        logger.error(
            "DB_NAME=test_database — collection users probablement vide. "
            "Les comptes MamanDouce sont en général dans DB_NAME=mamandouce."
        )
    return name


def get_db():
    """Handle Mongo de la base en vigueur (pas un snapshot d'import)."""
    return client[resolve_db_name()]


db_name = resolve_db_name()
db = get_db()
