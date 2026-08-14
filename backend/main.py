"""
Point d'entrée backend MamanDouce.

Les secrets Empire (Gemini, Cloudinary, Mongo, SSO) sont chargés depuis
N2-Vault en mémoire AVANT l'initialisation de FastAPI / Mongo / clients API.
"""
from n2_vault_client import sync_secrets

# Chargement prioritaire des secrets chiffrés en mémoire RAM
sync_secrets()

from server import app  # noqa: E402, F401

__all__ = ["app"]
