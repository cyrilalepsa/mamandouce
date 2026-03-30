import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, ChevronRight, Check } from 'lucide-react';
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

// Popup bulle pour dupliquer
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
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-20 bg-black/20 backdrop-blur-[2px]">
      <div 
        className="relative bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 mx-4 max-w-sm w-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(253,242,248,0.9) 100%)'
        }}
      >
        {/* Flèche bulle */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-r border-b border-white/50"></div>
        
        {/* Décoration nuage */}
        <div className="absolute -top-3 -right-3 w-16 h-16 bg-pink-100/50 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-purple-100/50 rounded-full blur-xl"></div>
        
        <div className="relative">
          {!showCreateForm ? (
            <>
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📋</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  {t('journey.duplicateTo', 'Dupliquer vers...')}
                </h3>
                <p className="text-sm text-slate-500">
                  {sectionName}
                </p>
              </div>
              
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {userPages.length > 0 ? (
                  userPages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => onDuplicate(page.id)}
                      className="w-full p-3.5 text-left rounded-2xl bg-white/60 hover:bg-pink-50 hover:text-pink-600 transition-all border border-slate-100 hover:border-pink-200 active:scale-[0.98]"
                    >
                      <span className="font-medium">{page.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 px-3 rounded-2xl bg-slate-50/50">
                    <p className="text-sm text-slate-400">
                      {t('journey.noUserPages', 'Aucune page personnalisée')}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-3.5 text-left rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 hover:from-pink-100 hover:to-purple-100 transition-all font-medium border border-pink-100 active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">+</span>
                    {t('journey.createNewPage', 'Créer une nouvelle page')}
                  </span>
                </button>
              </div>
              
              <button 
                onClick={onCancel} 
                className="w-full py-2.5 rounded-2xl bg-slate-100/80 text-slate-600 font-medium hover:bg-slate-200/80 transition-all active:scale-95"
              >
                {t('common.cancel', 'Annuler')}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">✨</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  {t('home.createPage', 'Créer une page')}
                </h3>
              </div>
              
              <Input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder={t('home.pageNamePlaceholder', 'Nom de la page...')}
                className="w-full mb-4 rounded-2xl border-slate-200 focus:border-pink-300 focus:ring-pink-200"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndDuplicate()}
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateForm(false)} 
                  className="flex-1 py-2.5 rounded-2xl bg-slate-100/80 text-slate-600 font-medium hover:bg-slate-200/80 transition-all active:scale-95"
                >
                  {t('common.back', 'Retour')}
                </button>
                <button 
                  onClick={handleCreateAndDuplicate}
                  disabled={!newPageName.trim()}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-lg shadow-pink-500/25 hover:shadow-xl disabled:opacity-50 transition-all active:scale-95"
                >
                  {t('common.create', 'Créer')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Carte de section avec appui long pour dupliquer
function SectionCard({ sectionId, onClick, onLongPress, isSelected }) {
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

  return (
    <Card 
      className={`
        relative overflow-hidden cursor-pointer
        bg-gradient-to-r ${meta.bgGradient}
        backdrop-blur-sm rounded-2xl
        border ${meta.borderColor}
        shadow-sm hover:shadow-md
        transition-all duration-300
        hover:scale-[1.01] active:scale-[0.99]
        ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
      `}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={() => clearTimeout(longPressTimer.current)}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => clearTimeout(longPressTimer.current)}
      data-testid={`section-card-${sectionId}`}
    >
      {/* Effet nuage */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Badge sélection */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center z-10">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
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
        
        {/* Flèche */}
        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
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
