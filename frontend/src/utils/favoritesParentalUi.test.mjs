import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

test("favorites client uses canonical v1 route and backend keys", () => {
  const api = read("src/utils/api.jsx");
  assert.match(api, /\/v1\/food\/favorites/);
  assert.match(api, /food_name: food\.food_name \|\| food\.name/);
  assert.match(api, /safety_level: food\.safety_level \|\| food\.status/);
  assert.match(api, /notes: food\.notes \|\| food\.reason/);
});

test("food badges have a subtle white top sheen", () => {
  const library = read("src/pages/FoodLibraryPage.jsx");
  assert.match(library, /bg-gradient-to-b from-white\/30 to-transparent/);
  assert.match(library, /food-status-\$\{badge\.status\}/);
});

test("favorite hearts use elevated filled and unfilled states", () => {
  for (const rel of ["src/pages/FoodLibraryPage.jsx", "src/pages/FoodScanner.jsx"]) {
    const source = read(rel);
    assert.match(source, /drop-shadow-md/);
    assert.match(source, /fill-rose-500 text-rose-500/);
    assert.match(source, /fill-white text-slate-300/);
  }
});

test("parental leave cards use pastel headers and readable expanded panels", () => {
  const page = read("src/pages/ParentalLeavePage.jsx");
  assert.match(page, /from-sky-100 via-blue-100 to-indigo-100/);
  assert.match(page, /from-violet-100 via-purple-100 to-pink-100/);
  assert.doesNotMatch(page, /from-indigo-500 to-blue-500/);
  assert.doesNotMatch(page, /rounded-full mb-4/);
  assert.match(page, /px-5 pb-5 pt-4/);
  assert.match(page, /text-sm text-slate-600 leading-relaxed/);
});
