import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSuperAdmin } from '../utils/superadmin';
import ContentVisualsModule from '../components/admin/ContentVisualsModule';

/**
 * Vue embarquée (iframe / WebView portail NeriaCorp) — uniquement le module
 * « Gestion des Contenus & Visuels », sans accordéons admin.
 */
export default function ContentVisualsEmbedPage() {
  const { user, isAdmin, isSuperAdmin: isSuperAdminFlag, loading } = useAuth();

  const canAccess = isAdmin
    || isSuperAdminFlag
    || isSuperAdmin(user?.email, user?.role)
    || user?.is_admin
    || user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center p-6" data-testid="content-visuals-embed-loading">
        <div className="animate-spin w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!canAccess) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div
      className="w-full min-w-0 p-3 sm:p-4 bg-transparent"
      data-testid="content-visuals-embed-page"
    >
      <section
        id="cockpit-content-visuals"
        className="block w-full min-w-0"
        data-testid="cockpit-content-visuals-section"
      >
        <ContentVisualsModule />
      </section>
    </div>
  );
}
