import { isSuperAdmin } from './superadmin.js';

/** Accueil principal (aliases /app, /dashboard, /home). */
export const APP_HOME_PATH = '/';

export function subscriptionStatusOf(user) {
  return String(user?.subscription_status || 'free').trim().toLowerCase();
}

export function isPrivilegedAccount(user) {
  return isSuperAdmin(user?.email, user?.role);
}

export function isPremiumSubscriber(user) {
  const status = subscriptionStatusOf(user);
  return status === 'premium' || status === 'trial';
}

/** Superadmin / admin / premium / trial : pas de paywall. */
export function bypassesPaywall(user) {
  return isPrivilegedAccount(user) || isPremiumSubscriber(user);
}

/**
 * Après login ou /auth/me : toujours l'accueil.
 * La page tarifs n'est jamais une destination automatique.
 */
export function destinationAfterAuth(_user) {
  return APP_HOME_PATH;
}

export function shouldAutoRedirectToPricing(_user) {
  return false;
}

/**
 * Quitter tarifs / checkout onboarding :
 * - comptes privilèges : toujours
 * - onboarding post-login : tout le monde (y compris free)
 */
export function shouldLeavePricingPage(user, { isOnboarding = false } = {}) {
  if (isOnboarding) return true;
  return isPrivilegedAccount(user);
}
