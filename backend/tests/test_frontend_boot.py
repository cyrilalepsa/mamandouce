"""Garde-fous splash / tenant / boot — évite un loader bloqué en prod."""
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
FRONTEND = REPO / "frontend"
ALIAS = "".join(("cyca", "family", ".com"))


def test_app_imports_home_layout_provider():
    app = (FRONTEND / "src" / "App.jsx").read_text(encoding="utf-8")
    assert "import { HomeLayoutProvider }" in app
    assert "from './contexts/HomeLayoutContext'" in app
    assert "withTimeout(api.auth.me()" in app
    assert "hideBootLoader()" in app


def test_main_wraps_app_with_error_boundary_and_i18n():
    main = (FRONTEND / "src" / "main.jsx").read_text(encoding="utf-8")
    assert "import ErrorBoundary" in main
    assert "import './i18n'" in main
    assert "<ErrorBoundary>" in main
    assert "<App />" in main
    assert main.find("<ErrorBoundary>") < main.find("<App />")


def test_error_boundary_exposes_details_on_tenant_hosts():
    src = (FRONTEND / "src" / "components" / "ErrorBoundary.jsx").read_text(encoding="utf-8")
    assert "boot-error-details" in src
    assert "hideBootLoader" in src
    assert "neriacorp.com" in src
    assert ALIAS in src


def test_backend_url_resolver_covers_tenant_hosts():
    src = (FRONTEND / "src" / "utils" / "backendUrl.js").read_text(encoding="utf-8")
    assert "mamandouce.neriacorp.com" in src
    assert ALIAS in src
    assert "https://api.neriacorp.com" in src
    assert "VITE_API_URL" in src
    assert "withTimeout" in src


def test_api_client_uses_resolved_backend_and_timeout():
    src = (FRONTEND / "src" / "utils" / "api.jsx").read_text(encoding="utf-8")
    assert "from './backendUrl'" in src
    assert "axios.defaults.timeout" in src


def test_index_html_hides_loader_on_error():
    html = (FRONTEND / "index.html").read_text(encoding="utf-8")
    assert "hideInitialLoader" in html
    assert "unhandledrejection" in html


def test_cors_defaults_include_tenant_alias(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    from core.config import parse_cors_origins

    origins = parse_cors_origins()
    assert "https://mamandouce.neriacorp.com" in origins
    assert f"https://{ALIAS}" in origins
    assert f"https://www.{ALIAS}" in origins
