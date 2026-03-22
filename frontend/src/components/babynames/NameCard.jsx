import React from 'react';
import { Heart, Share2 } from 'lucide-react';

export default function NameCard({ 
  nameData, 
  country, 
  gender, 
  isFavorite, 
  onToggleFavorite, 
  onShare,
  isDarkMode = false 
}) {
  const bgColor = gender === 'girls' 
    ? isDarkMode ? 'bg-pink-900/30' : 'bg-gradient-to-br from-pink-50 to-rose-50'
    : isDarkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-blue-50 to-sky-50';

  const handleShare = async () => {
    const shareText = `${nameData.name} (${country?.flag} ${country?.name})\n\n✨ Signification: ${nameData.meaning}\n💫 Personnalité: ${nameData.personality}\n\n👶 Découvert sur MamanDouce`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prénom: ${nameData.name}`,
          text: shareText,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Erreur partage:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        if (onShare) onShare('Prénom copié dans le presse-papiers !');
      } catch {
        if (onShare) onShare('Impossible de copier');
      }
    }
  };

  return (
    <div 
      className={`${bgColor} rounded-xl p-4 border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} transition-all hover:shadow-md`}
      data-testid={`name-card-${nameData.name}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              {nameData.name}
            </span>
            {country && (
              <span className="text-xs text-slate-500">{country.flag}</span>
            )}
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-pink-300' : 'text-pink-600'} mb-1`}>
            {nameData.meaning}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} italic`}>
            {nameData.personality}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'hover:bg-slate-700 text-slate-400 hover:text-blue-400' 
                : 'hover:bg-white/50 text-slate-400 hover:text-blue-500'
            }`}
            title="Partager ce prénom"
            data-testid={`share-name-${nameData.name}`}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleFavorite(nameData.name, country?.code, gender)}
            className={`p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'bg-red-100 text-red-500' 
                : isDarkMode 
                  ? 'hover:bg-slate-700 text-slate-400' 
                  : 'hover:bg-white/50 text-slate-400'
            }`}
            data-testid={`favorite-${nameData.name}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
