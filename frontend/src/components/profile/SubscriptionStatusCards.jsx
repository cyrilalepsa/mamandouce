import { Card } from '../ui/card';
import { Crown, Baby } from 'lucide-react';

export function SubscriptionStatusCards({ subscriptionStatus, fullStatus }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className={`rounded-2xl p-4 shadow-sm ${
        subscriptionStatus === 'premium' 
          ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-200' 
          : 'bg-white border border-slate-100'
      }`} data-testid="premium-status-card">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            subscriptionStatus === 'premium' 
              ? 'bg-gradient-to-br from-amber-400 to-yellow-400' 
              : 'bg-slate-200'
          }`}>
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Premium</p>
            <p className={`text-xs font-semibold ${subscriptionStatus === 'premium' ? 'text-amber-600' : 'text-slate-500'}`}>
              {subscriptionStatus === 'premium' ? '✓ Activé' : 'Non activé'}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className={`rounded-2xl p-4 shadow-sm ${
        fullStatus?.postpartum_unlocked 
          ? 'bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200' 
          : 'bg-white border border-slate-100'
      }`} data-testid="postpartum-status-card">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            fullStatus?.postpartum_unlocked 
              ? 'bg-gradient-to-br from-rose-400 to-pink-400' 
              : 'bg-slate-200'
          }`}>
            <Baby className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Post-partum</p>
            <p className={`text-xs font-semibold ${fullStatus?.postpartum_unlocked ? 'text-rose-600' : 'text-slate-500'}`}>
              {fullStatus?.postpartum_unlocked ? '✓ Activé' : 'Non activé'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
