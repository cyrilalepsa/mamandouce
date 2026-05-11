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
import { PastelMosaicCard, PastelPillCard, CollapsibleSection, usePinnedSections, PASTEL_STYLES } from './_shared';

export function PreconceptionSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <CollapsibleSection 
      title={t('sections.preconception', 'En route vers la grossesse')}
      icon={Sparkles} 
      iconColor="text-amber-500"
      defaultOpen={false}
      sectionId="preconception"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Suivi de cycles - carte carrée ROSE */}
        <PastelMosaicCard
          color="pink"
          onClick={() => navigate('/cycle-tracking')}
          testId="cycle-tracking-nav"
        >
          <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <CalendarHeart className="w-5 h-5 text-pink-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('home.cycleTracking', 'Suivi de cycles')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('fertility.trackYourCycle', 'Calendrier fertilité')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard
          color="sky"
          onClick={() => navigate('/calculator')}
          testId="calculator-nav"
        >
          <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-sky-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <CalendarHeart className="w-5 h-5 text-sky-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.calculator', 'Calculateur')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('pregnancy.ovulationAndDates', 'Ovulation et dates clés')}</p>
        </PastelMosaicCard>

        {/* Grossesse après 35 ans - version compacte pleine largeur */}
        <PastelPillCard
          color="purple"
          onClick={() => navigate('/pregnancy-after-35')}
          testId="pregnancy-after-35-nav"
          className="col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100/60 backdrop-blur-sm flex-shrink-0"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Heart className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-700">
                {t('pregnancy.after35', 'Grossesse après 35 ans')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('pregnancy.after35Desc', 'Conseils et accompagnement')}
              </p>
            </div>
          </div>
        </PastelPillCard>
      </div>
      
      {/* Avertissement médical - quasi transparent */}
      <div className="mt-3 bg-amber-50/40 backdrop-blur-sm border border-amber-200/40 rounded-xl p-3">
        <p className="text-xs text-amber-700/80">
          <strong>{t('common.info', 'Information')} :</strong> {t('medicalWarning', 'Les conseils fournis sont à titre informatif et ne remplacent pas l\'avis d\'un médecin. Consultez un professionnel de santé avant toute prise de médicaments ou compléments.')}
        </p>
      </div>
    </CollapsibleSection>
  );
}

