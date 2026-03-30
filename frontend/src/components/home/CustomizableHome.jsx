import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, ChevronRight } from 'lucide-react';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';
import { useSubscription } from '../SubscriptionGate';
import { Card } from '../ui/card';
import NameOfTheDay from '../NameOfTheDay';
import { useTheme } from '../../contexts/ThemeContext';
import {
  PageDots,
  PageHeader,
  LayoutTutorialBanner,
  EditModeButton,
  ResetLayoutButton,
  DraggableItem
} from './HomeCustomization';
import {
  PreconceptionSection,
  PregnancySection,
  BabyPreparationSection,
  PostpartumSection,
  ServicesSection,
  PinnedSectionsProvider
} from './NavigationSections';
import { PinTipBanner } from './PinTip';
import { PremiumControlPanel, PAGE_THEMES } from './PremiumFeatures';

// Mapping des composants de sections
const SECTION_COMPONENTS = {
  'preconception': PreconceptionSection,
  'pregnancy': PregnancySection,
  'baby-preparation': BabyPreparationSection,
  'postpartum': PostpartumSection,
  'services': ServicesSection,
};

// Icônes pour chaque étape du voyage
const JOURNEY_ICONS = {
  'preconception': { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-100' },
  'pregnancy': { icon: Baby, color: 'text-pink-500', bg: 'bg-pink-100' },
  'baby-preparation': { icon: Gift, color: 'text-purple-500', bg: 'bg-purple-100' },
  'postpartum': { icon: HeartHandshake, color: 'text-rose-500', bg: 'bg-rose-100' },
  'services': { icon: Settings, color: 'text-slate-500', bg: 'bg-slate-100' },
};

// Section "Les étapes de votre plus beau voyage" - Carte cliquable vers la page dédiée
function JourneyStepsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <Card 
      className="bg-gradient-to-br from-white via-pink-50/50 to-purple-50/50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-pink-100/50 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
      onClick={() => navigate('/journey-steps')}
      data-testid="journey-steps-card"
    >
      {/* Header avec cœurs */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <Heart className="w-5 h-5 text-pink-400 animate-pulse" fill="currentColor" />
        <h2 
          className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
        </h2>
        <Heart className="w-5 h-5 text-pink-400 animate-pulse" fill="currentColor" />
      </div>
      
      {/* Icônes des 5 étapes */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
          <Baby className="w-5 h-5 text-pink-500" />
        </div>
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Gift className="w-5 h-5 text-purple-500" />
        </div>
        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
          <HeartHandshake className="w-5 h-5 text-rose-500" />
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-500" />
        </div>
      </div>
      
      {/* Description et flèche */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 flex-1">
          {t('home.journeyStepsDesc', 'De la conception à l\'arrivée de bébé')}
        </p>
        <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>
    </Card>
  );
}

// Header simple (plus utilisé, gardé pour compatibilité)
function JourneyStepsHeader() {
  const { t } = useTranslation();
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
        <Heart className="w-5 h-5 text-pink-400 animate-pulse" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
      </div>
      <h2 
        className="text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500"
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
      </h2>
      <div className="flex items-center justify-center gap-3 mt-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
        <Heart className="w-5 h-5 text-pink-400 animate-pulse" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
      </div>
    </div>
  );
}

// Composant pour afficher le widget "Semaine de grossesse"
function WeekDisplayWidget({ pregnancyProfile, t }) {
  if (!pregnancyProfile?.current_week) return null;
  
  return (
    <Card className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0" data-testid="week-display-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{t('pregnancy.youAreAt', 'Vous êtes à la')}</p>
          <p className="text-2xl font-bold text-sky-600">{t('pregnancy.week', 'Semaine')} {pregnancyProfile.current_week} SA</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">{t('pregnancy.trimester', 'Trimestre')} {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}</p>
          {pregnancyProfile.estimated_due_date && (
            <p className="text-lg font-bold text-pink-600">
              {new Date(pregnancyProfile.estimated_due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Composant principal pour l'écran d'accueil personnalisable
export function CustomizableHome({ pregnancyProfile, hasPregnancyProfile }) {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { isPremium } = useSubscription();
  const {
    layout,
    isEditMode,
    setIsEditMode,
    isLoading,
    showTutorial,
    dismissTutorial,
    pages,
    currentPageIndex,
    setCurrentPage,
    addPage,
    deletePage,
    renamePage,
    moveItem,
    resetToDefault,
    hasCustomLayout,
    setPageTheme
  } = useHomeLayout();

  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Gestion du swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    if (isEditMode) return; // Pas de swipe en mode édition
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    if (isEditMode) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (isEditMode) return;
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentPageIndex < pages.length - 1) {
      setCurrentPage(currentPageIndex + 1);
    }
    if (isRightSwipe && currentPageIndex > 0) {
      setCurrentPage(currentPageIndex - 1);
    }
  };

  // Appui long pour activer le mode édition
  const handleLongPress = useCallback((itemId) => {
    if (!isEditMode) {
      setIsEditMode(true);
      setDraggedItem(itemId);
    }
  }, [isEditMode, setIsEditMode]);

  // Ajouter une nouvelle page
  const handleAddPage = async () => {
    const name = prompt(t('home.enterPageName', 'Nom de la page :'), t('home.newPage', 'Nouvelle page'));
    if (name) {
      await addPage(name);
    }
  };

  // Rendu d'un élément selon son type
  const renderItem = (item, index) => {
    const itemKey = `${item.id}-${index}`;
    
    // Widget Semaine de grossesse
    if (item.id === 'week-display') {
      if (!hasPregnancyProfile) return null;
      return (
        <DraggableItem 
          key={itemKey} 
          itemId={item.id} 
          isEditMode={isEditMode}
          onLongPress={handleLongPress}
          isDragging={draggedItem === item.id}
        >
          <WeekDisplayWidget pregnancyProfile={pregnancyProfile} t={t} />
        </DraggableItem>
      );
    }
    
    // Widget Prénom du jour
    if (item.id === 'name-of-day') {
      return (
        <DraggableItem 
          key={itemKey} 
          itemId={item.id} 
          isEditMode={isEditMode}
          onLongPress={handleLongPress}
          isDragging={draggedItem === item.id}
        >
          <NameOfTheDay isDarkMode={isDarkMode} />
        </DraggableItem>
      );
    }
    
    // Sections
    if (item.type === 'section') {
      const SectionComponent = SECTION_COMPONENTS[item.id];
      if (!SectionComponent) return null;
      
      // Passer les props nécessaires selon la section
      const sectionProps = {};
      if (item.id === 'pregnancy') {
        sectionProps.hasPregnancyProfile = hasPregnancyProfile;
        sectionProps.pregnancyProfile = pregnancyProfile;
      }
      
      return (
        <DraggableItem 
          key={itemKey} 
          itemId={item.id} 
          isEditMode={isEditMode}
          onLongPress={handleLongPress}
          isDragging={draggedItem === item.id}
        >
          <SectionComponent {...sectionProps} />
        </DraggableItem>
      );
    }
    
    return null;
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];
  
  // Obtenir le thème de la page actuelle
  const currentTheme = PAGE_THEMES.find(t => t.id === (currentPage.theme || 'default')) || PAGE_THEMES[0];

  return (
    <div className="relative">
      {/* Bannière tutoriel */}
      {showTutorial && (
        <LayoutTutorialBanner 
          onDismiss={dismissTutorial}
          onStartEdit={() => {
            dismissTutorial();
            setIsEditMode(true);
          }}
        />
      )}

      {/* Panneau de contrôle Premium (en mode édition) */}
      {isEditMode && (
        <PremiumControlPanel
          isVisible={isEditMode}
          currentPageTheme={currentPage.theme || 'default'}
          onThemeChange={(themeId) => setPageTheme(currentPage.id, themeId)}
        />
      )}

      {/* Bulles de pagination */}
      {pages.length > 1 || isEditMode ? (
        <PageDots
          pages={pages}
          currentIndex={currentPageIndex}
          onPageChange={setCurrentPage}
          isEditMode={isEditMode}
          onAddPage={handleAddPage}
        />
      ) : null}

      {/* Zone de swipe avec thème de page */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`page-transition rounded-3xl ${!currentPage.isDefault && currentTheme.colors.bg} ${!currentPage.isDefault ? 'p-4' : ''}`}
      >
        {/* Header de page (si page personnalisée) */}
        <PageHeader
          page={currentPage}
          isEditMode={isEditMode}
          onRename={renamePage}
          onDelete={deletePage}
          isDefault={currentPage.isDefault}
        />

        {/* Contenu de la page */}
        <PinnedSectionsProvider>
          {currentPage.isDefault && <PinTipBanner />}
          
          <div className="space-y-4">
            {/* Widgets (semaine de grossesse, fête du jour) */}
            {currentPage.items
              .filter(item => item.type !== 'section')
              .map((item, index) => (
                <div key={`widget-${item.id}-${index}`}>
                  {renderItem(item, index)}
                </div>
              ))
            }
            
            {/* Carte cliquable "Les étapes de votre plus beau voyage" (page par défaut uniquement) */}
            {currentPage.isDefault && currentPage.items.some(item => item.type === 'section') && (
              <JourneyStepsCard />
            )}
            
            {/* Pour les pages personnalisées, afficher les sections normalement */}
            {!currentPage.isDefault && currentPage.items
              .filter(item => item.type === 'section')
              .map((item, index) => (
                <div key={`section-${item.id}-${index}`}>
                  {renderItem(item, index)}
                </div>
              ))
            }
          </div>
        </PinnedSectionsProvider>

        {/* Message si page vide */}
        {currentPage.items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">{t('home.emptyPage', 'Cette page est vide')}</p>
            <p className="text-sm text-slate-300">
              {t('home.dragItemsHere', 'Faites glisser des éléments ici depuis une autre page')}
            </p>
          </div>
        )}
      </div>

      {/* Bouton mode édition flottant */}
      <EditModeButton
        isEditMode={isEditMode}
        onToggle={() => setIsEditMode(!isEditMode)}
      />

      {/* Bouton réinitialiser (en mode édition uniquement) */}
      {isEditMode && hasCustomLayout && (
        <ResetLayoutButton onReset={resetToDefault} />
      )}
    </div>
  );
}

export default CustomizableHome;
