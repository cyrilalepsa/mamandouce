import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Loader } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function SubscriptionCheckout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lancer automatiquement le checkout
    handleCheckout();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const originUrl = window.location.origin;
      const response = await api.subscription.createCheckout({
        package_id: 'annual',
        origin_url: originUrl
      });

      // Rediriger vers Stripe
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Erreur création checkout:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création de la session de paiement');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-slate-100 text-center animate-fade-in">
        <Loader className="w-16 h-16 text-sky-500 mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Redirection vers le paiement...</h2>
        <p className="text-slate-500">Vous allez être redirigé vers notre page de paiement sécurisée</p>
        <Button
          onClick={() => navigate('/pricing')}
          className="mt-6 text-slate-500 hover:text-slate-700"
          variant="ghost"
        >
          Annuler
        </Button>
      </Card>
    </div>
  );
}

export default SubscriptionCheckout;