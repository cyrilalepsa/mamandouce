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
  const registry = read('src/utils/colorRegistry.js');
  assert.match(tokens, /SECTION_COLOR_REGISTRY/);
  assert.match(registry, /preconception:/);
  assert.match(registry, /pregnancy:/);
  assert.match(registry, /postpartum:/);
  assert.match(registry, /services:/);
  assert.match(registry, /outils: MAGENTA_SECTION/);
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

test('interactive card helpers include shadow relief and bounce motion', () => {
  const tokens = read('src/utils/accentTokens.js');
  assert.match(tokens, /CARD_INTERACTIVE_SHADOW/);
  assert.match(tokens, /CARD_INTERACTIVE_MOTION/);
  assert.match(tokens, /hover:-translate-y-1/);
  assert.match(tokens, /active:scale-95/);
});

test('postpartum hub cards inherit parent section accent', () => {
  const hub = read('src/components/postpartum/PostpartumHubCard.jsx');
  assert.match(hub, /sectionInteractiveCardClasses\(POSTPARTUM_SECTION\)/);
  assert.match(read('src/pages/PostpartumAlimentationPage.jsx'), /PostpartumHubCard/);
  assert.match(read('src/pages/PostpartumSoinsPage.jsx'), /PostpartumHubCard/);
  assert.match(read('src/pages/PostpartumSecuritePage.jsx'), /PostpartumHubCard/);
});

test('derived outils and preconception pages use section reading cards', () => {
  assert.match(read('src/components/outils/BabySleepAudioCard.jsx'), /sectionReadingCardClasses\('outils'/);
  assert.match(read('src/components/outils/PediatricianNotesCard.jsx'), /sectionReadingCardClasses\('outils'/);
  assert.match(read('src/pages/PreconceptionTipsPage.jsx'), /sectionReadingCardClasses\('preconception'/);
  assert.match(read('src/pages/PreconceptionTipsPage.jsx'), /min-h-screen gradient-bg/);
});
