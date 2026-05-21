import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getNameOfTheDay } from '../data/namesByCountry';

/**
 * Fête du Jour — Édition Premium Pill Translucide NeriaCorp
 * - Si compact === true (Mode Côte-à-Côte avec SA) : format Capsule/Pill fixe à 112px de haut.
 * - Si compact === false : prend toute la largeur disponible de façon élégante.
 * * Les deux modes renvoient vers le calendrier → /cycle-tracking?calendar=true
 */
export default function NameOfTheDay({ compact = false, fullWidth = false }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  
  const nameOfTheDay = useMemo(() => {
    const today = new Date();
    const nameData = getNameOfTheDay(today, currentLang);
    
    if (!nameData || !nameData.names || nameData.names.length === 0) {
      return null;
    }
    return nameData.names[0];
  }, [currentLang]);

  if (!nameOfTheDay) return null;

  // 1. Rendu en mode gélule/pill compacte (Mode Grossesse actif)
  if (compact) {
    return (
      <div
        onClick={() => navigate('/cycle-tracking?calendar=true')}
        className="relative overflow-hidden px-4 py-3 cursor-pointer badge-fete-du-jour w-full flex flex-col justify-center items-center text-center bg-white/10 backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200 hover:bg-white/20 active:scale-95"
        style={{
          height: '112px',
          minHeight: '112px',
          maxHeight: '112px',
          borderRadius: '20px',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          contain: 'layout paint size'
        }}
        data-testid="name-of-the-day-card"
      >
        <p className="relative text-[10px] font-semibold text-amber-200 uppercase tracking-wide leading-none mb-1">
          ✨ {t('home.saintTodayShort', 'À Fêter')}
        </p>
        <p className="relative text-base font-bold text-white leading-tight max-w-full truncate px-1">
          {nameOfTheDay}
        </p>
      </div>
    );
  }

  // 2. Rendu en mode Pleine Largeur (Pas enceinte, la pill s'étire et renvoie aussi au calendrier)
  return null;
    
}