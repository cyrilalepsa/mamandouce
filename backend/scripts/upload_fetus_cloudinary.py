#!/usr/bin/env python3
"""
Upload des assets fœtus locaux vers Cloudinary (NeriaCorp).

Prêt à l'emploi dès injection des identifiants :
  CLOUDINARY_CLOUD_NAME
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET
  CLOUDINARY_FETUS_FOLDER  (défaut: mamandouce/fetus)

Usage (depuis backend/) :
  python scripts/upload_fetus_cloudinary.py --dry-run
  python scripts/upload_fetus_cloudinary.py

Les public_ids (ex. mamandouce/fetus/week-04) correspondent à
frontend/src/utils/fetusAssets.js — livraison
https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto/{folder}/{id}
"""
from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import re
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

from core.config import (
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_FETUS_FOLDER,
)

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

ASSETS_DIR = ROOT.parent / "frontend" / "public" / "assets"
FETUS_DIR = ASSETS_DIR / "fetus"
DEFAULT_FOLDER = "mamandouce/fetus"
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp"}
SUFFIX_RANK = {".png": 0, ".webp": 1, ".jpg": 2, ".jpeg": 3}


def _sign(params: dict, api_secret: str) -> str:
    to_sign = "&".join(f"{k}={params[k]}" for k in sorted(params) if k != "file")
    return hmac.new(
        api_secret.encode("utf-8"),
        to_sign.encode("utf-8"),
        hashlib.sha1,
    ).hexdigest()


def _slug(stem: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", stem).strip("-").lower()
    return slug


def collect_files() -> list[tuple[str, Path]]:
    """Images fetus/ + bebe-foetus.* — un fichier par public_id (png prioritaire)."""
    candidates: list[Path] = []
    if FETUS_DIR.is_dir():
        candidates.extend(
            p
            for p in FETUS_DIR.iterdir()
            if p.is_file() and p.suffix.lower() in IMAGE_EXT
        )
    for extra in ("bebe-foetus.png", "bebe-foetus.jpg"):
        path = ASSETS_DIR / extra
        if path.is_file():
            candidates.append(path)

    by_id: dict[str, Path] = {}
    for path in candidates:
        public_id = _slug(path.stem)
        if not public_id or public_id in {"week", "week-"}:
            continue
        prev = by_id.get(public_id)
        if prev is None or SUFFIX_RANK.get(path.suffix.lower(), 9) < SUFFIX_RANK.get(
            prev.suffix.lower(), 9
        ):
            by_id[public_id] = path
    return sorted(by_id.items(), key=lambda item: item[0])


def upload_file(
    path: Path,
    *,
    asset_id: str,
    cloud: str,
    api_key: str,
    api_secret: str,
    folder: str,
    dry_run: bool,
) -> str | None:
    full_id = f"{folder.rstrip('/')}/{asset_id}"
    if dry_run:
        print(f"[dry-run] {path.name} → {full_id}")
        return full_id

    timestamp = int(time.time())
    sign_params = {
        "folder": folder,
        "overwrite": "true",
        "public_id": asset_id,
        "timestamp": timestamp,
    }
    signature = _sign(sign_params, api_secret)

    with path.open("rb") as fh:
        resp = requests.post(
            f"https://api.cloudinary.com/v1_1/{cloud}/image/upload",
            data={
                "api_key": api_key,
                "timestamp": timestamp,
                "public_id": asset_id,
                "folder": folder,
                "overwrite": "true",
                "signature": signature,
            },
            files={"file": fh},
            timeout=60,
        )
    if resp.status_code >= 400:
        print(f"FAIL {path.name}: {resp.status_code} {resp.text[:300]}")
        return None
    secure = resp.json().get("secure_url")
    print(f"OK   {path.name} → {secure}")
    return secure


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload fetus assets to Cloudinary")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    # Nomenclature prod — mêmes variables que core.config / Railway
    cloud = os.environ.get("CLOUDINARY_CLOUD_NAME") or CLOUDINARY_CLOUD_NAME
    api_key = os.environ.get("CLOUDINARY_API_KEY") or CLOUDINARY_API_KEY
    api_secret = os.environ.get("CLOUDINARY_API_SECRET") or CLOUDINARY_API_SECRET
    folder = (os.environ.get("CLOUDINARY_FETUS_FOLDER") or CLOUDINARY_FETUS_FOLDER or DEFAULT_FOLDER).strip()

    if not args.dry_run and not (cloud and api_key and api_secret):
        print(
            "Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET"
        )
        print("Inject the credentials then re-run. Dry-run is available without secrets:")
        print("  python scripts/upload_fetus_cloudinary.py --dry-run")
        return 1

    files = collect_files()
    if not files:
        print(f"No images found in {FETUS_DIR}")
        return 1

    print(f"Uploading {len(files)} unique assets to folder '{folder}' …")
    uploaded = []
    for asset_id, path in files:
        result = upload_file(
            path,
            asset_id=asset_id,
            cloud=cloud or "dry",
            api_key=api_key or "",
            api_secret=api_secret or "",
            folder=folder,
            dry_run=args.dry_run,
        )
        if result:
            uploaded.append({"public_id": f"{folder}/{asset_id}", "source": path.name})

    print("Done.")
    print(json.dumps({"count": len(uploaded), "folder": folder, "assets": uploaded}, indent=2))
    print(
        "Then set CLOUDINARY_CLOUD_NAME (server) and/or VITE_CLOUDINARY_CLOUD_NAME, "
        "rebuild optional — GET /api/neriacorp/media hydrate the frontend at runtime."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
