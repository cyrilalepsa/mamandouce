import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Shield, Mail, Check, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function TwoFactorSection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await api.auth.get2FAStatus();
      setTwoFactorEnabled(response.data.two_factor_enabled || false);
    } catch (error) {
      console.error('Error loading 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const newStatus = !twoFactorEnabled;
      await api.auth.toggle2FA(newStatus);
      setTwoFactorEnabled(newStatus);
      toast.success(newStatus 
        ? 'Authentification à deux facteurs activée !' 
        : 'Authentification à deux facteurs désactivée'
      );
    } catch (error) {
      toast.error('Erreur lors de la modification');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <p className="text-slate-500 text-center">Chargement...</p>
      </Card>
    );
  }

  return (
    <Card className={`rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${
      twoFactorEnabled
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
        : 'bg-white border-slate-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          twoFactorEnabled
            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
            : 'bg-gradient-to-br from-slate-400 to-slate-300'
        }`}>
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Double authentification (2FA)
          </h2>
          <p className="text-slate-500 text-sm">
            Sécurisez votre compte avec un code par email
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {twoFactorEnabled ? (
          <div className="flex items-center gap-2 p-4 bg-green-100 rounded-2xl">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-semibold">
              2FA activée - Un code vous sera envoyé à chaque connexion
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-semibold">
                Votre compte n'est pas protégé par la 2FA
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Activez la double authentification pour recevoir un code de vérification par email à chaque connexion.
              </p>
            </div>
          </div>
        )}

        <div className="p-4 bg-slate-50 rounded-2xl">
          <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-pink-500" />
            Comment ça fonctionne ?
          </h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>1. Vous entrez votre email et mot de passe</li>
            <li>2. Un code à 6 chiffres est envoyé sur votre email</li>
            <li>3. Vous entrez ce code pour vous connecter</li>
          </ul>
        </div>

        <Button
          onClick={handleToggle}
          disabled={toggling}
          data-testid="toggle-2fa-button"
          className={`w-full rounded-full py-3 font-semibold ${
            twoFactorEnabled
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
          }`}
        >
          {toggling ? 'Modification...' : twoFactorEnabled ? 'Désactiver la 2FA' : 'Activer la 2FA'}
        </Button>
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        La double authentification ajoute une couche de sécurité supplémentaire à votre compte.
      </p>
    </Card>
  );
}
