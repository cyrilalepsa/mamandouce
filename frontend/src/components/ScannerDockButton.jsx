import { createPortal } from 'react-dom';
import { Camera } from 'lucide-react';

const BUBBLE_SIZE = 38;
const BUBBLE_BOTTOM = '0.5rem';
const BUBBLE_SIDE = '0.75rem';

/**
 * Bouton scanner fixe en bas à droite — aligné sur la bulle info verte (bas gauche).
 */
export function ScannerDockButton({ onClick, testId = 'home-dock-scanner' }) {
  return createPortal(
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-label="Scanner alimentaire"
      style={{
        position: 'fixed',
        bottom: BUBBLE_BOTTOM,
        right: BUBBLE_SIDE,
        zIndex: 9999,
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow:
          '0 3px 8px -2px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(0,0,0,0.04), inset 2px 2px 5px rgba(255,255,255,0.7)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        transition: 'all 0.3s ease',
      }}
      className="hover:scale-105 active:scale-95"
    >
      <Camera className="h-4 w-4 text-slate-600" strokeWidth={2.25} />
    </button>,
    document.body
  );
}

export default ScannerDockButton;
