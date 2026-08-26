import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Heart, ChevronDown, ChevronUp, ExternalLink, Plus, Share2, ArrowLeft, Send, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getStoresForLanguage } from '../data/storesByCountry';
import api from '../utils/api';
import { toast } from 'sonner';
import { exportBirthListToPDF } from './birthlist/birthListPdf';
import { AccordionCard, ListItemCard } from '../components/ui/SoftClayCards';

// Couleurs cycle J→B→R→V→Vi (legacy — accents canoniques)

// Liste de référence exhaustive par catégories
const REFERENCE_LIST = [
  {
    category: 'Sommeil',
    icon: '🛏️',
    items: [
      { id: 'lit-bebe', name: 'Lit bébé / Berceau', essential: true },
      { id: 'matelas', name: 'Matelas ferme', essential: true },
      { id: 'gigoteuse', name: 'Gigoteuse (x2)', essential: true },
      { id: 'drap-housse', name: 'Draps-housse (x3)', essential: true },
      { id: 'veilleuse', name: 'Veilleuse', essential: false },
      { id: 'mobile', name: 'Mobile musical', essential: false },
      { id: 'babyphone', name: 'Babyphone / Écoute-bébé', essential: true },
      { id: 'cale-bebe', name: 'Cale-bébé / Coussin de positionnement', essential: false },
    ]
  },
  {
    category: 'Repas & Allaitement',
    icon: '🍼',
    items: [
      { id: 'biberons', name: 'Biberons (x4-6)', essential: true },
      { id: 'tetines', name: 'Tétines adaptées', essential: true },
      { id: 'sterilisateur', name: 'Stérilisateur', essential: true },
      { id: 'goupillon', name: 'Goupillon', essential: true },
      { id: 'coussin-allait', name: 'Coussin d\'allaitement', essential: false },
      { id: 'tire-lait', name: 'Tire-lait', essential: false },
      { id: 'bavoirs', name: 'Bavoirs (x6)', essential: true },
      { id: 'chauffe-biberon', name: 'Chauffe-biberon', essential: false },
    ]
  },
  {
    category: 'Toilette & Change',
    icon: '🛁',
    items: [
      { id: 'baignoire', name: 'Baignoire bébé', essential: true },
      { id: 'thermometre-bain', name: 'Thermomètre de bain', essential: true },
      { id: 'serviettes', name: 'Serviettes / Capes de bain (x2)', essential: true },
      { id: 'couches', name: 'Couches (paquet premier âge)', essential: true },
      { id: 'lingettes', name: 'Lingettes / Coton', essential: true },
      { id: 'liniment', name: 'Liniment / Crème de change', essential: true },
      { id: 'table-langer', name: 'Table / Matelas à langer', essential: true },
      { id: 'serum-phy', name: 'Sérum physiologique', essential: true },
      { id: 'coupe-ongles', name: 'Ciseaux / Coupe-ongles bébé', essential: false },
      { id: 'mouche-bebe', name: 'Mouche-bébé', essential: true },
    ]
  },
  {
    category: 'Promenade & Transport',
    icon: '🚗',
    items: [
      { id: 'poussette', name: 'Poussette', essential: true },
      { id: 'cosy', name: 'Cosy / Siège-auto groupe 0', essential: true },
      { id: 'porte-bebe', name: 'Porte-bébé / Écharpe', essential: false },
      { id: 'sac-langer', name: 'Sac à langer', essential: true },
      { id: 'habillage-pluie', name: 'Habillage pluie poussette', essential: false },
      { id: 'pare-soleil', name: 'Pare-soleil voiture', essential: false },
      { id: 'nacelle', name: 'Nacelle / Landau', essential: false },
    ]
  },
  {
    category: 'Vêtements',
    icon: '👶',
    items: [
      { id: 'body', name: 'Bodies (x7-10)', essential: true },
      { id: 'pyjamas', name: 'Pyjamas (x5-7)', essential: true },
      { id: 'bonnets', name: 'Bonnets (x2)', essential: true },
      { id: 'chaussettes', name: 'Chaussettes / Chaussons (x5)', essential: true },
      { id: 'brassiere', name: 'Brassières / Gilets (x3)', essential: true },
      { id: 'manteau', name: 'Combinaison / Manteau', essential: false },
      { id: 'moufles', name: 'Moufles', essential: false },
    ]
  },
  {
    category: 'Santé & Sécurité',
    icon: '🩺',
    items: [
      { id: 'thermometre', name: 'Thermomètre digital', essential: true },
      { id: 'carnet-sante', name: 'Protège carnet de santé', essential: false },
      { id: 'trousse-soin', name: 'Trousse de soin (ciseaux, brosse...)', essential: true },
      { id: 'doliprane', name: 'Doliprane (sur avis médical)', essential: false },
      { id: 'tour-lit', name: 'Barrière de lit (plus tard)', essential: false },
    ]
  },
  {
    category: 'Éveil & Jeux',
    icon: '🧸',
    items: [
      { id: 'tapis-eveil', name: 'Tapis d\'éveil', essential: false },
      { id: 'doudou', name: 'Doudou (x2 identiques)', essential: true },
      { id: 'hochet', name: 'Hochets', essential: false },
      { id: 'livre-tissu', name: 'Livres en tissu', essential: false },
      { id: 'transat', name: 'Transat / Balancelle', essential: false },
      { id: 'arche-jeux', name: 'Arche de jeux', essential: false },
    ]
  },
];

// Magasins disponibles
const STORES = [
  { name: 'Amazon', url: 'https://www.amazon.fr/b?node=206617031', icon: '🛒' },
  { name: 'Vertbaudet', url: 'https://www.vertbaudet.fr', icon: '🌿' },
  { name: 'Aubert', url: 'https://www.aubert.com', icon: '🍼' },
  { name: 'Kiabi', url: 'https://www.kiabi.com/bebe_50002', icon: '👶' },
  { name: 'Orchestra', url: 'https://fr.shop-orchestra.com', icon: '🎵' },
  { name: 'La Redoute', url: 'https://www.laredoute.fr/lndnav/Bebe/cat-559.aspx', icon: '🏠' },
  { name: 'Cdiscount', url: 'https://www.cdiscount.com/pret-a-porter/bebe-puericulture/r-liste+de+naissance.html', icon: '💰' },
];

function BirthListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('reference'); // 'reference' | 'mylist'
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('mamandouce_birthlist_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showStorePopup, setShowStorePopup] = useState(null); // item id
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '' });

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('mamandouce_birthlist_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSubmitItem = async () => {
    if (!newItem.name.trim() || !newItem.category.trim()) {
      toast.error('Remplissez tous les champs');
      return;
    }
    try {
      await api.contributions.submit({
        contribution_type: 'birth_list_item',
        title: newItem.name,
        description: `Catégorie : ${newItem.category}`,
        data: { name: newItem.name, category: newItem.category }
      });
      toast.success('Article soumis ! Il sera visible après validation.');
      setNewItem({ name: '', category: '' });
      setShowSubmitForm(false);
    } catch {
      toast.error('Erreur lors de la soumission');
    }
  };

  // Get favorited items grouped by category
  const myListItems = REFERENCE_LIST.map(cat => ({
    ...cat,
    items: cat.items.filter(item => favorites.includes(item.id))
  })).filter(cat => cat.items.length > 0);

  const renderItemList = (categories, showAllItems = true) => (
    <div className="space-y-3">
      {categories.map((cat, catIndex) => {
        const isExpanded = expandedCategories[cat.category] !== false;
        const items = showAllItems ? cat.items : cat.items;

        return (
          <AccordionCard
            key={cat.category}
            index={catIndex}
            title={cat.category}
            icon={cat.icon}
            open={isExpanded}
            onToggle={() => toggleCategory(cat.category)}
            className="!mb-0"
          >
            <div className="space-y-1.5">
              {items.map((item, itemIndex) => (
                <ListItemCard key={item.id} index={itemIndex} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="p-1 flex-shrink-0"
                    data-testid={`fav-${item.id}`}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        favorites.includes(item.id) ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-300'
                      }`}
                      style={{ stroke: favorites.includes(item.id) ? '#ef4444' : '#cbd5e1' }}
                    />
                  </button>
                  <span className="flex-1 text-sm text-slate-800 font-medium">{item.name}</span>
                  {item.essential && (
                    <span className="text-[10px] bg-pink-200/60 text-pink-700 px-1.5 py-0.5 rounded-full font-semibold">
                      Essentiel
                    </span>
                  )}
                  <button
                    onClick={() => setShowStorePopup(item.id)}
                    className="p-1 flex-shrink-0"
                    data-testid={`shop-${item.id}`}
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </button>
                </ListItemCard>
              ))}
            </div>
          </AccordionCard>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header texte brut */}
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-2 rounded-full hover:bg-white/50">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-black">Liste de naissance</h1>
            <p className="text-sm text-slate-500">{favorites.length} articles sélectionnés</p>
          </div>
          <Button onClick={() => { /* share */ toast.success('Lien copié !'); }} variant="ghost" className="p-2">
            <Share2 className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        {/* 2 onglets : Référence / Ma Liste */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'reference', label: 'Liste de Référence', icon: '📋' },
            { id: 'mylist', label: 'Ma Liste', icon: '❤️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all"
              style={{
                background: activeTab === tab.id 
                  ? 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)'
                  : 'linear-gradient(160deg, #ffffff 0%, #fefefe 30%, #fafafa 100%)',
                color: activeTab === tab.id ? '#ffffff' : '#000000',
                boxShadow: activeTab === tab.id
                  ? '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)'
                  : '0 4px 12px -4px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(0,0,0,0.02), inset 2px 2px 6px rgba(255,255,255,0.9)',
                border: activeTab === tab.id ? '1px solid rgba(254,205,211,0.6)' : '1px solid rgba(255,255,255,0.9)',
              }}
              data-testid={`tab-${tab.id}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu onglet Référence */}
        {activeTab === 'reference' && (
          <div>
            {renderItemList(REFERENCE_LIST)}
            
            {/* Bouton proposer un article */}
            <button
              onClick={() => setShowSubmitForm(true)}
              className="w-full mt-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
              style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #fefefe 30%, #fafafa 100%)',
                boxShadow: '0 4px 12px -4px rgba(0,0,0,0.06)',
                border: '1px solid rgba(255,255,255,0.9)',
                color: '#000000',
              }}
              data-testid="submit-item-btn"
            >
              <Plus className="w-4 h-4" /> Proposer un article
            </button>
          </div>
        )}

        {/* Contenu onglet Ma Liste */}
        {activeTab === 'mylist' && (
          <div>
            {myListItems.length > 0 ? (
              <>
                {/* Bouton Export PDF — catalogue partageable */}
                <button
                  onClick={() => {
                    try {
                      exportBirthListToPDF(myListItems);
                      toast.success('PDF généré !');
                    } catch {
                      toast.error('Erreur génération PDF');
                    }
                  }}
                  className="w-full mb-3 btn-rose-bonbon rounded-2xl py-2.5 flex items-center justify-center gap-2 text-sm font-semibold"
                  data-testid="export-pdf-birthlist-btn"
                >
                  <Download className="w-4 h-4" /> Télécharger en PDF (catalogue)
                </button>
                {renderItemList(myListItems)}
              </>
            ) : (
              <div className="text-center py-12" style={{
                background: 'linear-gradient(160deg, #fff 0%, #fefefe 30%, #fafafa 100%)',
                borderRadius: '20px',
                boxShadow: '0 4px 16px -4px rgba(0,0,0,0.06)',
              }}>
                <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-600 mb-2">Votre liste est vide</p>
                <p className="text-sm text-slate-400 mb-4">Allez dans la Liste de Référence et appuyez sur les coeurs pour sélectionner vos articles</p>
                <button
                  onClick={() => setActiveTab('reference')}
                  className="px-6 py-2 rounded-full text-white font-semibold text-sm"
                  style={{
                    background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
                    boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3)',
                  }}
                >
                  Voir la référence
                </button>
              </div>
            )}
          </div>
        )}

        {/* Popup magasins */}
        {showStorePopup && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="card-glass-modal rounded-2xl p-5 w-full max-w-sm" data-testid="store-popup">
              <h3 className="font-bold text-black mb-3">Où acheter ?</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {STORES.map((store) => (
                  <a
                    key={store.name}
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-slate-50"
                    style={{
                      background: 'linear-gradient(160deg, #fff 0%, #fefefe 30%, #fafafa 100%)',
                      border: '1px solid rgba(240,240,242,0.6)',
                    }}
                  >
                    <span className="text-xl">{store.icon}</span>
                    <span className="flex-1 font-medium text-black text-sm">{store.name}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                ))}
              </div>
              <button
                onClick={() => setShowStorePopup(null)}
                className="w-full mt-3 py-2.5 rounded-xl text-white font-semibold"
                style={{
                  background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
                  boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3)',
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Formulaire soumettre un article */}
        {showSubmitForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="card-glass-modal rounded-2xl p-5 w-full max-w-sm">
              <h3 className="font-bold text-black mb-3">Proposer un article</h3>
              <p className="text-xs text-slate-500 mb-3">Après validation par l'admin, l'article apparaîtra dans la liste de référence (+1 contribution)</p>
              <div className="space-y-3">
                <Input
                  placeholder="Nom de l'article"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  style={{ background: '#ffffff', color: '#000000', border: '1px solid #e2e8f0' }}
                  className="rounded-xl"
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5"
                  style={{ background: '#ffffff', color: '#000000', border: '1px solid #e2e8f0' }}
                >
                  <option value="">Choisir une catégorie</option>
                  {REFERENCE_LIST.map(cat => <option key={cat.category} value={cat.category}>{cat.icon} {cat.category}</option>)}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSubmitForm(false)}
                    className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                    style={{
                      background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
                      boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3)',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmitItem}
                    className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1"
                    style={{
                      background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
                      boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)',
                    }}
                  >
                    <Send className="w-4 h-4" /> Soumettre
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BirthListPage;
