import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

test('maternity leave card surfaces CPAM gap info and Ameli resources link', () => {
  const card = read('src/components/pregnancy/MaternityLeaveSummaryCard.jsx');
  const gapInfo = read('src/components/pregnancy/CpamDateGapInfo.jsx');
  const section = read('src/pages/SectionDetailPage.jsx');

  assert.match(gapInfo, /maternity-cpam-gap-info/);
  assert.match(gapInfo, /PopoverTrigger/);
  assert.match(gapInfo, /maternity-cpam-gap-popover/);
  assert.doesNotMatch(gapInfo, /TooltipProvider/);
  assert.match(gapInfo, /Pourquoi un écart/);
  assert.match(card, /CpamDateGapInfo/);
  assert.match(card, /maternity-ameli-resources-link/);
  assert.match(card, /Vérifier sur mon compte Ameli/);
  assert.match(card, /AMELI_RESOURCES_SECTION_PATH/);
  assert.match(section, /focusItemId/);
  assert.match(section, /item-card-\$\{focusItemId\}/);
});
