import { AUTH_LOGIN_PATH } from './superadmin';

export const APP_SHELL_HIDDEN_PREFIXES = [
  AUTH_LOGIN_PATH,
  '/auth',
  '/pricing',
  '/subscription',
  '/reset-password',
  '/invitation',
  '/privacy',
];

export function shouldHideAppShell(pathname) {
  if (!pathname) return true;
  if (pathname === '/scanner' || pathname.startsWith('/scanner/')) return true;
  return APP_SHELL_HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
