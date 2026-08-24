export function displayText(value, fallback = '') {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(item => displayText(item)).filter(Boolean).join(', ');
  if (value && typeof value === 'object') {
    for (const key of ['translated', 'text', 'value', 'label', 'name', 'title']) {
      const candidate = displayText(value[key]);
      if (candidate) return candidate;
    }
  }
  return fallback;
}

export function normalizeWeeklyTip(raw, fallbackWeek = 1) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  return {
    ...raw,
    week: Number(raw.week) || Number(fallbackWeek) || 1,
    title: displayText(raw.title, `Semaine ${fallbackWeek}`),
    description: displayText(raw.description),
    development: displayText(raw.development),
    fruit_comparison: displayText(raw.fruit_comparison),
    embryo_size: displayText(raw.embryo_size, '—'),
    embryo_weight: displayText(raw.embryo_weight, '< 1 g'),
  };
}
