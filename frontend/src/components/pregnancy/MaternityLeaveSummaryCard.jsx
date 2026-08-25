import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarHeart, Baby, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  calculateMaternityLeaveDates,
  formatFrenchDate,
  getScenarioLabel,
} from '../../utils/maternityLeave';

export function MaternityLeaveSummaryCard({ className = '', defaultOpen = false }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const focusMaternityLeave = searchParams.get('focus') === 'maternity-leave';
  const cardRef = useRef(null);
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(defaultOpen || focusMaternityLeave);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const profileRes = await api.pregnancy.getProfile();
        if (!cancelled) {
          setDueDate(profileRes.data?.estimated_due_date || null);
        }
      } catch {
        if (!cancelled) setDueDate(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.children_at_home, user?.multiple_pregnancy]);

  useEffect(() => {
    if (focusMaternityLeave) {
      setIsOpen(true);
      requestAnimationFrame(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [focusMaternityLeave]);

  const childrenAtHome = user?.children_at_home ?? 0;
  const multiplePregnancy = user?.multiple_pregnancy ?? 'none';
  const leave = calculateMaternityLeaveDates(dueDate, childrenAtHome, multiplePregnancy);

  return (
    <div
      ref={cardRef}
      className={`col-span-2 sm:col-span-3 rounded-3xl border-2 ${className}`}
      data-testid="maternity-leave-summary-card"
      style={{
        background:
          'linear-gradient(160deg, #ffffff 0%, #faf5ff 30%, #f3e8ff 65%, #ede9fe 100%)',
        borderColor: 'rgba(167, 139, 250, 0.45)',
        boxShadow:
          '0 8px 24px -4px rgba(124, 58, 237, 0.18), inset 0 1px 0 rgba(255,255,255, 0.9)',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full p-4 flex items-start gap-3 text-left"
        aria-expanded={isOpen}
        data-testid="maternity-leave-summary-toggle"
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(145deg, #a78bfa, #7c3aed)',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
          }}
        >
          <CalendarHeart className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-violet-900">Mon congé maternité</h3>
          <p className="text-sm text-violet-800/80 mt-0.5 flex items-center gap-1.5">
            <Baby className="w-3.5 h-3.5" />
            Enfant(s) à charge : {childrenAtHome}
          </p>
          {!isOpen && leave && (
            <p className="text-xs text-violet-700/70 mt-1">
              Début prénatal : {formatFrenchDate(leave.prenatalStart)}
            </p>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-violet-500 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-violet-100/80">
          {loading ? (
            <p className="text-sm text-violet-700/70 mt-3">Calcul des dates…</p>
          ) : !leave ? (
            <p className="text-sm text-violet-700/80 mt-3">
              Indiquez votre date prévue d&apos;accouchement dans le suivi de grossesse pour
              estimer votre congé maternité.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-violet-700/75">{getScenarioLabel(leave.scenario)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div
                  className="rounded-2xl px-3 py-2 bg-white/70 border border-violet-100"
                  data-testid="maternity-leave-prenatal"
                >
                  <p className="text-[11px] uppercase tracking-wide text-violet-600 font-semibold">
                    Début prénatal
                  </p>
                  <p className="text-sm font-bold text-violet-900">
                    {formatFrenchDate(leave.prenatalStart)}
                  </p>
                  <p className="text-xs text-violet-700/70">
                    {leave.prenatalWeeks} sem. avant la DPA
                  </p>
                </div>
                <div
                  className="rounded-2xl px-3 py-2 bg-white/70 border border-violet-100"
                  data-testid="maternity-leave-postnatal"
                >
                  <p className="text-[11px] uppercase tracking-wide text-violet-600 font-semibold">
                    Fin postnatal
                  </p>
                  <p className="text-sm font-bold text-violet-900">
                    {formatFrenchDate(leave.postnatalEnd)}
                  </p>
                  <p className="text-xs text-violet-700/70">
                    {leave.postnatalWeeks} sem. après la DPA
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-violet-700/65 mt-2">
                DPA : {formatFrenchDate(leave.dueDate)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
