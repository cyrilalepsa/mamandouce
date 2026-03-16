import { useState } from 'react';
import { Card } from '../ui/card';
import { Check, Play, ExternalLink, ChevronDown, ChevronUp, Heart, Share2, Copy, Link } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function RecipesSection({ babyRecipes, favorites, onFavoritesChange }) {
  const [recipeFilter, setRecipeFilter] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

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

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Lien copié dans le presse-papiers !');
    } catch (error) {
      toast.error('Impossible de copier le lien');
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mes recettes favorites pour bébé',
          text: `Je te partage ${favorites.length} recette(s) pour bébé depuis MamanDouce !`,
          url: shareLink
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      copyShareLink();
    }
  };

  const isFavorite = (recipeName) => favorites.includes(recipeName);

  const toggleCategoryExpand = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter recipes
  const getFilteredRecipes = () => {
    let recipes = babyRecipes.recipes || [];
    
    if (recipeFilter === 'Favoris') {
      recipes = recipes.filter(r => favorites.includes(r.name));
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

  const allFilters = ['Tous', 'Favoris', 'Légumes', 'Fruits', 'Viandes', 'Poissons', 'Légumineuses', 'Œufs', 'Féculents', 'Desserts'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-700">{babyRecipes.title}</h2>
          <p className="text-sm text-slate-600">{babyRecipes.description}</p>
        </div>
        {/* Bouton Partager */}
        {favorites.length > 0 && (
          <button
            onClick={handleShareFavorites}
            disabled={isSharing}
            data-testid="share-favorites-btn"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {isSharing ? 'Création...' : 'Partager'}
          </button>
        )}
      </div>

      {/* Modal de partage */}
      {showShareModal && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              Partager mes favoris
            </h3>
            <button
              onClick={() => setShowShareModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <p className="text-sm text-slate-600 mb-4">
            Partagez vos <span className="font-bold text-purple-600">{favorites.length} recette(s) favorite(s)</span> avec vos amies !
          </p>
          
          <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-slate-200 mb-4">
            <Link className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 text-sm text-slate-600 bg-transparent outline-none"
            />
            <button
              onClick={copyShareLink}
              data-testid="copy-share-link"
              className="bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Copier
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={shareNative}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
          
          <p className="text-xs text-slate-400 text-center mt-3">
            Le lien est accessible à tous, même sans compte MamanDouce
          </p>
        </Card>
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
            data-testid={`recipe-filter-${cat.toLowerCase()}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
              (recipeFilter === cat || (cat === 'Tous' && !recipeFilter))
                ? cat === 'Favoris' ? 'bg-red-500 text-white' : 'bg-pink-500 text-white'
                : cat === 'Favoris' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'Favoris' && <Heart className={`w-3 h-3 ${recipeFilter === 'Favoris' ? 'fill-white' : 'fill-red-500'}`} />}
            {cat}
            {cat === 'Favoris' && favorites.length > 0 && (
              <span className={`text-xs ${recipeFilter === 'Favoris' ? 'text-white' : 'text-red-600'}`}>({favorites.length})</span>
            )}
          </button>
        ))}
      </div>
      
      {/* Recette sélectionnée - Affichage détaillé */}
      {selectedRecipe && (
        <Card className="bg-white rounded-2xl p-4 shadow-lg border-2 border-pink-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-bold text-slate-700 text-lg">{selectedRecipe.name}</h4>
              <span className="text-xs text-slate-500">{selectedRecipe.category}</span>
            </div>
            <div className="flex items-center gap-2">
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
              {recipeFilter === 'Favoris' ? 'Mes recettes favorites' : 'Sommaire des recettes'}
            </h3>
            <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-semibold">
              {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''}
            </span>
          </div>
          
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Aucune recette favorite pour l'instant.</p>
              <p className="text-sm mt-1">Cliquez sur le coeur d'une recette pour l'ajouter !</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const categoryRecipes = filteredRecipes
                  .filter(r => r.category === category)
                  .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
                const isExpanded = expandedCategories[category] ?? false;
                
                return (
                  <div key={category} className="border border-slate-100 rounded-xl overflow-hidden">
                    {/* Category Header - Clickable */}
                    <button
                      onClick={() => toggleCategoryExpand(category)}
                      data-testid={`toggle-category-${category.toLowerCase()}`}
                      className={`w-full flex items-center justify-between p-3 transition-colors ${
                        categoryColors[category]?.replace('text-', 'hover:bg-').split(' ')[0] || 'hover:bg-slate-50'
                      }`}
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
                            <span className="text-sm text-slate-700">{recipe.name}</span>
                            <div className="flex items-center gap-2">
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
