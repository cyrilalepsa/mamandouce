import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

test('JourneyStepsPage does not restore expanded sections from localStorage', () => {
  const src = read('src/pages/JourneyStepsPage.jsx');
  assert.match(src, /useState\(\[\]\)/);
  assert.doesNotMatch(src, /localStorage\.getItem\('mamandouce_expanded_journey_sections'\)/);
});

test('CollapsibleSection starts closed without pinned auto-open', () => {
  const src = read('src/components/home/navigation/_shared.jsx');
  assert.match(src, /useState\(defaultOpen\)/);
  assert.doesNotMatch(src, /useState\(defaultOpen \|\| pinned\)/);
  assert.doesNotMatch(src, /if \(pinned\) \{\s*setIsOpen\(true\)/);
  assert.doesNotMatch(src, /localStorage\.getItem\('mamandouce_pinned_sections'\)/);
});

test('postpartum accordions default to closed', () => {
  for (const rel of [
    'src/components/postpartum/AppointmentsSection.jsx',
    'src/components/postpartum/BreastfeedingSection.jsx',
    'src/components/postpartum/FormulaSection.jsx',
    'src/components/postpartum/DiapersSection.jsx',
    'src/components/postpartum/BabywearingSection.jsx',
    'src/components/postpartum/DiversificationSection.jsx',
    'src/components/postpartum/DifficultiesSection.jsx',
    'src/components/postpartum/PrecautionsSection.jsx',
  ]) {
    const src = read(rel);
    assert.doesNotMatch(src, /defaultOpen=\{true\}/, rel);
    assert.doesNotMatch(src, /defaultOpen:\s*true/, rel);
    assert.doesNotMatch(src, /defaultOpen=\{index === 0\}/, rel);
  }
});

test('list pages start with collapsed groups', () => {
  assert.match(read('src/pages/BabyPrepTipsPage.jsx'), /useState\(null\)/);
  assert.match(read('src/pages/BabyPrepTipsPage.jsx'), /essential: false/);
  assert.match(read('src/pages/BirthListPage.jsx'), /=== true/);
  assert.match(read('src/pages/UpdatesHistoryPage.jsx'), /useState\(null\)/);
  assert.match(read('src/pages/PostpartumPage.jsx'), /useState\(null\)/);
});
