import { addDays, parseYmd, toYmd } from './pregnancyDateUtils.js';

export const MULTIPLE_PREGNANCY_VALUES = ['none', 'twins', 'triplets_or_more'];
export const MATERNITY_DURATION_EXTENDED = 'extended';
export const MATERNITY_DURATION_STANDARD = 'standard';

export function normalizeMaternityDurationOption(value) {
  const raw = String(value || MATERNITY_DURATION_EXTENDED).trim().toLowerCase();
  return raw === MATERNITY_DURATION_STANDARD ? MATERNITY_DURATION_STANDARD : MATERNITY_DURATION_EXTENDED;
}

export function normalizeMultiplePregnancy(value) {
  const raw = String(value || 'none').trim().toLowerCase();
  if (raw === 'twins' || raw === 'jumeaux') return 'twins';
  if (raw === 'triplets_or_more' || raw === 'triplets' || raw === 'triple') return 'triplets_or_more';
  return 'none';
}

export function getMaternityLeaveWeeks(
  childrenAtHome,
  multiplePregnancy,
  durationOption = MATERNITY_DURATION_EXTENDED,
) {
  const multi = normalizeMultiplePregnancy(multiplePregnancy);
  const children = Math.max(0, Number(childrenAtHome) || 0);
  const duration = normalizeMaternityDurationOption(durationOption);

  if (multi === 'twins') {
    return { prenatalWeeks: 12, postnatalWeeks: 22, scenario: 'twins' };
  }
  if (multi === 'triplets_or_more') {
    return { prenatalWeeks: 24, postnatalWeeks: 22, scenario: 'triplets_or_more' };
  }
  if (children >= 2) {
    if (duration === MATERNITY_DURATION_STANDARD) {
      return {
        prenatalWeeks: 8,
        postnatalWeeks: 18,
        scenario: 'third_child_plus_standard',
      };
    }
    return {
      prenatalWeeks: 6,
      postnatalWeeks: 20,
      scenario: 'third_child_plus_extended',
    };
  }
  return { prenatalWeeks: 6, postnatalWeeks: 10, scenario: 'first_or_second_child' };
}

export function calculateMaternityLeaveDates(
  dueDateIso,
  childrenAtHome,
  multiplePregnancy,
  options = {},
) {
  const {
    durationOption = MATERNITY_DURATION_EXTENDED,
    prenatalStartIso = null,
    postnatalEndIso = null,
    useCpamOverrides = true,
  } = options;

  const due = parseYmd(dueDateIso);
  if (!due) return null;

  const customPrenatal = parseYmd(prenatalStartIso);
  const customPostnatal = parseYmd(postnatalEndIso);

  if (useCpamOverrides && customPrenatal && customPostnatal) {
    return {
      dueDate: toYmd(due),
      prenatalStart: customPrenatal,
      postnatalEnd: customPostnatal,
      prenatalWeeks: null,
      postnatalWeeks: null,
      scenario: 'cpam_statement',
      childrenAtHome: Math.max(0, Number(childrenAtHome) || 0),
      multiplePregnancy: normalizeMultiplePregnancy(multiplePregnancy),
      durationOption: normalizeMaternityDurationOption(durationOption),
      isCpamOverride: true,
    };
  }

  const { prenatalWeeks, postnatalWeeks, scenario } = getMaternityLeaveWeeks(
    childrenAtHome,
    multiplePregnancy,
    durationOption,
  );

  const prenatalStart = addDays(due, -prenatalWeeks * 7);
  const postnatalEnd = addDays(due, postnatalWeeks * 7 - 1);

  return {
    dueDate: toYmd(due),
    prenatalStart,
    postnatalEnd,
    prenatalWeeks,
    postnatalWeeks,
    scenario,
    childrenAtHome: Math.max(0, Number(childrenAtHome) || 0),
    multiplePregnancy: normalizeMultiplePregnancy(multiplePregnancy),
    durationOption: normalizeMaternityDurationOption(durationOption),
    isCpamOverride: false,
  };
}

export function formatFrenchDate(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : parseYmd(date);
  if (!d || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function getScenarioLabel(scenario) {
  switch (scenario) {
    case 'twins':
      return 'Naissances multiples — Jumeaux';
    case 'triplets_or_more':
      return 'Naissances multiples — Triplés et +';
    case 'third_child_plus_standard':
      return 'Grossesse unique — 3e enfant (8 sem. prénatal / 18 postnatal)';
    case 'third_child_plus_extended':
      return 'Grossesse unique — 3e enfant (6 sem. prénatal / 20 postnatal)';
    case 'third_child_plus':
      return 'Grossesse unique — À partir du 3e enfant';
    case 'cpam_statement':
      return 'Dates synchronisées depuis votre relevé Ameli / CPAM';
    default:
      return 'Grossesse unique — 1er ou 2e enfant';
  }
}
