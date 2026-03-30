import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, 
  Plus, FolderPlus, GripVertical, Trash2, Pencil, Check, X, Copy
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
    bgGradient: 'from-amber-50/80 via-orange-50/60 to-yellow-50/80',
    borderColor: 'border-amber-200/50',
  },
  'pregnancy': { 
    icon: Baby, 
    name: 'Grossesse',
    nameKey: 'sections.pregnancy',
    bgGradient: 'from-pink-50/80 via-rose-50/60 to-pink-100/80',
    borderColor: 'border-pink-200/50',
  },
  'baby-preparation': { 
    icon: Gift, 
    name: 'Préparer l\'arrivée de bébé',
    nameKey: 'sections.babyPreparation',
    bgGradient: 'from-purple-50/80 via-violet-50/60 to-purple-100/80',
    borderColor: 'border-purple-200/50',
  },
  'postpartum': { 
    icon: HeartHandshake, 
    name: 'Suivi post-partum',
    nameKey: 'sections.postpartum',
    bgGradient: 'from-rose-50/80 via-pink-50/60 to-rose-100/80',
    borderColor: 'border-rose-200/50',
  },
  'services': { 
    icon: Settings, 
    name: 'Services et ressources',
    nameKey: 'sections.services',
    bgGradient: 'from-slate-50/80 via-gray-50/60 to-slate-100/80',
    borderColor: 'border-slate-200/50',
  },
};

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

// Carte "Les étapes de votre plus beau voyage" avec les 5 sections (PAGE SOCLE)
function JourneyStepsContainer({ children, t }) {
  return (
    <Card className="bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 rounded-2xl p-4 shadow-sm border border-pink-100/50">
      {/* Header avec cœurs */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
        <h2 
          className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
        </h2>
        <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
      </div>
      
      {/* Les 5 sections */}
      <div className="space-y-2">
        {children}
      </div>
    </Card>
  );
}

// Carte de section compacte (style nuage)
function SectionCard({ item, isEditMode, isDraggable, onDragStart, onDragOver, onDrop, isDragging, onDuplicate, pregnancyProfile, hasPregnancyProfile, t, showDuplicateButton }) {
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
      className={`relative transition-all duration-300 ${isDragging ? 'opacity-50 scale-95' : ''}`}
      draggable={isDraggable && isEditMode}
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
          ${isDraggable && isEditMode ? 'cursor-grab active:cursor-grabbing ring-2 ring-pink-300/50' : ''}
        `}
      >
        {/* Effet nuage */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
        
        {/* Bouton dupliquer (sur page socle en mode édition) */}
        {showDuplicateButton && isEditMode && (
          <button
            onClick={() => onDuplicate(item.id)}
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center justify-center shadow-md transition-all"
            title={t('home.duplicateToPage', 'Dupliquer vers ma page')}
          >
            <Copy className="w-4 h-4 text-white" />
          </button>
        )}
        
        {/* Indicateur drag (pages utilisateur) */}
        {isDraggable && isEditMode && (
          <div className="absolute top-2 left-2 z-10">
            <div className="w-7 h-7 bg-pink-400 rounded-lg flex items-center justify-center shadow-sm animate-pulse">
              <GripVertical className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
        
        {/* Contenu */}
        <div className={`px-3 py-2 ${isDraggable && isEditMode ? 'pl-11' : ''} ${showDuplicateButton && isEditMode ? 'pr-11' : ''}`}>
          <SectionComponent {...sectionProps} />
        </div>
      </Card>
    </div>
  );
}

// Groupe personnalisé (pages utilisateur)
function CustomGroup({ group, isEditMode, onRename, onDelete, onDragOver, onDrop, children, t }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(group.name);
  
  const handleSave = () => {
    if (name.trim()) {
      onRename(group.id, name.trim());
    }
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gradient-to-br from-white/90 via-pink-50/50 to-purple-50/50 rounded-2xl p-3 border border-pink-100/50 shadow-sm">
      {/* Header du groupe */}
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-3 h-3 text-pink-400" fill="currentColor" />
        
        {isEditing ? (
          <div className="flex-1 flex items-center gap-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="h-7 text-sm rounded-full flex-1"
              autoFocus
            />
            <Button onClick={handleSave} size="sm" className="h-7 w-7 p-0 rounded-full bg-green-500">
              <Check className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <>
            <span className="flex-1 font-semibold text-sm text-slate-700 truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {group.name}
            </span>
            {isEditMode && (
              <div className="flex items-center gap-1">
                <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-slate-100 rounded">
                  <Pencil className="w-3 h-3 text-slate-400" />
                </button>
                <button onClick={() => onDelete(group.id)} className="p-1 hover:bg-red-50 rounded">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            )}
          </>
        )}
        
        <Heart className="w-3 h-3 text-pink-400" fill="currentColor" />
      </div>
      
      {/* Contenu */}
      <div 
        className="space-y-2 min-h-[50px]"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {children}
        {(!children || (Array.isArray(children) && children.length === 0)) && isEditMode && (
          <div className="text-center py-3 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
            {t('home.dropHere', 'Glissez ici')}
          </div>
        )}
      </div>
    </Card>
  );
}

// Composant principal
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
    setPageTheme,
    addGroup,
    renameGroup,
    deleteGroup,
    duplicateItemToPage
  } = useHomeLayout();

  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedFromPage, setDraggedFromPage] = useState(null);

  // Swipe entre pages
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
    if (distance > minSwipeDistance && currentPageIndex < pages.length - 1) {
      setCurrentPage(currentPageIndex + 1);
    }
    if (distance < -minSwipeDistance && currentPageIndex > 0) {
      setCurrentPage(currentPageIndex - 1);
    }
  };

  // Drag & Drop (pages utilisateur seulement)
  const handleDragStart = (e, itemId, pageId) => {
    setDraggedItem(itemId);
    setDraggedFromPage(pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetPageId, targetIndex, groupId = null) => {
    e.preventDefault();
    if (!draggedItem || !draggedFromPage) return;
    
    await moveItem(draggedItem, draggedFromPage, targetPageId, targetIndex, groupId);
    setDraggedItem(null);
    setDraggedFromPage(null);
  };

  // Dupliquer une section vers la page utilisateur active
  const handleDuplicate = async (sectionId) => {
    // Trouver la première page utilisateur (non socle)
    const userPageIndex = pages.findIndex(p => !p.isDefault);
    
    if (userPageIndex === -1) {
      // Créer une page utilisateur si elle n'existe pas
      const name = prompt(t('home.createPageFirst', 'Créez d\'abord une page. Nom de la page :'), t('home.myPage', 'Ma page'));
      if (name) {
        await addPage(name);
        // Après création, dupliquer
        setTimeout(async () => {
          if (duplicateItemToPage) {
            await duplicateItemToPage(sectionId, `page-${Date.now()}`);
          }
        }, 500);
      }
    } else {
      // Dupliquer vers la page utilisateur
      const userPage = pages[userPageIndex];
      if (duplicateItemToPage) {
        await duplicateItemToPage(sectionId, userPage.id);
        toast.success(t('home.duplicated', 'Section dupliquée !'));
        setCurrentPage(userPageIndex);
      } else {
        toast.info(t('home.duplicateManually', 'Créez une page puis ajoutez-y vos sections'));
      }
    }
  };

  // Ajouter une page
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
  const currentTheme = PAGE_THEMES.find(t => t.id === (currentPage?.theme || 'default')) || PAGE_THEMES[0];
  const isDefaultPage = currentPage?.isDefault;

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

      {/* Panneau Premium (mode édition) */}
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
        className={`page-transition rounded-3xl ${!isDefaultPage && currentTheme.colors.bg} ${!isDefaultPage ? 'p-3' : ''}`}
      >
        {/* Header de page (pages utilisateur) */}
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
            {/* === PAGE SOCLE === */}
            {isDefaultPage && (
              <>
                {/* Widget Semaine */}
                {hasPregnancyProfile && (
                  <WeekDisplayWidget pregnancyProfile={pregnancyProfile} t={t} />
                )}
                
                {/* Fête du jour */}
                <NameOfTheDay isDarkMode={isDarkMode} />
                
                {/* Carte "Les étapes de votre plus beau voyage" */}
                <JourneyStepsContainer t={t}>
                  {['preconception', 'pregnancy', 'baby-preparation', 'postpartum', 'services'].map((sectionId) => (
                    <SectionCard
                      key={sectionId}
                      item={{ id: sectionId, type: 'section' }}
                      isEditMode={isEditMode}
                      isDraggable={false}
                      showDuplicateButton={true}
                      onDuplicate={handleDuplicate}
                      pregnancyProfile={pregnancyProfile}
                      hasPregnancyProfile={hasPregnancyProfile}
                      t={t}
                    />
                  ))}
                </JourneyStepsContainer>
                
                {/* Instructions en mode édition */}
                {isEditMode && (
                  <div className="text-center py-3 bg-pink-50 rounded-xl border border-pink-200">
                    <p className="text-sm text-pink-600">
                      <Copy className="w-4 h-4 inline mr-1" />
                      {t('home.clickToDuplicate', 'Cliquez sur les icônes roses pour dupliquer vers votre page')}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* === PAGES UTILISATEUR === */}
            {!isDefaultPage && (
              <>
                {/* Sections dupliquées */}
                {currentPage?.items?.filter(item => item.type === 'section').map((item, index) => (
                  <SectionCard
                    key={`section-${item.id}-${index}`}
                    item={item}
                    isEditMode={isEditMode}
                    isDraggable={true}
                    showDuplicateButton={false}
                    onDragStart={(e) => handleDragStart(e, item.id, currentPage.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, currentPage.id, index)}
                    isDragging={draggedItem === item.id}
                    pregnancyProfile={pregnancyProfile}
                    hasPregnancyProfile={hasPregnancyProfile}
                    t={t}
                  />
                ))}

                {/* Groupes personnalisés */}
                {currentPage?.groups?.map((group) => (
                  <CustomGroup
                    key={group.id}
                    group={group}
                    isEditMode={isEditMode}
                    onRename={(gId, name) => renameGroup && renameGroup(currentPage.id, gId, name)}
                    onDelete={(gId) => deleteGroup && deleteGroup(currentPage.id, gId)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, currentPage.id, 0, group.id)}
                    t={t}
                  >
                    {group.items?.map((item, idx) => (
                      <SectionCard
                        key={`group-item-${item.id}-${idx}`}
                        item={item}
                        isEditMode={isEditMode}
                        isDraggable={true}
                        showDuplicateButton={false}
                        onDragStart={(e) => handleDragStart(e, item.id, currentPage.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, currentPage.id, idx, group.id)}
                        isDragging={draggedItem === item.id}
                        pregnancyProfile={pregnancyProfile}
                        hasPregnancyProfile={hasPregnancyProfile}
                        t={t}
                      />
                    ))}
                  </CustomGroup>
                ))}

                {/* Page vide */}
                {(!currentPage?.items || currentPage.items.length === 0) && (!currentPage?.groups || currentPage.groups.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-2">{t('home.emptyPage', 'Cette page est vide')}</p>
                    <p className="text-xs text-slate-300">
                      {t('home.goToMainPage', 'Allez sur la page principale et dupliquez des sections')}
                    </p>
                  </div>
                )}

                {/* Boutons d'action */}
                {isEditMode && (
                  <div className="flex gap-2 justify-center pt-2">
                    <Button onClick={handleAddGroup} variant="outline" size="sm" className="rounded-full text-xs gap-1">
                      <FolderPlus className="w-3 h-3" />
                      {t('home.addGroup', 'Groupe')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </PinnedSectionsProvider>

        {/* Bouton créer une page (mode édition, page socle) */}
        {isEditMode && isDefaultPage && (
          <div className="mt-4 text-center">
            <Button onClick={handleAddPage} className="rounded-full gap-2 bg-gradient-to-r from-pink-500 to-purple-500">
              <Plus className="w-4 h-4" />
              {t('home.createMyPage', 'Créer ma page personnalisée')}
            </Button>
          </div>
        )}
      </div>

      {/* Bouton édition */}
      <EditModeButton
        isEditMode={isEditMode}
        onToggle={() => setIsEditMode(!isEditMode)}
      />

      {/* Bouton reset */}
      {isEditMode && hasCustomLayout && (
        <ResetLayoutButton onReset={resetToDefault} />
      )}
    </div>
  );
}

export default CustomizableHome;
