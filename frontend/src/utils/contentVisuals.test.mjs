import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("cockpit exposes content visuals module at top", () => {
  const cockpit = readFileSync(join(root, "src/pages/CockpitPage.jsx"), "utf8");
  assert.match(cockpit, /CockpitMamanDouceHeader/);
  const header = readFileSync(
    join(root, "src/components/admin/CockpitMamanDouceHeader.jsx"),
    "utf8",
  );
  assert.match(header, /cockpit-api-password-btn/);
  assert.match(cockpit, /ContentVisualsModule/);
  assert.match(cockpit, /cockpit-content-visuals-section/);
  assert.match(cockpit, /<ContentVisualsModule/);
  const headerIdx = cockpit.indexOf("CockpitMamanDouceHeader");
  const moduleIdx = cockpit.indexOf("cockpit-content-visuals");
  const communityIdx = cockpit.indexOf("GESTION COMMUNAUTÉ");
  assert.ok(headerIdx > -1 && moduleIdx > headerIdx && communityIdx > moduleIdx);
  assert.doesNotMatch(cockpit, /fetus-visuals/);
  assert.doesNotMatch(cockpit, /FetusVisualsTab/);
});

test("content visuals module defines three responsive tabs", () => {
  const source = readFileSync(
    join(root, "src/components/admin/ContentVisualsModule.jsx"),
    "utf8",
  );
  assert.match(source, /Gestion des Contenus &amp; Visuels/);
  assert.match(source, /content-visuals-tab-\$\{tab\.id\}/);
  assert.match(source, /Visuels Fœtus/);
  assert.match(source, /Images & Bannières App/);
  assert.match(source, /overflow-x-auto/);
  assert.match(source, /FetusVisualsTab/);
  assert.match(source, /AppBannersTab/);
  assert.match(source, /LegalContentTab/);
});

test("tenant mobile embed route loads cockpit body with content visuals first", () => {
  const app = readFileSync(join(root, "src/App.jsx"), "utf8");
  assert.match(app, /embed\/cockpit\/tenant-dashboard/);
  assert.match(app, /CockpitPage tenantEmbed/);
  const cockpit = readFileSync(join(root, "src/pages/CockpitPage.jsx"), "utf8");
  assert.match(cockpit, /isTenantEmbed/);
  assert.match(cockpit, /cockpit-tenant-embed/);
  const manifest = readFileSync(join(root, "public/neriacorp-app.json"), "utf8");
  assert.match(manifest, /tenant_mobile_embed_path/);
});

test("admin API exposes content-config endpoints", () => {
  const api = readFileSync(join(root, "src/utils/api.jsx"), "utf8");
  assert.match(api, /getContentConfigs/);
  assert.match(api, /upsertContentConfig/);
  assert.match(api, /uploadContentConfigImage/);
  assert.match(api, /\/admin\/content-configs/);
});
