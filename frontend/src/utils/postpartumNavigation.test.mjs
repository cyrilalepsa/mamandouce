import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  POSTPARTUM_SECTION_ID,
  POSTPARTUM_CATEGORIES,
  getPostpartumCategoryById,
  getPostpartumItemsForCategory,
  getJourneyPostpartumItems,
} from '../config/sectionNavigation.js';
import { SECTION_COLOR_REGISTRY } from './colorRegistry.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

test('postpartum section id matches colorRegistry key', () => {
  assert.equal(POSTPARTUM_SECTION_ID, 'postpartum');
  assert.ok(SECTION_COLOR_REGISTRY.postpartum);
  assert.equal(SECTION_COLOR_REGISTRY.postpartum.accent, 'green');
});

test('postpartum hub exposes four categories from central config', () => {
  assert.equal(POSTPARTUM_CATEGORIES.length, 4);
  assert.deepEqual(
    POSTPARTUM_CATEGORIES.map((c) => c.id),
    ['alimentation', 'soins', 'securite', 'rdv']
  );
});

test('postpartum sub-items are keyed by category id', () => {
  assert.equal(getPostpartumItemsForCategory('alimentation').length, 4);
  assert.equal(getPostpartumItemsForCategory('soins').length, 2);
  assert.equal(getPostpartumItemsForCategory('securite').length, 2);
  assert.equal(getPostpartumCategoryById('rdv')?.route, '/postpartum/rdv');
});

test('PostpartumPage maps categories from config without hardcoded gradients', () => {
  const page = read('src/pages/PostpartumPage.jsx');
  assert.match(page, /POSTPARTUM_CATEGORIES/);
  assert.match(page, /PostpartumCategoryCard/);
  assert.match(page, /mainCategories\.map/);
  assert.doesNotMatch(page, /color: 'yellow'/);
  assert.doesNotMatch(page, /CategoryDetailTile/);
});

test('postpartum sub-pages use config grid and section header', () => {
  for (const rel of [
    'src/pages/PostpartumAlimentationPage.jsx',
    'src/pages/PostpartumSoinsPage.jsx',
    'src/pages/PostpartumSecuritePage.jsx',
    'src/pages/PostpartumRdvPage.jsx',
  ]) {
    const src = read(rel);
    assert.match(src, /sectionNavigation/);
    assert.match(src, /PostpartumSectionHeader/);
    assert.doesNotMatch(src, /vibrantBg/);
    assert.doesNotMatch(src, /from-yellow-400/);
  }
  assert.match(read('src/pages/PostpartumAlimentationPage.jsx'), /PostpartumCategoryGrid/);
});

test('SectionDetailPage builds postpartum items from journey config', () => {
  const detail = read('src/pages/SectionDetailPage.jsx');
  assert.match(detail, /getJourneyPostpartumItems/);
  assert.match(detail, /buildPostpartumSectionItems/);
  assert.doesNotMatch(detail, /'postpartum': \[/);

  const journeyItems = getJourneyPostpartumItems();
  assert.equal(journeyItems.length, 4);
  assert.match(journeyItems[0].id, /postpartum-/);
});

test('PostpartumCategoryCard applies section theme from config', () => {
  const card = read('src/components/postpartum/PostpartumCategoryCard.jsx');
  assert.match(card, /POSTPARTUM_SECTION_ID/);
  assert.match(card, /sectionInteractiveCardClasses\(POSTPARTUM_SECTION_ID\)/);
  assert.doesNotMatch(card, /style=\{\{[^}]*gradient/i);
});
