import { Button } from '../ui/button';
import { Bell, BellOff } from 'lucide-react';

export function NotificationsCard({ 
  notificationsSupported, 
  notificationsEnabled, 
  notificationsLoading, 
  onToggle 
}) {
  if (!notificationsSupported) return null;

  return (
    <div 
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,243,199,0.95) 30%, rgba(253,230,138,0.85) 70%, rgba(252,211,77,0.75) 100%)',
        boxShadow: '0 6px 16px -4px rgba(245,158,11,0.2), 0 3px 6px -2px rgba(245,158,11,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(245,158,11,0.08)'
      }}
      data-testid="notifications-card"
    >
      {/* Voile blanc supprimé */}
<div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            notificationsEnabled 
              ? 'bg-gradient-to-br from-amber-400 to-orange-400' 
              : 'bg-slate-300/80'
          }`}
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            {notificationsEnabled ? (
              <Bell className="w-4.5 h-4.5 text-white" />
            ) : (
              <BellOff className="w-4.5 h-4.5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">Notifications</h3>
            <p className="text-xs text-slate-500">
              {notificationsEnabled 
                ? 'Alertes activées'
                : 'Activez pour être alertée'}
            </p>
          </div>
        </div>
        <Button
          onClick={onToggle}
          disabled={notificationsLoading}
          data-testid="toggle-notifications"
          className={`rounded-full px-4 py-1.5 text-sm transition-all ${
            notificationsEnabled
              ? 'bg-white/60 text-slate-700 hover:bg-white/80 backdrop-blur-sm'
              : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:opacity-90'
          }`}
          style={{ boxShadow: notificationsEnabled ? 'inset 0 1px 2px rgba(255,255,255,0.8)' : '0 2px 4px rgba(245,158,11,0.3)' }}
        >
          {notificationsLoading ? '...' : notificationsEnabled ? 'Désactiver' : 'Activer'}
        </Button>
      </div>
    </div>
  );
}
