"""Single source of truth for MamanDouce contribution badges."""

BADGE_THRESHOLDS = {
    "bronze": {"contributions": 3, "referrals": 0},
    "silver": {"contributions": 2, "referrals": 1},
    "gold": {"contributions": 5, "referrals": 3},
}

BADGE_NAMES = {
    "bronze": "Contributrice Bronze",
    "silver": "Contributrice Argent",
    "gold": "Marraine Or",
}


def eligible_badges(contributions: int, referrals: int) -> list[str]:
    return [
        badge
        for badge, threshold in BADGE_THRESHOLDS.items()
        if contributions >= threshold["contributions"]
        and referrals >= threshold["referrals"]
    ]


def badge_progress_percent(
    badge: str,
    contributions: int,
    referrals: int,
) -> float:
    threshold = BADGE_THRESHOLDS[badge]
    required_contributions = threshold["contributions"]
    required_referrals = threshold["referrals"]
    if required_referrals == 0:
        return min(100.0, contributions / required_contributions * 100)
    return min(
        100.0,
        contributions / required_contributions * 50
        + referrals / required_referrals * 50,
    )
