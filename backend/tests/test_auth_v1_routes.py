"""Les routes auth frontend /api/v1/auth/* existent côté FastAPI."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from server import app

REQUIRED_V1 = (
    ("POST", "/api/v1/auth/login"),
    ("POST", "/api/v1/auth/register"),
    ("POST", "/api/v1/auth/forgot-password"),
    ("GET", "/api/v1/auth/me"),
    ("POST", "/api/v1/auth/verify-reset-token"),
    ("POST", "/api/v1/auth/reset-password"),
    ("GET", "/api/v1/auth/2fa/status"),
)


def _route_index():
    index = []
    for route in app.routes:
        path = getattr(route, "path", "") or ""
        methods = set(getattr(route, "methods", None) or [])
        index.append((path, methods))
    return index


def test_v1_auth_aliases_match_frontend_module():
    routes = _route_index()
    for method, path in REQUIRED_V1:
        assert any(
            path == registered and method in methods for registered, methods in routes
        ), f"missing {method} {path}"


def test_legacy_api_auth_still_registered():
    routes = _route_index()
    for method, path in (
        ("POST", "/api/auth/login"),
        ("POST", "/api/auth/register"),
        ("POST", "/api/auth/forgot-password"),
    ):
        assert any(
            path == registered and method in methods for registered, methods in routes
        ), f"missing legacy {method} {path}"
