/**
 * Monnaie virtuelle gamification MamanDouce / NeriaCorp.
 * Les montants numériques et règles métier restent inchangés.
 */
export const CURRENCY_CODE = 'N20';
export const CURRENCY_LABEL = 'N20';
export const CURRENCY_ICON = '/assets/icons/n20_symbol.png';

/** Format texte brut (toasts, aria, fallback). */
export function formatN20(amount, { sign = false } = {}) {
  const n = Number(amount) || 0;
  const prefix = sign && n > 0 ? '+' : '';
  return `${prefix}${n} ${CURRENCY_LABEL}`;
}

/** Ancien format € → N20 pour libellés wallet (pas les prix Stripe réels). */
export function formatWalletAmount(amount, { sign = false } = {}) {
  return formatN20(amount, { sign });
}
