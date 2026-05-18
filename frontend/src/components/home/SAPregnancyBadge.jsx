import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Bulle "SA X" (Semaines d'Aménorrhée) — affichée à côté de la Fête du jour
 * dès que l'utilisatrice a cliqué sur "Je suis enceinte !".
 * * Version Premium Pill Translucide NeriaCorp
 * Cliquable → /cycle-tracking
 */
export function SAPregnancyBadge({ compact = false }) {
  const navigate = useNavigate();

  const isPregnant = typeof window !== 'undefined' && localStorage.getItem('mamandouce_pregnant') === 'true';
  const dueDateStr = typeof window !== 'undefined' ? localStorage.getItem('mamandouce_due_date') : null;

  if (!isPregnant || !dueDateStr) return null;

  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);
  const sa = Math.max(0, Math.min(42, Math.round(40 - daysUntilDue / 7)));

  if (sa <= 0) return null;

  if (compact) {
    return (
      <div
        onClick={() => navigate('/cycle-tracking')}
        className="badge-sa-pregnancy bg-white/10 backdrop-blur-md border border-white/20 shadow-lg px-3 py-2 flex flex-col items-center justify-center transition-all duration-200 hover:bg-white/20 active:scale-95 cursor-pointer"
        style={{
          height: '112px',
          minWidth: '112px',
          borderRadius: '20px', // Forme Pill d'origine préservée
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
        data-testid="sa-pregnancy-badge"
      >
        <span className="text-[10px] font-semibold text-rose-200 uppercase tracking-wide leading-none mb-1">Grossesse</span>
        <span className="text-xl font-black text-white leading-tight bg-gradient-to-r from-pink-200 to-amber-200 bg-clip-text text-transparent">
          SA {sa}
        </span>
      </div>
    );
  }

  // Version normale
  return (
    <div className="p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-sm">
      <span className="text-sm font-semibold text-slate-700">Semaines d'Aménorrhée : </span>
      <span className="text-base font-bold text-pink-600">SA {sa}</span>
    </div>
  );
}