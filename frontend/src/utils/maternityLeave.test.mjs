import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  calculateMaternityLeaveDates,
  getMaternityLeaveWeeks,
  normalizeMultiplePregnancy,
} from './maternityLeave.js';

test('normalizeMultiplePregnancy maps aliases', () => {
  assert.equal(normalizeMultiplePregnancy('twins'), 'twins');
  assert.equal(normalizeMultiplePregnancy('triplets_or_more'), 'triplets_or_more');
  assert.equal(normalizeMultiplePregnancy('unknown'), 'none');
});

test('first or second child uses 6 weeks prenatal and 10 postnatal', () => {
  const weeks = getMaternityLeaveWeeks(1, 'none');
  assert.equal(weeks.prenatalWeeks, 6);
  assert.equal(weeks.postnatalWeeks, 10);
});

test('third child or more uses 8 weeks prenatal and 18 postnatal', () => {
  const weeks = getMaternityLeaveWeeks(2, 'none');
  assert.equal(weeks.prenatalWeeks, 8);
  assert.equal(weeks.postnatalWeeks, 18);
});

test('twins override children count', () => {
  const weeks = getMaternityLeaveWeeks(0, 'twins');
  assert.equal(weeks.prenatalWeeks, 12);
  assert.equal(weeks.postnatalWeeks, 22);
});

test('triplets use 24 weeks prenatal', () => {
  const weeks = getMaternityLeaveWeeks(0, 'triplets_or_more');
  assert.equal(weeks.prenatalWeeks, 24);
  assert.equal(weeks.postnatalWeeks, 22);
});

test('calculateMaternityLeaveDates offsets from DPA', () => {
  const result = calculateMaternityLeaveDates('2026-06-01', 0, 'none');
  assert.ok(result);
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-04-20');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2026-08-10');
});
