import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ImageIcon, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSuperAdmin } from '../utils/superadmin';
import { WhatsNewAdminSection } from '../components/admin/WhatsNewAdminSection';
import FetusVisualsTab from '../components/admin/FetusVisualsTab';

function CockpitPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin: isSuperAdminFlag, loading } = useAuth();

  const canAccess = isAdmin
    || isSuperAdminFlag
    || isSuperAdmin(user?.email, user?.role)
    || user?.is_admin
    || user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden gradient-bg p-4 sm:p-6 pb-28"
      data-testid="cockpit-page"
    >
      <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-6 animate-fade-in">
        <div className="mb-2 flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-700">Cockpit</h1>
            <p className="text-sm text-slate-500">Administration MamanDouce</p>
          </div>
        </div>

        <nav
          className="grid w-full grid-cols-2 gap-2 sm:grid-cols-2"
          aria-label="Modules du cockpit"
          data-testid="cockpit-mobile-tiles"
        >
          <button
            type="button"
            onClick={() => scrollToSection('cockpit-fetus-visuals')}
            className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border border-pink-200 bg-white/95 p-3 text-center shadow-sm active:bg-pink-50 touch-manipulation"
            data-testid="cockpit-tile-fetus-visuals"
          >
            <ImageIcon className="h-6 w-6 text-pink-500" aria-hidden="true" />
            <span className="text-xs font-bold leading-tight text-slate-700">
              Visuels fœtus
            </span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('cockpit-whats-new')}
            className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border border-amber-200 bg-white/95 p-3 text-center shadow-sm active:bg-amber-50 touch-manipulation"
            data-testid="cockpit-tile-whats-new"
          >
            <Lightbulb className="h-6 w-6 text-amber-500" aria-hidden="true" />
            <span className="text-xs font-bold leading-tight text-slate-700">
              Nouveautés
            </span>
          </button>
        </nav>

        <section
          id="cockpit-fetus-visuals"
          className="block w-full min-w-0 scroll-mt-4 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5"
          data-testid="cockpit-fetus-visuals-section"
        >
          <FetusVisualsTab />
        </section>

        <div id="cockpit-whats-new" className="w-full min-w-0 scroll-mt-4">
          <WhatsNewAdminSection />
        </div>
      </div>
    </div>
  );
}

export default CockpitPage;
