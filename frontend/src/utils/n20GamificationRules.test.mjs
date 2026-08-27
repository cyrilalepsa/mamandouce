import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

test('tirelire page surfaces N20 gamification rules below how-it-works', () => {
  const page = read('src/pages/TireliirePage.jsx');
  const rules = read('src/components/solidarity/N20GamificationRulesCard.jsx');

  assert.match(page, /N20GamificationRulesCard/);
  assert.match(page, /Comment ça marche/);
  assert.match(rules, /n20-gamification-rules-card/);
  assert.match(rules, /Règles de la communauté & Badges N20/);
  assert.match(rules, /Actions rémunératrices/);
  assert.match(rules, /Parrainage d'amies/);
  assert.match(rules, /Contribution & partage solidaire/);
  assert.match(rules, /Complétion de profil/);
  assert.match(rules, /Utilisation du solde N20/);
  assert.match(rules, /Pack Premium/);
  assert.match(rules, /Post-partum/);
  assert.match(rules, /Système de badges/);
  assert.match(rules, /5 contributions \+ 3 parrainages/);
});
