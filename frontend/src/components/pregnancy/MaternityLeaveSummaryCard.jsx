import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarHeart, Baby, ChevronDown, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { IconWell } from '../ui/IconWell';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cardInnerCreamClasses } from '../../utils/accentTokens';
import { toYmd } from '../../utils/pregnancyDateUtils';
import {
  calculateMaternityLeaveDates,
  formatFrenchDate,
  getScenarioLabel,
  AMELI_RESOURCES_SECTION_PATH,
} from '../../utils/maternityLeave';
import { CpamDateGapInfo } from './CpamDateGapInfo';

export function MaternityLeaveSummaryCard({ className = '', defaultOpen = false }) {
  const navigate = useNavigate();
  const { user, ingestUser } = useAuth();
  const [searchParams] = useSearchParams();
  const focusMaternityLeave = searchParams.get('focus') === 'maternity-leave';
  const cardRef = useRef(null);
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(defaultOpen || focusMaternityLeave);
  const [prenatalStartInput, setPrenatalStartInput] = useState(user?.maternity_prenatal_start || '');
  const [postnatalEndInput, setPostnatalEndInput] = useState(user?.maternity_postnatal_end || '');
  const [useCpamDates, setUseCpamDates] = useState(
    Boolean(user?.maternity_prenatal_start && user?.maternity_postnatal_end),
  );
  const [saving, setSaving] = useState(false);

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
    setPrenatalStartInput(user?.maternity_prenatal_start || '');
    setPostnatalEndInput(user?.maternity_postnatal_end || '');
    setUseCpamDates(Boolean(user?.maternity_prenatal_start && user?.maternity_postnatal_end));
  }, [user?.maternity_prenatal_start, user?.maternity_postnatal_end]);

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
  const leave = calculateMaternityLeaveDates(dueDate, childrenAtHome, multiplePregnancy, {
    prenatalStartIso: useCpamDates ? prenatalStartInput : null,
    postnatalEndIso: useCpamDates ? postnatalEndInput : null,
    useCpamOverrides: useCpamDates,
  });

  const handleSaveCpamSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        maternity_prenatal_start: useCpamDates ? prenatalStartInput || null : null,
        maternity_postnatal_end: useCpamDates ? postnatalEndInput || null : null,
      };
      const res = await api.auth.updateProfile(payload);
      if (res.data?.user) {
        ingestUser(res.data.user);
      }
      toast.success('Dates de congé maternité enregistrées');
    } catch {
      toast.error('Impossible de sauvegarder les dates');
    } finally {
      setSaving(false);
    }
  };

  const applyCalculatedToCpamFields = () => {
    if (!leave || leave.isCpamOverride) return;
    setPrenatalStartInput(toYmd(leave.prenatalStart));
    setPostnatalEndInput(toYmd(leave.postnatalEnd));
    setUseCpamDates(true);
  };

  return (
    <div
      ref={cardRef}
      className={`col-span-2 sm:col-span-3 soft-clay-premium soft-clay-from-accent soft-clay-from-accent-violet soft-clay-text-flat rounded-[24px] ${className}`}
      data-testid="maternity-leave-summary-card"
      data-accent="violet"
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full p-4 flex items-start gap-3 text-left"
        aria-expanded={isOpen}
        data-testid="maternity-leave-summary-toggle"
      >
        <IconWell accent="violet" size="lg">
          <CalendarHeart className="w-5 h-5 text-white" />
        </IconWell>
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
            <div className="mt-3 space-y-3">
              <p className="text-xs text-violet-700/75">{getScenarioLabel(leave.scenario)}</p>

              <div className={`p-3 space-y-2 ${cardInnerCreamClasses('', { level: 4 })}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-violet-800">Relevé Ameli / CPAM</p>
                  <label className="flex items-center gap-1.5 text-xs text-violet-800">
                    <input
                      type="checkbox"
                      checked={useCpamDates}
                      onChange={(e) => setUseCpamDates(e.target.checked)}
                    />
                    Utiliser mes dates officielles
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-violet-700 font-medium">Début prénatal</label>
                    <Input
                      type="date"
                      value={prenatalStartInput}
                      onChange={(e) => setPrenatalStartInput(e.target.value)}
                      disabled={!useCpamDates}
                      className="mt-1 h-9 text-sm"
                      data-testid="maternity-cpam-prenatal-input"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-violet-700 font-medium">Fin postnatal</label>
                    <Input
                      type="date"
                      value={postnatalEndInput}
                      onChange={(e) => setPostnatalEndInput(e.target.value)}
                      disabled={!useCpamDates}
                      className="mt-1 h-9 text-sm"
                      data-testid="maternity-cpam-postnatal-input"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={applyCalculatedToCpamFields}
                    disabled={leave.isCpamOverride}
                  >
                    Reprendre le calcul
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="text-xs"
                    onClick={handleSaveCpamSettings}
                    disabled={saving}
                    data-testid="maternity-cpam-save"
                  >
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                </div>
                <p className="text-[10px] text-violet-700/65">
                  Saisissez les dates figurant sur votre relevé Ameli pour éviter tout écart de
                  calcul.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(AMELI_RESOURCES_SECTION_PATH)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-800 hover:text-violet-950 underline-offset-2 hover:underline"
                  data-testid="maternity-ameli-resources-link"
                >
                  <Link2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  Vérifier sur mon compte Ameli
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs font-semibold text-violet-800">Dates affichées</p>
                <CpamDateGapInfo />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  className={`px-3 py-2 ${cardInnerCreamClasses('', { level: 4 })}`}
                  data-testid="maternity-leave-prenatal"
                >
                  <p className="text-[11px] uppercase tracking-wide text-violet-600 font-semibold">
                    Début prénatal
                  </p>
                  <p className="text-sm font-bold text-violet-900">
                    {formatFrenchDate(leave.prenatalStart)}
                  </p>
                  {leave.prenatalWeeks && (
                    <p className="text-xs text-violet-700/70">
                      {leave.prenatalWeeks} sem. avant la DPA
                    </p>
                  )}
                </div>
                <div
                  className={`px-3 py-2 ${cardInnerCreamClasses('', { level: 4 })}`}
                  data-testid="maternity-leave-postnatal"
                >
                  <p className="text-[11px] uppercase tracking-wide text-violet-600 font-semibold">
                    Fin postnatal
                  </p>
                  <p className="text-sm font-bold text-violet-900">
                    {formatFrenchDate(leave.postnatalEnd)}
                  </p>
                  {leave.postnatalWeeks && (
                    <p className="text-xs text-violet-700/70">
                      {leave.postnatalWeeks} sem. après la DPA
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-violet-700/65">
                DPA : {formatFrenchDate(leave.dueDate)}
                {leave.totalWeeks ? ` · Total : ${leave.totalWeeks} semaines` : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
