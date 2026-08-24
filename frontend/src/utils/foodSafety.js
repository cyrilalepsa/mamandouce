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

export function getFoodStatusStyle(value) {
  switch (normalizeFoodStatus(value)) {
    case 'safe':
      return {
        status: 'safe',
        icon: '✅',
        className: 'bg-emerald-600 text-white border-emerald-700 font-bold',
      };
    case 'caution':
      return {
        status: 'caution',
        icon: '⚠️',
        className: 'bg-amber-500 text-white border-amber-600 font-bold',
      };
    case 'avoid':
      return {
        status: 'avoid',
        icon: '⚠️',
        className: 'bg-orange-600 text-white border-orange-700 font-bold',
      };
    case 'unsafe':
      return {
        status: 'unsafe',
        icon: '🚫',
        className: 'bg-red-600 text-white border-red-700 font-bold',
      };
    default:
      return {
        status: 'unknown',
        icon: '❔',
        className: 'bg-slate-600 text-white border-slate-700 font-bold',
      };
  }
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
