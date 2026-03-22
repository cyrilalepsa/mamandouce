import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { frenchNames } from '../data/babyNamesFR';

export default function NameOfTheDay({ isDarkMode = false }) {
  // Sélectionner un prénom basé sur la date du jour
  const nameOfTheDay = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    
    // Combiner tous les prénoms
    const allNames = [];
    
    Object.values(frenchNames.girls).forEach(letterNames => {
      letterNames.forEach(name => allNames.push({ ...name, gender: 'girls' }));
    });
    
    Object.values(frenchNames.boys).forEach(letterNames => {
      letterNames.forEach(name => allNames.push({ ...name, gender: 'boys' }));
    });
    
    const index = dayOfYear % allNames.length;
    return allNames[index];
  }, []);

  if (!nameOfTheDay) return null;

  const isGirl = nameOfTheDay.gender === 'girls';

  return (
    <div 
      className={`rounded-xl px-3 py-2 border flex items-center gap-3 ${
        isDarkMode 
          ? 'bg-slate-800/50 border-slate-700' 
          : isGirl 
            ? 'bg-pink-50/80 border-pink-100' 
            : 'bg-blue-50/80 border-blue-100'
      }`}
      data-testid="name-of-the-day"
    >
      <Sparkles className={`w-4 h-4 flex-shrink-0 ${
        isDarkMode ? 'text-yellow-400' : isGirl ? 'text-pink-400' : 'text-blue-400'
      }`} />
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Prénom du jour
        </span>
        <span className={`font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>
          {isGirl ? '👧' : '👦'} {nameOfTheDay.name}
        </span>
        <span className={`text-xs hidden sm:inline ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          • {nameOfTheDay.meaning}
        </span>
      </div>
    </div>
  );
}
