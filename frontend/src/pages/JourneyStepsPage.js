import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import api from '../utils/api';

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

// Carte de section cliquable
function SectionCard({ sectionId, onClick }) {
  const { t } = useTranslation();
  const meta = SECTION_META[sectionId];
  const Icon = meta.icon;

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
      `}
      onClick={onClick}
      data-testid={`section-card-${sectionId}`}
    >
      {/* Effet nuage */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
      
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

  // Navigation vers la page de détail de la section
  const handleSectionClick = (sectionId) => {
    navigate(`/section/${sectionId}`);
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
              {t('journey.clickToEnter', 'Cliquez sur une section pour y accéder')}
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
    </div>
  );
}

export default JourneyStepsPage;
