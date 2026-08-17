/**
 * Normalisation du formulaire Cycle / Fertilité avant POST /pregnancy/calculate.
 * last_period_date → YYYY-MM-DD ; durée de cycle → entier (parseInt(..., 10)).
 */

const ISO_YMD = /^(\d{4})-(\d{2})-(\d{2})/;
const FR_DMY = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/;

export const MIN_CYCLE_LENGTH = 21;
export const MAX_CYCLE_LENGTH = 45;
export const DEFAULT_CYCLE_LENGTH = 28;

export function toYearMonthDay(value) {
  if (value == null || value === "") return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const raw = String(value).trim();
  const iso = raw.match(ISO_YMD);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const fr = raw.match(FR_DMY);
  if (fr) {
    return `${fr[3]}-${fr[2].padStart(2, "0")}-${fr[1].padStart(2, "0")}`;
  }

  return "";
}

export function parseHabitualLength(habitualLength, fallback = DEFAULT_CYCLE_LENGTH) {
  if (habitualLength === "" || habitualLength == null) {
    return fallback;
  }
  const n = parseInt(habitualLength, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function buildCycleSavePayload(lastPeriodDate, habitualLength) {
  const last_period_date = toYearMonthDay(lastPeriodDate);
  const cycle_length = parseInt(habitualLength, 10);
  const errors = [];

  if (!last_period_date) {
    errors.push("date");
  }
  if (!Number.isFinite(cycle_length)) {
    errors.push("length");
  } else if (cycle_length < MIN_CYCLE_LENGTH || cycle_length > MAX_CYCLE_LENGTH) {
    errors.push("length_range");
  }

  return {
    last_period_date,
    cycle_length: Number.isFinite(cycle_length) ? cycle_length : DEFAULT_CYCLE_LENGTH,
    valid: errors.length === 0,
    errors,
  };
}

export function extractApiErrorDetail(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0];
    if (typeof first === "string") return first;
    if (first?.msg) return first.msg;
  }
  return "";
}
