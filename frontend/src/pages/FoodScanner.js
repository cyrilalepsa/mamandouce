import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Camera, Search, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Heart, X, Keyboard, Plus, Library, Crown, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import api from '../utils/api';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import PageHeader from '../components/PageHeader';
import { useSubscription } from '../components/SubscriptionGate';

function FoodScanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isPremium, subscriptionStatus, loading: subscriptionLoading } = useSubscription();
  
  const [barcode, setBarcode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('camera');
  const [favorites, setFavorites] = useState(new Set());
  const [scanning, setScanning] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [newFoodData, setNewFoodData] = useState({ name: '', barcode: '', category: '', notes: '' });
  const [addingFood, setAddingFood] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const html5QrCodeRef = useRef(null);
  const scannerRef = useRef(null);
  
  // Compute premium status from context
  const scansThisWeek = subscriptionStatus?.scans_this_week || 0;
  const scansRemaining = isPremium ? -1 : Math.max(0, 5 - scansThisWeek);

  useEffect(() => {
    loadFavorites();
    // Check if we should open the add modal
    if (location.state?.openAddModal) {
      setShowAddFoodModal(true);
    }
    return () => {
      stopScanner();
    };
  }, [location.state]);

  const loadFavorites = async () => {
    try {
      const response = await api.favorites.getAll();
      const favNames = new Set(response.data.map(f => f.name));
      setFavorites(favNames);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };

  const startScanner = async () => {
    try {
      if (scannerRef.current) {
        await stopScanner();
      }
      
      setScanning(true);
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          await stopScanner();
          setBarcode(decodedText);
          handleBarcodeScanned(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors
        }
      );
    } catch (err) {
      console.error("Erreur démarrage caméra:", err);
      toast.error("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Erreur arrêt scanner:", err);
      }
    }
    setScanning(false);
  };

  const handleBarcodeScanned = async (code) => {
    // Vérifier limite pour utilisateurs gratuits
    if (!isPremium && scansRemaining <= 0) {
      toast.error(
        <div>
          <p className="font-bold">Limite atteinte !</p>
          <p>5 scans/semaine en version gratuite.</p>
          <button 
            onClick={() => navigate('/pricing')}
            className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm"
          >
            Passer à Premium
          </button>
        </div>,
        { duration: 5000 }
      );
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.scan.barcode(code);
      setResult(response.data);
      setSearchResults([]);
      toast.success('Produit trouvé !');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(
          <div>
            <p className="font-bold">Limite atteinte !</p>
            <p>5 scans/semaine en version gratuite.</p>
            <button 
              onClick={() => navigate('/pricing')}
              className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm"
            >
              Passer à Premium
            </button>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error('Erreur lors du scan');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (food) => {
    try {
      if (favorites.has(food.name)) {
        await api.favorites.remove(food.name);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(food.name);
          return newSet;
        });
        toast.success('Retiré des favoris');
      } else {
        await api.favorites.add({
          name: food.name,
          status: food.safe_for_pregnancy || food.status || 'unknown',
          reason: food.reason || '',
          category: food.category || ''
        });
        setFavorites(prev => new Set([...prev, food.name]));
        toast.success('Ajouté aux favoris');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification des favoris');
    }
  };

  const handleManualBarcode = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    await handleBarcodeScanned(barcode);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Vérifier limite pour utilisateurs gratuits
    if (!isPremium && scansRemaining <= 0) {
      toast.error(
        <div>
          <p className="font-bold">Limite atteinte !</p>
          <p>5 recherches/semaine en version gratuite.</p>
          <button 
            onClick={() => navigate('/pricing')}
            className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm"
          >
            Passer à Premium
          </button>
        </div>,
        { duration: 5000 }
      );
      return;
    }
    
    setLoading(true);
    setNotFound(false);
    try {
      const response = await api.scan.search(searchQuery);
      setSearchResults(response.data);
      setResult(null);
      if (response.data.length === 0) {
        setNotFound(true);
        setNewFoodData(prev => ({ ...prev, name: searchQuery }));
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(
          <div>
            <p className="font-bold">Limite atteinte !</p>
            <p>5 recherches/semaine en version gratuite.</p>
            <button 
              onClick={() => navigate('/pricing')}
              className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm"
            >
              Passer à Premium
            </button>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error('Erreur lors de la recherche');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!newFoodData.name.trim()) {
      toast.error('Le nom de l\'aliment est requis');
      return;
    }
    
    setAddingFood(true);
    try {
      await api.foodLibrary.addFood(newFoodData);
      toast.success('Aliment soumis pour vérification !');
      setShowAddFoodModal(false);
      setNewFoodData({ name: '', barcode: '', category: '', notes: '' });
      setNotFound(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'ajout');
    } finally {
      setAddingFood(false);
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
        return { text: t('scanner.safe'), color: 'text-green-600 bg-green-50' };
      case 'caution':
        return { text: t('scanner.caution'), color: 'text-yellow-600 bg-yellow-50' };
      case 'avoid':
        return { text: t('scanner.avoid'), color: 'text-orange-600 bg-orange-50' };
      case 'unsafe':
        return { text: t('scanner.unsafe'), color: 'text-red-600 bg-red-50' };
      default:
        return { text: t('scanner.unknown'), color: 'text-gray-600 bg-gray-50' };
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title={t('scanner.title')} backPath="/section/pregnancy" />

        {/* Scans Remaining Banner for free users */}
        {!subscriptionLoading && !isPremium && (
          <div className={`rounded-2xl p-3 flex items-center justify-between ${
            scansRemaining > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {scansRemaining > 0 ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <Lock className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${scansRemaining > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                {scansRemaining > 0 
                  ? (scansRemaining > 1 ? t('scanner.scansRemainingPlural', { count: scansRemaining }) : t('scanner.scansRemaining', { count: scansRemaining }))
                  : t('scanner.limitReachedWeek')
                }
              </span>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
            >
              <Crown className="w-3 h-3" />
              Premium
            </button>
          </div>
        )}

        {/* Premium badge */}
        {!subscriptionLoading && isPremium && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">{t('scanner.unlimitedScans')}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            onClick={() => { setActiveTab('camera'); if (!scanning) startScanner(); }}
            data-testid="camera-tab"
            className={`flex-1 rounded-full py-3 font-semibold ${activeTab === 'camera' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600'}`}
          >
            <Camera className="w-4 h-4 mr-2" />
            {t('scanner.camera')}
          </Button>
          <Button
            onClick={() => { stopScanner(); setActiveTab('manual'); }}
            data-testid="manual-tab"
            className={`flex-1 rounded-full py-3 font-semibold ${activeTab === 'manual' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600'}`}
          >
            <Keyboard className="w-4 h-4 mr-2" />
            {t('scanner.manual')}
          </Button>
          <Button
            onClick={() => { stopScanner(); setActiveTab('search'); }}
            data-testid="search-tab"
            className={`flex-1 rounded-full py-3 font-semibold ${activeTab === 'search' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600'}`}
          >
            <Search className="w-4 h-4 mr-2" />
            {t('scanner.search')}
          </Button>
        </div>

        {/* Camera Scanner */}
        {activeTab === 'camera' && (
          <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="text-center mb-4">
              <p className="text-slate-600 mb-4">{t('scanner.pointCamera')}</p>
              
              <div id="qr-reader" className="mx-auto rounded-2xl overflow-hidden" style={{ maxWidth: '100%' }}></div>
              
              {!scanning && (
                <Button
                  onClick={startScanner}
                  data-testid="start-camera"
                  className="mt-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white rounded-full px-8 py-3 font-semibold"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {t('scanner.startCamera')}
                </Button>
              )}
              
              {scanning && (
                <Button
                  onClick={stopScanner}
                  data-testid="stop-camera"
                  className="mt-4 bg-red-500 text-white rounded-full px-8 py-3 font-semibold"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t('scanner.stopCamera')}
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Manual Barcode Input */}
        {activeTab === 'manual' && (
          <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <form onSubmit={handleManualBarcode} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-2 block">{t('scanner.barcodeEAN')}</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('scanner.barcodeExample')}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="rounded-xl border-slate-200 focus:ring-sky-500"
                  data-testid="barcode-input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !barcode.trim()}
                data-testid="scan-button"
                className="w-full bg-gradient-to-r from-sky-500 to-sky-400 text-white rounded-full py-3 font-semibold disabled:opacity-50"
              >
                {loading ? t('scanner.searching') : t('scanner.searchProduct')}
              </Button>
            </form>
          </Card>
        )}

        {/* Search by Name */}
        {activeTab === 'search' && (
          <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-2 block">{t('scanner.foodName')}</label>
                <Input
                  type="text"
                  placeholder={t('scanner.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border-slate-200 focus:ring-sky-500"
                  data-testid="search-input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                data-testid="search-button"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-full py-3 font-semibold disabled:opacity-50"
              >
                {loading ? t('scanner.searching') : t('common.search')}
              </Button>
            </form>
          </Card>
        )}

        {/* Single Result */}
        {result && (
          <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-fade-in" data-testid="result-card">
            <div className="flex items-start gap-4">
              {result.image_url && (
                <img src={result.image_url} alt={result.name} className="w-24 h-24 object-cover rounded-2xl" />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{result.name}</h3>
                    {result.brand && <p className="text-slate-500 text-sm">{result.brand}</p>}
                  </div>
                  <button
                    onClick={() => toggleFavorite(result)}
                    data-testid="favorite-button"
                    className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                  >
                    <Heart 
                      className={`w-6 h-6 ${favorites.has(result.name) ? 'fill-pink-500 text-pink-500' : 'text-slate-300'}`} 
                    />
                  </button>
                </div>
                <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full ${getSafetyText(result.safe_for_pregnancy).color}`}>
                  {getSafetyIcon(result.safe_for_pregnancy)}
                  <span className="font-semibold">{getSafetyText(result.safe_for_pregnancy).text}</span>
                </div>
                {result.reason && (
                  <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{result.reason}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('common.results')} ({searchResults.length})</h3>
            {searchResults.map((item, index) => (
              <Card key={index} className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 card-hover" data-testid={`search-result-${index}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-700">{item.name}</h4>
                    <p className="text-sm text-slate-500">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getSafetyText(item.safe_for_pregnancy).color}`}>
                      {getSafetyIcon(item.safe_for_pregnancy)}
                      <span className="text-xs font-semibold">{getSafetyText(item.safe_for_pregnancy).text}</span>
                    </div>
                    <button
                      onClick={() => toggleFavorite(item)}
                      data-testid={`favorite-button-${index}`}
                      className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 ${favorites.has(item.name) ? 'fill-pink-500 text-pink-500' : 'text-slate-300'}`} 
                      />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Not Found - Suggest adding */}
        {notFound && searchQuery && searchResults.length === 0 && (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200" data-testid="not-found-card">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t('scanner.foodNotFound')}
              </h3>
              <p className="text-slate-600 mb-4">
                "{searchQuery}" {t('scanner.notInDatabase')}
              </p>
              <Button
                onClick={() => {
                  setNewFoodData(prev => ({ ...prev, name: searchQuery }));
                  setShowAddFoodModal(true);
                }}
                data-testid="add-unknown-food"
                className="bg-gradient-to-r from-pink-400 to-pink-300 text-white rounded-full px-6 py-3 font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('scanner.proposeFood')}
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/library')}
            data-testid="go-to-library"
            className="flex-1 bg-white text-slate-600 border border-slate-200 rounded-2xl py-3 font-semibold hover:bg-slate-50"
          >
            <Library className="w-5 h-5 mr-2" />
            {t('scanner.seeLibrary')}
          </Button>
          <Button
            onClick={() => setShowAddFoodModal(true)}
            data-testid="add-new-food"
            className="flex-1 bg-gradient-to-r from-green-400 to-green-300 text-white rounded-2xl py-3 font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('scanner.addFood')}
          </Button>
        </div>

        {/* Add Food Modal */}
        <Dialog open={showAddFoodModal} onOpenChange={setShowAddFoodModal}>
          <DialogContent className="bg-white rounded-3xl max-w-md" data-testid="add-food-modal">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-700" style={{ fontFamily: "'Dancing Script', cursive" }}>
                {t('scanner.proposeFoodTitle')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddFood} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">{t('scanner.foodNameRequired')}</label>
                <Input
                  value={newFoodData.name}
                  onChange={(e) => setNewFoodData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('scanner.foodNamePlaceholder')}
                  className="rounded-xl"
                  data-testid="add-food-name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">{t('scanner.barcodeOptional')}</label>
                <Input
                  value={newFoodData.barcode}
                  onChange={(e) => setNewFoodData(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Ex: 3700000000000"
                  className="rounded-xl"
                  data-testid="add-food-barcode"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">{t('scanner.category')}</label>
                <select
                  value={newFoodData.category}
                  onChange={(e) => setNewFoodData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-600"
                  data-testid="add-food-category"
                >
                  <option value="">{t('scanner.selectCategory')}</option>
                  <option value="Fruits">{t('library.fruits')}</option>
                  <option value="Légumes">{t('library.vegetables')}</option>
                  <option value="Viandes">{t('library.meat')}</option>
                  <option value="Poissons">{t('library.fish')}</option>
                  <option value="Produits laitiers">{t('library.dairy')}</option>
                  <option value="Fromages">{t('library.dairy')}</option>
                  <option value="Céréales">{t('library.grains')}</option>
                  <option value="Légumineuses">{t('library.grains')}</option>
                  <option value="Boissons">{t('library.beverages')}</option>
                  <option value="Condiments">{t('library.other')}</option>
                  <option value="Produits sucrés">{t('library.sweets')}</option>
                  <option value="Autre">{t('library.other')}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">{t('scanner.notesComments')}</label>
                <textarea
                  value={newFoodData.notes}
                  onChange={(e) => setNewFoodData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('scanner.additionalInfo')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-600 resize-none h-20"
                  data-testid="add-food-notes"
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={addingFood || !newFoodData.name.trim()}
                  data-testid="submit-add-food"
                  className="w-full bg-gradient-to-r from-green-400 to-green-300 text-white rounded-full py-3 font-bold disabled:opacity-50"
                >
                  {addingFood ? t('common.sending') : t('scanner.submitForReview')}
                </Button>
              </div>
              <p className="text-xs text-slate-500 text-center">
                {t('scanner.proposalNote')}
              </p>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default FoodScanner;
