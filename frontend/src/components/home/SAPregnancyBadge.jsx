import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Carte SA (Semaines d'Aménorrhée) — glassmorphism
 * Visible après "Je suis enceinte !"
 * Clic → /cycle-tracking (page suivi, PAS le calendrier)
 */
const glassStyle = {
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.1) 100%)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255, 140, 159, 0.5)',
  borderRadius: '20px',
  boxShadow:
    'inset 0 12px 24px -4px rgba(255, 255, 255, 0.65), inset 6px 0 14px -2px rgba(255, 140, 159, 0.28), inset -6px -6px 14px -2px rgba(196, 181, 253, 0.25), 0 8px 24px -8px rgba(74, 74, 74, 0.08)',
};

function computeSA(dueDateStr, lastPeriodDate) {
  if (lastPeriodDate) {
    const start = new Date(lastPeriodDate);
    const today = new Date();
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(42, Math.floor(diffDays / 7) + 1));
  }
  if (!dueDateStr) return null;
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.min(42, Math.round(40 - daysUntilDue / 7)));
}

export function SAPregnancyBadge({ compact = true, lastPeriodDate = null }) {
  const navigate = useNavigate();

  const isPregnant =
    typeof window !== 'undefined' && localStorage.getItem('mamandouce_pregnant') === 'true';
  const dueDateStr =
    typeof window !== 'undefined' ? localStorage.getItem('mamandouce_due_date') : null;

  const sa = useMemo(
    () => (isPregnant ? computeSA(dueDateStr, lastPeriodDate) : null),
    [isPregnant, dueDateStr, lastPeriodDate]
  );

  if (!isPregnant || !sa) return null;

  const trimester = sa <= 14 ? 1 : sa <= 28 ? 2 : 3;

  return (
    <button
      type="button"
      onClick={() => navigate('/cycle-tracking')}
      className="relative overflow-hidden flex flex-col justify-between items-center text-center w-full p-3 box-border transition-all active:scale-95 cursor-pointer focus:outline-none"
      style={{
        ...glassStyle,
        height: compact ? '112px' : 'auto',
        minHeight: compact ? '112px' : '96px',
      }}
      data-testid="sa-pregnancy-badge"
    >
      <div
        className="absolute top-[3px] left-[6%] right-[6%] pointer-events-none rounded-[inherit]"
        style={{
          height: '26%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      <span className="relative z-10 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
        Vous êtes à la
      </span>
      <span className="relative z-10 text-lg font-bold text-pink-500 my-0.5">
        Semaine {sa}
      </span>
      <span className="relative z-10 text-[10px] text-sky-600 font-medium bg-white/55 px-2.5 py-0.5 rounded-full shadow-sm">
        Trimestre {trimester} • SA
      </span>
    </button>
  );
}
