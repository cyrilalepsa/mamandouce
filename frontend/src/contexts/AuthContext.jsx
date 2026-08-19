import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { hideBootLoader, withTimeout } from '../utils/backendUrl';
import { safeGet, safeRemove } from '../utils/safeStorage';
import {
  AUTH_LOGIN_PATH,
  applySuperadminOverlay,
  isSuperAdmin,
  isSuperAdminEmail,
} from '../utils/superadmin';
import { bypassesPaywall } from '../utils/postLogin';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  isPremium: false,
  is_admin: false,
  is_superadmin: false,
  is_premium: false,
  role: 'user',
  setAuthenticated: () => {},
  ingestUser: () => null,
  refreshMe: async () => null,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function clearAuthStorage() {
  safeRemove('token');
  try {
    localStorage.removeItem('token');
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem('token');
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const ingestUser = useCallback((raw) => {
    const next = applySuperadminOverlay(raw);
    setUser(next || null);
    return next;
  }, []);

  const setAuthenticated = useCallback((value) => {
    setIsAuthenticated(Boolean(value));
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await withTimeout(api.auth.me(), 8000, 'auth.me');
    return ingestUser(me.data);
  }, [ingestUser]);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setIsAuthenticated(false);
    window.location.assign(AUTH_LOGIN_PATH);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const token = safeGet('token');
        if (!token) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setUser(null);
          }
          return;
        }
        const me = await withTimeout(api.auth.me(), 8000, 'auth.me');
        if (cancelled) return;
        ingestUser(me.data);
        setIsAuthenticated(true);
      } catch {
        clearAuthStorage();
        if (!cancelled) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
        hideBootLoader();
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [ingestUser]);

  const value = useMemo(() => {
    const admin = Boolean(
      user?.is_admin || isSuperAdmin(user?.email, user?.role)
    );
    const superadmin = Boolean(
      user?.is_superadmin || isSuperAdminEmail(user?.email)
    );
    const premium = Boolean(
      admin
      || superadmin
      || user?.is_premium
      || bypassesPaywall(user)
    );
    const role = admin || superadmin ? 'admin' : (user?.role || 'user');
    return {
      user,
      isAuthenticated,
      loading,
      isAdmin: admin,
      isSuperAdmin: superadmin,
      isPremium: premium,
      is_admin: admin,
      is_superadmin: superadmin,
      is_premium: premium,
      role,
      setAuthenticated,
      ingestUser,
      refreshMe,
      logout,
    };
  }, [user, isAuthenticated, loading, setAuthenticated, ingestUser, refreshMe, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
