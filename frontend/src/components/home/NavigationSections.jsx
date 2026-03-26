import { useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { Card } from '../ui/card';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, Baby, Gift, Heart, Library,
  CalendarHeart, BookHeart, ScanBarcode, Apple, 
  History, Stethoscope, Bell, 
  ClipboardList, Briefcase, Video, Youtube, Book, ChevronRight, ChevronDown, LineChart, Lock, Crown, Users, Pin, PinOff, Phone
} from 'lucide-react';
import { useSubscription } from '../SubscriptionGate';
import { toast } from 'sonner';

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

// Composant réutilisable pour les sections déroulantes
function CollapsibleSection({ title, icon: Icon, iconColor, children, defaultOpen = false, sectionId }) {
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
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={handleToggle}
          className="flex-1 flex items-center justify-between py-3 px-1 group"
        >
          {isCustomTitle ? (
            <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {title}
              {pinned && <Pin className="w-4 h-4 text-pink-500 fill-pink-500" />}
            </h2>
          ) : (
            <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
              {title}
              {pinned && <Pin className="w-4 h-4 text-pink-500 fill-pink-500" />}
            </h2>
          )}
          <ChevronDown 
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {/* Bouton épingler */}
        {sectionId && (
          <button
            onClick={handlePin}
            className={`p-2 rounded-full transition-all ${
              pinned 
                ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
            }`}
            title={pinned ? t('home.unpinSection', 'Désépingler cette section') : t('home.pinSection', 'Épingler cette section (toujours ouverte)')}
          >
            {pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
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
            className={`w-full mt-4 p-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
              pinned 
                ? 'bg-pink-50 text-pink-400 cursor-not-allowed' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
            <span className="text-sm font-semibold">{pinned ? t('home.sectionPinnedLabel', 'Section épinglée') : t('common.close', 'Fermer')}</span>
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
        <Card
          onClick={() => navigate('/calculator')}
          data-testid="calculator-nav"
          className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <CalendarHeart className="w-10 h-10 text-sky-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('pregnancy.calculator', 'Calculateur')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('pregnancy.ovulationAndDates', 'Ovulation et dates clés')}</p>
        </Card>

        <Card
          onClick={() => navigate('/tips')}
          data-testid="preconception-tips-nav"
          className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <BookHeart className="w-10 h-10 text-pink-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('pregnancy.tipsAndEvolution', 'Évolution et conseils')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('pregnancy.weekByWeek', 'Semaine par semaine')}</p>
        </Card>
      </div>
      
      {/* Nouvelle carte : Grossesse après 35 ans */}
      <Card
        onClick={() => navigate('/pregnancy-after-35')}
        data-testid="pregnancy-after-35-nav"
        className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t('pregnancy.after35', 'Grossesse après 35 ans')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('pregnancy.after35Desc', 'Conseils, examens et accompagnement spécialisé')}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </Card>
      
      {/* Avertissement médical */}
      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-700">
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
        <Card
          onClick={() => navigate('/scanner')}
          data-testid="scanner-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <ScanBarcode className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.scanner', 'Scanner')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.foods', 'Aliments')}</p>
        </Card>

        <Card
          onClick={() => navigate('/library')}
          data-testid="library-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <Apple className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.library', 'Bibliothèque')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.foods', 'Aliments')}</p>
        </Card>

        <Card
          onClick={() => navigate('/favorites')}
          data-testid="favorites-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.favorites', 'Favoris')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.saved', 'Sauvegardés')}</p>
        </Card>

        <Card
          onClick={() => navigate('/history')}
          data-testid="history-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <History className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.history', 'Historique')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.searches', 'Recherches')}</p>
        </Card>
      </div>

      {/* Séparateur visuel */}
      <div className="border-t border-slate-100 my-4"></div>

      {/* Liste des prénoms - Partiellement gratuit */}
      <Card
        onClick={() => navigate('/baby-names')}
        data-testid="baby-names-nav"
        className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-violet-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover mb-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t('pregnancy.babyNames', 'Liste des Prénoms')}
              </h3>
              {!isPremium && (
                <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
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
      </Card>

      {/* RDV (1er trimestre gratuit, Premium après), Suivi de grossesse (Premium), Rappels */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* RDV - Gratuit au 1er trimestre, Premium après */}
        {isPremium || isFirstTrimester ? (
          <Card
            onClick={() => navigate('/medical')}
            data-testid="medical-nav"
            className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
          >
            <Stethoscope className="w-8 h-8 text-sky-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.appointments', 'Rendez-vous')}</h3>
            <p className="text-xs text-slate-500">{isPremium ? t('pregnancy.medicalFollowUp', 'Suivi médical') : t('pregnancy.firstTrimester', '1er trimestre')}</p>
          </Card>
        ) : (
          <Card
            onClick={() => navigate('/pricing')}
            data-testid="medical-nav-locked"
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center relative"
          >
            <div className="absolute top-2 right-2">
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <Stethoscope className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-500">{t('pregnancy.appointments', 'Rendez-vous')}</h3>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> 2e & 3e trimestre
            </p>
          </Card>
        )}

        {/* Suivi grossesse - Premium uniquement */}
        {isPremium ? (
          <Card
            onClick={() => navigate('/tracking')}
            data-testid="tracking-nav"
            className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-pink-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
          >
            <LineChart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.pregnancyTracking', 'Suivi grossesse')}</h3>
            <p className="text-xs text-slate-500">{t('pregnancy.momAndBaby', 'Maman & Bébé')}</p>
          </Card>
        ) : (
          <Card
            onClick={() => navigate('/pricing')}
            data-testid="tracking-nav-locked"
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center relative"
          >
            <div className="absolute top-2 right-2">
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <LineChart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-500">{t('pregnancy.pregnancyTracking', 'Suivi grossesse')}</h3>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> {t('premium.title', 'Premium')}
            </p>
          </Card>
        )}

        <Card
          onClick={() => navigate('/notifications')}
          data-testid="notifications-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <Bell className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.reminders', 'Rappels')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.notifications', 'Notifications')}</p>
        </Card>
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
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer card-hover text-center relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <ClipboardList className="w-10 h-10 text-pink-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.birthList', 'Liste de naissance')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('babyPrep.toShare', 'À partager avec vos proches')}</p>
          </Card>

          {/* Sac de maternité - aperçu */}
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100 cursor-pointer card-hover text-center relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <Briefcase className="w-10 h-10 text-purple-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.maternityBag', 'Sac de maternité')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('babyPrep.interactiveChecklist', 'Check-list interactive')}</p>
          </Card>

          {/* Vidéos - aperçu */}
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer card-hover text-center relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <Video className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.videos', 'Vidéos')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('babyPrep.birthPreparation', 'Préparation accouchement')}</p>
          </Card>

          {/* Les Maternelles - aperçu */}
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer card-hover text-center relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <Youtube className="w-10 h-10 text-red-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.maternelles', 'Les Maternelles')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('babyPrep.youtubeChannel', 'Chaîne YouTube')}</p>
          </Card>

          {/* Livres - aperçu */}
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer card-hover text-center col-span-2 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <Book className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.usefulBooks', 'Livres utiles')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('babyPrep.pregnancyAndBaby', 'Grossesse et bébé')}</p>
          </Card>
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
        <Card
          onClick={() => navigate('/birth-list')}
          data-testid="birthlist-nav"
          className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <ClipboardList className="w-10 h-10 text-pink-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.birthList', 'Liste de naissance')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('babyPrep.toShare', 'À partager')}</p>
        </Card>

        <Card
          onClick={() => navigate('/maternity-bag')}
          data-testid="maternity-bag-nav"
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <Briefcase className="w-10 h-10 text-purple-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.maternityBag', 'Sac de maternité')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('babyPrep.interactiveChecklist', 'Check-list interactive')}</p>
        </Card>

        <a
          href="https://www.youtube.com/results?search_query=préparation+accouchement"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <Card
            data-testid="birth-videos-nav"
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
          >
            <Video className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.videos', 'Vidéos')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('babyPrep.birthPreparation', 'Préparation accouchement')}</p>
          </Card>
        </a>

        <a
          href="https://www.youtube.com/c/LaMaisondesMaternelles"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <Card
            data-testid="maternelles-nav"
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
          >
            <Youtube className="w-10 h-10 text-red-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.maternelles', 'Les Maternelles')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('babyPrep.youtubeChannel', 'Chaîne YouTube')}</p>
          </Card>
        </a>

        <a
          href="https://www.amazon.fr/s?k=livre+grossesse+bébé"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline col-span-2"
        >
          <Card
            data-testid="books-nav"
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
          >
            <Book className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('babyPrep.usefulBooks', 'Livres utiles')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('babyPrep.pregnancyAndBaby', 'Grossesse et bébé')}</p>
          </Card>
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
      <Card
        onClick={() => navigate('/postpartum')}
        data-testid="postpartum-nav"
        className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Baby className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('postpartum.first6Months', 'Les 6 premiers mois avec bébé')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('postpartum.desc', 'Conseils, rendez-vous, allaitement, couches et précautions')}</p>
          </div>
          <ChevronRight className="w-6 h-6 text-rose-400" />
        </div>
      </Card>
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
      
      {/* Services principaux (3 premiers) */}
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {countryData.services.slice(0, 3).map((service) => {
          const IconComponent = iconMap[service.icon] || Library;
          const colors = serviceColors[service.color] || serviceColors.blue;
          
          return (
            <a
              key={service.id}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`service-${service.id}`}
              className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5 no-underline"
            >
              <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-slate-700 block">{service.name}</span>
                <span className="text-xs text-slate-500">{service.description}</span>
              </div>
            </a>
          );
        })}
      </div>
      
      {/* Urgences et site officiel (2 derniers) */}
      <div className="grid grid-cols-2 gap-3">
        {countryData.services.slice(3).map((service) => {
          const IconComponent = iconMap[service.icon] || Library;
          const colors = serviceColors[service.color] || serviceColors.blue;
          const isEmergency = service.id === 'emergency';
          
          return (
            <a
              key={service.id}
              href={service.url}
              target={isEmergency ? "_self" : "_blank"}
              rel="noopener noreferrer"
              data-testid={`service-${service.id}`}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border cursor-pointer transition-all hover:-translate-y-0.5 no-underline ${
                isEmergency 
                  ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:shadow-red-100' 
                  : 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 hover:shadow-pink-100'
              }`}
            >
              <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="text-left min-w-0">
                <span className={`font-semibold block truncate ${isEmergency ? 'text-red-700' : 'text-pink-700'}`}>
                  {service.name}
                </span>
                <span className={`text-xs truncate block ${isEmergency ? 'text-red-600' : 'text-pink-600'}`}>
                  {service.description}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
