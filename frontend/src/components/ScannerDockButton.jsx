import { Camera } from 'lucide-react';

const SCANNER_SHADOW =
  '0 4px 14px -2px rgba(15,23,42,0.45), inset -2px -2px 6px rgba(0,0,0,0.25), inset 2px 2px 6px rgba(255,255,255,0.35)';

/**
 * Bouton scanner compact pour le dock minimal (pilule PageDots).
 */
export function ScannerDockButton({ onClick, testId = 'home-dock-scanner', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-label="Scanner alimentaire"
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-pink-500 text-pink-500 transition-all duration-300 hover:scale-105 active:scale-95 ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(241,245,249,0.95) 0%, rgba(51,65,85,0.9) 55%, rgba(15,23,42,0.95) 100%)',
        boxShadow: SCANNER_SHADOW,
      }}
    >
      <span
        className="pointer-events-none absolute inset-x-1.5 top-0.5 h-[38%] rounded-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      <Camera className="relative z-[1] h-4 w-4 drop-shadow-sm" strokeWidth={2.25} />
    </button>
  );
}

export default ScannerDockButton;
