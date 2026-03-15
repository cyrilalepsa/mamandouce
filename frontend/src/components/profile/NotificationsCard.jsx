import { Card } from '../ui/card';
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
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-100" data-testid="notifications-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            notificationsEnabled 
              ? 'bg-gradient-to-br from-amber-400 to-orange-400' 
              : 'bg-slate-300'
          }`}>
            {notificationsEnabled ? (
              <Bell className="w-5 h-5 text-white" />
            ) : (
              <BellOff className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Notifications</h3>
            <p className="text-sm text-slate-500">
              {notificationsEnabled 
                ? 'Vous recevrez une alerte pour les nouvelles réponses'
                : 'Activez pour être alertée des réponses'}
            </p>
          </div>
        </div>
        <Button
          onClick={onToggle}
          disabled={notificationsLoading}
          data-testid="toggle-notifications"
          className={`rounded-full px-6 py-2 transition-all ${
            notificationsEnabled
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:opacity-90'
          }`}
        >
          {notificationsLoading ? '...' : notificationsEnabled ? 'Désactiver' : 'Activer'}
        </Button>
      </div>
    </Card>
  );
}
