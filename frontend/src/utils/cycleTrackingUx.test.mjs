import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

test('grossesse route aliases pregnancy hub', () => {
  const app = read('src/App.jsx');
  assert.match(app, /path="\/grossesse" element=\{<Navigate to="\/pregnancy-fertility" replace \/>}/);
});

test('birth declaration shows congrats modal on confirm only', () => {
  const section = read('src/components/settings/PregnancyInfoSection.jsx');
  assert.match(section, /setShowBirthCongrats\(true\)/);
  assert.match(section, /variant="birth"/);
  assert.match(section, /navigate\('\/postpartum'\)/);
});
