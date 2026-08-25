import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildFullName, normalizeChildrenAtHome, splitUserName } from './userProfile.js';

test('splitUserName prefers explicit first_name and last_name', () => {
  const result = splitUserName({ first_name: 'Marie', last_name: 'Dupont', name: 'Legacy' });
  assert.deepEqual(result, { firstName: 'Marie', lastName: 'Dupont' });
});

test('splitUserName falls back to legacy name', () => {
  const result = splitUserName({ name: 'Marie Dupont' });
  assert.deepEqual(result, { firstName: 'Marie', lastName: 'Dupont' });
});

test('buildFullName joins trimmed parts', () => {
  assert.equal(buildFullName(' Marie ', ' Dupont '), 'Marie Dupont');
});

test('normalizeChildrenAtHome clamps invalid values', () => {
  assert.equal(normalizeChildrenAtHome('2'), 2);
  assert.equal(normalizeChildrenAtHome('-1'), 0);
  assert.equal(normalizeChildrenAtHome('abc'), 0);
});
