/**
 * Registre canonique des couleurs de section — source unique pour accentTokens et CSS.
 */

/** Rose Magenta Clair — 6e section Outils */
export const MAGENTA_SECTION = {
  accent: 'magenta',
  border: 'border-pink-400',
  borderAlt: 'border-fuchsia-400',
  text: 'text-pink-700',
  interactiveBg: 'bg-gradient-to-br from-white via-pink-50/60 to-slate-100',
  glass: '#FCE7F3',
  borderHex: '#F472B6',
  bubbleFrom: '#f472b6',
  bubbleTo: '#e879f9',
};

export const SECTION_COLOR_REGISTRY = {
  preconception: {
    accent: 'yellow',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    interactiveBg: 'bg-gradient-to-br from-white via-yellow-50/55 to-slate-100',
  },
  pregnancy: {
    accent: 'blue',
    border: 'border-blue-400',
    text: 'text-blue-700',
    interactiveBg: 'bg-gradient-to-br from-white via-blue-50/55 to-slate-100',
  },
  'baby-preparation': {
    accent: 'red',
    border: 'border-red-400',
    text: 'text-red-700',
    interactiveBg: 'bg-gradient-to-br from-white via-red-50/55 to-slate-100',
  },
  postpartum: {
    accent: 'green',
    border: 'border-green-400',
    text: 'text-green-700',
    interactiveBg: 'bg-gradient-to-br from-white via-green-50/55 to-slate-100',
  },
  services: {
    accent: 'violet',
    border: 'border-violet-400',
    text: 'text-violet-700',
    interactiveBg: 'bg-gradient-to-br from-white via-violet-50/55 to-slate-100',
  },
  outils: MAGENTA_SECTION,
};
