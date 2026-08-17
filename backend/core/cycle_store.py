"""Persist user cycle settings in Mongo, with a SQLite fallback if writes fail."""
from __future__ import annotations

import json
import logging
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from core.database import db

logger = logging.getLogger("mamandouce.cycle")

_CREATE_SQL = """
CREATE TABLE IF NOT EXISTS user_cycle_settings (
    user_id TEXT PRIMARY KEY,
    last_period_date TEXT NOT NULL,
    cycle_length INTEGER NOT NULL,
    estimated_due_date TEXT,
    estimated_conception_date TEXT,
    current_week INTEGER,
    extra_json TEXT,
    updated_at TEXT NOT NULL
)
"""


def sqlite_path() -> Path:
    configured = os.environ.get("CYCLE_SETTINGS_SQLITE")
    if configured:
        return Path(configured)
    data_dir = Path(__file__).resolve().parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir / "user_cycle_settings.sqlite"


def _connect() -> sqlite3.Connection:
    path = sqlite_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute(_CREATE_SQL)
    return conn


def sqlite_upsert(user_id: str, payload: Dict[str, Any]) -> None:
    extra = {
        k: v
        for k, v in payload.items()
        if k
        not in {
            "user_id",
            "last_period_date",
            "cycle_length",
            "estimated_due_date",
            "estimated_conception_date",
            "current_week",
            "updated_at",
            "created_at",
        }
    }
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO user_cycle_settings (
                user_id, last_period_date, cycle_length, estimated_due_date,
                estimated_conception_date, current_week, extra_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                last_period_date = excluded.last_period_date,
                cycle_length = excluded.cycle_length,
                estimated_due_date = excluded.estimated_due_date,
                estimated_conception_date = excluded.estimated_conception_date,
                current_week = excluded.current_week,
                extra_json = excluded.extra_json,
                updated_at = excluded.updated_at
            """,
            (
                user_id,
                payload.get("last_period_date"),
                int(payload.get("cycle_length") or 28),
                payload.get("estimated_due_date"),
                payload.get("estimated_conception_date"),
                payload.get("current_week"),
                json.dumps(extra, default=str),
                payload.get("updated_at") or datetime.now(timezone.utc).isoformat(),
            ),
        )


def sqlite_get(user_id: str) -> Optional[Dict[str, Any]]:
    try:
        with _connect() as conn:
            row = conn.execute(
                "SELECT * FROM user_cycle_settings WHERE user_id = ?",
                (user_id,),
            ).fetchone()
    except sqlite3.Error as exc:
        logger.warning("SQLite cycle read failed user_id=%s error=%s", user_id, exc)
        return None
    if not row:
        return None
    data = dict(row)
    extra = {}
    if data.get("extra_json"):
        try:
            extra = json.loads(data["extra_json"])
        except json.JSONDecodeError:
            extra = {}
    profile = {
        "user_id": data["user_id"],
        "last_period_date": data["last_period_date"],
        "cycle_length": data["cycle_length"],
        "estimated_due_date": data.get("estimated_due_date"),
        "estimated_conception_date": data.get("estimated_conception_date"),
        "current_week": data.get("current_week"),
        "updated_at": data.get("updated_at"),
        "storage": "sqlite",
    }
    profile.update(extra)
    return profile


async def persist_cycle_settings(user_id: str, payload: Dict[str, Any]) -> str:
    """
    Write cycle settings to Mongo (pregnancy_profiles + users columns + user_cycle_settings).
    If Mongo fails, fall back to a local SQLite table so the save still succeeds.
    """
    now = datetime.now(timezone.utc).isoformat()
    payload = dict(payload)
    payload.setdefault("user_id", user_id)
    payload.setdefault("updated_at", now)

    mongo_ok = False
    try:
        await db.pregnancy_profiles.update_one(
            {"user_id": user_id},
            {"$set": payload, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
        cycle_row = {
            "user_id": user_id,
            "last_period_date": payload.get("last_period_date"),
            "cycle_length": payload.get("cycle_length"),
            "updated_at": now,
        }
        await db.user_cycle_settings.update_one(
            {"user_id": user_id},
            {"$set": cycle_row},
            upsert=True,
        )
        await db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "last_period_date": payload.get("last_period_date"),
                    "cycle_length": payload.get("cycle_length"),
                }
            },
        )
        mongo_ok = True
    except Exception:
        logger.exception("Mongo persist cycle settings failed user_id=%s", user_id)

    sqlite_ok = False
    try:
        sqlite_upsert(user_id, payload)
        sqlite_ok = True
    except Exception:
        logger.exception("SQLite persist cycle settings failed user_id=%s", user_id)

    if mongo_ok and sqlite_ok:
        return "mongo+sqlite"
    if mongo_ok:
        return "mongo"
    if sqlite_ok:
        logger.warning("cycle settings stored via SQLite fallback user_id=%s", user_id)
        return "sqlite"
    logger.error("cycle settings persist failed on all stores user_id=%s", user_id)
    return "none"


async def load_cycle_profile(user_id: str) -> Optional[Dict[str, Any]]:
    try:
        profile = await db.pregnancy_profiles.find_one({"user_id": user_id}, {"_id": 0})
        if profile and profile.get("last_period_date"):
            return profile
    except Exception:
        logger.exception("Mongo pregnancy_profiles read failed user_id=%s", user_id)

    try:
        cycle_row = await db.user_cycle_settings.find_one({"user_id": user_id}, {"_id": 0})
        if cycle_row and cycle_row.get("last_period_date"):
            return cycle_row
    except Exception:
        logger.exception("Mongo user_cycle_settings read failed user_id=%s", user_id)

    try:
        user = await db.users.find_one(
            {"id": user_id},
            {"_id": 0, "last_period_date": 1, "cycle_length": 1},
        )
        if user and user.get("last_period_date"):
            return {
                "user_id": user_id,
                "last_period_date": user.get("last_period_date"),
                "cycle_length": user.get("cycle_length") or 28,
            }
    except Exception:
        logger.exception("Mongo users cycle columns read failed user_id=%s", user_id)

    return sqlite_get(user_id)
