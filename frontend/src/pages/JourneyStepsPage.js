import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, Check, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../utils/api';
import { useHomeLayout } from '../contexts/HomeLayoutContext';
import {
  PreconceptionSection,
  PregnancySection,
  BabyPreparationSection,
  PostpartumSection,
  ServicesSection,
  PinnedSectionsProvider
} from '../components/home';

// Métadonnées des sections
const SECTION_META = {
  'preconception': { 
    icon: Sparkles, 
    name: 'En route vers la grossesse',
    bgGradient: 'from-amber-50/80 via-orange-50/60 to-yellow-50/80',
    borderColor: 'border-amber-200/50',
    editColor: 'text-amber-600 bg-amber-100',
  },
  'pregnancy': { 
    icon: Baby, 
    name: 'Grossesse',
    bgGradient: 'from-pink-50/80 via-rose-50/60 to-pink-100/80',
    borderColor: 'border-pink-200/50',
    editColor: 'text-pink-600 bg-pink-100',
  },
  'baby-preparation': { 
    icon: Gift, 
    name: 'Préparer l\'arrivée de bébé',
    bgGradient: 'from-purple-50/80 via-violet-50/60 to-purple-100/80',
    borderColor: 'border-purple-200/50',
    editColor: 'text-purple-600 bg-purple-100',
  },
  'postpartum': { 
    icon: HeartHandshake, 
    name: 'Suivi post-partum',
    bgGradient: 'from-rose-50/80 via-pink-50/60 to-rose-100/80',
    borderColor: 'border-rose-200/50',
    editColor: 'text-rose-600 bg-rose-100',
  },
  'services': { 
    icon: Settings, 
    name: 'Services et ressources',
    bgGradient: 'from-slate-50/80 via-gray-50/60 to-slate-100/80',
    borderColor: 'border-slate-200/50',
    editColor: 'text-slate-600 bg-slate-100',
  },
};

// Hook pour détecter le double tap
function useDoubleTap(callback, delay = 300) {
  const lastTap = useRef(0);
  
  const handleTap = useCallback((e) => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      callback(e);
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [callback, delay]);
  
  return handleTap;
}

// Hook pour détecter l'appui long
function useLongPress(callback, ms = 500) {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const start = useCallback((e) => {
    e.preventDefault();
    timerRef.current = setTimeout(() => {
      callbackRef.current(e);
      // Vibration si disponible
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, ms);
  }, [ms]);
  
  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: clear,
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
  };
}

// Popup de sélection de destination
function DuplicatePopup({ selectedItems, pages, onDuplicate, onCancel, onCreatePage, t }) {
  const userPages = pages.filter(p => !p.isDefault);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-700 mb-1 text-center">
          {t('journey.duplicateTo', 'Dupliquer vers...')}
        </h3>
        <p className="text-sm text-slate-500 mb-4 text-center">
          {selectedItems.length} {selectedItems.length > 1 ? t('journey.elements', 'éléments') : t('journey.element', 'élément')} {t('journey.selected', 'sélectionné(s)')}
        </p>
        
        <div className="space-y-2 mb-4">
          {userPages.length > 0 ? (
            userPages.map(page => (
              <button
                key={page.id}
                onClick={() => onDuplicate(page.id)}
                className="w-full p-3 text-left rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-pink-600 transition-all"
              >
                {page.name}
              </button>
            ))
          ) : (
            <p className="text-center text-sm text-slate-400 py-2">
              {t('journey.noUserPages', 'Aucune page personnalisée')}
            </p>
          )}
          
          <button
            onClick={onCreatePage}
            className="w-full p-3 text-left rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 hover:from-pink-100 hover:to-purple-100 transition-all font-medium"
          >
            + {t('journey.createNewPage', 'Créer une nouvelle page')}
          </button>
        </div>
        
        <Button onClick={onCancel} variant="outline" className="w-full rounded-full">
          {t('common.cancel', 'Annuler')}
        </Button>
      </Card>
    </div>
  );
}

// Carte de section avec mode édition par double tap
function SectionCard({ sectionId, isInEditMode, onToggleEditMode, selectedItems, onSelectItem, pregnancyProfile, hasPregnancyProfile, t }) {
  const meta = SECTION_META[sectionId];
  const Icon = meta.icon;
  
  // Composant de section
  const SectionComponents = {
    'preconception': PreconceptionSection,
    'pregnancy': PregnancySection,
    'baby-preparation': BabyPreparationSection,
    'postpartum': PostpartumSection,
    'services': ServicesSection,
  };
  const SectionComponent = SectionComponents[sectionId];
  
  // Double tap sur le titre
  const handleDoubleTap = useDoubleTap(() => {
    onToggleEditMode(sectionId);
  });
  
  // Appui long sur la section entière
  const longPressHandlers = useLongPress(() => {
    if (isInEditMode) {
      onSelectItem({ id: sectionId, type: 'section', name: meta.name });
    }
  });
  
  const isSelected = selectedItems.some(item => item.id === sectionId);
  const sectionProps = sectionId === 'pregnancy' ? { hasPregnancyProfile, pregnancyProfile } : {};
  
  return (
    <Card 
      className={`
        relative overflow-hidden
        bg-gradient-to-r ${meta.bgGradient}
        backdrop-blur-sm rounded-2xl
        border ${meta.borderColor}
        shadow-sm transition-all duration-300
        ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
        ${isInEditMode ? 'ring-1 ring-pink-200' : ''}
      `}
      {...(isInEditMode ? longPressHandlers : {})}
    >
      {/* Effet nuage */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Coche de sélection */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* Bandeau mode édition */}
      {isInEditMode && (
        <div 
          className={`px-3 py-2 cursor-pointer select-none ${meta.editColor} mx-2 mt-2 rounded-xl flex items-center gap-2`}
          onClick={handleDoubleTap}
          onTouchEnd={handleDoubleTap}
        >
          <Icon className="w-4 h-4" />
          <span className="font-semibold text-xs">
            {t('journey.editModeActive', 'Mode édition - Appui long pour sélectionner')}
          </span>
        </div>
      )}
      
      {/* Titre cliquable pour double tap (invisible mais cliquable sur la zone) */}
      {!isInEditMode && (
        <div 
          className="absolute top-0 left-0 right-0 h-12 cursor-pointer z-10"
          onClick={handleDoubleTap}
          onTouchEnd={handleDoubleTap}
        />
      )}
      
      {/* Contenu de la section */}
      <div className="px-3 pb-3">
        <SectionComponent {...sectionProps} />
      </div>
    </Card>
  );
}

function JourneyStepsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pages, addPage, duplicateItemToPage } = useHomeLayout();
  
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [editModeSections, setEditModeSections] = useState({}); // { sectionId: true/false }
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.pregnancy.getProfile();
      setPregnancyProfile(res.data);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const hasPregnancyProfile = pregnancyProfile && pregnancyProfile.current_week;

  // Toggle mode édition d'une section
  const handleToggleEditMode = (sectionId) => {
    setEditModeSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    // Désélectionner si on quitte le mode édition
    if (editModeSections[sectionId]) {
      setSelectedItems(prev => prev.filter(item => !item.id.startsWith(sectionId)));
    }
  };

  // Sélectionner/désélectionner un item
  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
    
    // Afficher le popup après sélection
    setTimeout(() => {
      if (selectedItems.length >= 0) {
        setShowDuplicatePopup(true);
      }
    }, 100);
  };

  // Dupliquer les items sélectionnés vers une page
  const handleDuplicate = async (pageId) => {
    for (const item of selectedItems) {
      if (duplicateItemToPage) {
        await duplicateItemToPage(item.id, pageId);
      }
    }
    toast.success(t('journey.duplicated', `${selectedItems.length} élément(s) dupliqué(s) !`));
    setSelectedItems([]);
    setShowDuplicatePopup(false);
    setEditModeSections({});
  };

  // Créer une nouvelle page puis dupliquer
  const handleCreatePageAndDuplicate = async () => {
    const name = prompt(t('home.enterPageName', 'Nom de la page :'), t('home.myPage', 'Ma page'));
    if (name && addPage) {
      await addPage(name);
      // La nouvelle page sera la dernière
      setTimeout(async () => {
        const newPageId = pages[pages.length - 1]?.id || `page-${Date.now()}`;
        await handleDuplicate(newPageId);
      }, 500);
    }
  };

  const hasAnyEditMode = Object.values(editModeSections).some(v => v);

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => navigate(-1)}
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
          </div>
          <div className="w-10"></div>
        </div>

        {/* Instruction */}
        <div className="text-center mb-4">
          <p className="text-xs text-slate-400">
            {t('journey.doubleTapInstruction', 'Double appui sur un titre pour passer en mode édition')}
          </p>
        </div>

        {/* Barre de sélection (si items sélectionnés) */}
        {selectedItems.length > 0 && (
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm rounded-2xl p-3 mb-4 shadow-lg border border-pink-100 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              {selectedItems.length} {t('journey.selected', 'sélectionné(s)')}
            </span>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowDuplicatePopup(true)}
                size="sm" 
                className="rounded-full bg-pink-500 hover:bg-pink-600"
              >
                {t('journey.duplicate', 'Dupliquer')}
              </Button>
              <Button 
                onClick={() => setSelectedItems([])}
                size="sm" 
                variant="ghost"
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Les 5 sections */}
        <PinnedSectionsProvider>
          <div className="space-y-3">
            {['preconception', 'pregnancy', 'baby-preparation', 'postpartum', 'services'].map((sectionId) => (
              <SectionCard
                key={sectionId}
                sectionId={sectionId}
                isInEditMode={editModeSections[sectionId]}
                onToggleEditMode={handleToggleEditMode}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                pregnancyProfile={pregnancyProfile}
                hasPregnancyProfile={hasPregnancyProfile}
                t={t}
              />
            ))}
          </div>
        </PinnedSectionsProvider>

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
          selectedItems={selectedItems}
          pages={pages}
          onDuplicate={handleDuplicate}
          onCancel={() => {
            setShowDuplicatePopup(false);
          }}
          onCreatePage={handleCreatePageAndDuplicate}
          t={t}
        />
      )}
    </div>
  );
}

export default JourneyStepsPage;
