import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

// Pages accessibles sans abonnement
const FREE_PAGES = [
  '/subscription/checkout',
  '/subscription/success',
  '/subscription/cancel',
  '/pricing',
  '/privacy',
  '/profile',
  '/settings'
];

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
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkSubscription();
  }, [location.pathname]);

  const checkSubscription = async () => {
    // Si c'est une page gratuite, ne pas vérifier
    const isFreePage = FREE_PAGES.some(page => location.pathname.startsWith(page));
    if (isFreePage) {
      setLoading(false);
      setHasSubscription(true);
      return;
    }

    try {
      // Vérifier le statut de l'utilisateur
      const userResponse = await api.auth.getMe();
      const user = userResponse.data;
      
      // Les admins ont accès à tout
      if (user.role === 'admin') {
        setIsAdmin(true);
        setHasSubscription(true);
        setLoading(false);
        return;
      }

      // Vérifier le statut d'abonnement
      const subResponse = await api.subscription.getFullStatus();
      const status = subResponse.data;
      
      // Un utilisateur a un abonnement actif s'il est premium OU s'il a accès post-partum
      const hasActiveSubscription = status.is_premium || status.postpartum_purchased;
      
      setHasSubscription(hasActiveSubscription);
      
      // Si pas d'abonnement, rediriger vers la page de choix
      if (!hasActiveSubscription) {
        navigate('/subscription/checkout?onboarding=true', { replace: true });
      }
    } catch (error) {
      console.error('Erreur vérification abonnement:', error);
      // En cas d'erreur, laisser passer (fail open)
      setHasSubscription(true);
    } finally {
      setLoading(false);
    }
  };

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

  return children;
}

export function isPublicPage(pathname) {
  return PUBLIC_PAGES.some(page => pathname.startsWith(page));
}
