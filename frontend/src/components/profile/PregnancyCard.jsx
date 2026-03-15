import { Card } from '../ui/card';
import { PregnancyInfoSection } from '../settings';

export function PregnancyCard({ 
  pregnancyProfile, 
  subscriptionStatus, 
  setSubscriptionStatus, 
  onLoadFullStatus, 
  formatDate 
}) {
  if (!pregnancyProfile) return null;

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-sky-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="pregnancy-info-card">
      <h3 className="text-xl font-bold text-slate-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Informations de grossesse</h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3">
            <p className="text-xs text-slate-500 font-semibold">Dernières règles</p>
            <p className="text-sm font-bold text-slate-700">{formatDate(pregnancyProfile.last_period_date)}</p>
          </div>
          <div className="bg-white rounded-2xl p-3">
            <p className="text-xs text-slate-500 font-semibold">Conception estimée</p>
            <p className="text-sm font-bold text-pink-600">{formatDate(pregnancyProfile.estimated_conception_date)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3">
            <p className="text-xs text-slate-500 font-semibold">Accouchement prévu</p>
            <p className="text-sm font-bold text-rose-600">{formatDate(pregnancyProfile.estimated_due_date)}</p>
          </div>
          <div className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl p-3">
            <p className="text-xs text-slate-600 font-semibold">Semaine actuelle</p>
            <p className="text-lg font-bold text-slate-700">{pregnancyProfile.current_week} sem.</p>
          </div>
        </div>
        
        {/* Section J'ai accouché intégrée */}
        {subscriptionStatus === 'premium' && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <PregnancyInfoSection
              subscriptionStatus={subscriptionStatus}
              setSubscriptionStatus={setSubscriptionStatus}
              onLoadFullStatus={onLoadFullStatus}
              embedded={true}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
