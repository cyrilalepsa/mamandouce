import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  COUNTRY_FR,
  COUNTRY_UK,
  buildFranceCpamAppointmentWindows,
  buildUkNhsAppointmentWindows,
  calculateDpa,
  ddgFromDpa,
  parseYmd,
  resolveCountryFromCity,
} from './pregnancyDateUtils.js';

const DDG = '2026-04-01';

test('Paris resolves to France CPAM calendar', () => {
  assert.equal(resolveCountryFromCity('Paris'), COUNTRY_FR);
});

test('London resolves to UK NHS calendar', () => {
  assert.equal(resolveCountryFromCity('Londres'), COUNTRY_UK);
  assert.equal(resolveCountryFromCity('London'), COUNTRY_UK);
});

test('DDG 2026-04-01 yields DPA 2027-01-01 in France', () => {
  const ddg = parseYmd(DDG);
  const dpa = calculateDpa(ddg, COUNTRY_FR);
  assert.equal(dpa.toISOString().slice(0, 10), '2027-01-01');
});

test('France CPAM calendar matches official ranges for DDG 2026-04-01', () => {
  const ddg = parseYmd(DDG);
  const dpa = calculateDpa(ddg, COUNTRY_FR);
  const windows = buildFranceCpamAppointmentWindows(ddg, dpa);

  assert.equal(windows.dpa, '2027-01-01');
  assert.equal(windows.echo1.start, '2026-05-27');
  assert.equal(windows.echo1.end, '2026-06-22');
  assert.equal(windows.echo2.start, '2026-07-29');
  assert.equal(windows.echo2.end, '2026-09-08');
  assert.equal(windows.echo3.start, '2026-10-07');
  assert.equal(windows.echo3.end, '2026-11-17');
  assert.equal(windows.exam1.start, '2026-04-01');
  assert.equal(windows.exam1.end, '2026-06-30');
  assert.equal(windows.exam2.start, '2026-07-01');
  assert.equal(windows.bilan.start, '2026-07-01');
});

test('UK uses Naegele 280-day rule from DDG', () => {
  const ddg = parseYmd(DDG);
  const dpa = calculateDpa(ddg, COUNTRY_UK, 28);
  assert.equal(dpa.toISOString().slice(0, 10), '2027-01-06');
});

test('ddgFromDpa reverses France nine-month rule', () => {
  const dpa = parseYmd('2027-01-01');
  const ddg = ddgFromDpa(dpa, COUNTRY_FR);
  assert.equal(ddg.toISOString().slice(0, 10), DDG);
});

test('London city applies NHS week-based scan windows', () => {
  const country = resolveCountryFromCity('London');
  const ddg = parseYmd(DDG);
  const windows = buildUkNhsAppointmentWindows(ddg);
  assert.equal(country, COUNTRY_UK);
  assert.equal(windows.dpa, '2027-01-06');
  assert.equal(windows.anomalyScan.start, '2026-08-19');
  assert.equal(windows.anomalyScan.end, '2026-09-02');
});
