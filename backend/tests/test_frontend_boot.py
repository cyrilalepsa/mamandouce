"""Garde-fous splash / tenant / boot — évite un loader bloqué en prod."""
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
FRONTEND = REPO / "frontend"
ALIAS = "".join(("cyca", "family", ".com"))


def test_i18n_boot_does_not_touch_raw_local_storage():
    src = (FRONTEND / "src" / "i18n" / "index.jsx").read_text(encoding="utf-8")
    assert "from '../utils/safeStorage'" in src
    assert "localStorage.getItem" not in src
    assert "localStorage.setItem" not in src


def test_app_imports_home_layout_provider():
    app = (FRONTEND / "src" / "App.jsx").read_text(encoding="utf-8")
    assert "import { HomeLayoutProvider }" in app
    assert "from './contexts/HomeLayoutContext'" in app
    assert "withTimeout(api.auth.me()" in app
    assert "hideBootLoader()" in app


def test_main_wraps_app_with_error_boundary_and_i18n():
    main = (FRONTEND / "src" / "main.jsx").read_text(encoding="utf-8")
    assert "import('./i18n')" in main
    assert "import('./App')" in main
    assert "import('./components/ErrorBoundary')" in main
    assert "<ErrorBoundary>" in main
    assert "hideBootLoader()" in main
    assert "showBootFailure" in main


def test_error_boundary_exposes_details_on_tenant_hosts():
    src = (FRONTEND / "src" / "components" / "ErrorBoundary.jsx").read_text(encoding="utf-8")
    assert "boot-error-details" in src
    assert "hideBootLoader" in src
    assert "neriacorp.com" in src
    assert ALIAS in src


def test_backend_url_resolver_covers_tenant_hosts():
    src = (FRONTEND / "src" / "utils" / "backendUrl.js").read_text(encoding="utf-8")
    assert "mamandouce.neriacorp.com" in src
    assert "www.mamandouce.neriacorp.com" in src
    assert "STANDALONE_MAMANDOUCE_HOSTS" in src
    assert "isStandaloneMamandouceHost" in src
    assert ALIAS in src
    assert "https://api.neriacorp.com" in src
    assert "VITE_API_URL" in src
    assert "withTimeout" in src
    assert "resolveAppSlugFromHost" in src
    assert "RESERVED_HOST_LABELS" in src
    assert "resolveBoutiqueSlugFromHost" in src
    assert "hub.neriacorp.com" in src
    assert "cockpit.neriacorp.com" in src
    assert "isPublicHttpsApiUrl" in src
    assert "isN2CoreApiUrl" in src
    assert "withApiPrefix" in src
    assert "getBackendUrl" in src
    assert "getApiBase" in src
    assert "export function apiUrl" in src


def test_standalone_host_components_use_resolved_backend():
    leftovers = [
        FRONTEND / "src" / "components" / "admin" / "PublicationQRCode.jsx",
        FRONTEND / "src" / "components" / "admin" / "DashboardTab.jsx",
        FRONTEND / "src" / "components" / "admin" / "AndroidExportTab.jsx",
        FRONTEND / "src" / "components" / "settings" / "PushNotificationsSection.jsx",
        FRONTEND / "src" / "utils" / "fetusAssets.js",
    ]
    for path in leftovers:
        src = path.read_text(encoding="utf-8")
        assert "from " in src and "backendUrl" in src
        assert "apiUrl(" in src
        assert "import.meta.env.VITE_BACKEND_URL" not in src
        assert "localhost:8000" not in src


def test_api_client_resolves_urls_dynamically():
    src = (FRONTEND / "src" / "utils" / "api.jsx").read_text(encoding="utf-8")
    assert "from './backendUrl'" in src
    assert "getApiBase" in src
    assert "apiUrl(" in src
    assert "localhost:8000" not in src
    assert "import.meta.env.VITE_BACKEND_URL" not in src
    assert "cycle: {" in src
    assert "${API()}/cycle/intelligence" in src
    assert "${API()}/emotional/cycle-status" in src


def test_standalone_host_resolution_executable():
    import shutil
    import subprocess

    node = shutil.which("node")
    if not node:
        raise AssertionError("node is required to execute backendUrl standalone tests")
    script = FRONTEND / "src" / "utils" / "backendUrl.standalone.test.mjs"
    result = subprocess.run(
        [node, script],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        timeout=20,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert "backendUrl standalone: ok" in result.stdout


def test_pwa_verify_node_suite():
    import shutil
    import subprocess

    node = shutil.which("node")
    if not node:
        raise AssertionError("node is required to execute PWA verify tests")
    script = FRONTEND / "src" / "utils" / "pwa-verify.test.mjs"
    result = subprocess.run(
        [node, "--test", str(script)],
        cwd=str(FRONTEND),
        capture_output=True,
        text=True,
        timeout=20,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_api_client_uses_resolved_backend_and_timeout():
    src = (FRONTEND / "src" / "utils" / "api.jsx").read_text(encoding="utf-8")
    assert "from './backendUrl'" in src
    assert "axios.defaults.timeout" in src
    assert 'authApiUrl("forgot-password")' in src
    assert 'authApiUrl("login")' in src
    assert 'authApiUrl("register")' in src
    assert "/v1/auth" in src or "authApiUrl" in src
    assert '${API()}/auth/login' not in src
    assert '${API()}/auth/register' not in src
    assert 'apiUrl("/auth/forgot-password")' not in src
    assert '{ email:' in src or "payload = { email:" in src
    assert "user_email" not in src.split("forgotPassword")[1].split("verifyResetToken")[0]


def test_forgot_password_form_logs_api_errors():
    page = (FRONTEND / "src" / "pages" / "AuthPage.jsx").read_text(encoding="utf-8")
    assert "api.auth.forgotPassword" in page
    assert 'authApiUrl("forgot-password")' in page
    assert 'apiUrl("/auth/forgot-password")' not in page
    assert 'console.info("[forgot-password]' in page
    assert 'console.error("[forgot-password] error"' in page
    assert "formatApiError" in page


def test_superadmin_helper_lists_both_accounts():
    src = (FRONTEND / "src" / "utils" / "superadmin.js").read_text(encoding="utf-8")
    assert "cyrilalepsa@gmail.com" in src
    assert "superadmin@neriacorp.com" in src
    gate = (FRONTEND / "src" / "components" / "SubscriptionGate.jsx").read_text(encoding="utf-8")
    assert "isSuperAdmin" in gate
    admin = (FRONTEND / "src" / "pages" / "AdminPage.jsx").read_text(encoding="utf-8")
    assert "isSuperAdmin" in admin


def test_index_html_hides_loader_on_error():
    html = (FRONTEND / "index.html").read_text(encoding="utf-8")
    head = html.split("<body>", 1)[0]
    assert "<script>" in head
    assert head.find("<script>") < head.find("<meta charset")
    assert "initial-loader" in head
    assert "initial-splash" in head
    assert "pwa-splash" in head
    assert "10000" in head
    assert "Erreur au démarrage" in head
    assert "hideInitialLoader" in html
    assert "unhandledrejection" in html
    assert "BUILD_VERSION: PR10-SAFEBOOT" in html
    assert 'name="mamandouce-build"' in html


def test_cycle_save_form_normalizes_ymd_and_parseint():
    page = (FRONTEND / "src" / "pages" / "CycleTrackingPage.jsx").read_text(encoding="utf-8")
    helper = (FRONTEND / "src" / "utils" / "cycleForm.js").read_text(encoding="utf-8")
    assert "buildCycleSavePayload" in page
    assert "parseInt(habitualLength, 10)" in page
    assert "parseInt(habitualLength, 10)" in helper
    assert "last_period_date: payload.last_period_date" in page
    assert "cycle_length: payload.cycle_length" in page


def test_cycle_form_node_suite():
    import shutil
    import subprocess

    node = shutil.which("node")
    if not node:
        raise AssertionError("node is required to execute cycleForm tests")
    script = FRONTEND / "src" / "utils" / "cycleForm.test.mjs"
    result = subprocess.run(
        [node, "--test", str(script)],
        cwd=str(FRONTEND),
        capture_output=True,
        text=True,
        timeout=20,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_service_workers_never_cache_index_html():
    sw = (FRONTEND / "public" / "sw.js").read_text(encoding="utf-8")
    legacy = (FRONTEND / "public" / "service-worker.js").read_text(encoding="utf-8")
    assert "isHtmlDocument" in sw
    assert "cache: 'no-store'" in sw or 'cache: "no-store"' in sw
    assert "api.neriacorp.com" in sw
    assert "url.origin !== self.location.origin" in sw
    assert "isN2ApiRequest" in sw
    assert "'/index.html'" not in legacy.split("STATIC_ASSETS")[1].split("];")[0]
    assert "JAMAIS de cache index.html" in legacy
    assert "api.neriacorp.com" in legacy
    assert "url.origin !== self.location.origin" in legacy
    serve = (FRONTEND / "serve.json").read_text(encoding="utf-8")
    assert "no-cache, no-store, must-revalidate" in serve


def test_cors_defaults_include_tenant_alias(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    from core.config import parse_cors_origins

    origins = parse_cors_origins()
    assert "https://mamandouce.neriacorp.com" in origins
    assert f"https://{ALIAS}" in origins
    assert f"https://www.{ALIAS}" in origins


def test_premium_price_copy_is_30_euros_not_27():
    pricing = (FRONTEND / "src" / "pages" / "PricingPage.jsx").read_text(encoding="utf-8")
    checkout = (FRONTEND / "src" / "pages" / "SubscriptionCheckout.jsx").read_text(encoding="utf-8")
    modal = (FRONTEND / "src" / "components" / "PremiumModal.jsx").read_text(encoding="utf-8")
    lock = (FRONTEND / "src" / "components" / "PremiumFeatureLock.jsx").read_text(encoding="utf-8")
    payments = (REPO / "backend" / "routes" / "payments.py").read_text(encoding="utf-8")
    for src in (pricing, checkout, modal, lock):
        assert "27€" not in src
        assert "30€" in src
    assert '"amount": 30.00' in payments or "'amount': 30.00" in payments
    assert "Paiement sécurisé unique de 30€" in pricing


def test_cycle_tracking_shows_ovulation_and_nidation():
    page = (FRONTEND / "src" / "pages" / "CycleTrackingPage.jsx").read_text(encoding="utf-8")
    agenda = (FRONTEND / "src" / "components" / "home" / "AgendaCard.jsx").read_text(encoding="utf-8")
    assert "from '../components/home/AgendaCard'" in page
    assert "<AgendaCard" in page
    assert "implantationLikely" in page
    assert "ovulationPeak" in agenda
    assert "expected-nidation-card" in agenda
    assert "fertileWindow" in agenda


def test_profile_pregnant_card_and_home_sa_week():
    profile = (FRONTEND / "src" / "pages" / "ProfilePage.jsx").read_text(encoding="utf-8")
    home = (FRONTEND / "src" / "pages" / "HomePage.jsx").read_text(encoding="utf-8")
    toggle = (FRONTEND / "src" / "components" / "cycle" / "PregnancyToggle.jsx").read_text(encoding="utf-8")
    assert "PregnancyToggle" in profile
    assert 'mode="profile"' in profile
    assert "pregnant-button" in toggle
    assert "sa-week-card" in toggle
    assert "canvas-confetti" in toggle or "from 'canvas-confetti'" in toggle
    assert 'mode="home"' in home
    assign = next(line for line in home.splitlines() if "hasPregnancyProfile =" in line)
    assert "hasRapportInFertileWindow" not in assign
    assert "[&_#celebrate-section]:hidden" not in home


def test_railway_frontend_listens_on_port():
    pkg = (FRONTEND / "package.json").read_text(encoding="utf-8")
    railway = (FRONTEND / "railway.json").read_text(encoding="utf-8")
    assert "serve -s dist -l tcp://0.0.0.0:$PORT" in pkg
    assert "npx serve -s dist -l tcp://0.0.0.0:$PORT" in railway
    assert '"NIXPACKS_NODE_VERSION": "22"' in railway
