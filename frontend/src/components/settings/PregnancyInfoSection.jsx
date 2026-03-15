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
  onLoadFullStatus,
  embedded = false
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
      try {
        await api.auth.endPremium();
      } catch (endPremiumError) {
        // L'utilisateur peut ne pas avoir de premium actif, ce n'est pas grave
        console.log('Note: endPremium error (normal si pas premium):', endPremiumError?.response?.data?.detail);
      }
      toast.success('Félicitations pour votre bébé ! Votre suivi post-partum est maintenant accessible.');
      setShowBirthConfirm(false);
      setShowFinalWarning(false);
      setSubscriptionStatus('free');
      onLoadFullStatus?.();
    } catch (error) {
      console.error('Erreur confirmation naissance:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la confirmation. Veuillez réessayer.');
    } finally {
      setConfirmingBirth(false);
    }
  };

  const resetForm = () => {
    setShowBirthConfirm(false);
    setShowFinalWarning(false);
    setBirthDate('');
    setBabyName('');
  };

  // Ne pas afficher si pas premium
  if (subscriptionStatus !== 'premium') return null;

  // Contenu principal
  const mainContent = (
    <>
      {!showBirthConfirm ? (
        <div className="space-y-3">
          <p className="text-slate-600 text-sm">
            Après votre accouchement, cliquez ci-dessous pour débloquer le contenu Post-partum.
          </p>
          
          <Button
            onClick={() => setShowBirthConfirm(true)}
            data-testid="birth-button"
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            <Baby className="w-5 h-5 mr-2" />
            J'ai accouché
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-700">Déclarer mon accouchement</h3>
            <button
              onClick={resetForm}
              className="p-1.5 hover:bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-1 block">
              Date d'accouchement *
            </label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="rounded-xl border-rose-200"
              data-testid="birth-date-input"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-1 block">
              Prénom du bébé (optionnel)
            </label>
            <Input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="Entrez le prénom"
              className="rounded-xl border-rose-200"
              data-testid="baby-name-input"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={resetForm}
              className="flex-1 bg-slate-100 text-slate-600 rounded-full py-2"
            >
              Annuler
            </Button>
            <Button
              onClick={handleShowFinalWarning}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-2"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}
    </>
  );

  // Modal de confirmation finale
  const confirmationModal = showFinalWarning && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-700">Confirmation finale</h3>
          <button
            onClick={() => setShowFinalWarning(false)}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-red-800">Action irréversible</h4>
              <ul className="text-red-700 text-sm mt-2 space-y-1">
                <li>• Votre abonnement Premium sera terminé</li>
                <li>• Aucun remboursement ne sera possible</li>
                <li>• Cette action ne peut pas être annulée</li>
              </ul>
            </div>
          </div>
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
            onClick={() => setShowFinalWarning(false)}
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
  );

  // Mode embedded (intégré dans une autre carte)
  if (embedded) {
    return (
      <>
        {mainContent}
        {confirmationModal}
      </>
    );
  }

  // Mode standalone (avec sa propre carte)
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
              Déclarez votre accouchement
            </p>
          </div>
        </div>
        {mainContent}
      </Card>
      {confirmationModal}
    </>
  );
}
