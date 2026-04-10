import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, ChevronDown, Heart, Plus, BookOpen, Loader2, Camera, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { FoodScannerAI } from '../components/food';
import { useTheme } from '../contexts/ThemeContext';

function FoodLibraryPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [showScanner, setShowScanner] = useState(false);
  
  // Langue actuelle
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  
  // Traduction automatique des aliments
  const { translated: translatedFoods, isLoading: isTranslating } = useAutoTranslate(
    foods,
    {
      fields: ['name', 'description', 'advice', 'category'],
      enabled: currentLang !== 'fr' && foods.length > 0
    }
  );
  
  // Utiliser les aliments traduits ou originaux
  const displayFoods = currentLang !== 'fr' && translatedFoods ? translatedFoods : foods;

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    loadFoods();
  }, [searchQuery, selectedCategory, selectedStatus, page]);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('page', page.toString());
      params.append('limit', '30');

      const response = await api.foodLibrary.getAll(params.toString());
      setFoods(response.data.foods || []);
      setTotalPages(response.data.pages || 1);
      setTotal(response.data.total || 0);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Erreur chargement bibliothèque:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

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
          status: food.safe_for_pregnancy || 'unknown',
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

  const getSafetyIcon = (status) => {
    switch (status) {
      case 'safe':
        return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'caution':
        return <ShieldAlert className="w-4 h-4 text-yellow-500" />;
      case 'avoid':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'unsafe':
        return <ShieldX className="w-4 h-4 text-red-500" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSafetyBadge = (status) => {
    switch (status) {
      case 'safe':
        return { text: t('scanner.safe'), color: 'bg-green-100 text-green-700 border-green-200' };
      case 'caution':
        return { text: t('scanner.caution'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'avoid':
        return { text: t('scanner.avoid'), color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'unsafe':
        return { text: t('scanner.forbidden'), color: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { text: t('scanner.unknown'), color: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const statusOptions = [
    { value: '', label: t('library.showAll') },
    { value: 'safe', label: t('library.showAllowed') },
    { value: 'caution', label: t('library.showCaution') },
    { value: 'avoid', label: t('scanner.avoid') },
    { value: 'unsafe', label: t('library.showForbidden') }
  ];

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title={t('library.title')} />

        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-green-100 to-sky-100 rounded-3xl p-6 border-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {total} {t('library.foodsReferenced', 'aliments référencés')}
              </h2>
              <p className="text-slate-600">{t('library.sortedAlphabetically', 'Triés par ordre alphabétique')}</p>
            </div>
          </div>
        </Card>

        {/* Scanner IA Button */}
        <Card className={`${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-emerald-50 to-teal-50'} rounded-3xl p-5 border ${isDarkMode ? 'border-slate-700' : 'border-emerald-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`} style={isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {}}>
                  Scanner Alimentaire IA
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} style={isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {}}>
                  Photographiez pour connaître le verdict
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowScanner(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-6 py-5 font-semibold shadow-lg hover:shadow-xl transition-all"
              data-testid="open-ai-scanner-btn"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Scanner
            </Button>
          </div>
        </Card>

        {/* Scanner AI Modal */}
        <FoodScannerAI 
          isOpen={showScanner} 
          onClose={() => setShowScanner(false)} 
        />

        {/* Search and Filters */}
        <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder={t('library.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 rounded-2xl border-slate-200 focus:ring-sky-500"
                data-testid="food-search-input"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="relative flex-1 min-w-[150px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-600 appearance-none cursor-pointer focus:ring-2 focus:ring-sky-200"
                  data-testid="category-filter"
                >
                  <option value="">Toutes catégories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative flex-1 min-w-[150px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-600 appearance-none cursor-pointer focus:ring-2 focus:ring-sky-200"
                  data-testid="status-filter"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </form>
        </Card>

        {/* Add Food Button */}
        <Button
          onClick={() => navigate('/scanner', { state: { openAddModal: true } })}
          data-testid="add-food-button"
          className="w-full bg-gradient-to-r from-pink-400 to-pink-300 text-white rounded-2xl py-4 font-semibold shadow-lg hover:shadow-pink-200/50 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Proposer un aliment non répertorié
        </Button>

        {/* Foods List */}
        {loading ? (
          <Card className="bg-white rounded-3xl p-8 text-center">
            <p className="text-slate-500">{t('common.loading')}</p>
          </Card>
        ) : displayFoods.length === 0 ? (
          <Card className="bg-white rounded-3xl p-8 text-center" data-testid="empty-results">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t('common.noResults')}
            </h3>
            <p className="text-slate-500">{t('library.tryOtherTerms')}</p>
          </Card>
        ) : (
          <>
            {/* Indicateur de traduction */}
            {isTranslating && currentLang !== 'fr' && (
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('common.translating')}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayFoods.map((food, index) => {
                const badge = getSafetyBadge(food.safe_for_pregnancy);
                // Couleurs pastel selon le statut
                const pastelStyle = food.safe_for_pregnancy === 'yes' 
                  ? {
                      bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(220,252,231,0.95) 30%, rgba(187,247,208,0.85) 70%, rgba(134,239,172,0.75) 100%)',
                      shadow: '0 6px 16px -4px rgba(34,197,94,0.2), 0 3px 6px -2px rgba(34,197,94,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(34,197,94,0.08)',
                      iconBg: 'bg-green-100/60'
                    }
                  : food.safe_for_pregnancy === 'caution'
                    ? {
                        bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,243,199,0.95) 30%, rgba(253,230,138,0.85) 70%, rgba(252,211,77,0.75) 100%)',
                        shadow: '0 6px 16px -4px rgba(245,158,11,0.2), 0 3px 6px -2px rgba(245,158,11,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(245,158,11,0.08)',
                        iconBg: 'bg-amber-100/60'
                      }
                    : {
                        bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,226,226,0.95) 30%, rgba(254,202,202,0.85) 70%, rgba(252,165,165,0.75) 100%)',
                        shadow: '0 6px 16px -4px rgba(239,68,68,0.2), 0 3px 6px -2px rgba(239,68,68,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(239,68,68,0.08)',
                        iconBg: 'bg-red-100/60'
                      };
                return (
                  <div
                    key={index}
                    className="rounded-2xl p-3.5 relative overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: pastelStyle.bg,
                      boxShadow: pastelStyle.shadow
                    }}
                    data-testid={`food-item-${index}`}
                  >
                    {/* Effet de reflet bombé glossy */}
                    <div 
                      className="absolute top-0 left-2 right-2 h-2/5 rounded-t-2xl pointer-events-none"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
                    />
                    
                    <div className="relative flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pastelStyle.iconBg} backdrop-blur-sm flex-shrink-0`}
                        style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
                      >
                        {getSafetyIcon(food.safe_for_pregnancy)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-700 truncate">{food.name}</h4>
                            <p className="text-xs text-slate-500">{food.category}</p>
                          </div>
                          <button
                            onClick={() => toggleFavorite(foods[index])}
                            className="p-1.5 rounded-full hover:bg-pink-100/60 transition-colors flex-shrink-0 backdrop-blur-sm"
                            data-testid={`favorite-${index}`}
                          >
                            <Heart
                              className={`w-5 h-5 ${favorites.has(foods[index]?.name) ? 'fill-pink-500 text-pink-500' : 'text-slate-300'}`}
                            />
                          </button>
                        </div>
                        <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-white/60 backdrop-blur-sm ${badge.color.includes('text') ? badge.color.split(' ').find(c => c.startsWith('text-')) : 'text-slate-600'}`}>
                          {getSafetyIcon(food.safe_for_pregnancy)}
                          {badge.text}
                        </span>
                        {food.reason && (
                          <p className="mt-2 text-xs text-slate-600 line-clamp-2">{food.reason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-white text-slate-600 border border-slate-200 rounded-xl px-4 py-2 disabled:opacity-50"
              data-testid="prev-page"
            >
              Précédent
            </Button>
            <span className="text-slate-600 px-4">
              Page {page} / {totalPages}
            </span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-white text-slate-600 border border-slate-200 rounded-xl px-4 py-2 disabled:opacity-50"
              data-testid="next-page"
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FoodLibraryPage;
