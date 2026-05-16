import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  CheckCircle, XCircle, Clock, Eye, Filter, 
  RefreshCw, Apple, ShoppingBag, ChefHat, User
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

function ContributionsManager() {
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('pending');
  const [selectedContrib, setSelectedContrib] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'pending' 
        ? '/admin/contributions/pending'
        : `/admin/contributions/all?status=${filter === 'all' ? '' : filter}`;
      
      const res = await api.get(endpoint);
      setContributions(res.data.contributions || []);
      setStats(res.data.stats || {});
    } catch (error) {
      console.error('Error fetching contributions:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const handleValidate = async (contributionId, approved) => {
    setProcessing(true);
    try {
      await api.post(`/admin/contributions/${contributionId}/validate`, null, {
        params: {
          approved,
          admin_notes: adminNotes || undefined
        }
      });
      
      toast.success(approved ? 'Contribution validée !' : 'Contribution refusée');
      setSelectedContrib(null);
      setAdminNotes('');
      fetchContributions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    } finally {
      setProcessing(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'food_scan': return <Apple className="w-5 h-5 text-green-500" />;
      case 'maternity_bag': return <ShoppingBag className="w-5 h-5 text-pink-500" />;
      case 'recipe': return <ChefHat className="w-5 h-5 text-amber-500" />;
      default: return <Eye className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'food_scan': return 'Scan Alimentaire';
      case 'maternity_bag': return 'Sac Maternité';
      case 'recipe': return 'Recette Bébé';
      default: return type;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Validée</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" /> Refusée</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Validation Contributions
            </h2>
            <p className="text-sm text-slate-500">Modérez les soumissions de la communauté</p>
          </div>
        </div>

        <Button
          onClick={fetchContributions}
          className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-amber-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.pending || 0}</div>
          <div className="text-sm text-amber-700">En attente</div>
        </Card>
        <Card className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
          <div className="text-sm text-green-700">Validées</div>
        </Card>
        <Card className="bg-red-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
          <div className="text-sm text-red-700">Refusées</div>
        </Card>
        <Card className="bg-slate-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-slate-600">{stats.total || 0}</div>
          <div className="text-sm text-slate-700">Total</div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
        {[
          { key: 'pending', label: 'En attente', count: stats.pending },
          { key: 'approved', label: 'Validées', count: stats.approved },
          { key: 'rejected', label: 'Refusées', count: stats.rejected },
          { key: 'all', label: 'Toutes', count: stats.total }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === key
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            data-testid={`filter-${key}`}
          >
            {label} {count !== undefined && `(${count})`}
          </button>
        ))}
      </div>

      {/* Contributions List */}
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-10 h-10 border-4 border-pink-300 border-t-pink-600 rounded-full" />
        </div>
      ) : contributions.length === 0 ? (
        <Card className="bg-white/90 p-8 rounded-2xl text-center">
          <p className="text-slate-500">Aucune contribution {filter !== 'all' ? 'dans cette catégorie' : ''}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {contributions.map((contrib) => (
            <Card 
              key={contrib.id}
              className={`bg-white/90 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                selectedContrib?.id === contrib.id ? 'ring-2 ring-pink-400' : ''
              }`}
              onClick={() => setSelectedContrib(selectedContrib?.id === contrib.id ? null : contrib)}
              data-testid={`contrib-${contrib.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(contrib.contribution_type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700">{contrib.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {contrib.user_name || contrib.user_email}
                      </span>
                      <span>•</span>
                      <span>{getTypeName(contrib.contribution_type)}</span>
                    </div>
                    {contrib.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{contrib.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {getStatusBadge(contrib.status)}
                </div>
              </div>

              {/* Expanded view for pending contributions */}
              {selectedContrib?.id === contrib.id && contrib.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                  {/* Data preview */}
                  {contrib.data && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                      <h4 className="text-sm font-medium text-slate-600 mb-2">Données soumises:</h4>
                      <pre className="text-xs text-slate-500 overflow-x-auto max-h-32">
                        {JSON.stringify(contrib.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Admin notes */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-600 mb-1 block">
                      Note pour l'utilisatrice (optionnel)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ex: Merci pour ta contribution ! ou Produit déjà dans la base..."
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-pink-400 focus:outline-none text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleValidate(contrib.id, true)}
                      disabled={processing}
                      className="flex-1 btn-cloud-3d-blue text-white py-2 rounded-xl flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
                        boxShadow: '-4px -4px 12px rgba(255,255,255,0.9), 4px 4px 16px rgba(244,63,94,0.35), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(244,63,94,0.15)',
                        border: '1px solid rgba(254,205,211,0.6)',
                      }}
                      data-testid="approve-btn"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Valider
                    </Button>
                    <Button
                      onClick={() => handleValidate(contrib.id, false)}
                      disabled={processing}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                      data-testid="reject-btn"
                    >
                      <XCircle className="w-5 h-5" />
                      Refuser
                    </Button>
                  </div>
                </div>
              )}

              {/* Show review info for already processed contributions */}
              {(contrib.status === 'approved' || contrib.status === 'rejected') && contrib.reviewed_at && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  Traité par {contrib.reviewed_by} le {new Date(contrib.reviewed_at).toLocaleDateString('fr-FR')}
                  {contrib.admin_notes && (
                    <p className="mt-1 italic">"{contrib.admin_notes}"</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContributionsManager;
