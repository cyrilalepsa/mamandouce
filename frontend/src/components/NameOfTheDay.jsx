import React, { useMemo } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { frenchNames } from '../data/babyNamesFR';

export default function NameOfTheDay({ isDarkMode = false }) {
  // Sélectionner un prénom basé sur la date du jour
  const nameOfTheDay = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    
    // Combiner tous les prénoms
    const allNames = [];
    
    // Ajouter les prénoms filles
    Object.values(frenchNames.girls).forEach(letterNames => {
      letterNames.forEach(name => allNames.push({ ...name, gender: 'girls' }));
    });
    
    // Ajouter les prénoms garçons
    Object.values(frenchNames.boys).forEach(letterNames => {
      letterNames.forEach(name => allNames.push({ ...name, gender: 'boys' }));
    });
    
    // Sélectionner basé sur le jour de l'année
    const index = dayOfYear % allNames.length;
    return allNames[index];
  }, []);

  if (!nameOfTheDay) return null;

  const isGirl = nameOfTheDay.gender === 'girls';

  return (
    <div 
      className={`rounded-2xl p-4 border transition-all ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' 
          : isGirl 
            ? 'bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200' 
            : 'bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200'
      }`}
      data-testid="name-of-the-day"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${
              isDarkMode ? 'text-yellow-400' : isGirl ? 'text-pink-500' : 'text-blue-500'
            }`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${
              isDarkMode ? 'text-slate-400' : isGirl ? 'text-pink-600' : 'text-blue-600'
            }`}>
              Prénom du jour
            </span>
          </div>
          
          <h3 className={`text-2xl font-bold mb-1 ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {isGirl ? '👧' : '👦'} {nameOfTheDay.name}
          </h3>
          
          <p className={`text-sm mb-2 ${
            isDarkMode ? 'text-pink-300' : isGirl ? 'text-pink-600' : 'text-blue-600'
          }`}>
            ✨ {nameOfTheDay.meaning}
          </p>
          
          <p className={`text-xs italic ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {nameOfTheDay.personality}
          </p>
        </div>
        
        <div className={`p-2 rounded-full ${
          isDarkMode 
            ? 'bg-slate-700' 
            : isGirl ? 'bg-pink-100' : 'bg-blue-100'
        }`}>
          <Heart className={`w-5 h-5 ${
            isDarkMode ? 'text-pink-400' : isGirl ? 'text-pink-500' : 'text-blue-500'
          }`} />
        </div>
      </div>
    </div>
  );
}
