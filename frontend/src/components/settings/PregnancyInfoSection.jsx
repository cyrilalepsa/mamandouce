import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Baby, Calendar, AlertTriangle, Heart, X, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function PregnancyInfoSection({ 
  subscriptionStatus, 
  setSubscriptionStatus,
  onLoadFullStatus 
}) {
  const [showBirthConfirm, setShowBirthConfirm] = useState(false);
  const [showFinalWarning, setShowFinalWarning] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [confirmingBirth, setConfirmingBirth] = useState(false);

  const handleShowFinalWarning = () => {
    if (!birthDate) {
      toast.error('Veuillez entrer la date d\'accouchement');
      return;
    }
    setShowFinalWarning(true);
  };

  const handleBirthConfirmation = async () => {
    setConfirmingBirth(true);
    try {
      await api.postpartum.setBirthDate(birthDate, babyName);
      await api.auth.endPremium();
      toast.success('Félicitations pour votre bébé ! Votre suivi post-partum est maintenant accessible.');
      setShowBirthConfirm(false);
      setShowFinalWarning(false);
      setSubscriptionStatus('free');
      onLoadFullStatus?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la confirmation');
    } finally {
      setConfirmingBirth(false);
    }
  };

  // Ne pas afficher si pas premium
  if (subscriptionStatus !== 'premium') return null;

  return (
    <>
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Informations de grossesse
            </h2>
            <p className="text-slate-500 text-sm">
              Gérez votre suivi et déclarez votre accouchement
            </p>
          </div>
        </div>

        {!showBirthConfirm ? (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">
              Après votre accouchement, cliquez sur le bouton ci-dessous pour :
            </p>
            <ul className="text-sm text-slate-500 space-y-1 ml-4">
              <li>• Mettre fin à votre abonnement Premium</li>
              <li>• Débloquer le contenu Post-partum (si acheté)</li>
              <li>• Commencer votre suivi après-naissance</li>
            </ul>
            
            <Button
              onClick={() => setShowBirthConfirm(true)}
              data-testid="birth-button"
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-4 font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              <Baby className="w-6 h-6 mr-3" />
              J'ai accouché
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-rose-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-700">Félicitations pour votre bébé !</h4>
                <p className="text-sm text-slate-600 mt-1">
                  En confirmant, votre abonnement premium prendra fin. 
                  Si vous avez acheté le post-partum, il sera automatiquement débloqué.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Date d'accouchement *</label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="rounded-xl border-rose-200"
                  data-testid="birth-date-input"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Prénom de bébé</label>
                <Input
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="Prénom"
                  className="rounded-xl border-rose-200"
                  data-testid="baby-name-input"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowBirthConfirm(false)}
                className="flex-1 bg-slate-100 text-slate-600 rounded-full py-2"
              >
                Annuler
              </Button>
              <Button
                onClick={handleShowFinalWarning}
                data-testid="next-confirm-button"
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-2"
              >
                Continuer
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modale de confirmation finale */}
      {showFinalWarning && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Êtes-vous sûre ?</h3>
              </div>
              <button
                onClick={() => {
                  setShowFinalWarning(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Warning content */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <h4 className="font-bold text-red-800 mb-2">⚠️ Action irréversible</h4>
              <p className="text-red-700 text-sm mb-3">
                En mettant fin à votre abonnement Premium :
              </p>
              <ul className="text-red-700 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span><strong>Aucun remboursement</strong> ne sera possible, même partiel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Vous perdrez l'accès aux fonctionnalités Premium</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Cette action est <strong>définitive</strong></span>
                </li>
              </ul>
            </div>

            {/* What you get */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <h4 className="font-bold text-green-800 mb-2">✨ Ce que vous obtiendrez</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Accès au suivi post-partum (si acheté)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>6 mois d'accompagnement après-naissance</span>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowFinalWarning(false);
                }}
                className="flex-1 bg-slate-100 text-slate-600 rounded-full py-3"
              >
                Annuler
              </Button>
              <Button
                onClick={handleBirthConfirmation}
                disabled={confirmingBirth}
                data-testid="final-confirm-button"
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 disabled:opacity-50"
              >
                {confirmingBirth ? (
                  'Confirmation...'
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
