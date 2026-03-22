import React, { useState, useEffect, useRef } from 'react';
import { User, Heart, ChevronDown, ChevronUp, Share2, Sparkles } from 'lucide-react';
import api from '../../utils/api';

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
  const hasTracked = useRef(false);
  
  // Track view when expanded
  useEffect(() => {
    if (isExpanded && !hasTracked.current) {
      hasTracked.current = true;
      api.nameStats.trackView(nameData.name, country, gender).catch(() => {});
    }
  }, [isExpanded, nameData.name, country, gender]);
  
  // Couleurs selon le genre
  const borderColor = gender === 'girls' 
    ? isDarkMode ? 'border-pink-500' : 'border-pink-400'
    : isDarkMode ? 'border-blue-500' : 'border-blue-400';
  const iconColor = gender === 'girls' 
    ? isDarkMode ? 'text-pink-400' : 'text-pink-500'
    : isDarkMode ? 'text-blue-400' : 'text-blue-500';

  return (
    <div className="overflow-hidden rounded-xl shadow-sm">
      {/* Partie haute avec contour coloré */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-3 flex items-center gap-3 text-left border-2 ${borderColor} ${
          isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'
        } ${isExpanded ? 'rounded-t-xl' : 'rounded-xl'}`}
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
        {isExpanded ? (
          <ChevronUp className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-500'}`} />
        ) : (
          <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        )}
      </button>
      
      {/* Partie basse sans contour coloré */}
      {isExpanded && (
        <div className={`px-3 pb-3 pt-3 space-y-3 ${
          isDarkMode ? 'bg-slate-800/50' : 'bg-white'
        } rounded-b-xl`}>
          {/* Signification - Fond rose pastel comme Top 10 */}
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-slate-700/50' : 'bg-gradient-to-r from-pink-50 to-rose-50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                isDarkMode ? 'text-pink-400' : 'text-pink-600'
              }`}>
                Signification
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{nameData.meaning}</p>
          </div>
          
          {/* Personnalité - Fond violet pastel comme Top 10 */}
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-slate-700/50' : 'bg-gradient-to-r from-violet-50 to-purple-50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Heart className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-violet-500'}`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                isDarkMode ? 'text-violet-400' : 'text-violet-600'
              }`}>
                Personnalité
              </span>
            </div>
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
