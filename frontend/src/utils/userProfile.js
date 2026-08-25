export function splitUserName(user) {
  const explicitFirst = String(user?.first_name || '').trim();
  const explicitLast = String(user?.last_name || '').trim();
  if (explicitFirst || explicitLast) {
    return { firstName: explicitFirst, lastName: explicitLast };
  }

  const legacy = String(user?.name || '').trim();
  if (!legacy) {
    return { firstName: '', lastName: '' };
  }

  const parts = legacy.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function buildFullName(firstName, lastName) {
  return [String(firstName || '').trim(), String(lastName || '').trim()]
    .filter(Boolean)
    .join(' ');
}

export function normalizeChildrenAtHome(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}
