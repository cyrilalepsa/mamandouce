"""JWT sub normalisé + lookup e-mail insensible à la casse."""
import asyncio
import os
import sys
from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from jose import jwt

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.config import ALGORITHM, SECRET_KEY
from core.security import create_access_token, get_current_user


class _Creds:
    def __init__(self, token: str):
        self.credentials = token


def test_create_access_token_normalizes_sub():
    token = create_access_token(
        {"sub": "  CyrilAlepsa@Gmail.com "},
        expires_delta=timedelta(minutes=5),
    )
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "cyrilalepsa@gmail.com"


def test_get_current_user_uses_find_user_by_email():
    token = create_access_token(
        {"sub": "cyrilalepsa@gmail.com"},
        expires_delta=timedelta(minutes=5),
    )
    stored = {
        "id": "u1",
        "email": "CyrilAlepsa@Gmail.com",
        "name": "Cyril",
        "role": "user",
        "subscription_status": "free",
    }

    async def _run():
        with patch(
            "core.security.find_user_by_email",
            new=AsyncMock(return_value=dict(stored)),
        ) as lookup:
            with patch("core.privileges.ensure_superadmin_privileges", new=AsyncMock()):
                user = await get_current_user(_Creds(token))
        lookup.assert_awaited()
        assert lookup.await_args.args[0] == "cyrilalepsa@gmail.com"
        assert user.email == "CyrilAlepsa@Gmail.com"
        assert user.role == "admin"
        assert user.is_vip is True

    asyncio.run(_run())
