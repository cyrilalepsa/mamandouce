import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Gift, Crown, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function PromoCodeSection({ 
  subscriptionStatus, 
  setSubscriptionStatus
}) {
  const [promoCode, setPromoCode] = useState('');
  const [redeemingCode, setRedeemingCode] = useState(false);

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
        <div className="flex items-center gap-2 p-4 bg-amber-100 rounded-2xl">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 font-semibold">Merci d'être abonnée !</p>
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
