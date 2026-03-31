import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, ChevronRight, Check, Pin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useHomeLayout } from '../contexts/HomeLayoutContext';

// Métadonnées des sections
const SECTION_META = {
  'preconception': { 
    icon: Sparkles, 
    name: 'En route vers la grossesse',
    nameKey: 'sections.preconception',
    description: 'Préparez votre corps et votre esprit',
    descKey: 'sections.preconceptionDesc',
    bgGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200/50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  'pregnancy': { 
    icon: Baby, 
    name: 'Grossesse',
    nameKey: 'sections.pregnancy',
    description: 'Suivez votre grossesse semaine par semaine',
    descKey: 'sections.pregnancyDesc',
    bgGradient: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-200/50',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  'baby-preparation': { 
    icon: Gift, 
    name: 'Préparer l\'arrivée de bébé',
    nameKey: 'sections.babyPreparation',
    description: 'Tout pour accueillir votre bébé',
    descKey: 'sections.babyPreparationDesc',
    bgGradient: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200/50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  'postpartum': { 
    icon: HeartHandshake, 
    name: 'Suivi post-partum',
    nameKey: 'sections.postpartum',
    description: 'Accompagnement après l\'accouchement',
    descKey: 'sections.postpartumDesc',
    bgGradient: 'from-rose-50 to-pink-50',
    borderColor: 'border-rose-200/50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  'services': { 
    icon: Settings, 
    name: 'Services et ressources',
    nameKey: 'sections.services',
    description: 'Outils et ressources utiles',
    descKey: 'sections.servicesDesc',
    bgGradient: 'from-slate-50 to-gray-50',
    borderColor: 'border-slate-200/50',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
};

const SECTIONS_ORDER = ['preconception', 'pregnancy', 'baby-preparation', 'postpartum', 'services'];

// Popup discret pour dupliquer (style toast)
function DuplicatePopup({ sectionId, sectionName, pages, onDuplicate, onCancel, onCreatePage, t }) {
  const userPages = pages.filter(p => !p.isDefault);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  
  const handleCreateAndDuplicate = () => {
    if (newPageName.trim()) {
      onCreatePage(newPageName.trim(), sectionId);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center pb-6"
      onClick={onCancel}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white/98 backdrop-blur-xl rounded-3xl p-4 shadow-lg border border-slate-100/50 mx-4 max-w-xs w-full animate-in slide-in-from-bottom-4 duration-200"
      >
        <div className="relative">
          {!showCreateForm ? (
            <>
              {/* Header compact */}
              <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm">📋</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">{t('journey.duplicateTo', 'Dupliquer vers')}</p>
                  <p className="text-sm font-medium text-slate-700 truncate">{sectionName}</p>
                </div>
                <button 
                  onClick={onCancel}
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <span className="text-slate-400 text-xs">✕</span>
                </button>
              </div>
              
              {/* Liste compacte des pages */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {userPages.length > 0 ? (
                  userPages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => onDuplicate(page.id)}
                      className="w-full p-2.5 text-left rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-pink-600 transition-all text-sm font-medium text-slate-600"
                    >
                      {page.name}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">
                    {t('journey.noUserPages', 'Aucune page personnalisée')}
                  </p>
                )}
                
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-2.5 text-left rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <span className="text-base">+</span>
                  {t('journey.createNewPage', 'Nouvelle page')}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Formulaire création compact */}
              <div className="flex items-center gap-2 mb-3">
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <span className="text-slate-400 text-xs">←</span>
                </button>
                <p className="text-sm font-medium text-slate-700">
                  {t('home.createPage', 'Nouvelle page')}
                </p>
              </div>
              
              <Input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder={t('home.pageNamePlaceholder', 'Nom de la page...')}
                className="w-full mb-3 rounded-xl border-slate-200 text-sm h-10"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndDuplicate()}
              />
              
              <button 
                onClick={handleCreateAndDuplicate}
                disabled={!newPageName.trim()}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium shadow-sm disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {t('common.create', 'Créer')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Carte de section avec appui long pour dupliquer et épingle pour ouvrir/fermer
function SectionCard({ sectionId, onClick, onLongPress, isSelected, isPinned, onTogglePin }) {
  const { t } = useTranslation();
  const meta = SECTION_META[sectionId];
  const Icon = meta.icon;
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  const handleTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      onLongPress(sectionId, t(meta.nameKey, meta.name));
    }, 500);
  };

  const handleTouchEnd = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (isLongPress.current) {
      e.preventDefault();
    }
  };

  const handleClick = (e) => {
    if (!isLongPress.current) {
      onClick();
    }
  };

  const handlePinClick = (e) => {
    e.stopPropagation();
    onTogglePin?.(sectionId);
  };

  return (
    <Card 
      className={`
        relative overflow-hidden cursor-pointer select-none
        bg-gradient-to-r ${meta.bgGradient}
        backdrop-blur-sm rounded-2xl
        border ${meta.borderColor}
        shadow-sm hover:shadow-md
        transition-all duration-300
        hover:scale-[1.01] active:scale-[0.99]
        ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
      `}
      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={() => clearTimeout(longPressTimer.current)}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => clearTimeout(longPressTimer.current)}
      onContextMenu={(e) => e.preventDefault()}
      data-testid={`section-card-${sectionId}`}
    >
      {/* Effet nuage */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Badge sélection */}
      {isSelected && (
        <div className="absolute top-2 right-10 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center z-10">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Bouton épingle */}
      <button
        onClick={handlePinClick}
        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all ${
          isPinned 
            ? 'bg-pink-500 text-white shadow-lg' 
            : 'bg-white/60 text-slate-400 hover:bg-white hover:text-pink-500'
        }`}
        title={isPinned ? t('journey.unpin', 'Retirer l\'épingle') : t('journey.pin', 'Épingler')}
      >
        <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
      </button>
      
      <div className="p-4 flex items-center gap-4">
        {/* Icône */}
        <div className={`w-12 h-12 ${meta.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${meta.iconColor}`} />
        </div>
        
        {/* Texte */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-700 text-base">
            {t(meta.nameKey, meta.name)}
          </h3>
          <p className="text-xs text-slate-500 truncate">
            {t(meta.descKey, meta.description)}
          </p>
        </div>
      </div>
    </Card>
  );
}

function JourneyStepsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pages, addPage, duplicateItemToPage } = useHomeLayout();
  
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSectionName, setSelectedSectionName] = useState('');
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  
  // État des sections épinglées (stockées dans localStorage)
  const [pinnedSections, setPinnedSections] = useState(() => {
    const saved = localStorage.getItem('mamandouce_pinned_journey_sections');
    return saved ? JSON.parse(saved) : [];
  });

  // Sauvegarder les épingles dans localStorage
  const togglePin = (sectionId) => {
    setPinnedSections(prev => {
      const newPinned = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      localStorage.setItem('mamandouce_pinned_journey_sections', JSON.stringify(newPinned));
      return newPinned;
    });
  };

  // Navigation vers la page de détail de la section
  const handleSectionClick = (sectionId) => {
    navigate(`/section/${sectionId}`);
  };

  // Appui long pour dupliquer
  const handleLongPress = (sectionId, sectionName) => {
    setSelectedSection(sectionId);
    setSelectedSectionName(sectionName);
    setShowDuplicatePopup(true);
  };

  // Dupliquer vers une page existante
  const handleDuplicate = async (pageId) => {
    if (duplicateItemToPage && selectedSection) {
      await duplicateItemToPage(selectedSection, pageId);
      toast.success(t('journey.duplicatedSuccess', 'Section dupliquée !'));
    }
    setShowDuplicatePopup(false);
    setSelectedSection(null);
  };

  // Créer une nouvelle page et dupliquer
  const handleCreatePageAndDuplicate = async (pageName, sectionId) => {
    if (addPage) {
      const success = await addPage(pageName);
      if (success) {
        // Attendre un peu puis dupliquer
        setTimeout(async () => {
          const newPages = pages;
          const newPage = newPages[newPages.length - 1];
          if (newPage && !newPage.isDefault && duplicateItemToPage) {
            await duplicateItemToPage(sectionId, newPage.id);
            toast.success(t('journey.pageCreatedAndDuplicated', 'Page créée et section dupliquée !'));
          }
        }, 300);
      }
    }
    setShowDuplicatePopup(false);
    setSelectedSection(null);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
            data-testid="back-button"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
              <h1 
                className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
              </h1>
              <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
            </div>
            <p className="text-xs text-slate-400">
              {t('journey.longPressHint', 'Appui long pour dupliquer · Clic pour entrer')}
            </p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Les 5 sections en cartes cliquables */}
        <div className="space-y-3">
          {SECTIONS_ORDER.map((sectionId) => (
            <SectionCard
              key={sectionId}
              sectionId={sectionId}
              onClick={() => handleSectionClick(sectionId)}
              onLongPress={handleLongPress}
              isSelected={selectedSection === sectionId}
              isPinned={pinnedSections.includes(sectionId)}
              onTogglePin={togglePin}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
            <Heart className="w-4 h-4 text-pink-300" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Popup de duplication */}
      {showDuplicatePopup && (
        <DuplicatePopup
          sectionId={selectedSection}
          sectionName={selectedSectionName}
          pages={pages}
          onDuplicate={handleDuplicate}
          onCancel={() => {
            setShowDuplicatePopup(false);
            setSelectedSection(null);
          }}
          onCreatePage={handleCreatePageAndDuplicate}
          t={t}
        />
      )}
    </div>
  );
}

export default JourneyStepsPage;
