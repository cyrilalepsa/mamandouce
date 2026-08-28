import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';
import { useSubscription } from '../SubscriptionGate';
import { useTheme } from '../../contexts/ThemeContext';

// Composants extraits
import { PinnedSectionsProvider } from './NavigationSections';
import { PinTipBanner } from './PinTip';
import { GroupContentPopup } from './DragDropComponents';
import { UpcomingRemindersCard } from './UpcomingRemindersCard';
import { PushNotificationReminder } from './PushNotificationReminder';
import { TutorialPopup, InfoButton, useTutorial } from './TutorialPopup';
import { UserWelcomeHeader } from './HomeWidgets';
import { PageDots } from './HomePagination';
import { ScannerDockButton } from '../ScannerDockButton';
import { useScannerOverlay } from '../../contexts/ScannerOverlayContext';
import { HomePageSlider } from './HomePageSlider';
import { DeletePageConfirmModal, GroupNameModal, CreatePageModal } from './HomeModals';

// Hooks personnalisés
import { useSwipeNavigation, useLongPress, useDragAndDrop } from './hooks';

// CSS pour l'animation de tremblement - minimal pour éviter les flashs
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
    
    /* Animation de fade-in pour éviter le saut d'image */
    @keyframes fadeInSmooth {
      from { 
        opacity: 0;
        transform: translateY(5px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .fade-in-smooth {
      animation: fadeInSmooth 0.25s ease-out forwards;
    }
    
    /* Animation spéciale pour les cartes - délai pour éviter le saut */
    @keyframes cardFadeIn {
      0% { 
        opacity: 0;
        transform: scale(0.98);
      }
      100% { 
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .card-fade-in {
      animation: cardFadeIn 0.3s ease-out 0.05s forwards;
      opacity: 0;
    }
    
    /* Conteneur stable - pas de layout shift */
    .page-content-stable {
      min-height: 300px;
    }
    
    /* Optimisation GPU pour les cartes - CRITIQUE pour fluidité */
    .gpu-accelerated {
      transform: translateZ(0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    
    /* Transitions fluides style native */
    .smooth-transition {
      transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  opacity 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    /* Container sans layout shift - CRITIQUE */
    .no-layout-shift {
      contain: layout style paint;
    }
    
    /* Forcer la stabilité des éléments de la homepage */
    .homepage-stable-container {
      contain: layout style;
      content-visibility: auto;
    }
    
    /* Cartes avec position fixe pour éviter les sauts */
    .card-stable {
      transform: translateZ(0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      contain: layout paint;
    }
    
    /* Désactiver temporairement will-change après le montage */
    .mounted .card-stable {
      will-change: auto;
    }
  `;
  document.head.appendChild(style);
}

/**
 * CustomizableHome - Composant principal de la page d'accueil
 * Refactorisé pour utiliser des hooks et composants extraits
 */
export function CustomizableHome({ 
  pregnancyProfile, 
  hasPregnancyProfile, 
  userName, 
  userAvatar, 
  userAvatarConfig, 
  onPageTypeChange, 
  onAvatarClick 
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openScanner } = useScannerOverlay();
  const { isPremium } = useSubscription();
  const containerRef = useRef(null);
  
  // Context du layout
  const {
    isLoading,
    pages,
    currentPageIndex,
    setCurrentPage,
    addPage,
    deletePage,
    removeItemFromPage,
    setDefaultPage,
    defaultPageId,
    createGroupFromItems,
    addItemToGroup,
    removeItemFromGroup,
    changeGroupColor,
    renameGroup,
    deleteGroup
  } = useHomeLayout();

  // États locaux
  const [isPageShaking, setIsPageShaking] = useState(false);
  const [showCreatePagePrompt, setShowCreatePagePrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Page et type de page actuels
  const currentPage = pages[currentPageIndex];
  const isDefaultPage = currentPage?.isDefault;
  
  // Calculer le type de page pour le parent
  const userPagesOnly = pages.filter(p => !p.isDefault);
  const userPageIndex = userPagesOnly.findIndex(p => p.id === currentPage?.id);
  const isFirstUserPage = !isDefaultPage && userPageIndex === 0;

  // Hook de swipe
  const { swipeOffset, isSwiping, touchHandlers } = useSwipeNavigation({
    currentPageIndex,
    totalPages: pages.length,
    isDefaultPage,
    onPageChange: setCurrentPage
  });

  // Hook d'appui long
  const { longPressHandlers } = useLongPress({
    currentPage,
    isDefaultPage,
    onLongPress: () => setShowDeleteConfirm(true)
  });

  // Hook de drag & drop
  const {
    openGroup,
    selectedForGroup,
    showGroupNamePopup,
    newGroupName,
    newGroupColor,
    setSelectedForGroup,
    setNewGroupName,
    setNewGroupColor,
    handleDropOnItem,
    handleConfirmGroupCreation,
    handleCancelGroupCreation,
    handleOpenGroup,
    handleCloseGroup,
    handleRemoveFromGroup,
    handleRenameGroup,
    handleDeleteGroup,
    handleChangeGroupColor
  } = useDragAndDrop({
    currentPage,
    createGroupFromItems,
    addItemToGroup,
    removeItemFromGroup,
    changeGroupColor,
    renameGroup,
    deleteGroup,
    t
  });

  // Marquer comme monté après le premier rendu
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  // Notifier le parent du type de page actuelle
  useEffect(() => {
    if (onPageTypeChange) {
      if (isDefaultPage) {
        onPageTypeChange('default');
      } else if (isFirstUserPage) {
        onPageTypeChange('first-user');
      } else {
        onPageTypeChange('other-user');
      }
    }
  }, [currentPageIndex, isDefaultPage, isFirstUserPage, onPageTypeChange]);

  // Handlers
  const handleDeletePage = () => {
    const pageToDelete = pages[currentPageIndex];
    if (deletePage && pageToDelete && !pageToDelete.isDefault) {
      deletePage(pageToDelete.id);
      setIsPageShaking(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddPage = async () => {
    if (addPage) {
      await addPage();
      setShowCreatePagePrompt(false);
    }
  };

  const handleSetAsHome = async () => {
    if (setDefaultPage && currentPage) {
      await setDefaultPage(currentPage.id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative min-h-[400px]">
        <div className="space-y-3 animate-pulse">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 rounded-3xl bg-gradient-to-br from-sky-100 to-sky-50"></div>
            <div className="h-24 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-50"></div>
          </div>
          <div className="mt-28 pt-6 flex justify-center">
            <div className="h-12 w-64 rounded-full bg-gradient-to-br from-pink-100 to-pink-50"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative homepage-stable-container ${isMounted ? 'mounted' : ''}`}>
      {/* Modals */}
      <CreatePageModal
        isVisible={showCreatePagePrompt}
        onClose={() => setShowCreatePagePrompt(false)}
        onConfirm={handleAddPage}
      />

      <DeletePageConfirmModal
        isVisible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePage}
      />

      <GroupNameModal
        isVisible={showGroupNamePopup}
        groupName={newGroupName}
        groupColor={newGroupColor}
        onGroupNameChange={setNewGroupName}
        onGroupColorChange={setNewGroupColor}
        onConfirm={handleConfirmGroupCreation}
        onCancel={handleCancelGroupCreation}
      />

      {/* Zone de contenu avec transition fluide */}
      <div
        ref={containerRef}
        {...touchHandlers}
        {...(!isDefaultPage ? longPressHandlers : {})}
        className={`page-transition rounded-3xl min-h-[300px] select-none overflow-hidden ${isPageShaking ? 'animate-wiggle' : ''}`}
        style={{ 
          WebkitUserSelect: 'none', 
          WebkitTouchCallout: 'none',
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Bouton supprimer page (uniquement si page vide et utilisateur) */}
        {isPageShaking && !isDefaultPage && 
         (!currentPage?.items || currentPage.items.length === 0) && 
         (!currentPage?.groups || currentPage.groups.length === 0) && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
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
            {/* Carte de rappels/notifications - visible sur TOUTES les pages */}
            <UpcomingRemindersCard />
            
            {/* Rappel d'activation des notifications push (après 3 connexions) */}
            <PushNotificationReminder />

            {/* Logo MamanDouce + Bonjour User - affiché EN HAUT uniquement sur les pages utilisateur */}
            {!isDefaultPage && (
              <UserWelcomeHeader userName={userName} t={t} />
            )}

            {/* Slider horizontal des pages */}
            <HomePageSlider
              isSwiping={isSwiping}
              swipeOffset={swipeOffset}
              isDefaultPage={isDefaultPage}
              currentPage={currentPage}
              userPage={pages.find(p => !p.isDefault)}
              hasPregnancyProfile={hasPregnancyProfile}
              pregnancyProfile={pregnancyProfile}
              selectedForGroup={selectedForGroup}
              setSelectedForGroup={setSelectedForGroup}
              handleOpenGroup={handleOpenGroup}
              handleRenameGroup={handleRenameGroup}
              handleDeleteGroup={handleDeleteGroup}
              handleDropOnItem={handleDropOnItem}
              addItemToGroup={addItemToGroup}
              removeItemFromPage={removeItemFromPage}
              isPremium={isPremium}
            />
          </div>
        </PinnedSectionsProvider>
      </div>

      {/* Popup contenu du groupe */}
      {openGroup && (
        <GroupContentPopup
          group={openGroup}
          onClose={handleCloseGroup}
          onRemoveItem={handleRemoveFromGroup}
          onChangeColor={handleChangeGroupColor}
          onRename={handleRenameGroup}
          t={t}
        />
      )}

      {/* Bulles de pagination (en bas de page) */}
      <PageDots
        pages={pages}
        currentIndex={currentPageIndex}
        onPageChange={setCurrentPage}
        onSetAsHome={handleSetAsHome}
        onCreatePage={() => setShowCreatePagePrompt(true)}
        defaultPageId={defaultPageId}
      />

      <ScannerDockButton onClick={openScanner} />
    </div>
  );
}

export default CustomizableHome;
