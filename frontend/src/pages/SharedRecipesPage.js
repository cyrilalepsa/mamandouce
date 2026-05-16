import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Heart, Play, ExternalLink, ChevronDown, ChevronUp, Baby, ArrowLeft, Share2, Download, Eye
} from 'lucide-react';
import api from '../utils/api';

export default function SharedRecipesPage() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    loadSharedRecipes();
  }, [shareCode]);

  const loadSharedRecipes = async () => {
    try {
      const response = await api.postpartum.getSharedRecipes(shareCode);
      setShareData(response.data);
    } catch (err) {
      setError('Ce lien de partage est invalide ou a expiré.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <Card className="bg-white rounded-3xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-700 mb-2">Oups !</h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full px-6 py-3"
          >
            Découvrir MamanDouce
          </Button>
        </Card>
      </div>
    );
  }

  const categoryColors = {
    'Légumes': 'bg-green-100 text-green-700',
    'Fruits': 'bg-orange-100 text-orange-700',
    'Viandes': 'bg-red-100 text-red-700',
    'Poissons': 'bg-sky-100 text-sky-700',
    'Légumineuses': 'bg-amber-100 text-amber-700',
    'Œufs': 'bg-yellow-100 text-yellow-700',
    'Féculents': 'bg-purple-100 text-purple-700',
    'Desserts': 'bg-pink-100 text-pink-700'
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Baby className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Recettes partagées
          </h1>
          <p className="text-slate-500 mt-2">
            <span className="text-pink-600 font-semibold">{shareData?.shared_by}</span> vous partage {shareData?.recipes_count} recette(s) pour bébé
          </p>
          {/* View counter */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Eye className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">{shareData?.views || 1} vue{(shareData?.views || 1) > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Selected Recipe Detail */}
        {selectedRecipe && (
          <Card className="bg-white rounded-2xl p-4 shadow-lg border-2 border-pink-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-slate-700 text-lg">{selectedRecipe.name}</h4>
                <span className="text-xs text-slate-500">{selectedRecipe.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {selectedRecipe.age}
                </span>
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="bg-slate-100 hover:bg-slate-200 rounded-full p-1"
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

        {/* Liste des recettes */}
        {!selectedRecipe && (
          <Card className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Recettes de {shareData?.shared_by}</h3>
              <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-semibold">
                {shareData?.recipes_count} recette(s)
              </span>
            </div>
            
            <div className="space-y-2">
              {shareData?.recipes?.map((recipe, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="flex items-center justify-between w-full px-3 py-3 text-left rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${categoryColors[recipe.category] || 'bg-slate-100 text-slate-700'}`}>
                      {recipe.category}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{recipe.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{recipe.age}</span>
                    {recipe.video_url && (
                      <Play className="w-3 h-3 text-red-500" />
                    )}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA pour découvrir l'app */}
        <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-2xl p-6 border border-rose-200 text-center">
          <h3 className="font-bold text-slate-700 mb-2">Envie de plus de recettes ?</h3>
          <p className="text-sm text-slate-500 mb-4">
            MamanDouce propose 40+ recettes pour bébé, un guide de grossesse complet et un suivi post-partum personnalisé.
          </p>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full px-6 py-3 font-semibold"
          >
            <Heart className="w-4 h-4 mr-2" />
            Découvrir MamanDouce
          </Button>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          <p>Partagé via MamanDouce - L'app des futures et jeunes mamans</p>
        </div>
      </div>
    </div>
  );
}
