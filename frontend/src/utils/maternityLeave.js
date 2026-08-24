export const MULTIPLE_PREGNANCY_VALUES = ['none', 'twins', 'triplets_or_more'];

export function normalizeMultiplePregnancy(value) {
  const raw = String(value || 'none').trim().toLowerCase();
  if (raw === 'twins' || raw === 'jumeaux') return 'twins';
  if (raw === 'triplets_or_more' || raw === 'triplets' || raw === 'triple') return 'triplets_or_more';
  return 'none';
}

export function getMaternityLeaveWeeks(childrenAtHome, multiplePregnancy) {
  const multi = normalizeMultiplePregnancy(multiplePregnancy);
  const children = Math.max(0, Number(childrenAtHome) || 0);

  if (multi === 'twins') {
    return { prenatalWeeks: 12, postnatalWeeks: 22, scenario: 'twins' };
  }
  if (multi === 'triplets_or_more') {
    return { prenatalWeeks: 24, postnatalWeeks: 22, scenario: 'triplets_or_more' };
  }
  if (children >= 2) {
    return { prenatalWeeks: 8, postnatalWeeks: 18, scenario: 'third_child_plus' };
  }
  return { prenatalWeeks: 6, postnatalWeeks: 10, scenario: 'first_or_second_child' };
}

export function calculateMaternityLeaveDates(dueDateIso, childrenAtHome, multiplePregnancy) {
  if (!dueDateIso) return null;

  const due = new Date(dueDateIso);
  if (Number.isNaN(due.getTime())) return null;

  const { prenatalWeeks, postnatalWeeks, scenario } = getMaternityLeaveWeeks(
    childrenAtHome,
    multiplePregnancy
  );

  const prenatalStart = new Date(due);
  prenatalStart.setDate(prenatalStart.getDate() - prenatalWeeks * 7);

  const postnatalEnd = new Date(due);
  postnatalEnd.setDate(postnatalEnd.getDate() + postnatalWeeks * 7);

  return {
    dueDate: dueDateIso,
    prenatalStart,
    postnatalEnd,
    prenatalWeeks,
    postnatalWeeks,
    scenario,
    childrenAtHome: Math.max(0, Number(childrenAtHome) || 0),
    multiplePregnancy: normalizeMultiplePregnancy(multiplePregnancy),
  };
}

export function formatFrenchDate(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getScenarioLabel(scenario) {
  switch (scenario) {
    case 'twins':
      return 'Naissances multiples — Jumeaux';
    case 'triplets_or_more':
      return 'Naissances multiples — Triplés et +';
    case 'third_child_plus':
      return 'Grossesse unique — À partir du 3e enfant';
    default:
      return 'Grossesse unique — 1er ou 2e enfant';
  }
}
