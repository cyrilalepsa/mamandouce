import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Map, Calendar, User, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { shouldHideAppShell } from '../utils/appShellVisibility';

const NAV_ITEMS = [
  { id: 'home', path: '/', icon: Home, labelKey: 'nav.home', fallback: 'Accueil' },
  { id: 'journey', path: '/journey-steps', icon: Map, labelKey: 'nav.journey', fallback: 'Parcours' },
  { id: 'calendar', path: '/calendar', icon: Calendar, labelKey: 'nav.calendar', fallback: 'Calendrier' },
  { id: 'profile', path: '/profile', icon: User, labelKey: 'nav.profile', fallback: 'Profil' },
];

function isActivePath(pathname, path) {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavItem({ item, active, onClick, label }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`bottom-nav-${item.id}`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
        active ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}

/**
 * Dock de navigation bas — scanner glassmorphism au centre.
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, loading } = useAuth();

  if (loading || !isAuthenticated) return null;
  if (shouldHideAppShell(location.pathname)) return null;

  const [leftItems, rightItems] = [NAV_ITEMS.slice(0, 2), NAV_ITEMS.slice(2)];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1"
      data-testid="bottom-nav"
      aria-label={t('nav.main', 'Navigation principale')}
    >
      <div
        className="mx-auto flex max-w-lg items-end rounded-[1.35rem] border border-white/70 bg-white/95 px-1 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur-md"
        style={{
          boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF, 0 -6px 20px rgba(15,23,42,0.06)',
        }}
      >
        <div className="flex flex-1 items-end">
          {leftItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={isActivePath(location.pathname, item.path)}
              label={t(item.labelKey, item.fallback)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate('/scanner')}
          data-testid="bottom-nav-scanner"
          aria-label={t('nav.scanner', 'Scanner alimentaire')}
          className="relative -mt-5 mx-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-pink-500 text-pink-500 shadow-lg backdrop-blur-md bg-gradient-to-br from-slate-100/90 via-slate-700/85 to-slate-900/90 transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            boxShadow:
              '0 4px 14px -2px rgba(15,23,42,0.45), inset -2px -2px 6px rgba(0,0,0,0.25), inset 2px 2px 6px rgba(255,255,255,0.35)',
          }}
        >
          <span
            className="pointer-events-none absolute inset-x-2 top-1 h-[38%] rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)',
            }}
          />
          <Camera className="relative z-[1] h-6 w-6 drop-shadow-sm" strokeWidth={2.25} />
        </button>

        <div className="flex flex-1 items-end">
          {rightItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={isActivePath(location.pathname, item.path)}
              label={t(item.labelKey, item.fallback)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
