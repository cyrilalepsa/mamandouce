"""NeriaCorp Intelligence — Scanner IA Admin-Only tests
Tests for /api/scanner/analyze, /api/scanner/audit, /api/scanner/apps
"""
import os
import base64
import io
import pytest
import requests
from PIL import Image, ImageDraw, ImageFont

BASE_URL = (os.environ.get("BACKEND_URL") or os.environ.get("VITE_BACKEND_URL") or os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8000").rstrip("/")
ADMIN_EMAIL = "admin@mamandouce.com"
ADMIN_PASSWORD = "AdminPremium2024!"
NON_ADMIN_EMAIL = "testnonadmin58@test.com"
NON_ADMIN_PASSWORD = "test123"


def _make_menu_image_b64() -> str:
    """JPEG menu image with real text/edges for NeriaCorp (Aevis app)."""
    img = Image.new("RGB", (800, 600), (252, 245, 230))
    d = ImageDraw.Draw(img)
    d.rectangle([20, 20, 780, 580], outline=(80, 50, 40), width=4)
    d.rectangle([40, 40, 760, 90], fill=(180, 60, 60))
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    except Exception:
        font = ImageFont.load_default()
        small = font
    d.text((60, 50), "MENU ROTISSERIE FABRICE", fill=(255, 255, 255), font=font)
    d.text((60, 130), "POULETS ROTIS", fill=(120, 40, 30), font=font)
    d.text((60, 180), "Poulet fermier ........ 12,00 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 215), "Demi poulet ........... 7,50 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 270), "ACCOMPAGNEMENTS", fill=(120, 40, 30), font=font)
    d.text((60, 320), "Pommes de terre ....... 3,50 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 355), "Ratatouille ........... 4,00 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 410), "BOISSONS", fill=(120, 40, 30), font=font)
    d.text((60, 460), "Coca 33cl ............. 2,50 EUR", fill=(40, 40, 40), font=small)
    d.text((60, 495), "Eau 50cl .............. 1,50 EUR", fill=(40, 40, 40), font=small)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def _login(email, password):
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": email, "password": password}, timeout=20)
    assert r.status_code == 200, f"Login failed for {email}: {r.status_code} {r.text}"
    data = r.json()
    return data.get("token") or data.get("access_token")


@pytest.fixture(scope="session")
def admin_token():
    return _login(ADMIN_EMAIL, ADMIN_PASSWORD)


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def non_admin_token():
    # Try login; register if needed
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": NON_ADMIN_EMAIL, "password": NON_ADMIN_PASSWORD}, timeout=20)
    if r.status_code != 200:
        rr = requests.post(f"{BASE_URL}/api/auth/register",
                           json={"email": NON_ADMIN_EMAIL, "password": NON_ADMIN_PASSWORD,
                                 "name": "Test NonAdmin"}, timeout=20)
        assert rr.status_code in (200, 201), f"register failed: {rr.text}"
        data = rr.json()
        return data.get("token") or data.get("access_token")
    data = r.json()
    return data.get("token") or data.get("access_token")


@pytest.fixture(scope="session")
def non_admin_headers(non_admin_token):
    return {"Authorization": f"Bearer {non_admin_token}", "Content-Type": "application/json"}


# ---------- GET /api/scanner/apps ----------
class TestScannerApps:
    def test_apps_admin_returns_5_apps(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/scanner/apps", headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("operation_mode") == "Admin_Only"
        apps = body.get("apps", [])
        assert len(apps) == 5, f"expected 5 apps got {len(apps)}"
        names = {a["name"] for a in apps}
        assert names == {"VisaTrace", "Heritia", "VeoVision", "Vellumia", "Aevis"}
        # validate theme_color + estimated_revenue
        by_name = {a["name"]: a for a in apps}
        assert by_name["VisaTrace"]["theme_color"] == "#1A5CAD"
        assert by_name["VisaTrace"]["estimated_revenue"] == 29.99
        assert by_name["Aevis"]["theme_color"] == "#2E8B57"
        assert by_name["Aevis"]["estimated_revenue"] == 40.0
        assert by_name["Vellumia"]["theme_color"] == "#D4AF37"

    def test_apps_non_admin_403(self, non_admin_headers):
        r = requests.get(f"{BASE_URL}/api/scanner/apps", headers=non_admin_headers, timeout=15)
        assert r.status_code == 403, f"expected 403 got {r.status_code} {r.text}"


# ---------- POST /api/scanner/analyze ----------
class TestScannerAnalyze:
    def test_analyze_no_input_400(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/scanner/analyze",
                          headers=admin_headers, json={}, timeout=30)
        assert r.status_code == 400, r.text

    def test_analyze_non_admin_403(self, non_admin_headers):
        r = requests.post(f"{BASE_URL}/api/scanner/analyze",
                          headers=non_admin_headers,
                          json={"text_input": "test"}, timeout=30)
        assert r.status_code == 403, f"expected 403 got {r.status_code} {r.text}"

    def test_analyze_image_admin_returns_structured(self, admin_headers):
        b64 = _make_menu_image_b64()
        r = requests.post(f"{BASE_URL}/api/scanner/analyze",
                          headers=admin_headers,
                          json={"image_base64": b64}, timeout=120)
        assert r.status_code == 200, r.text
        body = r.json()
        # Mandatory sections
        for key in ("id", "metadata", "business", "display_card", "financial", "created_at"):
            assert key in body, f"missing top-level key {key}"
        md = body["metadata"]
        assert md.get("operation_mode") == "Admin_Only"
        assert md.get("source_app") in ("VisaTrace", "Heritia", "VeoVision", "Vellumia", "Aevis"), md
        cs = md.get("confidence_score")
        assert cs is not None and 0.0 <= float(cs) <= 1.0
        dc = body["display_card"]
        for k in ("title", "summary", "main_action", "theme_color", "visual_type"):
            assert k in dc, f"missing display_card.{k}"
        assert dc["visual_type"] in ("LIST", "GRID", "REPORT")
        assert isinstance(dc["theme_color"], str) and dc["theme_color"].startswith("#")
        fin = body["financial"]
        assert fin.get("currency") == "EUR"
        assert fin.get("estimated_revenue") is not None

    def test_analyze_text_only_admin(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/scanner/analyze",
                          headers=admin_headers,
                          json={"text_input": "Carte café : Espresso 2.50, Cappuccino 3.50, Latte 4.00"},
                          timeout=120)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["metadata"].get("operation_mode") == "Admin_Only"
        assert body["financial"].get("currency") == "EUR"


# ---------- GET /api/scanner/audit ----------
class TestScannerAudit:
    def test_audit_admin_returns_aggregates(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/scanner/audit", headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        for key in ("scans", "total_count", "total_revenue", "currency", "by_app"):
            assert key in body, f"missing audit key {key}"
        assert body["currency"] == "EUR"
        assert isinstance(body["scans"], list)
        assert isinstance(body["by_app"], dict)
        assert isinstance(body["total_count"], int)

    def test_audit_non_admin_403(self, non_admin_headers):
        r = requests.get(f"{BASE_URL}/api/scanner/audit", headers=non_admin_headers, timeout=15)
        assert r.status_code == 403


# ---------- POST /api/scanner/analyze-video ----------
SAMPLE_VIDEO_PATH = "/tmp/test_sample.mp4"


def _ensure_sample_video():
    import os
    if not os.path.exists(SAMPLE_VIDEO_PATH) or os.path.getsize(SAMPLE_VIDEO_PATH) < 500:
        import subprocess
        import imageio_ffmpeg
        ff = imageio_ffmpeg.get_ffmpeg_exe()
        subprocess.run(
            [ff, "-y", "-f", "lavfi", "-i", "color=c=blue:s=320x240:d=2",
             "-c:v", "libx264", "-t", "2", SAMPLE_VIDEO_PATH],
            check=True, capture_output=True,
        )
    return SAMPLE_VIDEO_PATH


class TestScannerAnalyzeVideo:
    def test_analyze_video_no_file_422(self, admin_token):
        """No file → FastAPI 422 validation error"""
        h = {"Authorization": f"Bearer {admin_token}"}
        r = requests.post(f"{BASE_URL}/api/scanner/analyze-video", headers=h, timeout=15)
        assert r.status_code == 422, f"expected 422 got {r.status_code} {r.text}"

    def test_analyze_video_non_admin_403(self, non_admin_token):
        """Non-admin token → 403"""
        _ensure_sample_video()
        h = {"Authorization": f"Bearer {non_admin_token}"}
        with open(SAMPLE_VIDEO_PATH, "rb") as f:
            files = {"file": ("test.mp4", f, "video/mp4")}
            r = requests.post(f"{BASE_URL}/api/scanner/analyze-video",
                              headers=h, files=files, timeout=30)
        assert r.status_code == 403, f"expected 403 got {r.status_code} {r.text}"

    def test_analyze_video_invalid_mime_400(self, admin_token):
        """Invalid MIME (image/png) → 400"""
        h = {"Authorization": f"Bearer {admin_token}"}
        fake = io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"0" * 100)
        files = {"file": ("fake.png", fake, "image/png")}
        r = requests.post(f"{BASE_URL}/api/scanner/analyze-video",
                          headers=h, files=files, timeout=30)
        assert r.status_code == 400, f"expected 400 got {r.status_code} {r.text}"
        assert "Format" in r.text or "non support" in r.text.lower()

    def test_analyze_video_too_large_413(self, admin_token):
        """File > 50MB → 413"""
        h = {"Authorization": f"Bearer {admin_token}"}
        # Build ~51MB payload of zeros in a BytesIO
        big = io.BytesIO(b"\x00" * (51 * 1024 * 1024))
        files = {"file": ("big.mp4", big, "video/mp4")}
        r = requests.post(f"{BASE_URL}/api/scanner/analyze-video",
                          headers=h, files=files, timeout=120)
        assert r.status_code == 413, f"expected 413 got {r.status_code} {r.text}"

    def test_analyze_video_admin_success(self, admin_token):
        """Admin + valid MP4 → 200 ScanResult with REPORT visual + video_analysis"""
        _ensure_sample_video()
        h = {"Authorization": f"Bearer {admin_token}"}
        with open(SAMPLE_VIDEO_PATH, "rb") as f:
            files = {"file": ("test.mp4", f, "video/mp4")}
            r = requests.post(f"{BASE_URL}/api/scanner/analyze-video",
                              headers=h, files=files, timeout=180)
        assert r.status_code == 200, f"expected 200 got {r.status_code} {r.text[:500]}"
        body = r.json()
        for key in ("id", "metadata", "business", "display_card", "financial", "created_at"):
            assert key in body, f"missing {key}"
        dc = body["display_card"]
        assert dc.get("visual_type") == "REPORT", dc
        assert dc.get("main_action") == "Publier l'annonce", dc
        assert body["metadata"].get("operation_mode") == "Admin_Only"
        assert body["financial"].get("currency") == "EUR"

    def test_audit_contains_video_entry(self, admin_headers):
        """After video scan, audit must include source_type='video' + video_size_kb"""
        r = requests.get(f"{BASE_URL}/api/scanner/audit", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        scans = r.json().get("scans", [])
        video_scans = [s for s in scans if s.get("source_type") == "video"]
        assert len(video_scans) >= 1, "no video entry found in audit"
        v = video_scans[0]
        assert "video_size_kb" in v
        assert isinstance(v["video_size_kb"], int) and v["video_size_kb"] > 0
