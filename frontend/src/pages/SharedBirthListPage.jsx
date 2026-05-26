import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Gift, ShoppingBag, ExternalLink, Check, Heart } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import AppTitle from '../components/AppTitle';

const STORES = [
  { id: 'orchestra', name: 'Orchestra', color: 'from-orange-500 to-orange-400' },
  { id: 'vertbaudet', name: 'Vertbaudet', color: 'from-green-500 to-green-400' },
  { id: 'amazon', name: 'Amazon', color: 'from-amber-500 to-amber-400' },
  { id: 'aubert', name: 'Aubert', color: 'from-blue-500 to-blue-400' },
  { id: 'kiabi', name: 'Kiabi', color: 'from-pink-500 to-pink-400' },
  { id: 'autre', name: 'Autre', color: 'from-slate-500 to-slate-400' }
];

function SharedBirthListPage() {
  const { shareId } = useParams();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedList();
  }, [shareId]);

  const loadSharedList = async () => {
    setLoading(true);
    try {
      const response = await api.birthList.getShared(shareId);
      setList(response.data);
    } catch (error) {
      setError('Liste introuvable ou lien invalide');
    } finally {
      setLoading(false);
    }
  };

  const toggleReserved = async (itemId) => {
    try {
      const response = await api.birthList.toggleReservedShared(shareId, itemId);
      setList(response.data);
      toast.success('Mis à jour !');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const getStoreInfo = (storeId) => {
    return STORES.find(s => s.id === storeId) || STORES[STORES.length - 1];
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <Card className="bg-white rounded-3xl p-8 text-center max-w-md">
          <p className="text-slate-500">Chargement de la liste...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <Card className="bg-white rounded-3xl p-8 text-center max-w-md">
          <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">Oups !</h2>
          <p className="text-slate-500">{error}</p>
        </Card>
      </div>
    );
  }

  const items = list?.items || [];
  const reservedCount = items.filter(i => i.reserved).length;

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center py-4">
          <AppTitle size="lg" />
          <div className="flex items-center justify-center gap-2 mt-4">
            <Gift className="w-6 h-6 text-pink-500" />
            <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Liste de naissance
            </h1>
          </div>
          {list?.owner_name && (
            <p className="text-slate-500 mt-2">de {list.owner_name}</p>
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 border-0">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-700">{items.length}</p>
              <p className="text-xs text-slate-500">Articles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{reservedCount}</p>
              <p className="text-xs text-slate-500">Réservés</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-600">{items.length - reservedCount}</p>
              <p className="text-xs text-slate-500">Disponibles</p>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <p className="text-sm text-amber-800 text-center">
            <Heart className="w-4 h-4 inline mr-1 text-pink-500" />
            Cliquez sur <strong>"Réserver"</strong> pour indiquer que vous offrirez cet article
          </p>
        </Card>

        {/* Items List */}
        {items.length === 0 ? (
          <Card className="bg-white rounded-3xl p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">La liste est vide pour le moment</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const store = getStoreInfo(item.store);
              return (
                <Card
                  key={item.id || index}
                  className={`rounded-2xl p-4 border-2 transition-all ${item.reserved ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}
                  data-testid={`shared-item-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${store.color} flex items-center justify-center flex-shrink-0`}>
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-700">{item.name}</h4>
                          <p className="text-xs text-slate-500">{store.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        {item.price && (
                          <span className="text-sm font-semibold text-slate-600">{item.price}€</span>
                        )}
                        {item.quantity > 1 && (
                          <span className="text-xs text-slate-500">Qté: {item.quantity}</span>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-500 text-xs flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Voir le produit
                          </a>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-slate-400 mt-1 italic">{item.notes}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => toggleReserved(item.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        item.reserved
                          ? 'bg-green-500 text-white'
                          : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                      }`}
                      data-testid={`reserve-item-${index}`}
                    >
                      {item.reserved ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Réservé
                        </>
                      ) : (
                        'Réserver'
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 py-4">
          Liste créée avec MamanDouce
        </p>
      </div>
    </div>
  );
}

export default SharedBirthListPage;
