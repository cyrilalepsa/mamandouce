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

test('language and account menus share fade-scale popover animation', () => {
  const topBar = read('src/components/home/TopBar.jsx');
  const popover = read('src/components/LanguagePopoverMenu.jsx');
  const animation = read('src/utils/popoverMenuAnimation.js');

  assert.match(animation, /opacity-100 scale-100 duration-200 ease-out/);
  assert.match(animation, /opacity-0 scale-95 duration-150 ease-in/);
  assert.match(popover, /usePopoverMountTransition/);
  assert.match(popover, /popoverMenuAnimationClass/);
  assert.match(topBar, /usePopoverMountTransition/);
  assert.match(topBar, /popoverMenuAnimationClass/);
  assert.doesNotMatch(topBar, /animate-fade-in/);
});
