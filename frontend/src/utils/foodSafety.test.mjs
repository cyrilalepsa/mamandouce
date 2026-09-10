import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  dedupeFoodsByName,
  getFoodStatusLabel,
  getFoodStatusStyle,
  normalizeFoodStatus,
  normalizeScannedFood,
  verdictToSafetyStatus,
} from "./foodSafety.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("normalizes historical status aliases", () => {
  assert.equal(normalizeFoodStatus("yes"), "safe");
  assert.equal(normalizeFoodStatus("allowed"), "safe");
  assert.equal(normalizeFoodStatus("precaution"), "caution");
  assert.equal(normalizeFoodStatus("forbidden"), "unsafe");
});

test("never exposes unknown label to users", () => {
  assert.equal(getFoodStatusLabel("unknown"), "À consommer avec précaution");
  assert.equal(getFoodStatusLabel(null), "À consommer avec précaution");
  assert.equal(getFoodStatusLabel("safe"), "Accepté / Sûr");
  assert.equal(getFoodStatusLabel("unsafe"), "À éviter");
});

test("maps AI verdicts to canonical safety statuses", () => {
  assert.equal(verdictToSafetyStatus("autorise"), "safe");
  assert.equal(verdictToSafetyStatus("deconseille"), "unsafe");
  assert.equal(verdictToSafetyStatus("limite"), "caution");
});

test("normalizeScannedFood renames generic unknown names", () => {
  const product = normalizeScannedFood({
    name: "Produit inconnu",
    safe_for_pregnancy: "unknown",
    is_unknown: true,
    explanation: "Analyse IA",
  });
  assert.equal(product.name, "Produit analysé par l'IA");
  assert.equal(product.safe_for_pregnancy, "caution");
  assert.equal(product.can_contribute, true);
});

test("uses vivid high-contrast badge classes and icons", () => {
  const safe = getFoodStatusStyle("safe");
  assert.equal(safe.status, "safe");
  assert.equal(safe.label, "Accepté / Sûr");
  assert.equal(safe.icon, "✅");
  assert.match(safe.className, /bg-emerald-600.*text-white.*font-bold/);
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
  assert.match(page, /Vos aliments du quotidien/);
  assert.doesNotMatch(page, /\{total\}.*aliments référencés/);
});

test("scanner exposes personal and community actions with canonical AI status", () => {
  const scanner = readFileSync(join(root, "src/pages/FoodScanner.jsx"), "utf8");
  const aiScanner = readFileSync(
    join(root, "src/components/food/FoodScannerAI.jsx"),
    "utf8",
  );
  const actions = readFileSync(
    join(root, "src/components/food/ScannedProductActions.jsx"),
    "utf8",
  );
  assert.match(scanner, /ScannedProductActions/);
  assert.match(scanner, /Scanner IA/);
  assert.match(aiScanner, /ScannedProductActions/);
  assert.match(aiScanner, /getFoodStatusLabel/);
  assert.match(actions, /bibliothèque personnelle/);
  assert.match(actions, /Proposer à la communauté/);
  assert.match(actions, /api\.scan\.save/);
  assert.doesNotMatch(aiScanner, /20 points|Maman Contributrice/);
  const badges = readFileSync(
    join(root, "src/components/solidarity/BadgesCard.jsx"),
    "utf8",
  );
  const moderation = readFileSync(
    join(root, "src/components/admin/FoodsTab.jsx"),
    "utf8",
  );
  assert.doesNotMatch(badges, /maman_contributrice/);
  assert.match(badges, /2 contributions \+ 1 parrainage/);
  assert.match(moderation, /contribution_credit/);
});
