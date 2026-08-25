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

export function PostpartumSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <CollapsibleSection 
      title={t('sections.postpartum', 'Suivi post-partum')}
      icon={Heart} 
      iconColor="text-rose-500"
      defaultOpen={false}
      sectionId="postpartum"
    >
      <PastelPillCard
        color="pink"
        onClick={() => navigate('/postpartum')}
        testId="postpartum-nav"
        className="py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-pink-100/60 backdrop-blur-sm flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Baby className="w-6 h-6 text-pink-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-700">{t('postpartum.first6Months', 'Les 6 premiers mois avec bébé')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('postpartum.desc', 'Conseils, rendez-vous, allaitement, couches et précautions')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-pink-400" />
        </div>
      </PastelPillCard>
    </CollapsibleSection>
  );
}

// Section FAQ "Tout va bien ?" (0-6 mois) — Accueil
