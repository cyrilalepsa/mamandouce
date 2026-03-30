import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, Pencil, Check, GripVertical, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../utils/api';
import {
  PreconceptionSection,
  PregnancySection,
  BabyPreparationSection,
  PostpartumSection,
  ServicesSection,
  PinnedSectionsProvider
} from '../components/home';

// Configuration par défaut des sections
const DEFAULT_SECTIONS = [
  { id: 'preconception', order: 0 },
  { id: 'pregnancy', order: 1 },
  { id: 'baby-preparation', order: 2 },
  { id: 'postpartum', order: 3 },
  { id: 'services', order: 4 },
];

// Métadonnées des sections (icônes, couleurs, style nuage)
const SECTION_META = {
  'preconception': { 
    icon: Sparkles, 
    name: 'En route vers la grossesse',
    nameKey: 'sections.preconception',
    color: 'amber',
    bgGradient: 'from-amber-50/80 via-orange-50/60 to-yellow-50/80',
    borderColor: 'border-amber-200/50',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-400',
    textColor: 'text-amber-600',
    shadowColor: 'shadow-amber-100/50'
  },
  'pregnancy': { 
    icon: Baby, 
    name: 'Grossesse',
    nameKey: 'sections.pregnancy',
    color: 'pink',
    bgGradient: 'from-pink-50/80 via-rose-50/60 to-pink-100/80',
    borderColor: 'border-pink-200/50',
    iconBg: 'bg-gradient-to-br from-pink-400 to-rose-400',
    textColor: 'text-pink-600',
    shadowColor: 'shadow-pink-100/50'
  },
  'baby-preparation': { 
    icon: Gift, 
    name: 'Préparer l\'arrivée de bébé',
    nameKey: 'sections.babyPreparation',
    color: 'purple',
    bgGradient: 'from-purple-50/80 via-violet-50/60 to-purple-100/80',
    borderColor: 'border-purple-200/50',
    iconBg: 'bg-gradient-to-br from-purple-400 to-violet-400',
    textColor: 'text-purple-600',
    shadowColor: 'shadow-purple-100/50'
  },
  'postpartum': { 
    icon: HeartHandshake, 
    name: 'Suivi post-partum',
    nameKey: 'sections.postpartum',
    color: 'rose',
    bgGradient: 'from-rose-50/80 via-pink-50/60 to-rose-100/80',
    borderColor: 'border-rose-200/50',
    iconBg: 'bg-gradient-to-br from-rose-400 to-pink-400',
    textColor: 'text-rose-600',
    shadowColor: 'shadow-rose-100/50'
  },
  'services': { 
    icon: Settings, 
    name: 'Services et ressources',
    nameKey: 'sections.services',
    color: 'slate',
    bgGradient: 'from-slate-50/80 via-gray-50/60 to-slate-100/80',
    borderColor: 'border-slate-200/50',
    iconBg: 'bg-gradient-to-br from-slate-400 to-gray-400',
    textColor: 'text-slate-600',
    shadowColor: 'shadow-slate-100/50'
  },
};

// Composant carte nuage pour une section
function CloudSectionCard({ section, index, isEditMode, onDragStart, onDragOver, onDrop, isDragging, children, t }) {
  const meta = SECTION_META[section.id];
  const Icon = meta.icon;
  
  return (
    <div 
      className={`transition-all duration-300 ${isDragging ? 'opacity-50 scale-95' : ''}`}
      draggable={isEditMode}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      <Card 
        className={`
          relative overflow-hidden
          bg-gradient-to-br ${meta.bgGradient}
          backdrop-blur-sm
          rounded-[2rem]
          border ${meta.borderColor}
          shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${meta.shadowColor}
          hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]
          transition-all duration-300
          ${isEditMode ? 'cursor-grab active:cursor-grabbing ring-2 ring-pink-300/50 ring-offset-2' : ''}
        `}
      >
        {/* Effet nuage décoratif */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
        
        {/* Header de la carte avec étape et icône */}
        <div className="relative p-4 pb-2">
          <div className="flex items-center gap-3">
            {/* Badge étape */}
            <div className={`
              w-12 h-12 ${meta.iconBg} rounded-2xl 
              flex items-center justify-center 
              shadow-lg
              ${isEditMode ? 'animate-pulse' : ''}
            `}>
              {isEditMode ? (
                <GripVertical className="w-6 h-6 text-white" />
              ) : (
                <Icon className="w-6 h-6 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <span className={`text-xs font-semibold ${meta.textColor} uppercase tracking-wide`}>
                {t('journey.step', 'Étape')} {index + 1}
              </span>
              {isEditMode && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('journey.dragToReorder', 'Glissez pour réorganiser')}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Contenu de la section (CollapsibleSection avec épingle) */}
        <div className="px-4 pb-4">
          {children}
        </div>
      </Card>
    </div>
  );
}

function JourneyStepsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem('journeySectionsOrder');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SECTIONS;
      }
    }
    return DEFAULT_SECTIONS;
  });
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hasCustomOrder, setHasCustomOrder] = useState(false);

  useEffect(() => {
    loadProfile();
    const saved = localStorage.getItem('journeySectionsOrder');
    setHasCustomOrder(!!saved);
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

  // Gestion du drag & drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, draggedItem);
    
    const updatedSections = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(updatedSections);
    
    localStorage.setItem('journeySectionsOrder', JSON.stringify(updatedSections));
    setHasCustomOrder(true);
    setDraggedIndex(null);
    
    toast.success(t('journey.orderSaved', 'Ordre sauvegardé'));
  };

  const handleReset = () => {
    setSections(DEFAULT_SECTIONS);
    localStorage.removeItem('journeySectionsOrder');
    setHasCustomOrder(false);
    setIsEditMode(false);
    toast.success(t('journey.orderReset', 'Ordre réinitialisé'));
  };

  // Rendu d'une section selon son ID
  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'preconception':
        return <PreconceptionSection />;
      case 'pregnancy':
        return (
          <PregnancySection 
            hasPregnancyProfile={hasPregnancyProfile}
            pregnancyProfile={pregnancyProfile}
          />
        );
      case 'baby-preparation':
        return <BabyPreparationSection />;
      case 'postpartum':
        return <PostpartumSection />;
      case 'services':
        return <ServicesSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
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
              <Heart className="w-5 h-5 text-pink-400" fill="currentColor" />
              <h1 
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
              </h1>
              <Heart className="w-5 h-5 text-pink-400" fill="currentColor" />
            </div>
            <p className="text-sm text-slate-500">
              {t('journey.subtitle', 'Votre compagnon à chaque étape')}
            </p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Bannière d'introduction */}
        <Card className="bg-gradient-to-br from-pink-50/90 via-white/80 to-purple-50/90 backdrop-blur-sm rounded-[2rem] p-5 mb-6 border border-pink-100/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t('journey.welcomeTitle', 'Bienvenue dans votre parcours')}
              </h2>
              <p className="text-sm text-slate-600">
                {t('journey.welcomeDesc', 'De la conception à l\'arrivée de bébé, nous sommes là pour vous accompagner. Explorez chaque étape à votre rythme.')}
              </p>
              {isEditMode && (
                <div className="mt-2 flex items-center gap-2 text-pink-500">
                  <GripVertical className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {t('journey.dragHint', 'Glissez-déposez les cartes pour les réorganiser')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Les 5 sections dans des cartes nuage */}
        <PinnedSectionsProvider>
          <div className="space-y-5">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <CloudSectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  isEditMode={isEditMode}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={draggedIndex === index}
                  t={t}
                >
                  {renderSection(section.id)}
                </CloudSectionCard>
              ))
            }
          </div>
        </PinnedSectionsProvider>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
            <Heart className="w-4 h-4 text-pink-300" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
          </div>
          <p className="text-sm text-slate-400 mt-3">
            {t('journey.footer', 'MamanDouce - Votre compagnon de grossesse')}
          </p>
        </div>
      </div>

      {/* Bouton mode édition flottant */}
      <button
        onClick={() => setIsEditMode(!isEditMode)}
        className={`fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isEditMode 
            ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
            : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
        }`}
        data-testid="edit-mode-button"
      >
        {isEditMode ? (
          <Check className="w-6 h-6 text-white" />
        ) : (
          <Pencil className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Bouton réinitialiser (en mode édition uniquement) */}
      {isEditMode && hasCustomOrder && (
        <button
          onClick={handleReset}
          className="fixed bottom-20 left-6 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg flex items-center justify-center transition-all border border-slate-200"
          data-testid="reset-order-button"
        >
          <RotateCcw className="w-5 h-5 text-slate-600" />
        </button>
      )}
    </div>
  );
}

export default JourneyStepsPage;
