"""Tests lookup e-mail : casse, espaces, champs alternatifs, agrégation $trim."""
import asyncio
import os
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.user_lookup import (
    EMAIL_LOOKUP_FIELDS,
    find_user_by_email,
    inspect_reset_user,
    normalize_email,
    trimmed_email_match_pipeline,
    user_email_query,
)


def test_find_user_by_email_uses_trim_aggregation_when_exact_misses():
    stored = {
        "id": "u-space",
        "email": "  cyrilalepsa@gmail.com  ",
        "name": "Cyril",
    }

    class Cursor:
        async def to_list(self, n):
            return [dict(stored)]

    users = SimpleNamespace(
        find_one=AsyncMock(return_value=None),
        aggregate=lambda _pipeline: Cursor(),
    )
    database = SimpleNamespace(name="mamandouce", users=users)

    user = asyncio.run(find_user_by_email("cyrilalepsa@gmail.com", database=database))
    assert user["email"] == "  cyrilalepsa@gmail.com  "
    users.find_one.assert_awaited()
    pipeline = trimmed_email_match_pipeline("cyrilalepsa@gmail.com")
    assert pipeline[0]["$match"]["$expr"]["$or"]


def test_inspect_reset_user_reports_missing_account():
    class EmptyCursor:
        def limit(self, _n):
            return self

        def __aiter__(self):
            return self

        async def __anext__(self):
            raise StopAsyncIteration

    users = SimpleNamespace(
        find_one=AsyncMock(return_value=None),
        aggregate=lambda _p: SimpleNamespace(to_list=AsyncMock(return_value=[])),
        count_documents=AsyncMock(return_value=0),
        index_information=AsyncMock(return_value={"_id_": {"key": [("_id", 1)]}}),
        find=lambda *_a, **_k: EmptyCursor(),
    )
    database = SimpleNamespace(name="mamandouce", users=users)
    report = asyncio.run(inspect_reset_user("cyrilalepsa@gmail.com", database=database))
    assert report["user_found"] is False
    assert report["users_count"] == 0
    assert report["db_name"] == "mamandouce"
    assert "email" in report["lookup_fields"]
    assert report["requested"]["normalized"] == "cyrilalepsa@gmail.com"
    assert report["requested"]["hex"] == "cyrilalepsa@gmail.com".encode().hex()


def test_query_covers_alternate_field_names():
    q = user_email_query("cyrilalepsa@gmail.com")
    fields = {key for clause in q["$or"] for key in clause}
    assert set(EMAIL_LOOKUP_FIELDS) <= fields
    assert normalize_email("\ufeffcyrilalepsa@gmail.com") == "cyrilalepsa@gmail.com"
