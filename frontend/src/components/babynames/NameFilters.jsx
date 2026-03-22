import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

export default function NameFilters({ 
  filters,
  setFilters,
  isOpen,
  setIsOpen,
  isDarkMode = false 
}) {
  const lengthOptions = [
    { value: '', label: 'Toutes les longueurs' },
    { value: 'short', label: 'Court (1-4 lettres)' },
    { value: 'medium', label: 'Moyen (5-7 lettres)' },
    { value: 'long', label: 'Long (8+ lettres)' },
  ];

  const endingOptions = [
    { value: '', label: 'Toutes les terminaisons' },
    { value: 'a', label: 'Se termine par A' },
    { value: 'e', label: 'Se termine par E' },
    { value: 'i', label: 'Se termine par I' },
    { value: 'o', label: 'Se termine par O' },
    { value: 'n', label: 'Se termine par N' },
    { value: 's', label: 'Se termine par S' },
  ];

  const originOptions = [
    { value: '', label: 'Toutes les origines' },
    { value: 'arabe', label: 'Origine arabe' },
    { value: 'breton', label: 'Origine bretonne' },
    { value: 'celtique', label: 'Origine celtique' },
    { value: 'grec', label: 'Origine grecque' },
    { value: 'hébraïque', label: 'Origine hébraïque' },
    { value: 'latin', label: 'Origine latine' },
    { value: 'germanique', label: 'Origine germanique' },
    { value: 'slave', label: 'Origine slave' },
  ];

  const hasActiveFilters = filters.length || filters.ending || filters.origin;

  const clearFilters = () => {
    setFilters({ length: '', ending: '', origin: '' });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          hasActiveFilters
            ? isDarkMode 
              ? 'bg-pink-900/50 text-pink-300 border border-pink-700' 
              : 'bg-pink-100 text-pink-600 border border-pink-200'
            : isDarkMode
              ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
        data-testid="filter-toggle"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filtres avancés</span>
        {hasActiveFilters && (
          <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
            isDarkMode ? 'bg-pink-700 text-pink-200' : 'bg-pink-200 text-pink-700'
          }`}>
            {[filters.length, filters.ending, filters.origin].filter(Boolean).length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`p-4 rounded-xl border space-y-4 animate-fade-in ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex justify-between items-center">
            <h4 className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              Filtrer les prénoms
            </h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`text-xs flex items-center gap-1 ${
                  isDarkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-500 hover:text-pink-600'
                }`}
                data-testid="clear-filters"
              >
                <X className="w-3 h-3" />
                Effacer tout
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filtre par longueur */}
            <div>
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Longueur
              </label>
              <select
                value={filters.length}
                onChange={(e) => setFilters(prev => ({ ...prev, length: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-pink-200`}
                data-testid="filter-length"
              >
                {lengthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Filtre par terminaison */}
            <div>
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Terminaison
              </label>
              <select
                value={filters.ending}
                onChange={(e) => setFilters(prev => ({ ...prev, ending: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-pink-200`}
                data-testid="filter-ending"
              >
                {endingOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Filtre par origine */}
            <div>
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Origine
              </label>
              <select
                value={filters.origin}
                onChange={(e) => setFilters(prev => ({ ...prev, origin: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                } focus:outline-none focus:ring-2 focus:ring-pink-200`}
                data-testid="filter-origin"
              >
                {originOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fonction utilitaire pour filtrer les noms
export function filterNames(names, filters) {
  return names.filter(nameData => {
    const name = nameData.name.toLowerCase();
    const personality = (nameData.personality || '').toLowerCase();
    
    // Filtre par longueur
    if (filters.length) {
      const len = name.length;
      if (filters.length === 'short' && len > 4) return false;
      if (filters.length === 'medium' && (len < 5 || len > 7)) return false;
      if (filters.length === 'long' && len < 8) return false;
    }
    
    // Filtre par terminaison
    if (filters.ending && !name.endsWith(filters.ending.toLowerCase())) {
      return false;
    }
    
    // Filtre par origine
    if (filters.origin && !personality.includes(filters.origin.toLowerCase())) {
      return false;
    }
    
    return true;
  });
}
