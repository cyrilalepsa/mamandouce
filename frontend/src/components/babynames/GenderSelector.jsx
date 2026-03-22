import React from 'react';
import { Heart, ChevronRight, Search, X } from 'lucide-react';
import PopularityStats from './PopularityStats';

export default function GenderSelector({ 
  favorites,
  searchQuery,
  setSearchQuery,
  searchResults,
  onSelectGender,
  onSelectFavorites,
  renderSearchResultCard,
  isDarkMode = false 
}) {
  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Rechercher un prénom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-12 pr-10 py-3 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200'} border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent`}
          data-testid="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} />
          </button>
        )}
      </div>

      {/* Résultats de recherche */}
      {searchQuery.length >= 2 && (
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm overflow-hidden`}>
          <div className={`p-3 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'} border-b`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour "{searchQuery}"
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className={`p-4 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Aucun prénom trouvé</p>
            ) : (
              searchResults.map((result, idx) => renderSearchResultCard(result, idx))
            )}
          </div>
        </div>
      )}

      {/* Contenu principal (masqué si recherche active) */}
      {searchQuery.length < 2 && (
        <>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-center mb-2`}>
            Découvrez notre collection de prénoms du monde entier avec leur signification et personnalité.
          </p>
      
          {/* Carte Favoris */}
          {favorites.length > 0 && (
            <button
              onClick={onSelectFavorites}
              className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border-red-800' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'} rounded-2xl p-5 shadow-lg border hover:shadow-xl transition-all hover:-translate-y-1 text-left`}
              data-testid="favorites-button"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-rose-400 rounded-2xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white fill-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Mes Favoris</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
                    {favorites.length} prénom{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 text-red-400" />
              </div>
            </button>
          )}

          {/* Carte Filles */}
          <button
            onClick={() => onSelectGender('girls')}
            className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-pink-900/30 to-rose-900/30 border-pink-800' : 'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-200'} rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all hover:-translate-y-1 text-left`}
            data-testid="girls-button"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">👧</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Prénoms Filles</h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Découvrez des centaines de prénoms féminins</p>
              </div>
              <ChevronRight className="w-6 h-6 text-pink-400" />
            </div>
          </button>

          {/* Carte Garçons */}
          <button
            onClick={() => onSelectGender('boys')}
            className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-sky-900/30 border-blue-800' : 'bg-gradient-to-r from-blue-100 to-sky-100 border-blue-200'} rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all hover:-translate-y-1 text-left`}
            data-testid="boys-button"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-sky-400 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">👦</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Prénoms Garçons</h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Explorez des centaines de prénoms masculins</p>
              </div>
              <ChevronRight className="w-6 h-6 text-blue-400" />
            </div>
          </button>

          {/* Statistiques de popularité */}
          <PopularityStats 
            isDarkMode={isDarkMode} 
          />
        </>
      )}
    </div>
  );
}
