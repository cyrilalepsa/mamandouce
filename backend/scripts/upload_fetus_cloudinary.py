#!/usr/bin/env python3
"""
Upload des assets fœtus locaux vers Cloudinary (NeriaCorp).

Prérequis env (jamais côté client) :
  CLOUDINARY_CLOUD_NAME
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET
  CLOUDINARY_FETUS_FOLDER  (défaut: mamandouce/fetus)

Usage (depuis backend/) :
  python scripts/upload_fetus_cloudinary.py
  python scripts/upload_fetus_cloudinary.py --dry-run

Les public_ids générés correspondent à ce que lit frontend/src/utils/fetusAssets.js
(ex: mamandouce/fetus/week-04) avec transforms f_auto,q_auto côté lecture.
"""
from __future__ import annotations

import argparse
import hashlib
import hmac
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

FETUS_DIR = ROOT.parent / "frontend" / "public" / "assets" / "fetus"
DEFAULT_FOLDER = "mamandouce/fetus"


def _sign(params: dict, api_secret: str) -> str:
    to_sign = "&".join(f"{k}={params[k]}" for k in sorted(params) if k != "file")
    return hmac.new(
        api_secret.encode("utf-8"),
        to_sign.encode("utf-8"),
        hashlib.sha1,
    ).hexdigest()


def upload_file(
    path: Path,
    *,
    cloud: str,
    api_key: str,
    api_secret: str,
    folder: str,
    dry_run: bool,
) -> None:
    # public_id court + folder → mamandouce/fetus/week-04 (aligné fetusAssets.js)
    asset_id = path.stem
    full_id = f"{folder.rstrip('/')}/{asset_id}"
    if dry_run:
        print(f"[dry-run] {path.name} → {full_id}")
        return

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
        return
    secure = resp.json().get("secure_url")
    print(f"OK   {path.name} → {secure}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload fetus assets to Cloudinary")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    cloud = os.environ.get("CLOUDINARY_CLOUD_NAME", "").strip()
    api_key = os.environ.get("CLOUDINARY_API_KEY", "").strip()
    api_secret = os.environ.get("CLOUDINARY_API_SECRET", "").strip()
    folder = os.environ.get("CLOUDINARY_FETUS_FOLDER", DEFAULT_FOLDER).strip()

    if not args.dry_run and not (cloud and api_key and api_secret):
        print(
            "Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET"
        )
        return 1

    if not FETUS_DIR.is_dir():
        print(f"Assets dir not found: {FETUS_DIR}")
        return 1

    files = sorted(
        [
            p
            for p in FETUS_DIR.iterdir()
            if p.is_file()
            and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
            and p.name.lower().startswith("week-")
        ]
    )
    if not files:
        print(f"No week-* images in {FETUS_DIR}")
        return 1

    print(f"Uploading {len(files)} files to folder '{folder}' …")
    for path in files:
        upload_file(
            path,
            cloud=cloud or "dry",
            api_key=api_key or "",
            api_secret=api_secret or "",
            folder=folder,
            dry_run=args.dry_run,
        )
    print("Done.")
    print(
        "Then set frontend VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_FETUS_FOLDER "
        f"({folder}) and rebuild."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
