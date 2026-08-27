import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

test('language popovers anchor to the right with safe mobile width', () => {
  const topBar = read('src/components/home/TopBar.jsx');
  const bubble = read('src/components/LanguageBubble.jsx');

  assert.match(topBar, /className="relative shrink-0 self-center"/);
  assert.match(topBar, /absolute right-2 top-full mt-2 origin-top-right z-50 w-48 max-w-\[calc\(100vw-2rem\)\]/);
  assert.match(bubble, /className="relative" ref=\{dropdownRef\}/);
  assert.match(bubble, /absolute right-2 top-full mt-2 origin-top-right z-50 w-48 max-w-\[calc\(100vw-2rem\)\]/);
  assert.doesNotMatch(topBar, /left-0.*Langue/);
});
