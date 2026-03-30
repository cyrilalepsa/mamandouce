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

// Métadonnées des sections (icônes, couleurs)
const SECTION_META = {
  'preconception': { 
    icon: Sparkles, 
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-500',
    labelColor: 'text-amber-600',
    gradientFrom: 'from-amber-300',
    gradientTo: 'to-pink-300'
  },
  'pregnancy': { 
    icon: Baby, 
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-500',
    labelColor: 'text-pink-600',
    gradientFrom: 'from-pink-300',
    gradientTo: 'to-purple-300'
  },
  'baby-preparation': { 
    icon: Gift, 
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-500',
    labelColor: 'text-purple-600',
    gradientFrom: 'from-purple-300',
    gradientTo: 'to-rose-300'
  },
  'postpartum': { 
    icon: HeartHandshake, 
    color: 'rose',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-500',
    labelColor: 'text-rose-600',
    gradientFrom: 'from-rose-300',
    gradientTo: 'to-slate-300'
  },
  'services': { 
    icon: Settings, 
    color: 'slate',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-500',
    labelColor: 'text-slate-600',
    gradientFrom: 'from-slate-300',
    gradientTo: 'to-slate-200'
  },
};

// Composant pour un élément déplaçable
function DraggableSection({ section, index, isEditMode, onDragStart, onDragOver, onDrop, isDragging, children, t }) {
  const meta = SECTION_META[section.id];
  const Icon = meta.icon;
  
  return (
    <div 
      className={`relative transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : ''}`}
      draggable={isEditMode}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      {/* Timeline line (sauf pour le dernier) */}
      {index < 4 && (
        <div className={`absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b ${meta.gradientFrom} ${meta.gradientTo} -z-10`}></div>
      )}
      
      {/* Header de l'étape */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-12 h-12 ${meta.bgColor} rounded-full flex items-center justify-center border-4 border-white shadow-md ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}>
          {isEditMode ? (
            <GripVertical className={`w-5 h-5 ${meta.textColor}`} />
          ) : (
            <Icon className={`w-5 h-5 ${meta.textColor}`} />
          )}
        </div>
        <span className={`text-sm font-semibold ${meta.labelColor}`}>
          {t('journey.step', 'Étape')} {index + 1}
        </span>
      </div>
      
      {/* Contenu de la section */}
      <div className="ml-6 pl-6">
        {children}
      </div>
    </div>
  );
}

function JourneyStepsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sections, setSections] = useState(() => {
    // Charger depuis localStorage si disponible
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
    // Vérifier si l'ordre a été personnalisé
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
    
    // Mettre à jour les ordres
    const updatedSections = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(updatedSections);
    
    // Sauvegarder dans localStorage
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

        {/* Introduction */}
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-5 mb-6 border-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t('journey.welcomeTitle', 'Bienvenue dans votre parcours')}
              </h2>
              <p className="text-sm text-slate-600">
                {t('journey.welcomeDesc', 'De la conception à l\'arrivée de bébé, nous sommes là pour vous accompagner. Explorez chaque étape à votre rythme.')}
              </p>
              {isEditMode && (
                <p className="text-xs text-pink-500 mt-2 flex items-center gap-1">
                  <GripVertical className="w-4 h-4" />
                  {t('journey.dragHint', 'Glissez-déposez les étapes pour les réorganiser')}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Les 5 sections */}
        <PinnedSectionsProvider>
          <div className="space-y-4">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <DraggableSection
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
                </DraggableSection>
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
            ? 'bg-green-500 hover:bg-green-600' 
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
          className="fixed bottom-20 left-6 z-50 w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 shadow-lg flex items-center justify-center transition-all"
          data-testid="reset-order-button"
        >
          <RotateCcw className="w-5 h-5 text-slate-600" />
        </button>
      )}
    </div>
  );
}

export default JourneyStepsPage;
