import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Baby, Crown, Lock, ChevronDown, ChevronRight, Heart, User, Sparkles, Star, Trash2, Search, X, FileDown } from 'lucide-react';
import { useSubscription } from '../components/SubscriptionGate';
import { 
  countries, 
  babyNamesData, 
  freeCountries, 
  freeLetters, 
  alphabet,
  isContentFree,
  getAllCountries
} from '../data/babyNames';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

export default function BabyNamesPage() {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [selectedGender, setSelectedGender] = useState(null); // 'girls', 'boys', 'favorites' ou 'search'
  const [selectedRegion, setSelectedRegion] = useState(null); // 'europe' ou 'america'
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('babyNamesFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Sauvegarder les favoris
  const toggleFavorite = (name, country, gender) => {
    const key = `${name}-${country}-${gender}`;
    const newFavorites = favorites.includes(key) 
      ? favorites.filter(f => f !== key)
      : [...favorites, key];
    setFavorites(newFavorites);
    localStorage.setItem('babyNamesFavorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (name, country, gender) => {
    return favorites.includes(`${name}-${country}-${gender}`);
  };

  // Obtenir les détails d'un prénom favori
  const getFavoriteDetails = (favoriteKey) => {
    const [name, countryCode, gender] = favoriteKey.split('-');
    const countryData = babyNamesData[countryCode];
    if (!countryData) return null;
    
    const genderData = countryData[gender];
    if (!genderData) return null;
    
    // Chercher le prénom dans toutes les lettres
    for (const letter of alphabet) {
      const names = genderData[letter] || [];
      const found = names.find(n => n.name === name);
      if (found) {
        const allCountries = getAllCountries();
        const country = allCountries.find(c => c.code === countryCode);
        return { ...found, country, gender, countryCode };
      }
    }
    return null;
  };

  // Retour en arrière dans la navigation
  const goBack = () => {
    if (selectedCountry) {
      setSelectedCountry(null);
    } else if (selectedRegion) {
      setSelectedRegion(null);
    } else if (selectedGender) {
      setSelectedGender(null);
    } else {
      navigate('/');
    }
  };

  // Obtenir le titre actuel
  const getTitle = () => {
    if (selectedGender === 'favorites') {
      return '❤️ Mes Favoris';
    }
    if (selectedGender === 'search') {
      return '🔍 Recherche';
    }
    if (selectedCountry) {
      const allCountries = [...countries.europe, ...countries.america];
      const country = allCountries.find(c => c.code === selectedCountry);
      return `${country?.flag} ${country?.name}`;
    }
    if (selectedRegion) {
      return selectedRegion === 'europe' ? '🌍 Europe' : '🌎 Amérique';
    }
    if (selectedGender) {
      return selectedGender === 'girls' ? '👧 Prénoms Filles' : '👦 Prénoms Garçons';
    }
    return '👶 Liste des Prénoms';
  };

  // Fonction de recherche globale
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
              const isFree = isContentFree(countryCode, letter);
              const isAccessible = isPremium || isFree;
              results.push({
                ...nameData,
                country,
                countryCode,
                gender,
                letter,
                isAccessible
              });
            }
          });
        });
      });
    });

    return results.slice(0, 50); // Limiter à 50 résultats
  }, [searchQuery, isPremium]);

  // Export PDF des favoris
  const exportFavoritesPDF = () => {
    const girlsFavorites = favorites.filter(f => f.endsWith('-girls'));
    const boysFavorites = favorites.filter(f => f.endsWith('-boys'));

    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Mes Prénoms Favoris - MamanDouce</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #ec4899; text-align: center; border-bottom: 2px solid #ec4899; padding-bottom: 10px; }
          h2 { color: #6b7280; margin-top: 30px; }
          .name-card { background: #fdf2f8; border-radius: 10px; padding: 15px; margin: 10px 0; }
          .name-title { font-size: 18px; font-weight: bold; color: #1e293b; }
          .name-country { font-size: 12px; color: #64748b; margin-left: 10px; }
          .name-meaning { font-size: 14px; color: #475569; margin-top: 8px; }
          .name-personality { font-size: 13px; color: #64748b; margin-top: 5px; font-style: italic; }
          .boys .name-card { background: #eff6ff; }
          .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>❤️ Mes Prénoms Favoris</h1>
    `;

    if (girlsFavorites.length > 0) {
      content += '<div class="girls"><h2>👧 Prénoms Filles</h2>';
      girlsFavorites.forEach(fav => {
        const details = getFavoriteDetails(fav);
        if (details) {
          content += `
            <div class="name-card">
              <span class="name-title">${details.name}</span>
              <span class="name-country">${details.country?.flag} ${details.country?.name}</span>
              <div class="name-meaning"><strong>Signification:</strong> ${details.meaning}</div>
              <div class="name-personality"><strong>Personnalité:</strong> ${details.personality}</div>
            </div>
          `;
        }
      });
      content += '</div>';
    }

    if (boysFavorites.length > 0) {
      content += '<div class="boys"><h2>👦 Prénoms Garçons</h2>';
      boysFavorites.forEach(fav => {
        const details = getFavoriteDetails(fav);
        if (details) {
          content += `
            <div class="name-card">
              <span class="name-title">${details.name}</span>
              <span class="name-country">${details.country?.flag} ${details.country?.name}</span>
              <div class="name-meaning"><strong>Signification:</strong> ${details.meaning}</div>
              <div class="name-personality"><strong>Personnalité:</strong> ${details.personality}</div>
            </div>
          `;
        }
      });
      content += '</div>';
    }

    content += `
        <div class="footer">
          <p>Généré par MamanDouce - ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mes-prenoms-favoris.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Rendu de la sélection du genre
  const renderGenderSelection = () => (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un prénom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          data-testid="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* Résultats de recherche */}
      {searchQuery.length >= 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-100">
            <p className="text-sm text-slate-600">
              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour "{searchQuery}"
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="p-4 text-center text-slate-500">Aucun prénom trouvé</p>
            ) : (
              searchResults.map((result, idx) => (
                <SearchResultCard
                  key={`${result.name}-${result.countryCode}-${result.gender}-${idx}`}
                  result={result}
                  isFavorite={isFavorite(result.name, result.countryCode, result.gender)}
                  onToggleFavorite={() => toggleFavorite(result.name, result.countryCode, result.gender)}
                  onNavigate={() => {
                    if (result.isAccessible) {
                      setSearchQuery('');
                    } else {
                      navigate('/pricing');
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Contenu principal (masqué si recherche active) */}
      {searchQuery.length < 2 && (
        <>
          <p className="text-slate-600 text-center mb-2">
            Découvrez notre collection de prénoms du monde entier avec leur signification et personnalité.
          </p>
      
          {/* Carte Favoris */}
          {favorites.length > 0 && (
            <button
              onClick={() => setSelectedGender('favorites')}
              className="w-full bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-5 shadow-lg border border-red-200 hover:shadow-xl transition-all hover:-translate-y-1 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-rose-400 rounded-2xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white fill-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-700">Mes Favoris</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{favorites.length} prénom{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-red-400" />
              </div>
            </button>
          )}

          {/* Carte Filles */}
          <button
            onClick={() => setSelectedGender('girls')}
            className="w-full bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 shadow-lg border border-pink-200 hover:shadow-xl transition-all hover:-translate-y-1 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">👧</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-700">Prénoms Filles</h3>
                <p className="text-sm text-slate-500 mt-1">Découvrez des centaines de prénoms féminins</p>
              </div>
              <ChevronRight className="w-6 h-6 text-pink-400" />
            </div>
          </button>

          {/* Carte Garçons */}
          <button
            onClick={() => setSelectedGender('boys')}
            className="w-full bg-gradient-to-r from-blue-100 to-sky-100 rounded-2xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-all hover:-translate-y-1 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-sky-400 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">👦</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-700">Prénoms Garçons</h3>
                <p className="text-sm text-slate-500 mt-1">Découvrez des centaines de prénoms masculins</p>
              </div>
              <ChevronRight className="w-6 h-6 text-blue-400" />
            </div>
          </button>
        </>
      )}

      {/* Info Premium */}
      {!isPremium && searchQuery.length < 2 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">Version gratuite</p>
              <p className="text-xs text-amber-600 mt-1">
                Accès limité à 3 pays (France, États-Unis, Espagne) et aux lettres A-E. 
                Passez à Premium pour un accès complet !
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-800"
              >
                Voir les offres Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Composant pour les résultats de recherche
  const SearchResultCard = ({ result, isFavorite, onToggleFavorite, onNavigate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const bgColor = result.gender === 'girls' ? 'bg-pink-50' : 'bg-blue-50';
    const borderColor = result.gender === 'girls' ? 'border-pink-100' : 'border-blue-100';
    const iconColor = result.gender === 'girls' ? 'text-pink-400' : 'text-blue-400';
    const genderEmoji = result.gender === 'girls' ? '👧' : '👦';

    return (
      <div className={`${bgColor} ${borderColor} border-b last:border-b-0`}>
        <button
          onClick={() => result.isAccessible ? setIsExpanded(!isExpanded) : onNavigate()}
          className="w-full p-3 flex items-center gap-3 text-left"
        >
          <span className="text-lg">{genderEmoji}</span>
          <div className="flex-1">
            <span className="font-semibold text-slate-700">{result.name}</span>
            <span className="ml-2 text-xs text-slate-400">
              {result.country?.flag} {result.country?.name}
            </span>
          </div>
          {!result.isAccessible ? (
            <div className="flex items-center gap-1 text-amber-500">
              <Lock className="w-4 h-4" />
              <Crown className="w-4 h-4" />
            </div>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="p-1"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-300 hover:text-red-300'
                  }`} 
                />
              </button>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
        
        {isExpanded && result.isAccessible && (
          <div className="px-3 pb-3 space-y-2">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Signification
              </p>
              <p className="text-sm text-slate-700">{result.meaning}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Personnalité
              </p>
              <p className="text-sm text-slate-700">{result.personality}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Rendu de la sélection de région
  const renderRegionSelection = () => (
    <div className="space-y-4">
      {/* Europe */}
      <button
        onClick={() => setSelectedRegion('europe')}
        className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 shadow-lg border border-indigo-100 hover:shadow-xl transition-all hover:-translate-y-1 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🌍</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-700">Europe</h3>
            <p className="text-sm text-slate-500">{countries.europe.length} pays</p>
          </div>
          <ChevronRight className="w-5 h-5 text-indigo-400" />
        </div>
      </button>

      {/* Amérique */}
      <button
        onClick={() => setSelectedRegion('america')}
        className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 shadow-lg border border-emerald-100 hover:shadow-xl transition-all hover:-translate-y-1 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🌎</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-700">Amérique</h3>
            <p className="text-sm text-slate-500">{countries.america.length} pays</p>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-400" />
        </div>
      </button>
    </div>
  );

  // Rendu de la liste des pays
  const renderCountryList = () => {
    const countryList = selectedRegion === 'europe' ? countries.europe : countries.america;
    
    return (
      <div className="space-y-2">
        {countryList.map((country) => {
          const isAvailable = isPremium || freeCountries.includes(country.code);
          const hasData = babyNamesData[country.code];
          
          return (
            <button
              key={country.code}
              onClick={() => {
                if (isAvailable && hasData) {
                  setSelectedCountry(country.code);
                } else if (!isAvailable) {
                  navigate('/pricing');
                }
              }}
              disabled={!hasData}
              className={`w-full rounded-xl p-4 shadow-sm border transition-all text-left flex items-center gap-3 ${
                !hasData 
                  ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                  : isAvailable 
                    ? 'bg-white border-slate-100 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' 
                    : 'bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100'
              }`}
            >
              <span className="text-2xl">{country.flag}</span>
              <span className="flex-1 font-medium text-slate-700">{country.name}</span>
              {!hasData ? (
                <span className="text-xs text-slate-400">Bientôt</span>
              ) : !isAvailable ? (
                <div className="flex items-center gap-1 text-amber-500">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs font-medium">Premium</span>
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Rendu des prénoms par lettre pour un pays
  const renderNamesByLetter = () => {
    const countryData = babyNamesData[selectedCountry];
    if (!countryData) return <p className="text-slate-500 text-center">Données non disponibles</p>;

    const genderData = countryData[selectedGender];
    if (!genderData) return <p className="text-slate-500 text-center">Données non disponibles</p>;

    const genderColor = selectedGender === 'girls' ? 'pink' : 'blue';
    const gradientFrom = selectedGender === 'girls' ? 'from-pink-500' : 'from-blue-500';
    const gradientTo = selectedGender === 'girls' ? 'to-rose-500' : 'to-sky-500';

    return (
      <div className="space-y-2">
        <Accordion type="multiple" className="space-y-2">
          {alphabet.map((letter) => {
            const names = genderData[letter] || [];
            const isFree = isContentFree(selectedCountry, letter);
            const isAccessible = isPremium || isFree;

            if (names.length === 0) return null;

            return (
              <AccordionItem 
                key={letter} 
                value={letter}
                className={`border rounded-xl overflow-hidden ${
                  isAccessible ? 'border-slate-200' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <AccordionTrigger 
                  className={`px-4 py-3 hover:no-underline ${
                    isAccessible ? 'hover:bg-slate-50' : 'cursor-pointer'
                  }`}
                  onClick={(e) => {
                    if (!isAccessible) {
                      e.preventDefault();
                      navigate('/pricing');
                    }
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
                      {letter}
                    </div>
                    <span className="font-medium text-slate-700">
                      {names.length} prénom{names.length > 1 ? 's' : ''}
                    </span>
                    {!isAccessible && (
                      <div className="ml-auto flex items-center gap-1 text-amber-500 mr-2">
                        <Lock className="w-4 h-4" />
                        <Crown className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                {isAccessible && (
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {names.map((nameData, idx) => (
                        <NameCard 
                          key={idx}
                          nameData={nameData}
                          gender={selectedGender}
                          country={selectedCountry}
                          isFavorite={isFavorite(nameData.name, selectedCountry, selectedGender)}
                          onToggleFavorite={() => toggleFavorite(nameData.name, selectedCountry, selectedGender)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>

        {!isPremium && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  Débloquez toutes les lettres (F-Z)
                </p>
                <p className="text-xs text-amber-600">
                  Plus de 500 prénoms supplémentaires !
                </p>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
              >
                Premium
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Composant carte de prénom
  const NameCard = ({ nameData, gender, country, isFavorite, onToggleFavorite }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const bgColor = gender === 'girls' ? 'bg-pink-50' : 'bg-blue-50';
    const borderColor = gender === 'girls' ? 'border-pink-100' : 'border-blue-100';
    const iconColor = gender === 'girls' ? 'text-pink-400' : 'text-blue-400';

    return (
      <div className={`${bgColor} ${borderColor} border rounded-xl overflow-hidden`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center gap-3 text-left"
        >
          <User className={`w-5 h-5 ${iconColor}`} />
          <span className="font-semibold text-slate-700 flex-1">{nameData.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-1"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-300 hover:text-red-300'
              }`} 
            />
          </button>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isExpanded && (
          <div className="px-3 pb-3 space-y-2">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Signification
              </p>
              <p className="text-sm text-slate-700">{nameData.meaning}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Personnalité
              </p>
              <p className="text-sm text-slate-700">{nameData.personality}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Rendu de la section Favoris avec catégories Filles/Garçons
  const renderFavorites = () => {
    const girlsFavorites = favorites.filter(f => f.endsWith('-girls'));
    const boysFavorites = favorites.filter(f => f.endsWith('-boys'));

    const renderFavoriteCard = (favoriteKey) => {
      const details = getFavoriteDetails(favoriteKey);
      if (!details) return null;

      const bgColor = details.gender === 'girls' ? 'bg-pink-50' : 'bg-blue-50';
      const borderColor = details.gender === 'girls' ? 'border-pink-100' : 'border-blue-100';
      const iconColor = details.gender === 'girls' ? 'text-pink-400' : 'text-blue-400';

      return (
        <FavoriteNameCard
          key={favoriteKey}
          nameData={details}
          gender={details.gender}
          country={details.country}
          onRemove={() => toggleFavorite(details.name, details.countryCode, details.gender)}
        />
      );
    };

    return (
      <div className="space-y-6">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">Aucun prénom en favori</p>
            <p className="text-sm text-slate-400 mt-2">
              Explorez les prénoms et cliquez sur ❤️ pour les sauvegarder
            </p>
          </div>
        ) : (
          <>
            {/* Bouton d'export */}
            <button
              onClick={exportFavoritesPDF}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl py-3 px-4 font-medium shadow-lg hover:shadow-xl transition-all"
              data-testid="export-favorites-btn"
            >
              <FileDown className="w-5 h-5" />
              Télécharger mes favoris
            </button>

            {/* Section Filles */}
            {girlsFavorites.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-3">
                  <span className="text-xl">👧</span>
                  Prénoms Filles
                  <span className="ml-auto text-sm font-normal text-pink-500">
                    {girlsFavorites.length} favori{girlsFavorites.length > 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="space-y-2">
                  {girlsFavorites.map(renderFavoriteCard)}
                </div>
              </div>
            )}

            {/* Section Garçons */}
            {boysFavorites.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-3">
                  <span className="text-xl">👦</span>
                  Prénoms Garçons
                  <span className="ml-auto text-sm font-normal text-blue-500">
                    {boysFavorites.length} favori{boysFavorites.length > 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="space-y-2">
                  {boysFavorites.map(renderFavoriteCard)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Composant carte de prénom favori (avec bouton supprimer)
  const FavoriteNameCard = ({ nameData, gender, country, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const bgColor = gender === 'girls' ? 'bg-pink-50' : 'bg-blue-50';
    const borderColor = gender === 'girls' ? 'border-pink-100' : 'border-blue-100';
    const iconColor = gender === 'girls' ? 'text-pink-400' : 'text-blue-400';

    return (
      <div className={`${bgColor} ${borderColor} border rounded-xl overflow-hidden`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center gap-3 text-left"
        >
          <User className={`w-5 h-5 ${iconColor}`} />
          <div className="flex-1">
            <span className="font-semibold text-slate-700">{nameData.name}</span>
            {country && (
              <span className="ml-2 text-xs text-slate-400">
                {country.flag} {country.name}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 hover:bg-red-100 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
          </button>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isExpanded && (
          <div className="px-3 pb-3 space-y-2">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Signification
              </p>
              <p className="text-sm text-slate-700">{nameData.meaning}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Personnalité
              </p>
              <p className="text-sm text-slate-700">{nameData.personality}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Déterminer le contenu à afficher
  const renderContent = () => {
    if (!selectedGender) return renderGenderSelection();
    if (selectedGender === 'favorites') return renderFavorites();
    if (!selectedRegion) return renderRegionSelection();
    if (!selectedCountry) return renderCountryList();
    return renderNamesByLetter();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {getTitle()}
              </h1>
              {selectedGender && selectedGender !== 'favorites' && !selectedCountry && (
                <p className="text-xs text-slate-500">
                  {selectedGender === 'girls' ? 'Prénoms féminins' : 'Prénoms masculins'}
                </p>
              )}
              {selectedGender === 'favorites' && (
                <p className="text-xs text-slate-500">
                  Vos prénoms préférés
                </p>
              )}
            </div>
            {isPremium && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full">
                <Crown className="w-3 h-3" />
                <span className="text-xs font-bold">Premium</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
}
