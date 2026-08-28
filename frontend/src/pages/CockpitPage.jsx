import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSuperAdmin } from '../utils/superadmin';
import { WhatsNewAdminSection } from '../components/admin/WhatsNewAdminSection';

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

  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6 pb-24" data-testid="cockpit-page">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-700">Cockpit</h1>
            <p className="text-sm text-slate-500">Gestion des nouveautés utilisateur</p>
          </div>
        </div>

        <WhatsNewAdminSection />
      </div>
    </div>
  );
}

export default CockpitPage;
