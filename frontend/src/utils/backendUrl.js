/**
 * Résolution de l'URL API selon l'hôte (tenant) et les variables Vite.
 *
 * mamandouce.neriacorp.com est un hôte standalone (conteneur Railway dédié,
 * sans wildcard du Noyau N2). Les requêtes API vont vers le backend
 * MamanDouce ou l'API centrale N2 (api.neriacorp.com) — jamais vers
 * localhost une fois servi sur cet hôte.
 */

export const DEFAULT_PUBLIC_API = "https://api.neriacorp.com";
export const DEFAULT_LOCAL_API = "http://localhost:8000";
export const N2_CORE_API_HOST = "api.neriacorp.com";
export const APP_SLUG_MAMANDOUCE = "mamandouce";

/**
 * Cloudflare (et parfois Hikari) intercepte `/api` sur mamandouce.neriacorp.com
 * et renvoie un 502/520 sans atteindre le Node Railway. Le SPA standalone
 * passe par cette porte, que spa-proxy.mjs réécrit vers FastAPI `/api`.
 */
export const STANDALONE_API_GATE = "/__mamandouce/api";

/** Labels de premier niveau qui ne sont pas des boutiques B2B. */
export const RESERVED_HOST_LABELS = [
  "hub",
  "api",
  "cockpit",
  "mamandouce",
  "www",
  "portal",
  "app",
];

/** Hôtes où le front MamanDouce tourne en standalone. */
export const STANDALONE_MAMANDOUCE_HOSTS = [
  "mamandouce.neriacorp.com",
  "www.mamandouce.neriacorp.com",
  "mamandouce.app",
  "www.mamandouce.app",
];

/** Hôtes front connus (alias historique inclus). */
export const TENANT_HOSTS = [
  "mamandouce.neriacorp.com",
  "www.mamandouce.neriacorp.com",
  "neriacorp.com",
  "www.neriacorp.com",
  "hub.neriacorp.com",
  "www.hub.neriacorp.com",
  "cockpit.neriacorp.com",
  "api.neriacorp.com",
  "cycafamily.com",
  "www.cycafamily.com",
  "mamandouce.cycafamily.com",
  "www.mamandouce.cycafamily.com",
  "mamandouce.app",
  "www.mamandouce.app",
];

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function readViteBackendUrl() {
  try {
    const env = import.meta.env || {};
    return String(env.VITE_BACKEND_URL || env.VITE_API_URL || "").trim();
  } catch {
    return "";
  }
}

function normalizeHost(hostname) {
  return String(hostname || "").toLowerCase().split(":")[0];
}

export function isLocalHostname(hostname) {
  return LOCAL_HOSTS.has(normalizeHost(hostname));
}

/**
 * Détecte nativement l'application MamanDouce en standalone
 * (sous-domaine dédié Railway, pas un tenant wildcard N2).
 */
export function isStandaloneMamandouceHost(hostname) {
  try {
    const host = normalizeHost(hostname);
    if (!host) return false;
    if (STANDALONE_MAMANDOUCE_HOSTS.includes(host)) return true;
    if (host === "mamandouce.app" || host === "www.mamandouce.app") return true;
    if (host.startsWith("mamandouce.")) return true;
    if (host.startsWith("www.mamandouce.")) return true;
    return false;
  } catch {
    return false;
  }
}

function firstLabel(host) {
  const labels = host.split(".").filter(Boolean);
  if (!labels.length) return "";
  return labels[0] === "www" && labels.length >= 2 ? labels[1] : labels[0];
}

export function isReservedNeriaHost(hostname) {
  const host = normalizeHost(hostname);
  if (!host) return false;
  if (host === "neriacorp.com" || host === "www.neriacorp.com") return true;
  if (!host.endsWith(".neriacorp.com")) return false;
  return RESERVED_HOST_LABELS.includes(firstLabel(host));
}

/**
 * Slug boutique B2B depuis {slug}.neriacorp.com.
 * hub / api / cockpit / mamandouce → null (pas un tenant B2B).
 */
export function resolveBoutiqueSlugFromHost(hostname) {
  try {
    const host = normalizeHost(hostname);
    if (!host || isReservedNeriaHost(host) || isStandaloneMamandouceHost(host)) {
      return null;
    }
    if (host.endsWith(".neriacorp.com")) {
      const slug = firstLabel(host);
      if (slug && !RESERVED_HOST_LABELS.includes(slug)) return slug;
    }
    return null;
  } catch {
    return null;
  }
}

export function resolveAppSlugFromHost(hostname) {
  try {
    const host = normalizeHost(hostname);
    if (!host) return APP_SLUG_MAMANDOUCE;
    if (isStandaloneMamandouceHost(host)) return APP_SLUG_MAMANDOUCE;
    if (isReservedNeriaHost(host)) return null;
    return resolveBoutiqueSlugFromHost(host) || APP_SLUG_MAMANDOUCE;
  } catch {
    return APP_SLUG_MAMANDOUCE;
  }
}

export function isKnownTenantHost(hostname) {
  try {
    const host = normalizeHost(hostname);
    if (TENANT_HOSTS.includes(host)) return true;
    if (isStandaloneMamandouceHost(host)) return true;
    if (host.endsWith(".neriacorp.com")) return true;
    return host.endsWith("." + ["cyca", "family", ".com"].join(""));
  } catch {
    return false;
  }
}

export function isLocalApiUrl(url) {
  const value = String(url || "").toLowerCase();
  return !value || /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(value);
}

/** URL API publique HTTPS (backend MamanDouce dédié ou API N2). */
export function isPublicHttpsApiUrl(url) {
  const value = String(url || "").trim();
  if (!value || isLocalApiUrl(value)) return false;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host === "railway.app" || host.endsWith(".railway.app")) return false;
    return true;
  } catch {
    return false;
  }
}

export function isN2CoreApiUrl(url) {
  try {
    return new URL(String(url || "").trim()).hostname.toLowerCase() === N2_CORE_API_HOST;
  } catch {
    return false;
  }
}

/** FastAPI MamanDouce est monté sous /api — jamais l'origine nue (404 N2). */
export function usesStandaloneApiGate(opts = {}) {
  const host = normalizeHost(
    opts.hostname ?? (typeof window !== "undefined" ? window.location.hostname : ""),
  );
  return isStandaloneMamandouceHost(host);
}

export function withApiPrefix(pathname, opts = {}) {
  const raw = String(pathname || "").trim();
  let path = !raw ? "/api" : raw.startsWith("/") ? raw : `/${raw}`;
  if (path === STANDALONE_API_GATE || path.startsWith(`${STANDALONE_API_GATE}/`)) {
    path = `/api${path.slice(STANDALONE_API_GATE.length)}` || "/api";
  }
  if (!(path === "/api" || path.startsWith("/api/"))) {
    path = `/api${path}`;
  }
  if (usesStandaloneApiGate(opts)) {
    path = `${STANDALONE_API_GATE}${path === "/api" ? "" : path.slice(4)}`;
  }
  return path;
}

/**
 * Préfixe auth côté FastAPI : /api + /v1/auth/…
 * Évite /auth (SPA) et /api/auth (certaines stacks front interceptent ce chemin).
 */
export const AUTH_API_PREFIX = "/v1/auth";

export function authApiPath(path = "") {
  const suffix = String(path || "").replace(/^\/+/, "");
  return suffix ? `${AUTH_API_PREFIX}/${suffix}` : AUTH_API_PREFIX;
}

export function authApiUrl(path = "", opts) {
  return apiUrl(authApiPath(path), opts);
}

function standaloneSameOrigin(host, opts = {}) {
  const fromOpts = String(opts.origin || "").replace(/\/$/, "");
  if (fromOpts && /^https?:\/\//i.test(fromOpts) && !isN2CoreApiUrl(fromOpts)) {
    return fromOpts;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    const locHost = normalizeHost(window.location.hostname);
    if (!host || locHost === normalizeHost(host)) {
      return String(window.location.origin).replace(/\/$/, "");
    }
  }
  return `https://${normalizeHost(host)}`;
}

/**
 * @param {{ envUrl?: string, hostname?: string }} [opts]
 * @returns {string} URL API sans slash final
 */
export function resolveBackendUrl(opts = {}) {
  const fromEnv = String(opts.envUrl ?? readViteBackendUrl())
    .trim()
    .replace(/\/$/, "");
  const host = normalizeHost(
    opts.hostname ?? (typeof window !== "undefined" ? window.location.hostname : ""),
  );

  if (isLocalHostname(host)) {
    return fromEnv || DEFAULT_LOCAL_API;
  }

  // Conteneur Railway standalone : FastAPI sert le SPA et /api sur le même hôte.
  // Ne jamais envoyer cycle / pregnancy / VAPID vers le Noyau N2.
  if (isStandaloneMamandouceHost(host)) {
    if (isPublicHttpsApiUrl(fromEnv) && !isN2CoreApiUrl(fromEnv)) return fromEnv;
    return standaloneSameOrigin(host, opts);
  }

  if (isKnownTenantHost(host) && isLocalApiUrl(fromEnv)) {
    return DEFAULT_PUBLIC_API;
  }

  return fromEnv || DEFAULT_PUBLIC_API;
}

/** Toujours passer par resolveBackendUrl() — jamais une URL figée au boot. */
export function getBackendUrl(opts) {
  try {
    return resolveBackendUrl(opts);
  } catch (err) {
    console.warn("[boot] resolveBackendUrl failed", err);
    return DEFAULT_PUBLIC_API;
  }
}

export function getApiBase(opts) {
  const base = String(getBackendUrl(opts)).replace(/\/$/, "");
  return usesStandaloneApiGate(opts) ? `${base}${STANDALONE_API_GATE}` : `${base}/api`;
}

/**
 * Construit une URL API absolue (Vault, OCR, Cloudinary, VAPID, QR, …).
 * Refuse les relatives non résolues et les fallback localhost en prod.
 */
export function apiUrl(path = "", opts) {
  const suffix = String(path || "");
  if (/^https?:\/\//i.test(suffix)) {
    if (isLocalApiUrl(suffix) && !isLocalHostname(opts?.hostname)) {
      return getBackendUrl(opts);
    }
    return suffix.replace(/\/$/, "");
  }
  const base = String(getBackendUrl(opts)).replace(/\/$/, "");
  if (!suffix) return getApiBase(opts);
  return `${base}${withApiPrefix(suffix, opts)}`;
}

export const BACKEND_URL = getBackendUrl();
export const API_BASE = getApiBase();

export function withTimeout(promise, ms, label = "timeout") {
  const timeoutMs = Number(ms) || 12000;
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${label} (${timeoutMs}ms)`);
      err.code = "BOOT_TIMEOUT";
      reject(err);
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function hideBootLoader() {
  try {
    if (typeof window !== "undefined" && typeof window.hideInitialLoader === "function") {
      window.hideInitialLoader();
    }
    if (typeof document !== "undefined") {
      const splash =
        document.getElementById("initial-loader") ||
        document.getElementById("initial-splash") ||
        document.getElementById("pwa-splash");
      if (splash) splash.style.display = "none";
    }
  } catch {
    /* ignore */
  }
}
