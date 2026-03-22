import React, { useState } from 'react';
import { User, Heart, ChevronDown, Share2 } from 'lucide-react';

export default function ExpandableNameCard({ 
  nameData, 
  gender, 
  country, 
  countryInfo,
  isFavorite, 
  onToggleFavorite, 
  onShare,
  isDarkMode = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const bgColor = gender === 'girls' 
    ? isDarkMode ? 'bg-pink-900/30' : 'bg-pink-50'
    : isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50';
  const borderColor = gender === 'girls' 
    ? isDarkMode ? 'border-pink-800' : 'border-pink-100'
    : isDarkMode ? 'border-blue-800' : 'border-blue-100';
  const iconColor = gender === 'girls' 
    ? isDarkMode ? 'text-pink-400' : 'text-pink-400'
    : isDarkMode ? 'text-blue-400' : 'text-blue-400';

  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        <User className={`w-5 h-5 ${iconColor}`} />
        <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} flex-1`}>
          {nameData.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="p-1"
          data-testid={`favorite-${nameData.name}`}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-300 hover:text-red-300'
            }`} 
          />
        </button>
        <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3`}>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-1`}>
              Signification
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{nameData.meaning}</p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3`}>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide mb-1`}>
              Personnalité
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{nameData.personality}</p>
          </div>
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg py-2 px-3 text-sm font-medium shadow hover:shadow-md transition-all"
              data-testid="share-individual-name-btn"
            >
              <Share2 className="w-4 h-4" />
              Partager ce prénom
            </button>
          )}
        </div>
      )}
    </div>
  );
}
