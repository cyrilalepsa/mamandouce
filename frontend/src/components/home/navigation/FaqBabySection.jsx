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

export function FaqBabySection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <CollapsibleSection 
      title={t('sections.faq', 'Tout va bien ?')}
      icon={HelpCircle} 
      iconColor="text-amber-500"
      defaultOpen={false}
      sectionId="faq-baby"
    >
      <PastelPillCard
        color="amber"
        onClick={() => navigate('/faq-baby')}
        testId="faq-baby-nav"
        className="py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100/60 backdrop-blur-sm flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <HelpCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-700">{t('faq.title', 'FAQ 0-6 mois')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('faq.desc', 'Coliques, sommeil, eczéma... les réponses aux questions fréquentes')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400" />
        </div>
      </PastelPillCard>
    </CollapsibleSection>
  );
}

// Catégorie: Services et ressources - Dynamique selon la langue
