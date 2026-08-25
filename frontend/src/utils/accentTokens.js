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
  peach: 'peach',
  orange: 'peach',
  green: 'green',
  emerald: 'green',
  violet: 'violet',
  purple: 'violet',
  slate: 'slate',
};

export const SECTION_ACCENT = {
  preconception: 'yellow',
  pregnancy: 'blue',
  'baby-preparation': 'peach',
  postpartum: 'green',
  services: 'violet',
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

export function softClayIconWellClasses(accent, className = '') {
  const name = normalizeAccent(accent);
  return [`soft-clay-icon-well`, `soft-clay-icon-from-accent-${name}`, className]
    .filter(Boolean)
    .join(' ');
}
