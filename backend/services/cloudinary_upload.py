"""Minimal signed Cloudinary upload used by the admin fetus visual manager."""
from __future__ import annotations

import hashlib
import os
import time

import requests

from core import config

FETUS_VISUALS_FOLDER = "mamandouce/foetus"


def _signature(params: dict, api_secret: str) -> str:
    to_sign = "&".join(f"{key}={params[key]}" for key in sorted(params))
    return hashlib.sha1(f"{to_sign}{api_secret}".encode("utf-8")).hexdigest()


def upload_fetus_visual(
    content: bytes,
    *,
    filename: str,
    content_type: str,
    week: int,
) -> dict:
    config.load_settings()
    cloud = config.CLOUDINARY_CLOUD_NAME
    api_key = config.CLOUDINARY_API_KEY
    api_secret = config.CLOUDINARY_API_SECRET
    folder = (
        os.environ.get("CLOUDINARY_FETUS_VISUALS_FOLDER")
        or FETUS_VISUALS_FOLDER
    ).strip().rstrip("/")
    if not cloud or not api_key or not api_secret:
        raise RuntimeError("Cloudinary n'est pas configuré")

    timestamp = int(time.time())
    public_id = f"week-{week:02d}"
    sign_params = {
        "folder": folder,
        "invalidate": "true",
        "overwrite": "true",
        "public_id": public_id,
        "timestamp": timestamp,
    }
    response = requests.post(
        f"https://api.cloudinary.com/v1_1/{cloud}/image/upload",
        data={
            **sign_params,
            "api_key": api_key,
            "signature": _signature(sign_params, api_secret),
        },
        files={"file": (filename, content, content_type)},
        timeout=60,
    )
    if response.status_code >= 400:
        raise RuntimeError(
            f"Cloudinary upload error {response.status_code}: "
            f"{response.text[:200]}"
        )
    payload = response.json()
    secure_url = payload.get("secure_url")
    if not secure_url:
        raise RuntimeError("Cloudinary n'a pas renvoyé d'URL sécurisée")
    return {
        "image_url": secure_url,
        "public_id": payload.get("public_id") or f"{folder}/{public_id}",
        "folder": folder,
        "width": payload.get("width"),
        "height": payload.get("height"),
        "format": payload.get("format"),
    }
