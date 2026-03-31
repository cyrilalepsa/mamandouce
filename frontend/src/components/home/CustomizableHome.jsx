import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, X, Home, Trash2, FolderOpen, ChevronRight } from 'lucide-react';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
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
import { DraggableItem, ItemGroup, GroupContentPopup } from './DragDropComponents';
import { UpcomingRemindersCard } from './UpcomingRemindersCard';
import { PushNotificationReminder } from './PushNotificationReminder';

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

// Carte cliquable "Les étapes de votre plus beau voyage" - Style PILL fine
function JourneyStepsCard({ t, navigate }) {
  return (
    <div 
      className="relative overflow-hidden cursor-pointer select-none rounded-full px-5 py-3
        shadow-md hover:shadow-lg transition-all duration-300
        hover:scale-[1.02] active:scale-[0.98]"
      style={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(253,242,248,0.9) 30%, rgba(244,114,182,0.35) 100%)',
        boxShadow: '0 3px 15px rgba(236,72,153,0.15), inset 0 1px 8px rgba(255,255,255,0.8)',
      }}
      onClick={() => navigate('/journey-steps')}
      data-testid="journey-steps-card"
    >
      {/* Effet de reflet glass en haut */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, transparent 100%)' }}
      />
      
      {/* Contenu centré sur une ligne */}
      <div className="relative flex items-center justify-center gap-2">
        <Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" fill="currentColor" />
        <span 
          className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-pink-400 whitespace-nowrap"
          style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
        >
          {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
        </span>
        <Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" fill="currentColor" />
      </div>
    </div>
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

// Bulles de pagination (en bas : Home gris + bulles rondes douces)
function PageDots({ pages, currentIndex, onPageChange, onSetAsHome, defaultPageId }) {
  const { t } = useTranslation();
  const currentPage = pages[currentIndex];
  const isCurrentPageHome = currentPage?.id === defaultPageId;
  
  // Séparer page socle et pages utilisateur
  const soclePage = pages.find(p => p.isDefault);
  const userPages = pages.filter(p => !p.isDefault);
  const socleIndex = pages.findIndex(p => p.isDefault);
  
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {/* Icône Home (sans bulle, en gris) */}
      <button
        onClick={onSetAsHome}
        className={`transition-all ${
          isCurrentPageHome
            ? 'text-slate-600'
            : 'text-slate-400 hover:text-slate-500'
        }`}
        title={isCurrentPageHome ? t('home.isDefaultPage', 'Page d\'accueil par défaut') : t('home.setAsHome', 'Définir comme page d\'accueil')}
      >
        <Home className="w-5 h-5" />
      </button>
      
      {/* Bulle ronde pour la page Socle */}
      {soclePage && (
        <button
          onClick={() => onPageChange(socleIndex)}
          className={`relative transition-all duration-300 rounded-full ${
            currentIndex === socleIndex
              ? 'w-3 h-3 bg-rose-300 shadow-sm'
              : 'w-2.5 h-2.5 bg-rose-200 hover:bg-rose-300'
          }`}
          title={t('home.soclePage', 'Page principale')}
        >
          {soclePage.id === defaultPageId && currentIndex !== socleIndex && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
          )}
        </button>
      )}
      
      {/* Bulles rondes pour les pages utilisateur */}
      {userPages.map((page) => {
        const pageIndex = pages.findIndex(p => p.id === page.id);
        return (
          <button
            key={page.id}
            onClick={() => onPageChange(pageIndex)}
            className={`relative transition-all duration-300 rounded-full ${
              currentIndex === pageIndex
                ? 'w-3 h-3 bg-violet-300 shadow-sm'
                : 'w-2.5 h-2.5 bg-violet-200 hover:bg-violet-300'
            }`}
            title={page.name}
          >
            {page.id === defaultPageId && currentIndex !== pageIndex && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
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
    defaultPageId,
    createGroupFromItems,
    addItemToGroup,
    removeItemFromGroup,
    renameGroup,
    deleteGroup
  } = useHomeLayout();

  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isPageShaking, setIsPageShaking] = useState(false);
  const [showCreatePagePrompt, setShowCreatePagePrompt] = useState(false);
  const pageLongPressTimer = useRef(null);
  
  // États pour le drag & drop
  const [draggingItem, setDraggingItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [openGroup, setOpenGroup] = useState(null);

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

  // Appui long sur page principale = créer nouvelle page
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

  // Appui long sur page utilisateur = afficher popup de suppression
  const handleUserPageLongPressStart = (e) => {
    const pageToCheck = pages[currentPageIndex];
    if (!pageToCheck || pageToCheck.isDefault) return;
    
    pageLongPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setShowDeleteConfirm(true);
    }, 500);
  };

  const handleUserPageLongPressEnd = () => {
    if (pageLongPressTimer.current) {
      clearTimeout(pageLongPressTimer.current);
    }
  };

  // === DRAG & DROP HANDLERS ===
  
  // Quand on commence à glisser un item
  const handleDragStart = (item) => {
    setDraggingItem(item);
  };

  // Quand on arrête de glisser
  const handleDragEnd = () => {
    setDraggingItem(null);
    setDropTarget(null);
  };

  // Quand on dépose un item sur un autre item (créer groupe)
  const handleDropOnItem = async (draggedItemId, targetItemId) => {
    if (!currentPage || currentPage.isDefault) return;
    
    // Demander le nom du groupe
    const groupName = prompt(t('home.groupNamePrompt', 'Nom du groupe :'), t('home.newGroup', 'Nouveau groupe'));
    if (groupName && createGroupFromItems) {
      await createGroupFromItems(currentPage.id, draggedItemId, targetItemId, groupName);
    }
    handleDragEnd();
  };

  // Quand on dépose un item sur un groupe existant
  const handleDropOnGroup = async (draggedItemId, groupId) => {
    if (!currentPage || currentPage.isDefault) return;
    
    if (addItemToGroup) {
      await addItemToGroup(currentPage.id, groupId, draggedItemId);
      toast.success(t('home.addedToGroup', 'Ajouté au groupe !'));
    }
    handleDragEnd();
  };

  // Ouvrir un groupe
  const handleOpenGroup = (group) => {
    setOpenGroup(group);
  };

  // Fermer le popup de groupe
  const handleCloseGroup = () => {
    setOpenGroup(null);
  };

  // Retirer un item d'un groupe
  const handleRemoveFromGroup = async (itemId) => {
    if (!currentPage || !openGroup) return;
    
    if (removeItemFromGroup) {
      await removeItemFromGroup(currentPage.id, openGroup.id, itemId);
      // Mettre à jour le groupe ouvert
      const updatedGroup = currentPage.groups?.find(g => g.id === openGroup.id);
      if (updatedGroup && updatedGroup.items.length > 0) {
        setOpenGroup(updatedGroup);
      } else {
        setOpenGroup(null);
      }
    }
  };

  // Renommer un groupe
  const handleRenameGroup = async (groupId, newName) => {
    if (!currentPage) return;
    if (renameGroup) {
      await renameGroup(currentPage.id, groupId, newName);
    }
  };

  // Supprimer un groupe
  const handleDeleteGroup = async (groupId) => {
    if (!currentPage) return;
    if (deleteGroup) {
      await deleteGroup(currentPage.id, groupId);
    }
  };

  const handleDeletePage = () => {
    const pageToDelete = pages[currentPageIndex];
    if (deletePage && pageToDelete && !pageToDelete.isDefault) {
      deletePage(pageToDelete.id);
      setIsPageShaking(false);
      setShowDeleteConfirm(false);
    }
  };

  // État pour le popup de création avec champ texte
  const [newPageName, setNewPageName] = useState('');
  
  // État pour le popup de confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Créer une page avec le nom du champ texte
  const handleAddPage = async () => {
    const pageName = newPageName.trim() || t('home.newPage', 'Nouvelle page');
    if (addPage) {
      await addPage(pageName);
      setNewPageName('');
      setShowCreatePagePrompt(false);
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
      {/* Popup créer une page (appui long sur page principale) - Style bulle/nuage */}
      {showCreatePagePrompt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-24 bg-black/20 backdrop-blur-[2px]">
          <div 
            className="relative bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 mx-4 max-w-xs w-full animate-in slide-in-from-bottom-4 duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(253,242,248,0.9) 100%)'
            }}
          >
            {/* Petite flèche en bas pour effet bulle */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-r border-b border-white/50"></div>
            
            {/* Décoration nuage */}
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-pink-100/50 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-purple-100/50 rounded-full blur-xl"></div>
            
            <div className="relative text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">✨</span>
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                {t('home.createPage', 'Créer une page')}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {t('home.createPageDesc', 'Créez votre page personnalisée')}
              </p>
              
              {/* Champ texte pour le nom */}
              <Input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder={t('home.pageNamePlaceholder', 'Nom de la page...')}
                className="w-full mb-4 rounded-2xl border-slate-200 focus:border-pink-300 focus:ring-pink-200 text-center"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreatePagePrompt(false);
                    setNewPageName('');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100/80 text-slate-600 font-medium hover:bg-slate-200/80 transition-all active:scale-95"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  onClick={handleAddPage}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all active:scale-95"
                >
                  {t('common.create', 'Créer')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup confirmation suppression de page */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center pb-24 bg-black/20 backdrop-blur-[2px]"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div 
            className="relative bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 mx-4 max-w-xs w-full animate-in slide-in-from-bottom-4 duration-300 select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,226,226,0.9) 100%)',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Petite flèche en bas pour effet bulle */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-r border-b border-white/50"></div>
            
            {/* Décoration nuage */}
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-red-100/50 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-rose-100/50 rounded-full blur-xl"></div>
            
            <div className="relative text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                {t('home.deletePage', 'Supprimer cette page ?')}
              </h3>
              <p className="text-sm text-slate-500 mb-2">
                <span className="font-medium text-slate-700">{currentPage?.name}</span>
              </p>
              <p className="text-xs text-red-500 mb-4 bg-red-50 rounded-xl py-2 px-3">
                {t('home.deletePageWarning', 'Tout ce qui s\'y trouve sera également supprimé.')}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100/80 text-slate-600 font-medium hover:bg-slate-200/80 transition-all active:scale-95"
                >
                  {t('common.no', 'Non')}
                </button>
                <button
                  onClick={handleDeletePage}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium shadow-lg shadow-red-500/25 hover:shadow-xl transition-all active:scale-95"
                >
                  {t('common.yes', 'Oui')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone de contenu */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`page-transition rounded-3xl min-h-[300px] select-none ${isPageShaking ? 'animate-wiggle' : ''}`}
        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={isDefaultPage ? handleSocleLongPressStart : handleUserPageLongPressStart}
        onMouseUp={isDefaultPage ? handleSocleLongPressEnd : handleUserPageLongPressEnd}
        onMouseLeave={isDefaultPage ? handleSocleLongPressEnd : handleUserPageLongPressEnd}
        onTouchStartCapture={isDefaultPage ? handleSocleLongPressStart : handleUserPageLongPressStart}
        onTouchEndCapture={isDefaultPage ? handleSocleLongPressEnd : handleUserPageLongPressEnd}
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
            {/* Carte de rappels/notifications - visible sur TOUTES les pages */}
            <UpcomingRemindersCard />
            
            {/* Rappel d'activation des notifications push (après 3 connexions) */}
            <PushNotificationReminder />

            {/* === PAGE PRINCIPALE (3 éléments) === */}
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
                <div className="text-center mb-2 select-none" style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
                  <h2 className="text-lg font-bold text-slate-700">{currentPage?.name}</h2>
                  <p className="text-[10px] text-slate-400">
                    {t('home.dragToGroup', 'Glissez un élément sur un autre pour créer un groupe')}
                  </p>
                </div>

                {/* Groupes existants */}
                {currentPage?.groups?.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {currentPage.groups.map((group) => (
                      <ItemGroup
                        key={group.id}
                        group={group}
                        onOpen={handleOpenGroup}
                        onRename={handleRenameGroup}
                        onDelete={handleDeleteGroup}
                        onDrop={(itemId) => handleDropOnGroup(itemId, group.id)}
                        isDropTarget={dropTarget === group.id}
                      />
                    ))}
                  </div>
                )}

                {/* Items individuels (drag & drop) */}
                {currentPage?.items?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {currentPage.items.map((item, index) => (
                      <DraggableItem
                        key={`item-${item.id}-${index}`}
                        item={item}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDrop={(draggedId, targetId) => handleDropOnItem(draggedId, targetId)}
                        isDragging={draggingItem?.id === item.id}
                        isDropTarget={dropTarget === item.id && draggingItem?.id !== item.id}
                        onRemove={(itemId) => removeItemFromPage(itemId, currentPage.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Page vide */}
                {(!currentPage?.items || currentPage.items.length === 0) && (!currentPage?.groups || currentPage.groups.length === 0) && (
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

      {/* Popup contenu du groupe */}
      {openGroup && (
        <GroupContentPopup
          group={openGroup}
          onClose={handleCloseGroup}
          onRemoveItem={handleRemoveFromGroup}
          t={t}
        />
      )}

      {/* Bulles de pagination (en bas de page) */}
      <PageDots
        pages={pages}
        currentIndex={currentPageIndex}
        onPageChange={setCurrentPage}
        onSetAsHome={handleSetAsHome}
        defaultPageId={defaultPageId}
      />
    </div>
  );
}

export default CustomizableHome;
