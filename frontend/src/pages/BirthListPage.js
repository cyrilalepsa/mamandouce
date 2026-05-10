import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Gift, Plus, Trash2, Share2, Copy, Check, ExternalLink, ShoppingBag, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { getStoresForLanguage } from '../data/storesByCountry';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

// Style glossy 3D nuage
const glossyStyle = {
  bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(252,231,243,0.9) 45%, rgba(251,207,232,0.75) 70%, rgba(249,168,212,0.55) 100%)',
  shadow: '0 10px 28px -6px rgba(244,114,182,0.25), 0 6px 12px -4px rgba(244,114,182,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(244,114,182,0.1)',
  border: '2px solid rgba(244,114,182,0.25)'
};

// Reflet glossy
const GlossyReflect = () => null;

// Les magasins seront chargés dynamiquement selon la langue
const getStores = (langCode) => {
  const countryData = getStoresForLanguage(langCode);
  return countryData.stores.map((store, index) => ({
    id: store.name.toLowerCase().replace(/\s+/g, '-'),
    name: store.name,
    color: getStoreColor(index),
    url: store.url,
    description: store.description,
    popular: store.popular
  }));
};

const getStoreColor = (index) => {
  const colors = [
    'from-orange-500 to-orange-400',
    'from-green-500 to-green-400',
    'from-amber-500 to-amber-400',
    'from-blue-500 to-blue-400',
    'from-pink-500 to-pink-400',
    'from-purple-500 to-purple-400',
    'from-slate-500 to-slate-400'
  ];
  return colors[index % colors.length];
};

function BirthListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  
  // Magasins dynamiques selon le pays
  const STORES = useMemo(() => {
    const stores = getStores(currentLang);
    // Ajouter "Autre" à la fin
    stores.push({ id: 'autre', name: t('library.other', 'Autre'), color: 'from-slate-500 to-slate-400', url: '' });
    return stores;
  }, [currentLang, t]);
  
  // Infos du pays
  const countryData = useMemo(() => getStoresForLanguage(currentLang), [currentLang]);
  
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    store: STORES[0]?.id || 'autre',
    url: '',
    price: '',
    quantity: 1,
    notes: ''
  });

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    setLoading(true);
    try {
      const response = await api.birthList.get();
      if (response.data) {
        setList(response.data);
        setItems(response.data.items || []);
      }
    } catch (error) {
      // No list yet, that's ok
      console.log('No birth list found');
    } finally {
      setLoading(false);
    }
  };

  const createList = async () => {
    try {
      const response = await api.birthList.create();
      setList(response.data);
      setItems([]);
      toast.success('Liste de naissance créée !');
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      toast.error(t('birthList.itemNameRequired', 'Le nom est requis'));
      return;
    }

    try {
      const response = await api.birthList.addItem(newItem);
      setItems(response.data.items);
      setShowAddDialog(false);
      setNewItem({ name: '', store: 'orchestra', url: '', price: '', quantity: 1, notes: '' });
      toast.success(t('birthList.itemAdded', 'Article ajouté !'));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await api.birthList.removeItem(itemId);
      setItems(response.data.items);
      toast.success(t('birthList.itemRemoved', 'Article supprimé'));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const toggleReserved = async (itemId) => {
    try {
      const response = await api.birthList.toggleReserved(itemId);
      setItems(response.data.items);
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const getShareUrl = () => {
    if (!list) return '';
    return `${window.location.origin}/birth-list/shared/${list.share_id}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    toast.success(t('birthList.linkCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const getStoreInfo = (storeId) => {
    return STORES.find(s => s.id === storeId) || STORES[STORES.length - 1];
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-2xl mx-auto">
          <PageHeader title={t('birthList.title')} />
          <Card className="bg-white rounded-3xl p-8 text-center">
            <p className="text-slate-500">{t('common.loading')}</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <PageHeader title={t('birthList.title')} />
          
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 text-center border-0">
            <Gift className="w-20 h-20 text-pink-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t('birthList.createList', 'Créez votre liste de naissance')}
            </h2>
            <p className="text-slate-600 mb-6">
              {t('birthList.shareWithFamily')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {STORES.slice(0, 5).map(store => (
                <div 
                  key={store.id} 
                  className={`relative overflow-hidden px-4 py-2 rounded-full bg-gradient-to-r ${store.color} text-white text-sm font-semibold`}
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), 0 4px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {/* Reflet glossy */}
                  {/* Voile blanc supprimé */}
                  <span className="relative">{store.name}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={createList}
              data-testid="create-list-button"
              className="bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-pink-200/50"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('birthList.createMyList', 'Créer ma liste')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title={t('birthList.title')} />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddDialog(true)}
            data-testid="add-item-button"
            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-2xl py-3 font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('birthList.addItem')}
          </Button>
          <Button
            onClick={() => setShowShareDialog(true)}
            data-testid="share-button"
            className="bg-gradient-to-r from-purple-500 to-purple-400 text-white rounded-2xl px-6 py-3 font-semibold"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats - Effet glossy */}
        <div 
          className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: glossyStyle.bg,
            boxShadow: glossyStyle.shadow,
            border: glossyStyle.border
          }}
        >
          <GlossyReflect />
          <div className="relative">
            <p className="text-sm text-slate-500">{t('birthList.itemsInList', 'Articles dans la liste')}</p>
            <p className="text-2xl font-bold text-slate-700">{items.length}</p>
          </div>
          <div className="relative">
            <p className="text-sm text-slate-500">{t('birthList.reserved')}</p>
            <p className="text-2xl font-bold text-green-600">{items.filter(i => i.reserved).length}</p>
          </div>
          <div className="relative">
            <p className="text-sm text-slate-500">{t('birthList.remaining', 'Restants')}</p>
            <p className="text-2xl font-bold text-pink-600">{items.filter(i => !i.reserved).length}</p>
          </div>
        </div>

        {/* Items List */}
        {items.length === 0 ? (
          <Card className="bg-white rounded-3xl p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">{t('birthList.emptyList')}</p>
            <p className="text-sm text-slate-400 mt-1">{t('birthList.addFirstItem')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const store = getStoreInfo(item.store);
              return (
                <Card
                  key={item.id || index}
                  className={`rounded-2xl p-4 border-2 transition-all ${item.reserved ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}
                  data-testid={`item-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${store.color} flex items-center justify-center flex-shrink-0`}>
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-700 truncate">{item.name}</h4>
                          <p className="text-xs text-slate-500">{store.name}</p>
                        </div>
                        {item.reserved && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                            Réservé
                          </span>
                        )}
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
                            Voir
                          </a>
                        )}
                        {/* Bouton vers le site de l'enseigne */}
                        {store.url && (
                          <a
                            href={store.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            data-testid={`store-link-${index}`}
                          >
                            <Globe className="w-3 h-3" />
                            {store.name}
                          </a>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-slate-400 mt-1 italic">{item.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      data-testid={`delete-item-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Item Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="bg-white rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-700" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Ajouter un article
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={addItem} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Nom de l'article *</label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Poussette, Bodies..."
                  className="rounded-xl"
                  data-testid="item-name-input"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Magasin</label>
                <div className="grid grid-cols-3 gap-2">
                  {STORES.map(store => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => setNewItem(prev => ({ ...prev, store: store.id }))}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        newItem.store === store.id
                          ? `bg-gradient-to-r ${store.color} text-white`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {store.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Lien vers le produit</label>
                <Input
                  value={newItem.url}
                  onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  className="rounded-xl"
                  data-testid="item-url-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Prix (€)</label>
                  <Input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    className="rounded-xl"
                    data-testid="item-price-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Quantité</label>
                  <Input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="rounded-xl"
                    data-testid="item-quantity-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Notes</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Taille, couleur préférée..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-600 resize-none h-16"
                  data-testid="item-notes-input"
                />
              </div>
              <Button
                type="submit"
                data-testid="submit-item"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-full py-3 font-bold"
              >
                Ajouter à la liste
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="bg-white rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-700" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Partager ma liste
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <p className="text-slate-600 text-sm">
                Partagez ce lien avec vos proches pour qu'ils puissent voir votre liste et réserver des articles :
              </p>
              <div className="flex gap-2">
                <Input
                  value={getShareUrl()}
                  readOnly
                  className="rounded-xl bg-slate-50 flex-1"
                />
                <Button
                  onClick={copyShareLink}
                  className={`rounded-xl px-4 ${copied ? 'bg-green-500' : 'bg-purple-500'} text-white`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Vos proches pourront voir la liste et marquer les articles comme réservés
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default BirthListPage;
