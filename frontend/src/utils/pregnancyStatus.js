const PREGNANT_VALUES = new Set([
  'pregnant',
  'pregnancy',
  'enceinte',
  'active',
  'confirmed',
]);

const NOT_PREGNANT_VALUES = new Set([
  'not_pregnant',
  'non_enceinte',
  'trying',
  'trying_to_conceive',
  'envie_bebe',
  'cycle',
]);

function explicitBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return null;
}

function statusBoolean(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (PREGNANT_VALUES.has(normalized)) return true;
  if (NOT_PREGNANT_VALUES.has(normalized)) return false;
  return null;
}

/**
 * Backend profile is authoritative, then auth user, then legacy localStorage.
 * `current_week` alone is not proof: cycle calculations also populate it.
 */
export function isPregnancyActive({ profile, user, storedPregnant = false } = {}) {
  for (const source of [profile, user]) {
    const explicit = explicitBoolean(source?.is_pregnant);
    if (explicit !== null) return explicit;
    const status = statusBoolean(source?.pregnancy_status ?? source?.status);
    if (status !== null) return status;
  }
  return explicitBoolean(storedPregnant) === true;
}

function validDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calculateCycleSummary(lastPeriodDate, cycleLength = 28, now = new Date()) {
  const start = validDate(lastPeriodDate);
  const length = Math.min(45, Math.max(21, Number(cycleLength) || 28));
  if (!start) {
    return {
      dayOfCycle: null,
      daysUntilNextPeriod: null,
      label: 'Configurez votre cycle',
    };
  }

  const today = new Date(now);
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const elapsed = Math.max(0, Math.floor((today - start) / 86400000));
  const elapsedInCycle = elapsed % length;
  const dayOfCycle = elapsedInCycle + 1;
  const daysUntilNextPeriod = elapsedInCycle === 0 && elapsed > 0
    ? 0
    : length - elapsedInCycle;

  return {
    dayOfCycle,
    daysUntilNextPeriod,
    label: daysUntilNextPeriod === 0
      ? "Règles attendues aujourd'hui"
      : `Prochaines règles dans ${daysUntilNextPeriod} jour${daysUntilNextPeriod > 1 ? 's' : ''}`,
  };
}

export function pregnancyProgress(profile = {}, dueDate = '') {
  const rawWeek = Number(profile?.current_week);
  let week = Number.isFinite(rawWeek) && rawWeek > 0 ? Math.floor(rawWeek) : null;

  if (!week) {
    const due = validDate(profile?.estimated_due_date || dueDate);
    if (due) {
      const daysUntilDue = Math.ceil((due - new Date()) / 86400000);
      week = Math.min(42, Math.max(1, Math.floor((280 - daysUntilDue) / 7) + 1));
    }
  }

  week = week || 1;
  const rawTrimester = Number(profile?.trimester);
  const trimester = [1, 2, 3].includes(rawTrimester)
    ? rawTrimester
    : week <= 13 ? 1 : week <= 27 ? 2 : 3;

  return { week, trimester };
}
