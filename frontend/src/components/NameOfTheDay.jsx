import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { getSaintOfTheDay } from '../data/saintsCalendar';
import { frenchNames } from '../data/babyNamesFR';
import { NewBadge } from './NewBadge';

export default function NameOfTheDay({ isDarkMode = false }) {
  // Obtenir le prénom fêté aujourd'hui selon le calendrier des saints
  const nameOfTheDay = useMemo(() => {
    const saint = getSaintOfTheDay();
    
    if (!saint) return null;
    
    // Chercher le prénom dans notre base de données pour avoir plus d'infos
    let nameInfo = null;
    let gender = 'girls'; // Par défaut
    
    // Chercher dans les prénoms filles
    for (const letterNames of Object.values(frenchNames.girls)) {
      const found = letterNames.find(n => 
        n.name.toLowerCase() === saint.name.toLowerCase() ||
        saint.variants.some(v => v.toLowerCase() === n.name.toLowerCase())
      );
      if (found) {
        nameInfo = found;
        gender = 'girls';
        break;
      }
    }
    
    // Si pas trouvé, chercher dans les prénoms garçons
    if (!nameInfo) {
      for (const letterNames of Object.values(frenchNames.boys)) {
        const found = letterNames.find(n => 
          n.name.toLowerCase() === saint.name.toLowerCase() ||
          saint.variants.some(v => v.toLowerCase() === n.name.toLowerCase())
        );
        if (found) {
          nameInfo = found;
          gender = 'boys';
          break;
        }
      }
    }
    
    // Si on a trouvé des infos dans notre base
    if (nameInfo) {
      return {
        name: saint.name,
        meaning: nameInfo.meaning,
        gender: gender
      };
    }
    
    // Sinon, retourner juste le nom du saint
    return {
      name: saint.name,
      meaning: saint.variants.length > 0 ? `Variantes : ${saint.variants.slice(0, 3).join(', ')}` : "Prénom fêté aujourd'hui",
      gender: 'neutral'
    };
  }, []);

  if (!nameOfTheDay) return null;

  const isGirl = nameOfTheDay.gender === 'girls';
  const isNeutral = nameOfTheDay.gender === 'neutral';

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
          Fête du jour
        </span>
        <NewBadge badgeId="name-of-day" size="xs" />
        <span className={`font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>
          🎉 {nameOfTheDay.name}
        </span>
        <span className={`text-xs hidden sm:inline ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          • {nameOfTheDay.meaning}
        </span>
      </div>
    </div>
  );
}
