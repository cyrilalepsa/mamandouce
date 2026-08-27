import React from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import NameOfTheDay from '../NameOfTheDay';
import api from '../../utils/api';
import { calculateCycleSummary, pregnancyProgress } from '../../utils/pregnancyStatus';
import {
  calculateDpa,
  ddgFromDpa,
  parseYmd,
  resolveCountryFromCity,
  toYmd,
} from '../../utils/pregnancyDateUtils';

function makeHeartShape() {
  try {
    if (typeof confetti.shapeFromPath === 'function') {
      return confetti.shapeFromPath({
        path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
      });
    }
  } catch (err) {
    console.warn('canvas-confetti shapeFromPath indisponible', err);
  }
  return 'circle';
}

export const PREGNANT_EVENT = 'mamandouce-pregnant';

const heart = makeHeartShape();

function todayYmd() {
  return new Date().toISOString().split('T')[0];
}

function addDaysYmd(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function firePregnancyConfetti() {
  const shapes = {
    hearts: [heart],
    sparkles: ['circle'],
  };
  const palettes = {
    bonbonPinks: ['#ff85b3', '#ff4d94', '#ffd1e1', '#ffffff'],
    magicLights: ['#ffffff', '#FFD700', '#AEC6CF'],
  };
  const shoot = (opts) => confetti(Object.assign({
    ticks: 300,
    gravity: 0.9,
    startVelocity: 45,
    zIndex: 100,
    spread: 100,
  }, opts));

  shoot({
    particleCount: 80,
    origin: { x: 0.40, y: 0.70 },
    shapes: shapes.hearts,
    colors: palettes.bonbonPinks,
    scalar: 2.2,
  });
  setTimeout(() => shoot({
    particleCount: 70,
    origin: { x: 0.60, y: 0.60 },
    shapes: shapes.hearts,
    colors: palettes.bonbonPinks,
    scalar: 1.8,
  }), 200);
  setTimeout(() => shoot({
    particleCount: 200,
    origin: { x: 0.50, y: 0.40 },
    shapes: shapes.sparkles,
    colors: palettes.magicLights,
    scalar: 0.7,
    startVelocity: 60,
    spread: 360,
    gravity: 1.1,
    ticks: 200,
  }), 450);
  setTimeout(() => shoot({
    particleCount: 100,
    origin: { x: 0.50, y: 0.50 },
    shapes: ['circle', heart],
    colors: [...palettes.bonbonPinks, ...palettes.magicLights],
    scalar: 1.3,
    spread: 200,
    gravity: 0.6,
  }), 800);
}

export function persistPregnant(dpaStr) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mamandouce_pregnant', 'true');
  localStorage.setItem('mamandouce_due_date', dpaStr);
  window.dispatchEvent(new CustomEvent(PREGNANT_EVENT, { detail: { dueDate: dpaStr } }));
}

/**
 * Kept at module scope and declared before the component. The previous
 * useMemo callback shadowed the `currentWeek`/`trimester` props with local
 * const/let declarations, which triggers a Temporal Dead Zone in production.
 */
export function resolvePregnancyInfo({
  currentWeek,
  trimester,
  dueDate,
  lastPeriodDate,
  city,
  cycleLength = 28,
}) {
  if (currentWeek) {
    return pregnancyProgress(
      { current_week: currentWeek, trimester, estimated_due_date: dueDate },
      dueDate,
      lastPeriodDate,
      cycleLength,
      city,
    );
  }
  const country = resolveCountryFromCity(city);
  const startStr = lastPeriodDate || (dueDate
    ? toYmd(ddgFromDpa(parseYmd(dueDate), country, cycleLength))
    : null);
  if (!startStr) return { week: 1, trimester: 1 };
  const start = new Date(startStr);
  const today = new Date();
  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const calculatedWeek = Math.max(1, Math.floor(diffDays / 7) + 1);
  let calculatedTrimester = 1;
  if (calculatedWeek > 14 && calculatedWeek <= 28) calculatedTrimester = 2;
  if (calculatedWeek > 28) calculatedTrimester = 3;
  return { week: calculatedWeek, trimester: calculatedTrimester };
}

/**
 * Composant Caméléon PregnancyToggle — feux d'artifice + carte SA
 */
export function PregnancyToggle({
  isPregnant,
  dueDate,
  lastPeriodDate,
  cycleLength = 28,
  currentWeek,
  trimester,
  city,
  onPregnant,
  mode = 'home',
}) {
  const navigate = useNavigate();

  const pregnancyInfo = resolvePregnancyInfo({
    currentWeek,
    trimester,
    dueDate,
    lastPeriodDate,
    city,
    cycleLength,
  });
  const cycleSummary = calculateCycleSummary(lastPeriodDate, cycleLength);

  const handleClick = async () => {
    firePregnancyConfetti();

    const period = lastPeriodDate || todayYmd();
    const ddg = parseYmd(period);
    const country = resolveCountryFromCity(city);
    const dpaStr = ddg ? toYmd(calculateDpa(ddg, country, cycleLength)) : addDaysYmd(period, 280);
    persistPregnant(dpaStr);
    // Persist the status used by /auth/me, /pregnancy/profile and cycle alerts.
    try {
      await api.cycle.announcePregnancy();
    } catch (error) {
      console.warn('Statut grossesse non synchronisé :', error?.response?.status || error?.message);
    }
    if (onPregnant) {
      await onPregnant(dpaStr, period);
    }
  };

  const pregnantButton = (
    <button
      type="button"
      onClick={handleClick}
      className="w-full py-4 rounded-2xl text-white font-bold text-lg relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, #ffa6c9 0%, #ff66a2 50%, #ff3385 100%)',
        boxShadow: '0 8px 25px -6px rgba(255,102,162,0.4), 0 0 30px rgba(255,166,201,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
        border: '2px solid rgba(255,255,255,0.3)',
        letterSpacing: '0.05em',
      }}
      data-testid="pregnant-button"
    >
      <span style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>Je suis enceinte !</span>
    </button>
  );

  const pregnantConfirmed = (
    <div className="w-full animate-fade-in">
      <div className="card_nacre w-full p-4 flex flex-col items-center text-center">
        <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
          Félicitations • Votre Grossesse
        </span>
        <span className="text-base font-bold text-white mt-1">
          Date prévue d'accouchement
        </span>
        <span className="mt-2 text-xs font-medium px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white">
          {dueDate
            ? new Date(dueDate).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })
            : '—'}
        </span>
        <span className="mt-2 text-sm font-semibold text-white">
          Semaine {pregnancyInfo.week} SA • Trimestre {pregnancyInfo.trimester}
        </span>
      </div>
    </div>
  );

  if (mode === 'cycle' || mode === 'profile') {
    if (isPregnant) {
      return <div className={mode === 'profile' ? 'w-full' : 'w-full mt-4'}>{pregnantConfirmed}</div>;
    }
    return (
      <div
        className={mode === 'profile' ? 'w-full' : 'w-full mt-4'}
        data-testid={mode === 'profile' ? 'pregnant-profile-card' : 'pregnant-cycle-card'}
      >
        {mode === 'profile' && (
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 text-center">
            Annoncer ma grossesse
          </p>
        )}
        {pregnantButton}
      </div>
    );
  }

  if (mode === 'home') {
    return (
      <div className="w-full mt-2 animate-fade-in">
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={() => navigate(isPregnant ? '/grossesse' : '/cycle-tracking')}
            className="relative overflow-hidden flex flex-col justify-between items-center text-center w-full p-3 box-border transition-all active:scale-95 cursor-pointer focus:outline-none card-glass-interactive glass-sa-week rounded-[24px]"
            style={{ height: '112px', minHeight: '112px' }}
            data-testid={isPregnant ? 'pregnancy-progress-card' : 'cycle-summary-card'}
          >
            {isPregnant ? (
              <>
                <span className="relative z-10 text-[10px] text-[#2C2C2C]/80 uppercase tracking-wider font-semibold">
                  Votre grossesse
                </span>
                <span className="relative z-10 text-lg font-bold text-pink-600 my-0.5">
                  Semaine {pregnancyInfo.week}
                </span>
                <span className="relative z-10 text-[10px] text-[#2C2C2C] font-medium bg-white/55 px-2.5 py-0.5 rounded-full shadow-sm">
                  Trimestre {pregnancyInfo.trimester} • SA
                </span>
              </>
            ) : (
              <>
                <span className="relative z-10 text-[10px] text-[#2C2C2C]/80 uppercase tracking-wider font-semibold">
                  Votre cycle
                </span>
                <span className="relative z-10 text-sm font-bold text-purple-700 my-0.5 leading-tight">
                  {cycleSummary.label}
                </span>
                <span className="relative z-10 text-[10px] text-[#2C2C2C] font-medium bg-white/55 px-2.5 py-0.5 rounded-full shadow-sm">
                  {cycleSummary.dayOfCycle ? `Jour ${cycleSummary.dayOfCycle} du cycle` : 'Suivi de cycles'}
                </span>
              </>
            )}
          </button>
          <NameOfTheDay compact={true} />
        </div>
      </div>
    );
  }

  return null;
}
