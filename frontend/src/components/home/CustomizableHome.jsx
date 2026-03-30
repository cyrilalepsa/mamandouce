import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
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

// CSS pour l'animation de tremblement (ajouté au head)
if (typeof document !== 'undefined' && !document.getElementById('wiggle-style')) {
  const style = document.createElement('style');
  style.id = 'wiggle-style';
  style.textContent = `
    @keyframes wiggle {
      0%, 100% { transform: rotate(-1deg); }
      50% { transform: rotate(1deg); }
    }
    .animate-wiggle {
      animation: wiggle 0.15s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

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

// Carte de section pour pages utilisateur (avec suppression par appui long)
function UserSectionCard({ item, onRemove, pregnancyProfile, hasPregnancyProfile, t }) {
  const [isShaking, setIsShaking] = useState(false);
  const longPressTimer = useRef(null);
  
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

  // Appui long pour activer le mode suppression
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsShaking(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsShaking(false);
    onRemove(item.id);
  };

  // Clic ailleurs pour annuler
  const handleClickOutside = () => {
    if (isShaking) setIsShaking(false);
  };
  
  return (
    <div 
      className={`relative transition-all duration-300 ${isShaking ? 'animate-wiggle' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClickOutside}
    >
      {/* Bouton supprimer (visible quand tremble) */}
      {isShaking && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
      
      <Card className={`relative overflow-hidden bg-gradient-to-r ${meta.bgGradient} rounded-2xl border ${meta.borderColor} shadow-sm ${isShaking ? 'ring-2 ring-red-300' : ''}`}>
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
        <div className="px-3 py-2">
          <SectionComponent {...sectionProps} />
        </div>
      </Card>
    </div>
  );
}

// Carte individuelle pour pages utilisateur (avec suppression par appui long)
function UserCard({ item, onRemove, navigate, t }) {
  const [isShaking, setIsShaking] = useState(false);
  const longPressTimer = useRef(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsShaking(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsShaking(false);
    onRemove(item.id);
  };

  const handleClick = () => {
    if (isShaking) {
      setIsShaking(false);
    } else {
      navigate(item.path || '/');
    }
  };

  return (
    <div 
      className={`relative transition-all duration-300 ${isShaking ? 'animate-wiggle' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {isShaking && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
      
      <Card 
        className={`p-3 rounded-2xl bg-white/80 border border-slate-100 cursor-pointer hover:shadow-md ${isShaking ? 'ring-2 ring-red-300' : ''}`}
        onClick={handleClick}
      >
        <p className="font-medium text-slate-700">{item.name || item.id}</p>
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
    isLoading,
    showTutorial,
    dismissTutorial,
    pages,
    currentPageIndex,
    setCurrentPage,
    addPage,
    deletePage,
    removeItemFromPage,
    setDefaultPage,
    defaultPageId
  } = useHomeLayout();

  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isPageShaking, setIsPageShaking] = useState(false);
  const pageLongPressTimer = useRef(null);

  // Swipe entre pages
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    if (distance > 50 && currentPageIndex < pages.length - 1) {
      setCurrentPage(currentPageIndex + 1);
    }
    if (distance < -50 && currentPageIndex > 0) {
      setCurrentPage(currentPageIndex - 1);
    }
  };

  // Appui long sur zone vide pour supprimer la page
  const handlePageLongPressStart = (e) => {
    // Seulement sur les pages utilisateur et si on clique sur le fond
    if (currentPage?.isDefault) return;
    if (e.target !== e.currentTarget) return;
    
    pageLongPressTimer.current = setTimeout(() => {
      setIsPageShaking(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handlePageLongPressEnd = () => {
    if (pageLongPressTimer.current) {
      clearTimeout(pageLongPressTimer.current);
    }
  };

  const handleDeletePage = () => {
    if (deletePage && currentPage && !currentPage.isDefault) {
      deletePage(currentPage.id);
      setIsPageShaking(false);
    }
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
  const isDefaultPage = currentPage?.isDefault;
  const isCurrentPageHome = currentPage?.id === defaultPageId;

  return (
    <div className="relative">
      {/* Tutoriel */}
      {showTutorial && (
        <LayoutTutorialBanner 
          onDismiss={dismissTutorial}
          onStartEdit={() => dismissTutorial()}
        />
      )}

      {/* Bulles de pagination avec bouton Home */}
      {pages.length > 1 && (
        <PageDots
          pages={pages}
          currentIndex={currentPageIndex}
          onPageChange={setCurrentPage}
          isEditMode={false}
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
        className={`page-transition rounded-3xl ${isPageShaking ? 'animate-wiggle' : ''}`}
        onMouseDown={handlePageLongPressStart}
        onMouseUp={handlePageLongPressEnd}
        onMouseLeave={handlePageLongPressEnd}
      >
        {/* Bouton supprimer page (quand la page tremble) */}
        {isPageShaking && !isDefaultPage && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleDeletePage}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-2 shadow-lg animate-pulse"
            >
              <X className="w-4 h-4" />
              {t('home.deletePage', 'Supprimer cette page')}
            </button>
          </div>
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
                {/* Sections dupliquées (avec suppression par appui long) */}
                {currentPage?.items?.filter(item => item.type === 'section').map((item, index) => (
                  <UserSectionCard
                    key={`section-${item.id}-${index}`}
                    item={item}
                    onRemove={(itemId) => removeItemFromPage(itemId, currentPage.id)}
                    pregnancyProfile={pregnancyProfile}
                    hasPregnancyProfile={hasPregnancyProfile}
                    t={t}
                  />
                ))}

                {/* Cartes individuelles dupliquées (avec suppression par appui long) */}
                {currentPage?.items?.filter(item => item.type === 'card').map((item, index) => (
                  <UserCard
                    key={`card-${item.id}-${index}`}
                    item={item}
                    onRemove={(itemId) => removeItemFromPage(itemId, currentPage.id)}
                    navigate={navigate}
                    t={t}
                  />
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
    </div>
  );
}

export default CustomizableHome;
