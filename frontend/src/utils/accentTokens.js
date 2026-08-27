/**
 * Tokens d'accent canoniques — carte pastel + bulle icône vive.
 * La couleur de la carte est toujours dérivée de l'accent de l'icône.
 */

export const ACCENT_ALIASES = {
  yellow: 'yellow',
  amber: 'yellow',
  blue: 'blue',
  sky: 'sky',
  red: 'red',
  rose: 'red',
  pink: 'pink',
  peach: 'red',
  orange: 'red',
  green: 'green',
  emerald: 'green',
  violet: 'violet',
  purple: 'violet',
  slate: 'slate',
};

export const SECTION_ACCENT = {
  preconception: 'yellow',
  pregnancy: 'blue',
  'baby-preparation': 'red',
  postpartum: 'green',
  services: 'violet',
  outils: 'slate',
};

export function normalizeAccent(accent) {
  if (!accent) return 'slate';
  return ACCENT_ALIASES[String(accent).toLowerCase()] || 'slate';
}

export function accentFromBgColor(bgColor) {
  return normalizeAccent(bgColor);
}

export function accentFromSectionId(sectionId) {
  return SECTION_ACCENT[sectionId] || 'slate';
}

export function softClayCardClasses(accent, { pill = false } = {}) {
  const name = normalizeAccent(accent);
  return [
    'soft-clay-from-accent',
    `soft-clay-from-accent-${name}`,
    pill ? 'soft-clay-pill' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Cycle J→B→R→V→Vi pour tuiles sans accent explicite */
export const CYCLE_ACCENTS = ['yellow', 'blue', 'red', 'green', 'violet'];

export function cycleAccentByIndex(index = 0) {
  return CYCLE_ACCENTS[Math.abs(index) % CYCLE_ACCENTS.length];
}

const LEVEL_RADIUS = {
  1: 'rounded-[24px]',
  2: 'rounded-[24px]',
  3: 'rounded-[22px]',
  4: 'rounded-[20px]',
};

/**
 * Classe dynamique card-soft-clay — fond pastel assorti à l'accent de l'icône.
 * @param {string} accent
 * @param {{ pill?: boolean, level?: 1|2|3|4 }} options
 */
export function cardSoftClayClasses(accent, { pill = false, level = 2 } = {}) {
  const name = normalizeAccent(accent);
  const radius = pill ? '' : LEVEL_RADIUS[level] || LEVEL_RADIUS[2];
  return [
    'card-soft-clay',
    'soft-clay-premium',
    'soft-clay-from-accent',
    `soft-clay-from-accent-${name}`,
    'soft-clay-text-flat',
    radius,
    pill ? 'soft-clay-pill' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function cardInnerCreamClasses(className = '', { level = 4, pill = false } = {}) {
  const radius = pill ? '' : LEVEL_RADIUS[level] || LEVEL_RADIUS[4];
  return [
    'card-inner-cream',
    'soft-clay-inner-cream',
    'soft-clay-text-flat',
    radius,
    pill ? 'soft-clay-pill' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export function softClayIconWellClasses(accent, className = '') {
  const name = normalizeAccent(accent);
  return [`soft-clay-icon-well`, `soft-clay-icon-from-accent-${name}`, className]
    .filter(Boolean)
    .join(' ');
}
