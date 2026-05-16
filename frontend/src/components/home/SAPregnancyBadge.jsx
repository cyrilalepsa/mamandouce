import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Bulle "SA X" (Semaines d'Aménorrhée) — affichée à côté de la Fête du jour
 * dès que l'utilisatrice a cliqué sur "Je suis enceinte !" (CycleTrackingPage).
 *
 * Lecture :
 *  - localStorage.mamandouce_pregnant === 'true'
 *  - localStorage.mamandouce_due_date (ISO date, DPA = règles + 280 j)
 *
 * SA = 40 - (DPA - today) / 7
 *
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
        className="badge-sa-pregnancy rounded-2xl px-3 py-2 flex flex-col items-center justify-center"
        data-testid="sa-pregnancy-badge"
      >
        <span className="text-[10px] font-semibold text-pink-700">Grossesse</span>
        <span className="text-base font-bold text-pink-800 leading-tight">SA {sa}</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate('/cycle-tracking')}
      className="badge-sa-pregnancy rounded-full px-3 py-1 inline-flex items-center gap-1.5"
      data-testid="sa-pregnancy-badge"
    >
      <span className="text-sm">🤰</span>
      <span className="text-xs font-bold text-pink-800">SA {sa}</span>
    </div>
  );
}
