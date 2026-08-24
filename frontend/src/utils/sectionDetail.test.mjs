import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('SectionDetailPage imports useTheme from ThemeContext', () => {
  const src = readFileSync(join(root, 'src/pages/SectionDetailPage.jsx'), 'utf8');
  assert.match(src, /import \{ useTheme \} from '\.\.\/contexts\/ThemeContext'/);
  assert.match(src, /useTheme\(\)/);
});
