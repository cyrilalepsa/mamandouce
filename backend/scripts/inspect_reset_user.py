#!/usr/bin/env python3
"""Inspection archéologique du compte forgot-password dans MongoDB.

Usage (depuis backend/, avec MONGO_URL / DB_NAME dans l'environnement) :
    python3 scripts/inspect_reset_user.py
    python3 scripts/inspect_reset_user.py cyrilalepsa@gmail.com

Affiche : présence, casse, espaces invisibles (hex), champs, indexes, DB_NAME.
N'envoie aucun e-mail.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

from services.user_lookup import (  # noqa: E402
    EMAIL_LOOKUP_FIELDS,
    email_debug_repr,
    normalize_email,
    trimmed_email_match_pipeline,
    user_email_query,
)

TARGET = "cyrilalepsa@gmail.com"


def _jsonable(value):
    if hasattr(value, "items") and not isinstance(value, dict):
        try:
            return {str(k): _jsonable(v) for k, v in dict(value).items()}
        except Exception:
            return repr(value)
    if isinstance(value, dict):
        return {str(k): _jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_jsonable(v) for v in value]
    return value


def inspect_sync(email: str) -> dict:
    from pymongo import MongoClient

    from core.database import mongo_url, resolve_db_name

    needle = normalize_email(email)
    db_name = resolve_db_name()
    client = MongoClient(mongo_url, serverSelectionTimeoutMS=8000)
    try:
        client.admin.command("ping")
    except Exception as exc:
        return {
            "ok": False,
            "error": f"{type(exc).__name__}: {exc}",
            "mongo_url_host": (mongo_url or "").split("@")[-1],
            "db_name": db_name,
        }

    listed = client.list_database_names()
    database = client[db_name]
    collections = database.list_collection_names()
    users = database["users"]
    report = {
        "ok": True,
        "db_name": db_name,
        "listed_databases": listed,
        "collections": collections,
        "users_in_listed_dbs": {},
        "requested": email_debug_repr(email),
        "query": user_email_query(email),
        "lookup_fields": list(EMAIL_LOOKUP_FIELDS),
        "indexes": None,
        "users_count": None,
        "exact_find": None,
        "trim_aggregation": None,
        "user_found": False,
        "stored": None,
    }
    for name in listed:
        if name in ("admin", "local", "config"):
            continue
        cols = client[name].list_collection_names()
        if "users" in cols:
            report["users_in_listed_dbs"][name] = client[name]["users"].count_documents({})

    if "users" not in collections:
        report["error"] = f"collection users absente de {db_name}"
        return report

    report["users_count"] = users.count_documents({})
    try:
        report["indexes"] = _jsonable(users.index_information())
    except Exception as exc:
        report["indexes"] = {"error": str(exc)}

    doc = users.find_one(user_email_query(email), {"_id": 0, "hashed_password": 0, "password": 0})
    if not doc:
        pipeline = trimmed_email_match_pipeline(needle)
        agg = list(users.aggregate(pipeline))
        if agg:
            doc = agg[0]
            doc.pop("_id", None)
            doc.pop("hashed_password", None)
            report["trim_aggregation"] = True
    else:
        report["exact_find"] = True

    if doc:
        report["user_found"] = True
        stored = None
        for field in EMAIL_LOOKUP_FIELDS:
            if doc.get(field):
                stored = doc.get(field)
                break
        report["stored"] = email_debug_repr(stored)
        report["document_keys"] = sorted(str(k) for k in doc.keys())
    else:
        similar = []
        local = needle.split("@")[0]
        if local:
            for found in users.find(
                {"$or": [{f: {"$regex": local, "$options": "i"}} for f in EMAIL_LOOKUP_FIELDS]},
                {f: 1 for f in EMAIL_LOOKUP_FIELDS},
            ).limit(10):
                stored = next((found.get(f) for f in EMAIL_LOOKUP_FIELDS if found.get(f)), None)
                similar.append(email_debug_repr(stored if isinstance(stored, str) else str(stored or "")))
        report["similar"] = similar
        samples = []
        for found in users.find({}, {"hashed_password": 0, "password": 0}).limit(5):
            samples.append(sorted(str(k) for k in found.keys() if k != "_id"))
        report["email_field_keys_sample"] = samples
    return report


def main() -> int:
    email = sys.argv[1] if len(sys.argv) > 1 else TARGET
    report = inspect_sync(email)
    print(json.dumps(report, ensure_ascii=False, indent=2, default=str))
    if not report.get("ok"):
        return 2
    return 0 if report.get("user_found") else 1


if __name__ == "__main__":
    raise SystemExit(main())
