import { Button } from '../ui/button';
import { Fingerprint, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { disableAllQuickLogin } from '../../utils/biometricAuth';

export function QuickLoginCard({ 
  biometricEnabled, 
  biometricSupported, 
  pinEnabled, 
  setBiometricEnabled, 
  setPinEnabled 
}) {
  const handleDisable = () => {
    disableAllQuickLogin();
    setBiometricEnabled(false);
    setPinEnabled(false);
    toast.success('Connexion rapide désactivée');
  };

  return (
    <div 
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,232,255,0.95) 30%, rgba(233,213,255,0.85) 70%, rgba(216,180,254,0.75) 100%)',
        boxShadow: '0 6px 16px -4px rgba(139,92,246,0.2), 0 3px 6px -2px rgba(139,92,246,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(139,92,246,0.08)'
      }}
      data-testid="biometric-card"
    >
      {/* Effet de reflet bombé */}
      <div 
        className="absolute top-0 left-2 right-2 h-2/5 rounded-t-2xl pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
      />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              biometricEnabled || pinEnabled
                ? 'bg-gradient-to-br from-purple-400 to-pink-400' 
                : 'bg-slate-300/80'
            }`}
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              {biometricEnabled ? (
                <Fingerprint className="w-4.5 h-4.5 text-white" />
              ) : pinEnabled ? (
                <KeyRound className="w-4.5 h-4.5 text-white" />
              ) : (
                <Fingerprint className="w-4.5 h-4.5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700">Connexion rapide</h3>
              <p className="text-xs text-slate-500">
                {biometricEnabled 
                  ? 'Empreinte / Face ID activé'
                  : pinEnabled
                    ? 'Code PIN activé'
                    : biometricSupported
                      ? 'Utilisez votre empreinte'
                      : 'Non disponible'}
              </p>
            </div>
          </div>
          {(biometricEnabled || pinEnabled) && (
            <Button
              onClick={handleDisable}
              data-testid="disable-quick-login"
              className="rounded-full px-4 py-1.5 text-sm bg-white/60 text-slate-700 hover:bg-white/80 backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
            >
              Désactiver
            </Button>
          )}
        </div>
        
        {!biometricEnabled && !pinEnabled && biometricSupported && (
          <p className="mt-3 text-xs text-slate-500 bg-white/50 backdrop-blur-sm rounded-xl p-2.5"
            style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
          >
            Déconnectez-vous puis reconnectez-vous pour activer.
          </p>
        )}
        {!biometricEnabled && !pinEnabled && !biometricSupported && (
          <p className="mt-3 text-xs text-amber-700/80 bg-amber-50/50 backdrop-blur-sm rounded-xl p-2.5 border border-amber-200/40">
            Non disponible. Reconnectez-vous pour configurer un code PIN.
          </p>
        )}
      </div>
    </div>
  );
}
