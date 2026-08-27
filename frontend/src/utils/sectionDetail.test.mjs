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

test('MaternityLeaveSummaryCard is a collapsed drawer by default', () => {
  const src = readFileSync(
    join(root, 'src/components/pregnancy/MaternityLeaveSummaryCard.jsx'),
    'utf8'
  );
  assert.match(src, /useState\(defaultOpen \|\| focusMaternityLeave\)/);
  assert.match(src, /maternity-leave-summary-toggle/);
  assert.match(src, /\{isOpen &&/);
  assert.match(src, /searchParams\.get\('focus'\) === 'maternity-leave'/);
});

test('home navigation CollapsibleSections default to closed', () => {
  for (const rel of [
    'src/components/home/navigation/PregnancySection.jsx',
    'src/components/home/navigation/PreconceptionSection.jsx',
    'src/components/home/navigation/BabyPreparationSection.jsx',
    'src/components/home/navigation/PostpartumSection.jsx',
    'src/components/home/navigation/ServicesSection.jsx',
    'src/components/home/navigation/SolidaritySection.jsx',
    'src/components/home/navigation/FaqBabySection.jsx',
    'src/components/home/navigation/OutilsSection.jsx',
  ]) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.doesNotMatch(src, /defaultOpen=\{true\}/, rel);
    assert.match(src, /defaultOpen=\{false\}/, rel);
  }
});
