import { useState, useEffect, createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';

// Context pour partager le statut d'abonnement dans toute l'app
const SubscriptionContext = createContext({
  isPremium: false,
  isAdmin: false,
  subscriptionStatus: null,
  loading: true,
  refreshStatus: () => {}
});

export const useSubscription = () => useContext(SubscriptionContext);

// Pages accessibles sans authentification
const PUBLIC_PAGES = [
  '/auth',
  '/reset-password',
  '/pricing',
  '/privacy',
  '/birth-list/shared',
  '/recipes/shared'
];

export function SubscriptionGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  const checkSubscription = async () => {
    try {
      // Vérifier le statut de l'utilisateur
      const userResponse = await api.auth.getMe();
      const user = userResponse.data;
      
      // Les admins ont accès à tout SAUF s'ils testent en mode gratuit
      const ADMIN_EMAIL = "cyrilalepsa@gmail.com";
      const userIsAdmin = user.role === 'admin' || user.email === ADMIN_EMAIL;
      setIsAdmin(userIsAdmin);

      // Vérifier le statut d'abonnement
      const subResponse = await api.subscription.getFullStatus();
      const status = subResponse.data;
      
      setSubscriptionStatus(status);
      
      // Pour les admins : respecter leur statut premium actuel (permet de tester en mode gratuit)
      // Pour les autres : vérifier is_premium
      if (userIsAdmin) {
        // L'admin peut se mettre en mode gratuit en désactivant son premium
        setIsPremium(status.is_premium);
      } else {
        setIsPremium(status.is_premium);
      }
      
    } catch (error) {
      console.error('Erreur vérification abonnement:', error);
      // En cas d'erreur, définir comme utilisateur gratuit
      setIsPremium(false);
      setSubscriptionStatus({ is_premium: false, subscription_status: 'free' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionContext.Provider value={{ 
      isPremium, 
      isAdmin, 
      subscriptionStatus, 
      loading,
      refreshStatus: checkSubscription 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function isPublicPage(pathname) {
  return PUBLIC_PAGES.some(page => pathname.startsWith(page));
}
