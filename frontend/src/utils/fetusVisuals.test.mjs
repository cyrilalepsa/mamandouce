import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  getFetusImageUrl,
  hydrateCloudinaryFromApi,
} from "./fetusAssets.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("saved week URL overrides generated Cloudinary and local fallbacks", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("/neriacorp/media")) {
      return {
        ok: true,
        json: async () => ({
          cloud_name: "demo",
          folder: "mamandouce/fetus",
          transforms: "f_auto,q_auto",
        }),
      };
    }
    return {
      ok: true,
      json: async () => ({
        images: {
          "12": "https://res.cloudinary.com/demo/image/upload/mamandouce/foetus/week-12-custom.webp",
        },
      }),
    };
  };
  try {
    await hydrateCloudinaryFromApi();
    assert.equal(
      getFetusImageUrl(12),
      "https://res.cloudinary.com/demo/image/upload/mamandouce/foetus/week-12-custom.webp",
    );
    assert.match(getFetusImageUrl(13), /res\.cloudinary\.com.*week-14/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("admin manager renders 40 week upload controls", () => {
  const source = readFileSync(
    join(root, "src/components/admin/FetusVisualsTab.jsx"),
    "utf8",
  );
  assert.match(source, /Gestion des Visuels Fœtus \(40 Semaines\)/);
  assert.match(source, /Array\.from\(\{ length: 40 \}/);
  assert.match(source, /uploadFetusVisual/);
  assert.match(source, /mamandouce\/foetus/);
  assert.match(source, /upload-fetus-week-/);
  const tips = readFileSync(join(root, "src/pages/WeeklyTipsPage.jsx"), "utf8");
  assert.match(tips, /imageUrl=\{fetusImages\[String\(selectedWeek\)\]/);
});
