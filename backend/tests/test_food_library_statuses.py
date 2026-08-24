"""Food fixture classification, filters and pagination contract."""
import asyncio
import os
import sys
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from data.food_database import FOOD_CATEGORIES, FOOD_SAFETY_DATABASE
from models.schemas import User
from routes.food import (
    FOOD_SAFETY_STATUSES,
    get_food_library,
    normalized_food_library,
)


def _user():
    return User(id="u-food", email="maman@example.com", name="Maman")


def _library(**kwargs):
    defaults = {
        "search": None,
        "category": None,
        "status": None,
        "page": 1,
        "limit": 30,
        "current_user": _user(),
    }
    defaults.update(kwargs)
    with patch(
        "routes.food.get_food_safety_database",
        AsyncMock(return_value=FOOD_SAFETY_DATABASE),
    ):
        return asyncio.run(get_food_library(**defaults))


def test_reference_foods_have_expected_medical_statuses():
    for key in ("abricot", "ail", "ananas", "avoine", "banane"):
        assert FOOD_SAFETY_DATABASE[key]["safe_for_pregnancy"] == "safe"
    for key in (
        "alcool",
        "camembert-lait-cru",
        "boeuf-cru",
        "poisson-cru",
        "saucisson",
    ):
        assert FOOD_SAFETY_DATABASE[key]["safe_for_pregnancy"] == "unsafe"
    for key in ("cafe", "soja", "tofu", "thon-boite"):
        assert FOOD_SAFETY_DATABASE[key]["safe_for_pregnancy"] == "caution"


def test_library_has_only_canonical_statuses_and_unique_names():
    foods = normalized_food_library(FOOD_SAFETY_DATABASE)
    names = [food["name"].strip().casefold() for food in foods]
    assert len(names) == len(set(names))
    assert len(foods) >= 300
    assert all(str(food.get("reason") or "").strip() for food in foods)
    assert {food["safe_for_pregnancy"] for food in foods} == FOOD_SAFETY_STATUSES
    assert {food["category"] for food in foods}.issubset(set(FOOD_CATEGORIES))


def test_each_status_filter_is_exact_before_pagination():
    all_names = set()
    totals = 0
    for status in sorted(FOOD_SAFETY_STATUSES):
        first = _library(status=status, page=1, limit=7)
        collected = []
        for page in range(1, first["pages"] + 1):
            payload = _library(status=status, page=page, limit=7)
            assert all(
                food["safe_for_pregnancy"] == status
                for food in payload["foods"]
            )
            collected.extend(food["name"] for food in payload["foods"])
        assert len(collected) == first["total"]
        assert len(collected) == len(set(collected))
        assert all_names.isdisjoint(collected)
        all_names.update(collected)
        totals += first["total"]

    assert totals == len(normalized_food_library(FOOD_SAFETY_DATABASE))


def test_filter_resets_page_boundaries_without_duplicates():
    page_one = _library(status="safe", page=1, limit=10)
    page_two = _library(status="safe", page=2, limit=10)
    names_one = {food["name"] for food in page_one["foods"]}
    names_two = {food["name"] for food in page_two["foods"]}
    assert names_one
    assert names_two
    assert names_one.isdisjoint(names_two)
    assert page_one["total"] == page_two["total"]
