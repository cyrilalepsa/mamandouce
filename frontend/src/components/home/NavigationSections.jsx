import { useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { Card } from '../ui/card';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, Baby, Gift, Heart, Library,
  CalendarHeart, BookHeart, ScanBarcode, Apple, 
  History, Stethoscope, Bell, 
  ClipboardList, Briefcase, Video, Youtube, Book, ChevronRight, ChevronDown, LineChart, Lock, Crown, Users, Pin, PinOff, Phone, PiggyBank, Award, HandHeart, HelpCircle
} from 'lucide-react';
import { useSubscription } from '../SubscriptionGate';
import { toast } from 'sonner';
import api from '../../utils/api';

// Styles pastel "CHAMALLOW 3D" pour les cartes - Semi-transparent avec backdrop-filter
const PASTEL_STYLES = {
  pink: {
    background: 'rgba(255, 240, 245, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  sky: {
    background: 'rgba(224, 247, 250, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  green: {
    background: 'rgba(220, 252, 231, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  purple: {
    background: 'rgba(243, 232, 255, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  amber: {
    background: 'rgba(254, 243, 199, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  red: {
    background: 'rgba(254, 226, 226, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  violet: {
    background: 'rgba(245, 243, 255, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  slate: {
    background: 'rgba(241, 245, 249, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
};

// Composant carte pastel "CHAMALLOW 3D" bombée pour mosaïques
function PastelMosaicCard({ color = 'pink', onClick, children, className = '', testId, locked = false }) {
  const style = PASTEL_STYLES[color] || PASTEL_STYLES.pink;
  return (
    <div
      onClick={onClick}
      data-testid={testId}
      className={`relative overflow-hidden rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center ${className}`}
      style={{
        background: locked ? PASTEL_STYLES.slate.background : style.background,
        boxShadow: locked ? PASTEL_STYLES.slate.boxShadow : style.boxShadow,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '20px',
        color: '#4A4A4A',
      }}
    >
      {/* Voile blanc supprimé */}
      <div className="relative" style={{ color: '#4A4A4A' }}>
        {children}
      </div>
    </div>
  );
}

// Composant carte pastel "CHAMALLOW 3D" pleine largeur (pill)
function PastelPillCard({ color = 'purple', onClick, children, className = '', testId }) {
  const style = PASTEL_STYLES[color] || PASTEL_STYLES.purple;
  return (
    <div
      onClick={onClick}
      data-testid={testId}
      className={`relative overflow-hidden rounded-full px-4 py-2.5 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${className}`}
      style={{
        background: style.background,
        boxShadow: style.boxShadow,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: '#4A4A4A',
      }}
    >
      {/* Voile blanc supprimé */}
      <div className="relative" style={{ color: '#4A4A4A' }}>
        {children}
      </div>
    </div>
  );
}

// Context pour gérer les sections épinglées
const PinnedSectionsContext = createContext({
  pinnedSections: [],
  togglePin: () => {},
  isPinned: () => false
});

export function PinnedSectionsProvider({ children }) {
  const [pinnedSections, setPinnedSections] = useState([]);

  useEffect(() => {
    // Charger les sections épinglées depuis localStorage
    const saved = localStorage.getItem('mamandouce_pinned_sections');
    if (saved) {
      setPinnedSections(JSON.parse(saved));
    }
  }, []);

  const togglePin = (sectionId) => {
    setPinnedSections(prev => {
      const newPinned = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      
      localStorage.setItem('mamandouce_pinned_sections', JSON.stringify(newPinned));
      // Les toasts sont gérés dans CollapsibleSection pour avoir accès aux traductions
      return newPinned;
    });
  };

  const isPinned = (sectionId) => pinnedSections.includes(sectionId);

  return (
    <PinnedSectionsContext.Provider value={{ pinnedSections, togglePin, isPinned }}>
      {children}
    </PinnedSectionsContext.Provider>
  );
}

export function usePinnedSections() {
  return useContext(PinnedSectionsContext);
}

// Composant réutilisable pour les sections déroulantes - exporté pour usage externe
export function CollapsibleSection({ title, icon: Icon, iconColor, children, defaultOpen = false, sectionId }) {
  const { t } = useTranslation();
  const { isPinned, togglePin } = usePinnedSections();
  const pinned = sectionId ? isPinned(sectionId) : false;
  const [isOpen, setIsOpen] = useState(defaultOpen || pinned);
  
  // Mettre à jour l'état si la section est épinglée
  useEffect(() => {
    if (pinned) {
      setIsOpen(true);
    }
  }, [pinned]);
  
  // Si title est un composant React, on l'affiche directement
  const isCustomTitle = typeof title !== 'string';
  
  const handleToggle = () => {
    // Si épinglée, on ne peut pas fermer (sauf si on désépingle)
    if (pinned && isOpen) {
      toast.info(t('home.pinnedCantClose', 'Cette section est épinglée. Cliquez sur 📌 pour la désépingler.'));
      return;
    }
    setIsOpen(!isOpen);
  };
  
  const handlePin = () => {
    const wasPinned = pinned;
    togglePin(sectionId);
    // Le message toast est géré ici au lieu du provider pour avoir accès à t()
    if (!wasPinned) {
      toast.success(t('home.sectionPinned', 'Section épinglée ! Elle restera toujours ouverte.'));
    } else {
      toast.info(t('home.sectionUnpinned', 'Section désépinglée.'));
    }
  };
  
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1">
        <button 
          onClick={handleToggle}
          className="flex-1 flex items-center justify-between py-2 group"
        >
          {isCustomTitle ? (
            <h2 className="text-base font-bold text-slate-600 flex items-center gap-2 truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {title}
              {pinned && <Pin className="w-3 h-3 text-pink-500 fill-pink-500 flex-shrink-0" />}
            </h2>
          ) : (
            <h2 className="text-base font-bold text-slate-600 flex items-center gap-2 truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {Icon && <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />}
              <span className="truncate">{title}</span>
              {pinned && <Pin className="w-3 h-3 text-pink-500 fill-pink-500 flex-shrink-0" />}
            </h2>
          )}
          <ChevronDown 
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {/* Bouton épingler */}
        {sectionId && (
          <button
            onClick={handlePin}
            className={`p-1.5 transition-all hover:scale-110 flex-shrink-0 ${
              pinned 
                ? 'text-pink-600' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title={pinned ? t('home.unpinSection', 'Désépingler cette section') : t('home.pinSection', 'Épingler cette section (toujours ouverte)')}
          >
            {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pt-2">
          {children}
          
          {/* Bouton fermer en bas */}
          <button
            onClick={() => {
              if (pinned) {
                toast.info(t('home.pinnedCantClose', 'Cette section est épinglée. Cliquez sur 📌 pour la désépingler.'));
                return;
              }
              setIsOpen(false);
            }}
            className={`w-full mt-3 p-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
              pinned 
                ? 'bg-pink-50 text-pink-400 cursor-not-allowed' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            <span className="text-xs font-semibold">{pinned ? t('home.sectionPinnedLabel', 'Section épinglée') : t('common.close', 'Fermer')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Catégorie: En route vers la grossesse
export function PreconceptionSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <CollapsibleSection 
      title={t('sections.preconception', 'En route vers la grossesse')}
      icon={Sparkles} 
      iconColor="text-amber-500"
      defaultOpen={false}
      sectionId="preconception"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Suivi de cycles - carte carrée ROSE */}
        <PastelMosaicCard
          color="pink"
          onClick={() => navigate('/cycle-tracking')}
          testId="cycle-tracking-nav"
        >
          <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <CalendarHeart className="w-5 h-5 text-pink-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('home.cycleTracking', 'Suivi de cycles')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('fertility.trackYourCycle', 'Calendrier fertilité')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard
          color="sky"
          onClick={() => navigate('/calculator')}
          testId="calculator-nav"
        >
          <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-sky-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <CalendarHeart className="w-5 h-5 text-sky-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.calculator', 'Calculateur')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('pregnancy.ovulationAndDates', 'Ovulation et dates clés')}</p>
        </PastelMosaicCard>

        {/* Grossesse après 35 ans - version compacte pleine largeur */}
        <PastelPillCard
          color="purple"
          onClick={() => navigate('/pregnancy-after-35')}
          testId="pregnancy-after-35-nav"
          className="col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100/60 backdrop-blur-sm flex-shrink-0"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Heart className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-700">
                {t('pregnancy.after35', 'Grossesse après 35 ans')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('pregnancy.after35Desc', 'Conseils et accompagnement')}
              </p>
            </div>
          </div>
        </PastelPillCard>
      </div>
      
      {/* Avertissement médical - quasi transparent */}
      <div className="mt-3 bg-amber-50/40 backdrop-blur-sm border border-amber-200/40 rounded-xl p-3">
        <p className="text-xs text-amber-700/80">
          <strong>{t('common.info', 'Information')} :</strong> {t('medicalWarning', 'Les conseils fournis sont à titre informatif et ne remplacent pas l\'avis d\'un médecin. Consultez un professionnel de santé avant toute prise de médicaments ou compléments.')}
        </p>
      </div>
    </CollapsibleSection>
  );
}

// Catégorie: Grossesse
export function PregnancySection({ hasPregnancyProfile, pregnancyProfile }) {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const { t } = useTranslation();
  
  // Déterminer si on est au 1er trimestre (semaines 1-13)
  const currentWeek = pregnancyProfile?.current_week || 1;
  const isFirstTrimester = currentWeek <= 13;

  return (
    <CollapsibleSection 
      title={t('sections.pregnancy', 'Grossesse')}
      icon={Baby} 
      iconColor="text-pink-500"
      defaultOpen={false}
      sectionId="pregnancy"
    >

      {/* Scanner, Bibliothèque, Favoris, Historique */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <PastelMosaicCard color="green" onClick={() => navigate('/scanner')} testId="scanner-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-green-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <ScanBarcode className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.scanner', 'Scanner')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.foods', 'Aliments')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard color="red" onClick={() => navigate('/library')} testId="library-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-red-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Apple className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.library', 'Bibliothèque')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.foods', 'Aliments')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard color="pink" onClick={() => navigate('/favorites')} testId="favorites-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.favorites', 'Favoris')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.saved', 'Sauvegardés')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard color="purple" onClick={() => navigate('/history')} testId="history-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-purple-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <History className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.history', 'Historique')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.searches', 'Recherches')}</p>
        </PastelMosaicCard>
      </div>

      {/* Séparateur visuel */}
      <div className="border-t border-slate-100/50 my-4"></div>

      {/* Liste des prénoms - Partiellement gratuit - style pill */}
      <PastelPillCard color="violet" onClick={() => navigate('/baby-names')} testId="baby-names-nav" className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100/60 backdrop-blur-sm flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Users className="w-5 h-5 text-violet-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-700">
                {t('pregnancy.babyNames', 'Liste des Prénoms')}
              </h3>
              {!isPremium && (
                <span className="flex items-center gap-1 bg-amber-100/60 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm">
                  <Crown className="w-3 h-3" /> {t('premium.partial', 'Partiel')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPremium 
                ? t('premium.allCountries', 'Europe & Amérique - Signification et personnalité')
                : t('premium.freeCountries', '3 pays gratuits, tous avec Premium')
              }
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-violet-400" />
        </div>
      </PastelPillCard>

      {/* Widget Évolution 3D - Pill pleine largeur avec mise en valeur */}
      <PastelPillCard color="pink" onClick={() => navigate('/baby-evolution')} testId="baby-evolution-nav" className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-200 flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.9), 0 4px 12px rgba(255, 183, 197, 0.3)' }}
          >
            <Baby className="w-6 h-6 text-pink-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
              {t('pregnancy.babyEvolution3D', 'Évolution de votre bébé en 3D')}
              <Sparkles className="w-4 h-4 text-pink-400" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('pregnancy.compareWithFruit', 'Découvrez la taille de bébé comparée à un fruit')}
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-pink-400" />
        </div>
      </PastelPillCard>

      {/* RDV, Évolution et conseils, Suivi de grossesse, Rappels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Évolution et conseils - format carré comme les autres */}
        <PastelMosaicCard color="pink" onClick={() => navigate('/tips')} testId="tips-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <BookHeart className="w-4 h-4 text-pink-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.tipsAndEvolution', 'Évolution et conseils')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.weekByWeek', 'Semaine par semaine')}</p>
        </PastelMosaicCard>

        {/* RDV - Gratuit au 1er trimestre, Premium après */}
        {isPremium || isFirstTrimester ? (
          <PastelMosaicCard color="sky" onClick={() => navigate('/medical')} testId="medical-nav">
            <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-sky-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Stethoscope className="w-4 h-4 text-sky-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.appointments', 'Rendez-vous')}</h3>
            <p className="text-xs text-slate-500">{isPremium ? t('pregnancy.medicalFollowUp', 'Suivi médical') : t('pregnancy.firstTrimester', '1er trimestre')}</p>
          </PastelMosaicCard>
        ) : (
          <PastelMosaicCard color="slate" onClick={() => navigate('/pricing')} testId="medical-nav-locked" locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-slate-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Stethoscope className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-500">{t('pregnancy.appointments', 'Rendez-vous')}</h3>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> 2e & 3e trimestre
            </p>
          </PastelMosaicCard>
        )}

        {/* Suivi grossesse - Premium uniquement */}
        {isPremium ? (
          <PastelMosaicCard color="pink" onClick={() => navigate('/tracking')} testId="tracking-nav">
            <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <LineChart className="w-4 h-4 text-pink-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.pregnancyTracking', 'Suivi grossesse')}</h3>
            <p className="text-xs text-slate-500">{t('pregnancy.momAndBaby', 'Maman & Bébé')}</p>
          </PastelMosaicCard>
        ) : (
          <PastelMosaicCard color="slate" onClick={() => navigate('/pricing')} testId="tracking-nav-locked" locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-slate-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <LineChart className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-500">{t('pregnancy.pregnancyTracking', 'Suivi grossesse')}</h3>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> {t('premium.title', 'Premium')}
            </p>
          </PastelMosaicCard>
        )}

        <PastelMosaicCard color="amber" onClick={() => navigate('/notifications')} testId="notifications-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-amber-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.reminders', 'Rappels')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.notifications', 'Notifications')}</p>
        </PastelMosaicCard>
      </div>
    </CollapsibleSection>
  );
}

// Catégorie: Préparer l'arrivée de bébé (Premium uniquement avec aperçu attractif)
export function BabyPreparationSection() {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const { t } = useTranslation();

  // Header personnalisé pour cette section (avec badge Premium)
  const CustomHeader = () => (
    <div className="flex items-center gap-2">
      <Gift className="w-5 h-5 text-purple-500" />
      <span className="whitespace-nowrap">{t('sections.babyPreparation', 'Préparer l\'arrivée de bébé')}</span>
      {!isPremium && (
        <span className="ml-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
          <Crown className="w-3 h-3 text-white" />
        </span>
      )}
    </div>
  );

  // Si pas premium, afficher un aperçu attractif avec contenu flouté/verrouillé
  if (!isPremium) {
    return (
      <CollapsibleSection 
        title={<CustomHeader />}
        icon={() => null}
        iconColor=""
        defaultOpen={false}
        sectionId="baby-preparation"
      >
        
        {/* Aperçu des cartes avec effet de flou partiel */}
        <div className="grid grid-cols-2 gap-4 relative">
          {/* Liste de naissance - aperçu */}
          <PastelMosaicCard color="pink" onClick={() => navigate('/pricing')} locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <ClipboardList className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.birthList', 'Liste de naissance')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.toShare', 'À partager avec vos proches')}</p>
          </PastelMosaicCard>

          {/* Sac de maternité - aperçu */}
          <PastelMosaicCard color="purple" onClick={() => navigate('/pricing')} locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-purple-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Briefcase className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.maternityBag', 'Sac de maternité')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.interactiveChecklist', 'Check-list interactive')}</p>
          </PastelMosaicCard>

          {/* Vidéos - aperçu */}
          <PastelMosaicCard color="red" onClick={() => navigate('/pricing')} locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-red-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Video className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.videos', 'Vidéos')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.birthPreparation', 'Préparation accouchement')}</p>
          </PastelMosaicCard>

          {/* Les Maternelles - aperçu */}
          <PastelMosaicCard color="red" onClick={() => navigate('/pricing')} locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-red-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Youtube className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.maternelles', 'Les Maternelles')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.youtubeChannel', 'Chaîne YouTube')}</p>
          </PastelMosaicCard>

          {/* Livres - aperçu pleine largeur */}
          <PastelPillCard color="amber" onClick={() => navigate('/pricing')} className="col-span-2">
            <div className="absolute top-2 right-3 z-10">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100/60 backdrop-blur-sm flex-shrink-0"
                style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
              >
                <Book className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.usefulBooks', 'Livres utiles')}</h3>
                <p className="text-xs text-slate-500">{t('babyPrep.pregnancyAndBaby', 'Grossesse et bébé')}</p>
              </div>
            </div>
          </PastelPillCard>
        </div>
        
        {/* Bouton débloquer */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Crown className="w-5 h-5" />
            {t('babyPrep.unlockWithPremium', 'Débloquer avec Premium')}
          </button>
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection 
      title={t('sections.babyPreparation', 'Préparer l\'arrivée de bébé')}
      icon={Gift} 
      iconColor="text-purple-500"
      defaultOpen={false}
      sectionId="baby-preparation"
    >
      <div className="grid grid-cols-2 gap-4">
        <PastelMosaicCard color="pink" onClick={() => navigate('/birth-list')} testId="birthlist-nav">
          <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <ClipboardList className="w-5 h-5 text-pink-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.birthList', 'Liste de naissance')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.toShare', 'À partager')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard color="purple" onClick={() => navigate('/maternity-bag')} testId="maternity-bag-nav">
          <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-purple-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Briefcase className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.maternityBag', 'Sac de maternité')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.interactiveChecklist', 'Check-list interactive')}</p>
        </PastelMosaicCard>

        <a
          href="https://www.youtube.com/results?search_query=préparation+accouchement"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <PastelMosaicCard color="red" testId="birth-videos-nav" className="h-full">
            <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-red-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Video className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.videos', 'Vidéos')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.birthPreparation', 'Préparation accouchement')}</p>
          </PastelMosaicCard>
        </a>

        <a
          href="https://www.youtube.com/c/LaMaisondesMaternelles"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <PastelMosaicCard color="red" testId="maternelles-nav" className="h-full">
            <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-red-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Youtube className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.maternelles', 'Les Maternelles')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.youtubeChannel', 'Chaîne YouTube')}</p>
          </PastelMosaicCard>
        </a>

        <a
          href="https://www.amazon.fr/s?k=livre+grossesse+bébé"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline col-span-2"
        >
          <PastelPillCard color="amber" testId="books-nav" className="h-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100/60 backdrop-blur-sm flex-shrink-0"
                style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
              >
                <Book className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.usefulBooks', 'Livres utiles')}</h3>
                <p className="text-xs text-slate-500">{t('babyPrep.pregnancyAndBaby', 'Grossesse et bébé')}</p>
              </div>
            </div>
          </PastelPillCard>
        </a>
      </div>
    </CollapsibleSection>
  );
}

// Catégorie: Suivi Post-partum
export function PostpartumSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <CollapsibleSection 
      title={t('sections.postpartum', 'Suivi post-partum')}
      icon={Heart} 
      iconColor="text-rose-500"
      defaultOpen={false}
      sectionId="postpartum"
    >
      <PastelPillCard
        color="pink"
        onClick={() => navigate('/postpartum')}
        testId="postpartum-nav"
        className="py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-pink-100/60 backdrop-blur-sm flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Baby className="w-6 h-6 text-pink-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-700">{t('postpartum.first6Months', 'Les 6 premiers mois avec bébé')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('postpartum.desc', 'Conseils, rendez-vous, allaitement, couches et précautions')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-pink-400" />
        </div>
      </PastelPillCard>
    </CollapsibleSection>
  );
}

// Section FAQ "Tout va bien ?" (0-6 mois) — Accueil
export function FaqBabySection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <CollapsibleSection 
      title={t('sections.faq', 'Tout va bien ?')}
      icon={HelpCircle} 
      iconColor="text-amber-500"
      defaultOpen={false}
      sectionId="faq-baby"
    >
      <PastelPillCard
        color="amber"
        onClick={() => navigate('/faq-baby')}
        testId="faq-baby-nav"
        className="py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100/60 backdrop-blur-sm flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <HelpCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-700">{t('faq.title', 'FAQ 0-6 mois')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('faq.desc', 'Coliques, sommeil, eczéma... les réponses aux questions fréquentes')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400" />
        </div>
      </PastelPillCard>
    </CollapsibleSection>
  );
}

// Catégorie: Services et ressources - Dynamique selon la langue
export function ServicesSection() {
  const { t, i18n } = useTranslation();
  const { getServicesForLanguage, serviceColors } = require('../../data/servicesByCountry');
  
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  const countryData = getServicesForLanguage(currentLang);
  
  // Mapping des icônes
  const iconMap = {
    building: Library,
    heart: Heart,
    mapPin: Gift,
    phone: Phone,
    baby: Baby
  };
  
  // Mapping couleurs vers pastel
  const colorToPastel = {
    blue: 'sky',
    purple: 'purple',
    pink: 'pink',
    green: 'green',
    red: 'red',
    amber: 'amber'
  };

  return (
    <CollapsibleSection 
      title={t('sections.services', 'Services et ressources')}
      icon={Library} 
      iconColor="text-blue-500"
      defaultOpen={false}
      sectionId="services"
    >
      {/* Indicateur du pays */}
      <div className="flex items-center justify-center gap-2 mb-4 text-sm text-slate-500">
        <span>{countryData.flag}</span>
        <span>{countryData.country}</span>
      </div>
      
      {/* Services principaux (3 premiers) - style pill */}
      <div className="space-y-3 mb-4">
        {countryData.services.slice(0, 3).map((service) => {
          const IconComponent = iconMap[service.icon] || Library;
          const pastelColor = colorToPastel[service.color] || 'sky';
          const style = PASTEL_STYLES[pastelColor] || PASTEL_STYLES.sky;
          
          return (
            <a
              key={service.id}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`service-${service.id}`}
              className="block no-underline"
            >
              <div
                className="relative overflow-hidden rounded-full px-4 py-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: style.background,
                  boxShadow: style.boxShadow,
                }}
              >
                {/* Voile blanc supprimé */}
                <div className="relative flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${pastelColor}-100/60 backdrop-blur-sm flex-shrink-0`}
                    style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
                  >
                    <IconComponent className={`w-5 h-5 text-${pastelColor}-500`} />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-700 block text-sm">{service.name}</span>
                    <span className="text-xs text-slate-500">{service.description}</span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
      
      {/* Urgences et site officiel (2 derniers) - style mosaïque */}
      <div className="grid grid-cols-2 gap-3">
        {countryData.services.slice(3).map((service) => {
          const IconComponent = iconMap[service.icon] || Library;
          const isEmergency = service.id === 'emergency';
          const pastelColor = isEmergency ? 'red' : 'pink';
          
          return (
            <a
              key={service.id}
              href={service.url}
              target={isEmergency ? "_self" : "_blank"}
              rel="noopener noreferrer"
              data-testid={`service-${service.id}`}
              className="block no-underline"
            >
              <PastelMosaicCard color={pastelColor} className="h-full">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEmergency ? 'bg-red-100/60' : 'bg-pink-100/60'} backdrop-blur-sm flex-shrink-0`}
                    style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
                  >
                    <IconComponent className={`w-4 h-4 ${isEmergency ? 'text-red-500' : 'text-pink-500'}`} />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <span className={`font-semibold block truncate text-sm ${isEmergency ? 'text-red-700' : 'text-pink-700'}`}>
                      {service.name}
                    </span>
                    <span className={`text-xs truncate block ${isEmergency ? 'text-red-600' : 'text-pink-600'}`}>
                      {service.description}
                    </span>
                  </div>
                </div>
              </PastelMosaicCard>
            </a>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

/**
 * SolidaritySection - Section Tirelire et Badges sur la page d'accueil
 */
export function SolidaritySection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [walletData, setWalletData] = useState({ balance: 0, total_earned: 0 });
  const [badgesData, setBadgesData] = useState({ progress: {} });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [walletRes, badgesRes] = await Promise.all([
        api.get('/api/solidarity/wallet').catch(() => ({ data: { balance: 3, total_earned: 3 } })),
        api.get('/api/solidarity/badges').catch(() => ({ data: { progress: {} } }))
      ]);
      setWalletData(walletRes.data);
      setBadgesData(badgesRes.data);
    } catch (error) {
      console.error('Error loading solidarity data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const balance = walletData?.balance || 0;
  const goal = 30;
  const progress = Math.min((balance / goal) * 100, 100);
  const isUnlocked = balance >= goal;
  
  const badgeProgress = badgesData?.progress || {};
  const hasBronze = badgeProgress.has_bronze;
  const hasSilver = badgeProgress.has_silver;
  const hasGold = badgeProgress.has_gold;

  return (
    <CollapsibleSection 
      title="Solidarité"
      icon={HandHeart} 
      iconColor="text-purple-500"
      defaultOpen={false}
      sectionId="solidarity"
    >
      {/* Tirelire Card */}
      <div 
        className="relative overflow-hidden rounded-2xl p-4 mb-4 cursor-pointer active:scale-[0.99] transition-all"
        style={{
          background: isUnlocked 
            ? 'linear-gradient(145deg, rgba(254,249,195,0.95) 0%, rgba(253,224,71,0.8) 100%)'
            : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(252,231,243,0.9) 45%, rgba(249,168,212,0.7) 100%)',
          boxShadow: `0 10px 28px -6px ${isUnlocked ? 'rgba(234,179,8,0.25)' : 'rgba(236,72,153,0.25)'}, inset 0 2px 6px rgba(255,255,255,0.98)`,
          border: `2px solid ${isUnlocked ? 'rgba(234,179,8,0.3)' : 'rgba(249,168,212,0.3)'}`,
        }}
        onClick={() => navigate('/referral')}
        data-testid="tirelire-section-card"
      >
        {/* Voile blanc supprimé */}
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-yellow-100' : 'bg-pink-100'}`}>
                <PiggyBank className={`w-6 h-6 ${isUnlocked ? 'text-yellow-600' : 'text-pink-500'}`} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Ma Tirelire</p>
                <p className={`text-2xl font-bold ${isUnlocked ? 'text-yellow-600' : 'text-pink-500'}`}>
                  {loading ? '...' : `${balance}€`}
                </p>
              </div>
            </div>
            {isUnlocked && (
              <div className="flex items-center gap-1 bg-yellow-200/60 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                <Gift className="w-3 h-3" /> Débloqué !
              </div>
            )}
          </div>
          
          {/* Jauge de progression */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progression</span>
              <span>{balance}€ / {goal}€</span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
                    : 'bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <p className="text-xs text-slate-500 text-center">
            {isUnlocked 
              ? '🎉 Offrez une Invitation Sérénité !'
              : `+3€ par parrainage • Encore ${goal - balance}€ pour débloquer`
            }
          </p>
        </div>
      </div>
      
      {/* Badges */}
      <div className="flex justify-center gap-4 mb-4">
        {/* Bronze */}
        <div className="text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1 ${
            hasBronze ? 'bg-gradient-to-br from-amber-600 to-amber-700' : 'bg-slate-200'
          }`}>
            {hasBronze ? (
              <Award className="w-7 h-7 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <p className={`text-xs font-medium ${hasBronze ? 'text-amber-700' : 'text-slate-400'}`}>Bronze</p>
          {!hasBronze && (
            <p className="text-[10px] text-slate-400">{badgeProgress.contributions_validated || 0}/3</p>
          )}
        </div>
        
        {/* Argent */}
        <div className="text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1 ${
            hasSilver ? 'bg-gradient-to-br from-slate-400 to-slate-500' : 'bg-slate-200'
          }`}>
            {hasSilver ? (
              <Award className="w-7 h-7 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <p className={`text-xs font-medium ${hasSilver ? 'text-slate-600' : 'text-slate-400'}`}>Argent</p>
          {!hasSilver && (
            <p className="text-[10px] text-slate-400">{badgeProgress.contributions_validated || 0}/5</p>
          )}
        </div>
        
        {/* Or */}
        <div className="text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1 ${
            hasGold ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-slate-200'
          }`}>
            {hasGold ? (
              <Crown className="w-7 h-7 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <p className={`text-xs font-medium ${hasGold ? 'text-yellow-700' : 'text-slate-400'}`}>Or</p>
          {!hasGold && (
            <p className="text-[10px] text-slate-400">5 + 3 parrainages</p>
          )}
        </div>
      </div>
      
      {/* Relais Maman info */}
      <PastelPillCard color="purple" onClick={() => navigate('/referral')} testId="relais-maman-nav">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100/60 backdrop-blur-sm flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <HandHeart className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-700">Le Relais Maman</h3>
            <p className="text-xs text-slate-500">Parrainez et aidez d'autres mamans</p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </div>
      </PastelPillCard>
    </CollapsibleSection>
  );
}
