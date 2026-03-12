import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Heart, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await api.favorites.getAll();
      setFavorites(response.data);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (foodName) => {
    try {
      await api.favorites.remove(foodName);
      setFavorites(prev => prev.filter(f => f.name !== foodName));
      toast.success('Retiré des favoris');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getSafetyIcon = (status) => {
    switch (status) {
      case 'safe':
        return <ShieldCheck className="w-5 h-5 text-green-500" />;
      case 'caution':
        return <ShieldAlert className="w-5 h-5 text-yellow-500" />;
      case 'avoid':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'unsafe':
        return <ShieldX className="w-5 h-5 text-red-500" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSafetyText = (status) => {
    switch (status) {
      case 'safe':
        return { text: 'Sûr', color: 'text-green-600 bg-green-50' };
      case 'caution':
        return { text: 'Précaution', color: 'text-yellow-600 bg-yellow-50' };
      case 'avoid':
        return { text: 'À éviter', color: 'text-orange-600 bg-orange-50' };
      case 'unsafe':
        return { text: 'Non sûr', color: 'text-red-600 bg-red-50' };
      default:
        return { text: 'Inconnu', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const groupByStatus = () => {
    const groups = {
      safe: favorites.filter(f => f.status === 'safe'),
      caution: favorites.filter(f => f.status === 'caution'),
      avoid: favorites.filter(f => f.status === 'avoid' || f.status === 'unsafe'),
      unknown: favorites.filter(f => !['safe', 'caution', 'avoid', 'unsafe'].includes(f.status))
    };
    return groups;
  };

  const groups = groupByStatus();

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Mes aliments favoris" />

        {loading ? (
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : favorites.length === 0 ? (
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center" data-testid="empty-favorites">
            <Heart className="w-16 h-16 text-pink-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Aucun favori</h3>
            <p className="text-slate-500 mb-4">Ajoutez des aliments en favoris depuis le scanner</p>
            <Button
              onClick={() => navigate('/scanner')}
              data-testid="go-scanner-button"
              className="bg-gradient-to-r from-pink-400 to-pink-300 text-white rounded-full px-6 py-2"
            >
              Scanner des aliments
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-3xl p-6 border-0">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {favorites.length} aliment{favorites.length > 1 ? 's' : ''} en favoris
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/60 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-green-600">{groups.safe.length}</p>
                  <p className="text-xs text-slate-600">Sûrs</p>
                </div>
                <div className="bg-white/60 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-yellow-600">{groups.caution.length}</p>
                  <p className="text-xs text-slate-600">Précaution</p>
                </div>
                <div className="bg-white/60 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-orange-600">{groups.avoid.length}</p>
                  <p className="text-xs text-slate-600">À éviter</p>
                </div>
              </div>
            </Card>

            {/* Avoid section - show first as warning */}
            {groups.avoid.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  À éviter ({groups.avoid.length})
                </h3>
                <div className="space-y-2">
                  {groups.avoid.map((item) => (
                    <Card key={item.id} className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4" data-testid={`favorite-${item.name}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSafetyIcon(item.status)}
                          <div>
                            <h4 className="font-bold text-slate-700">{item.name}</h4>
                            {item.reason && <p className="text-xs text-slate-500">{item.reason}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFavorite(item.name)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                          data-testid={`remove-${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Caution section */}
            {groups.caution.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-yellow-600 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  Avec précaution ({groups.caution.length})
                </h3>
                <div className="space-y-2">
                  {groups.caution.map((item) => (
                    <Card key={item.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4" data-testid={`favorite-${item.name}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSafetyIcon(item.status)}
                          <div>
                            <h4 className="font-bold text-slate-700">{item.name}</h4>
                            {item.reason && <p className="text-xs text-slate-500">{item.reason}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFavorite(item.name)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Safe section */}
            {groups.safe.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Aliments sûrs ({groups.safe.length})
                </h3>
                <div className="space-y-2">
                  {groups.safe.map((item) => (
                    <Card key={item.id} className="bg-green-50 border border-green-200 rounded-2xl p-4" data-testid={`favorite-${item.name}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSafetyIcon(item.status)}
                          <div>
                            <h4 className="font-bold text-slate-700">{item.name}</h4>
                            {item.category && <p className="text-xs text-slate-500">{item.category}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFavorite(item.name)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
