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

export function PregnancySection({ hasPregnancyProfile, pregnancyProfile }) {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const { t } = useTranslation();
  
  // Déterminer si on est au 1er trimestre (semaines 1-13)
  const currentWeek = pregnancyProfile?.current_week || 1;
  const isFirstTrimester = currentWeek <= 13;

  return (
    <CollapsibleSection 
      title={t('sections.pregnancy', 'Grossesse')}
      icon={Baby} 
      iconColor="text-pink-500"
      defaultOpen={false}
      sectionId="pregnancy"
    >

      {/* Scanner, Bibliothèque, Favoris, Historique */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <PastelMosaicCard color="green" onClick={() => navigate('/scanner')} testId="scanner-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-green-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <ScanBarcode className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.scanner', 'Scanner')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.foods', 'Aliments')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard color="red" onClick={() => navigate('/library')} testId="library-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-red-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Apple className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.library', 'Bibliothèque')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.foods', 'Aliments')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard color="pink" onClick={() => navigate('/favorites')} testId="favorites-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.favorites', 'Favoris')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.saved', 'Sauvegardés')}</p>
        </PastelMosaicCard>

        <PastelMosaicCard color="purple" onClick={() => navigate('/history')} testId="history-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-purple-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <History className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.history', 'Historique')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.searches', 'Recherches')}</p>
        </PastelMosaicCard>
      </div>

      {/* Séparateur visuel */}
      <div className="border-t border-slate-100/50 my-4"></div>

      {/* Liste des prénoms - Partiellement gratuit - style pill */}
      <PastelPillCard color="violet" onClick={() => navigate('/baby-names')} testId="baby-names-nav" className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100/60 backdrop-blur-sm flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Users className="w-5 h-5 text-violet-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-700">
                {t('pregnancy.babyNames', 'Liste des Prénoms')}
              </h3>
              {!isPremium && (
                <span className="flex items-center gap-1 bg-amber-100/60 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm">
                  <Crown className="w-3 h-3" /> {t('premium.partial', 'Partiel')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPremium 
                ? t('premium.allCountries', 'Europe & Amérique - Signification et personnalité')
                : t('premium.freeCountries', '3 pays gratuits, tous avec Premium')
              }
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-violet-400" />
        </div>
      </PastelPillCard>

      {/* Widget Évolution 3D - Pill pleine largeur avec mise en valeur */}
      <PastelPillCard color="pink" onClick={() => navigate('/baby-evolution')} testId="baby-evolution-nav" className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-200 flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.9), 0 4px 12px rgba(255, 183, 197, 0.3)' }}
          >
            <Baby className="w-6 h-6 text-pink-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
              {t('pregnancy.babyEvolution3D', 'Évolution de votre bébé en 3D')}
              <Sparkles className="w-4 h-4 text-pink-400" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('pregnancy.compareWithFruit', 'Découvrez la taille de bébé comparée à un fruit')}
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-pink-400" />
        </div>
      </PastelPillCard>

      {/* RDV, Évolution et conseils, Suivi de grossesse, Rappels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Évolution et conseils - format carré comme les autres */}
        <PastelMosaicCard color="pink" onClick={() => navigate('/tips')} testId="tips-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <BookHeart className="w-4 h-4 text-pink-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.tipsAndEvolution', 'Évolution et conseils')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.weekByWeek', 'Semaine par semaine')}</p>
        </PastelMosaicCard>

        {/* RDV - Gratuit au 1er trimestre, Premium après */}
        {isPremium || isFirstTrimester ? (
          <PastelMosaicCard color="sky" onClick={() => navigate('/medical')} testId="medical-nav">
            <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-sky-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Stethoscope className="w-4 h-4 text-sky-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.appointments', 'Rendez-vous')}</h3>
            <p className="text-xs text-slate-500">{isPremium ? t('pregnancy.medicalFollowUp', 'Suivi médical') : t('pregnancy.firstTrimester', '1er trimestre')}</p>
          </PastelMosaicCard>
        ) : (
          <PastelMosaicCard color="slate" onClick={() => navigate('/pricing')} testId="medical-nav-locked" locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-slate-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <Stethoscope className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-500">{t('pregnancy.appointments', 'Rendez-vous')}</h3>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> 2e & 3e trimestre
            </p>
          </PastelMosaicCard>
        )}

        {/* Suivi grossesse - Premium uniquement */}
        {isPremium ? (
          <PastelMosaicCard color="pink" onClick={() => navigate('/tracking')} testId="tracking-nav">
            <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-pink-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <LineChart className="w-4 h-4 text-pink-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.pregnancyTracking', 'Suivi grossesse')}</h3>
            <p className="text-xs text-slate-500">{t('pregnancy.momAndBaby', 'Maman & Bébé')}</p>
          </PastelMosaicCard>
        ) : (
          <PastelMosaicCard color="slate" onClick={() => navigate('/pricing')} testId="tracking-nav-locked" locked>
            <div className="absolute top-1.5 right-1.5 z-10">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-slate-100/60 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
            >
              <LineChart className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-500">{t('pregnancy.pregnancyTracking', 'Suivi grossesse')}</h3>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> {t('premium.title', 'Premium')}
            </p>
          </PastelMosaicCard>
        )}

        <PastelMosaicCard color="amber" onClick={() => navigate('/notifications')} testId="notifications-nav">
          <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-amber-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">{t('pregnancy.reminders', 'Rappels')}</h3>
          <p className="text-xs text-slate-500">{t('pregnancy.notifications', 'Notifications')}</p>
        </PastelMosaicCard>
      </div>
    </CollapsibleSection>
  );
}

// Catégorie: Préparer l'arrivée de bébé (Premium uniquement avec aperçu attractif)
