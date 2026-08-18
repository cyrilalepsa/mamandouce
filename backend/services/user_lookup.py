"""
Lookup utilisateurs par e-mail — insensible à la casse, aux espaces
invisibles, et aux noms de champs historiques (email / Email / user_email).
"""
from __future__ import annotations

import logging
import re
import unicodedata
from typing import Any

logger = logging.getLogger("mamandouce.user_lookup")

EMAIL_LOOKUP_FIELDS = ("email", "Email", "user_email", "mail")

# Caractères invisibles que str.strip() ne retire pas (ZWSP, BOM, etc.).
_INVISIBLE_EMAIL_CHARS = dict.fromkeys(
    map(ord, "\u200b\u200c\u200d\u2060\ufeff\u00ad\u180e"),
    None,
)


def normalize_email(email: str | None) -> str:
    """Canonise une adresse : NFKC, espaces invisibles, strip, lower."""
    raw = "" if email is None else str(email)
    raw = unicodedata.normalize("NFKC", raw)
    raw = raw.translate(_INVISIBLE_EMAIL_CHARS)
    for spacer in ("\u00a0", "\u202f", "\u2007", "\u00a0"):
        raw = raw.replace(spacer, " ")
    return raw.strip().lower()


def email_debug_repr(email: str | None) -> dict[str, Any]:
    text = "" if email is None else str(email)
    return {
        "value": text,
        "repr": repr(text),
        "hex": text.encode("utf-8").hex(),
        "normalized": normalize_email(text),
        "len": len(text),
        "len_normalized": len(normalize_email(text)),
    }


def user_email_query(email: str) -> dict:
    """Filtre Mongo : exact + casse + regex ancrée, sur tous les champs e-mail."""
    raw = (email or "").strip()
    lowered = normalize_email(email)
    clauses: list[dict[str, Any]] = []
    seen: set[str] = set()
    for field in EMAIL_LOOKUP_FIELDS:
        variants: list[Any] = []
        if lowered:
            variants.append(lowered)
        if raw and raw != lowered:
            variants.append(raw)
        for value in variants:
            key = f"{field}=str:{value}"
            if key not in seen:
                clauses.append({field: value})
                seen.add(key)
        if lowered:
            regex_key = f"{field}=re:{lowered}"
            if regex_key not in seen:
                clauses.append(
                    {field: {"$regex": f"^{re.escape(lowered)}$", "$options": "i"}}
                )
                seen.add(regex_key)
    if not clauses:
        return {"email": lowered}
    return {"$or": clauses} if len(clauses) > 1 else clauses[0]


def trimmed_email_match_pipeline(needle: str, *, limit: int = 1) -> list[dict[str, Any]]:
    """Agrégation $trim + $toLower — trouve `email: ' foo@x '` en base."""
    or_expr = []
    for field in EMAIL_LOOKUP_FIELDS:
        or_expr.append(
            {
                "$eq": [
                    {
                        "$toLower": {
                            "$trim": {
                                "input": {
                                    "$ifNull": [{"$toString": f"${field}"}, ""]
                                }
                            }
                        }
                    },
                    needle,
                ]
            }
        )
    return [
        {"$match": {"$expr": {"$or": or_expr}}},
        {"$limit": limit},
    ]


def _strip_id(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    if not doc:
        return None
    doc.pop("_id", None)
    return doc


async def find_user_by_email(email: str, database=None):
    """Recherche un utilisateur sans tenir compte de la casse ni des espaces."""
    from core.database import get_db

    needle = normalize_email(email)
    if not needle:
        return None
    database = database if database is not None else get_db()
    query = user_email_query(email)
    logger.info(
        "find_user_by_email db=%s collection=users email=%r query_fields=%s",
        getattr(database, "name", "?"),
        needle,
        list(EMAIL_LOOKUP_FIELDS),
    )
    user = await database.users.find_one(query, {"_id": 0})
    if user:
        return user

    pipeline = trimmed_email_match_pipeline(needle)
    try:
        cursor = database.users.aggregate(pipeline)
        docs = await cursor.to_list(1)
    except Exception:
        logger.exception(
            "find_user_by_email aggregation $trim failed db=%s email=%r",
            getattr(database, "name", "?"),
            needle,
        )
        docs = []
    if docs:
        user = _strip_id(dict(docs[0]))
        logger.warning(
            "find_user_by_email matched via $trim aggregation db=%s email=%r stored=%r",
            getattr(database, "name", "?"),
            needle,
            (user or {}).get("email"),
        )
        return user
    return None


async def collect_lookup_miss_diagnostics(database, needle: str) -> dict[str, Any]:
    """Compteurs / indexes / variantes proches — pour logs Railway."""
    payload: dict[str, Any] = {
        "db_name": getattr(database, "name", None),
        "users_count": None,
        "indexes": None,
        "email_field_keys_sample": [],
        "similar": [],
    }
    try:
        payload["users_count"] = await database.users.count_documents({})
    except Exception as exc:
        payload["users_count_error"] = str(exc)
    try:
        payload["indexes"] = await database.users.index_information()
    except Exception as exc:
        payload["indexes_error"] = str(exc)

    try:
        cursor = database.users.find({}, {"hashed_password": 0, "password": 0}).limit(8)
        samples = []
        async for doc in cursor:
            samples.append(
                sorted(
                    str(k)
                    for k in doc.keys()
                    if k not in ("_id", "hashed_password", "password_hash", "password")
                )
            )
        payload["email_field_keys_sample"] = samples
    except Exception as exc:
        payload["sample_error"] = str(exc)

    local = needle.split("@")[0] if "@" in needle else needle
    if local and len(local) >= 3:
        try:
            similar_query = {
                "$or": [
                    {field: {"$regex": re.escape(local), "$options": "i"}}
                    for field in EMAIL_LOOKUP_FIELDS
                ]
            }
            cursor = database.users.find(
                similar_query,
                {field: 1 for field in EMAIL_LOOKUP_FIELDS},
            ).limit(10)
            async for doc in cursor:
                stored = None
                present = []
                for field in EMAIL_LOOKUP_FIELDS:
                    if field in doc and doc.get(field):
                        present.append(field)
                        if stored is None:
                            stored = doc.get(field)
                payload["similar"].append(
                    {
                        "fields": present,
                        **email_debug_repr(stored if isinstance(stored, str) else str(stored or "")),
                    }
                )
        except Exception as exc:
            payload["similar_error"] = str(exc)
    return payload


async def inspect_reset_user(email: str, database=None) -> dict[str, Any]:
    """Rapport archéologique : présence du compte, casse, hex, indexes, DB_NAME."""
    from core.database import get_db, resolve_db_name

    needle = normalize_email(email)
    database = database if database is not None else get_db()
    query = user_email_query(email)
    user = await find_user_by_email(email, database=database)
    miss = await collect_lookup_miss_diagnostics(database, needle)
    stored = None
    if user:
        for field in EMAIL_LOOKUP_FIELDS:
            if user.get(field):
                stored = user.get(field)
                break
    return {
        "db_name": getattr(database, "name", None) or resolve_db_name(),
        "collection": "users",
        "lookup_fields": list(EMAIL_LOOKUP_FIELDS),
        "mongo_query": query,
        "user_found": bool(user),
        "requested": email_debug_repr(email),
        "stored": email_debug_repr(stored) if stored is not None else None,
        "users_count": miss.get("users_count"),
        "indexes": miss.get("indexes"),
        "email_field_keys_sample": miss.get("email_field_keys_sample"),
        "similar": miss.get("similar") if not user else [],
        "resend_called_only_if_user_found": True,
        "note": (
            "Si user_found=false, forgot-password renvoie HTTP 200 anti-énumération "
            "et n'appelle JAMAIS Resend (contrairement à /test-resend-direct)."
        ),
    }
