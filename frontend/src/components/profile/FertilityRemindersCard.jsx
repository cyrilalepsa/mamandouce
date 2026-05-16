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
    <div 
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,228,230,0.95) 30%, rgba(254,205,211,0.85) 70%, rgba(253,164,175,0.75) 100%)',
        boxShadow: '0 6px 16px -4px rgba(244,63,94,0.2), 0 3px 6px -2px rgba(244,63,94,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(244,63,94,0.08)'
      }}
      data-testid="fertility-reminders-card"
    >
      {/* Voile blanc supprimé */}
<div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              fertilityRemindersEnabled 
                ? 'bg-gradient-to-br from-rose-400 to-pink-400' 
                : 'bg-slate-300/80'
            }`}
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <Heart className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700">Rappels de fertilité</h3>
              <p className="text-xs text-slate-500">
                {fertilityRemindersEnabled 
                  ? 'Notifications activées'
                  : 'Alerte période fertile'}
              </p>
            </div>
          </div>
          <Button
            onClick={onToggle}
            disabled={fertilityRemindersLoading}
            data-testid="toggle-fertility-reminders"
            className={`rounded-full px-4 py-1.5 text-sm transition-all ${
              fertilityRemindersEnabled
                ? 'bg-white/60 text-slate-700 hover:bg-white/80 backdrop-blur-sm'
                : 'bg-gradient-to-r from-rose-400 to-pink-400 text-white hover:opacity-90'
            }`}
            style={{ boxShadow: fertilityRemindersEnabled ? 'inset 0 1px 2px rgba(255,255,255,0.8)' : '0 2px 4px rgba(244,63,94,0.3)' }}
          >
            {fertilityRemindersLoading ? '...' : fertilityRemindersEnabled ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
        
        <p className="mt-3 text-xs text-rose-700/80 bg-white/50 backdrop-blur-sm rounded-xl p-2.5"
          style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
        >
          Notification pendant votre fenêtre de fertilité + rappel jour d'ovulation.
        </p>
      </div>
    </div>
  );
}
