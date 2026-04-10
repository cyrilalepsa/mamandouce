import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = "Rechercher un prénom...",
  isDarkMode = false 
}) {
  return (
    <div className="relative">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`w-full pl-12 pr-10 py-3 rounded-xl border transition-all ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-pink-500' 
            : 'bg-white border-slate-200 text-slate-800 focus:border-pink-300'
        } focus:outline-none focus:ring-2 focus:ring-pink-200`}
        data-testid="search-input"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
            isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
          }`}
          data-testid="clear-search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
