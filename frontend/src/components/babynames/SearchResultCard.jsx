import React, { useState } from 'react';
import { Heart, Lock, Crown, ChevronDown } from 'lucide-react';

export default function SearchResultCard({ 
  result, 
  isFavorite, 
  onToggleFavorite, 
  onNavigate,
  isDarkMode = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const bgColor = result.gender === 'girls' 
    ? isDarkMode ? 'bg-pink-900/30' : 'bg-pink-50'
    : isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50';
  const borderColor = result.gender === 'girls' 
    ? isDarkMode ? 'border-pink-800' : 'border-pink-100'
    : isDarkMode ? 'border-blue-800' : 'border-blue-100';
  const genderEmoji = result.gender === 'girls' ? '👧' : '👦';

  return (
    <div className={`${bgColor} ${borderColor} border-b last:border-b-0`}>
      <button
        onClick={() => result.isAccessible ? setIsExpanded(!isExpanded) : onNavigate()}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        <span className="text-lg">{genderEmoji}</span>
        <div className="flex-1">
          <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {result.name}
          </span>
          <span className={`ml-2 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {result.country?.flag} {result.country?.name}
          </span>
        </div>
        {!result.isAccessible ? (
          <div className="flex items-center gap-1 text-amber-500">
            <Lock className="w-4 h-4" />
            <Crown className="w-4 h-4" />
          </div>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-1"
              data-testid={`favorite-search-${result.name}`}
            >
              <Heart 
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-300 hover:text-red-300'
                }`} 
              />
            </button>
            <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>
      
      {isExpanded && result.isAccessible && (
        <div className="px-3 pb-3 space-y-2">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3`}>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-1`}>
              Signification
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{result.meaning}</p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3`}>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-1`}>
              Personnalité
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{result.personality}</p>
          </div>
        </div>
      )}
    </div>
  );
}
