import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Check, Crown, Baby, Lock, Heart, Sparkles, ArrowRight, Gift, LogOut } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [user, setUser] = useState(null);
  const isOnboarding = searchParams.get('onboarding') === 'true';

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.auth.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
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
        // Mode gratuit - marquer comme onboardé mais sans abonnement premium
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
              <div className="text-3xl font-bold text-white">27€</div>
              <p className="text-sky-100 text-sm">pour 9 mois - soit 3€/mois</p>
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
                <span className="text-white">Images évolution embryon</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white" />
                <span className="text-white">Check-list maternité</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white" />
                <span className="text-white">Notifications personnalisées</span>
              </li>
            </ul>
            
            <Button
              onClick={() => handleSelectPlan('premium')}
              disabled={loading}
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

export default OnboardingPage;
