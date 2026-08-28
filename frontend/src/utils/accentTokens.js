/**
 * Tokens d'accent canoniques — carte pastel + bulle icône vive.
 * La couleur de la carte est toujours dérivée de l'accent de la section parente.
 */
import { SECTION_COLOR_REGISTRY } from './colorRegistry.js';

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
  magenta: 'magenta',
  fuchsia: 'magenta',
};

export const SECTION_ACCENT = Object.fromEntries(
  Object.entries(SECTION_COLOR_REGISTRY).map(([id, cfg]) => [id, cfg.accent])
);

/** Relief et rebond tactile — cartes interactives */
export const CARD_INTERACTIVE_SHADOW =
  'shadow-lg shadow-slate-900/10 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.08)]';
export const CARD_INTERACTIVE_MOTION =
  'transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-95 active:translate-y-0.5';

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

/** Couleur de bordure section (cartes lecture) */
export const SECTION_BORDER_CLASS = Object.fromEntries(
  Object.values(SECTION_COLOR_REGISTRY).map((cfg) => [cfg.accent, cfg.border])
);
SECTION_BORDER_CLASS.yellow = 'border-yellow-400';
SECTION_BORDER_CLASS.blue = 'border-blue-400';
SECTION_BORDER_CLASS.red = 'border-red-400';
SECTION_BORDER_CLASS.green = 'border-green-400';
SECTION_BORDER_CLASS.violet = 'border-violet-400';
SECTION_BORDER_CLASS.slate = 'border-slate-400';
SECTION_BORDER_CLASS.sky = 'border-sky-400';
SECTION_BORDER_CLASS.pink = 'border-pink-400';
SECTION_BORDER_CLASS.magenta = 'border-pink-400';

/** Fond gradient interactif — blanc → ardoise clair teinté section */
export const SECTION_INTERACTIVE_BG = Object.fromEntries(
  Object.values(SECTION_COLOR_REGISTRY).map((cfg) => [cfg.accent, cfg.interactiveBg])
);
SECTION_INTERACTIVE_BG.yellow = 'bg-gradient-to-br from-white via-yellow-50/55 to-slate-100';
SECTION_INTERACTIVE_BG.blue = 'bg-gradient-to-br from-white via-blue-50/55 to-slate-100';
SECTION_INTERACTIVE_BG.red = 'bg-gradient-to-br from-white via-red-50/55 to-slate-100';
SECTION_INTERACTIVE_BG.green = 'bg-gradient-to-br from-white via-green-50/55 to-slate-100';
SECTION_INTERACTIVE_BG.violet = 'bg-gradient-to-br from-white via-violet-50/55 to-slate-100';
SECTION_INTERACTIVE_BG.slate = 'bg-gradient-to-br from-white via-slate-100/90 to-slate-200/70';
SECTION_INTERACTIVE_BG.sky = 'bg-gradient-to-br from-white via-sky-50/55 to-slate-100';
SECTION_INTERACTIVE_BG.pink = 'bg-gradient-to-br from-white via-pink-50/55 to-slate-100';
SECTION_INTERACTIVE_BG.magenta = 'bg-gradient-to-br from-white via-pink-50/60 to-slate-100';

export function resolveSectionAccent(sectionIdOrAccent) {
  if (sectionIdOrAccent && SECTION_ACCENT[sectionIdOrAccent]) {
    return accentFromSectionId(sectionIdOrAccent);
  }
  return normalizeAccent(sectionIdOrAccent);
}

/** Carte cliquable / accordéon — gradient léger teinté par la section parente */
export function sectionInteractiveCardClasses(sectionIdOrAccent, { rounded = 'rounded-[24px]', extra = '' } = {}) {
  const accent = resolveSectionAccent(sectionIdOrAccent);
  const bg = SECTION_INTERACTIVE_BG[accent] || SECTION_INTERACTIVE_BG.slate;
  return [
    bg,
    'text-slate-800',
    'border border-white/70',
    CARD_INTERACTIVE_SHADOW,
    CARD_INTERACTIVE_MOTION,
    rounded,
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Carte lecture / texte pur — fond blanc, contour section uniquement */
export function sectionReadingCardClasses(sectionIdOrAccent, { rounded = 'rounded-[24px]', extra = '' } = {}) {
  const accent = resolveSectionAccent(sectionIdOrAccent);
  const border = SECTION_BORDER_CLASS[accent] || SECTION_BORDER_CLASS.slate;
  return [
    'bg-white',
    'border-2',
    border,
    'text-slate-800',
    CARD_INTERACTIVE_SHADOW,
    rounded,
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

export function sectionAccentTextClass(sectionIdOrAccent) {
  const accent = resolveSectionAccent(sectionIdOrAccent);
  const map = {
    yellow: 'text-yellow-700',
    blue: 'text-blue-700',
    red: 'text-red-700',
    green: 'text-green-700',
    violet: 'text-violet-700',
    slate: 'text-slate-700',
    magenta: 'text-pink-700',
    pink: 'text-pink-700',
  };
  return map[accent] || map.slate;
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
    CARD_INTERACTIVE_SHADOW,
    CARD_INTERACTIVE_MOTION,
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
