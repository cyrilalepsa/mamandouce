import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Lock, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useSubscription } from '../components/SubscriptionGate';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import api from '../utils/api';
import { 
  babyNamesData, 
  freeCountries, 
  freeLetters, 
  alphabet,
  isContentFree,
  getAllCountries
} from '../data/babyNames';
import { 
  NameFilters, 
  filterNames, 
  SearchResultCard,
  FavoriteNameCard,
  RegionSelector,
  GenderSelector,
  CountryList,
  ExpandableNameCard,
  PopularityStats
} from '../components/babynames';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

// Pays par région
const countriesByRegion = {
  europe: ['FR', 'ES', 'IT', 'DE', 'GB', 'PT', 'BE', 'CH', 'NL', 'PL', 'IE', 'GR', 'RU', 'SE', 'NO', 'UA', 'FI', 'DK'],
  america: ['US', 'BR', 'CA', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE'],
  asia: ['JP'],
  africa: ['MA']
};

export default function BabyNamesPage() {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const { isDarkMode } = useTheme();
  
  // États de navigation
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Favoris
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('babyNamesFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Filtres avancés
  const [filters, setFilters] = useState({ length: '', ending: '', origin: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // Sync cloud
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(() => {
    return localStorage.getItem('cloudSyncEnabled') === 'true';
  });

  // Charger les favoris depuis le cloud
  useEffect(() => {
    if (cloudSyncEnabled) loadFromCloud();
  }, [cloudSyncEnabled]);

  const loadFromCloud = async () => {
    try {
      setIsSyncing(true);
      const response = await api.favorites.get();
      if (response.data.favorites?.length > 0) {
        const merged = [...new Set([...response.data.favorites, ...favorites])];
        setFavorites(merged);
        localStorage.setItem('babyNamesFavorites', JSON.stringify(merged));
        toast.success('Favoris synchronisés');
      }
    } catch (err) {
      console.error('Erreur sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveToCloud = async (newFavorites) => {
    if (!cloudSyncEnabled) return;
    try {
      setIsSyncing(true);
      await api.favorites.sync(newFavorites);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleCloudSync = () => {
    const newValue = !cloudSyncEnabled;
    setCloudSyncEnabled(newValue);
    localStorage.setItem('cloudSyncEnabled', newValue.toString());
    if (newValue) {
      loadFromCloud();
      toast.success('Sync cloud activée');
    } else {
      toast.info('Sync cloud désactivée');
    }
  };

  // Gestion des favoris
  const toggleFavorite = (name, country, gender) => {
    const key = `${name}-${country}-${gender}`;
    const newFavorites = favorites.includes(key) 
      ? favorites.filter(f => f !== key)
      : [...favorites, key];
    setFavorites(newFavorites);
    localStorage.setItem('babyNamesFavorites', JSON.stringify(newFavorites));
    saveToCloud(newFavorites);
  };

  const isFavorite = (name, country, gender) => favorites.includes(`${name}-${country}-${gender}`);

  const getFavoriteDetails = (favoriteKey) => {
    const [name, countryCode, gender] = favoriteKey.split('-');
    const countryData = babyNamesData[countryCode];
    if (!countryData?.[gender]) return null;
    
    for (const letter of alphabet) {
      const found = (countryData[gender][letter] || []).find(n => n.name === name);
      if (found) {
        const allCountries = getAllCountries();
        return { ...found, countryCode, gender, country: allCountries.find(c => c.code === countryCode) };
      }
    }
    return null;
  };

  // Navigation
  const goBack = () => {
    if (selectedCountry) setSelectedCountry(null);
    else if (selectedRegion) setSelectedRegion(null);
    else if (selectedGender) setSelectedGender(null);
    else navigate('/');
  };

  const getTitle = () => {
    if (selectedGender === 'favorites') return '❤️ Mes Favoris';
    if (selectedCountry) {
      const country = getAllCountries().find(c => c.code === selectedCountry);
      return `${country?.flag} ${country?.name}`;
    }
    if (selectedRegion) {
      const names = { europe: '🌍 Europe', america: '🌎 Amérique', asia: '🌏 Asie', africa: '🌍 Afrique' };
      return names[selectedRegion];
    }
    if (selectedGender) return selectedGender === 'girls' ? '👧 Prénoms Filles' : '👦 Prénoms Garçons';
    return '👶 Liste des Prénoms';
  };

  // Recherche globale
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const results = [];
    const allCountries = getAllCountries();

    Object.entries(babyNamesData).forEach(([countryCode, countryData]) => {
      const country = allCountries.find(c => c.code === countryCode);
      ['girls', 'boys'].forEach(gender => {
        if (!countryData[gender]) return;
        Object.entries(countryData[gender]).forEach(([letter, names]) => {
          names.forEach(nameData => {
            const normalizedName = nameData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (normalizedName.includes(query)) {
              results.push({
                ...nameData, country, countryCode, gender, letter,
                isAccessible: isPremium || isContentFree(countryCode, letter)
              });
            }
          });
        });
      });
    });
    return results.slice(0, 50);
  }, [searchQuery, isPremium]);

  // Partage
  const shareIndividualName = async (nameData, gender, countryInfo) => {
    const genderEmoji = gender === 'girls' ? '👧' : '👦';
    const shareText = `${genderEmoji} Prénom : ${nameData.name}\n\n${countryInfo?.flag || ''} Origine : ${countryInfo?.name || 'Internationale'}\n\n✨ Signification : ${nameData.meaning}\n\n💫 Personnalité : ${nameData.personality}\n\nDécouvert sur MamanDouce`;

    if (navigator.share) {
      try { await navigator.share({ title: `Prénom: ${nameData.name}`, text: shareText }); }
      catch (err) { if (err.name !== 'AbortError') console.error('Erreur partage:', err); }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Prénom copié !');
      } catch { toast.error('Impossible de copier'); }
    }
  };

  // Rendu des prénoms par lettre
  const renderNamesByLetter = () => {
    const countryData = babyNamesData[selectedCountry];
    if (!countryData?.[selectedGender]) return <p className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Données non disponibles</p>;

    const genderData = countryData[selectedGender];
    const gradientFrom = selectedGender === 'girls' ? 'from-pink-500' : 'from-blue-500';
    const gradientTo = selectedGender === 'girls' ? 'to-rose-500' : 'to-sky-500';

    return (
      <div className="space-y-4">
        <NameFilters filters={filters} setFilters={setFilters} isOpen={showFilters} setIsOpen={setShowFilters} isDarkMode={isDarkMode} />
        
        <Accordion type="multiple" className="space-y-2">
          {alphabet.map((letter) => {
            let names = genderData[letter] || [];
            if (filters.length || filters.ending || filters.origin) names = filterNames(names, filters);
            
            const isFree = isContentFree(selectedCountry, letter);
            const isAccessible = isPremium || isFree;
            if (names.length === 0) return null;

            return (
              <AccordionItem key={letter} value={letter} className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} ${!isAccessible ? isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50' : ''}`}>
                <AccordionTrigger 
                  className={`px-4 py-3 hover:no-underline ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                  onClick={(e) => { if (!isAccessible) { e.preventDefault(); navigate('/pricing'); } }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>{letter}</div>
                    <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{names.length} prénom{names.length > 1 ? 's' : ''}</span>
                    {!isAccessible && <div className="ml-auto flex items-center gap-1 text-amber-500 mr-2"><Lock className="w-4 h-4" /><Crown className="w-4 h-4" /></div>}
                  </div>
                </AccordionTrigger>
                {isAccessible && (
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {names.map((nameData, idx) => {
                        const countryInfo = getAllCountries().find(c => c.code === selectedCountry);
                        return (
                          <ExpandableNameCard
                            key={idx}
                            nameData={nameData}
                            gender={selectedGender}
                            country={selectedCountry}
                            countryInfo={countryInfo}
                            isFavorite={isFavorite(nameData.name, selectedCountry, selectedGender)}
                            onToggleFavorite={() => toggleFavorite(nameData.name, selectedCountry, selectedGender)}
                            onShare={() => shareIndividualName(nameData, selectedGender, countryInfo)}
                            isDarkMode={isDarkMode}
                          />
                        );
                      })}
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>

        {!isPremium && (
          <div className={`mt-6 ${isDarkMode ? 'bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-800' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'} border rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-amber-500" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Débloquez toutes les lettres (F-Z)</p>
                <p className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Plus de 500 prénoms supplémentaires !</p>
              </div>
              <button onClick={() => navigate('/pricing')} className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all">Premium</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Rendu des favoris
  const renderFavorites = () => {
    const girlsFavorites = favorites.filter(f => f.endsWith('-girls'));
    const boysFavorites = favorites.filter(f => f.endsWith('-boys'));

    if (favorites.length === 0) {
      return (
        <div className="text-center py-12">
          <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-2`}>Aucun favori</p>
          <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Ajoutez des prénoms en cliquant sur le cœur</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {girlsFavorites.length > 0 && (
          <div>
            <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>
              <span>👧</span> Prénoms Filles ({girlsFavorites.length})
            </h3>
            <div className="space-y-2">
              {girlsFavorites.map(fav => {
                const details = getFavoriteDetails(fav);
                if (!details) return null;
                return (
                  <FavoriteNameCard
                    key={fav}
                    nameData={details}
                    gender="girls"
                    country={details.country}
                    onRemove={() => toggleFavorite(details.name, details.countryCode, 'girls')}
                    onShare={shareIndividualName}
                    isDarkMode={isDarkMode}
                  />
                );
              })}
            </div>
          </div>
        )}
        
        {boysFavorites.length > 0 && (
          <div>
            <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              <span>👦</span> Prénoms Garçons ({boysFavorites.length})
            </h3>
            <div className="space-y-2">
              {boysFavorites.map(fav => {
                const details = getFavoriteDetails(fav);
                if (!details) return null;
                return (
                  <FavoriteNameCard
                    key={fav}
                    nameData={details}
                    gender="boys"
                    country={details.country}
                    onRemove={() => toggleFavorite(details.name, details.countryCode, 'boys')}
                    onShare={shareIndividualName}
                    isDarkMode={isDarkMode}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Rendu de la liste des pays
  const renderCountryList = () => {
    const regionCountries = countriesByRegion[selectedRegion] || [];
    const allCountries = getAllCountries();
    const countries = regionCountries.map(code => allCountries.find(c => c.code === code)).filter(Boolean);

    return (
      <CountryList
        countries={countries}
        selectedGender={selectedGender}
        isPremium={isPremium}
        freeCountries={freeCountries}
        onSelectCountry={setSelectedCountry}
        onNavigateToPricing={() => navigate('/pricing')}
        isDarkMode={isDarkMode}
      />
    );
  };

  // Contenu principal
  const renderContent = () => {
    if (!selectedGender) {
      return (
        <GenderSelector
          favorites={favorites}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          onSelectGender={setSelectedGender}
          onSelectFavorites={() => setSelectedGender('favorites')}
          renderSearchResultCard={(result, idx) => (
            <SearchResultCard
              key={`${result.name}-${result.countryCode}-${result.gender}-${idx}`}
              result={result}
              isFavorite={isFavorite(result.name, result.countryCode, result.gender)}
              onToggleFavorite={() => toggleFavorite(result.name, result.countryCode, result.gender)}
              onNavigate={() => result.isAccessible ? setSearchQuery('') : navigate('/pricing')}
              isDarkMode={isDarkMode}
            />
          )}
          isDarkMode={isDarkMode}
        />
      );
    }
    if (selectedGender === 'favorites') return renderFavorites();
    if (!selectedRegion) return <RegionSelector selectedGender={selectedGender} onSelectRegion={setSelectedRegion} isDarkMode={isDarkMode} />;
    if (!selectedCountry) return renderCountryList();
    return renderNamesByLetter();
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-lg border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className={`p-2 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded-full transition-colors`} data-testid="back-button">
              <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
            </button>
            <div className="flex-1">
              <h1 className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontFamily: 'Nunito, sans-serif' }}>{getTitle()}</h1>
              {selectedGender && selectedGender !== 'favorites' && !selectedCountry && (
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedGender === 'girls' ? 'Prénoms féminins' : 'Prénoms masculins'}</p>
              )}
            </div>
            
            <button
              onClick={toggleCloudSync}
              className={`p-2 rounded-full transition-colors ${cloudSyncEnabled ? isDarkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
              title={cloudSyncEnabled ? 'Sync activée' : 'Activer sync'}
              data-testid="cloud-sync-toggle"
            >
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : cloudSyncEnabled ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
            </button>
            
            {isPremium && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full">
                <Crown className="w-3 h-3" /><span className="text-xs font-bold">Premium</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-lg mx-auto px-4 py-6">{renderContent()}</div>
    </div>
  );
}
