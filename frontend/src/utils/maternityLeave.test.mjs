import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  AMELI_MATERNITY_MATRIX,
  AMELI_RESOURCES_SECTION_PATH,
  CPAM_MATERNITY_GAP_GUIDANCE,
  calculateMaternityLeaveDates,
  computeLeaveDatesFromDpa,
  getMaternityLeaveWeeks,
  normalizeMultiplePregnancy,
  resolveMaternityScenario,
} from './maternityLeave.js';
import { parseYmd } from './pregnancyDateUtils.js';

test('normalizeMultiplePregnancy maps aliases', () => {
  assert.equal(normalizeMultiplePregnancy('twins'), 'twins');
  assert.equal(normalizeMultiplePregnancy('triplets_or_more'), 'triplets_or_more');
  assert.equal(normalizeMultiplePregnancy('unknown'), 'none');
});

test('Ameli matrix totals match official barème', () => {
  assert.deepEqual(AMELI_MATERNITY_MATRIX.first_child, {
    prenatalWeeks: 6,
    postnatalWeeks: 10,
    totalWeeks: 16,
  });
  assert.deepEqual(AMELI_MATERNITY_MATRIX.third_child_plus, {
    prenatalWeeks: 8,
    postnatalWeeks: 18,
    totalWeeks: 26,
  });
});

test('resolveMaternityScenario from profile', () => {
  assert.equal(resolveMaternityScenario(0, 'none'), 'first_child');
  assert.equal(resolveMaternityScenario(1, 'none'), 'second_child');
  assert.equal(resolveMaternityScenario(2, 'none'), 'third_child_plus');
  assert.equal(resolveMaternityScenario(0, 'twins'), 'twins');
});

test('first and second child use 6 weeks prenatal and 10 postnatal', () => {
  assert.deepEqual(getMaternityLeaveWeeks(0, 'none'), {
    prenatalWeeks: 6,
    postnatalWeeks: 10,
    totalWeeks: 16,
    scenario: 'first_child',
  });
  assert.deepEqual(getMaternityLeaveWeeks(1, 'none'), {
    prenatalWeeks: 6,
    postnatalWeeks: 10,
    totalWeeks: 16,
    scenario: 'second_child',
  });
});

test('third child or more uses 8 prenatal and 18 postnatal', () => {
  const weeks = getMaternityLeaveWeeks(2, 'none');
  assert.equal(weeks.prenatalWeeks, 8);
  assert.equal(weeks.postnatalWeeks, 18);
  assert.equal(weeks.totalWeeks, 26);
  assert.equal(weeks.scenario, 'third_child_plus');
});

test('twins override children count', () => {
  const weeks = getMaternityLeaveWeeks(0, 'twins');
  assert.equal(weeks.prenatalWeeks, 12);
  assert.equal(weeks.postnatalWeeks, 22);
  assert.equal(weeks.totalWeeks, 34);
});

test('triplets use 24 weeks prenatal', () => {
  const weeks = getMaternityLeaveWeeks(0, 'triplets_or_more');
  assert.equal(weeks.prenatalWeeks, 24);
  assert.equal(weeks.postnatalWeeks, 22);
  assert.equal(weeks.totalWeeks, 46);
});

test('computeLeaveDatesFromDpa applies Ameli day offsets', () => {
  const dpa = parseYmd('2027-01-01');
  const result = computeLeaveDatesFromDpa(dpa, 6, 10);
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-11-20');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2027-03-12');
});

test('third child CPAM maternity leave for DPA 2027-01-01', () => {
  const result = calculateMaternityLeaveDates('2027-01-01', 2, 'none');
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-11-06');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2027-05-07');
  assert.equal(result.totalWeeks, 26);
});

test('leap year DPA is handled in UTC calendar math', () => {
  const result = calculateMaternityLeaveDates('2024-02-29', 0, 'none');
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2024-01-18');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2024-05-09');
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

test('twins maternity leave for DPA 2027-01-01', () => {
  const result = calculateMaternityLeaveDates('2027-01-01', 0, 'twins');
  assert.equal(result.prenatalStart.toISOString().slice(0, 10), '2026-10-09');
  assert.equal(result.postnatalEnd.toISOString().slice(0, 10), '2027-06-04');
});

test('CPAM gap guidance constants are exposed for maternity leave UI', () => {
  assert.match(CPAM_MATERNITY_GAP_GUIDANCE, /semaines civiles complètes/);
  assert.match(CPAM_MATERNITY_GAP_GUIDANCE, /attestation/);
  assert.equal(AMELI_RESOURCES_SECTION_PATH, '/section/services?focus=ameli');
});
