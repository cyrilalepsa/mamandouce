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
    <div 
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,231,243,0.95) 30%, rgba(251,207,232,0.85) 70%, rgba(249,168,212,0.75) 100%)',
        boxShadow: '0 6px 16px -4px rgba(236,72,153,0.2), 0 3px 6px -2px rgba(236,72,153,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(236,72,153,0.08)'
      }}
      data-testid="pregnancy-info-card"
    >
      {/* Effet de reflet bombé */}
      <div 
        className="absolute top-0 left-2 right-2 h-2/5 rounded-t-2xl pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
      />
      
      <div className="relative">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Informations de grossesse</h3>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5"
              style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
            >
              <p className="text-xs text-slate-500 font-semibold">Dernières règles</p>
              <p className="text-sm font-bold text-slate-700">{formatDate(pregnancyProfile.last_period_date)}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5"
              style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
            >
              <p className="text-xs text-slate-500 font-semibold">Conception estimée</p>
              <p className="text-sm font-bold text-pink-600">{formatDate(pregnancyProfile.estimated_conception_date)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5"
              style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
            >
              <p className="text-xs text-slate-500 font-semibold">Accouchement prévu</p>
              <p className="text-sm font-bold text-rose-600">{formatDate(pregnancyProfile.estimated_due_date)}</p>
            </div>
            <div 
              className="rounded-xl p-2.5"
              style={{
                background: 'linear-gradient(145deg, rgba(224,242,254,0.8) 0%, rgba(252,231,243,0.8) 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)'
              }}
            >
              <p className="text-xs text-slate-600 font-semibold">Semaine actuelle</p>
              <p className="text-lg font-bold text-slate-700">{pregnancyProfile.current_week} sem.</p>
            </div>
          </div>
          
          {/* Section J'ai accouché intégrée */}
          {subscriptionStatus === 'premium' && (
            <div className="mt-3 pt-3 border-t border-pink-200/50">
              <PregnancyInfoSection
                subscriptionStatus={subscriptionStatus}
                setSubscriptionStatus={setSubscriptionStatus}
                onLoadFullStatus={onLoadFullStatus}
                embedded={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
