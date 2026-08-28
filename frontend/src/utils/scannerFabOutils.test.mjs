import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

test('PageHeader and BackButton prioritize onBack then backPath then history', () => {
  const header = read('src/components/PageHeader.jsx');
  assert.match(header, /onBack/);
  assert.match(header, /backPath/);
  assert.match(header, /BackButton/);

  const backButton = read('src/components/BackButton.jsx');
  assert.match(backButton, /useBackNavigation/);

  const hook = read('src/hooks/useBackNavigation.js');
  assert.match(hook, /if \(typeof onBack === 'function'\)/);
  assert.match(hook, /if \(backPath\)/);
  assert.match(hook, /navigate\(-1\)/);
});

test('CycleTrackingPage back button targets journey steps explicitly', () => {
  const src = read('src/pages/CycleTrackingPage.jsx');
  assert.match(src, /backPath="\/journey-steps"/);
  assert.doesNotMatch(src, /onClick=\{\(\) => navigate\('\/'\)\}/);
});

test('Home uses minimal PageDots dock with scanner on the right, not BottomNav', () => {
  const app = read('src/App.jsx');
  assert.doesNotMatch(app, /BottomNav/);

  const pagination = read('src/components/home/HomePagination.jsx');
  assert.match(pagination, /ScannerDockButton/);
  assert.match(pagination, /navigate\('\/scanner'\)/);
  assert.match(pagination, /data-testid="page-dots"/);

  const home = read('src/components/home/CustomizableHome.jsx');
  assert.match(home, /<PageDots/);
});

test('ScannerFab floats on non-home pages only', () => {
  const app = read('src/App.jsx');
  assert.match(app, /<ScannerFab \/>/);

  const fab = read('src/components/ScannerFab.jsx');
  assert.match(fab, /location\.pathname === '\/'/);
  assert.match(fab, /data-testid="scanner-fab"/);
  assert.match(fab, /bottom-20 right-4/);
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
