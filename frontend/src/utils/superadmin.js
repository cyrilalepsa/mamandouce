/** Comptes superadmin : dashboard + toutes les fonctions premium. */
export const SUPERADMIN_EMAILS = [
  "cyrilalepsa@gmail.com",
  "superadmin@neriacorp.com",
];

export const AUTH_LOGIN_PATH = "/login";

export function normalizeSuperadminEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isSuperAdminEmail(email) {
  return SUPERADMIN_EMAILS.includes(normalizeSuperadminEmail(email));
}

/** Accès dashboard / premium : superadmin hardcodé ou rôle admin en BDD. */
export function isSuperAdmin(email, role) {
  if (isSuperAdminEmail(email)) return true;
  return String(role || "").toLowerCase() === "admin";
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
    next.postpartum_purchased = true;
    next.postpartum_unlocked = true;
    return next;
  }
  const admin = String(next.role || "").toLowerCase() === "admin";
  next.is_superadmin = false;
  next.is_admin = Boolean(next.is_admin) || admin;
  if (next.is_admin && !next.subscription_status) {
    next.subscription_status = "premium";
  }
  return next;
}
