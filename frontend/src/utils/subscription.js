import { useState, useEffect, createContext, useContext } from 'react';
import api from './api';

// Contexte pour gérer le statut d'abonnement globalement
const SubscriptionContext = createContext(null);

// Limites pour utilisateurs gratuits
export const FREE_USER_LIMITS = {
  scansPerWeek: 5,
  weeklyTipsLimit: 4, // Semaines de conseils accessibles
  canAccessEmbryo: false,
  canAccessMaternityBag: false,
  canAccessAdminProcedures: false,
  canAccessChatbot: false,
  canAccessNotifications: false,
  canAccessHistory: false,
};

// Fonctionnalités premium
export const PREMIUM_FEATURES = {
  scansPerWeek: Infinity,
  weeklyTipsLimit: 41,
  canAccessEmbryo: true,
  canAccessMaternityBag: true,
  canAccessAdminProcedures: true,
  canAccessChatbot: true,
  canAccessNotifications: true,
  canAccessHistory: true,
};

export function SubscriptionProvider({ children }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [isPremium, setIsPremium] = useState(false);
  const [scansThisWeek, setScansThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await api.auth.getFullSubscriptionStatus();
      const status = response.data.subscription_status || 'free';
      setSubscriptionStatus(status);
      setIsPremium(status === 'premium' || response.data.is_premium);
      setScansThisWeek(response.data.scans_this_week || 0);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLimit = (feature) => {
    if (isPremium) {
      return PREMIUM_FEATURES[feature];
    }
    return FREE_USER_LIMITS[feature];
  };

  const canAccess = (feature) => {
    if (isPremium) return true;
    return FREE_USER_LIMITS[feature] === true;
  };

  const canScan = () => {
    if (isPremium) return true;
    return scansThisWeek < FREE_USER_LIMITS.scansPerWeek;
  };

  const getRemainingScans = () => {
    if (isPremium) return Infinity;
    return Math.max(0, FREE_USER_LIMITS.scansPerWeek - scansThisWeek);
  };

  const incrementScanCount = () => {
    setScansThisWeek(prev => prev + 1);
  };

  const refresh = () => {
    loadSubscriptionStatus();
  };

  return (
    <SubscriptionContext.Provider value={{
      subscriptionStatus,
      isPremium,
      scansThisWeek,
      loading,
      getLimit,
      canAccess,
      canScan,
      getRemainingScans,
      incrementScanCount,
      refresh
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Hook simple pour vérifier si l'utilisateur est premium
export function useIsPremium() {
  const { isPremium, loading } = useSubscription();
  return { isPremium, loading };
}

// Composant pour bloquer l'accès aux fonctionnalités premium
export function PremiumGate({ feature, children, fallback }) {
  const { canAccess, isPremium } = useSubscription();
  
  if (isPremium || canAccess(feature)) {
    return children;
  }
  
  return fallback || null;
}

export default SubscriptionContext;
