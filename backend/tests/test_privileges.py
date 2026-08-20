"""Comptes superadmin permanents : admin + premium."""
import os
import sys
from unittest.mock import AsyncMock, MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.privileges import (
    HARDCODED_SUPERADMIN_EMAILS,
    SUPER_ADMIN_EMAILS,
    SUPERADMIN_DB_SET,
    apply_superadmin_overlay,
    is_superadmin_email,
    privilege_public_fields,
    superadmin_emails,
)


def test_hardcoded_superadmins():
    assert SUPER_ADMIN_EMAILS == [
        "cyrilalepsa@gmail.com",
        "superadmin@neriacorp.com",
    ]
    assert "cyrilalepsa@gmail.com" in HARDCODED_SUPERADMIN_EMAILS
    assert "superadmin@neriacorp.com" in HARDCODED_SUPERADMIN_EMAILS
    assert is_superadmin_email("CyrilAlepsa@Gmail.com")
    assert is_superadmin_email(" superadmin@neriacorp.com ")
    assert not is_superadmin_email("user@example.com")
    assert not is_superadmin_email("")


def test_overlay_forces_admin_premium():
    patched = apply_superadmin_overlay(
        {"email": "superadmin@neriacorp.com", "role": "user", "subscription_status": "free"}
    )
    assert patched["role"] == "admin"
    assert patched["subscription_status"] == "premium"
    assert patched["gold_status"] is True
    assert patched["postpartum_purchased"] is True
    assert patched["postpartum_free_via_referral"] is True
    assert patched["is_superadmin"] is True
    assert patched["is_admin"] is True
    assert patched["is_premium"] is True
    assert patched["is_vip"] is True
    regular = apply_superadmin_overlay({"email": "maman@test.com", "role": "user"})
    assert regular["role"] == "user"
    assert regular["is_superadmin"] is False
    assert regular["is_admin"] is False
    assert regular["is_premium"] is False
    assert regular["is_vip"] is False
    admin_role = apply_superadmin_overlay({"email": "staff@test.com", "role": "admin"})
    assert admin_role["is_admin"] is True
    assert admin_role["is_superadmin"] is False
    assert admin_role["is_premium"] is True


def test_example_admin_email_not_hardcoded():
    assert "admin@example.com" not in HARDCODED_SUPERADMIN_EMAILS
    assert "cyrilalepsa@gmail.com" in superadmin_emails()


def test_frontend_lists_both_superadmins():
    from pathlib import Path

    src = (Path(__file__).resolve().parents[2] / "frontend" / "src" / "utils" / "superadmin.js").read_text(
        encoding="utf-8"
    )
    assert "cyrilalepsa@gmail.com" in src
    assert "superadmin@neriacorp.com" in src
    assert "ADMIN_EMAILS" in src
    postpartum = (
        Path(__file__).resolve().parents[2] / "backend" / "routes" / "postpartum.py"
    ).read_text(encoding="utf-8")
    assert "apply_superadmin_overlay" in postpartum
    admin_py = (
        Path(__file__).resolve().parents[2] / "backend" / "routes" / "admin.py"
    ).read_text(encoding="utf-8")
    assert "SUPER_ADMIN_EMAILS" in admin_py
    assert "user.get(\"email\") in SUPER_ADMIN_EMAILS" in admin_py


def test_login_token_fields_force_superadmin_flags():
    fields = privilege_public_fields(
        {"email": "cyrilalepsa@gmail.com", "role": "user", "subscription_status": "free"}
    )
    assert fields["role"] == "admin"
    assert fields["subscription_status"] == "premium"
    assert fields["is_superadmin"] is True
    assert fields["is_admin"] is True
    assert fields["is_premium"] is True
    assert fields["is_vip"] is True
    from pathlib import Path

    auth_src = (Path(__file__).resolve().parents[1] / "routes" / "auth.py").read_text(
        encoding="utf-8"
    )
    schema_src = (Path(__file__).resolve().parents[1] / "models" / "schemas.py").read_text(
        encoding="utf-8"
    )
    assert "_force_vip_auth_fields" in auth_src
    assert "payload.update(_force_vip_auth_fields(payload))" in auth_src
    assert "is_premium: Optional[bool] = False" in schema_src
    assert "is_vip: Optional[bool] = False" in schema_src


async def _ensure():
    from core.privileges import ensure_superadmin_privileges

    users = MagicMock()
    users.update_one = AsyncMock(return_value=MagicMock(matched_count=1))
    database = MagicMock()
    database.users = users
    ok = await ensure_superadmin_privileges("cyrilalepsa@gmail.com", database=database)
    assert ok is True
    args = users.update_one.await_args
    assert args.args[1]["$set"]["role"] == "admin"
    assert args.args[1]["$set"]["subscription_status"] == "premium"
    skipped = await ensure_superadmin_privileges("nobody@test.com", database=database)
    assert skipped is False


def test_ensure_superadmin_writes_db_fields():
    import asyncio

    asyncio.run(_ensure())
    assert SUPERADMIN_DB_SET["role"] == "admin"
