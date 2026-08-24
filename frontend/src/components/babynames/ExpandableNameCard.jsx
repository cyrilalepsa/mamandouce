import React, { useState, useEffect, useRef } from 'react';
import { User, Heart, ChevronDown, ChevronUp, Share2, Sparkles } from 'lucide-react';
import api from '../../utils/api';

// Styles pastel bombés selon le genre
const PASTEL_STYLES = {
  girls: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,231,243,0.95) 30%, rgba(251,207,232,0.85) 70%, rgba(249,168,212,0.75) 100%)',
    shadow: '0 6px 16px -4px rgba(236,72,153,0.2), 0 3px 6px -2px rgba(236,72,153,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(236,72,153,0.08)',
    iconBg: 'bg-pink-100/60',
    iconText: 'text-pink-500'
  },
  boys: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.95) 30%, rgba(186,230,253,0.85) 70%, rgba(125,211,252,0.75) 100%)',
    shadow: '0 6px 16px -4px rgba(14,165,233,0.2), 0 3px 6px -2px rgba(14,165,233,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(14,165,233,0.08)',
    iconBg: 'bg-sky-100/60',
    iconText: 'text-sky-500'
  }
};

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
  
  const style = gender === 'girls' ? PASTEL_STYLES.girls : PASTEL_STYLES.boys;

  return (
    <div className="overflow-hidden rounded-2xl relative">
      {/* Partie haute avec effet bombé pastel */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-3 flex items-center gap-3 text-left relative overflow-hidden transition-all duration-200 ${
          isExpanded ? 'rounded-t-2xl' : 'rounded-2xl'
        }`}
        style={{
          background: isDarkMode 
            ? (gender === 'girls' ? 'linear-gradient(145deg, rgba(31,41,55,1) 0%, rgba(55,48,68,0.9) 100%)' : 'linear-gradient(145deg, rgba(31,41,55,1) 0%, rgba(30,58,78,0.9) 100%)')
            : style.bg,
          boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : style.shadow
        }}
      >
        {/* Effet de reflet bombé glossy */}
        
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.iconBg} backdrop-blur-sm relative`}
          style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
        >
          <User className={`w-4 h-4 ${style.iconText}`} />
        </div>
        <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} flex-1 relative`}>
          {nameData.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="p-1 relative"
          data-testid={`favorite-${nameData.name}`}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-300 hover:text-red-300'
            }`} 
          />
        </button>
        {isExpanded ? (
          <ChevronUp className={`w-5 h-5 relative ${isDarkMode ? 'text-violet-400' : 'text-violet-500'}`} />
        ) : (
          <ChevronDown className={`w-5 h-5 relative ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        )}
      </button>
      
      {/* Partie basse */}
      {isExpanded && (
        <div className={`px-4 pb-4 pt-3 space-y-3 ${
          isDarkMode ? 'bg-slate-800/50' : 'bg-white/80 backdrop-blur-sm'
        } rounded-b-2xl`}>
          {/* Signification - Fond rose pastel avec effet bombé léger */}
          <div 
            className="p-3 rounded-xl relative overflow-hidden"
            style={{
              background: isDarkMode 
                ? 'rgba(55,48,68,0.5)' 
                : 'linear-gradient(145deg, rgba(252,231,243,0.8) 0%, rgba(251,207,232,0.6) 100%)',
              boxShadow: isDarkMode ? 'none' : 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(236,72,153,0.1)'
            }}
          >
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
          
          {/* Personnalité - Fond violet pastel avec effet bombé léger */}
          <div 
            className="p-3 rounded-xl relative overflow-hidden"
            style={{
              background: isDarkMode 
                ? 'rgba(55,48,68,0.5)' 
                : 'linear-gradient(145deg, rgba(243,232,255,0.8) 0%, rgba(233,213,255,0.6) 100%)',
              boxShadow: isDarkMode ? 'none' : 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(139,92,246,0.1)'
            }}
          >
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
              className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 px-3 text-sm font-semibold shadow transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(145deg, rgba(236,72,153,0.9) 0%, rgba(244,63,94,0.9) 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(236,72,153,0.3)'
              }}
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
