/**
 * Icône officielle de la monnaie virtuelle N20 (NeriaCorp).
 * Fallback texte si l'image ne charge pas.
 */
import { useState } from 'react';

const SRC = '/assets/icons/n20_symbol.png';

export default function N20Icon({
  size = 20,
  className = '',
  title = 'N20',
  showFallbackText = true,
}) {
  const [failed, setFailed] = useState(false);
  const px = typeof size === 'number' ? size : 20;

  if (failed) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold text-amber-700 ${className}`}
        style={{ fontSize: Math.max(10, px * 0.55), lineHeight: 1 }}
        title={title}
        aria-label={title}
      >
        {showFallbackText ? 'N20' : '🪙'}
      </span>
    );
  }

  return (
    <img
      src={SRC}
      alt={title}
      title={title}
      width={px}
      height={px}
      className={`inline-block object-contain align-middle ${className}`}
      style={{ width: px, height: px }}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

/** Affiche une valeur N20 avec l’icône à droite (ex: +50 [logo]). */
export function N20Amount({
  value,
  size = 18,
  className = '',
  valueClassName = '',
  showSign = false,
  showLabel = false,
}) {
  const num = Number(value) || 0;
  const sign = showSign && num > 0 ? '+' : '';
  const label = `${sign}${num} N20`;
  return (
    <span
      className={`inline-flex items-center gap-1 align-middle ${className}`}
      aria-label={label}
      title={label}
    >
      <span className={valueClassName}>
        {sign}
        {num}
      </span>
      <N20Icon size={size} />
      {showLabel && (
        <span className={`text-[0.85em] font-semibold text-amber-800/80 ${valueClassName}`}>
          N20
        </span>
      )}
    </span>
  );
}
