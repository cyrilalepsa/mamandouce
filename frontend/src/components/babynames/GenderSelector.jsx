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
    <div className="space-y-3">
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
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-center text-sm mb-2`}>
            Découvrez des prénoms du monde entier avec leur signification.
          </p>
      
          {/* Carte Favoris - style bombé pastel rouge */}
          {favorites.length > 0 && (
            <button
              onClick={onSelectFavorites}
              className="relative overflow-hidden w-full rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(145deg, rgba(30,30,35,0.98) 0%, rgba(50,20,25,0.9) 50%, rgba(80,30,40,0.8) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,226,226,0.95) 30%, rgba(254,202,202,0.85) 60%, rgba(252,165,165,0.7) 100%)',
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(239,68,68,0.15), inset 0 1px 2px rgba(255,255,255,0.05)'
                  : '0 8px 24px -4px rgba(239,68,68,0.25), 0 4px 8px -2px rgba(239,68,68,0.15), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(239,68,68,0.1)',
                border: isDarkMode ? '1px solid rgba(239,68,68,0.3)' : '2px solid rgba(239,68,68,0.35)'
              }}
              data-testid="favorites-button"
            >
              {/* Voile blanc supprimé */}
<div className="relative flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
                    backdropFilter: 'none',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <Heart className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-500'} fill-current`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-base font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Mes Favoris</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {favorites.length} prénom{favorites.length > 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400" />
              </div>
            </button>
          )}

          {/* Carte Filles - style bombé pastel rose accentué */}
          <button
            onClick={() => onSelectGender('girls')}
            className="relative overflow-hidden w-full rounded-2xl p-5 transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(145deg, rgba(30,30,35,0.98) 0%, rgba(50,20,35,0.9) 50%, rgba(80,30,55,0.8) 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,231,243,0.95) 30%, rgba(251,207,232,0.85) 60%, rgba(249,168,212,0.7) 100%)',
              boxShadow: isDarkMode 
                ? '0 4px 12px rgba(236,72,153,0.15), inset 0 1px 2px rgba(255,255,255,0.05)'
                : '0 8px 24px -4px rgba(236,72,153,0.3), 0 4px 8px -2px rgba(236,72,153,0.2), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(236,72,153,0.15)',
              border: isDarkMode ? '1px solid rgba(236,72,153,0.3)' : '2px solid rgba(236,72,153,0.4)'
            }}
            data-testid="girls-button"
          >
              {/* Voile blanc supprimé */}
<div className="relative flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
                  backdropFilter: 'none',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)'
                }}
              >
                <span className="text-2xl">👧</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-pink-700'}`}>Prénoms Filles</h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-pink-500'}`}>Centaines de prénoms féminins</p>
              </div>
              <ChevronRight className="w-6 h-6 text-pink-500" />
            </div>
          </button>

          {/* Carte Garçons - style bombé pastel bleu accentué */}
          <button
            onClick={() => onSelectGender('boys')}
            className="relative overflow-hidden w-full rounded-2xl p-5 transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(145deg, rgba(30,30,35,0.98) 0%, rgba(20,35,55,0.9) 50%, rgba(30,50,80,0.8) 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.95) 30%, rgba(186,230,253,0.85) 60%, rgba(125,211,252,0.7) 100%)',
              boxShadow: isDarkMode 
                ? '0 4px 12px rgba(56,189,248,0.15), inset 0 1px 2px rgba(255,255,255,0.05)'
                : '0 8px 24px -4px rgba(56,189,248,0.3), 0 4px 8px -2px rgba(56,189,248,0.2), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(56,189,248,0.15)',
              border: isDarkMode ? '1px solid rgba(56,189,248,0.3)' : '2px solid rgba(56,189,248,0.4)'
            }}
            data-testid="boys-button"
          >
              {/* Voile blanc supprimé */}
<div className="relative flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
                  backdropFilter: 'none',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)'
                }}
              >
                <span className="text-2xl">👦</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-sky-700'}`}>Prénoms Garçons</h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-sky-500'}`}>Centaines de prénoms masculins</p>
              </div>
              <ChevronRight className="w-6 h-6 text-sky-500" />
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
