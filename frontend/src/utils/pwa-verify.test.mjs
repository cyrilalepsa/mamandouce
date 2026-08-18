/**
 * Garde-fous PWA / API après PR #12 — exécuté par `npm test`.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

test("PR10-SAFEBOOT marker is present in index.html", () => {
  const html = read("index.html");
  assert.match(html, /BUILD_VERSION: PR10-SAFEBOOT/);
  assert.match(html, /name="mamandouce-build"/);
});

test("service workers never intercept api.neriacorp.com", () => {
  for (const rel of ["public/sw.js", "public/service-worker.js"]) {
    const src = read(rel);
    assert.match(src, /api\.neriacorp\.com/);
    assert.match(src, /url\.origin !== self\.location\.origin/);
    assert.doesNotMatch(
      src,
      /!url\.origin\.includes\(self\.location\.origin\) && !url\.pathname\.startsWith\('\/api\/'\)/,
    );
  }
});

test("PWA manifest is scoped to mamandouce.neriacorp.com", () => {
  const manifest = JSON.parse(read("public/manifest.json"));
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.id, "https://mamandouce.neriacorp.com/");
});

test("no legacy boutique wildcard in frontend sources", () => {
  const needle = "." + "app" + ".neriacorp.com";
  for (const rel of [
    "src/utils/backendUrl.js",
    "public/sw.js",
    "public/service-worker.js",
    "public/manifest.json",
  ]) {
    assert.doesNotMatch(read(rel), new RegExp(needle.replace(/\./g, "\\.")));
  }
});

test("auth module uses /api/v1/auth prefix", () => {
  const src = read("src/utils/api.jsx");
  assert.match(src, /authApiUrl\("login"\)/);
  assert.match(src, /authApiUrl\("register"\)/);
  assert.match(src, /authApiUrl\("forgot-password"\)/);
  assert.doesNotMatch(src, /\$\{API\(\)\}\/auth\/login/);
  assert.doesNotMatch(src, /apiUrl\("\/auth\/forgot-password"\)/);
  const page = read("src/pages/AuthPage.jsx");
  assert.match(page, /authApiUrl\("forgot-password"\)/);
});

test("src modules resolve API via apiUrl / getApiBase (no localhost fallback)", () => {
  const files = [
    "src/utils/api.jsx",
    "src/utils/fetusAssets.js",
    "src/components/settings/PushNotificationsSection.jsx",
    "src/components/admin/PublicationQRCode.jsx",
    "src/components/admin/DashboardTab.jsx",
    "src/components/admin/AndroidExportTab.jsx",
    "src/contexts/HomeLayoutContext.jsx",
  ];
  for (const rel of files) {
    const src = read(rel);
    assert.match(src, /backendUrl/, rel);
    assert.doesNotMatch(src, /localhost:8000/, rel);
    assert.doesNotMatch(src, /import\.meta\.env\.VITE_BACKEND_URL/, rel);
  }
});
