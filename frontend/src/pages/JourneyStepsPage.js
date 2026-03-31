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

// Items simplifiés pour l'accordéon (aperçu rapide)
const SECTION_ITEMS = {
  'preconception': [
    { id: 'cycle-tracking', icon: '📅', name: 'Suivi de cycles', nameKey: 'preconception.cycleTracking', route: '/tracking' },
    { id: 'fertility-calc', icon: '📊', name: 'Calculateur fertilité', nameKey: 'preconception.fertilityCalc', route: '/tracking' },
    { id: 'preparation-advice', icon: '💡', name: 'Préparation et conseils', nameKey: 'preconception.preparationAdvice', route: '/preconception-tips' },
  ],
  'pregnancy': [
    { id: 'food-scanner', icon: '📷', name: 'Scanner aliments', nameKey: 'pregnancy.scanner', route: '/scanner' },
    { id: 'baby-names', icon: '👶', name: 'Liste des Prénoms', nameKey: 'pregnancy.babyNames', route: '/baby-names' },
    { id: 'tips-evolution', icon: '📖', name: 'Évolution et conseils', nameKey: 'pregnancy.tipsAndEvolution', route: '/tips' },
    { id: 'medical-appointments', icon: '🩺', name: 'Rendez-vous médicaux', nameKey: 'pregnancy.appointments', route: '/medical' },
    { id: 'parental-leave', icon: '⚖️', name: 'Congés parentaux', nameKey: 'pregnancy.parentalLeave', route: '/parental-leave' },
  ],
  'baby-preparation': [
    { id: 'birth-list', icon: '📝', name: 'Liste de naissance', nameKey: 'babyPrep.birthList', route: '/birth-list' },
    { id: 'maternity-bag', icon: '🧳', name: 'Valise maternité', nameKey: 'babyPrep.maternityBag', route: '/maternity-bag' },
    { id: 'preparation-tips', icon: '💝', name: 'Conseils préparation', nameKey: 'babyPrep.tips', route: '/tips' },
  ],
  'postpartum': [
    { id: 'postpartum-appointments', icon: '🏥', name: 'RDV post-partum', nameKey: 'postpartum.appointments', route: '/postpartum' },
    { id: 'breastfeeding', icon: '🤱', name: 'Allaitement', nameKey: 'postpartum.breastfeeding', route: '/postpartum' },
    { id: 'postpartum-tips', icon: '💜', name: 'Conseils post-partum', nameKey: 'postpartum.tips', route: '/tips' },
  ],
  'services': [
    { id: 'chatbot', icon: '🤖', name: 'Assistant IA', nameKey: 'services.chatbot', route: '/chatbot' },
    { id: 'videos', icon: '🎬', name: 'Vidéos', nameKey: 'services.videos', route: '/resources' },
    { id: 'resources', icon: '📚', name: 'Ressources', nameKey: 'services.resources', route: '/resources' },
  ],
};

// Popup discret pour dupliquer (style toast)
function DuplicatePopup({ sectionId, sectionName, pages, onDuplicate, onCancel, onCreatePage, t }) {
  const userPages = pages.filter(p => !p.isDefault);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  
  const handleCreateAndDuplicate = () => {
    const pageName = newPageName.trim() || t('home.newPage', 'Nouvelle page');
    onCreatePage(pageName, sectionId);
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
                className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium shadow-sm transition-all active:scale-[0.98]"
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

// Carte de section style PILL avec épingle accordéon
function SectionCard({ sectionId, onClick, onLongPress, isSelected, isPinned, onTogglePin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const meta = SECTION_META[sectionId];
  const Icon = meta.icon;
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const items = SECTION_ITEMS[sectionId] || [];

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
    // Si appui long ou si déroulé, ne pas naviguer
    if (isLongPress.current || isPinned) return;
    onClick();
  };

  const handlePinClick = (e) => {
    e.stopPropagation();
    onTogglePin?.(sectionId);
  };

  // Navigation vers un item spécifique
  const handleItemClick = (route) => {
    navigate(route);
  };

  return (
    <div className="transition-all duration-300">
      {/* Carte principale pill */}
      <div 
        className={`
          relative overflow-hidden cursor-pointer select-none
          rounded-full px-5 py-3
          shadow-lg hover:shadow-xl
          transition-all duration-300
          ${!isPinned ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
          ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
        `}
        style={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(253,242,248,0.9) 30%, rgba(244,114,182,0.4) 100%)',
          boxShadow: '0 4px 20px rgba(236,72,153,0.2), inset 0 2px 10px rgba(255,255,255,0.8)',
          WebkitUserSelect: 'none', 
          WebkitTouchCallout: 'none' 
        }}
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
        {/* Effet de reflet glass en haut */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)' }}
        />
        
        {/* Bouton épingle (sans bulle) */}
        <button
          onClick={handlePinClick}
          className={`absolute top-1/2 -translate-y-1/2 right-4 z-10 transition-all ${
            isPinned 
              ? 'text-pink-500 scale-110' 
              : 'text-slate-400 hover:text-pink-500'
          }`}
          title={isPinned ? t('journey.collapse', 'Replier') : t('journey.expand', 'Dérouler')}
        >
          <Pin className={`w-4 h-4 transition-transform ${isPinned ? 'fill-current rotate-45' : ''}`} />
        </button>
        
        {/* Badge sélection */}
        {isSelected && (
          <div className="absolute top-1/2 -translate-y-1/2 right-10 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center z-10 shadow-md">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        
        <div className="relative flex items-center gap-3 pr-8">
          {/* Icône */}
          <div className={`w-10 h-10 ${meta.iconBg} rounded-full flex items-center justify-center flex-shrink-0 shadow-inner`}>
            <Icon className={`w-5 h-5 ${meta.iconColor}`} />
          </div>
          
          {/* Texte */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-700 text-sm">
              {t(meta.nameKey, meta.name)}
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              {isPinned ? t('journey.tapItemToEnter', 'Touchez un élément') : t(meta.descKey, meta.description)}
            </p>
          </div>
        </div>
      </div>

      {/* Contenu déroulé (mosaïque) */}
      {isPinned && (
        <div className="mt-3 mx-1 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {items.slice(0, 6).map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.route)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/80 hover:bg-pink-50 transition-all shadow-sm border border-pink-100/30"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-slate-600 font-medium text-center leading-tight">{t(item.nameKey, item.name)}</span>
              </button>
            ))}
          </div>
          {items.length > 6 && (
            <button
              onClick={() => navigate(`/section/${sectionId}`)}
              className="w-full mt-2 px-4 py-2 text-center text-xs text-pink-500 font-medium hover:text-pink-600"
            >
              {t('journey.seeAll', 'Voir tout')} ({items.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function JourneyStepsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pages, addPage, duplicateItemToPage } = useHomeLayout();
  
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSectionName, setSelectedSectionName] = useState('');
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  
  // État des sections épinglées/déroulées (stockées dans localStorage)
  const [pinnedSections, setPinnedSections] = useState(() => {
    const saved = localStorage.getItem('mamandouce_expanded_journey_sections');
    return saved ? JSON.parse(saved) : [];
  });

  // Toggle épingle = dérouler/replier
  const togglePin = (sectionId) => {
    setPinnedSections(prev => {
      const newPinned = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      localStorage.setItem('mamandouce_expanded_journey_sections', JSON.stringify(newPinned));
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

        {/* Les 5 sections en cartes pill avec accordéon */}
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
