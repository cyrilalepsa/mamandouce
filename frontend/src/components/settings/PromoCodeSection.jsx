import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Gift, Crown, Sparkles, Baby, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function PromoCodeSection({ 
  subscriptionStatus, 
  setSubscriptionStatus,
  onLoadFullStatus,
  onNavigate 
}) {
  const [promoCode, setPromoCode] = useState('');
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [showBirthConfirm, setShowBirthConfirm] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [confirmingBirth, setConfirmingBirth] = useState(false);

  const handleRedeemCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Veuillez entrer un code');
      return;
    }
    
    setRedeemingCode(true);
    try {
      const response = await api.subscription.redeemCode(promoCode);
      toast.success(response.data.message);
      setSubscriptionStatus('premium');
      setPromoCode('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Code invalide');
    } finally {
      setRedeemingCode(false);
    }
  };

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

  return (
    <Card className={`rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${
      subscriptionStatus === 'premium' 
        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' 
        : 'bg-white border-slate-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          subscriptionStatus === 'premium'
            ? 'bg-gradient-to-br from-amber-500 to-yellow-400'
            : 'bg-gradient-to-br from-pink-500 to-pink-400'
        }`}>
          {subscriptionStatus === 'premium' ? (
            <Crown className="w-6 h-6 text-white" />
          ) : (
            <Gift className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {subscriptionStatus === 'premium' ? 'Premium activé' : 'Code promo'}
          </h2>
          <p className="text-slate-500 text-sm">
            {subscriptionStatus === 'premium' 
              ? 'Vous bénéficiez de l\'accès premium !' 
              : 'Entrez votre code pour activer le premium'}
          </p>
        </div>
      </div>

      {subscriptionStatus === 'premium' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-amber-100 rounded-2xl">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 font-semibold">Merci d'être abonnée !</p>
          </div>
          
          {!showBirthConfirm ? (
            <Button
              onClick={() => setShowBirthConfirm(true)}
              data-testid="show-birth-confirm-button"
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 font-semibold"
            >
              <Baby className="w-5 h-5 mr-2" />
              J'ai accouché
            </Button>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-700">Confirmation d'accouchement</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    En confirmant, votre abonnement premium prendra fin et aucun remboursement ne sera possible.
                    Si vous avez acheté le post-partum, il sera activé.
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
                    data-testid="birth-date-confirm-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Prénom de bébé</label>
                  <Input
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder="Prénom"
                    className="rounded-xl border-rose-200"
                    data-testid="baby-name-confirm-input"
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
                  {confirmingBirth ? 'Confirmation...' : 'Confirmer l\'accouchement'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-3">
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="BETA-XXXXX"
            className="flex-1 rounded-xl border-slate-200 uppercase"
            data-testid="promo-code-input"
          />
          <Button
            onClick={handleRedeemCode}
            disabled={redeemingCode}
            data-testid="redeem-code-button"
            className="bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-xl px-6 font-semibold"
          >
            {redeemingCode ? '...' : 'Activer'}
          </Button>
        </div>
      )}
    </Card>
  );
}
