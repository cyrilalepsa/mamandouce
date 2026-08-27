import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

test('outils tool pages use explicit back route to section outils', () => {
  for (const rel of [
    'src/pages/outils/BabySleepPage.jsx',
    'src/pages/outils/PediatricianNotesPage.jsx',
    'src/pages/outils/EmergencyInfoPage.jsx',
  ]) {
    const src = read(rel);
    assert.match(src, /navigate\('\/section\/outils'\)/, rel);
    assert.doesNotMatch(src, /navigate\(-1\)/, rel);
  }
});

test('SectionDetailPage back button targets journey steps explicitly', () => {
  const src = read('src/pages/SectionDetailPage.jsx');
  assert.match(src, /sectionBackPath = '\/journey-steps'/);
  assert.match(src, /navigate\(sectionBackPath\)/);
});

test('CycleTrackingPage back button targets journey steps explicitly', () => {
  const src = read('src/pages/CycleTrackingPage.jsx');
  assert.match(src, /backPath="\/journey-steps"/);
  assert.doesNotMatch(src, /onClick=\{\(\) => navigate\('\/'\)\}/);
});

test('PediatricianNotesCard form fields use dark readable text', () => {
  const src = read('src/components/outils/PediatricianNotesCard.jsx');
  assert.match(src, /text-slate-900/);
  assert.match(src, /FORM_FIELD_CLASS/);
});

test('PushNotificationReminder uses dark text on light card', () => {
  const src = read('src/components/home/PushNotificationReminder.jsx');
  assert.match(src, /text-slate-700/);
  assert.match(src, /text-slate-800/);
  assert.doesNotMatch(src, /text-white\/90/);
});
