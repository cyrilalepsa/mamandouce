import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

test('grossesse is canonical pregnancy hub route', () => {
  const app = read('src/App.jsx');
  const grossesse = read('src/pages/GrossessePage.jsx');
  const cycle = read('src/pages/CycleTrackingPage.jsx');
  const section = read('src/pages/SectionDetailPage.jsx');

  assert.match(app, /path="\/grossesse" element=\{<ProtectedRoute><GrossessePage/);
  assert.match(app, /path="\/pregnancy-fertility" element=\{<Navigate to="\/grossesse" replace \/>}/);
  assert.match(grossesse, /data-testid="grossesse-page"/);
  assert.match(grossesse, /MaternityLeaveSummaryCard/);
  assert.match(grossesse, /grossesse-pregnant-panel/);
  assert.doesNotMatch(section, /MaternityLeaveSummaryCard/);
  assert.match(cycle, /navigate\('\/grossesse'\)/);
  assert.doesNotMatch(cycle, /if \(isPregnant\) \{\s*return \(/);
});
