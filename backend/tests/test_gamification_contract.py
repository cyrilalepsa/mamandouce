"""Canonical badge progression shared by all contribution flows."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.gamification import (
    BADGE_NAMES,
    BADGE_THRESHOLDS,
    badge_progress_percent,
    eligible_badges,
)


def test_canonical_badge_thresholds():
    assert BADGE_THRESHOLDS == {
        "bronze": {"contributions": 3, "referrals": 0},
        "silver": {"contributions": 2, "referrals": 1},
        "gold": {"contributions": 5, "referrals": 3},
    }
    assert BADGE_NAMES["gold"] == "Marraine Or"


def test_badge_eligibility_requires_the_documented_mix():
    assert eligible_badges(1, 0) == []
    assert eligible_badges(3, 0) == ["bronze"]
    assert eligible_badges(3, 1) == ["bronze", "silver"]
    assert eligible_badges(5, 3) == ["bronze", "silver", "gold"]


def test_combined_badge_progress_is_bounded():
    assert badge_progress_percent("bronze", 3, 0) == 100
    assert badge_progress_percent("silver", 2, 0) == 50
    assert badge_progress_percent("silver", 0, 1) == 50
    assert badge_progress_percent("silver", 2, 1) == 100
    assert badge_progress_percent("gold", 5, 3) == 100
