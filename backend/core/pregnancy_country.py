"""Resolve pregnancy calendar country from user city (France default)."""
from __future__ import annotations

import unicodedata

COUNTRY_FR = "FR"
COUNTRY_UK = "UK"
COUNTRY_BE = "BE"

_UK_CITY_HINTS = frozenset(
    {
        "london",
        "londres",
        "manchester",
        "birmingham",
        "leeds",
        "glasgow",
        "edinburgh",
        "liverpool",
        "bristol",
        "cardiff",
        "sheffield",
        "newcastle",
        "nottingham",
        "oxford",
        "cambridge",
        "brighton",
        "belfast",
        "england",
        "scotland",
        "wales",
        "uk",
        "united kingdom",
        "royaume-uni",
        "grande-bretagne",
        "great britain",
    }
)

_BE_CITY_HINTS = frozenset(
    {
        "bruxelles",
        "brussels",
        "antwerp",
        "anvers",
        "ghent",
        "gent",
        "liege",
        "charleroi",
        "belgique",
        "belgium",
    }
)

_FR_CITY_HINTS = frozenset(
    {
        "paris",
        "lyon",
        "marseille",
        "toulouse",
        "nice",
        "nantes",
        "strasbourg",
        "montpellier",
        "bordeaux",
        "lille",
        "rennes",
        "reims",
        "france",
    }
)


def _normalize_city(value: str | None) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFKD", str(value).strip().lower())
    return "".join(ch for ch in text if not unicodedata.combining(ch))


def resolve_country_from_city(city: str | None, default: str = COUNTRY_FR) -> str:
    """Infer country code from a free-text city field."""
    normalized = _normalize_city(city)
    if not normalized:
        return default

    for hint in _UK_CITY_HINTS:
        if hint in normalized:
            return COUNTRY_UK
    for hint in _BE_CITY_HINTS:
        if hint in normalized:
            return COUNTRY_BE
    for hint in _FR_CITY_HINTS:
        if hint in normalized:
            return COUNTRY_FR

    return default


def country_label(country: str) -> str:
    mapping = {
        COUNTRY_FR: "France (CPAM / Ameli)",
        COUNTRY_UK: "Royaume-Uni (NHS)",
        COUNTRY_BE: "Belgique",
    }
    return mapping.get(country, mapping[COUNTRY_FR])
