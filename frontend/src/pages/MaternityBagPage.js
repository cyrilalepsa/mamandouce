import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, CheckSquare, Square, Plus, Send, Briefcase, Baby, Car, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export default function MaternityBagPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Pour maman');
  const [expandedCategories, setExpandedCategories] = useState({
    'Pour maman': false,
    'Pour bébé': false,
    'Pour le retour': false
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await api.postpartum.getMaternityBag();
      setItems(response.data.items || []);
      setCustomItems(response.data.custom_items || []);
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

  const submitSuggestion = async () => {
    if (!newItem.trim()) {
      toast.error('Veuillez entrer un article');
      return;
    }

    try {
      await api.postpartum.suggestMaternityItem(newCategory, newItem);
      toast.success('Suggestion envoyée pour validation');
      setShowSuggestion(false);
      setNewItem('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
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
            onClick={() => navigate('/')}
            className="bg-white rounded-full p-2 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Sac de maternité
            </h1>
            <p className="text-sm text-slate-500">Préparez votre valise pour le jour J</p>
          </div>
        </div>

        {/* Progress */}
        <Card className="bg-gradient-to-r from-pink-100 to-sky-100 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-slate-700">Progression</span>
            <span className="text-2xl font-bold text-pink-600">{getProgress()}%</span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-pink-400 to-sky-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {items.filter(i => i.checked).length + customItems.filter(i => i.checked).length} / {items.length + customItems.length} articles préparés
          </p>
        </Card>

        {/* Grouped Items with Collapsible Sections */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const style = getCategoryStyle(category);
          const isExpanded = expandedCategories[category] ?? true;
          const checkedCount = categoryItems.filter(i => i.checked).length;
          
          return (
            <Card key={category} className="bg-white rounded-3xl shadow-sm overflow-hidden">
              {/* Collapsible Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
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
                    <button
                      key={`${item.isCustom ? 'custom' : 'default'}-${item.index}`}
                      onClick={() => toggleItem(item.index, !item.checked, item.isCustom)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        item.checked 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.checked ? (
                        <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />
                      )}
                      <span className={`text-left ${item.checked ? 'line-through opacity-70' : ''}`}>
                        {item.item}
                      </span>
                      {item.added_by && (
                        <span className="ml-auto text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                          Ajouté
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
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
