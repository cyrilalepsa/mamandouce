import React from 'react';
import { Heart, Trash2, FileDown, Share2 } from 'lucide-react';
import NameCard from './NameCard';

export default function FavoritesList({ 
  favorites, 
  getFavoriteDetails, 
  onToggleFavorite,
  onExport,
  onShare,
  onClearAll,
  isDarkMode = false 
}) {
  const girlsFavorites = favorites.filter(f => f.endsWith('-girls'));
  const boysFavorites = favorites.filter(f => f.endsWith('-boys'));

  if (favorites.length === 0) {
    return (
      <div className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium mb-2">Aucun favori</p>
        <p className="text-sm">Ajoutez des prénoms à vos favoris en cliquant sur le cœur</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={onExport}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isDarkMode 
              ? 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900/70' 
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          }`}
          data-testid="export-favorites"
        >
          <FileDown className="w-4 h-4" />
          <span className="text-sm font-medium">Télécharger</span>
        </button>
        
        <button
          onClick={onShare}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isDarkMode 
              ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
          data-testid="share-favorites"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Partager</span>
        </button>
        
        <button
          onClick={onClearAll}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isDarkMode 
              ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70' 
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
          data-testid="clear-favorites"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Tout supprimer</span>
        </button>
      </div>

      {/* Prénoms Filles */}
      {girlsFavorites.length > 0 && (
        <div>
          <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>
            <span className="text-xl">👧</span>
            Prénoms Filles ({girlsFavorites.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {girlsFavorites.map(fav => {
              const details = getFavoriteDetails(fav);
              if (!details) return null;
              return (
                <NameCard
                  key={fav}
                  nameData={details}
                  country={details.country}
                  gender="girls"
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  isDarkMode={isDarkMode}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Prénoms Garçons */}
      {boysFavorites.length > 0 && (
        <div>
          <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            <span className="text-xl">👦</span>
            Prénoms Garçons ({boysFavorites.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {boysFavorites.map(fav => {
              const details = getFavoriteDetails(fav);
              if (!details) return null;
              return (
                <NameCard
                  key={fav}
                  nameData={details}
                  country={details.country}
                  gender="boys"
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  isDarkMode={isDarkMode}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
