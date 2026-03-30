import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';
import { Card } from '../ui/card';
import NameOfTheDay from '../NameOfTheDay';
import { useTheme } from '../../contexts/ThemeContext';
import {
  PageDots,
  PageHeader,
  LayoutTutorialBanner,
  ResetLayoutButton,
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

// Widget "Semaine de grossesse"
function WeekDisplayWidget({ pregnancyProfile, t }) {
  if (!pregnancyProfile?.current_week) return null;
  
  return (
    <Card className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-2xl p-4 shadow-sm border-0" data-testid="week-display-card">
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

// Carte cliquable "Les étapes de votre plus beau voyage"
function JourneyStepsCard({ t, navigate }) {
  return (
    <Card 
      className="bg-gradient-to-r from-white/90 via-pink-50/30 to-purple-50/30 rounded-2xl px-4 py-3 shadow-sm border border-pink-100/40 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 active:scale-[0.99]"
      onClick={() => navigate('/journey-steps')}
      data-testid="journey-steps-card"
    >
      <div className="text-center">
        {/* Titre avec cœurs alignés */}
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" fill="currentColor" />
          <h2 
            className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 whitespace-nowrap"
            style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif", fontWeight: 700 }}
          >
            {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
          </h2>
          <Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" fill="currentColor" />
        </div>
        
        {/* Sous-titre */}
        <p className="text-[9px] text-slate-400 mt-0.5">
          {t('home.journeyStepsDesc', 'De la conception à l\'arrivée de bébé')}
        </p>
      </div>
    </Card>
  );
}

// Carte de section pour pages utilisateur
function UserSectionCard({ item, isEditMode, onDragStart, onDragOver, onDrop, isDragging, pregnancyProfile, hasPregnancyProfile, t }) {
  const SECTION_COMPONENTS = {
    'preconception': PreconceptionSection,
    'pregnancy': PregnancySection,
    'baby-preparation': BabyPreparationSection,
    'postpartum': PostpartumSection,
    'services': ServicesSection,
  };
  
  const SECTION_META = {
    'preconception': { bgGradient: 'from-amber-50/80 to-yellow-50/80', borderColor: 'border-amber-200/50' },
    'pregnancy': { bgGradient: 'from-pink-50/80 to-rose-50/80', borderColor: 'border-pink-200/50' },
    'baby-preparation': { bgGradient: 'from-purple-50/80 to-violet-50/80', borderColor: 'border-purple-200/50' },
    'postpartum': { bgGradient: 'from-rose-50/80 to-pink-50/80', borderColor: 'border-rose-200/50' },
    'services': { bgGradient: 'from-slate-50/80 to-gray-50/80', borderColor: 'border-slate-200/50' },
  };
  
  const meta = SECTION_META[item.id];
  const SectionComponent = SECTION_COMPONENTS[item.id];
  
  if (!meta || !SectionComponent) return null;
  
  const sectionProps = item.id === 'pregnancy' ? { hasPregnancyProfile, pregnancyProfile } : {};
  
  return (
    <div 
      className={`transition-all duration-300 ${isDragging ? 'opacity-50 scale-95' : ''}`}
      draggable={isEditMode}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Card className={`relative overflow-hidden bg-gradient-to-r ${meta.bgGradient} rounded-2xl border ${meta.borderColor} shadow-sm ${isEditMode ? 'ring-2 ring-pink-300/50' : ''}`}>
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
        <div className="px-3 py-2">
          <SectionComponent {...sectionProps} />
        </div>
      </Card>
    </div>
  );
}

// Composant principal
export function CustomizableHome({ pregnancyProfile, hasPregnancyProfile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
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
    setPageTheme,
    setDefaultPage,
    defaultPageId
  } = useHomeLayout();

  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Swipe entre pages
  const onTouchStart = (e) => {
    if (isEditMode) return;
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
    if (distance > 50 && currentPageIndex < pages.length - 1) {
      setCurrentPage(currentPageIndex + 1);
    }
    if (distance < -50 && currentPageIndex > 0) {
      setCurrentPage(currentPageIndex - 1);
    }
  };

  // Drag & Drop
  const handleDragStart = (e, itemId, pageId) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;
    await moveItem(draggedItem, currentPage.id, currentPage.id, targetIndex);
    setDraggedItem(null);
  };

  // Ajouter une page
  const handleAddPage = async () => {
    const name = prompt(t('home.enterPageName', 'Nom de la page :'), t('home.newPage', 'Nouvelle page'));
    if (name) {
      await addPage(name);
    }
  };

  // Définir comme page d'accueil
  const handleSetAsHome = async () => {
    if (setDefaultPage && currentPage) {
      await setDefaultPage(currentPage.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];
  const currentTheme = PAGE_THEMES.find(th => th.id === (currentPage?.theme || 'default')) || PAGE_THEMES[0];
  const isDefaultPage = currentPage?.isDefault;
  const isCurrentPageHome = currentPage?.id === defaultPageId;

  return (
    <div className="relative">
      {/* Tutoriel */}
      {showTutorial && (
        <LayoutTutorialBanner 
          onDismiss={dismissTutorial}
          onStartEdit={() => {
            dismissTutorial();
            setIsEditMode(true);
          }}
        />
      )}

      {/* Panneau Premium */}
      {isEditMode && !isDefaultPage && (
        <PremiumControlPanel
          isVisible={isEditMode}
          currentPageTheme={currentPage?.theme || 'default'}
          onThemeChange={(themeId) => setPageTheme(currentPage.id, themeId)}
        />
      )}

      {/* Bulles de pagination avec bouton Home */}
      {(pages.length > 1 || isEditMode) && (
        <PageDots
          pages={pages}
          currentIndex={currentPageIndex}
          onPageChange={setCurrentPage}
          isEditMode={isEditMode}
          onAddPage={handleAddPage}
          showHomeButton={!isDefaultPage}
          onSetAsHome={handleSetAsHome}
          isCurrentPageHome={isCurrentPageHome}
          defaultPageId={defaultPageId}
        />
      )}

      {/* Zone de contenu */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`page-transition rounded-3xl ${!isDefaultPage && currentTheme.colors.bg} ${!isDefaultPage ? 'p-3' : ''}`}
      >
        {/* Header de page utilisateur */}
        {!isDefaultPage && (
          <PageHeader
            page={currentPage}
            isEditMode={isEditMode}
            onRename={renamePage}
            onDelete={deletePage}
            isDefault={false}
          />
        )}

        <PinnedSectionsProvider>
          {isDefaultPage && <PinTipBanner />}
          
          <div className="space-y-3">
            {/* === PAGE SOCLE (3 éléments) === */}
            {isDefaultPage && (
              <>
                {/* 1. Widget Semaine */}
                {hasPregnancyProfile && (
                  <WeekDisplayWidget pregnancyProfile={pregnancyProfile} t={t} />
                )}
                
                {/* 2. Fête du jour */}
                <NameOfTheDay isDarkMode={isDarkMode} />
                
                {/* 3. Carte cliquable "Les étapes de votre plus beau voyage" */}
                <JourneyStepsCard t={t} navigate={navigate} />
              </>
            )}

            {/* === PAGES UTILISATEUR === */}
            {!isDefaultPage && (
              <>
                {/* Sections dupliquées */}
                {currentPage?.items?.filter(item => item.type === 'section').map((item, index) => (
                  <UserSectionCard
                    key={`section-${item.id}-${index}`}
                    item={item}
                    isEditMode={isEditMode}
                    onDragStart={(e) => handleDragStart(e, item.id, currentPage.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    isDragging={draggedItem === item.id}
                    pregnancyProfile={pregnancyProfile}
                    hasPregnancyProfile={hasPregnancyProfile}
                    t={t}
                  />
                ))}

                {/* Cartes individuelles dupliquées */}
                {currentPage?.items?.filter(item => item.type === 'card').map((item, index) => (
                  <Card 
                    key={`card-${item.id}-${index}`}
                    className="p-3 rounded-2xl bg-white/80 border border-slate-100 cursor-pointer hover:shadow-md"
                    onClick={() => navigate(item.path || '/')}
                  >
                    <p className="font-medium text-slate-700">{item.name || item.id}</p>
                  </Card>
                ))}

                {/* Page vide */}
                {(!currentPage?.items || currentPage.items.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-2">{t('home.emptyPage', 'Cette page est vide')}</p>
                    <p className="text-xs text-slate-300">
                      {t('home.goToJourneySteps', 'Allez dans "Les étapes de votre plus beau voyage" pour dupliquer des éléments')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </PinnedSectionsProvider>
      </div>

      {/* Bouton reset (pages utilisateur uniquement) */}
      {isEditMode && hasCustomLayout && !isDefaultPage && (
        <ResetLayoutButton onReset={resetToDefault} />
      )}
    </div>
  );
}

export default CustomizableHome;
