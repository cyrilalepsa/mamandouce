"""Tests passerelle N2O / portail NeriaCorp / archivage solidaire."""
import os
import sys
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from integrations.neriacorp.nucleus_client import (
    build_cross_app_entitlements,
    is_active_subscription,
    subscription_days_remaining,
)
from integrations.neriacorp.adapters import APP_REGISTRY


def test_hysia_registered_in_adapters():
    assert "Hysia" in APP_REGISTRY


def test_cross_app_entitlements_for_premium_user():
    user = {
        "subscription_status": "premium",
        "is_premium": True,
        "subscription_end_date": (
            datetime.now(timezone.utc) + timedelta(days=90)
        ).isoformat(),
    }
    ent = build_cross_app_entitlements(user, wallet_balance=5.0)
    assert ent["heritia"]["active"] is True
    assert ent["hysia"]["free_access"] is True
    assert ent["hysia"]["scans_unlocked_via_n2o"] is True
    assert ent["mamandouce"]["n2o_balance"] == 5.0


def test_subscription_days_remaining():
    future = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    user = {"subscription_end_date": future, "subscription_status": "premium"}
    assert subscription_days_remaining(user) >= 29
    assert is_active_subscription(user)
