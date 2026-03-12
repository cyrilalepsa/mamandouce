import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Camera, Search, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Heart, X, Keyboard, Plus, Library } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import api from '../utils/api';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import PageHeader from '../components/PageHeader';

function FoodScanner() {
  const navigate = useNavigate();
  const location = useLocation();
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
    setLoading(true);
    try {
      const response = await api.scan.barcode(code);
      setResult(response.data);
      setSearchResults([]);
      toast.success('Produit trouvé !');
    } catch (error) {
      toast.error('Erreur lors du scan');
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
      toast.error('Erreur lors de la recherche');
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

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Scanner d'aliments" />

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            onClick={() => { setActiveTab('camera'); if (!scanning) startScanner(); }}
            data-testid="camera-tab"
            className={`flex-1 rounded-full py-3 font-semibold ${activeTab === 'camera' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600'}`}
          >
            <Camera className="w-4 h-4 mr-2" />
            Caméra
          </Button>
          <Button
            onClick={() => { stopScanner(); setActiveTab('manual'); }}
            data-testid="manual-tab"
            className={`flex-1 rounded-full py-3 font-semibold ${activeTab === 'manual' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600'}`}
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Manuel
          </Button>
          <Button
            onClick={() => { stopScanner(); setActiveTab('search'); }}
            data-testid="search-tab"
            className={`flex-1 rounded-full py-3 font-semibold ${activeTab === 'search' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600'}`}
          >
            <Search className="w-4 h-4 mr-2" />
            Recherche
          </Button>
        </div>

        {/* Camera Scanner */}
        {activeTab === 'camera' && (
          <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="text-center mb-4">
              <p className="text-slate-600 mb-4">Pointez la caméra vers le code-barres du produit</p>
              
              <div id="qr-reader" className="mx-auto rounded-2xl overflow-hidden" style={{ maxWidth: '100%' }}></div>
              
              {!scanning && (
                <Button
                  onClick={startScanner}
                  data-testid="start-camera"
                  className="mt-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white rounded-full px-8 py-3 font-semibold"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Démarrer la caméra
                </Button>
              )}
              
              {scanning && (
                <Button
                  onClick={stopScanner}
                  data-testid="stop-camera"
                  className="mt-4 bg-red-500 text-white rounded-full px-8 py-3 font-semibold"
                >
                  <X className="w-5 h-5 mr-2" />
                  Arrêter
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
                <label className="text-sm font-medium text-slate-600 mb-2 block">Code-barres (EAN)</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 3017620422003"
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
                {loading ? 'Recherche...' : 'Rechercher le produit'}
              </Button>
            </form>
          </Card>
        )}

        {/* Search by Name */}
        {activeTab === 'search' && (
          <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-2 block">Nom de l'aliment</label>
                <Input
                  type="text"
                  placeholder="Ex: fromage, saumon, café..."
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
                {loading ? 'Recherche...' : 'Rechercher'}
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
            <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Résultats ({searchResults.length})</h3>
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
                Aliment non trouvé
              </h3>
              <p className="text-slate-600 mb-4">
                "{searchQuery}" n'est pas dans notre base de données.
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
                Proposer cet aliment
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
            Voir la bibliothèque
          </Button>
          <Button
            onClick={() => setShowAddFoodModal(true)}
            data-testid="add-new-food"
            className="flex-1 bg-gradient-to-r from-green-400 to-green-300 text-white rounded-2xl py-3 font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un aliment
          </Button>
        </div>

        {/* Add Food Modal */}
        <Dialog open={showAddFoodModal} onOpenChange={setShowAddFoodModal}>
          <DialogContent className="bg-white rounded-3xl max-w-md" data-testid="add-food-modal">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-700" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Proposer un aliment
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddFood} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Nom de l'aliment *</label>
                <Input
                  value={newFoodData.name}
                  onChange={(e) => setNewFoodData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Quinoa, Tofu..."
                  className="rounded-xl"
                  data-testid="add-food-name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Code-barres (optionnel)</label>
                <Input
                  value={newFoodData.barcode}
                  onChange={(e) => setNewFoodData(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Ex: 3700000000000"
                  className="rounded-xl"
                  data-testid="add-food-barcode"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Catégorie</label>
                <select
                  value={newFoodData.category}
                  onChange={(e) => setNewFoodData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-600"
                  data-testid="add-food-category"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Légumes">Légumes</option>
                  <option value="Viandes">Viandes</option>
                  <option value="Poissons">Poissons</option>
                  <option value="Produits laitiers">Produits laitiers</option>
                  <option value="Fromages">Fromages</option>
                  <option value="Céréales">Céréales</option>
                  <option value="Légumineuses">Légumineuses</option>
                  <option value="Boissons">Boissons</option>
                  <option value="Condiments">Condiments</option>
                  <option value="Produits sucrés">Produits sucrés</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Notes / Commentaires</label>
                <textarea
                  value={newFoodData.notes}
                  onChange={(e) => setNewFoodData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informations supplémentaires..."
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
                  {addingFood ? 'Envoi en cours...' : 'Soumettre pour vérification'}
                </Button>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Votre proposition sera examinée avant d'être ajoutée à la bibliothèque.
              </p>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default FoodScanner;
