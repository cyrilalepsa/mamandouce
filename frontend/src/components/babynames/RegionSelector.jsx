import React from 'react';
import { ChevronRight } from 'lucide-react';

const regions = [
  { 
    id: 'europe', 
    name: 'Europe', 
    emoji: '🌍',
    gradient: 'from-blue-100 to-indigo-100',
    border: 'border-blue-200',
    darkGradient: 'from-blue-900/30 to-indigo-900/30',
    darkBorder: 'border-blue-800'
  },
  { 
    id: 'america', 
    name: 'Amérique', 
    emoji: '🌎',
    gradient: 'from-emerald-100 to-teal-100',
    border: 'border-emerald-200',
    darkGradient: 'from-emerald-900/30 to-teal-900/30',
    darkBorder: 'border-emerald-800'
  },
  { 
    id: 'asia', 
    name: 'Asie', 
    emoji: '🌏',
    gradient: 'from-amber-100 to-orange-100',
    border: 'border-amber-200',
    darkGradient: 'from-amber-900/30 to-orange-900/30',
    darkBorder: 'border-amber-800'
  },
  { 
    id: 'africa', 
    name: 'Afrique', 
    emoji: '🌍',
    gradient: 'from-rose-100 to-pink-100',
    border: 'border-rose-200',
    darkGradient: 'from-rose-900/30 to-pink-900/30',
    darkBorder: 'border-rose-800'
  }
];

export default function RegionSelector({ 
  selectedGender, 
  onSelectRegion,
  isDarkMode = false 
}) {
  const genderText = selectedGender === 'girls' ? 'fille' : 'garçon';

  return (
    <div className="space-y-4">
      <p className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        Choisissez une région pour découvrir des prénoms de {genderText}
      </p>
      <div className="grid gap-3">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => onSelectRegion(region.id)}
            className={`w-full bg-gradient-to-r ${isDarkMode ? region.darkGradient : region.gradient} rounded-xl p-4 shadow-sm border ${isDarkMode ? region.darkBorder : region.border} hover:shadow-md transition-all hover:-translate-y-0.5 text-left`}
            data-testid={`region-${region.id}`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{region.emoji}</span>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  {region.name}
                </h3>
              </div>
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { regions };
