/**
 * Gestionnaire d'assets fœtus — centralise les emplacements déjà utilisés
 * par Baby3DContainer / BabyEvolutionWidget.
 *
 * Cloudinary (optionnel) via env publiques Vite uniquement :
 *   VITE_CLOUDINARY_CLOUD_NAME
 *   VITE_CLOUDINARY_FETUS_FOLDER  (défaut: mamandouce/fetus)
 *   VITE_CLOUDINARY_TRANSFORMS   (défaut: f_auto,q_auto)
 *
 * Sans cloud name → fallback local /assets/fetus/...
 */

export const AVAILABLE_FETUS_WEEKS = [
  4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40,
];

/** Mapping semaine → public_id / fichier local (déjà déclaré dans le projet) */
export const FETUS_WEEK_FILES = {
  1: 'week-04.png',
  2: 'week-04.png',
  3: 'week-04.png',
  4: 'week-04.png',
  5: 'week-05.png',
  6: 'week-06.png',
  7: 'week-08.png',
  8: 'week-08.png',
  9: 'week-10.png',
  10: 'week-10.png',
  11: 'week-12.png',
  12: 'week-12.png',
  13: 'week-14.png',
  14: 'week-14.png',
  15: 'week-16.png',
  16: 'week-16.png',
  17: 'week-18.png',
  18: 'week-18.png',
  19: 'week-20.png',
  20: 'week-20.png',
  21: 'week-22.png',
  22: 'week-22.png',
  23: 'week-24.png',
  24: 'week-24.png',
  25: 'week-26.png',
  26: 'week-26.png',
  27: 'week-28.png',
  28: 'week-28.png',
  29: 'week-30.png',
  30: 'week-30.png',
  31: 'week-32.png',
  32: 'week-32.png',
  33: 'week-34.png',
  34: 'week-34.png',
  35: 'week-36.png',
  36: 'week-36.png',
  37: 'week-38.png',
  38: 'week-38.png',
  39: 'week-40.png',
  40: 'week-40.png',
  41: 'week-40.png',
  42: 'week-40.png',
};

export const DEFAULT_FETUS_IMAGE = '/assets/bebe-foetus.png';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const fetusFolder =
  import.meta.env.VITE_CLOUDINARY_FETUS_FOLDER || 'mamandouce/fetus';
const transforms =
  import.meta.env.VITE_CLOUDINARY_TRANSFORMS || 'f_auto,q_auto';

export function isCloudinaryEnabled() {
  return Boolean(cloudName && String(cloudName).trim());
}

/** Public id Cloudinary sans extension (week-04) */
function toPublicId(filename) {
  return String(filename).replace(/\.(png|jpe?g|webp)$/i, '');
}

/**
 * Construit une URL Cloudinary avec compression auto, ou chemin local.
 * @param {string} filename ex: week-04.png
 * @param {string} [localFallback]
 */
export function resolveMediaUrl(filename, localFallback) {
  const localPath = localFallback || `/assets/fetus/${filename}`;
  if (!isCloudinaryEnabled()) {
    return localPath;
  }
  const publicId = `${fetusFolder.replace(/\/$/, '')}/${toPublicId(filename)}`;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}

export function closestAvailableWeek(week) {
  const n = Number(week) || 22;
  return AVAILABLE_FETUS_WEEKS.reduce((prev, curr) =>
    Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev
  );
}

/** URL image fœtus pour une semaine de grossesse (1–42). */
export function getFetusImageUrl(week) {
  const file = FETUS_WEEK_FILES[week];
  if (file) {
    return resolveMediaUrl(file, `/assets/fetus/${file}`);
  }
  const closest = closestAvailableWeek(week);
  const closestFile = `week-${String(closest).padStart(2, '0')}.png`;
  return resolveMediaUrl(closestFile, `/assets/fetus/${closestFile}`);
}

export function getDefaultFetusImageUrl() {
  if (!isCloudinaryEnabled()) {
    return DEFAULT_FETUS_IMAGE;
  }
  return resolveMediaUrl('bebe-foetus.png', DEFAULT_FETUS_IMAGE);
}
