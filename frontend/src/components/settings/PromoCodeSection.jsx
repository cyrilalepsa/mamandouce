import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Gift } from 'lucide-react';
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

  // Ne pas afficher si déjà premium
  if (subscriptionStatus === 'premium') return null;

  return (
    <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-400 rounded-2xl flex items-center justify-center">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Code promo
          </h2>
          <p className="text-slate-500 text-sm">
            Entrez votre code pour activer le premium
          </p>
        </div>
      </div>

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
    </Card>
  );
}
