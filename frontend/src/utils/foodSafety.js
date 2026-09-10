export const FOOD_SAFETY_STATUSES = Object.freeze([
  'safe',
  'caution',
  'avoid',
  'unsafe',
]);

const STATUS_ALIASES = Object.freeze({
  yes: 'safe',
  allowed: 'safe',
  authorized: 'safe',
  precaution: 'caution',
  forbidden: 'unsafe',
  no: 'unsafe',
});

export function normalizeFoodStatus(value) {
  const raw = String(value || 'unknown').trim().toLowerCase();
  return STATUS_ALIASES[raw] || raw;
}

/** Libellés bienveillants affichés à l'utilisatrice (jamais « Inconnu »). */
export function getFoodStatusLabel(value) {
  switch (normalizeFoodStatus(value)) {
    case 'safe':
      return 'Accepté / Sûr';
    case 'caution':
      return 'À consommer avec précaution';
    case 'avoid':
    case 'unsafe':
      return 'À éviter';
    default:
      return 'À consommer avec précaution';
  }
}

export function verdictToSafetyStatus(verdict) {
  const raw = String(verdict || '').toLowerCase();
  if (raw === 'autorise' || raw === 'autorisé') return 'safe';
  if (raw === 'deconseille' || raw === 'déconseillé') return 'unsafe';
  return 'caution';
}

export function getFoodStatusStyle(value) {
  switch (normalizeFoodStatus(value)) {
    case 'safe':
      return {
        status: 'safe',
        label: getFoodStatusLabel('safe'),
        icon: '✅',
        className: 'bg-emerald-600 text-white border-emerald-700 font-bold',
      };
    case 'caution':
      return {
        status: 'caution',
        label: getFoodStatusLabel('caution'),
        icon: '⚠️',
        className: 'bg-amber-500 text-white border-amber-600 font-bold',
      };
    case 'avoid':
      return {
        status: 'avoid',
        label: getFoodStatusLabel('avoid'),
        icon: '⚠️',
        className: 'bg-orange-600 text-white border-orange-700 font-bold',
      };
    case 'unsafe':
      return {
        status: 'unsafe',
        label: getFoodStatusLabel('unsafe'),
        icon: '🚫',
        className: 'bg-red-600 text-white border-red-700 font-bold',
      };
    default:
      return {
        status: 'caution',
        label: getFoodStatusLabel('caution'),
        icon: '⚠️',
        className: 'bg-amber-500 text-white border-amber-600 font-bold',
      };
  }
}

const GENERIC_PRODUCT_NAMES = new Set([
  'aliment',
  'aliment non identifié',
  'inconnu',
  'unknown',
  'produit',
  'objet',
  'produit inconnu',
  'article inconnu',
  'produit non trouvé',
]);

/** Normalise un objet résultat barcode/recherche/IA vers un format commun. */
export function normalizeScannedFood(raw) {
  if (!raw) return null;
  const rawName = String(raw.name || raw.food_name || '').trim();
  const name = !rawName || GENERIC_PRODUCT_NAMES.has(rawName.toLowerCase())
    ? 'Produit analysé par l\'IA'
    : rawName;
  const safety = normalizeFoodStatus(
    raw.safe_for_pregnancy || verdictToSafetyStatus(raw.verdict),
  );
  return {
    name,
    brand: raw.brand || '',
    barcode: raw.barcode || null,
    image_url: raw.image_url || raw.image_preview || null,
    category: raw.category || 'Analyse dynamique',
    safe_for_pregnancy: safety === 'unknown' ? 'caution' : safety,
    reason: raw.reason || raw.explanation || '',
    ingredients: raw.ingredients || '',
    is_unknown: Boolean(raw.is_unknown),
    can_contribute: Boolean(raw.can_contribute || raw.is_unknown),
    analysis_source: raw.analysis_source || null,
    verdict: raw.verdict || null,
  };
}

export function dedupeFoodsByName(foods) {
  if (!Array.isArray(foods)) return [];
  const seen = new Set();
  return foods.filter((food) => {
    const key = String(food?.name || '').trim().toLocaleLowerCase('fr');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
