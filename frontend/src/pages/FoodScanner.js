import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, ScanBarcode, Search, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Heart } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function FoodScanner() {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('barcode');
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await api.favorites.getAll();
      const favNames = new Set(response.data.map(f => f.name));
      setFavorites(favNames);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
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

  const handleScanBarcode = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.scan.barcode(barcode);
      setResult(response.data);
      setSearchResults([]);
    } catch (error) {
      toast.error('Erreur lors du scan');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.scan.search(searchQuery);
      setSearchResults(response.data);
      setResult(null);
      if (response.data.length === 0) {
        toast.info('Aucun résultat trouvé');
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const getSafetyIcon = (status) => {
    switch (status) {
      case 'safe':
        return <ShieldCheck className="w-6 h-6 text-green-500" />;
      case 'caution':
        return <ShieldAlert className="w-6 h-6 text-yellow-500" />;
      case 'avoid':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'unsafe':
        return <ShieldX className="w-6 h-6 text-red-500" />;
      default:
        return <ShieldAlert className="w-6 h-6 text-gray-400" />;
    }
  };

  const getSafetyText = (status) => {
    switch (status) {
      case 'safe':
        return { text: 'Sûr pour la grossesse', color: 'text-green-600 bg-green-50' };
      case 'caution':
        return { text: 'Avec précaution', color: 'text-yellow-600 bg-yellow-50' };
      case 'avoid':
        return { text: 'À éviter', color: 'text-orange-600 bg-orange-50' };
      case 'unsafe':
        return { text: 'Non sûr', color: 'text-red-600 bg-red-50' };
      default:
        return { text: 'Statut inconnu', color: 'text-gray-600 bg-gray-50' };
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            data-testid="back-button"
            className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Scanner d'aliments</h1>
        </div>

        <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setActiveTab('barcode')}
              data-testid="barcode-tab"
              className={`flex-1 rounded-full py-2 font-semibold ${activeTab === 'barcode' ? 'bg-gradient-to-r from-sky-400 to-sky-300 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <ScanBarcode className="w-4 h-4 mr-2" />
              Code-barres
            </Button>
            <Button
              onClick={() => setActiveTab('search')}
              data-testid="search-tab"
              className={`flex-1 rounded-full py-2 font-semibold ${activeTab === 'search' ? 'bg-gradient-to-r from-pink-400 to-pink-300 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <Search className="w-4 h-4 mr-2" />
              Recherche
            </Button>
          </div>

          {activeTab === 'barcode' && (
            <form onSubmit={handleScanBarcode} className="space-y-4">
              <Input
                data-testid="barcode-input"
                type="text"
                placeholder="Entrez le code-barres"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full rounded-2xl border-slate-200 bg-white px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
              <Button
                type="submit"
                data-testid="scan-button"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-sky-200/50 hover:-translate-y-0.5"
              >
                {loading ? 'Scan en cours...' : 'Scanner'}
              </Button>
            </form>
          )}

          {activeTab === 'search' && (
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Rechercher un aliment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border-slate-200 bg-white px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
              <Button
                type="submit"
                data-testid="search-button"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-400 to-pink-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5"
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </form>
          )}
        </Card>

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
              </div>
            </div>
          </Card>
        )}

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
      </div>
    </div>
  );
}

export default FoodScanner;
