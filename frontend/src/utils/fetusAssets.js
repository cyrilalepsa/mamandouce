/**
 * Gestionnaire d'assets fœtus — CDN Cloudinary par défaut (NeriaCorp).
 *
 * Domaine de livraison : https://res.cloudinary.com/{cloud}/image/upload/{transforms}/{folder}/{id}
 *
 * Cloud name (sans secret) :
 *   1. VITE_CLOUDINARY_CLOUD_NAME (build)
 *   2. GET /api/neriacorp/media  (hydratation runtime dès injection serveur)
 *   3. sinon fallback local /assets/fetus/...
 *
 * Les <img> gardent un onError → fichier local.
 */

import { BACKEND_URL } from './backendUrl';

export const CLOUDINARY_CDN_HOST = 'https://res.cloudinary.com';
export const DEFAULT_FETUS_IMAGE = '/assets/bebe-foetus.png';

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

function readVite(name, fallback = '') {
  try {
    const env = import.meta.env || {};
    return env[name] || fallback;
  } catch {
    return fallback;
  }
}

let cloudName = readVite('VITE_CLOUDINARY_CLOUD_NAME', '');
let fetusFolder = readVite('VITE_CLOUDINARY_FETUS_FOLDER', 'mamandouce/fetus');
let transforms = readVite('VITE_CLOUDINARY_TRANSFORMS', 'f_auto,q_auto');

const cloudinaryListeners = new Set();

export function subscribeCloudinary(listener) {
  cloudinaryListeners.add(listener);
  return () => cloudinaryListeners.delete(listener);
}

function notifyCloudinary() {
  cloudinaryListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
}

export function isCloudinaryEnabled() {
  return Boolean(cloudName && String(cloudName).trim());
}

export function getCloudinaryConfig() {
  return {
    cdnHost: CLOUDINARY_CDN_HOST,
    cloudName: cloudName || null,
    folder: fetusFolder,
    transforms,
    enabled: isCloudinaryEnabled(),
  };
}

/** Public id Cloudinary sans extension (week-04) */
function toPublicId(filename) {
  return String(filename).replace(/\.(png|jpe?g|webp)$/i, '');
}

/** URL de livraison Cloudinary (domaine CDN par défaut). */
export function cloudinaryDeliveryUrl(filename) {
  if (!isCloudinaryEnabled()) return null;
  const publicId = `${fetusFolder.replace(/\/$/, '')}/${toPublicId(filename)}`;
  return `${CLOUDINARY_CDN_HOST}/${cloudName}/image/upload/${transforms}/${publicId}`;
}

export function localFetusPath(filename) {
  if (filename === 'bebe-foetus.png') return DEFAULT_FETUS_IMAGE;
  return `/assets/fetus/${filename}`;
}

/**
 * Construit une URL Cloudinary (res.cloudinary.com) ou chemin local.
 * @param {string} filename ex: week-04.png
 * @param {string} [localFallback]
 */
export function resolveMediaUrl(filename, localFallback) {
  const localPath = localFallback || localFetusPath(filename);
  const cdn = cloudinaryDeliveryUrl(filename);
  return cdn || localPath;
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
    return resolveMediaUrl(file, localFetusPath(file));
  }
  const closest = closestAvailableWeek(week);
  const closestFile = `week-${String(closest).padStart(2, '0')}.png`;
  return resolveMediaUrl(closestFile, localFetusPath(closestFile));
}

export function getDefaultFetusImageUrl() {
  return resolveMediaUrl('bebe-foetus.png', DEFAULT_FETUS_IMAGE);
}

/**
 * Hydrate le cloud name depuis l'API (CLOUDINARY_CLOUD_NAME serveur).
 * Appelé au boot — permet le CDN live sans rebuild frontend.
 */
export async function hydrateCloudinaryFromApi() {
  const base = (BACKEND_URL || import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
  if (!base) return getCloudinaryConfig();
  try {
    const res = await fetch(`${base}/api/neriacorp/media`);
    if (!res.ok) return getCloudinaryConfig();
    const data = await res.json();
    if (data.cloud_name) {
      cloudName = String(data.cloud_name).trim();
      if (data.folder) fetusFolder = data.folder;
      if (data.transforms) transforms = data.transforms;
      notifyCloudinary();
    }
  } catch {
    /* offline / CORS : rester sur env Vite ou local */
  }
  return getCloudinaryConfig();
}
