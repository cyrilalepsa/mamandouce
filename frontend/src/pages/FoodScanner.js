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
  
  // 🛡️ VERROU DE SÉCURITÉ ANTI-DOUBLE-CLIC ET TRIPLE-TRAME CAMERA
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [scansRemaining, setScansRemaining] = useState(5);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [addingFood, setAddingFood] = useState(false);
  const [newFoodData, setNewFoodData] = useState({
    name: '',
    barcode: '',
    category: 'Autre',
    notes: '',
    safety_status: 'unknown'
  });

  const scannerRef = useRef(null);

  useEffect(() => {
    loadScansCount();
    loadFavorites();
    
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'search') {
      setActiveTab('search');
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Erreur nettoyage scanner:", err));
      }
    };
  }, [location]);

  const loadScansCount = async () => {
    try {
      const response = await api.get('/api/scan/usage');
      setScansRemaining(response.data.remaining);
    } catch (err) {
      console.error('Erreur comptage scans:', err);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await api.get('/api/scan/favorites');
      setFavorites(new Set(response.data.map(f => f.food_id)));
    } catch (err) {
      console.error('Erreur favoris:', err);
    }
  };

  const startScanner = async () => {
    // Si déjà en train d'allumer, d'éteindre ou d'analyser, on bloque le clic parasite
    if (isProcessing) return;

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
          // 🛡️ DOUBLE VÉRIFICATION : Si un scan est déjà en cours de traitement, on jette la trame suivante
          if (isProcessing) return;
          
          setIsProcessing(true);
          setScanning(false);
          
          try {
            // Éteindre le flux caméra matériel en premier pour libérer le thread
            if (scannerRef.current) {
              await scannerRef.current.stop();
              scannerRef.current = null;
            }
            setBarcode(decodedText);
            await handleBarcodeScanned(decodedText);
          } catch (err) {
            console.error("Erreur lors de l'arrêt du scanner post-scan:", err);
          } finally {
            setIsProcessing(false);
          }
        },
        (errorMessage) => {
          // Callback silencieux pour la recherche continue de lignes
        }
      );
    } catch (err) {
      console.error("Erreur démarrage scanner:", err);
      toast.error(t('scanner.cameraError', "Impossible d'accéder à la caméra."));
      setScanning(false);
      setIsProcessing(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        setScanning(false);
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Erreur arrêt scanner:", err);
      }
    }
    setScanning(false);
  };

  const handleBarcodeScanned = async (code) => {
    if (!code) return;

    if (!isPremium && scansRemaining <= 0) {
      showPremiumToast();
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.scan.barcode(code);
      setResult(response.data);
      setSearchResults([]);
      toast.success(t('scanner.productFound', 'Produit trouvé !'));
      loadScansCount();
    } catch (error) {
      if (error.response?.status === 403) {
        showPremiumToast();
      } else if (error.response?.status === 404) {
        setNewFoodData(prev => ({ ...prev, barcode: code, name: '' }));
        setShowAddFoodModal(true);
        toast.info(t('scanner.productUnknown', 'Produit non répertorié. Vous pouvez le proposer !'));
      } else {
        toast.error(t('scanner.scanError', 'Erreur lors du scan'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await api.scan.search(searchQuery);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        toast.info(t('scanner.noResults', 'Aucun produit trouvé'));
      }
    } catch (error) {
      toast.error(t('scanner.searchError', 'Erreur lors de la recherche'));
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (foodId) => {
    try {
      if (favorites.has(foodId)) {
        await api.delete(`/api/scan/favorites/${foodId}`);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(foodId);
          return next;
        });
        toast.success(t('scanner.removedFromFavorites', 'Enlevé des favoris'));
      } else {
        await api.post('/api/scan/favorites', { food_id: foodId });
        setFavorites(prev => new Set([...prev, foodId]));
        toast.success(t('scanner.addedToFavorites', 'Ajouté aux favoris'));
      }
    } catch (err) {
      toast.error(t('common.error'));
    }
  };

  const handleAddFoodSubmit = async (e) => {
    e.preventDefault();
    if (!newFoodData.name.trim()) return;

    setAddingFood(true);
    try {
      await api.post('/api/scan/propose', newFoodData);
      toast.success(t('scanner.proposalSuccess', 'Merci ! Votre proposition est en cours d\'examen.'));
      setShowAddFoodModal(false);
    } catch (err) {
      toast.error(t('scanner.proposalError', 'Erreur lors de l\'envoi'));
    } finally {
      setAddingFood(false);
    }
  };

  const showPremiumToast = () => {
    toast.error(
      <div className="p-1">
        <p className="font-bold text-slate-800 flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
          {t('scanner.limitReached', 'Limite atteinte !')}
        </p>
        <p className="text-xs text-slate-600 mt-1">
          {t('scanner.limitNote', 'Vous avez épuisé vos 5 scans gratuits de la semaine.')}
        </p>
        <Button 
          onClick={() => { toast.dismiss(); navigate('/pricing'); }}
          className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full py-1.5 text-xs font-bold shadow-sm"
        >
          {t('scanner.upgradePremium', 'Devenir Premium')}
        </Button>
      </div>,
      { duration: 6000, position: 'top-center' }
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return <ShieldCheck className="w-8 h-8 text-green-500" />;
      case 'moderate': return <ShieldAlert className="w-8 h-8 text-amber-500" />;
      case 'danger': return <ShieldX className="w-8 h-8 text-red-500" />;
      default: return <AlertTriangle className="w-8 h-8 text-slate-400" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'safe': return 'bg-green-50 text-green-700 border-green-200';
      case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'danger': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <PageHeader title={t('scanner.title')} subtitle={t('scanner.subtitle')} />

      <div className="max-w-md mx-auto px-4 mt-4">
        {/* Barre de limitation pour les comptes gratuits */}
        {!isPremium && (
          <Card className="p-3 mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="text-xs font-semibold text-amber-800">
                {t('scanner.scansLeft', 'Scans gratuits restants :')} <span className="font-bold text-sm bg-white px-2 py-0.5 rounded-full ml-1 border border-amber-300 shadow-sm">{scansRemaining}/5</span>
              </span>
            </div>
            <button 
              onClick={() => navigate('/pricing')}
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline decoration-2"
            >
              {t('scanner.unlimited', 'Passer à l\'illimité')}
            </button>
          </Card>
        )}

        {/* Onglets Navigation Intérieure */}
        <div className="flex bg-slate-200/60 p-1 rounded-2xl mb-4 gap-1">
          <button
            onClick={() => { stopScanner(); setActiveTab('camera'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'camera' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            {t('scanner.tabCamera')}
          </button>
          <button
            onClick={() => { stopScanner(); setActiveTab('search'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'search' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Search className="w-4 h-4" />
            {t('scanner.tabSearch')}
          </button>
        </div>

        {/* CONTENU ONGLET CAMERA */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            <Card className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm relative">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                  {t('scanner.barcodeScanner')}
                </span>
                {scanning && (
                  <button 
                    onClick={stopScanner}
                    className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>

              <div className="p-6 flex flex-col items-center justify-center min-h-[260px] relative bg-slate-950">
                {scanning ? (
                  <div id="qr-reader" className="w-full max-w-[280px] overflow-hidden rounded-2xl border-2 border-sky-400 shadow-lg"></div>
                ) : (
                  <div className="text-center space-y-3 z-10 p-4">
                    <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center mx-auto border border-slate-800 shadow-md">
                      <Camera className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium max-w-[200px] mx-auto">
                      {t('scanner.cameraPrompt')}
                    </p>
                    <Button
                      onClick={startScanner}
                      disabled={isProcessing}
                      className="mt-2 bg-gradient-to-r from-sky-500 to-sky-400 text-white rounded-full px-8 py-3.5 text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {t('scanner.startCamera')}
                    </Button>
                  </div>
                )}
                {scanning && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-20 pointer-events-none">
                    <p className="text-[10px] text-sky-300 font-semibold tracking-wider uppercase animate-pulse">
                      {t('scanner.alignBarcode', 'Alignez le code-barres')}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* CONTENU ONGLET RECHERCHE */}
        {activeTab === 'search' && (
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('scanner.searchPlaceholder', 'Ex: Jambon, Biscuits, Maquillage...')}
              className="rounded-2xl border-slate-200 bg-white px-4 h-11 text-sm shadow-sm"
            />
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-4 h-11 shadow-sm">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* CHARGEMENT DES REQUÊTES */}
        {loading && (
          <Card className="p-8 rounded-3xl text-center space-y-3 border border-slate-100 bg-white shadow-sm">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{t('scanner.analyzing', 'Analyse du produit...')}</p>
          </Card>
        )}

        {/* RÉSULTATS DU SCAN UNIQUE */}
        {result && !loading && (
          <Card className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md animate-fade-in space-y-0">
            <div className={`p-4 border-b flex items-center justify-between ${getStatusBadgeClass(result.safety_status)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(result.safety_status)}
                <div>
                  <h4 className="font-bold text-sm leading-tight">{result.name}</h4>
                  <p className="text-[11px] font-medium opacity-80 mt-0.5">{result.brand || t('scanner.unknownBrand')} • {result.barcode}</p>
                </div>
              </div>
              <button 
                onClick={() => toggleFavorite(result.id)}
                className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-transform active:scale-90"
              >
                <Heart className={`w-4 h-4 ${favorites.has(result.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">{t('scanner.evaluation')}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadgeClass(result.safety_status)}`}>
                  {t(`scanner.status.${result.safety_status}`)}
                </span>
              </div>

              {result.description && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{t('scanner.details')}</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">{result.description}</p>
                </div>
              )}

              {result.contraindications && result.contraindications.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t('scanner.warnings')}
                  </span>
                  <div className="bg-red-50/30 border border-red-100 rounded-xl p-3 space-y-1.5">
                    {result.contraindications.map((c, idx) => (
                      <p key={idx} className="text-xs font-medium text-red-700 flex items-start gap-1.5">
                        <span className="mt-1 w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                        {c}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* LISTE DES RÉSULTATS DE RECHERCHE TEXTE */}
        {searchResults.length > 0 && !loading && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1 block mb-1">
              {t('scanner.searchResults', 'Résultats de recherche')}
            </span>
            {searchResults.map((item) => (
              <Card 
                key={item.id}
                onClick={async () => {
                  setResult(item);
                  setSearchResults([]);
                }}
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-slate-50">
                    {getStatusIcon(item.safety_status)}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-700">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.brand || 'Marque inconnue'}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(item.safety_status)}`}>
                  {t(`scanner.status.${item.safety_status}`)}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* POPUP DE PROPOSITION DE NOUVEAU PRODUIT (404) */}
      <Dialog open={showAddFoodModal} onOpenChange={setShowAddFoodModal}>
        <DialogContent className="bg-white rounded-3xl w-[92%] max-w-sm p-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-md font-bold text-slate-800 text-center flex items-center justify-center gap-2">
              <Plus className="w-5 h-5 text-purple-600 bg-purple-50 p-1 rounded-full" />
              {t('scanner.proposeProduct')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFoodSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('scanner.productName')} *</label>
              <Input
                type="text"
                required
                value={newFoodData.name}
                onChange={(e) => setNewFoodData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Biscuits Avoine Bio"
                className="rounded-xl border-slate-200 h-10 text-xs"
                data-testid="add-food-name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('scanner.barcode')}</label>
              <Input
                type="text"
                disabled
                value={newFoodData.barcode}
                className="rounded-xl bg-slate-50 border-slate-200 h-10 text-xs font-mono text-slate-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('library.category')}</label>
              <select
                value={newFoodData.category}
                onChange={(e) => setNewFoodData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 h-10 text-xs text-slate-600 focus:outline-none focus:border-purple-500"
              >
                <option value="Alimentation">{t('library.food')}</option>
                <option value="Cosmétique">{t('library.cosmetics')}</option>
                <option value="Compléments">{t('library.supplements')}</option>
                <option value="Autre">{t('library.other')}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('scanner.notesComments')}</label>
              <textarea
                value={newFoodData.notes}
                onChange={(e) => setNewFoodData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('scanner.additionalInfo')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 resize-none h-16 focus:outline-none focus:border-purple-500"
                data-testid="add-food-notes"
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={addingFood || !newFoodData.name.trim()}
                data-testid=\"submit-add-food\"
                className="w-full bg-gradient-to-r from-green-500 to-green-400 text-white rounded-full py-2.5 text-xs font-bold shadow-md disabled:opacity-50"
              >
                {addingFood ? t('common.sending') : t('scanner.submitForReview')}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-normal">
              {t('scanner.proposalNote')}
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FoodScanner;