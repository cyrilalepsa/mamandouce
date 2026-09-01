/**
 * Pregnancy date utilities aligned with CPAM (France) and NHS (UK) calendars.
 */

export const COUNTRY_FR = 'FR';
export const COUNTRY_UK = 'UK';
export const COUNTRY_BE = 'BE';

const UK_CITY_HINTS = [
  'london', 'londres', 'manchester', 'birmingham', 'leeds', 'glasgow',
  'edinburgh', 'liverpool', 'bristol', 'cardiff', 'sheffield', 'newcastle',
  'nottingham', 'oxford', 'cambridge', 'brighton', 'belfast', 'england',
  'scotland', 'wales', 'uk', 'united kingdom', 'royaume-uni', 'grande-bretagne',
  'great britain',
];

const BE_CITY_HINTS = [
  'bruxelles', 'brussels', 'antwerp', 'anvers', 'ghent', 'gent', 'liege',
  'charleroi', 'belgique', 'belgium',
];

const FR_CITY_HINTS = [
  'paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg',
  'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'france',
];

function normalizeCity(value) {
  if (!value) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function resolveCountryFromCity(city, defaultCountry = COUNTRY_FR) {
  const normalized = normalizeCity(city);
  if (!normalized) return defaultCountry;

  if (UK_CITY_HINTS.some((hint) => normalized.includes(hint))) return COUNTRY_UK;
  if (BE_CITY_HINTS.some((hint) => normalized.includes(hint))) return COUNTRY_BE;
  if (FR_CITY_HINTS.some((hint) => normalized.includes(hint))) return COUNTRY_FR;

  return defaultCountry;
}

export function parseYmd(value) {
  if (!value) return null;
  const raw = String(value).trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toYmd(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function addCalendarMonths(base, months) {
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth() + months;
  const day = base.getUTCDate();
  const result = new Date(Date.UTC(year, month, day));
  if (result.getUTCDate() !== day) {
    return new Date(Date.UTC(year, month + 1, 0));
  }
  return result;
}

export function gestationalMonthRange(ddg, fromMonth, toMonth) {
  const start = addCalendarMonths(ddg, fromMonth - 1);
  const end = addDays(addCalendarMonths(ddg, toMonth), -1);
  return { start, end };
}

export function frSaWindow(ddg, startSa, endSa, endExtraDays = 0) {
  const start = addDays(ddg, (startSa - 1) * 7 - 14);
  const end = addDays(ddg, (endSa - 1) * 7 - 14 + endExtraDays + 6);
  return { start, end };
}

export const CPAM_ECHO_OFFSETS = {
  apt_2: [56, 82],
  apt_6: [119, 160],
  apt_10: [189, 230],
};

export function calculateDpa(ddg, country = COUNTRY_FR, cycleLength = 28) {
  if (country === COUNTRY_UK) {
    const adjustment = Math.max(21, Math.min(35, Number(cycleLength) || 28)) - 28;
    return addDays(ddg, 280 + adjustment);
  }
  return addCalendarMonths(ddg, 9);
}

/** 41 SA depuis la DDR (cycle 28 j) */
export const DPA_DAYS_FROM_DDR_28 = 287;

/**
 * DPA depuis la DDR : estime la DDG (ovulation) puis applique la règle pays.
 */
export function calculateDpaFromDDR(ddr, country = COUNTRY_FR, cycleLength = 28) {
  const safeCycle = Math.max(21, Math.min(35, Number(cycleLength) || 28));
  const ddg = addDays(ddr, safeCycle - 14);
  return calculateDpa(ddg, country, safeCycle);
}

export function ddgFromDpa(dpa, country = COUNTRY_FR, cycleLength = 28) {
  if (country === COUNTRY_UK) {
    const adjustment = Math.max(21, Math.min(35, Number(cycleLength) || 28)) - 28;
    return addDays(dpa, -(280 + adjustment));
  }
  return addCalendarMonths(dpa, -9);
}

export function currentGestationalWeek(ddg, onDate = new Date()) {
  const start = new Date(ddg);
  start.setHours(0, 0, 0, 0);
  const today = new Date(onDate);
  today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today - start) / 86400000));
  return Math.floor(days / 7);
}

/** Semaines d'aménorrhée (SA) depuis la DDR — semaine 1 dès J0. */
export function weeksAmenorrhea(ddrIso, onDate = new Date()) {
  const ddr = typeof ddrIso === 'string' ? parseYmd(ddrIso) : ddrIso;
  if (!ddr) return null;
  const ref = onDate instanceof Date ? onDate : parseYmd(onDate) || new Date();
  ref.setHours(0, 0, 0, 0);
  const start = new Date(ddr);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.max(0, Math.floor((ref - start) / 86400000));
  return Math.max(1, Math.min(43, Math.floor(diffDays / 7) + 1));
}

/** Estime SA depuis la DPA (41 SA à terme). */
export function weeksAmenorrheaFromDueDate(dueDateIso, country = COUNTRY_FR, cycleLength = 28, onDate = new Date()) {
  const dpa = parseYmd(dueDateIso);
  if (!dpa) return null;
  const ref = onDate instanceof Date ? onDate : parseYmd(onDate) || new Date();
  ref.setHours(0, 0, 0, 0);
  const safeCycle = Math.max(21, Math.min(35, Number(cycleLength) || 28));
  const gestationDays = country === COUNTRY_UK
    ? 280 + (safeCycle - 28)
    : DPA_DAYS_FROM_DDR_28 + (safeCycle - 28);
  const daysUntilDue = (dpa - ref) / 86400000;
  return Math.max(1, Math.min(43, Math.round((gestationDays / 7) - daysUntilDue / 7)));
}

export function trimesterFromSA(weeksSA) {
  if (weeksSA <= 13) return 1;
  if (weeksSA <= 27) return 2;
  return 3;
}

export function buildFranceCpamAppointmentWindows(ddg, dpa) {
  const echo1 = frSaWindow(ddg, 11, 13, 6);
  const exam1 = gestationalMonthRange(ddg, 1, 3);
  const exam2 = gestationalMonthRange(ddg, 4, 4);
  const exam3 = gestationalMonthRange(ddg, 5, 5);
  const exam4 = gestationalMonthRange(ddg, 6, 6);
  const exam5 = gestationalMonthRange(ddg, 7, 7);
  const exam6 = gestationalMonthRange(ddg, 8, 8);
  const exam7 = gestationalMonthRange(ddg, 9, 9);
  const bilan = gestationalMonthRange(ddg, 4, 9);

  return {
    dpa: toYmd(dpa),
    echo1: { start: toYmd(echo1.start), end: toYmd(echo1.end) },
    echo2: { start: toYmd(addDays(ddg, CPAM_ECHO_OFFSETS.apt_6[0])), end: toYmd(addDays(ddg, CPAM_ECHO_OFFSETS.apt_6[1])) },
    echo3: { start: toYmd(addDays(ddg, CPAM_ECHO_OFFSETS.apt_10[0])), end: toYmd(addDays(ddg, CPAM_ECHO_OFFSETS.apt_10[1])) },
    exam1: { start: toYmd(exam1.start), end: toYmd(exam1.end) },
    exam2: { start: toYmd(exam2.start), end: toYmd(exam2.end) },
    exam3: { start: toYmd(exam3.start), end: toYmd(exam3.end) },
    exam4: { start: toYmd(exam4.start), end: toYmd(exam4.end) },
    exam5: { start: toYmd(exam5.start), end: toYmd(exam5.end) },
    exam6: { start: toYmd(exam6.start), end: toYmd(exam6.end) },
    exam7: { start: toYmd(exam7.start), end: toYmd(exam7.end) },
    bilan: { start: toYmd(bilan.start), end: toYmd(bilan.end) },
  };
}

export function buildUkNhsAppointmentWindows(ddg) {
  const dpa = calculateDpa(ddg, COUNTRY_UK);
  return {
    dpa: toYmd(dpa),
    datingScan: {
      start: toYmd(addDays(ddg, 11 * 7 - 14)),
      end: toYmd(addDays(ddg, 13 * 7 - 14)),
    },
    anomalyScan: {
      start: toYmd(addDays(ddg, 20 * 7)),
      end: toYmd(addDays(ddg, 22 * 7)),
    },
  };
}

export function getLocalizedServices(country = COUNTRY_FR, city = '') {
  const cityQuery = encodeURIComponent(String(city || '').trim());
  if (country === COUNTRY_UK) {
    return [
      {
        id: 'nhs',
        title: 'NHS',
        desc: 'National Health Service',
        route: 'https://www.nhs.uk/pregnancy/',
      },
      {
        id: 'govuk',
        title: 'GOV.UK',
        desc: 'Maternity and parental rights',
        route: 'https://www.gov.uk/maternity-pay-leave',
      },
      {
        id: 'maps',
        title: 'Local services',
        desc: 'GP surgeries and hospitals',
        route: cityQuery
          ? `https://www.google.com/maps/search/hospital+near+${cityQuery}`
          : 'https://www.google.com/maps/search/hospital',
      },
    ];
  }

  return [
    {
      id: 'caf',
      title: 'CAF',
      desc: 'Allocations familiales',
      route: 'https://www.caf.fr',
    },
    {
      id: 'ameli',
      title: 'Ameli',
      desc: 'Assurance maladie',
      route: 'https://www.ameli.fr',
    },
    {
      id: 'pmi',
      title: 'PMI',
      desc: 'Protection maternelle et infantile',
      route: cityQuery
        ? `https://www.google.com/maps/search/PMI+${cityQuery}`
        : 'https://www.google.com/maps/search/PMI',
    },
    {
      id: 'maps',
      title: 'Mairie proche',
      desc: 'Démarches administratives',
      route: cityQuery
        ? `https://www.google.com/maps/search/mairie+${cityQuery}`
        : 'https://www.google.com/maps/search/mairie',
    },
  ];
}

export function pregnancyCalendarLabel(country) {
  switch (country) {
    case COUNTRY_UK:
      return 'Royaume-Uni (NHS)';
    case COUNTRY_BE:
      return 'Belgique';
    default:
      return 'France (CPAM / Ameli)';
  }
}
