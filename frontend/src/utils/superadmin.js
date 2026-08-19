/** Comptes superadmin : dashboard + toutes les fonctions premium. */
export const SUPERADMIN_EMAILS = [
  "cyrilalepsa@gmail.com",
  "superadmin@neriacorp.com",
];

/** Alias demandé (vérification auth / AdminPage). */
export const ADMIN_EMAILS = SUPERADMIN_EMAILS;

/** Alias historique VIP — mêmes e-mails privilège (isVip / is_vip / VIP_EMAILS). */
export const VIP_EMAILS = SUPERADMIN_EMAILS;

export const AUTH_LOGIN_PATH = "/login";

export function normalizeSuperadminEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isSuperAdminEmail(email) {
  return SUPERADMIN_EMAILS.includes(normalizeSuperadminEmail(email));
}

export function isVipEmail(email) {
  return isSuperAdminEmail(email);
}

/** Accès dashboard / premium : superadmin hardcodé ou rôle admin en BDD. */
export function isSuperAdmin(email, role) {
  if (isSuperAdminEmail(email)) return true;
  return String(role || "").toLowerCase() === "admin";
}

export function subscriptionLooksPremium(user) {
  const status = String(user?.subscription_status || "").trim().toLowerCase();
  return status === "premium" || status === "trial";
}

/** Halo jaune scintillant : compte privilège ou abonnement premium. */
export function shouldShowPremiumHalo(user, isPremiumProp = false) {
  if (isPremiumProp) return true;
  if (!user) return false;
  if (isSuperAdminEmail(user.email)) return true;
  if (user.is_premium || user.is_admin || user.is_superadmin || user.is_vip || user.isVip) return true;
  return subscriptionLooksPremium(user);
}

/**
 * Force role=admin + subscription_status=premium + flags context
 * dès que l'email est privilège, même si l'API renvoie encore "free"/"user".
 */
export function applySuperadminOverlay(user) {
  if (!user || typeof user !== "object") return user;
  const next = { ...user };
  if (isSuperAdminEmail(next.email)) {
    next.role = "admin";
    next.subscription_status = "premium";
    next.is_superadmin = true;
    next.is_admin = true;
    next.is_premium = true;
    next.is_vip = true;
    next.isVip = true;
    next.isAdmin = true;
    next.isPremium = true;
    next.postpartum_purchased = true;
    next.postpartum_unlocked = true;
    return next;
  }
  const admin = String(next.role || "").toLowerCase() === "admin";
  next.is_superadmin = false;
  next.is_admin = Boolean(next.is_admin) || admin;
  next.is_premium = Boolean(next.is_premium) || admin || subscriptionLooksPremium(next);
  if (next.is_admin && !next.subscription_status) {
    next.subscription_status = "premium";
    next.is_premium = true;
  }
  return next;
}
