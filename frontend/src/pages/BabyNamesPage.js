import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Baby, Crown, Lock, ChevronDown, ChevronRight, Heart, User, Sparkles } from 'lucide-react';
import { useSubscription } from '../components/SubscriptionGate';
import { 
  countries, 
  babyNamesData, 
  freeCountries, 
  freeLetters, 
  alphabet,
  isContentFree 
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
  const [selectedGender, setSelectedGender] = useState(null); // 'girls' ou 'boys'
  const [selectedRegion, setSelectedRegion] = useState(null); // 'europe' ou 'america'
  const [selectedCountry, setSelectedCountry] = useState(null);
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

  // Rendu de la sélection du genre
  const renderGenderSelection = () => (
    <div className="space-y-4">
      <p className="text-slate-600 text-center mb-6">
        Découvrez notre collection de prénoms du monde entier avec leur signification et personnalité.
      </p>
      
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

      {/* Info Premium */}
      {!isPremium && (
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

  // Déterminer le contenu à afficher
  const renderContent = () => {
    if (!selectedGender) return renderGenderSelection();
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
              {selectedGender && !selectedCountry && (
                <p className="text-xs text-slate-500">
                  {selectedGender === 'girls' ? 'Prénoms féminins' : 'Prénoms masculins'}
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
