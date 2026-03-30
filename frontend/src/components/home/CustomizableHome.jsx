import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, X, Home } from 'lucide-react';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';
import { Card } from '../ui/card';
import NameOfTheDay from '../NameOfTheDay';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';
import {
  PreconceptionSection,
  PregnancySection,
  BabyPreparationSection,
  PostpartumSection,
  ServicesSection,
  PinnedSectionsProvider
} from './NavigationSections';
import { PinTipBanner } from './PinTip';

// CSS pour l'animation de tremblement
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
    <Card className="bg-gradient-to-br from-pink-100/80 to-sky-100/80 rounded-2xl px-4 py-3 shadow-sm border-0" data-testid="week-display-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-500">{t('pregnancy.youAreAt', 'Vous êtes à la')}</p>
          <p className="text-base font-bold text-sky-600">{t('pregnancy.week', 'Semaine')} {pregnancyProfile.current_week} SA</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-500">{t('pregnancy.trimester', 'Trimestre')} {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}</p>
          {pregnancyProfile.estimated_due_date && (
            <p className="text-sm font-bold text-pink-600">
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
      className="bg-gradient-to-r from-white/90 via-pink-50/40 to-purple-50/40 rounded-2xl px-4 py-3 shadow-sm border border-pink-100/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 active:scale-[0.99]"
      onClick={() => navigate('/journey-steps')}
      data-testid="journey-steps-card"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" fill="currentColor" />
          <h2 
            className="text-[15px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 whitespace-nowrap"
            style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif", fontWeight: 700 }}
          >
            {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
          </h2>
          <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" fill="currentColor" />
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
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

// Bulles de pagination (toujours visibles : Home + Socle + pages créées)
function PageDots({ pages, currentIndex, onPageChange, onSetAsHome, defaultPageId }) {
  const { t } = useTranslation();
  const currentPage = pages[currentIndex];
  const isCurrentPageHome = currentPage?.id === defaultPageId;
  
  // Séparer page socle et pages utilisateur
  const soclePage = pages.find(p => p.isDefault);
  const userPages = pages.filter(p => !p.isDefault);
  const socleIndex = pages.findIndex(p => p.isDefault);
  
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {/* Bouton Home (toujours visible) */}
      <button
        onClick={onSetAsHome}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isCurrentPageHome
            ? 'bg-pink-500 text-white shadow-md'
            : 'bg-slate-100 hover:bg-pink-100 text-slate-400 hover:text-pink-500'
        }`}
        title={isCurrentPageHome ? t('home.isDefaultPage', 'Page d\'accueil par défaut') : t('home.setAsHome', 'Définir comme page d\'accueil')}
      >
        <Home className="w-3.5 h-3.5" />
      </button>
      
      {/* Point pour la page Socle */}
      {soclePage && (
        <button
          onClick={() => onPageChange(socleIndex)}
          className={`relative transition-all duration-300 ${
            currentIndex === socleIndex
              ? 'w-6 h-2.5 bg-pink-500 rounded-full'
              : 'w-2.5 h-2.5 bg-slate-300 rounded-full hover:bg-slate-400'
          }`}
          title={t('home.soclePage', 'Page Socle')}
        >
          {soclePage.id === defaultPageId && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full"></span>
          )}
        </button>
      )}
      
      {/* Points pour les pages utilisateur */}
      {userPages.map((page) => {
        const pageIndex = pages.findIndex(p => p.id === page.id);
        return (
          <button
            key={page.id}
            onClick={() => onPageChange(pageIndex)}
            className={`relative transition-all duration-300 ${
              currentIndex === pageIndex
                ? 'w-6 h-2.5 bg-purple-500 rounded-full'
                : 'w-2.5 h-2.5 bg-purple-300 rounded-full hover:bg-purple-400'
            }`}
            title={page.name}
          >
            {page.id === defaultPageId && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full"></span>
            )}
          </button>
        );
      })}
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
  const [showCreatePagePrompt, setShowCreatePagePrompt] = useState(false);
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

  // Appui long sur page socle = créer nouvelle page
  const handleSocleLongPressStart = (e) => {
    if (!currentPage?.isDefault) return;
    
    pageLongPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setShowCreatePagePrompt(true);
    }, 600);
  };

  const handleSocleLongPressEnd = () => {
    if (pageLongPressTimer.current) {
      clearTimeout(pageLongPressTimer.current);
    }
  };

  // Appui long sur page utilisateur = supprimer page
  const handleUserPageLongPressStart = (e) => {
    if (currentPage?.isDefault) return;
    if (e.target !== e.currentTarget) return;
    
    pageLongPressTimer.current = setTimeout(() => {
      setIsPageShaking(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleUserPageLongPressEnd = () => {
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

  // Créer une page
  const handleAddPage = async () => {
    setShowCreatePagePrompt(false);
    const name = prompt(t('home.enterPageName', 'Nom de la page :'), t('home.newPage', 'Nouvelle page'));
    if (name && addPage) {
      await addPage(name);
      // L'index est déjà mis à jour dans addPage (currentPageIndex: layout.pages.length)
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

  return (
    <div className="relative">
      {/* Popup créer une page (appui long sur socle) */}
      {showCreatePagePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <Card className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {t('home.createPage', 'Créer une page')}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {t('home.createPageDesc', 'Créez votre page personnalisée')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreatePagePrompt(false)}
                className="flex-1 py-2 px-4 rounded-full bg-slate-100 text-slate-600 font-medium"
              >
                {t('common.cancel', 'Annuler')}
              </button>
              <button
                onClick={handleAddPage}
                className="flex-1 py-2 px-4 rounded-full bg-pink-500 text-white font-medium"
              >
                {t('common.create', 'Créer')}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Bulles de pagination (toujours visibles) */}
      <PageDots
        pages={pages}
        currentIndex={currentPageIndex}
        onPageChange={setCurrentPage}
        onSetAsHome={handleSetAsHome}
        defaultPageId={defaultPageId}
      />

      {/* Zone de contenu */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`page-transition rounded-3xl min-h-[300px] ${isPageShaking ? 'animate-wiggle' : ''}`}
        onMouseDown={isDefaultPage ? handleSocleLongPressStart : handleUserPageLongPressStart}
        onMouseUp={isDefaultPage ? handleSocleLongPressEnd : handleUserPageLongPressEnd}
        onMouseLeave={isDefaultPage ? handleSocleLongPressEnd : handleUserPageLongPressEnd}
        onTouchStartCapture={isDefaultPage ? handleSocleLongPressStart : undefined}
        onTouchEndCapture={isDefaultPage ? handleSocleLongPressEnd : undefined}
      >
        {/* Bouton supprimer page (quand la page utilisateur tremble) */}
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
                {hasPregnancyProfile && (
                  <WeekDisplayWidget pregnancyProfile={pregnancyProfile} t={t} />
                )}
                <NameOfTheDay isDarkMode={isDarkMode} />
                <JourneyStepsCard t={t} navigate={navigate} />
                
                {/* Instruction appui long */}
                <p className="text-center text-[10px] text-slate-400 mt-4">
                  {t('home.longPressToCreate', 'Appui long pour créer une page')}
                </p>
              </>
            )}

            {/* === PAGES UTILISATEUR === */}
            {!isDefaultPage && (
              <>
                {/* Nom de la page */}
                <div className="text-center mb-2">
                  <h2 className="text-lg font-bold text-slate-700">{currentPage?.name}</h2>
                </div>

                {/* Sections dupliquées */}
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

                {/* Page vide */}
                {(!currentPage?.items || currentPage.items.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-2">{t('home.emptyPage', 'Cette page est vide')}</p>
                    <p className="text-xs text-slate-300">
                      {t('home.goToJourneySteps', 'Allez dans "Les étapes de votre plus beau voyage" pour dupliquer des éléments')}
                    </p>
                  </div>
                )}

                {/* Instruction */}
                <p className="text-center text-[10px] text-slate-400 mt-4">
                  {t('home.longPressToDelete', 'Appui long sur une carte pour supprimer')}
                </p>
              </>
            )}
          </div>
        </PinnedSectionsProvider>
      </div>
    </div>
  );
}

export default CustomizableHome;
