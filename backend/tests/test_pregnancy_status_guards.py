"""Pregnancy status suppresses cycle-delay/fertility contradictions."""
import asyncio
import os
import sys
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.schemas import User
from routes.emotional import _pregnancy_is_active, get_cycle_status
from routes.pregnancy import get_pregnancy_profile


def _user():
    return User(id="u-pregnant", email="maman@example.com", name="Maman")


def test_pregnancy_active_accepts_backend_status_fields():
    assert _pregnancy_is_active({"is_pregnant": True}) is True
    assert _pregnancy_is_active({"pregnancy_status": "pregnant"}) is True
    assert _pregnancy_is_active({"status": "enceinte"}) is True
    assert _pregnancy_is_active({"status": "envie_bebe"}) is False


def test_cycle_status_never_returns_late_alert_when_pregnant():
    fake_db = SimpleNamespace(
        users=SimpleNamespace(
            find_one=AsyncMock(
                return_value={
                    "id": "u-pregnant",
                    "is_pregnant": True,
                    "last_period_date": "2026-01-01",
                    "cycle_length": 28,
                }
            )
        )
    )

    with patch("routes.emotional.db", fake_db):
        result = asyncio.run(get_cycle_status(_user()))

    assert result == {
        "status": "pregnant",
        "message": "Grossesse en cours",
        "show_alert": False,
        "is_pregnant": True,
    }


def test_pregnancy_profile_exposes_canonical_status():
    profile = {
        "user_id": "u-pregnant",
        "last_period_date": "2026-07-01",
        "cycle_length": 28,
        "estimated_due_date": "2027-04-07T00:00:00",
    }
    fake_db = SimpleNamespace(
        users=SimpleNamespace(
            find_one=AsyncMock(return_value={"status": "enceinte"})
        )
    )

    with (
        patch("routes.pregnancy.db", fake_db),
        patch("routes.pregnancy.load_cycle_profile", AsyncMock(return_value=profile)),
        patch("routes.pregnancy.datetime") as mocked_datetime,
    ):
        mocked_datetime.now.return_value = datetime(2026, 8, 24, tzinfo=timezone.utc)
        mocked_datetime.fromisoformat.side_effect = datetime.fromisoformat
        result = asyncio.run(get_pregnancy_profile(_user()))

    assert result["is_pregnant"] is True
    assert result["pregnancy_status"] == "pregnant"
    assert result["current_week"] >= 1
