import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Baby, Gift, Heart, Library,
  CalendarHeart, BookHeart, ScanBarcode, Apple,
  History, Stethoscope, Bell,
  ClipboardList, Briefcase, Video, Youtube, Book, ChevronRight, ChevronDown, LineChart, Lock, Crown, Users, Pin, PinOff, Phone, PiggyBank, Award, HandHeart, HelpCircle
} from 'lucide-react';
import { useSubscription } from '../../SubscriptionGate';
import { toast } from 'sonner';
import api from '../../../utils/api';
import { PastelMosaicCard, PastelPillCard, CollapsibleSection, usePinnedSections, PASTEL_STYLES, IconWell } from './_shared';

export function BabyPreparationSection() {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const { t } = useTranslation();

  // Header personnalisé pour cette section (avec badge Premium)
  const CustomHeader = () => (
    <div className="flex items-center gap-2">
      <Gift className="w-5 h-5 text-red-500" />
      <span className="whitespace-nowrap">{t('sections.babyPreparation', 'Préparer l\'arrivée de bébé')}</span>
      {!isPremium && (
        <span className="ml-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
          <Crown className="w-3 h-3 text-white" />
        </span>
      )}
    </div>
  );

  // Si pas premium, afficher un aperçu attractif avec contenu flouté/verrouillé
  if (!isPremium) {
    return (
      <CollapsibleSection 
        title={<CustomHeader />}
        icon={() => null}
        iconColor=""
        defaultOpen={false}
        sectionId="baby-preparation"
      >
        
        {/* Aperçu des cartes avec effet de flou partiel */}
        <div className="grid grid-cols-2 gap-4 relative">
          {/* Liste de naissance - aperçu */}
          <PastelMosaicCard color="yellow" onClick={() => navigate('/pricing')} locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Lock className="w-3.5 h-3.5 text-red-400" />
            </div>
            <IconWell accent="yellow" size="md" className="mx-auto mb-1.5">
              <ClipboardList className="w-5 h-5 text-white" />
            </IconWell>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.birthList', 'Liste de naissance')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.toShare', 'À partager avec vos proches')}</p>
          </PastelMosaicCard>

          {/* Sac de maternité - aperçu */}
          <PastelMosaicCard color="blue" onClick={() => navigate('/pricing')} locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Lock className="w-3.5 h-3.5 text-red-400" />
            </div>
            <IconWell accent="blue" size="md" className="mx-auto mb-1.5">
              <Briefcase className="w-5 h-5 text-white" />
            </IconWell>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.maternityBag', 'Sac de maternité')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.interactiveChecklist', 'Check-list interactive')}</p>
          </PastelMosaicCard>

          {/* Vidéos - aperçu */}
          <PastelMosaicCard color="red" onClick={() => navigate('/pricing')} locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Lock className="w-3.5 h-3.5 text-red-400" />
            </div>
            <IconWell accent="red" size="md" className="mx-auto mb-1.5">
              <Video className="w-5 h-5 text-white" />
            </IconWell>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.videos', 'Vidéos')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.birthPreparation', 'Préparation accouchement')}</p>
          </PastelMosaicCard>

          {/* Les Maternelles - aperçu */}
          <PastelMosaicCard color="green" onClick={() => navigate('/pricing')} locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Lock className="w-3.5 h-3.5 text-red-400" />
            </div>
            <IconWell accent="green" size="md" className="mx-auto mb-1.5">
              <Youtube className="w-5 h-5 text-white" />
            </IconWell>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.maternelles', 'Les Maternelles')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.youtubeChannel', 'Chaîne YouTube')}</p>
          </PastelMosaicCard>

          {/* Livres - aperçu pleine largeur */}
          <PastelPillCard color="violet" onClick={() => navigate('/pricing')} className="col-span-2">
            <div className="absolute top-2 right-3 z-10">
              <Lock className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="flex items-center gap-3">
              <IconWell accent="violet" size="md" className="flex-shrink-0">
                <Book className="w-5 h-5 text-white" />
              </IconWell>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.usefulBooks', 'Livres utiles')}</h3>
                <p className="text-xs text-slate-500">{t('babyPrep.pregnancyAndBaby', 'Grossesse et bébé')}</p>
              </div>
            </div>
          </PastelPillCard>
        </div>
        
        {/* Bouton débloquer */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Crown className="w-5 h-5" />
            {t('babyPrep.unlockWithPremium', 'Débloquer avec Premium')}
          </button>
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection 
      title={t('sections.babyPreparation', 'Préparer l\'arrivée de bébé')}
      icon={Gift} 
      iconColor="text-red-500"
      defaultOpen={false}
      sectionId="baby-preparation"
    >
      <div className="grid grid-cols-2 gap-4">
        <PastelMosaicCard color="yellow" onClick={() => navigate('/birth-list')} testId="birthlist-nav">
          <IconWell accent="yellow" size="md" className="mx-auto mb-1.5">
            <ClipboardList className="w-5 h-5 text-white" />
          </IconWell>
          <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.birthList', 'Liste de naissance')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.toShare', 'À partager')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard color="blue" onClick={() => navigate('/maternity-bag')} testId="maternity-bag-nav">
          <IconWell accent="blue" size="md" className="mx-auto mb-1.5">
            <Briefcase className="w-5 h-5 text-white" />
          </IconWell>
          <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.maternityBag', 'Sac de maternité')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.interactiveChecklist', 'Check-list interactive')}</p>
        </PastelMosaicCard>

        <a
          href="https://www.youtube.com/results?search_query=préparation+accouchement"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <PastelMosaicCard color="red" testId="birth-videos-nav" className="h-full">
            <IconWell accent="red" size="md" className="mx-auto mb-1.5">
              <Video className="w-5 h-5 text-white" />
            </IconWell>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.videos', 'Vidéos')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.birthPreparation', 'Préparation accouchement')}</p>
          </PastelMosaicCard>
        </a>

        <a
          href="https://www.youtube.com/c/LaMaisondesMaternelles"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <PastelMosaicCard color="green" testId="maternelles-nav" className="h-full">
            <IconWell accent="green" size="md" className="mx-auto mb-1.5">
              <Youtube className="w-5 h-5 text-white" />
            </IconWell>
            <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.maternelles', 'Les Maternelles')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('babyPrep.youtubeChannel', 'Chaîne YouTube')}</p>
          </PastelMosaicCard>
        </a>

        <a
          href="https://www.amazon.fr/s?k=livre+grossesse+bébé"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline col-span-2"
        >
          <PastelPillCard color="violet" testId="books-nav" className="h-full">
            <div className="flex items-center gap-3">
              <IconWell accent="violet" size="md" className="flex-shrink-0">
                <Book className="w-5 h-5 text-white" />
              </IconWell>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-700">{t('babyPrep.usefulBooks', 'Livres utiles')}</h3>
                <p className="text-xs text-slate-500">{t('babyPrep.pregnancyAndBaby', 'Grossesse et bébé')}</p>
              </div>
            </div>
          </PastelPillCard>
        </a>
      </div>
    </CollapsibleSection>
  );
}

// Catégorie: Suivi Post-partum
