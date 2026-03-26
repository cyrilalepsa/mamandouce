import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getNameOfTheDay, getNameDayMessage } from '../data/namesByCountry';
import { frenchNames } from '../data/babyNamesFR';
import { NewBadge } from './NewBadge';

export default function NameOfTheDay({ isDarkMode = false }) {
  const { t, i18n } = useTranslation();
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

  return (
    <div 
      className={`rounded-xl px-3 py-2 border flex items-center gap-3 ${
        isDarkMode 
          ? 'bg-slate-800/50 border-slate-700' 
          : isNeutral
            ? 'bg-purple-50/80 border-purple-100'
            : isGirl 
              ? 'bg-pink-50/80 border-pink-100' 
              : 'bg-blue-50/80 border-blue-100'
      }`}
      data-testid="name-of-the-day"
    >
      <Sparkles className={`w-4 h-4 flex-shrink-0 ${
        isDarkMode ? 'text-yellow-400' : isNeutral ? 'text-purple-400' : isGirl ? 'text-pink-400' : 'text-blue-400'
      }`} />
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('home.nameOfTheDay', 'Fête du jour')}
        </span>
        <NewBadge badgeId="name-of-day" size="xs" />
        <span className={`font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>
          🎉 {displayNames}
        </span>
        <span className={`text-xs hidden sm:inline ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          • {nameOfTheDay.meaning}
        </span>
      </div>
    </div>
  );
}
