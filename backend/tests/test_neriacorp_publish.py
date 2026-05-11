"""NeriaCorp Publish (plug-and-play) tests — v10.8
Tests for:
  - GET  /api/scanner/apps        (configured flag)
  - POST /api/scanner/publish     (mock-fallback, live, retry-then-fallback, invalid app)
  - GET  /api/scanner/publications (status, partial, remote_id, configured fields)

Live test strategy:
  Spins a tiny stdlib http.server on 127.0.0.1:7890 INSIDE this pytest process,
  then writes AEVIS_BASE_URL + AEVIS_API_KEY into /app/backend/.env and restarts
  supervisord backend so the FastAPI worker reloads the env. Teardown restores
  the original .env and restarts again.

Unreachable test strategy:
  Sets HERITIA_BASE_URL to http://127.0.0.1:1 (no listener) + HERITIA_API_KEY,
  verifies that after 2 retries the adapter falls back to published_mock + partial.
"""
import os
import json
import time
import shutil
import socket
import threading
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL", "https://nacre-glossy-ui.preview.emergentagent.com"
).rstrip("/")
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"
NON_ADMIN_EMAIL = "testnonadmin58@test.com"
NON_ADMIN_PASSWORD = "test123"

BACKEND_ENV_PATH = "/app/backend/.env"
MOCK_PORT = 7890
MOCK_HOST = "127.0.0.1"

# ---- Mock state captured by the HTTP handler ----
MOCK_STATE = {"last_headers": {}, "last_body": None, "calls": 0}


class MockInjectHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        MOCK_STATE["calls"] += 1
        MOCK_STATE["last_headers"] = dict(self.headers.items())
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""
        try:
            MOCK_STATE["last_body"] = json.loads(raw.decode("utf-8"))
        except Exception:
            MOCK_STATE["last_body"] = None
        if self.path.endswith("/api/neriacorp/inject"):
            resp = {"id": "AEV-REMOTE-12345", "status": "ok"}
            data = json.dumps(resp).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, *a, **kw):  # silence
        pass


def _start_mock_server():
    srv = HTTPServer((MOCK_HOST, MOCK_PORT), MockInjectHandler)
    th = threading.Thread(target=srv.serve_forever, daemon=True)
    th.start()
    return srv


def _stop_mock_server(srv):
    try:
        srv.shutdown()
        srv.server_close()
    except Exception:
        pass


def _login(email, password):
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": email, "password": password},
        timeout=20,
    )
    assert r.status_code == 200, f"Login failed {email}: {r.status_code} {r.text}"
    data = r.json()
    return data.get("token") or data.get("access_token")


@pytest.fixture(scope="session")
def admin_headers():
    tok = _login(ADMIN_EMAIL, ADMIN_PASSWORD)
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def non_admin_headers():
    try:
        tok = _login(NON_ADMIN_EMAIL, NON_ADMIN_PASSWORD)
    except AssertionError:
        rr = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": NON_ADMIN_EMAIL,
                "password": NON_ADMIN_PASSWORD,
                "name": "Test NonAdmin",
            },
            timeout=20,
        )
        assert rr.status_code in (200, 201), rr.text
        d = rr.json()
        tok = d.get("token") or d.get("access_token")
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


def _restart_backend():
    subprocess.run(
        ["sudo", "supervisorctl", "restart", "backend"],
        check=False, capture_output=True, timeout=30,
    )
    # wait for it to come back
    deadline = time.time() + 45
    while time.time() < deadline:
        try:
            r = requests.get(f"{BASE_URL}/api/", timeout=3)
            if r.status_code < 500:
                time.sleep(1.5)  # extra grace
                return
        except Exception:
            pass
        time.sleep(1)
    pytest.fail("backend did not restart in time")


def _read_env():
    with open(BACKEND_ENV_PATH, "r") as f:
        return f.read()


def _write_env(content):
    with open(BACKEND_ENV_PATH, "w") as f:
        f.write(content)


@pytest.fixture(scope="session")
def env_backup():
    """Backup .env at the start and restore at the end (single restart on teardown)."""
    original = _read_env()
    yield original
    _write_env(original)
    _restart_backend()


# ============================================================
# 1) GET /api/scanner/apps → configured flag present and False by default
# ============================================================
class TestAppsConfiguredFlag:
    def test_apps_returns_configured_flag(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/scanner/apps", headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        apps = r.json()["apps"]
        assert len(apps) == 5
        for a in apps:
            assert "configured" in a, f"missing configured flag on {a['name']}"
            assert isinstance(a["configured"], bool)


# ============================================================
# 2) Unconfigured publish → published_mock + partial + warning
# ============================================================
class TestPublishUnconfigured:
    def test_publish_unconfigured_returns_mock(self, admin_headers):
        # Aevis must be unconfigured at baseline (no AEVIS_* in .env)
        body = {
            "target_app": "Aevis",
            "scan_id": "scan-test-001",
            "payload": {"business": {"pos_items": []}, "display_card": {"title": "x"}},
        }
        r = requests.post(
            f"{BASE_URL}/api/scanner/publish",
            headers=admin_headers, json=body, timeout=20,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "published_mock"
        assert data["partial"] is True
        assert data["configured"] is False
        assert data["target_app"] == "Aevis"
        assert data["remote_id"] is None
        # warning must mention env var names
        warn = (data.get("warning") or "").upper()
        assert "AEVIS_BASE_URL" in warn or "AEVIS_API_KEY" in warn, data

    def test_publish_invalid_app_400(self, admin_headers):
        body = {"target_app": "NotARealApp", "payload": {}}
        r = requests.post(
            f"{BASE_URL}/api/scanner/publish",
            headers=admin_headers, json=body, timeout=15,
        )
        assert r.status_code == 400, f"got {r.status_code}: {r.text}"
        assert "App inconnue" in r.text or "inconnue" in r.text.lower()

    def test_publish_non_admin_403(self, non_admin_headers):
        body = {"target_app": "Aevis", "payload": {}}
        r = requests.post(
            f"{BASE_URL}/api/scanner/publish",
            headers=non_admin_headers, json=body, timeout=15,
        )
        assert r.status_code == 403


# ============================================================
# 3) Live publish via mock HTTP server
# ============================================================
class TestPublishLive:
    def test_publish_live_with_mock_server(self, admin_headers, env_backup):
        # 1) Start in-process mock server
        srv = _start_mock_server()
        MOCK_STATE["calls"] = 0
        try:
            # 2) Write env vars and restart backend
            new_env = (
                env_backup.rstrip()
                + f"\nAEVIS_BASE_URL=http://{MOCK_HOST}:{MOCK_PORT}"
                + "\nAEVIS_API_KEY=test-secret-key-123\n"
            )
            _write_env(new_env)
            _restart_backend()

            # 3) Re-login (backend was restarted, but JWT still valid)
            hdr = admin_headers

            # 3.a) /apps must show Aevis configured=True
            r_apps = requests.get(f"{BASE_URL}/api/scanner/apps", headers=hdr, timeout=15)
            assert r_apps.status_code == 200, r_apps.text
            apps_by = {a["name"]: a for a in r_apps.json()["apps"]}
            assert apps_by["Aevis"]["configured"] is True

            # 3.b) Publish → live
            body = {
                "target_app": "Aevis",
                "scan_id": "scan-live-001",
                "payload": {"business": {"pos_items": [{"name": "Café", "price": 2.5}]},
                            "display_card": {"title": "Live test"}},
            }
            r = requests.post(
                f"{BASE_URL}/api/scanner/publish",
                headers=hdr, json=body, timeout=30,
            )
            assert r.status_code == 200, r.text
            data = r.json()
            assert data["status"] == "published_live", data
            assert data["partial"] is False
            assert data["configured"] is True
            assert data["remote_id"] == "AEV-REMOTE-12345"

            # 3.c) Mock server received correct headers
            assert MOCK_STATE["calls"] >= 1
            h = {k.lower(): v for k, v in MOCK_STATE["last_headers"].items()}
            assert h.get("authorization") == "Bearer test-secret-key-123", h
            assert "x-neriacorp-publication-id" in h
            assert h.get("x-neriacorp-admin", "").lower() == ADMIN_EMAIL.lower()
            assert h.get("content-type", "").startswith("application/json")
            body_seen = MOCK_STATE["last_body"]
            assert body_seen and body_seen.get("publication_id") == data["publication_id"]
            assert body_seen.get("scan_id") == "scan-live-001"
        finally:
            _stop_mock_server(srv)
            # env restored via env_backup teardown


# ============================================================
# 4) Configured but unreachable → 2 retries → fallback mock
# ============================================================
class TestPublishUnreachableFallback:
    def test_publish_unreachable_url_falls_back_after_retries(self, admin_headers, env_backup):
        # Use Heritia with a closed port. Backend will retry 3 attempts total
        # (initial + 2 retries) with 0.5s + 1.0s backoff.
        new_env = (
            env_backup.rstrip()
            + "\nHERITIA_BASE_URL=http://127.0.0.1:1"
            + "\nHERITIA_API_KEY=will-fail\n"
        )
        _write_env(new_env)
        _restart_backend()

        body = {
            "target_app": "Heritia",
            "scan_id": "scan-unreach-001",
            "payload": {"business": {}, "display_card": {}},
        }
        t0 = time.time()
        r = requests.post(
            f"{BASE_URL}/api/scanner/publish",
            headers=admin_headers, json=body, timeout=60,
        )
        elapsed = time.time() - t0
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "published_mock"
        assert data["partial"] is True
        assert data["configured"] is True
        # The warning should mention the retry/network failure
        warn = (data.get("warning") or "").lower()
        assert "network" in warn or "attempts" in warn or "refus" in warn or "connect" in warn, data
        # backoff ≥ 0.5 + 1.0 = 1.5s minimum (allow some slack)
        assert elapsed >= 1.0, f"retry path too fast ({elapsed}s) — backoff may not be applied"


# ============================================================
# 5) GET /api/scanner/publications includes new fields
# ============================================================
class TestPublicationsFields:
    def test_publications_have_new_fields(self, admin_headers):
        r = requests.get(
            f"{BASE_URL}/api/scanner/publications",
            headers=admin_headers, timeout=15,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        pubs = body.get("publications", [])
        assert isinstance(pubs, list)
        # If the earlier tests in this module ran, we'll have at least 1
        if pubs:
            p = pubs[0]
            for k in ("status", "partial", "remote_id", "configured",
                      "publication_id", "target_app", "admin_email"):
                assert k in p, f"missing publications field {k}: {p}"


# ============================================================
# 6) Regression: /api/scanner/apps & /audit still work for admin
# ============================================================
class TestRegression:
    def test_audit_still_works(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/scanner/audit", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        for k in ("scans", "total_count", "total_revenue", "currency", "by_app"):
            assert k in r.json()
