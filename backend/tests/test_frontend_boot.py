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
    ctx = (FRONTEND / "src" / "contexts" / "AuthContext.jsx").read_text(encoding="utf-8")
    assert "import { HomeLayoutProvider }" in app
    assert "from './contexts/HomeLayoutContext'" in app
    assert "AuthProvider" in app
    assert "withTimeout(api.auth.me()" in ctx
    assert "hideBootLoader()" in ctx


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
    assert "STANDALONE_API_GATE" in src
    assert "/__mamandouce/api" in src
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
    assert "ADMIN_EMAILS" in src
    assert "ADMIN_EMAILS" in admin
    assert "response.data.role === 'admin' || ADMIN_EMAILS.includes(response.data.email)" in admin
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


def test_profile_and_home_use_dynamic_pregnancy_cycle_card():
    profile = (FRONTEND / "src" / "pages" / "ProfilePage.jsx").read_text(encoding="utf-8")
    pregnancy_page = (FRONTEND / "src" / "pages" / "PregnancyFertilityPage.jsx").read_text(encoding="utf-8")
    home = (FRONTEND / "src" / "pages" / "HomePage.jsx").read_text(encoding="utf-8")
    toggle = (FRONTEND / "src" / "components" / "cycle" / "PregnancyToggle.jsx").read_text(encoding="utf-8")
    assert "PregnancyToggle" not in profile
    assert "Grossesse & Fertilité" not in profile
    assert "PregnancyToggle" in pregnancy_page
    assert 'mode="profile"' in pregnancy_page
    assert "pregnant-button" in toggle
    assert "pregnancy-progress-card" in toggle
    assert "cycle-summary-card" in toggle
    assert "isPregnancyActive" in home
    assert "'/pregnancy-fertility' : '/cycle-tracking'" in toggle
    assert "canvas-confetti" in toggle or "from 'canvas-confetti'" in toggle
    assert 'mode="home"' in home
    assign = next(line for line in home.splitlines() if "hasPregnancyProfile =" in line)
    assert "hasRapportInFertileWindow" not in assign
    assert "[&_#celebrate-section]:hidden" not in home


def test_home_visible_immediately_with_pull_to_refresh():
    home = (FRONTEND / "src" / "pages" / "HomePage.jsx").read_text(encoding="utf-8")
    assert "isLoaded" not in home
    assert "opacity-0" not in home
    assert 'data-testid="home-scroll-root"' in home
    assert 'data-testid="home-content"' in home
    assert "passive: false" in home
    assert "overscrollBehaviorY: 'auto'" in home or 'overscrollBehaviorY: "auto"' in home
    bg = (FRONTEND / "src" / "styles" / "glossy" / "_background.css").read_text(encoding="utf-8")
    app_css = (FRONTEND / "src" / "App.css").read_text(encoding="utf-8")
    assert "overscroll-behavior-y: contain" not in bg
    assert "overscroll-behavior-y: contain" not in app_css
    assert "overscroll-behavior-y: auto" in bg
    assert "overscroll-behavior-y: auto" in app_css
    emo = (FRONTEND / "src" / "components" / "EmotionalIntelligence.jsx").read_text(
        encoding="utf-8"
    )
    toggle = (FRONTEND / "src" / "components" / "cycle" / "PregnancyToggle.jsx").read_text(
        encoding="utf-8"
    )
    for src in (emo, toggle):
        assert "makeHeartShape" in src
        assert "shapeFromPath indisponible" in src


def test_login_goes_home_never_pricing_and_loading_always_clears():
    auth = (FRONTEND / "src" / "pages" / "AuthPage.jsx").read_text(encoding="utf-8")
    app = (FRONTEND / "src" / "App.jsx").read_text(encoding="utf-8")
    gate = (FRONTEND / "src" / "components" / "SubscriptionGate.jsx").read_text(encoding="utf-8")
    pricing = (FRONTEND / "src" / "pages" / "PricingPage.jsx").read_text(encoding="utf-8")
    checkout = (FRONTEND / "src" / "pages" / "SubscriptionCheckout.jsx").read_text(
        encoding="utf-8"
    )
    post = (FRONTEND / "src" / "utils" / "postLogin.js").read_text(encoding="utf-8")
    assert "destinationAfterAuth" in auth
    assert "api.auth.me()" in auth
    assert "checkout?onboarding=true" not in auth
    assert "navigate('/pricing'" not in auth
    assert "setLoading(false)" in auth
    assert "} finally {" in auth
    ctx = (FRONTEND / "src" / "contexts" / "AuthContext.jsx").read_text(encoding="utf-8")
    assert "await withTimeout(api.auth.me()" in ctx
    assert "if (!cancelled) setLoading(false)" in ctx
    assert 'path="/app"' in app
    assert 'path="/dashboard"' in app
    assert 'path="/login"' in app
    assert "isAuthenticated ? (" in app
    assert "setLoading(false)" in gate
    assert "isPrivilegedAccount" in gate
    assert "FULL_PRIVILEGE_STATUS" in gate
    assert "postpartum_unlocked: true" in gate
    assert "shouldLeavePricingPage" in pricing
    assert "pricing-auth-check" in pricing
    assert "shouldLeavePricingPage" in checkout
    assert "const [resolvingUser, setResolvingUser] = useState(true)" in checkout
    assert "if (resolvingUser)" in checkout
    assert "setResolvingUser(false)" in checkout
    assert "destinationAfterAuth" in post
    assert "shouldAutoRedirectToPricing" in post


def test_superadmin_overlay_admin_menu_and_logout_to_login():
    overlay = (FRONTEND / "src" / "utils" / "superadmin.js").read_text(encoding="utf-8")
    ctx = (FRONTEND / "src" / "contexts" / "AuthContext.jsx").read_text(encoding="utf-8")
    top = (FRONTEND / "src" / "components" / "home" / "TopBar.jsx").read_text(encoding="utf-8")
    bag = (FRONTEND / "src" / "pages" / "MaternityBagPage.jsx").read_text(encoding="utf-8")
    lock = (FRONTEND / "src" / "components" / "PremiumFeatureLock.jsx").read_text(
        encoding="utf-8"
    )
    api = (FRONTEND / "src" / "utils" / "api.jsx").read_text(encoding="utf-8")
    assert "applySuperadminOverlay" in overlay
    assert "AUTH_LOGIN_PATH" in overlay
    assert 'next.role = "admin"' in overlay
    assert 'next.subscription_status = "premium"' in overlay
    assert "next.is_superadmin = true" in overlay
    assert "next.is_admin = true" in overlay
    assert "next.is_premium = true" in overlay
    assert "next.is_vip = true" in overlay
    assert "VIP_EMAILS" in overlay
    assert "shouldShowPremiumHalo" in overlay
    assert "clearAuthStorage" in ctx
    assert "window.location.assign(AUTH_LOGIN_PATH)" in ctx
    assert "is_superadmin" in ctx
    assert "is_admin" in ctx
    assert "is_premium" in ctx
    assert "is_vip" in ctx
    assert "isVip: vip" in ctx
    assert "isPremium: premium" in ctx
    assert "logout()" in top
    assert "admin-dashboard-link" in top
    assert "logout-menu-item" in top
    assert "isVip" in top
    assert "useAuth" in bag
    assert "from 'react-i18next'" in bag
    assert "unlocked" in lock
    assert "isVip" in lock
    assert "window.location.href = '/login'" in api


def test_use_translation_is_imported_everywhere_it_is_called():
    missing = []
    for path in (FRONTEND / "src").rglob("*"):
        if path.suffix not in {".js", ".jsx", ".ts", ".tsx"}:
            continue
        src = path.read_text(encoding="utf-8")
        if "useTranslation(" not in src:
            continue
        if "from 'react-i18next'" not in src and 'from "react-i18next"' not in src:
            missing.append(str(path.relative_to(FRONTEND)))
    assert missing == [], f"useTranslation without import: {missing}"


def test_premium_halo_on_home_and_profile_avatars():
    avatar = (FRONTEND / "src" / "components" / "profile" / "PremiumSunAvatar.jsx").read_text(
        encoding="utf-8"
    )
    home = (FRONTEND / "src" / "pages" / "HomePage.jsx").read_text(encoding="utf-8")
    profile = (FRONTEND / "src" / "components" / "profile" / "ProfileEditCard.jsx").read_text(
        encoding="utf-8"
    )
    assert "premium-halo" in avatar
    assert "shouldShowPremiumHalo" in avatar
    assert "useAuth" in avatar
    assert "home-avatar" in home
    assert "isPremium={isPremium}" in home
    assert "authIsPremium" in home
    assert "PremiumSunAvatar" in profile
    assert 'testId="profile-avatar"' in profile


def test_cycle_home_cards_glass_colors_and_no_name_day_on_cycle_page():
    cycle = (FRONTEND / "src" / "pages" / "CycleTrackingPage.jsx").read_text(encoding="utf-8")
    toggle = (FRONTEND / "src" / "components" / "cycle" / "PregnancyToggle.jsx").read_text(
        encoding="utf-8"
    )
    fete = (FRONTEND / "src" / "components" / "NameOfTheDay.jsx").read_text(encoding="utf-8")
    glass = (FRONTEND / "src" / "styles" / "glossy" / "_glass-cards.css").read_text(
        encoding="utf-8"
    )
    assert 'mode="cycle"' in cycle
    assert "NameOfTheDay" not in cycle
    assert "glass-fete-du-jour" in fete
    assert "glass-sa-week" in toggle
    assert "glass-fete-du-jour" in glass
    assert "glass-sa-week" in glass
    assert "rgba(251, 191, 36" in glass
    assert "rgba(219, 39, 119" in glass


def test_railway_frontend_listens_on_port():
    pkg = (FRONTEND / "package.json").read_text(encoding="utf-8")
    railway = (FRONTEND / "railway.json").read_text(encoding="utf-8")
    proxy = (FRONTEND / "scripts" / "spa-proxy.mjs").read_text(encoding="utf-8")
    assert "node scripts/spa-proxy.mjs" in pkg
    assert "node scripts/spa-proxy.mjs" in railway
    assert "serve -s dist" not in pkg
    assert "serve -s dist" not in railway
    assert '"NIXPACKS_NODE_VERSION": "22"' in railway
    assert "isApiPath" in proxy
    assert "API_URL" in proxy
    assert "n2-core" in proxy.lower() or "api.neriacorp.com" in proxy
    assert "index.html" in proxy
    assert "SPA_API_PROXY_MISCONFIGURED" in proxy
    assert "SPA_API_PROXY_LOOP" in proxy
    assert "cdn-loop" in proxy
    assert "AbortSignal.timeout" in proxy
    assert "STANDALONE_API_GATE" in proxy
    assert "/__mamandouce/api" in proxy


def test_auth_login_passes_payload_and_rejects_html():
    auth_page = (FRONTEND / "src" / "pages" / "AuthPage.jsx").read_text(encoding="utf-8")
    ctx = (FRONTEND / "src" / "contexts" / "AuthContext.jsx").read_text(encoding="utf-8")
    api = (FRONTEND / "src" / "utils" / "api.jsx").read_text(encoding="utf-8")
    security = (REPO / "backend" / "core" / "security.py").read_text(encoding="utf-8")
    assert "completeLogin(false, response.data)" in auth_page
    assert auth_page.count("completeLogin(false, response.data)") >= 3
    assert "sanitizeAuthPayload" in ctx
    assert "isHtmlApiResponse" in api
    assert "formatApiError" in auth_page
    assert "API_HTML_FALLBACK" in api
    assert "find_user_by_email" in security
    assert "normalize_email" in security
