import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, Check } from 'lucide-react';
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
    nameKey: 'sections.preconception',
    bgGradient: 'from-amber-50/80 via-orange-50/60 to-yellow-50/80',
    borderColor: 'border-amber-200/50',
    accentColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  'pregnancy': { 
    icon: Baby, 
    name: 'Grossesse',
    nameKey: 'sections.pregnancy',
    bgGradient: 'from-pink-50/80 via-rose-50/60 to-pink-100/80',
    borderColor: 'border-pink-200/50',
    accentColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  'baby-preparation': { 
    icon: Gift, 
    name: 'Préparer l\'arrivée de bébé',
    nameKey: 'sections.babyPreparation',
    bgGradient: 'from-purple-50/80 via-violet-50/60 to-purple-100/80',
    borderColor: 'border-purple-200/50',
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  'postpartum': { 
    icon: HeartHandshake, 
    name: 'Suivi post-partum',
    nameKey: 'sections.postpartum',
    bgGradient: 'from-rose-50/80 via-pink-50/60 to-rose-100/80',
    borderColor: 'border-rose-200/50',
    accentColor: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  'services': { 
    icon: Settings, 
    name: 'Services et ressources',
    nameKey: 'sections.services',
    bgGradient: 'from-slate-50/80 via-gray-50/60 to-slate-100/80',
    borderColor: 'border-slate-200/50',
    accentColor: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
};

// Composants de section
const SectionComponents = {
  'preconception': PreconceptionSection,
  'pregnancy': PregnancySection,
  'baby-preparation': BabyPreparationSection,
  'postpartum': PostpartumSection,
  'services': ServicesSection,
};

// Popup de sélection de destination
function DuplicatePopup({ pages, onDuplicate, onCancel, onCreatePage, t }) {
  const userPages = pages.filter(p => !p.isDefault);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-700 mb-1 text-center">
          {t('journey.duplicateTo', 'Dupliquer vers...')}
        </h3>
        <p className="text-sm text-slate-500 mb-4 text-center">
          {t('journey.sectionSelected', 'Section sélectionnée')}
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

function SectionDetailPage() {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const { t } = useTranslation();
  const { pages, addPage, duplicateItemToPage } = useHomeLayout();
  
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const longPressTimer = useRef(null);

  const meta = SECTION_META[sectionId];
  const SectionComponent = SectionComponents[sectionId];

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

  // Si section invalide
  if (!meta || !SectionComponent) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <p className="text-slate-500">{t('common.notFound', 'Section non trouvée')}</p>
      </div>
    );
  }

  const Icon = meta.icon;
  const sectionProps = sectionId === 'pregnancy' ? { hasPregnancyProfile, pregnancyProfile } : {};

  // Appui long pour sélectionner
  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsSelected(true);
      setShowDuplicatePopup(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Dupliquer vers une page
  const handleDuplicate = async (pageId) => {
    if (duplicateItemToPage) {
      await duplicateItemToPage(sectionId, pageId);
      toast.success(t('journey.duplicatedSuccess', 'Section dupliquée !'));
    }
    setIsSelected(false);
    setShowDuplicatePopup(false);
  };

  // Créer une nouvelle page puis dupliquer
  const handleCreatePageAndDuplicate = async () => {
    const name = prompt(t('home.enterPageName', 'Nom de la page :'), t('home.myPage', 'Ma page'));
    if (name && addPage) {
      const success = await addPage(name);
      if (success) {
        // Attendre que la page soit créée
        setTimeout(async () => {
          const updatedPages = pages;
          const newPage = updatedPages[updatedPages.length - 1];
          if (newPage && !newPage.isDefault) {
            await handleDuplicate(newPage.id);
          }
        }, 300);
      }
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => navigate('/journey-steps')}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
            data-testid="back-button"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <Icon className={`w-5 h-5 ${meta.accentColor}`} />
              <h1 className={`text-lg font-bold ${meta.accentColor}`}>
                {t(meta.nameKey, meta.name)}
              </h1>
            </div>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Message d'instruction */}
        <div className={`text-center mb-4 py-2 px-4 rounded-full ${meta.bgColor} inline-flex items-center gap-2 mx-auto`} style={{ display: 'flex', justifyContent: 'center' }}>
          <span className="text-xs text-slate-500">
            {t('section.longPressToSelect', 'Appui long pour sélectionner et dupliquer')}
          </span>
        </div>

        {/* Contenu de la section */}
        <Card 
          className={`
            relative overflow-hidden
            bg-gradient-to-r ${meta.bgGradient}
            backdrop-blur-sm rounded-2xl
            border ${meta.borderColor}
            shadow-sm transition-all duration-300
            ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2 animate-pulse' : ''}
          `}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          onTouchMove={handleLongPressEnd}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          data-testid={`section-content-${sectionId}`}
        >
          {/* Effet nuage */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Coche de sélection */}
          {isSelected && (
            <div className="absolute top-3 right-3 z-10 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          
          {/* Contenu */}
          <PinnedSectionsProvider>
            <div className="px-3 py-3">
              <SectionComponent {...sectionProps} />
            </div>
          </PinnedSectionsProvider>
        </Card>

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
          pages={pages}
          onDuplicate={handleDuplicate}
          onCancel={() => {
            setShowDuplicatePopup(false);
            setIsSelected(false);
          }}
          onCreatePage={handleCreatePageAndDuplicate}
          t={t}
        />
      )}
    </div>
  );
}

export default SectionDetailPage;
