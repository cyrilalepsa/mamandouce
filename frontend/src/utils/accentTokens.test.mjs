import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  accentFromBgColor,
  accentFromSectionId,
  normalizeAccent,
  softClayCardClasses,
  cardSoftClayClasses,
} from './accentTokens.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('normalizeAccent maps aliases to canonical tokens', () => {
  assert.equal(normalizeAccent('amber'), 'yellow');
  assert.equal(normalizeAccent('purple'), 'violet');
  assert.equal(normalizeAccent('sky'), 'sky');
  assert.equal(normalizeAccent('pink'), 'pink');
});

test('section and item accents align with theme order', () => {
  assert.equal(accentFromSectionId('preconception'), 'yellow');
  assert.equal(accentFromSectionId('pregnancy'), 'blue');
  assert.equal(accentFromSectionId('baby-preparation'), 'peach');
  assert.equal(accentFromBgColor('yellow'), 'yellow');
  assert.equal(accentFromBgColor('violet'), 'violet');
});

test('soft-clay card classes derive from accent', () => {
  assert.match(softClayCardClasses('amber'), /soft-clay-from-accent-yellow/);
  assert.match(softClayCardClasses('violet', { pill: true }), /soft-clay-pill/);
  assert.match(cardSoftClayClasses('blue', { level: 4 }), /rounded-\[20px\]/);
  assert.match(cardSoftClayClasses('pink'), /card-soft-clay/);
});

test('PastelMosaicCard uses soft-clay-from-accent from color prop', () => {
  const src = readFileSync(
    join(root, 'src/components/home/navigation/_shared.jsx'),
    'utf8'
  );
  assert.match(src, /soft-clay-from-accent/);
  assert.match(src, /data-accent=\{accent\}/);
});

test('ItemCard uses accentFromBgColor for card and icon well', () => {
  const src = readFileSync(join(root, 'src/pages/SectionDetailPage.jsx'), 'utf8');
  assert.match(src, /accentFromBgColor/);
  assert.match(src, /<IconWell accent=\{accent\}/);
});
