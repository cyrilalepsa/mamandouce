import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getNameOfTheDay } from '../data/namesByCountry';

/**
 * Fête du Jour — carte glassmorphism
 * Affiche toujours un prénom + la date.
 * Seule → pleine largeur ; à côté de SA → compact demi-grille.
 * Clic → calendrier (/cycle-tracking?calendar=true)
 */
export default function NameOfTheDay({ compact = false, fullWidth = false }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language?.split('-')[0] || 'fr';

  const { name, dateLabel } = useMemo(() => {
    const today = new Date();
    const nameData = getNameOfTheDay(today, currentLang);
    const nameValue = nameData?.names?.[0]?.trim() || 'Marie';
    return {
      name: nameValue,
      dateLabel: today.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    };
  }, [currentLang]);

  const goCalendar = () => navigate('/cycle-tracking?calendar=true');
  const alone = fullWidth && !compact;

  return (
    <button
      type="button"
      onClick={goCalendar}
      className="relative overflow-hidden flex flex-col justify-between items-center text-center p-3 box-border transition-all active:scale-95 cursor-pointer focus:outline-none group w-full card-glass-interactive glass-fete-du-jour rounded-[20px]"
      style={{
        width: '100%',
        display: 'flex',
        height: compact ? '112px' : alone ? '104px' : 'auto',
        minHeight: compact ? '112px' : alone ? '104px' : '96px',
      }}
      data-testid="name-of-the-day-card"
    >
      <span className="relative z-10 text-[10px] text-amber-700/80 uppercase tracking-wider font-semibold flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        {t('home.nameDay', 'Fête du jour')}
      </span>
      <span
        className={`relative z-10 font-bold text-[#2C2C2C] my-0.5 capitalize truncate max-w-full px-1 ${
          alone ? 'text-xl' : 'text-lg'
        }`}
      >
        {name}
      </span>
      <span className="relative z-10 text-[10px] text-[#2C2C2C] font-medium bg-white/55 px-2.5 py-0.5 rounded-full shadow-sm capitalize">
        {dateLabel}
      </span>
    </button>
  );
}
