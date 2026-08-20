"""Locate the Vite SPA build so FastAPI can serve /api and the UI together."""
from __future__ import annotations

import os
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent


def frontend_dir_candidates(root: Path | None = None, environ: dict | None = None) -> list[Path]:
    """Ordered search paths for dist/index.html (env first)."""
    root = Path(root) if root is not None else BACKEND_ROOT
    env = environ if environ is not None else os.environ
    extra: list[Path] = []
    configured = str(env.get("FRONTEND_DIR") or "").strip()
    if configured:
        extra.append(Path(configured))
    return extra + [
        root / "dist",
        root / "build",
        root / "static",
        root / "frontend_dist",
        root / "client" / "build",
        root.parent / "frontend" / "dist",
        Path("/app/frontend/dist"),
        Path("/app/dist"),
    ]


def discover_frontend_dir(root: Path | None = None, environ: dict | None = None) -> Path | None:
    """Return the first candidate that contains index.html, else None."""
    seen: set[str] = set()
    for candidate in frontend_dir_candidates(root=root, environ=environ):
        try:
            resolved = candidate.resolve()
        except OSError:
            continue
        key = str(resolved)
        if key in seen:
            continue
        seen.add(key)
        if resolved.is_dir() and (resolved / "index.html").is_file():
            return resolved
    return None
