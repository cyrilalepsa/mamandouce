import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Loader, Shield, CreditCard, Check } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function SubscriptionCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const packageType = searchParams.get('package') || 'annual';

  const steps = [
    { label: 'Préparation...', icon: Check },
    { label: 'Création de session sécurisée...', icon: Shield },
    { label: 'Connexion au paiement...', icon: CreditCard },
  ];

  useEffect(() => {
    handleCheckout();
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleCheckout = async () => {
    setLoading(true);
    setStep(0);
    try {
      const originUrl = window.location.origin;
      const response = await api.subscription.createCheckout({
        package_id: packageType,
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
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-pink-400 rounded-full animate-pulse opacity-30" />
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <Loader className="w-10 h-10 text-sky-500 animate-spin" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Redirection vers le paiement
        </h2>
        
        {/* Steps progress */}
        <div className="space-y-3 mb-6">
          {steps.map((s, index) => {
            const StepIcon = s.icon;
            const isActive = index <= step;
            return (
              <div 
                key={index} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-sky-50 to-pink-50 border border-sky-100' 
                    : 'bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-gradient-to-r from-sky-400 to-pink-400' : 'bg-slate-200'
                }`}>
                  {index < step ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <StepIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Paiement sécurisé par Stripe
        </p>
        
        <Button
          onClick={() => navigate('/pricing')}
          className="text-slate-500 hover:text-slate-700"
          variant="ghost"
        >
          Annuler
        </Button>
      </Card>
    </div>
  );
}

export default SubscriptionCheckout;