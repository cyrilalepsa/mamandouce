import { addDays, parseYmd, toYmd } from './pregnancyDateUtils.js';

export const MULTIPLE_PREGNANCY_VALUES = ['none', 'twins', 'triplets_or_more'];

/** Guidance when CPAM calendar weeks differ from theoretical Ameli barème. */
export const CPAM_MATERNITY_GAP_GUIDANCE =
  'La CPAM calcule parfois le congé en semaines civiles complètes ou selon votre jour d\'arrêt exact. Fiez-vous aux dates de votre attestation.';

export const AMELI_ACCOUNT_URL = 'https://www.ameli.fr';
export const AMELI_RESOURCES_SECTION_PATH = '/section/services?focus=ameli';

/** Barème officiel Ameli — semaines avant / après la DPA */
export const AMELI_MATERNITY_MATRIX = {
  first_child: { prenatalWeeks: 6, postnatalWeeks: 10, totalWeeks: 16 },
  second_child: { prenatalWeeks: 6, postnatalWeeks: 10, totalWeeks: 16 },
  third_child_plus: { prenatalWeeks: 8, postnatalWeeks: 18, totalWeeks: 26 },
  twins: { prenatalWeeks: 12, postnatalWeeks: 22, totalWeeks: 34 },
  triplets_or_more: { prenatalWeeks: 24, postnatalWeeks: 22, totalWeeks: 46 },
};

export function normalizeMultiplePregnancy(value) {
  const raw = String(value || 'none').trim().toLowerCase();
  if (raw === 'twins' || raw === 'jumeaux') return 'twins';
  if (raw === 'triplets_or_more' || raw === 'triplets' || raw === 'triple') return 'triplets_or_more';
  return 'none';
}

/**
 * Résout le scénario Ameli selon le profil (naissances multiples prioritaires).
 */
export function resolveMaternityScenario(childrenAtHome, multiplePregnancy) {
  const multi = normalizeMultiplePregnancy(multiplePregnancy);
  if (multi === 'twins') return 'twins';
  if (multi === 'triplets_or_more') return 'triplets_or_more';

  const children = Math.max(0, Number(childrenAtHome) || 0);
  if (children >= 2) return 'third_child_plus';
  if (children === 1) return 'second_child';
  return 'first_child';
}

export function getMaternityLeaveWeeks(childrenAtHome, multiplePregnancy) {
  const scenario = resolveMaternityScenario(childrenAtHome, multiplePregnancy);
  const rule = AMELI_MATERNITY_MATRIX[scenario];
  return {
    prenatalWeeks: rule.prenatalWeeks,
    postnatalWeeks: rule.postnatalWeeks,
    totalWeeks: rule.totalWeeks,
    scenario,
  };
}

/**
 * Calcule les dates de congé depuis une DPA (UTC) et le barème Ameli.
 * - Début prénatal = DPA − (semaines_prénatal × 7 jours)
 * - Fin postnatal = DPA + (semaines_postnatal × 7 jours)
 */
export function computeLeaveDatesFromDpa(dpaDate, prenatalWeeks, postnatalWeeks) {
  const due = dpaDate instanceof Date ? dpaDate : parseYmd(dpaDate);
  if (!due || Number.isNaN(due.getTime())) return null;

  const prenatalStart = addDays(due, -prenatalWeeks * 7);
  const postnatalEnd = addDays(due, postnatalWeeks * 7);

  return { due, prenatalStart, postnatalEnd };
}

export function calculateMaternityLeaveDates(
  dueDateIso,
  childrenAtHome,
  multiplePregnancy,
  options = {},
) {
  const {
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
      totalWeeks: null,
      scenario: 'cpam_statement',
      childrenAtHome: Math.max(0, Number(childrenAtHome) || 0),
      multiplePregnancy: normalizeMultiplePregnancy(multiplePregnancy),
      isCpamOverride: true,
    };
  }

  const { prenatalWeeks, postnatalWeeks, totalWeeks, scenario } = getMaternityLeaveWeeks(
    childrenAtHome,
    multiplePregnancy,
  );

  const computed = computeLeaveDatesFromDpa(due, prenatalWeeks, postnatalWeeks);
  if (!computed) return null;

  return {
    dueDate: toYmd(due),
    prenatalStart: computed.prenatalStart,
    postnatalEnd: computed.postnatalEnd,
    prenatalWeeks,
    postnatalWeeks,
    totalWeeks,
    scenario,
    childrenAtHome: Math.max(0, Number(childrenAtHome) || 0),
    multiplePregnancy: normalizeMultiplePregnancy(multiplePregnancy),
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
    case 'first_child':
      return '1er enfant (0 enfant à charge) — 6 sem. prénatal / 10 postnatal';
    case 'second_child':
      return '2e enfant (1 enfant à charge) — 6 sem. prénatal / 10 postnatal';
    case 'third_child_plus':
      return '3e enfant ou plus (≥ 2 enfants à charge) — 8 sem. prénatal / 18 postnatal';
    case 'twins':
      return 'Jumeaux — 12 sem. prénatal / 22 postnatal';
    case 'triplets_or_more':
      return 'Triplés ou plus — 24 sem. prénatal / 22 postnatal';
    case 'cpam_statement':
      return 'Dates synchronisées depuis votre relevé Ameli / CPAM';
    default:
      return 'Barème Ameli';
  }
}
