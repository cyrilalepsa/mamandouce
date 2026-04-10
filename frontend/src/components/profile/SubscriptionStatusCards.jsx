import { Crown, Baby } from 'lucide-react';

// Styles pastel bombés
const PASTEL_STYLES = {
  amber: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,243,199,0.95) 30%, rgba(253,230,138,0.85) 70%, rgba(252,211,77,0.75) 100%)',
    shadow: '0 6px 16px -4px rgba(245,158,11,0.2), 0 3px 6px -2px rgba(245,158,11,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(245,158,11,0.08)',
    iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-400',
    text: 'text-amber-600'
  },
  rose: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,228,230,0.95) 30%, rgba(254,205,211,0.85) 70%, rgba(253,164,175,0.75) 100%)',
    shadow: '0 6px 16px -4px rgba(244,63,94,0.2), 0 3px 6px -2px rgba(244,63,94,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(244,63,94,0.08)',
    iconBg: 'bg-gradient-to-br from-rose-400 to-pink-400',
    text: 'text-rose-600'
  },
  slate: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.95) 30%, rgba(226,232,240,0.85) 70%, rgba(203,213,225,0.75) 100%)',
    shadow: '0 6px 16px -4px rgba(100,116,139,0.15), 0 3px 6px -2px rgba(100,116,139,0.08), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(100,116,139,0.05)',
    iconBg: 'bg-slate-200',
    text: 'text-slate-500'
  }
};

export function SubscriptionStatusCards({ subscriptionStatus, fullStatus }) {
  const premiumStyle = subscriptionStatus === 'premium' ? PASTEL_STYLES.amber : PASTEL_STYLES.slate;
  const postpartumStyle = fullStatus?.postpartum_unlocked ? PASTEL_STYLES.rose : PASTEL_STYLES.slate;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Premium Card */}
      <div 
        className="rounded-2xl p-3.5 relative overflow-hidden transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: premiumStyle.bg,
          boxShadow: premiumStyle.shadow
        }}
        data-testid="premium-status-card"
      >
        <div 
          className="absolute top-0 left-2 right-2 h-2/5 rounded-t-2xl pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
        />
        <div className="relative flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${premiumStyle.iconBg}`}
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            <Crown className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Premium</p>
            <p className={`text-xs font-semibold ${premiumStyle.text}`}>
              {subscriptionStatus === 'premium' ? '✓ Activé' : 'Non activé'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Post-partum Card */}
      <div 
        className="rounded-2xl p-3.5 relative overflow-hidden transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: postpartumStyle.bg,
          boxShadow: postpartumStyle.shadow
        }}
        data-testid="postpartum-status-card"
      >
        <div 
          className="absolute top-0 left-2 right-2 h-2/5 rounded-t-2xl pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
        />
        <div className="relative flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${postpartumStyle.iconBg}`}
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            <Baby className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Post-partum</p>
            <p className={`text-xs font-semibold ${postpartumStyle.text}`}>
              {fullStatus?.postpartum_unlocked ? '✓ Activé' : 'Non activé'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
