"""Tests for birth_list_item contribution flow."""
import os
import pytest
import requests

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"


@pytest.fixture(scope="module")
def auth_token():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=20,
    )
    assert r.status_code == 200, f"Login failed: {r.status_code} - {r.text}"
    token = r.json().get("access_token") or r.json().get("token")
    assert token, f"No token in response: {r.json()}"
    return token


@pytest.fixture(scope="module")
def headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# 1. birth_list_item should be accepted (200)
def test_submit_birth_list_item_success(headers):
    payload = {
        "contribution_type": "birth_list_item",
        "title": "TEST_Tour de lit cocon",
        "description": "Catégorie : Sommeil",
        "data": {"name": "TEST_Tour de lit cocon", "category": "Sommeil"},
    }
    r = requests.post(f"{BASE_URL}/api/contributions/submit", json=payload, headers=headers, timeout=20)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    body = r.json()
    assert body.get("success") is True
    assert "contribution_id" in body
    pytest.contribution_id = body["contribution_id"]


# 2. Missing title -> 422
def test_submit_missing_title_returns_422(headers):
    payload = {
        "contribution_type": "birth_list_item",
        "description": "no title here",
        "data": {"category": "Sommeil"},
    }
    r = requests.post(f"{BASE_URL}/api/contributions/submit", json=payload, headers=headers, timeout=20)
    assert r.status_code == 422, f"Expected 422 for missing title, got {r.status_code}: {r.text}"


# 3. GET /api/contributions/my returns the submission
def test_get_my_contributions_includes_birth_list(headers):
    r = requests.get(f"{BASE_URL}/api/contributions/my", headers=headers, timeout=20)
    assert r.status_code == 200, f"Status {r.status_code}: {r.text}"
    body = r.json()
    contribs = body.get("contributions", [])
    bl_items = [c for c in contribs if c.get("contribution_type") == "birth_list_item"]
    assert len(bl_items) > 0, "Expected at least 1 birth_list_item contribution"
    titles = [c.get("title") for c in bl_items]
    assert any("TEST_Tour de lit cocon" in (t or "") for t in titles), f"Submitted item not found in my contributions: {titles[:5]}"


# 4. Invalid contribution_type -> 400
def test_submit_invalid_type_returns_400(headers):
    payload = {
        "contribution_type": "invalid_type_xyz",
        "title": "TEST_invalid",
        "description": "x",
        "data": {},
    }
    r = requests.post(f"{BASE_URL}/api/contributions/submit", json=payload, headers=headers, timeout=20)
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
