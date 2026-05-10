import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Check, Play, ExternalLink, ChevronDown, ChevronUp, Heart, Share2, Copy, Link, Plus, Trash2, X, ChefHat } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { WithNewBadge } from '../NewBadge';

// Styles glossy 3D nuage
const glossyStyles = {
  pink: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(252,231,243,0.9) 45%, rgba(251,207,232,0.75) 70%, rgba(249,168,212,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(244,114,182,0.25), 0 6px 12px -4px rgba(244,114,182,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(244,114,182,0.1)',
    border: '2px solid rgba(244,114,182,0.25)'
  },
  orange: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(255,237,213,0.9) 45%, rgba(254,215,170,0.75) 70%, rgba(253,186,116,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(249,115,22,0.25), 0 6px 12px -4px rgba(249,115,22,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(249,115,22,0.1)',
    border: '2px solid rgba(253,186,116,0.3)'
  },
  green: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(220,252,231,0.9) 45%, rgba(187,247,208,0.75) 70%, rgba(134,239,172,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(34,197,94,0.25), 0 6px 12px -4px rgba(34,197,94,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(34,197,94,0.1)',
    border: '2px solid rgba(134,239,172,0.3)'
  },
  purple: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(243,232,255,0.9) 45%, rgba(233,213,255,0.75) 70%, rgba(216,180,254,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(168,85,247,0.25), 0 6px 12px -4px rgba(168,85,247,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(168,85,247,0.1)',
    border: '2px solid rgba(216,180,254,0.3)'
  },
  amber: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(254,243,199,0.9) 45%, rgba(253,230,138,0.75) 70%, rgba(251,191,36,0.5) 100%)',
    shadow: '0 10px 28px -6px rgba(245,158,11,0.25), 0 6px 12px -4px rgba(245,158,11,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(245,158,11,0.1)',
    border: '2px solid rgba(251,191,36,0.3)'
  },
  red: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(254,226,226,0.9) 45%, rgba(254,202,202,0.75) 70%, rgba(252,165,165,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(239,68,68,0.25), 0 6px 12px -4px rgba(239,68,68,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(239,68,68,0.1)',
    border: '2px solid rgba(252,165,165,0.3)'
  }
};

// Map catégories vers couleurs glossy
const categoryGlossyMap = {
  'Légumes': 'green',
  'Fruits': 'orange',
  'Viandes': 'red',
  'Poissons': 'purple',
  'Féculents': 'amber',
  'Desserts': 'pink',
  'Boissons': 'purple',
  'Autres': 'amber'
};

// Reflet glossy SUPPRIMÉ — Zéro voile blanc
const GlossyReflect = () => null;

export function RecipesSection({ babyRecipes, favorites = [], onFavoritesChange = () => {} }) {
  const [recipeFilter, setRecipeFilter] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Custom recipes state
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [customRecipes, setCustomRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    category: 'Légumes',
    age: '6 mois+',
    ingredients: [''],
    steps: [''],
    tips: '',
    video_url: ''
  });
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  
  // Single recipe share state
  const [showSingleShareModal, setShowSingleShareModal] = useState(false);
  const [singleShareLink, setSingleShareLink] = useState(null);
  const [sharingRecipe, setSharingRecipe] = useState(null);

  // Load custom recipes
  useEffect(() => {
    loadCustomRecipes();
  }, []);
  
  const loadCustomRecipes = async () => {
    try {
      const response = await api.postpartum.getMyRecipes();
      setCustomRecipes(response.data.recipes || []);
    } catch (error) {
      // Silently fail
    }
  };

  if (!babyRecipes) return null;

  const toggleFavorite = async (recipeName, e) => {
    e.stopPropagation();
    try {
      const response = await api.postpartum.toggleFavorite(recipeName);
      if (response.data.success) {
        onFavoritesChange(response.data.is_favorite 
          ? [...favorites, recipeName]
          : favorites.filter(f => f !== recipeName)
        );
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des favoris');
    }
  };

  const handleShareFavorites = async () => {
    if (favorites.length === 0) {
      toast.error('Ajoutez des recettes aux favoris avant de partager');
      return;
    }
    
    setIsSharing(true);
    try {
      const response = await api.postpartum.shareRecipes(favorites);
      if (response.data.success) {
        const link = `${window.location.origin}/recipes/shared/${response.data.share_code}`;
        setShareLink(link);
        setShowShareModal(true);
      }
    } catch (error) {
      toast.error('Erreur lors de la création du lien de partage');
    } finally {
      setIsSharing(false);
    }
  };
  
  // Partager une recette individuelle
  const handleShareSingleRecipe = async (recipe, e) => {
    if (e) e.stopPropagation();
    setSharingRecipe(recipe);
    
    try {
      const recipeId = recipe.id || recipe.name; // Custom recipes have id, standard have name
      const response = await api.postpartum.shareRecipe(recipeId);
      if (response.data.success) {
        const link = `${window.location.origin}/recipe/shared/${response.data.share_code}`;
        setSingleShareLink(link);
        setShowSingleShareModal(true);
      }
    } catch (error) {
      toast.error('Erreur lors du partage');
    }
  };

  const copyShareLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Lien copié dans le presse-papiers !');
    } catch (error) {
      toast.error('Impossible de copier le lien');
    }
  };

  const shareNative = async (link, title, text) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: link });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      copyShareLink(link);
    }
  };

  const isFavorite = (recipeName) => favorites.includes(recipeName);

  const toggleCategoryExpand = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Custom recipe handlers
  const handleAddIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };
  
  const handleRemoveIngredient = (index) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };
  
  const handleIngredientChange = (index, value) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };
  
  const handleAddStep = () => {
    setNewRecipe(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };
  
  const handleRemoveStep = (index) => {
    setNewRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };
  
  const handleStepChange = (index, value) => {
    setNewRecipe(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };
  
  const handleSaveRecipe = async () => {
    if (!newRecipe.name.trim()) {
      toast.error('Donnez un nom à votre recette');
      return;
    }
    
    const filteredIngredients = newRecipe.ingredients.filter(i => i.trim());
    const filteredSteps = newRecipe.steps.filter(s => s.trim());
    
    if (filteredIngredients.length === 0) {
      toast.error('Ajoutez au moins un ingrédient');
      return;
    }
    
    if (filteredSteps.length === 0) {
      toast.error('Ajoutez au moins une étape');
      return;
    }
    
    setIsSavingRecipe(true);
    try {
      const response = await api.postpartum.createRecipe({
        ...newRecipe,
        ingredients: filteredIngredients,
        steps: filteredSteps
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        setShowAddRecipeModal(false);
        setNewRecipe({
          name: '',
          category: 'Légumes',
          age: '6 mois+',
          ingredients: [''],
          steps: [''],
          tips: '',
          video_url: ''
        });
        loadCustomRecipes();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setIsSavingRecipe(false);
    }
  };
  
  const handleDeleteRecipe = async (recipeId, e) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer cette recette ?')) return;
    
    try {
      await api.postpartum.deleteRecipe(recipeId);
      toast.success('Recette supprimée');
      loadCustomRecipes();
      if (selectedRecipe?.id === recipeId) {
        setSelectedRecipe(null);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Combine standard and custom recipes
  const getAllRecipes = () => {
    const standardRecipes = babyRecipes.recipes || [];
    return [...standardRecipes, ...customRecipes];
  };

  // Filter recipes
  const getFilteredRecipes = () => {
    let recipes = getAllRecipes();
    
    if (recipeFilter === 'Favoris') {
      recipes = recipes.filter(r => favorites.includes(r.name));
    } else if (recipeFilter === 'Mes recettes') {
      recipes = customRecipes;
    } else if (recipeFilter) {
      recipes = recipes.filter(r => r.category === recipeFilter);
    }
    
    return recipes;
  };

  const filteredRecipes = getFilteredRecipes();
  const categories = [...new Set(filteredRecipes.map(r => r.category))].sort();

  // Category colors
  const categoryColors = {
    'Légumes': 'bg-green-100 text-green-700 border-green-200',
    'Fruits': 'bg-orange-100 text-orange-700 border-orange-200',
    'Viandes': 'bg-red-100 text-red-700 border-red-200',
    'Poissons': 'bg-sky-100 text-sky-700 border-sky-200',
    'Légumineuses': 'bg-amber-100 text-amber-700 border-amber-200',
    'Œufs': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Féculents': 'bg-purple-100 text-purple-700 border-purple-200',
    'Desserts': 'bg-pink-100 text-pink-700 border-pink-200'
  };

  const allFilters = ['Tous', 'Favoris', 'Mes recettes', 'Légumes', 'Fruits', 'Viandes', 'Poissons', 'Légumineuses', 'Œufs', 'Féculents', 'Desserts'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-700">{babyRecipes.title}</h2>
          <p className="text-sm text-slate-600">{babyRecipes.description}</p>
        </div>
        <div className="flex gap-2">
          {/* Bouton Ajouter une recette */}
          <WithNewBadge badgeId="recipe-add" position="top-right">
            <button
              onClick={() => setShowAddRecipeModal(true)}
              data-testid="add-recipe-btn"
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </WithNewBadge>
          {/* Bouton Partager favoris */}
          {favorites.length > 0 && (
            <WithNewBadge badgeId="recipe-share" position="top-right">
              <button
                onClick={handleShareFavorites}
                disabled={isSharing}
                data-testid="share-favorites-btn"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                {isSharing ? 'Création...' : 'Partager'}
              </button>
            </WithNewBadge>
          )}
        </div>
      </div>
      
      {/* Modal de partage favoris */}
      {showShareModal && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              Partager mes favoris
            </h3>
            <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          
          <p className="text-sm text-slate-600 mb-4">
            Partagez vos <span className="font-bold text-purple-600">{favorites.length} recette(s) favorite(s)</span> !
          </p>
          
          <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-slate-200 mb-4">
            <Link className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input type="text" value={shareLink} readOnly className="flex-1 text-sm text-slate-600 bg-transparent outline-none" />
            <button onClick={() => copyShareLink(shareLink)} className="bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
              <Copy className="w-3 h-3" />Copier
            </button>
          </div>
          
          <button
            onClick={() => shareNative(shareLink, 'Mes recettes favorites', `Je te partage ${favorites.length} recette(s) depuis MamanDouce !`)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />Partager
          </button>
        </Card>
      )}
      
      {/* Modal de partage recette individuelle */}
      {showSingleShareModal && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-600" />
              Partager la recette
            </h3>
            <button onClick={() => setShowSingleShareModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          
          <p className="text-sm text-slate-600 mb-4">
            Partagez <span className="font-bold text-green-600">"{sharingRecipe?.name}"</span> !
          </p>
          
          <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-slate-200 mb-4">
            <Link className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input type="text" value={singleShareLink} readOnly className="flex-1 text-sm text-slate-600 bg-transparent outline-none" />
            <button onClick={() => copyShareLink(singleShareLink)} className="bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
              <Copy className="w-3 h-3" />Copier
            </button>
          </div>
          
          <button
            onClick={() => shareNative(singleShareLink, sharingRecipe?.name, `Découvre cette recette pour bébé : ${sharingRecipe?.name} !`)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />Partager
          </button>
        </Card>
      )}
      
      {/* Modal ajout recette */}
      {showAddRecipeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-green-600" />
                Nouvelle recette
              </h3>
              <button onClick={() => setShowAddRecipeModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Nom de la recette *</label>
                <Input
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Purée de carottes maison"
                  className="rounded-xl"
                />
              </div>
              
              {/* Catégorie et âge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Catégorie *</label>
                  <select
                    value={newRecipe.category}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
                  >
                    {['Légumes', 'Fruits', 'Viandes', 'Poissons', 'Légumineuses', 'Œufs', 'Féculents', 'Desserts'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Âge *</label>
                  <select
                    value={newRecipe.age}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
                  >
                    {['4 mois+', '6 mois+', '8 mois+', '10 mois+', '12 mois+', '18 mois+'].map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Ingrédients */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Ingrédients *</label>
                {newRecipe.ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={ing}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      placeholder={`Ingrédient ${index + 1}`}
                      className="flex-1 rounded-xl"
                    />
                    {newRecipe.ingredients.length > 1 && (
                      <button onClick={() => handleRemoveIngredient(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={handleAddIngredient} className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" />Ajouter un ingrédient
                </button>
              </div>
              
              {/* Étapes */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Étapes de préparation *</label>
                {newRecipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-2">{index + 1}</span>
                    <textarea
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder={`Étape ${index + 1}`}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
                    />
                    {newRecipe.steps.length > 1 && (
                      <button onClick={() => handleRemoveStep(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-start mt-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={handleAddStep} className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" />Ajouter une étape
                </button>
              </div>
              
              {/* Conseil */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Conseil (optionnel)</label>
                <Input
                  value={newRecipe.tips}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, tips: e.target.value }))}
                  placeholder="Un petit conseil pour réussir cette recette..."
                  className="rounded-xl"
                />
              </div>
              
              {/* Vidéo */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Lien vidéo (optionnel)</label>
                <Input
                  value={newRecipe.video_url}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/..."
                  className="rounded-xl"
                />
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white p-4 border-t border-slate-100 flex gap-2">
              <Button onClick={() => setShowAddRecipeModal(false)} className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl">
                Annuler
              </Button>
              <Button
                onClick={handleSaveRecipe}
                disabled={isSavingRecipe}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 rounded-xl"
              >
                {isSavingRecipe ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conseils cuisine (collapsible) */}
      <details className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-200">
        <summary className="p-4 font-bold text-amber-800 cursor-pointer hover:bg-amber-100 rounded-2xl">
          Conseils pour cuisiner
        </summary>
        <ul className="px-4 pb-4 space-y-2">
          {babyRecipes.tips_cooking?.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
              <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </details>
      
      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {allFilters.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setRecipeFilter(cat === 'Tous' ? null : cat);
              setSelectedRecipe(null);
            }}
            data-testid={`recipe-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
              (recipeFilter === cat || (cat === 'Tous' && !recipeFilter))
                ? cat === 'Favoris' ? 'bg-red-500 text-white' 
                  : cat === 'Mes recettes' ? 'bg-green-500 text-white'
                  : 'bg-pink-500 text-white'
                : cat === 'Favoris' ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : cat === 'Mes recettes' ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'Favoris' && <Heart className={`w-3 h-3 ${recipeFilter === 'Favoris' ? 'fill-white' : 'fill-red-500'}`} />}
            {cat === 'Mes recettes' && <ChefHat className="w-3 h-3" />}
            {cat}
            {cat === 'Favoris' && favorites.length > 0 && (
              <span className={`text-xs ${recipeFilter === 'Favoris' ? 'text-white' : 'text-red-600'}`}>({favorites.length})</span>
            )}
            {cat === 'Mes recettes' && customRecipes.length > 0 && (
              <span className={`text-xs ${recipeFilter === 'Mes recettes' ? 'text-white' : 'text-green-600'}`}>({customRecipes.length})</span>
            )}
          </button>
        ))}
      </div>
      
      {/* Recette sélectionnée - Affichage détaillé */}
      {selectedRecipe && (
        <Card className="bg-white rounded-2xl p-4 shadow-lg border-2 border-pink-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-700 text-lg">{selectedRecipe.name}</h4>
                {selectedRecipe.is_custom && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Ma recette</span>
                )}
              </div>
              <span className="text-xs text-slate-500">{selectedRecipe.category}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Bouton partager */}
              <button
                onClick={(e) => handleShareSingleRecipe(selectedRecipe, e)}
                className="p-2 rounded-full hover:bg-green-50 transition-colors"
                data-testid="share-single-recipe"
              >
                <Share2 className="w-5 h-5 text-green-500" />
              </button>
              <button
                onClick={(e) => toggleFavorite(selectedRecipe.name, e)}
                className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                data-testid="favorite-btn-detail"
              >
                <Heart 
                  className={`w-6 h-6 transition-colors ${
                    isFavorite(selectedRecipe.name) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-slate-300 hover:text-red-300'
                  }`} 
                />
              </button>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                {selectedRecipe.age}
              </span>
              {selectedRecipe.is_custom && (
                <span className="text-xs text-slate-400 italic">
                  By {selectedRecipe.author_name || 'Utilisateur'}
                </span>
              )}
              {selectedRecipe.is_custom && (
                <button
                  onClick={(e) => handleDeleteRecipe(selectedRecipe.id, e)}
                  className="p-2 rounded-full hover:bg-red-50 transition-colors"
                  data-testid="delete-recipe"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              )}
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="bg-slate-100 hover:bg-slate-200 rounded-full p-1"
                data-testid="close-recipe"
              >
                <ChevronUp className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
          
          {/* Ingrédients */}
          <div className="bg-slate-50 rounded-xl p-3 mb-3">
            <h5 className="text-sm font-semibold text-slate-700 mb-2">Ingrédients</h5>
            <ul className="text-sm text-slate-600 space-y-1">
              {selectedRecipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Étapes */}
          <div className="bg-green-50 rounded-xl p-3 mb-3">
            <h5 className="text-sm font-semibold text-green-800 mb-2">Préparation</h5>
            <ol className="text-sm text-green-700 space-y-2">
              {selectedRecipe.steps?.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          {/* Conseil */}
          {selectedRecipe.tips && (
            <p className="text-sm text-pink-600 bg-pink-50 p-3 rounded-xl mb-3">
              💡 {selectedRecipe.tips}
            </p>
          )}
          
          {/* Vidéo */}
          {selectedRecipe.video_url && (
            <a 
              href={selectedRecipe.video_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold hover:opacity-90 transition-colors"
            >
              <Play className="w-5 h-5" />
              Voir la recette en vidéo
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </Card>
      )}
      
      {/* SOMMAIRE des recettes avec catégories déroulantes */}
      {!selectedRecipe && (
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">
              {recipeFilter === 'Favoris' ? 'Mes recettes favorites' 
                : recipeFilter === 'Mes recettes' ? 'Mes recettes personnalisées'
                : 'Sommaire des recettes'}
            </h3>
            <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-semibold">
              {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''}
            </span>
          </div>
          
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {recipeFilter === 'Mes recettes' ? (
                <>
                  <ChefHat className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Vous n'avez pas encore créé de recette.</p>
                  <button 
                    onClick={() => setShowAddRecipeModal(true)}
                    className="mt-3 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />Créer ma première recette
                  </button>
                </>
              ) : (
                <>
                  <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Aucune recette favorite pour l'instant.</p>
                  <p className="text-sm mt-1">Cliquez sur le coeur d'une recette pour l'ajouter !</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const categoryRecipes = filteredRecipes
                  .filter(r => r.category === category)
                  .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
                const isExpanded = expandedCategories[category] ?? false;
                const glossyColor = categoryGlossyMap[category] || 'pink';
                const style = glossyStyles[glossyColor];
                
                return (
                  <div 
                    key={category} 
                    className="relative overflow-hidden rounded-xl"
                    style={{
                      background: style.bg,
                      boxShadow: style.shadow,
                      border: style.border
                    }}
                  >
                    <GlossyReflect />
                    {/* Category Header - Clickable */}
                    <button
                      onClick={() => toggleCategoryExpand(category)}
                      data-testid={`toggle-category-${category.toLowerCase()}`}
                      className="relative w-full flex items-center justify-between p-3 hover:bg-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${categoryColors[category] || 'bg-slate-100 text-slate-700'}`}>
                          {category}
                        </span>
                        <span className="text-sm text-slate-500">
                          {categoryRecipes.length} recette{categoryRecipes.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isExpanded 
                          ? categoryColors[category]?.split(' ')[0] || 'bg-slate-100'
                          : 'bg-slate-100'
                      }`}>
                        {isExpanded ? (
                          <ChevronUp className={`w-4 h-4 ${categoryColors[category]?.split(' ')[1] || 'text-slate-600'}`} />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                    
                    {/* Category Content - Collapsible */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-3 pb-3 pt-1 space-y-1">
                        {categoryRecipes.map((recipe, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedRecipe(recipe)}
                            data-testid={`recipe-${recipe.name.replace(/\s+/g, '-').toLowerCase()}`}
                            className="flex items-center justify-between w-full px-3 py-2 text-left rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-700">{recipe.name}</span>
                              {recipe.is_custom && (
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">Perso</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Share button */}
                              <button
                                onClick={(e) => handleShareSingleRecipe(recipe, e)}
                                className="p-1 rounded-full hover:bg-green-100 transition-colors opacity-0 group-hover:opacity-100"
                                data-testid={`share-${recipe.name.replace(/\s+/g, '-').toLowerCase()}`}
                              >
                                <Share2 className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={(e) => toggleFavorite(recipe.name, e)}
                                className="p-1 rounded-full hover:bg-pink-100 transition-colors"
                                data-testid={`favorite-${recipe.name.replace(/\s+/g, '-').toLowerCase()}`}
                              >
                                <Heart 
                                  className={`w-4 h-4 transition-colors ${
                                    isFavorite(recipe.name) 
                                      ? 'fill-red-500 text-red-500' 
                                      : 'text-slate-300 group-hover:text-red-300'
                                  }`} 
                                />
                              </button>
                              <span className="text-xs text-slate-400">{recipe.age}</span>
                              {recipe.video_url && (
                                <Play className="w-3 h-3 text-red-500" />
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Bouton fermer en bas */}
                        <button
                          onClick={() => toggleCategoryExpand(category)}
                          className={`w-full mt-2 p-3 rounded-xl ${categoryColors[category] || 'bg-slate-100 text-slate-700'} hover:opacity-80 flex items-center justify-center gap-2 transition-all duration-200`}
                        >
                          <ChevronUp className="w-4 h-4" />
                          <span className="text-sm font-semibold">Fermer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
      
      {/* Vidéo générale */}
      {babyRecipes.video_general && (
        <a 
          href={babyRecipes.video_general} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity"
        >
          <Play className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">Plus de recettes en vidéo</p>
        </a>
      )}
    </div>
  );
}
