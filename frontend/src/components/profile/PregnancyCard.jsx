import { CalendarHeart, Sparkles, Baby } from 'lucide-react';
import { PregnancyInfoSection } from '../settings';
import { IconWell } from '../ui/IconWell';
import { softClayCardClasses } from '../../utils/accentTokens';

function InfoTile({ accent, label, value, testId }) {
  return (
    <div
      data-accent={accent}
      data-testid={testId}
      className={`soft-clay-premium soft-clay-from-accent soft-clay-text-flat rounded-[24px] p-2.5 ${softClayCardClasses(accent)}`}
    >
      <p className="text-xs text-slate-600 font-semibold">{label}</p>
      <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}

export function PregnancyCard({
  pregnancyProfile,
  subscriptionStatus,
  setSubscriptionStatus,
  onLoadFullStatus,
  formatDate,
}) {
  if (!pregnancyProfile) return null;

  return (
    <div
      className={`soft-clay-premium soft-clay-from-accent soft-clay-text-flat rounded-[24px] p-5 relative overflow-hidden ${softClayCardClasses('pink')}`}
      data-testid="pregnancy-info-card"
      data-accent="pink"
    >
      <div className="relative z-[2]">
        <div className="flex items-center gap-3 mb-4">
          <IconWell accent="pink" size="md">
            <Baby className="w-5 h-5 text-white" />
          </IconWell>
          <h3 className="text-lg font-bold text-slate-800">Informations de grossesse</h3>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <InfoTile
              accent="sky"
              label="Dernières règles"
              value={formatDate(pregnancyProfile.last_period_date)}
              testId="pregnancy-last-period"
            />
            <InfoTile
              accent="pink"
              label="Conception estimée"
              value={formatDate(pregnancyProfile.estimated_conception_date)}
              testId="pregnancy-conception-date"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <InfoTile
              accent="red"
              label="Accouchement prévu"
              value={formatDate(pregnancyProfile.estimated_due_date)}
              testId="pregnancy-due-date"
            />
            <InfoTile
              accent="blue"
              label="Semaine actuelle"
              value={`${pregnancyProfile.current_week ?? '—'} sem.`}
              testId="pregnancy-current-week"
            />
          </div>

          <div className="mt-3 pt-3 border-t border-pink-200/40">
            <PregnancyInfoSection
              subscriptionStatus={subscriptionStatus}
              setSubscriptionStatus={setSubscriptionStatus}
              onLoadFullStatus={onLoadFullStatus}
              embedded={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
