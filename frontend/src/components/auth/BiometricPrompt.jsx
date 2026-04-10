import { Button } from '../ui/button';
import { Fingerprint } from 'lucide-react';

export function BiometricPrompt({ onEnable, onSkip }) {
  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Fingerprint className="w-10 h-10 text-pink-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-700 mb-2">Connexion rapide</h2>
      <p className="text-slate-500 text-sm mb-6">
        Voulez-vous activer la connexion rapide par empreinte digitale pour vos prochaines visites ?
      </p>
      <div className="space-y-3">
        <Button
          onClick={() => onEnable(true)}
          className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full px-6 py-3 font-bold"
        >
          <Fingerprint className="w-5 h-5 mr-2" />
          Oui, activer
        </Button>
        <Button
          onClick={onSkip}
          variant="outline"
          className="w-full rounded-full px-6 py-3 font-semibold text-slate-600"
        >
          Non, utiliser un code PIN
        </Button>
      </div>
    </div>
  );
}
