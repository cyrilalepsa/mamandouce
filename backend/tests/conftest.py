"""Désactive N2-Vault pendant la collecte pytest (pas de clé maître ni d'HTTP)."""
import os

os.environ.setdefault("N2_VAULT_SYNC", "off")
