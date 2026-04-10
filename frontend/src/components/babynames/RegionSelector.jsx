import React from 'react';
import { ChevronRight } from 'lucide-react';

const regions = [
  { 
    id: 'europe', 
    name: 'Europe', 
    emoji: '🌍',
    gradient: 'from-white/95 via-sky-100/70 to-blue-100/50',
    darkGradient: 'from-blue-900/20 to-indigo-900/20',
    borderColor: 'border-sky-200/50',
    iconColor: 'text-sky-600'
  },
  { 
    id: 'america', 
    name: 'Amérique', 
    emoji: '🌎',
    gradient: 'from-white/95 via-emerald-100/70 to-green-100/50',
    darkGradient: 'from-emerald-900/20 to-teal-900/20',
    borderColor: 'border-emerald-200/50',
    iconColor: 'text-emerald-600'
  },
  { 
    id: 'asia', 
    name: 'Asie', 
    emoji: '🌏',
    gradient: 'from-white/95 via-amber-100/70 to-yellow-100/50',
    darkGradient: 'from-amber-900/20 to-orange-900/20',
    borderColor: 'border-amber-200/50',
    iconColor: 'text-amber-600'
  },
  { 
    id: 'africa', 
    name: 'Afrique', 
    emoji: '🌍',
    gradient: 'from-white/95 via-rose-100/70 to-pink-100/50',
    darkGradient: 'from-rose-900/20 to-pink-900/20',
    borderColor: 'border-rose-200/50',
    iconColor: 'text-rose-600'
  }
];

export default function RegionSelector({ 
  selectedGender, 
  onSelectRegion,
  isDarkMode = false 
}) {
  const genderText = selectedGender === 'girls' ? 'fille' : 'garçon';

  return (
    <div className="space-y-3">
      <p className={`text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        Choisissez une région pour découvrir des prénoms de {genderText}
      </p>
      <div className="grid gap-2">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => onSelectRegion(region.id)}
            className={`w-full bg-gradient-to-br ${isDarkMode ? region.darkGradient : region.gradient} rounded-xl p-3 border ${isDarkMode ? 'border-slate-700' : region.borderColor} shadow-sm hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] text-left backdrop-blur-sm`}
            data-testid={`region-${region.id}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{region.emoji}</span>
              <div className="flex-1">
                <h3 className={`text-base font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  {region.name}
                </h3>
              </div>
              <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : region.iconColor}`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { regions };
