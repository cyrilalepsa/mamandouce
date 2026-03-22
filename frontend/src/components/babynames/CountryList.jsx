import React from 'react';
import { Lock, Crown, ChevronRight } from 'lucide-react';

export default function CountryList({ 
  countries,
  selectedGender,
  isPremium,
  freeCountries,
  onSelectCountry,
  onNavigateToPricing,
  isDarkMode = false 
}) {
  return (
    <div className="space-y-3">
      {countries.map((country) => {
        const isFree = freeCountries.includes(country.code);
        const isAccessible = isPremium || isFree;
        
        return (
          <button
            key={country.code}
            onClick={() => isAccessible ? onSelectCountry(country.code) : onNavigateToPricing()}
            className={`w-full ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'} rounded-xl p-4 shadow-sm border transition-all text-left ${
              !isAccessible ? 'opacity-75' : ''
            }`}
            data-testid={`country-${country.code}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{country.flag}</span>
              <span className={`font-medium flex-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {country.name}
              </span>
              {!isAccessible && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Lock className="w-4 h-4" />
                  <Crown className="w-4 h-4" />
                </div>
              )}
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
