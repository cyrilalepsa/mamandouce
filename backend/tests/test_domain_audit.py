"""Audit migration domaine NeriaCorp : CORS, emails, OpenGraph, zéro ancien host."""
import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_INDEX = REPO_ROOT / "frontend" / "index.html"

# Construit dynamiquement pour que ce fichier ne contienne pas les chaînes interdites.
_ALIAS_HOST = "".join(("cyca", "family", ".com"))
_FORBIDDEN_HOSTS = (
    "".join(("e", "mer", "gent", "agent", ".com")),
)
# Alias historique autorisé uniquement comme hostname tenant / CORS (pas d'email).
_ALIAS_ALLOWED_PATHS = {
    "backend/core/config.py",
    "frontend/src/utils/backendUrl.js",
    "frontend/src/components/ErrorBoundary.jsx",
    "frontend/.env.example",
    "backend/tests/test_domain_audit.py",
    "backend/tests/test_frontend_boot.py",
    "backend/tests/test_scanner_routes_unit.py",
}
_FORBIDDEN_VENDOR = (
    "".join(("e", "mer", "gent", "integrations")),
    "".join(("EME", "RGENT", "_LLM_KEY")),
    "".join(("e", "mer", "gent", ".sh")),
    "".join(("@", "e", "mer", "gent", "base")),
)

_SKIP_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "build",
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
        rel = str(path.relative_to(REPO_ROOT)).replace("\\", "/")
        for host in _FORBIDDEN_HOSTS:
            if host in lowered:
                hits.append(f"{rel}: {host}")
        if _ALIAS_HOST in lowered:
            if f"@{_ALIAS_HOST}" in lowered:
                hits.append(f"{rel}: email @{_ALIAS_HOST}")
            elif rel not in _ALIAS_ALLOWED_PATHS:
                hits.append(f"{rel}: alias hors allowlist tenant/CORS")
    assert hits == [], "Anciens domaines encore présents :\n" + "\n".join(hits)


def test_repo_has_zero_legacy_vendor_tokens():
    hits: list[str] = []
    for path in _iter_repo_text_files():
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        lowered = text.lower()
        for token in _FORBIDDEN_VENDOR:
            if token.lower() in lowered:
                rel = path.relative_to(REPO_ROOT)
                hits.append(f"{rel}: {token}")
    assert hits == [], "Dépendances vendor legacy encore présentes :\n" + "\n".join(hits)


def test_pythonpath_is_clean():
    files = [
        REPO_ROOT / "backend" / "Procfile",
        REPO_ROOT / "backend" / "railway.json",
        REPO_ROOT / "backend" / ".env.example",
    ]
    legacy_path = ":" + "".join(("e", "mer", "gent", "integrations"))
    for path in files:
        text = path.read_text(encoding="utf-8")
        assert legacy_path not in text
        assert "PYTHONPATH=." in text


def test_llm_key_reads_only_openai(monkeypatch):
    legacy = "".join(("EME", "RGENT", "_LLM_KEY"))
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv(legacy, "should-never-be-used")
    from core.config import load_settings
    import core.config as cfg
    from services.llm import get_llm_api_key

    load_settings()
    assert cfg.OPENAI_API_KEY == ""
    assert get_llm_api_key() is None
    assert legacy not in (REPO_ROOT / "backend" / "core" / "config.py").read_text(encoding="utf-8")
    assert legacy not in (REPO_ROOT / "backend" / "services" / "llm.py").read_text(encoding="utf-8")


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


def test_app_public_url_ignores_localhost_frontend_url(monkeypatch):
    monkeypatch.setenv("FRONTEND_URL", "http://localhost:5173")
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
