import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, CheckSquare, Square, Plus, Send, Briefcase, Baby, Car } from 'lucide-react';
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

        {/* Grouped Items */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <Card key={category} className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              {getCategoryIcon(category)}
              <h2 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {category}
              </h2>
              <span className="text-sm text-slate-400">
                ({categoryItems.filter(i => i.checked).length}/{categoryItems.length})
              </span>
            </div>
            
            <div className="space-y-2">
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
          </Card>
        ))}

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
