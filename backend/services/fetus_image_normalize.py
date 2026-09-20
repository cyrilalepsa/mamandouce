"""Normalize fetus admin uploads (HEIC/HEIF → JPEG for universal delivery)."""
from __future__ import annotations

import io
import re

from PIL import Image

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:  # pragma: no cover - optional at import, required for HEIC
    pillow_heif = None

HEIC_MIMES = frozenset(
    {
        "image/heic",
        "image/heif",
        "image/heic-sequence",
        "image/heif-sequence",
    }
)
RASTER_MIMES = frozenset(
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    }
)


def _looks_heic(mime: str, filename: str) -> bool:
    lowered = (mime or "").lower().split(";")[0].strip()
    if lowered in HEIC_MIMES:
        return True
    name = (filename or "").lower()
    return name.endswith(".heic") or name.endswith(".heif")


def normalize_fetus_image(
    content: bytes,
    mime: str,
    filename: str,
) -> tuple[bytes, str, str]:
    """
    Return (bytes, content_type, filename) ready for Cloudinary.
    HEIC/HEIF are converted to JPEG; other supported types pass through.
    """
    if not content:
        raise ValueError("Image vide")

    lowered = (mime or "").lower().split(";")[0].strip()
    if _looks_heic(lowered, filename):
        if pillow_heif is None:
            raise ValueError(
                "HEIC/HEIF non supporté sur ce serveur (pillow-heif manquant)"
            )
        with Image.open(io.BytesIO(content)) as img:
            rgb = img.convert("RGB")
            buffer = io.BytesIO()
            rgb.save(buffer, format="JPEG", quality=90, optimize=True)
        safe_name = re.sub(
            r"\.(heic|heif)$",
            ".jpg",
            filename or "fetus.jpg",
            flags=re.IGNORECASE,
        )
        if not safe_name.lower().endswith((".jpg", ".jpeg")):
            safe_name = f"{safe_name.rsplit('.', 1)[0]}.jpg"
        return buffer.getvalue(), "image/jpeg", safe_name

    if lowered not in RASTER_MIMES:
        ext = (filename or "").lower().rsplit(".", 1)[-1]
        if ext in {"jpg", "jpeg", "png", "webp"}:
            guessed = {
                "jpg": "image/jpeg",
                "jpeg": "image/jpeg",
                "png": "image/png",
                "webp": "image/webp",
            }[ext]
            return content, guessed, filename or f"fetus.{ext}"
        raise ValueError("Format accepté : JPEG, PNG, WEBP, HEIC ou HEIF")

    if lowered == "image/jpg":
        lowered = "image/jpeg"
    return content, lowered, filename or "fetus.jpg"
