/** Comptes superadmin : dashboard + toutes les fonctions premium. */
export const SUPERADMIN_EMAILS = [
  "cyrilalepsa@gmail.com",
  "superadmin@neriacorp.com",
];

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
