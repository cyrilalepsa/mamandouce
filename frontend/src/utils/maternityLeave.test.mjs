import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  calculateMaternityLeaveDates,
  getMaternityLeaveWeeks,
  MATERNITY_DURATION_EXTENDED,
  MATERNITY_DURATION_STANDARD,
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

test('third child default uses extended 6 prenatal and 20 postnatal', () => {
  const weeks = getMaternityLeaveWeeks(2, 'none', MATERNITY_DURATION_EXTENDED);
  assert.equal(weeks.prenatalWeeks, 6);
  assert.equal(weeks.postnatalWeeks, 20);
});

test('third child standard option uses 8 prenatal and 18 postnatal', () => {
  const weeks = getMaternityLeaveWeeks(2, 'none', MATERNITY_DURATION_STANDARD);
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

test('calculateMaternityLeaveDates offsets from DPA (CPAM inclusive end)', () => {
  const result = calculateMaternityLeaveDates('2027-01-01', 0, 'none');
  assert.ok(result);
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-11-20');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2027-03-11');
});

test('third child extended CPAM maternity leave for DPA 2027-01-01', () => {
  const result = calculateMaternityLeaveDates('2027-01-01', 2, 'none', {
    durationOption: MATERNITY_DURATION_EXTENDED,
  });
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-11-20');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2027-05-20');
});

test('third child standard CPAM maternity leave for DPA 2027-01-01', () => {
  const result = calculateMaternityLeaveDates('2027-01-01', 2, 'none', {
    durationOption: MATERNITY_DURATION_STANDARD,
  });
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-11-06');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2027-05-06');
});

test('third child extended for DPA 2026-12-16', () => {
  const result = calculateMaternityLeaveDates('2026-12-16', 2, 'none', {
    durationOption: MATERNITY_DURATION_EXTENDED,
  });
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-11-04');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2027-05-04');
});

test('CPAM statement overrides algorithmic dates', () => {
  const result = calculateMaternityLeaveDates('2026-12-16', 2, 'none', {
    prenatalStartIso: '2026-11-06',
    postnatalEndIso: '2027-05-06',
  });
  assert.equal(result.scenario, 'cpam_statement');
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-11-06');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2027-05-06');
  assert.equal(result.isCpamOverride, true);
});

test('twins CPAM maternity leave for DPA 2027-01-01', () => {
  const result = calculateMaternityLeaveDates('2027-01-01', 0, 'twins');
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-10-09');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2027-06-03');
});
