"""Scanner IA backend tests + birth_list_contribution regression"""
import os
import base64
import io
import pytest
import requests
from PIL import Image, ImageDraw, ImageFont

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"


def _make_menu_image_b64() -> str:
    """Make a real JPEG image with menu-like text content."""
    img = Image.new("RGB", (800, 600), (252, 245, 230))
    d = ImageDraw.Draw(img)
    # decorative rectangles for texture/edges
    d.rectangle([20, 20, 780, 580], outline=(80, 50, 40), width=4)
    d.rectangle([40, 40, 760, 90], fill=(180, 60, 60))
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    except Exception:
        font = ImageFont.load_default()
        small = ImageFont.load_default()
    d.text((60, 50), "MENU DU JOUR", fill=(255, 255, 255), font=font)
    d.text((60, 130), "ENTREES", fill=(120, 40, 30), font=font)
    d.text((60, 180), "Salade Cesar ......... 8,50 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 215), "Soupe a l'oignon ..... 7,00 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 270), "PLATS", fill=(120, 40, 30), font=font)
    d.text((60, 320), "Steak frites ......... 16,00 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 355), "Poulet roti .......... 14,50 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 410), "DESSERTS", fill=(120, 40, 30), font=font)
    d.text((60, 460), "Tarte aux pommes ..... 6,00 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 495), "Mousse chocolat ...... 5,50 EUR", fill=(40, 40, 40), font=small)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def _make_invoice_image_b64() -> str:
    img = Image.new("RGB", (800, 600), (255, 255, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([10, 10, 790, 590], outline=(0, 0, 0), width=2)
    try:
        f1 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
        f2 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    except Exception:
        f1 = ImageFont.load_default()
        f2 = f1
    d.text((40, 30), "FACTURE No 2026-001", fill=(0, 0, 0), font=f1)
    d.text((40, 75), "Fournisseur : Pharmacie Centrale", fill=(0, 0, 0), font=f2)
    d.text((40, 105), "Date : 2026-01-15", fill=(0, 0, 0), font=f2)
    d.text((40, 160), "Article                      Qte   PU HT   TVA", fill=(0, 0, 0), font=f2)
    d.line([(40, 190), (760, 190)], fill=(0, 0, 0), width=1)
    d.text((40, 200), "Vitamine D3                   1   12,50   5,5%", fill=(0, 0, 0), font=f2)
    d.text((40, 230), "Acide folique                 2    8,00   5,5%", fill=(0, 0, 0), font=f2)
    d.text((40, 260), "Magnesium                     1   15,90   5,5%", fill=(0, 0, 0), font=f2)
    d.text((40, 340), "Total HT  : 44,40 EUR", fill=(0, 0, 0), font=f2)
    d.text((40, 370), "TVA       : 2,44 EUR", fill=(0, 0, 0), font=f2)
    d.text((40, 400), "Total TTC : 46,84 EUR", fill=(0, 0, 0), font=f1)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode("ascii")


@pytest.fixture(scope="session")
def auth_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    tok = data.get("token") or data.get("access_token")
    assert tok, f"No token in login response: {data}"
    return tok


@pytest.fixture(scope="session")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ---------- Scanner IA ----------
class TestScannerCategories:
    def test_list_categories(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/scanner/categories", headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        cats = {c["id"] for c in body["categories"]}
        expected = {"alimentation", "textile", "auto", "documents", "menu", "facture", "admin", "product"}
        assert expected.issubset(cats), f"missing categories: {expected - cats}"


class TestScannerAnalyze:
    def test_missing_image_400(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/scanner/analyze-document",
                          headers=auth_headers,
                          json={"image_base64": "", "category": "menu"}, timeout=30)
        assert r.status_code == 400, r.text

    def test_invalid_category_400(self, auth_headers):
        b64 = _make_menu_image_b64()
        r = requests.post(f"{BASE_URL}/api/scanner/analyze-document",
                          headers=auth_headers,
                          json={"image_base64": b64, "category": "not_a_category"}, timeout=30)
        assert r.status_code == 400, r.text

    def test_analyze_menu_returns_items(self, auth_headers):
        b64 = _make_menu_image_b64()
        r = requests.post(f"{BASE_URL}/api/scanner/analyze-document",
                          headers=auth_headers,
                          json={"image_base64": b64, "category": "menu"}, timeout=90)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["category"] == "menu"
        assert "data" in body
        assert "items" in body["data"], f"items key missing: {body}"
        items = body["data"]["items"]
        assert isinstance(items, list)
        assert len(items) >= 1
        # at least one item should have a plat name
        plat_keys = {"nom_du_plat", "prix", "categorie"}
        for it in items:
            assert plat_keys.issuperset(set(it.keys())) or plat_keys & set(it.keys())
        assert 0 <= body["confidence"] <= 1

    def test_analyze_facture_returns_structure(self, auth_headers):
        b64 = _make_invoice_image_b64()
        r = requests.post(f"{BASE_URL}/api/scanner/analyze-document",
                          headers=auth_headers,
                          json={"image_base64": b64, "category": "facture"}, timeout=90)
        assert r.status_code == 200, r.text
        body = r.json()
        d = body["data"]
        # presence of canonical keys
        for key in ("fournisseur", "date", "articles", "total_ttc"):
            assert key in d, f"missing key {key} in {d.keys()}"
        assert isinstance(d["articles"], list)


class TestScannerHistory:
    def test_history_endpoint(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/scanner/history?limit=5", headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "scans" in body
        assert isinstance(body["scans"], list)


# ---------- Regression iteration 55 ----------
class TestContributionRegression:
    def test_submit_birth_list_item_contribution(self, auth_headers):
        payload = {
            "contribution_type": "birth_list_item",
            "title": "TEST_Body coton bio 3 mois",
            "data": {
                "category": "Vêtements",
                "name": "TEST_Body coton bio 3 mois",
                "essential": False,
                "notes": "test regression iteration 57",
            },
        }
        r = requests.post(f"{BASE_URL}/api/contributions/submit",
                          headers=auth_headers, json=payload, timeout=20)
        assert r.status_code in (200, 201), r.text
