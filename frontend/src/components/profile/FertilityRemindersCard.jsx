import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Heart } from 'lucide-react';

export function FertilityRemindersCard({ 
  pregnancyProfile, 
  fertilityRemindersEnabled, 
  fertilityRemindersLoading, 
  onToggle 
}) {
  if (!pregnancyProfile) return null;

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100" data-testid="fertility-reminders-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            fertilityRemindersEnabled 
              ? 'bg-gradient-to-br from-rose-400 to-pink-400' 
              : 'bg-slate-300'
          }`}>
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Rappels de fertilité</h3>
            <p className="text-sm text-slate-500">
              {fertilityRemindersEnabled 
                ? 'Notifications activées pour votre fenêtre fertile'
                : 'Recevez une alerte pendant votre période fertile'}
            </p>
          </div>
        </div>
        <Button
          onClick={onToggle}
          disabled={fertilityRemindersLoading}
          data-testid="toggle-fertility-reminders"
          className={`rounded-full px-6 py-2 transition-all ${
            fertilityRemindersEnabled
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-gradient-to-r from-rose-400 to-pink-400 text-white hover:opacity-90'
          }`}
        >
          {fertilityRemindersLoading ? '...' : fertilityRemindersEnabled ? 'Désactiver' : 'Activer'}
        </Button>
      </div>
      <p className="mt-3 text-xs text-slate-500 bg-white/50 rounded-xl p-3">
        Vous recevrez une notification quand vous serez dans votre fenêtre de fertilité, avec un rappel spécial le jour de l'ovulation.
      </p>
    </Card>
  );
}
