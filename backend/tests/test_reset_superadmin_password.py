"""Script maintenance : hash bcrypt + reset lockout superadmin."""
import os
import sys

BACKEND = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, BACKEND)
sys.path.insert(0, os.path.join(BACKEND, "scripts"))

from passlib.context import CryptContext

from reset_superadmin_password import (
    TARGET_EMAIL,
    build_password_reset_update,
    hash_password,
    hash_prefix,
    reset_password_sync,
)


def test_hash_password_is_bcrypt_and_verifies():
    ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed = hash_password("MonSuperMDP2026!")
    assert hashed.startswith("$2")
    assert ctx.verify("MonSuperMDP2026!", hashed)
    assert not ctx.verify("wrong", hashed)
    assert hash_prefix(hashed).startswith("$2")


def test_build_password_reset_update_clears_lockout():
    update = build_password_reset_update("$2b$12$placeholder")
    assert update["$set"]["hashed_password"] == "$2b$12$placeholder"
    assert update["$set"]["failed_login_attempts"] == 0
    assert update["$set"]["login_attempts"] == 0
    assert update["$set"]["failed_attempts"] == 0
    assert "password_updated_at" in update["$set"]
    assert update["$unset"]["locked_until"] == ""
    assert update["$unset"]["password"] == ""


def test_reset_refuses_other_emails():
    report = reset_password_sync("nobody@example.com", "MonSuperMDP2026!")
    assert report["ok"] is False
    assert TARGET_EMAIL in report["error"]
