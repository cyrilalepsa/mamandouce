import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

test('SECTION_ACCENT maps six journey sections to charter colors', () => {
  const tokens = read('src/utils/accentTokens.js');
  assert.match(tokens, /preconception: 'yellow'/);
  assert.match(tokens, /pregnancy: 'blue'/);
  assert.match(tokens, /'baby-preparation': 'red'/);
  assert.match(tokens, /postpartum: 'green'/);
  assert.match(tokens, /services: 'violet'/);
  assert.match(tokens, /outils: 'slate'/);
});

test('section card helpers expose interactive gradient and reading border styles', () => {
  const tokens = read('src/utils/accentTokens.js');
  assert.match(tokens, /sectionInteractiveCardClasses/);
  assert.match(tokens, /sectionReadingCardClasses/);
  assert.match(tokens, /border-yellow-400/);
  assert.match(tokens, /bg-gradient-to-br from-white via-yellow-50/);
  assert.match(tokens, /text-slate-800/);
});

test('JourneySteps and SectionDetail inherit parent section accent on cards', () => {
  const journey = read('src/pages/JourneyStepsPage.jsx');
  assert.match(journey, /sectionInteractiveCardClasses\(sectionId\)/);
  assert.doesNotMatch(journey, /accentFromBgColor\(item\.color/);

  const detail = read('src/pages/SectionDetailPage.jsx');
  assert.match(detail, /sectionAccent=\{sectionAccent\}/);
  assert.match(detail, /sectionInteractiveCardClasses\(sectionAccent/);
  assert.match(detail, /min-h-screen gradient-bg/);
  assert.doesNotMatch(detail, /meta\.bgGradient/);
});

test('derived outils and preconception pages use section reading cards', () => {
  assert.match(read('src/components/outils/BabySleepAudioCard.jsx'), /sectionReadingCardClasses\('outils'/);
  assert.match(read('src/components/outils/PediatricianNotesCard.jsx'), /sectionReadingCardClasses\('outils'/);
  assert.match(read('src/pages/PreconceptionTipsPage.jsx'), /sectionReadingCardClasses\('preconception'/);
  assert.match(read('src/pages/PreconceptionTipsPage.jsx'), /min-h-screen gradient-bg/);
});
