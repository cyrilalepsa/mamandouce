import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

test('language popovers use fixed overlay positioning without layout flow', () => {
  const topBar = read('src/components/home/TopBar.jsx');
  const bubble = read('src/components/LanguageBubble.jsx');
  const popover = read('src/components/LanguagePopoverMenu.jsx');

  assert.match(popover, /fixed z-\[9999\]/);
  assert.match(popover, /getBoundingClientRect\(\)/);
  assert.match(topBar, /LanguagePopoverMenu/);
  assert.match(topBar, /className="relative shrink-0 self-center"/);
  assert.match(bubble, /LanguagePopoverMenu/);
  assert.match(bubble, /className="relative"/);
  assert.doesNotMatch(popover, /top-full/);
  assert.doesNotMatch(topBar, /top-full mt-2/);
});
