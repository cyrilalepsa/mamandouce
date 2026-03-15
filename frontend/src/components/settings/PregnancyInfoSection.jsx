import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Baby, Calendar, AlertTriangle, Heart } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function PregnancyInfoSection({ 
  subscriptionStatus, 
  setSubscriptionStatus,
  onLoadFullStatus 
}) {
  const [showBirthConfirm, setShowBirthConfirm] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [confirmingBirth, setConfirmingBirth] = useState(false);

  const handleBirthConfirmation = async () => {
    if (!birthDate) {
      toast.error('Veuillez entrer la date d\'accouchement');
      return;
    }
    
    const confirmed = window.confirm(
      '⚠️ ATTENTION ⚠️\n\n' +
      'En confirmant votre accouchement :\n\n' +
      '• Votre abonnement Premium prendra fin\n' +
      '• Aucun remboursement ne pourra être demandé\n' +
      '• Vous accéderez au suivi post-partum (si acheté)\n\n' +
      'Êtes-vous sûre de vouloir continuer ?'
    );
    
    if (!confirmed) return;
    
    setConfirmingBirth(true);
    try {
      await api.postpartum.setBirthDate(birthDate, babyName);
      await api.auth.endPremium();
      toast.success('Félicitations pour votre bébé ! Votre suivi post-partum est maintenant accessible.');
      setShowBirthConfirm(false);
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
              onClick={handleBirthConfirmation}
              disabled={confirmingBirth}
              data-testid="confirm-birth-button"
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-2"
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
      )}
    </Card>
  );
}
