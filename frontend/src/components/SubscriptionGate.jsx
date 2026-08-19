import { useState, useEffect, createContext, useContext } from 'react';
import api from '../utils/api';
import { withTimeout } from '../utils/backendUrl';
import { isSuperAdmin, applySuperadminOverlay } from '../utils/superadmin';
import { isPremiumSubscriber, isPrivilegedAccount } from '../utils/postLogin';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionContext = createContext({
  isPremium: false,
  isAdmin: false,
  isSuperAdmin: false,
  subscriptionStatus: null,
  loading: true,
  refreshStatus: () => {}
});

export const useSubscription = () => useContext(SubscriptionContext);

const PUBLIC_PAGES = [
  '/auth',
  '/login',
  '/reset-password',
  '/pricing',
  '/privacy',
  '/birth-list/shared',
  '/recipes/shared'
];

const FULL_PRIVILEGE_STATUS = {
  is_premium: true,
  subscription_status: 'premium',
  postpartum_unlocked: true,
  postpartum_purchased: true,
  postpartum_eligible: true,
};

export function SubscriptionGate({ children }) {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const applyPrivileged = (rawUser) => {
    const user = applySuperadminOverlay(rawUser);
    const userIsAdmin = isPrivilegedAccount(user) || auth.isAdmin;
    setIsAdmin(userIsAdmin);
    if (userIsAdmin) {
      setIsPremium(true);
      setSubscriptionStatus(FULL_PRIVILEGE_STATUS);
      return true;
    }
    return false;
  };

  const checkSubscription = async () => {
    setLoading(true);
    try {
      if (applyPrivileged(auth.user)) {
        return;
      }

      let user = auth.user;
      try {
        const userResponse = await withTimeout(api.auth.getMe(), 8000, 'subscription.me');
        user = applySuperadminOverlay(userResponse.data);
        auth.ingestUser?.(user);
      } catch (error) {
        console.error('Erreur /auth/me:', error);
      }

      if (applyPrivileged(user)) {
        return;
      }

      const premiumFromMe = isPremiumSubscriber(user);
      if (premiumFromMe) {
        setIsPremium(true);
      }

      try {
        const subResponse = await withTimeout(api.subscription.getFullStatus(), 8000, 'subscription.status');
        const status = subResponse.data;
        setSubscriptionStatus(status);
        setIsPremium(
          Boolean(status?.is_premium) ||
            premiumFromMe ||
            isSuperAdmin(user?.email, user?.role)
        );
      } catch (error) {
        console.error('Erreur statut abonnement:', error);
        if (premiumFromMe) {
          setSubscriptionStatus({
            is_premium: true,
            subscription_status: user.subscription_status,
          });
        } else {
          setIsPremium(false);
          setSubscriptionStatus({ is_premium: false, subscription_status: 'free' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [auth.user?.email, auth.isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center" data-testid="subscription-boot-loader">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionContext.Provider value={{ 
      isPremium: isPremium || auth.isPremium,
      isAdmin: isAdmin || auth.isAdmin,
      isSuperAdmin: auth.isSuperAdmin,
      is_admin: isAdmin || auth.isAdmin,
      is_superadmin: auth.isSuperAdmin,
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
