import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

test('ScannerFab is wired in App with glassmorphism scanner route', () => {
  const app = read('src/App.jsx');
  assert.match(app, /import ScannerFab from '\.\/components\/ScannerFab'/);
  assert.match(app, /<ScannerFab \/>/);
  const fab = read('src/components/ScannerFab.jsx');
  assert.match(fab, /data-testid="scanner-fab"/);
  assert.match(fab, /bottom-20 right-4/);
  assert.match(fab, /border-pink-500/);
  assert.match(fab, /navigate\('\/scanner'\)/);
});

test('FoodScanner shows unreferenced product banner for barcode scans', () => {
  const scanner = read('src/pages/FoodScanner.jsx');
  assert.match(scanner, /barcodeNotFound/);
  assert.match(scanner, /barcode-not-found-card/);
  assert.match(scanner, /scanner\.addProductN2O/);
  assert.match(scanner, /scanner\.productNotListed/);
});

test('Outils section is the sixth journey step with three tool cards', () => {
  const journey = read('src/pages/JourneyStepsPage.jsx');
  assert.match(journey, /SECTIONS_ORDER = \['preconception', 'pregnancy', 'baby-preparation', 'postpartum', 'services', 'outils'\]/);
  assert.match(journey, /'outils':/);

  const section = read('src/pages/SectionDetailPage.jsx');
  assert.match(section, /'outils':/);
  assert.match(section, /baby-sleep/);
  assert.match(section, /pediatrician-notes/);
  assert.match(section, /emergency-birth/);

  const layout = read('src/contexts/HomeLayoutContext.jsx');
  assert.match(layout, /id: 'outils'/);

  const routes = read('src/App.jsx');
  assert.match(routes, /\/outils\/bonne-nuit-bebe/);
  assert.match(routes, /\/outils\/cher-pediatre/);
  assert.match(routes, /\/outils\/fiche-urgence/);
});

test('accent token maps outils section to slate', () => {
  const tokens = read('src/utils/accentTokens.js');
  assert.match(tokens, /outils: 'slate'/);
});
