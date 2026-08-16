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
export const APP_SLUG_MAMANDOUCE = "mamandouce";

/** Hôtes où le front MamanDouce tourne en standalone (sans wildcard N2). */
export const STANDALONE_MAMANDOUCE_HOSTS = [
  "mamandouce.neriacorp.com",
  "www.mamandouce.neriacorp.com",
  "mamandouce.app",
  "www.mamandouce.app",
];

/** Plateformes N2 (pas un slug boutique). */
export const PLATFORM_HOSTS = [
  "hub.neriacorp.com",
  "www.hub.neriacorp.com",
  "neriacorp.com",
  "www.neriacorp.com",
  "api.neriacorp.com",
  "portal.neriacorp.com",
  "app.neriacorp.com",
  "www.app.neriacorp.com",
];

/** Alias courts B2B explicites ({slug}.neriacorp.com) — pas un wildcard. */
export const B2B_SHORT_ALIAS_SLUGS = [
  "heritia",
  "visatrace",
  "aevis",
  "veovision",
  "vellumia",
];

const APP_HOST_SUFFIX = ".app.neriacorp.com";

/** Hôtes front connus (alias historique inclus). */
export const TENANT_HOSTS = [
  "mamandouce.neriacorp.com",
  "www.mamandouce.neriacorp.com",
  "neriacorp.com",
  "www.neriacorp.com",
  "hub.neriacorp.com",
  "www.hub.neriacorp.com",
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

export function isPlatformHost(hostname) {
  return PLATFORM_HOSTS.includes(normalizeHost(hostname));
}

/** Boutique multi-tenant : {slug}.app.neriacorp.com (pas *.neriacorp.com). */
export function isNeriaAppHost(hostname) {
  const host = normalizeHost(hostname);
  if (!host.endsWith(APP_HOST_SUFFIX)) return false;
  const slug = host.slice(0, -APP_HOST_SUFFIX.length);
  return Boolean(slug) && slug !== "www" && !slug.includes(".");
}

export function resolveBoutiqueSlugFromHost(hostname) {
  try {
    const host = normalizeHost(hostname);
    if (!host || isPlatformHost(host)) return null;
    if (isStandaloneMamandouceHost(host)) return APP_SLUG_MAMANDOUCE;
    if (isNeriaAppHost(host)) {
      return host.slice(0, -APP_HOST_SUFFIX.length);
    }
    if (host.endsWith(".neriacorp.com")) {
      const labels = host.split(".").filter(Boolean);
      const candidate = labels[0] === "www" ? labels[1] : labels[0];
      if (B2B_SHORT_ALIAS_SLUGS.includes(candidate)) return candidate;
    }
    return null;
  } catch {
    return null;
  }
}

export function resolveAppSlugFromHost(hostname) {
  try {
    return resolveBoutiqueSlugFromHost(hostname) || APP_SLUG_MAMANDOUCE;
  } catch {
    return APP_SLUG_MAMANDOUCE;
  }
}

export function isKnownTenantHost(hostname) {
  try {
    const host = normalizeHost(hostname);
    if (TENANT_HOSTS.includes(host) || isPlatformHost(host)) return true;
    if (isStandaloneMamandouceHost(host)) return true;
    if (isNeriaAppHost(host)) return true;
    if (resolveBoutiqueSlugFromHost(host)) return true;
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
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
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

  // Conteneur Railway standalone : jamais un backend local cuit dans le build.
  // VITE_BACKEND_URL / VITE_API_URL uniquement s'il s'agit d'un HTTPS public
  // (backend MamanDouce dédié). Sinon API centrale N2.
  if (isStandaloneMamandouceHost(host)) {
    if (isPublicHttpsApiUrl(fromEnv)) return fromEnv;
    return DEFAULT_PUBLIC_API;
  }

  if (isKnownTenantHost(host) && isLocalApiUrl(fromEnv)) {
    return DEFAULT_PUBLIC_API;
  }

  return fromEnv || DEFAULT_PUBLIC_API;
}

let _backendUrl = DEFAULT_PUBLIC_API;
try {
  _backendUrl = resolveBackendUrl();
} catch (err) {
  console.warn("[boot] resolveBackendUrl failed", err);
}
export const BACKEND_URL = _backendUrl;
export const API_BASE = `${String(BACKEND_URL || DEFAULT_PUBLIC_API).replace(/\/$/, "")}/api`;

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
