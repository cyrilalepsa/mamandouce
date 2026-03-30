import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, 
  ChevronRight, Plus, FolderPlus, GripVertical, Trash2, Pencil, Check, X
} from 'lucide-react';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';
import { useSubscription } from '../SubscriptionGate';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import NameOfTheDay from '../NameOfTheDay';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';
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

// Métadonnées des sections
const SECTION_META = {
  'preconception': { 
    icon: Sparkles, 
    name: 'En route vers la grossesse',
    nameKey: 'sections.preconception',
    color: 'amber',
    bgGradient: 'from-amber-50/80 via-orange-50/60 to-yellow-50/80',
    borderColor: 'border-amber-200/50',
  },
  'pregnancy': { 
    icon: Baby, 
    name: 'Grossesse',
    nameKey: 'sections.pregnancy',
    color: 'pink',
    bgGradient: 'from-pink-50/80 via-rose-50/60 to-pink-100/80',
    borderColor: 'border-pink-200/50',
  },
  'baby-preparation': { 
    icon: Gift, 
    name: 'Préparer l\'arrivée de bébé',
    nameKey: 'sections.babyPreparation',
    color: 'purple',
    bgGradient: 'from-purple-50/80 via-violet-50/60 to-purple-100/80',
    borderColor: 'border-purple-200/50',
  },
  'postpartum': { 
    icon: HeartHandshake, 
    name: 'Suivi post-partum',
    nameKey: 'sections.postpartum',
    color: 'rose',
    bgGradient: 'from-rose-50/80 via-pink-50/60 to-rose-100/80',
    borderColor: 'border-rose-200/50',
  },
  'services': { 
    icon: Settings, 
    name: 'Services et ressources',
    nameKey: 'sections.services',
    color: 'slate',
    bgGradient: 'from-slate-50/80 via-gray-50/60 to-slate-100/80',
    borderColor: 'border-slate-200/50',
  },
};

// Composant pour afficher le widget "Semaine de grossesse"
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

// Carte de section avec style nuage (pour l'accueil)
function SectionCard({ item, isEditMode, onDragStart, onDragOver, onDrop, isDragging, pregnancyProfile, hasPregnancyProfile, t }) {
  const meta = SECTION_META[item.id];
  const SectionComponent = SECTION_COMPONENTS[item.id];
  
  if (!meta || !SectionComponent) return null;
  
  const sectionProps = {};
  if (item.id === 'pregnancy') {
    sectionProps.hasPregnancyProfile = hasPregnancyProfile;
    sectionProps.pregnancyProfile = pregnancyProfile;
  }
  
  return (
    <div 
      className={`transition-all duration-300 ${isDragging ? 'opacity-50 scale-95' : ''}`}
      draggable={isEditMode}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Card 
        className={`
          relative overflow-hidden
          bg-gradient-to-r ${meta.bgGradient}
          backdrop-blur-sm rounded-2xl
          border ${meta.borderColor}
          shadow-sm hover:shadow-md
          transition-all duration-300
          ${isEditMode ? 'cursor-grab active:cursor-grabbing ring-2 ring-pink-300/50' : ''}
        `}
      >
        {/* Effet nuage subtil */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
        
        {/* Indicateur mode édition */}
        {isEditMode && (
          <div className="absolute top-2 left-2 z-10">
            <div className="w-8 h-8 bg-pink-400 rounded-lg flex items-center justify-center shadow-sm animate-pulse">
              <GripVertical className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
        
        {/* Contenu de la section */}
        <div className={`px-3 py-2 ${isEditMode ? 'pl-12' : ''}`}>
          <SectionComponent {...sectionProps} />
        </div>
      </Card>
    </div>
  );
}

// Groupe de sections personnalisé
function SectionGroup({ group, isEditMode, onRename, onDelete, onDragOver, onDrop, children, t }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(group.name);
  
  const handleSave = () => {
    if (name.trim()) {
      onRename(group.id, name.trim());
    }
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gradient-to-br from-white/90 via-pink-50/50 to-purple-50/50 rounded-2xl p-4 border border-pink-100/50 shadow-sm">
      {/* Header du groupe */}
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
        
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="h-8 text-sm rounded-full"
              autoFocus
            />
            <Button onClick={handleSave} size="sm" className="h-8 w-8 p-0 rounded-full bg-green-500">
              <Check className="w-4 h-4" />
            </Button>
            <Button onClick={() => setIsEditing(false)} size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <span className="flex-1 font-semibold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {group.name}
            </span>
            {isEditMode && (
              <div className="flex items-center gap-1">
                <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full">
                  <Pencil className="w-3 h-3 text-slate-400" />
                </Button>
                <Button onClick={() => onDelete(group.id)} size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full text-red-400 hover:text-red-600">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </>
        )}
        
        <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
      </div>
      
      {/* Contenu du groupe */}
      <div 
        className="space-y-2 min-h-[60px]"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {children}
        {(!children || (Array.isArray(children) && children.length === 0)) && isEditMode && (
          <div className="text-center py-4 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
            {t('home.dropSectionsHere', 'Glissez des sections ici')}
          </div>
        )}
      </div>
    </Card>
  );
}

// Composant principal pour l'écran d'accueil personnalisable
export function CustomizableHome({ pregnancyProfile, hasPregnancyProfile }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    setPageTheme,
    addGroup,
    renameGroup,
    deleteGroup
  } = useHomeLayout();

  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedFromPage, setDraggedFromPage] = useState(null);

  // Gestion du swipe
  const minSwipeDistance = 50;

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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentPageIndex < pages.length - 1) {
      setCurrentPage(currentPageIndex + 1);
    }
    if (isRightSwipe && currentPageIndex > 0) {
      setCurrentPage(currentPageIndex - 1);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e, itemId, pageId) => {
    setDraggedItem(itemId);
    setDraggedFromPage(pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetPageId, targetIndex) => {
    e.preventDefault();
    if (!draggedItem || !draggedFromPage) return;
    
    await moveItem(draggedItem, draggedFromPage, targetPageId, targetIndex);
    setDraggedItem(null);
    setDraggedFromPage(null);
  };

  // Ajouter une nouvelle page
  const handleAddPage = async () => {
    const name = prompt(t('home.enterPageName', 'Nom de la page :'), t('home.newPage', 'Nouvelle page'));
    if (name) {
      await addPage(name);
    }
  };

  // Ajouter un groupe
  const handleAddGroup = async () => {
    const name = prompt(t('home.enterGroupName', 'Nom du groupe :'), t('home.newGroup', 'Mon groupe'));
    if (name && addGroup) {
      await addGroup(currentPage.id, name);
    } else if (name) {
      toast.info(t('home.groupFeatureComingSoon', 'Fonctionnalité de groupes bientôt disponible'));
    }
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
  const currentTheme = PAGE_THEMES.find(t => t.id === (currentPage?.theme || 'default')) || PAGE_THEMES[0];

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
          currentPageTheme={currentPage?.theme || 'default'}
          onThemeChange={(themeId) => setPageTheme(currentPage.id, themeId)}
        />
      )}

      {/* Bulles de pagination */}
      {(pages.length > 1 || isEditMode) && (
        <PageDots
          pages={pages}
          currentIndex={currentPageIndex}
          onPageChange={setCurrentPage}
          isEditMode={isEditMode}
          onAddPage={handleAddPage}
        />
      )}

      {/* Zone de contenu */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`page-transition rounded-3xl ${!currentPage?.isDefault && currentTheme.colors.bg} ${!currentPage?.isDefault ? 'p-4' : ''}`}
      >
        {/* Header de page (si page personnalisée) */}
        <PageHeader
          page={currentPage}
          isEditMode={isEditMode}
          onRename={renamePage}
          onDelete={deletePage}
          isDefault={currentPage?.isDefault}
        />

        {/* Contenu de la page */}
        <PinnedSectionsProvider>
          {currentPage?.isDefault && <PinTipBanner />}
          
          <div className="space-y-3">
            {/* Widgets (semaine de grossesse, fête du jour) */}
            {currentPage?.items
              .filter(item => item.type !== 'section')
              .map((item, index) => (
                <div 
                  key={`widget-${item.id}-${index}`}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, item.id, currentPage.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, currentPage.id, index)}
                >
                  {item.id === 'week-display' && hasPregnancyProfile && (
                    <div className={`${isEditMode ? 'ring-2 ring-pink-300/50 rounded-2xl' : ''}`}>
                      {isEditMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="w-6 h-6 bg-pink-400 rounded-lg flex items-center justify-center">
                            <GripVertical className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                      <WeekDisplayWidget pregnancyProfile={pregnancyProfile} t={t} />
                    </div>
                  )}
                  {item.id === 'name-of-day' && (
                    <div className={`relative ${isEditMode ? 'ring-2 ring-pink-300/50 rounded-2xl' : ''}`}>
                      {isEditMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="w-6 h-6 bg-pink-400 rounded-lg flex items-center justify-center">
                            <GripVertical className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                      <NameOfTheDay isDarkMode={isDarkMode} />
                    </div>
                  )}
                </div>
              ))
            }
            
            {/* Les 5 sections */}
            {currentPage?.items
              .filter(item => item.type === 'section')
              .map((item, index) => (
                <SectionCard
                  key={`section-${item.id}-${index}`}
                  item={item}
                  isEditMode={isEditMode}
                  onDragStart={(e) => handleDragStart(e, item.id, currentPage.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, currentPage.id, index)}
                  isDragging={draggedItem === item.id}
                  pregnancyProfile={pregnancyProfile}
                  hasPregnancyProfile={hasPregnancyProfile}
                  t={t}
                />
              ))
            }

            {/* Groupes personnalisés */}
            {currentPage?.groups?.map((group, groupIndex) => (
              <SectionGroup
                key={group.id}
                group={group}
                isEditMode={isEditMode}
                onRename={renameGroup}
                onDelete={deleteGroup}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, currentPage.id, groupIndex, group.id)}
                t={t}
              >
                {group.items?.map((item, itemIndex) => (
                  <SectionCard
                    key={`group-section-${item.id}-${itemIndex}`}
                    item={item}
                    isEditMode={isEditMode}
                    onDragStart={(e) => handleDragStart(e, item.id, currentPage.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, currentPage.id, itemIndex, group.id)}
                    isDragging={draggedItem === item.id}
                    pregnancyProfile={pregnancyProfile}
                    hasPregnancyProfile={hasPregnancyProfile}
                    t={t}
                  />
                ))}
              </SectionGroup>
            ))}
          </div>
        </PinnedSectionsProvider>

        {/* Message si page vide */}
        {currentPage?.items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">{t('home.emptyPage', 'Cette page est vide')}</p>
            <p className="text-sm text-slate-300">
              {t('home.dragItemsHere', 'Faites glisser des éléments ici depuis une autre page')}
            </p>
          </div>
        )}

        {/* Boutons d'action en mode édition */}
        {isEditMode && (
          <div className="mt-4 flex gap-2 justify-center">
            <Button
              onClick={handleAddPage}
              variant="outline"
              className="rounded-full text-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('home.addPage', 'Nouvelle page')}
            </Button>
            <Button
              onClick={handleAddGroup}
              variant="outline"
              className="rounded-full text-sm gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              {t('home.addGroup', 'Nouveau groupe')}
            </Button>
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
