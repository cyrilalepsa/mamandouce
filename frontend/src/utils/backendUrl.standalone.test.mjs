/**
 * Tests exécutables de la résolution d'hôte standalone MamanDouce.
 * Lancé par pytest (node --input-type=module) — pas de runner Vite requis.
 */
import {
  APP_SLUG_MAMANDOUCE,
  DEFAULT_LOCAL_API,
  DEFAULT_PUBLIC_API,
  apiUrl,
  getApiBase,
  getBackendUrl,
  isReservedNeriaHost,
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
}

assertEqual(isStandaloneMamandouceHost("neriacorp.com"), false, "core host is not standalone");
assertEqual(isStandaloneMamandouceHost("localhost"), false, "localhost is not standalone");
assertEqual(isReservedNeriaHost("hub.neriacorp.com"), true, "hub is reserved");
assertEqual(isReservedNeriaHost("api.neriacorp.com"), true, "api is reserved");
assertEqual(isReservedNeriaHost("cockpit.neriacorp.com"), true, "cockpit is reserved");
assertEqual(isReservedNeriaHost("mamandouce.neriacorp.com"), true, "mamandouce label is reserved");
assertEqual(resolveBoutiqueSlugFromHost("hub.neriacorp.com"), null, "hub is not a B2B tenant");
assertEqual(resolveBoutiqueSlugFromHost("api.neriacorp.com"), null, "api is not a B2B tenant");
assertEqual(resolveBoutiqueSlugFromHost("cockpit.neriacorp.com"), null, "cockpit is not a B2B tenant");
assertEqual(resolveBoutiqueSlugFromHost("mamandouce.neriacorp.com"), null, "MD is standalone not B2B");
assertEqual(resolveAppSlugFromHost("hub.neriacorp.com"), null, "hub slug is null");
assertEqual(resolveAppSlugFromHost("mamandouce.neriacorp.com"), APP_SLUG_MAMANDOUCE, "MD slug");
assertEqual(
  resolveBoutiqueSlugFromHost("odelicesenfamille.neriacorp.com"),
  "odelicesenfamille",
  "B2B slug from first-level neriacorp host",
);
assertEqual(
  resolveAppSlugFromHost("odelicesenfamille.neriacorp.com"),
  "odelicesenfamille",
  "B2B app slug",
);
assertEqual(
  resolveBackendUrl({
    hostname: "mamandouce.neriacorp.com",
    envUrl: `https://legacy.${["up", "railway", "app"].join(".")}/`,
  }),
  DEFAULT_PUBLIC_API,
  "legacy platform host is ignored on standalone",
);
assertEqual(
  resolveBackendUrl({ hostname: "odelicesenfamille.neriacorp.com", envUrl: "" }),
  DEFAULT_PUBLIC_API,
  "B2B host uses N2 api",
);
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
assertEqual(
  getBackendUrl({ hostname: "mamandouce.neriacorp.com", envUrl: "http://localhost:8000" }),
  DEFAULT_PUBLIC_API,
  "getBackendUrl ignores baked localhost on standalone",
);
assertEqual(
  getApiBase({ hostname: "mamandouce.neriacorp.com", envUrl: "" }),
  `${DEFAULT_PUBLIC_API}/api`,
  "getApiBase uses N2 on standalone",
);
assertEqual(
  apiUrl("/api/neriacorp/media", { hostname: "mamandouce.neriacorp.com", envUrl: "" }),
  `${DEFAULT_PUBLIC_API}/api/neriacorp/media`,
  "apiUrl Cloudinary media",
);
assertEqual(
  apiUrl("/api/notifications/vapid-public-key", { hostname: "mamandouce.neriacorp.com" }),
  `${DEFAULT_PUBLIC_API}/api/notifications/vapid-public-key`,
  "apiUrl VAPID",
);
assertEqual(
  apiUrl("/api/scanner/publications/abc", { hostname: "mamandouce.neriacorp.com" }),
  `${DEFAULT_PUBLIC_API}/api/scanner/publications/abc`,
  "apiUrl QR publication",
);
assertEqual(
  apiUrl("http://localhost:8000/api/x", { hostname: "mamandouce.neriacorp.com" }),
  DEFAULT_PUBLIC_API,
  "apiUrl drops localhost fallback on standalone",
);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("backendUrl standalone: ok");
