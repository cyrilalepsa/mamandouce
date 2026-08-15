/**
 * Résolution de l'URL API selon l'hôte (tenant) et les variables Vite.
 * Évite un splash bloqué quand le build a été fait avec localhost
 * puis servi sur mamandouce.neriacorp.com / cycafamily.com.
 */

export const DEFAULT_PUBLIC_API = "https://api.neriacorp.com";
export const DEFAULT_LOCAL_API = "http://localhost:8000";

/** Hôtes front connus (alias historique inclus). */
export const TENANT_HOSTS = [
  "mamandouce.neriacorp.com",
  "www.mamandouce.neriacorp.com",
  "neriacorp.com",
  "www.neriacorp.com",
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

export function isLocalHostname(hostname) {
  const host = String(hostname || "").toLowerCase().split(":")[0];
  return LOCAL_HOSTS.has(host);
}

export function isKnownTenantHost(hostname) {
  const host = String(hostname || "").toLowerCase().split(":")[0];
  if (TENANT_HOSTS.includes(host)) return true;
  return host.endsWith(".neriacorp.com") || host.endsWith(".cycafamily.com");
}

export function isLocalApiUrl(url) {
  const value = String(url || "").toLowerCase();
  return !value || /localhost|127\.0\.0\.1/.test(value);
}

/**
 * @param {{ envUrl?: string, hostname?: string }} [opts]
 * @returns {string} URL API sans slash final
 */
export function resolveBackendUrl(opts = {}) {
  const fromEnv = String(opts.envUrl ?? readViteBackendUrl())
    .trim()
    .replace(/\/$/, "");
  const host = String(
    opts.hostname ?? (typeof window !== "undefined" ? window.location.hostname : ""),
  )
    .toLowerCase()
    .split(":")[0];

  if (isLocalHostname(host)) {
    return fromEnv || DEFAULT_LOCAL_API;
  }

  if (isKnownTenantHost(host) && isLocalApiUrl(fromEnv)) {
    return DEFAULT_PUBLIC_API;
  }

  return fromEnv || DEFAULT_PUBLIC_API;
}

export const BACKEND_URL = resolveBackendUrl();
export const API_BASE = `${BACKEND_URL.replace(/\/$/, "")}/api`;

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
  } catch {
    /* ignore */
  }
}
