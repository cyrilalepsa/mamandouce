import { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } from 'react';
import api from '../utils/api';
import { withTimeout } from '../utils/backendUrl';
import { isSuperAdmin, applySuperadminOverlay } from '../utils/superadmin';
import { isPremiumSubscriber, isPrivilegedAccount } from '../utils/postLogin';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionContext = createContext({
  isPremium: false,
  isAdmin: false,
  isSuperAdmin: false,
  isVip: false,
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
  is_vip: true,
  is_admin: true,
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
  const initialCheckDoneRef = useRef(false);

  const applyPrivileged = useCallback((rawUser) => {
    const user = applySuperadminOverlay(rawUser);
    const userIsAdmin = isPrivilegedAccount(user) || auth.isAdmin || auth.isVip;
    setIsAdmin(userIsAdmin);
    if (userIsAdmin) {
      setIsPremium(true);
      setSubscriptionStatus(FULL_PRIVILEGE_STATUS);
      return true;
    }
    return false;
  }, [auth.isAdmin, auth.isVip]);

  const checkSubscription = useCallback(async (rawUser, { showLoader = false } = {}) => {
    if (showLoader) setLoading(true);
    try {
      const user = applySuperadminOverlay(rawUser);
      if (applyPrivileged(user)) {
        return;
      }

      const premiumFromMe = isPremiumSubscriber(user);
      setIsPremium(premiumFromMe);

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
      if (showLoader) setLoading(false);
    }
  }, [applyPrivileged]);

  useEffect(() => {
    const showLoader = !initialCheckDoneRef.current;
    initialCheckDoneRef.current = true;
    checkSubscription(auth.user, { showLoader });
  }, [auth.user?.email, auth.isAdmin, auth.isVip, checkSubscription]);

  const refreshStatus = useCallback(
    () => checkSubscription(auth.user, { showLoader: false }),
    [auth.user, checkSubscription],
  );

  const contextValue = useMemo(() => ({
    isPremium: isPremium || auth.isPremium || auth.isVip,
    isAdmin: isAdmin || auth.isAdmin || auth.isVip,
    isSuperAdmin: auth.isSuperAdmin,
    isVip: Boolean(auth.isVip || auth.is_vip),
    is_admin: isAdmin || auth.isAdmin || auth.isVip,
    is_superadmin: auth.isSuperAdmin,
    is_vip: Boolean(auth.isVip || auth.is_vip),
    subscriptionStatus,
    loading,
    refreshStatus,
  }), [
    isPremium,
    isAdmin,
    auth.isPremium,
    auth.isAdmin,
    auth.isSuperAdmin,
    auth.isVip,
    auth.is_vip,
    subscriptionStatus,
    loading,
    refreshStatus,
  ]);

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
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function isPublicPage(pathname) {
  return PUBLIC_PAGES.some(page => pathname.startsWith(page));
}
