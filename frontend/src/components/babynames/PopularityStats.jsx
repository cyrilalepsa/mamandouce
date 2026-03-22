import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, ChevronDown, ChevronUp, Flame, Sparkles, Heart } from 'lucide-react';
import api from '../../utils/api';
import { babyNamesData } from '../../data/babyNames';

export default function PopularityStats({ 
  isDarkMode = false 
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('girls'); // 'girls' or 'boys'
  const [expandedName, setExpandedName] = useState(null); // Track which name is expanded

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.nameStats.getTop(10);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Find name details from babyNamesData
  const getNameDetails = (name, country, gender) => {
    const countryData = babyNamesData[country];
    if (!countryData) return null;
    
    const genderKey = gender === 'girls' ? 'girls' : 'boys';
    const genderData = countryData[genderKey];
    if (!genderData) return null;
    
    // Search through all letters
    for (const letter in genderData) {
      const names = genderData[letter];
      if (Array.isArray(names)) {
        const found = names.find(n => n.name.toLowerCase() === name.toLowerCase());
        if (found) return found;
      }
    }
    return null;
  };

  const toggleExpand = (nameKey) => {
    setExpandedName(expandedName === nameKey ? null : nameKey);
  };

  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl p-4 border animate-pulse`}>
        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || (stats.top_girls.length === 0 && stats.top_boys.length === 0)) {
    return null; // Don't show if no data
  }

  const currentList = activeTab === 'girls' ? stats.top_girls : stats.top_boys;

  return (
    <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'} rounded-2xl p-4 border`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-violet-900/50' : 'bg-violet-100'}`}>
            <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
          </div>
          <div>
            <h3 className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              Top 10 Prénoms
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Les plus consultés
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
          <Eye className={`w-3 h-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {stats.total_views.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 mb-4 p-1 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white/50'}`}>
        <button
          onClick={() => setActiveTab('girls')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'girls'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          👧 Filles
        </button>
        <button
          onClick={() => setActiveTab('boys')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'boys'
              ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-md'
              : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          👦 Garçons
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {currentList.length === 0 ? (
          <p className={`text-center py-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Pas encore de données
          </p>
        ) : (
          currentList.slice(0, 10).map((item, index) => {
            const nameKey = `${item.name}-${item.country}`;
            const isExpanded = expandedName === nameKey;
            const nameDetails = getNameDetails(item.name, item.country, activeTab);
            
            return (
              <div key={nameKey} className="overflow-hidden rounded-xl">
                {/* Header - Clickable */}
                <button
                  onClick={() => toggleExpand(nameKey)}
                  className={`w-full flex items-center gap-3 p-3 transition-all ${
                    isDarkMode 
                      ? 'bg-slate-700/50 hover:bg-slate-700' 
                      : 'bg-white/70 hover:bg-white'
                  } ${isExpanded ? (isDarkMode ? 'bg-slate-700' : 'bg-white') : ''}`}
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-400 text-white' 
                      : index === 1
                        ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
                        : index === 2
                          ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                          : isDarkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Name info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {item.name}
                      </span>
                      {index < 3 && <Flame className="w-4 h-4 text-orange-500" />}
                    </div>
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.country_flag} {item.country_name}
                    </span>
                  </div>

                  {/* Views */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    isDarkMode ? 'bg-slate-600' : 'bg-slate-100'
                  }`}>
                    <Eye className={`w-3 h-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.views}
                    </span>
                  </div>

                  {/* Expand/Collapse icon */}
                  {isExpanded ? (
                    <ChevronUp className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-500'}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  )}
                </button>

                {/* Expanded Content - Signification & Personnalité */}
                {isExpanded && (
                  <div className={`px-4 pb-4 pt-2 ${
                    isDarkMode ? 'bg-slate-700' : 'bg-white'
                  }`}>
                    {nameDetails ? (
                      <div className="space-y-3">
                        {/* Signification */}
                        <div className={`p-3 rounded-lg ${
                          isDarkMode ? 'bg-slate-600/50' : 'bg-gradient-to-r from-pink-50 to-purple-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                            <span className={`text-xs font-semibold uppercase tracking-wide ${
                              isDarkMode ? 'text-pink-400' : 'text-pink-600'
                            }`}>
                              Signification
                            </span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            {nameDetails.meaning}
                          </p>
                        </div>

                        {/* Personnalité */}
                        <div className={`p-3 rounded-lg ${
                          isDarkMode ? 'bg-slate-600/50' : 'bg-gradient-to-r from-violet-50 to-blue-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Heart className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-violet-500'}`} />
                            <span className={`text-xs font-semibold uppercase tracking-wide ${
                              isDarkMode ? 'text-violet-400' : 'text-violet-600'
                            }`}>
                              Personnalité
                            </span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            {nameDetails.personality}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Informations non disponibles pour ce prénom.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
