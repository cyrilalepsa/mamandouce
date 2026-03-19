import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Loader, Shield, CreditCard, Check, Crown, Baby, Lock, Heart, Sparkles, ArrowRight, Gift, LogOut } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function SubscriptionCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);
  const [startingTrial, setStartingTrial] = useState(false);
  
  const packageType = searchParams.get('package') || 'annual';
  const product = searchParams.get('product');
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const isTrial = searchParams.get('trial') === 'true';

  const steps = [
    { label: 'Préparation...', icon: Check },
    { label: 'Création de session sécurisée...', icon: Shield },
    { label: 'Connexion au paiement...', icon: CreditCard },
  ];

  useEffect(() => {
    loadUser();
    loadTrialStatus();
    
    // Si démarrage d'essai gratuit
    if (isTrial) {
      handleStartTrial();
      return;
    }
    
    // Si pas en mode onboarding et un produit spécifique est demandé, lancer le checkout directement
    if (!isOnboarding && (product || packageType)) {
      handleDirectCheckout();
    }
  }, []);
  
  const loadTrialStatus = async () => {
    try {
      const response = await api.subscription.getTrialStatus();
      setTrialStatus(response.data);
    } catch (error) {
      console.error('Erreur chargement statut essai:', error);
    }
  };
  
  const handleStartTrial = async () => {
    setStartingTrial(true);
    try {
      const response = await api.subscription.startTrial();
      if (response.data.success) {
        toast.success(
          <div>
            <p className="font-bold">Essai gratuit activé !</p>
            <p>Profitez de 7 jours Premium</p>
          </div>
        );
        navigate('/', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.detail || "Erreur lors de l'activation";
      toast.error(message);
      navigate('/pricing', { replace: true });
    } finally {
      setStartingTrial(false);
    }
  };

  useEffect(() => {
    if (loading && !isOnboarding) {
      const interval = setInterval(() => {
        setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading, isOnboarding]);

  const loadUser = async () => {
    try {
      const response = await api.auth.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const handleDirectCheckout = async () => {
    setLoading(true);
    setStep(0);
    try {
      const originUrl = window.location.origin;
      const response = await api.subscription.createCheckout({
        package_id: product === 'postpartum' ? 'postpartum' : packageType,
        origin_url: originUrl
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Erreur création checkout:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création de la session de paiement');
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    setLoading(true);

    try {
      const originUrl = window.location.origin;
      
      if (plan === 'premium') {
        const response = await api.subscription.createCheckout({
          package_id: 'annual',
          origin_url: originUrl
        });
        window.location.href = response.data.url;
      } else if (plan === 'postpartum') {
        const response = await api.subscription.createCheckout({
          package_id: 'postpartum',
          origin_url: originUrl
        });
        window.location.href = response.data.url;
      } else if (plan === 'free') {
        toast.info('Version gratuite activée. Certaines fonctionnalités sont limitées.');
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du processus. Veuillez réessayer.');
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  // Mode Onboarding - Afficher le choix des plans
  if (isOnboarding) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center pt-8 pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Bienvenue sur MamanDouce{user?.name ? `, ${user.name}` : ''} !
            </h1>
            <p className="text-slate-500 text-lg">
              Choisissez votre formule pour commencer votre accompagnement
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Version Gratuite */}
            <Card 
              className={`bg-white rounded-3xl p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg ${
                selectedPlan === 'free' ? 'border-slate-400 shadow-lg' : 'border-slate-100'
              }`}
              onClick={() => !loading && setSelectedPlan('free')}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-700 mb-1">Découverte</h3>
                <div className="text-3xl font-bold text-slate-600">Gratuit</div>
                <p className="text-slate-400 text-sm">Fonctionnalités limitées</p>
              </div>
              
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600">Conseils semaines 1-4</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600">5 scans de produits/semaine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600">Calendrier de fertilité</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Lock className="w-4 h-4" />
                  <span>41 semaines de conseils</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Lock className="w-4 h-4" />
                  <span>Scanner illimité</span>
                </li>
              </ul>
              
              <Button
                onClick={() => handleSelectPlan('free')}
                disabled={loading}
                data-testid="choose-free-btn"
                className={`w-full rounded-full py-3 font-semibold ${
                  selectedPlan === 'free' 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {loading && selectedPlan === 'free' ? 'Chargement...' : 'Commencer gratuitement'}
              </Button>
            </Card>

            {/* Premium */}
            <Card 
              className={`bg-gradient-to-br from-sky-400 to-sky-500 rounded-3xl p-6 shadow-lg border-4 transition-all cursor-pointer hover:shadow-xl relative ${
                selectedPlan === 'premium' ? 'border-amber-400 shadow-xl scale-[1.02]' : 'border-amber-300'
              }`}
              onClick={() => !loading && setSelectedPlan('premium')}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-4 py-1 rounded-full text-xs font-bold">
                RECOMMANDÉ
              </div>
              
              <div className="text-center mb-4">
                <Crown className="w-10 h-10 text-amber-300 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white mb-1">Premium</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-white">27€</span>
                  <span className="text-lg text-white">/9 mois</span>
                </div>
                <p className="text-sky-100 text-sm mt-1">soit 3€/mois</p>
              </div>
              
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white">41 semaines de conseils complets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white">Scanner illimité de produits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white">Suivi de grossesse complet</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white">Préparer l'arrivée de bébé</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white">Notifications personnalisées</span>
                </li>
              </ul>
              
              <Button
                onClick={() => handleSelectPlan('premium')}
                disabled={loading}
                data-testid="choose-premium-btn"
                className="w-full bg-white text-sky-600 rounded-full py-3 font-bold hover:bg-sky-50"
              >
                {loading && selectedPlan === 'premium' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    Redirection...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Choisir Premium
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </Card>
          </div>

          {/* Option Post-partum */}
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 border border-rose-200">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Baby className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-700">Déjà maman ?</h3>
                  <span className="bg-rose-200 text-rose-700 px-2 py-0.5 rounded-full text-xs font-semibold">8€</span>
                </div>
                <p className="text-slate-600 text-sm mb-3">
                  Accédez au suivi post-partum : 6 mois de conseils, RDV médicaux, allaitement, biberon et 40+ recettes pour bébé.
                </p>
                <Button
                  onClick={() => handleSelectPlan('postpartum')}
                  disabled={loading}
                  data-testid="choose-postpartum-btn"
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full px-6 py-2 font-semibold hover:opacity-90"
                >
                  {loading && selectedPlan === 'postpartum' ? 'Redirection...' : 'Choisir Post-partum'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Garanties */}
          <div className="flex flex-wrap justify-center gap-6 text-center text-sm text-slate-500 py-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-500" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Satisfait ou remboursé 30j</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-500" />
              <span>Sans renouvellement auto</span>
            </div>
          </div>

          {/* Bouton déconnexion discret */}
          <div className="text-center pb-8">
            <button
              onClick={handleLogout}
              className="text-slate-400 text-sm hover:text-slate-600 flex items-center gap-1 mx-auto"
            >
              <LogOut className="w-3 h-3" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode direct checkout - Afficher le loader
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
