import { Card } from '../ui/card';
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
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-100" data-testid="biometric-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            biometricEnabled || pinEnabled
              ? 'bg-gradient-to-br from-pink-400 to-purple-400' 
              : 'bg-slate-300'
          }`}>
            {biometricEnabled ? (
              <Fingerprint className="w-5 h-5 text-white" />
            ) : pinEnabled ? (
              <KeyRound className="w-5 h-5 text-white" />
            ) : (
              <Fingerprint className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Connexion rapide</h3>
            <p className="text-sm text-slate-500">
              {biometricEnabled 
                ? 'Empreinte digitale / Face ID activé'
                : pinEnabled
                  ? 'Code PIN activé'
                  : biometricSupported
                    ? 'Utilisez votre empreinte pour vous connecter'
                    : 'Non disponible sur cet appareil'}
            </p>
          </div>
        </div>
        {(biometricEnabled || pinEnabled) && (
          <Button
            onClick={handleDisable}
            data-testid="disable-quick-login"
            className="rounded-full px-6 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            Désactiver
          </Button>
        )}
      </div>
      {!biometricEnabled && !pinEnabled && biometricSupported && (
        <p className="mt-3 text-xs text-slate-500 bg-white/50 rounded-xl p-3">
          Pour activer la connexion par empreinte, déconnectez-vous puis reconnectez-vous. L'option vous sera proposée automatiquement.
        </p>
      )}
      {!biometricEnabled && !pinEnabled && !biometricSupported && (
        <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-xl p-3">
          Votre appareil ne supporte pas l'authentification biométrique. Déconnectez-vous et reconnectez-vous pour configurer un code PIN rapide.
        </p>
      )}
    </Card>
  );
}
