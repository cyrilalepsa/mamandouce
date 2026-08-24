import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  dedupeFoodsByName,
  getFoodStatusStyle,
  normalizeFoodStatus,
} from "./foodSafety.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("normalizes historical status aliases", () => {
  assert.equal(normalizeFoodStatus("yes"), "safe");
  assert.equal(normalizeFoodStatus("allowed"), "safe");
  assert.equal(normalizeFoodStatus("precaution"), "caution");
  assert.equal(normalizeFoodStatus("forbidden"), "unsafe");
});

test("uses vivid high-contrast badge classes and icons", () => {
  assert.deepEqual(
    getFoodStatusStyle("safe"),
    {
      status: "safe",
      icon: "✅",
      className: "bg-emerald-600 text-white border-emerald-700 font-bold",
    },
  );
  assert.match(getFoodStatusStyle("caution").className, /bg-amber-500.*text-white.*font-bold/);
  assert.match(getFoodStatusStyle("avoid").className, /bg-orange-600.*text-white.*font-bold/);
  assert.match(getFoodStatusStyle("unsafe").className, /bg-red-600.*text-white.*font-bold/);
  assert.equal(getFoodStatusStyle("unsafe").icon, "🚫");
});

test("deduplicates foods without changing order", () => {
  const foods = dedupeFoodsByName([
    { name: "Abricot" },
    { name: "Banane" },
    { name: " abricot " },
    null,
  ]);
  assert.deepEqual(foods.map(food => food.name), ["Abricot", "Banane"]);
});

test("FoodLibrary renders canonical status, never legacy yes", () => {
  const page = readFileSync(join(root, "src/pages/FoodLibraryPage.jsx"), "utf8");
  assert.doesNotMatch(page, /safe_for_pregnancy === ['"]yes['"]/);
  assert.match(page, /food-status-\$\{badge\.status\}/);
  assert.match(page, /setPage\(1\)/);
  assert.match(page, /requestIdRef/);
});
