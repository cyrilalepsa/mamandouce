import { useNavigate, useLocation } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { shouldHideAppShell } from '../utils/appShellVisibility';

/**
 * FAB persistant hors accueil — sur l'accueil le scanner est dans la pilule PageDots.
 */
export function ScannerFab() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading || !isAuthenticated) return null;
  if (shouldHideAppShell(location.pathname)) return null;
  if (location.pathname === '/') return null;

  return (
    <button
      type="button"
      onClick={() => navigate('/scanner')}
      data-testid="scanner-fab"
      aria-label="Scanner alimentaire"
      className="fixed bottom-20 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center border-2 border-pink-500 text-pink-500 shadow-lg drop-shadow-md backdrop-blur-md bg-gradient-to-br from-slate-100/90 via-slate-700/85 to-slate-900/90 transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        boxShadow:
          '0 4px 14px -2px rgba(15,23,42,0.45), inset -2px -2px 6px rgba(0,0,0,0.25), inset 2px 2px 6px rgba(255,255,255,0.35)',
      }}
    >
      <span
        className="absolute inset-x-2 top-1 h-[38%] rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      <Camera className="w-5 h-5 relative z-[1] drop-shadow-sm" strokeWidth={2.25} />
    </button>
  );
}

export default ScannerFab;
