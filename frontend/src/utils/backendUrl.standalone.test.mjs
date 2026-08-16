/**
 * Tests exécutables de la résolution d'hôte standalone MamanDouce.
 * Lancé par pytest (node --input-type=module) — pas de runner Vite requis.
 */
import {
  APP_SLUG_MAMANDOUCE,
  DEFAULT_LOCAL_API,
  DEFAULT_PUBLIC_API,
  isNeriaAppHost,
  isPlatformHost,
  isStandaloneMamandouceHost,
  resolveAppSlugFromHost,
  resolveBackendUrl,
  resolveBoutiqueSlugFromHost,
} from "./backendUrl.js";

const failures = [];

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

const standaloneHosts = [
  "mamandouce.neriacorp.com",
  "www.mamandouce.neriacorp.com",
  "mamandouce.app",
  "www.mamandouce.app",
  "mamandouce.neriacorp.com:443",
];

for (const host of standaloneHosts) {
  assertEqual(isStandaloneMamandouceHost(host), true, `isStandalone(${host})`);
  assertEqual(resolveAppSlugFromHost(host), APP_SLUG_MAMANDOUCE, `slug(${host})`);
  assertEqual(
    resolveBackendUrl({ hostname: host, envUrl: "" }),
    DEFAULT_PUBLIC_API,
    `api empty env on ${host}`,
  );
  assertEqual(
    resolveBackendUrl({ hostname: host, envUrl: "http://localhost:8000" }),
    DEFAULT_PUBLIC_API,
    `api baked localhost on ${host}`,
  );
  assertEqual(
    resolveBackendUrl({ hostname: host, envUrl: "http://127.0.0.1:8000/" }),
    DEFAULT_PUBLIC_API,
    `api 127.0.0.1 on ${host}`,
  );
  assertEqual(
    resolveBackendUrl({ hostname: host, envUrl: DEFAULT_PUBLIC_API }),
    DEFAULT_PUBLIC_API,
    `api N2 on ${host}`,
  );
  assertEqual(
    resolveBackendUrl({ hostname: host, envUrl: "https://mamandouce-prod.up.railway.app/" }),
    "https://mamandouce-prod.up.railway.app",
    `api dedicated backend on ${host}`,
  );
}

assertEqual(isStandaloneMamandouceHost("neriacorp.com"), false, "core host is not standalone");
assertEqual(isStandaloneMamandouceHost("localhost"), false, "localhost is not standalone");
assertEqual(isPlatformHost("hub.neriacorp.com"), true, "hub is platform");
assertEqual(isPlatformHost("www.hub.neriacorp.com"), true, "www.hub is platform");
assertEqual(resolveBoutiqueSlugFromHost("hub.neriacorp.com"), null, "hub has no boutique slug");
assertEqual(resolveBoutiqueSlugFromHost("mamandouce.neriacorp.com"), APP_SLUG_MAMANDOUCE, "standalone slug");
assertEqual(isNeriaAppHost("boutique.app.neriacorp.com"), true, "boutique.app is neria app host");
assertEqual(isNeriaAppHost("boutique.neriacorp.com"), false, "legacy wildcard is not an app host");
assertEqual(resolveBoutiqueSlugFromHost("boutique.app.neriacorp.com"), "boutique", "app-host boutique slug");
assertEqual(resolveBoutiqueSlugFromHost("boutique.neriacorp.com"), null, "no implicit *.neriacorp.com slug");
assertEqual(resolveAppSlugFromHost("hub.neriacorp.com"), APP_SLUG_MAMANDOUCE, "hub does not crash");
assertEqual(resolveAppSlugFromHost("boutique.app.neriacorp.com"), "boutique", "app slug from .app host");
assertEqual(resolveBoutiqueSlugFromHost("heritia.neriacorp.com"), "heritia", "explicit B2B short alias");
assertEqual(
  resolveBackendUrl({ hostname: "localhost", envUrl: "" }),
  DEFAULT_LOCAL_API,
  "local host keeps local api",
);
assertEqual(
  resolveBackendUrl({ hostname: "127.0.0.1", envUrl: "http://localhost:8000" }),
  "http://localhost:8000",
  "loopback keeps env local api",
);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("backendUrl standalone: ok");
