"""Audit migration domaine NeriaCorp : CORS, emails, OpenGraph, zéro ancien host."""
import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_INDEX = REPO_ROOT / "frontend" / "index.html"

# Construit dynamiquement pour que ce fichier ne contienne pas les chaînes interdites.
_FORBIDDEN_HOSTS = (
    "".join(("cyca", "family", ".com")),
    "".join(("emergent", "agent", ".com")),
)

_SKIP_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "build",
    "test_reports",
    ".pytest_cache",
    ".cursor",
    "coverage",
}

_SKIP_FILES = {
    "billing_alerts.log",
}

_TEXT_SUFFIXES = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".html",
    ".md",
    ".txt",
    ".xml",
    ".yml",
    ".yaml",
    ".env",
    ".example",
    ".css",
    ".scss",
    ".svg",
    ".toml",
    ".ini",
    ".cfg",
    ".sh",
    ".sql",
}


def _iter_repo_text_files():
    for path in REPO_ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in _SKIP_DIRS for part in path.parts):
            continue
        if path.name in _SKIP_FILES:
            continue
        if path.suffix and path.suffix.lower() not in _TEXT_SUFFIXES and path.name != ".env":
            continue
        yield path


def test_repo_has_zero_legacy_domain_occurrences():
    hits: list[str] = []
    for path in _iter_repo_text_files():
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        lowered = text.lower()
        for host in _FORBIDDEN_HOSTS:
            if host in lowered:
                rel = path.relative_to(REPO_ROOT)
                hits.append(f"{rel}: {host}")
    assert hits == [], "Anciens domaines encore présents :\n" + "\n".join(hits)


def test_email_brand_footer_mentions_neriacorp():
    from core.config import email_brand_footer

    footer = email_brand_footer()
    assert "MamanDouce • neriacorp.com" in footer
    assert footer.startswith("<p")


def test_app_public_url_prefers_frontend_url(monkeypatch):
    monkeypatch.setenv("FRONTEND_URL", "https://mamandouce.neriacorp.com/")
    monkeypatch.delenv("PUBLIC_APP_URL", raising=False)
    from core.config import app_public_url

    assert app_public_url() == "https://mamandouce.neriacorp.com"


def test_app_public_url_falls_back_to_public_app_url(monkeypatch):
    monkeypatch.delenv("FRONTEND_URL", raising=False)
    monkeypatch.setenv("PUBLIC_APP_URL", "https://mamandouce.neriacorp.com/")
    from core.config import app_public_url

    assert app_public_url() == "https://mamandouce.neriacorp.com"


def test_app_public_url_default_is_mamandouce_neriacorp(monkeypatch):
    monkeypatch.delenv("FRONTEND_URL", raising=False)
    monkeypatch.delenv("PUBLIC_APP_URL", raising=False)
    from core.config import app_public_url

    assert app_public_url() == "https://mamandouce.neriacorp.com"


def test_cors_default_origins_include_neriacorp_hosts(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    monkeypatch.delenv("FRONTEND_URL", raising=False)
    monkeypatch.delenv("PUBLIC_APP_URL", raising=False)
    from core.config import parse_cors_origins

    origins = parse_cors_origins()
    required = (
        "https://mamandouce.neriacorp.com",
        "https://www.mamandouce.neriacorp.com",
        "https://neriacorp.com",
    )
    for origin in required:
        assert origin in origins
    assert len(origins) == len(set(origins))
    assert all(not origin.endswith("/") for origin in origins)


def test_cors_merges_env_urls_without_duplicates_or_trailing_slash(monkeypatch):
    monkeypatch.setenv(
        "CORS_ORIGINS",
        "https://mamandouce.neriacorp.com/,https://extra.example/",
    )
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://extra.example")
    monkeypatch.setenv("FRONTEND_URL", "https://mamandouce.neriacorp.com/")
    monkeypatch.setenv("PUBLIC_APP_URL", "https://neriacorp.com/")
    from core.config import parse_cors_origins

    origins = parse_cors_origins()
    assert origins.count("https://mamandouce.neriacorp.com") == 1
    assert origins.count("https://extra.example") == 1
    assert origins.count("https://neriacorp.com") == 1
    assert all(not origin.endswith("/") for origin in origins)


def test_index_html_canonical_and_opengraph_point_to_neriacorp():
    html = FRONTEND_INDEX.read_text(encoding="utf-8")
    assert 'rel="canonical" href="https://mamandouce.neriacorp.com/"' in html
    assert 'property="og:url" content="https://mamandouce.neriacorp.com/"' in html
    assert (
        'property="og:image" content="https://mamandouce.neriacorp.com/app-icon-512.png"'
        in html
    )
    assert 'name="twitter:url" content="https://mamandouce.neriacorp.com/"' in html
    assert (
        'name="twitter:image" content="https://mamandouce.neriacorp.com/app-icon-512.png"'
        in html
    )


def test_email_templates_use_dynamic_public_url_and_brand_footer():
    files = [
        REPO_ROOT / "backend" / "routes" / "auth.py",
        REPO_ROOT / "backend" / "routes" / "medical.py",
        REPO_ROOT / "backend" / "routes" / "admin.py",
        REPO_ROOT / "backend" / "core" / "scheduler.py",
        REPO_ROOT / "backend" / "services" / "guardian_agent.py",
    ]
    for path in files:
        text = path.read_text(encoding="utf-8")
        assert "email_brand_footer" in text, f"pied de page manquant dans {path.name}"
        if path.name != "guardian_agent.py":
            assert "app_public_url" in text, f"URL publique manquante dans {path.name}"
    auth = (REPO_ROOT / "backend" / "routes" / "auth.py").read_text(encoding="utf-8")
    assert "/reset-password?token=" in auth
    assert "frontend_url = app_public_url()" in auth
