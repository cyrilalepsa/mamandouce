import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("cockpit exposes content visuals module at top", () => {
  const cockpit = readFileSync(join(root, "src/pages/CockpitPage.jsx"), "utf8");
  assert.match(cockpit, /ContentVisualsModule/);
  assert.match(cockpit, /cockpit-content-visuals-section/);
  assert.match(cockpit, /cockpit-tile-content-visuals/);
  assert.match(cockpit, /Gestion des Contenus/);
  const moduleIdx = cockpit.indexOf("cockpit-content-visuals");
  const whatsNewIdx = cockpit.indexOf("cockpit-whats-new");
  assert.ok(moduleIdx > -1 && whatsNewIdx > moduleIdx);
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

test("admin API exposes content-config endpoints", () => {
  const api = readFileSync(join(root, "src/utils/api.jsx"), "utf8");
  assert.match(api, /getContentConfigs/);
  assert.match(api, /upsertContentConfig/);
  assert.match(api, /uploadContentConfigImage/);
  assert.match(api, /\/admin\/content-configs/);
});
