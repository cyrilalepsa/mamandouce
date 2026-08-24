"""Dynamic scanner fallback and food-validation rewards."""
import asyncio
import os
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.schemas import AddFoodRequest, User
from routes.admin import update_food_status
from routes.food import add_user_food, search_food
from services.food_scanner_ai import food_scanner


def _user(user_id="u1"):
    return User(id=user_id, email="maman@example.com", name="Maman")


def test_text_fallback_always_returns_actionable_safety_status():
    safe = asyncio.run(food_scanner.analyze_food_text("Compote de fruit"))
    caution = asyncio.run(food_scanner.analyze_food_text("Boisson au café et soja"))
    unsafe = asyncio.run(food_scanner.analyze_food_text("Bonbon artisanal au rhum"))
    conservative = asyncio.run(food_scanner.analyze_food_text("Produit nouveau XYZ"))

    assert safe.safe_for_pregnancy == "safe"
    assert caution.safe_for_pregnancy == "caution"
    assert unsafe.safe_for_pregnancy == "unsafe"
    assert conservative.safe_for_pregnancy == "caution"
    for result in (safe, caution, unsafe, conservative):
        assert result.safe_for_pregnancy != "unknown"
        assert result.explanation
        assert result.can_contribute is True


def test_missing_search_result_returns_dynamic_analysis_not_empty_unknown():
    fake_db = SimpleNamespace(
        users=SimpleNamespace(find_one=AsyncMock(return_value={"subscription_status": "premium"})),
        food_scans=SimpleNamespace(insert_one=AsyncMock()),
        search_history=SimpleNamespace(insert_one=AsyncMock()),
    )
    with patch("routes.food.db", fake_db):
        result = asyncio.run(search_food("Produit inédit XYZ", _user()))

    assert len(result) == 1
    assert result[0]["safe_for_pregnancy"] == "caution"
    assert result[0]["is_unknown"] is True
    assert result[0]["can_contribute"] is True
    assert result[0]["reason"]


def test_food_proposal_keeps_ai_status_and_returns_pending_reward():
    inserted = {}

    async def insert(document):
        inserted.update(document)

    fake_db = SimpleNamespace(
        user_added_foods=SimpleNamespace(
            find_one=AsyncMock(return_value=None),
            insert_one=AsyncMock(side_effect=insert),
        )
    )
    request = AddFoodRequest(
        name="Produit inédit XYZ",
        category="Analyse dynamique",
        is_safe=False,
        safety_level="caution",
        notes="Analyse conservatrice",
    )
    with patch("routes.food.db", fake_db):
        result = asyncio.run(add_user_food(request, _user()))

    assert inserted["status"] == "pending"
    assert inserted["safety_level"] == "caution"
    assert result["message"] == "Proposition envoyée !"
    assert result["potential_reward_points"] == 20
    assert result["potential_badge"] == "Maman Contributrice"


def test_admin_approval_awards_points_and_contributor_badge_once():
    pending_food = {
        "id": "food-1",
        "user_id": "u1",
        "name": "Produit inédit XYZ",
        "status": "pending",
    }
    fake_db = SimpleNamespace(
        user_added_foods=SimpleNamespace(
            find_one=AsyncMock(return_value=pending_food),
            update_one=AsyncMock(),
        ),
        users=SimpleNamespace(update_one=AsyncMock()),
        badge_progress=SimpleNamespace(
            update_one=AsyncMock(),
            find_one=AsyncMock(return_value={"contributions_validated": 1}),
        ),
        user_badges=SimpleNamespace(
            find_one=AsyncMock(return_value=None),
            insert_one=AsyncMock(),
        ),
        contribution_rewards=SimpleNamespace(insert_one=AsyncMock()),
    )
    admin = User(id="admin", email="admin@example.com", name="Admin", role="admin")

    with patch("routes.admin.db", fake_db):
        result = asyncio.run(update_food_status("food-1", "approved", admin))

    assert result["reward_points"] == 20
    assert result["badge_unlocked"] == "Maman Contributrice"
    fake_db.users.update_one.assert_awaited_once_with(
        {"id": "u1"},
        {"$inc": {"contribution_points": 20}},
    )
    inserted_badges = [
        call.args[0]
        for call in fake_db.user_badges.insert_one.await_args_list
    ]
    assert any(
        badge["badge_type"] == "maman_contributrice"
        for badge in inserted_badges
    )
    fake_db.contribution_rewards.insert_one.assert_awaited_once()

    fake_db.user_added_foods.find_one.return_value = {
        **pending_food,
        "status": "approved",
    }
    with patch("routes.admin.db", fake_db):
        repeated = asyncio.run(update_food_status("food-1", "approved", admin))
    assert repeated["reward_points"] == 0
