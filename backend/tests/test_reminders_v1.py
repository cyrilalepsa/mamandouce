"""Canonical /api/v1/reminders contract."""
import asyncio
import os
import sys
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.schemas import ReminderCreate, User
from routes.medical import (
    create_user_reminder,
    delete_user_reminder,
    list_user_reminders,
)


class _Cursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, *_args):
        return self

    async def to_list(self, _limit):
        return [dict(item) for item in self.documents]


class _Collection:
    def __init__(self):
        self.documents = []

    def find(self, query):
        return _Cursor([
            item for item in self.documents
            if item.get("user_id") == query.get("user_id")
        ])

    async def insert_one(self, document):
        self.documents.append(dict(document))
        return SimpleNamespace(inserted_id=document["id"])

    async def delete_one(self, query):
        before = len(self.documents)
        self.documents = [
            item for item in self.documents
            if not (
                item.get("user_id") == query.get("user_id")
                and item.get("id") == query.get("id")
            )
        ]
        return SimpleNamespace(deleted_count=before - len(self.documents))


def test_create_list_delete_custom_reminder_contract():
    collection = _Collection()
    fake_db = SimpleNamespace(appointment_reminders=collection)
    user = User(id="u1", email="maman@example.com", name="Maman")
    payload = ReminderCreate(
        title="  Échographie  ",
        datetime="2026-09-02T09:30:00+02:00",
        type="rdv",
        reminder_type="push",
    )

    with patch("routes.medical.db", fake_db):
        created = asyncio.run(create_user_reminder(payload, user))
        listed = asyncio.run(list_user_reminders(user))
        deleted = asyncio.run(delete_user_reminder(created.id, user))

    assert created.title == "Échographie"
    assert created.datetime.startswith("2026-09-02T09:30:00")
    assert listed.reminders[0].id == created.id
    assert listed.reminders[0].datetime == created.datetime
    assert deleted == {"success": True, "id": created.id}
    assert collection.documents == []
