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

test('Home uses centered PageDots and dock scanner mirrored with info bubble', () => {
  const app = read('src/App.jsx');
  assert.doesNotMatch(app, /BottomNav/);
  assert.doesNotMatch(app, /<ScannerFab \/>/);

  const pagination = read('src/components/home/HomePagination.jsx');
  assert.doesNotMatch(pagination, /ScannerDockButton/);
  assert.match(pagination, /data-testid="page-dots"/);

  const home = read('src/components/home/CustomizableHome.jsx');
  assert.match(home, /<PageDots/);
  assert.match(home, /ScannerDockButton/);
  assert.match(home, /openScanner/);

  const info = read('src/components/home/TutorialPopup.jsx');
  assert.match(info, /bottom: '0\.5rem'/);
  assert.match(info, /left: '0\.75rem'/);

  const dock = read('src/components/ScannerDockButton.jsx');
  assert.match(dock, /bottom: BUBBLE_BOTTOM/);
  assert.match(dock, /right: BUBBLE_SIDE/);
  assert.match(dock, /BUBBLE_SIZE = 38/);
  assert.match(dock, /home-dock-scanner/);
});

test('Journey steps page does not mount global scanner FAB', () => {
  const app = read('src/App.jsx');
  assert.doesNotMatch(app, /ScannerFab/);
  const journey = read('src/pages/JourneyStepsPage.jsx');
  assert.doesNotMatch(journey, /ScannerDockButton/);
  assert.doesNotMatch(journey, /scanner-fab/);
});

test('Scanner overlay opens camera directly and redirects to product detail', () => {
  const app = read('src/App.jsx');
  assert.match(app, /ScannerOverlayProvider/);

  const overlay = read('src/components/scanner/ScannerCameraOverlay.jsx');
  assert.match(overlay, /data-testid="scanner-camera-overlay"/);
  assert.match(overlay, /Html5Qrcode/);
  assert.match(overlay, /onScanComplete/);

  const ctx = read('src/contexts/ScannerOverlayContext.jsx');
  assert.match(ctx, /detailOnly: true/);
  assert.match(ctx, /navigate\('\/scanner'/);

  const scanner = read('src/pages/FoodScanner.jsx');
  assert.match(scanner, /detailOnly/);
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

test('accent token maps outils section to magenta rose', () => {
  const registry = read('src/utils/colorRegistry.js');
  assert.match(registry, /accent: 'magenta'/);
  assert.match(registry, /border-pink-400/);
  assert.match(registry, /via-pink-50\/60/);
});
