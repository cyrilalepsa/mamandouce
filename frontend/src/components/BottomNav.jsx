import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Map, User, Camera, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { shouldHideAppShell } from '../utils/appShellVisibility';

const NAV_ITEMS = [
  { id: 'home', path: '/', icon: Home, labelKey: 'nav.home', fallback: 'Accueil' },
  {
    id: 'outils',
    path: '/section/outils',
    icon: Wrench,
    labelKey: 'nav.outils',
    fallback: 'Outils',
    match: (pathname) => pathname === '/section/outils' || pathname.startsWith('/outils/'),
  },
  { id: 'journey', path: '/journey-steps', icon: Map, labelKey: 'nav.journey', fallback: 'Parcours' },
  { id: 'profile', path: '/profile', icon: User, labelKey: 'nav.profile', fallback: 'Profil' },
];

function isActivePath(pathname, item) {
  if (item.match) return item.match(pathname);
  if (item.path === '/') return pathname === '/';
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
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
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
        active ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
      <span className="max-w-full truncate px-0.5 text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}

function ScannerNavButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="bottom-nav-scanner"
      aria-label={label}
      className="relative ml-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-pink-500 text-pink-500 shadow-md backdrop-blur-md bg-gradient-to-br from-slate-100/90 via-slate-700/85 to-slate-900/90 transition-all duration-300 hover:scale-105 active:scale-95"
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
      <Camera className="relative z-[1] h-5 w-5 drop-shadow-sm" strokeWidth={2.25} />
    </button>
  );
}

/**
 * Dock de navigation bas global — scanner aligné à droite.
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, loading } = useAuth();

  if (loading || !isAuthenticated) return null;
  if (shouldHideAppShell(location.pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1"
      data-testid="bottom-nav"
      aria-label={t('nav.main', 'Navigation principale')}
    >
      <div
        className="relative mx-auto flex max-w-lg items-center rounded-[1.35rem] border border-white/70 bg-white/95 py-1 pl-1 pr-2 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur-md"
        style={{
          boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF, 0 -6px 20px rgba(15,23,42,0.06)',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={isActivePath(location.pathname, item)}
            label={t(item.labelKey, item.fallback)}
            onClick={() => navigate(item.path)}
          />
        ))}

        <ScannerNavButton
          label={t('nav.scanner', 'Scanner alimentaire')}
          onClick={() => navigate('/scanner')}
        />
      </div>
    </nav>
  );
}

export default BottomNav;
