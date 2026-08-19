import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, CheckSquare, Square, Plus, Send, Briefcase, Baby, Car, ChevronDown, ChevronUp, Heart, Crown, Lock, FileText, Clock, AlertCircle, Globe } from 'lucide-react';
import { useSubscription } from '../components/SubscriptionGate';
import { useAuth } from '../contexts/AuthContext';
import { getMaternityBagForLanguage } from '../data/maternityBagByCountry';
import api from '../utils/api';
import { toast } from 'sonner';

// Style glossy 3D nuage
const glossyStyle = (color) => {
  const colors = {
    pink: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(252,231,243,0.9) 45%, rgba(251,207,232,0.75) 70%, rgba(249,168,212,0.55) 100%)',
      shadow: '0 10px 28px -6px rgba(244,114,182,0.25), 0 6px 12px -4px rgba(244,114,182,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(244,114,182,0.1)',
      border: '2px solid rgba(244,114,182,0.25)'
    },
    blue: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(224,242,254,0.9) 45%, rgba(186,230,253,0.75) 70%, rgba(125,211,252,0.55) 100%)',
      shadow: '0 10px 28px -6px rgba(56,189,248,0.25), 0 6px 12px -4px rgba(56,189,248,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(56,189,248,0.1)',
      border: '2px solid rgba(125,211,252,0.3)'
    },
    green: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(220,252,231,0.9) 45%, rgba(187,247,208,0.75) 70%, rgba(134,239,172,0.55) 100%)',
      shadow: '0 10px 28px -6px rgba(34,197,94,0.25), 0 6px 12px -4px rgba(34,197,94,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(34,197,94,0.1)',
      border: '2px solid rgba(134,239,172,0.3)'
    },
    amber: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(254,243,199,0.9) 45%, rgba(253,230,138,0.75) 70%, rgba(251,191,36,0.5) 100%)',
      shadow: '0 10px 28px -6px rgba(245,158,11,0.25), 0 6px 12px -4px rgba(245,158,11,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(245,158,11,0.1)',
      border: '2px solid rgba(251,191,36,0.3)'
    }
  };
  return colors[color] || colors.pink;
};

// Composant reflet glossy SUPPRIMÉ — Zéro voile blanc
const GlossyReflect = () => null;

export default function MaternityBagPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  const { isPremium: premiumFromGate, isAdmin, isVip } = useSubscription();
  const { isPremium: premiumFromAuth, isAdmin: authAdmin, isVip: authVip } = useAuth();
  const isPremium = Boolean(
    premiumFromGate || premiumFromAuth || isAdmin || authAdmin || isVip || authVip
  );
  
  // Données localisées
  const localData = useMemo(() => getMaternityBagForLanguage(currentLang), [currentLang]);
  
  const [items, setItems] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showLocalInfo, setShowLocalInfo] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Pour maman');
  const [expandedCategories, setExpandedCategories] = useState({
    'Pour maman': false,
    'Pour bébé': false,
    'Pour le retour': false
  });

  useEffect(() => {
    loadItemsIfUnlocked();
  }, [isPremium]);

  const loadItemsIfUnlocked = async () => {
    if (!isPremium) {
      setLoading(false);
      return;
    }
    try {
      const [bagResponse, favResponse] = await Promise.all([
        api.postpartum.getMaternityBag(),
        api.postpartum.getMaternityBagFavorites()
      ]);
      setItems(bagResponse.data.items || []);
      setCustomItems(bagResponse.data.custom_items || []);
      setFavorites(favResponse.data.favorites || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si pas premium, afficher page de blocage
  if (!isPremium) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.back')}
          </button>
          
          <Card className="bg-white rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-purple-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t('premium.premiumFeature', 'Fonctionnalité Premium')}
            </h1>
            <p className="text-slate-500 mb-6">
              {t('maternityBag.premiumRequired', 'La check-list du sac de maternité est réservée aux abonnées Premium.')}
            </p>
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8 py-3 text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Crown className="w-5 h-5 mr-2" />
              {t('premium.discoverPremium', 'Découvrir Premium')}
            </Button>
            <p className="text-sm text-slate-400 mt-4">
              {t('premium.priceInfo', 'Seulement 3€/mois • Annulation à tout moment')}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const loadItems = async () => {
    try {
      const [bagResponse, favResponse] = await Promise.all([
        api.postpartum.getMaternityBag(),
        api.postpartum.getMaternityBagFavorites()
      ]);
      setItems(bagResponse.data.items || []);
      setCustomItems(bagResponse.data.custom_items || []);
      setFavorites(favResponse.data.favorites || []);
    } catch (error) {
      console.error('Erreur chargement liste:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (index, checked, isCustom = false) => {
    try {
      await api.postpartum.toggleMaternityItem(index, checked, isCustom);
      
      if (isCustom) {
        const updated = [...customItems];
        updated[index].checked = checked;
        setCustomItems(updated);
      } else {
        const updated = [...items];
        updated[index].checked = checked;
        setItems(updated);
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const toggleFavorite = async (e, itemName) => {
    e.stopPropagation();
    try {
      const response = await api.postpartum.toggleMaternityBagFavorite(itemName);
      if (response.data.is_favorite) {
        setFavorites([...favorites, itemName]);
        toast.success(t('scanner.addedToFavorites'));
      } else {
        setFavorites(favorites.filter(f => f !== itemName));
        toast.success(t('scanner.removedFromFavorites'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const isFavorite = (itemName) => favorites.includes(itemName);

  const submitSuggestion = async () => {
    if (!newItem.trim()) {
      toast.error(t('maternityBag.enterItem', 'Veuillez entrer un article'));
      return;
    }

    try {
      await api.postpartum.suggestMaternityItem(newCategory, newItem);
      toast.success(t('maternityBag.suggestionSent', 'Suggestion envoyée pour validation'));
      setShowSuggestion(false);
      setNewItem('');
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const getProgress = () => {
    const allItems = [...items, ...customItems];
    const checked = allItems.filter(i => i.checked).length;
    return Math.round((checked / allItems.length) * 100) || 0;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Pour maman':
        return <Briefcase className="w-5 h-5 text-pink-500" />;
      case 'Pour bébé':
        return <Baby className="w-5 h-5 text-sky-500" />;
      case 'Pour le retour':
        return <Car className="w-5 h-5 text-green-500" />;
      default:
        return <CheckSquare className="w-5 h-5 text-slate-500" />;
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Pour maman':
        return { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' };
      case 'Pour bébé':
        return { bg: 'bg-sky-100', text: 'text-sky-600', border: 'border-sky-200' };
      case 'Pour le retour':
        return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    }
  };

  // Traduction des catégories
  const translateCategory = (category) => {
    const translations = {
      'Pour maman': t('maternityBag.forMom', 'Pour maman'),
      'Pour bébé': t('maternityBag.forBaby', 'Pour bébé'),
      'Pour le retour': t('maternityBag.forReturn', 'Pour le retour'),
      'Ajoutés': t('maternityBag.added', 'Ajoutés'),
      'Autres': t('library.other', 'Autres')
    };
    return translations[category] || category;
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const groupedItems = items.reduce((acc, item, index) => {
    const cat = item.category || 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...item, index, isCustom: false });
    return acc;
  }, {});

  // Ajouter les items personnalisés
  customItems.forEach((item, index) => {
    const cat = item.category || 'Ajoutés';
    if (!groupedItems[cat]) groupedItems[cat] = [];
    groupedItems[cat].push({ ...item, index, isCustom: true });
  });

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            className="bg-white rounded-full p-2 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t('babyPrep.maternityBag', 'Sac de maternité')}
            </h1>
            <p className="text-sm text-slate-500">{t('babyPrep.interactiveChecklist', 'Préparez votre valise pour le jour J')}</p>
          </div>
        </div>

        {/* Informations localisées */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
          <button 
            onClick={() => setShowLocalInfo(!showLocalInfo)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-700">{localData.flag} {localData.country}</h3>
                <p className="text-xs text-slate-500">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {t('calculator.daysUnit', 'Séjour')}: {localData.hospitalStay.duration}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showLocalInfo ? 'rotate-180' : ''}`} />
          </button>
          
          {showLocalInfo && (
            <div className="mt-4 space-y-4">
              {/* Documents requis */}
              <div>
                <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Documents
                </h4>
                <div className="space-y-1">
                  {localData.documents.map((doc, idx) => (
                    <div key={idx} className={`text-sm flex items-center gap-2 ${doc.required ? 'text-slate-700' : 'text-slate-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${doc.required ? 'bg-red-400' : 'bg-slate-300'}`}></span>
                      <span className="font-medium">{doc.name}</span>
                      {doc.required && <span className="text-xs text-red-500">*</span>}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Durée de séjour */}
              <div className="bg-white/50 rounded-xl p-3">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  {t('calculator.daysRemaining', 'Durée de séjour')}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <span className="text-green-700 font-medium">{localData.hospitalStay.durationNatural}</span>
                    <p className="text-xs text-green-600">Voie basse</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <span className="text-purple-700 font-medium">{localData.hospitalStay.durationCesarean}</span>
                    <p className="text-xs text-purple-600">Césarienne</p>
                  </div>
                </div>
              </div>
              
              {/* Conseils locaux */}
              <div>
                <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  {t('scanner.recommendation', 'Conseils')}
                </h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  {localData.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Marques locales */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-pink-50 rounded-lg p-2">
                  <p className="text-xs font-medium text-pink-700 mb-1">🧷 {t('library.other', 'Couches')}</p>
                  <p className="text-xs text-pink-600">{localData.brands.diapers.slice(0, 3).join(', ')}</p>
                </div>
                <div className="bg-sky-50 rounded-lg p-2">
                  <p className="text-xs font-medium text-sky-700 mb-1">🧴 {t('scanner.ingredients', 'Soins')}</p>
                  <p className="text-xs text-sky-600">{localData.brands.care.slice(0, 3).join(', ')}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Progress - Effet glossy */}
        <div 
          className="relative overflow-hidden rounded-3xl p-5"
          style={{
            background: glossyStyle('pink').bg,
            boxShadow: glossyStyle('pink').shadow,
            border: glossyStyle('pink').border
          }}
        >
          <GlossyReflect />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-slate-700">{t('maternityBag.progress', 'Progression')}</span>
              <span className="text-2xl font-bold text-pink-600">{getProgress()}%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-pink-400 to-sky-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {items.filter(i => i.checked).length + customItems.filter(i => i.checked).length} / {items.length + customItems.length} {t('maternityBag.itemsPrepared', 'articles préparés')}
            </p>
          </div>
        </div>

        {/* My Favorites Section */}
        {favorites.length > 0 && (
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl shadow-sm overflow-hidden border border-red-100">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {t('maternityBag.myEssentials', 'Mes essentiels')}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {favorites.length} {t('maternityBag.favoriteItems', 'articles favoris')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {[...items, ...customItems]
                  .filter(item => favorites.includes(item.item))
                  .map((item, idx) => {
                    const originalIndex = items.findIndex(i => i.item === item.item);
                    const isCustom = originalIndex === -1;
                    const actualIndex = isCustom 
                      ? customItems.findIndex(i => i.item === item.item)
                      : originalIndex;
                    
                    return (
                      <div
                        key={`fav-${idx}`}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          item.checked 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-white text-slate-700'
                        }`}
                      >
                        <button
                          onClick={() => toggleItem(actualIndex, !item.checked, isCustom)}
                          className="flex items-center gap-3 flex-1 text-left"
                          data-testid={`fav-toggle-${idx}`}
                        >
                          {item.checked ? (
                            <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />
                          )}
                          <span className={`${item.checked ? 'line-through opacity-70' : ''}`}>
                            {item.item}
                          </span>
                        </button>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <button
                          onClick={(e) => toggleFavorite(e, item.item)}
                          className="p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-all"
                          data-testid={`fav-remove-${idx}`}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </Card>
        )}

        {/* Grouped Items with Collapsible Sections - Effet glossy */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const style = getCategoryStyle(category);
          const isExpanded = expandedCategories[category] ?? false;
          const checkedCount = categoryItems.filter(i => i.checked).length;
          const glossyColor = category === 'Pour maman' ? 'pink' : category === 'Pour bébé' ? 'blue' : 'green';
          
          return (
            <div 
              key={category} 
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: glossyStyle(glossyColor).bg,
                boxShadow: glossyStyle(glossyColor).shadow,
                border: glossyStyle(glossyColor).border
              }}
            >
              <GlossyReflect />
              {/* Collapsible Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="relative w-full p-4 flex items-center gap-3 hover:bg-white/20 transition-colors"
                data-testid={`toggle-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-10 h-10 ${style.bg} rounded-xl flex items-center justify-center`}>
                  {getCategoryIcon(category)}
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {category}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {checkedCount}/{categoryItems.length} articles préparés
                  </p>
                </div>
                {/* Progress circle */}
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke={category === 'Pour maman' ? '#ec4899' : category === 'Pour bébé' ? '#0ea5e9' : '#22c55e'}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(checkedCount / categoryItems.length) * 125.6} 125.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-600">
                    {Math.round((checkedCount / categoryItems.length) * 100)}%
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isExpanded ? `${style.bg} ${style.text}` : 'bg-slate-100 text-slate-400'
                }`}>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              
              {/* Collapsible Content */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                  {categoryItems.map((item) => (
                    <div
                      key={`${item.isCustom ? 'custom' : 'default'}-${item.index}`}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        item.checked 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item.index, !item.checked, item.isCustom)}
                        className="flex items-center gap-3 flex-1 text-left"
                        data-testid={`toggle-item-${item.index}`}
                      >
                        {item.checked ? (
                          <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />
                        )}
                        <span className={`${item.checked ? 'line-through opacity-70' : ''}`}>
                          {item.item}
                        </span>
                      </button>
                      {item.added_by && (
                        <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                          Ajouté
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleFavorite(e, item.item)}
                        className={`p-1.5 rounded-full transition-all ${
                          isFavorite(item.item)
                            ? 'bg-red-100 text-red-500'
                            : 'bg-slate-100 text-slate-400 hover:text-red-400 hover:bg-red-50'
                        }`}
                        data-testid={`favorite-item-${item.index}`}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(item.item) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Bouton fermer en bas */}
                  <button
                    onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: false }))}
                    className={`w-full mt-3 p-3 rounded-xl ${style.bg} hover:opacity-80 flex items-center justify-center gap-2 transition-all duration-200 ${style.text}`}
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">Fermer</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Suggestion */}
        {showSuggestion ? (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Suggérer un article</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Catégorie</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2"
                >
                  <option value="Pour maman">Pour maman</option>
                  <option value="Pour bébé">Pour bébé</option>
                  <option value="Pour le retour">Pour le retour</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Article</label>
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Ex: Coussin d'allaitement"
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={submitSuggestion}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-2"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
                <Button
                  onClick={() => setShowSuggestion(false)}
                  className="bg-slate-200 text-slate-700 rounded-full py-2 px-4"
                >
                  Annuler
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Votre suggestion sera envoyée pour validation avant d'être ajoutée.
            </p>
          </Card>
        ) : (
          <Button
            onClick={() => setShowSuggestion(true)}
            className="w-full bg-white border-2 border-dashed border-slate-300 text-slate-600 rounded-2xl py-4 hover:border-pink-400 hover:text-pink-500 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Suggérer un article
          </Button>
        )}
      </div>
    </div>
  );
}
