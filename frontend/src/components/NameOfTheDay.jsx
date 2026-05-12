import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getNameOfTheDay, getNameDayMessage } from '../data/namesByCountry';
import { frenchNames } from '../data/babyNamesFR';
import { NewBadge } from './NewBadge';

export default function NameOfTheDay({ compact = false, fullWidth = false }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  
  // Obtenir le prénom fêté aujourd'hui selon le pays
  const nameOfTheDay = useMemo(() => {
    const today = new Date();
    const nameData = getNameOfTheDay(today, currentLang);
    
    // Si pas de données pour ce pays/cette date
    if (!nameData || !nameData.names || nameData.names.length === 0) {
      // Pour l'anglais, pas de tradition équivalente
      if (currentLang === 'en') {
        return null;
      }
      return null;
    }
    
    const primaryName = nameData.names[0];
    
    // Pour le français, chercher des infos supplémentaires sur le prénom
    if (currentLang === 'fr' && frenchNames) {
      let nameInfo = null;
      let gender = 'neutral';
      
      // Chercher dans les prénoms filles
      for (const letterNames of Object.values(frenchNames.girls || {})) {
        const found = letterNames.find(n => 
          n.name.toLowerCase() === primaryName.toLowerCase()
        );
        if (found) {
          nameInfo = found;
          gender = 'girls';
          break;
        }
      }
      
      // Si pas trouvé, chercher dans les prénoms garçons
      if (!nameInfo) {
        for (const letterNames of Object.values(frenchNames.boys || {})) {
          const found = letterNames.find(n => 
            n.name.toLowerCase() === primaryName.toLowerCase()
          );
          if (found) {
            nameInfo = found;
            gender = 'boys';
            break;
          }
        }
      }
      
      if (nameInfo) {
        return {
          name: primaryName,
          meaning: nameInfo.meaning,
          celebration: nameData.celebration,
          gender: gender,
          allNames: nameData.names
        };
      }
    }
    
    // Retour par défaut
    return {
      name: primaryName,
      meaning: nameData.celebration,
      celebration: nameData.celebration,
      gender: 'neutral',
      allNames: nameData.names
    };
  }, [currentLang]);

  // Pour l'anglais où il n'y a pas de tradition
  if (!nameOfTheDay && currentLang === 'en') {
    return null;
  }

  if (!nameOfTheDay) return null;

  const isGirl = nameOfTheDay.gender === 'girls';
  const isNeutral = nameOfTheDay.gender === 'neutral';
  
  // Message localisé
  const celebrationMessage = getNameDayMessage(currentLang);
  const displayNames = nameOfTheDay.allNames.length > 1 
    ? nameOfTheDay.allNames.slice(0, 2).join(', ')
    : nameOfTheDay.name;

  // Mode compact (côte à côte avec WeekDisplayWidget) - Cliquable vers calendrier
  if (compact) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    
    return (
      <div 
        className="relative overflow-hidden px-4 py-3 cursor-pointer active:scale-[0.98] badge-fete-du-jour w-full flex flex-col justify-center items-center text-center"
        style={{
          height: '112px',
          minHeight: '112px',
          maxHeight: '112px',
          borderRadius: '20px',
          color: '#4A4A4A',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          contain: 'layout paint size'
        }}
        onClick={() => navigate('/cycle-tracking?calendar=true')}
        data-testid="name-of-the-day"
      >
        <div className="relative flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-semibold leading-tight" style={{ color: '#92400e' }}>
            {t('home.nameOfTheDay', 'Fête du jour')}
          </span>
        </div>
        <span className="relative text-xl mb-0.5 leading-tight">🎉</span>
        <p className="relative font-bold text-base leading-tight" style={{ 
          background: 'linear-gradient(90deg, #d97706 0%, #ea580c 50%, #d97706 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {displayNames}
        </p>
        <p className="relative text-[11px] mt-1 font-medium leading-tight" style={{ color: '#92400e' }}>{dateStr}</p>
      </div>
    );
  }

  // Mode pleine largeur (quand la carte Semaine X n'est pas affichée)
  if (fullWidth) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    
    return (
      <div 
        className="relative overflow-hidden rounded-full px-4 py-2 flex flex-row items-center justify-center gap-2 cursor-pointer active:scale-[0.98] w-full badge-fete-du-jour"
        style={{
          borderRadius: '9999px',
          color: '#4A4A4A',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          contain: 'layout paint'
        }}
        onClick={() => navigate('/cycle-tracking?calendar=true')}
        data-testid="name-of-the-day"
      >
        {/* Emoji gauche */}
        <span className="relative text-base">🎉</span>
        
        {/* Contenu centré */}
        <span 
          className="relative text-sm font-bold text-center"
          style={{ 
            background: 'linear-gradient(90deg, #d97706 0%, #ea580c 50%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('home.nameOfTheDay', 'Fête du jour')} : {displayNames}
        </span>
        
        {/* Emoji droit */}
        <span className="relative text-base">✨</span>
      </div>
    );
  }

  // Mode normal (pleine largeur) - Light mode only
  return (
    <div 
      className={`rounded-xl px-3 py-2 border flex items-center gap-3 ${
        isNeutral
          ? 'bg-purple-50/80 border-purple-100'
          : isGirl 
            ? 'bg-pink-50/80 border-pink-100' 
            : 'bg-blue-50/80 border-blue-100'
      }`}
      data-testid="name-of-the-day"
    >
      <Sparkles className={`w-4 h-4 flex-shrink-0 ${
        isNeutral ? 'text-purple-400' : isGirl ? 'text-pink-400' : 'text-blue-400'
      }`} />
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-slate-500">
          {t('home.nameOfTheDay', 'Fête du jour')}
        </span>
        <NewBadge badgeId="name-of-day" size="xs" />
        <span className="font-semibold truncate text-slate-700">
          🎉 {displayNames}
        </span>
        <span className="text-xs hidden sm:inline text-slate-500">
          • {nameOfTheDay.meaning}
        </span>
      </div>
    </div>
  );
}
