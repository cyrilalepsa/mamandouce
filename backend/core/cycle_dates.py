"""Parse / validate last-period dates and cycle length for fertility save."""
from __future__ import annotations

import logging
import re
from datetime import datetime, timezone

logger = logging.getLogger("mamandouce.cycle")

ISO_DATE = re.compile(r"^(\d{4})-(\d{2})-(\d{2})")
FR_DATE = re.compile(r"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$")

MIN_CYCLE_LENGTH = 21
MAX_CYCLE_LENGTH = 45
DEFAULT_CYCLE_LENGTH = 28


def normalize_iso_date(value) -> str:
    """Return YYYY-MM-DD or raise ValueError."""
    if value is None:
        raise ValueError("last_period_date is required")
    raw = str(value).strip()
    if not raw:
        raise ValueError("last_period_date is required")

    match = ISO_DATE.match(raw)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        datetime(year, month, day)
        return f"{year:04d}-{month:02d}-{day:02d}"

    match = FR_DATE.match(raw)
    if match:
        day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
        datetime(year, month, day)
        return f"{year:04d}-{month:02d}-{day:02d}"

    logger.warning("cycle validation failed: last_period_date=%r (expected YYYY-MM-DD)", raw)
    raise ValueError("last_period_date must be YYYY-MM-DD")


def parse_last_period_datetime(value) -> datetime:
    """Naive datetime at midnight for the last-period calendar day."""
    return datetime.strptime(normalize_iso_date(value), "%Y-%m-%d")


def coerce_cycle_length(value, default: int = DEFAULT_CYCLE_LENGTH) -> int:
    if value is None or value == "":
        return default
    try:
        n = int(float(str(value).strip().replace(",", ".")))
    except (TypeError, ValueError) as exc:
        logger.warning("cycle validation failed: cycle_length=%r (%s)", value, exc)
        raise ValueError("cycle_length must be an integer") from exc
    if n < MIN_CYCLE_LENGTH or n > MAX_CYCLE_LENGTH:
        logger.warning(
            "cycle validation failed: cycle_length=%s out of range %s-%s",
            n,
            MIN_CYCLE_LENGTH,
            MAX_CYCLE_LENGTH,
        )
        raise ValueError(
            f"cycle_length must be between {MIN_CYCLE_LENGTH} and {MAX_CYCLE_LENGTH}"
        )
    return n


def as_naive_utc(dt: datetime) -> datetime:
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt
