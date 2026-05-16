/**
 * AutoRefreshContext — émet un "tick" global toutes les 60 secondes.
 *
 * Les composants qui veulent rafraîchir leurs données s'abonnent via `useAutoRefresh()`
 * et déclenchent leur fetch dans un useEffect dépendant du `tick`.
 *
 * Stratégie no-scroll :
 *  - Aucun élément DOM n'est ajouté à la page (juste un tick numérique en context)
 *  - Les composants doivent réutiliser leurs containers existants (pas de "+X new items"
 *    qui pousserait la hauteur)
 *  - Pause automatique quand la page est cachée (Page Visibility API) pour ne pas
 *    consommer batteries / quotas API
 */
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const AutoRefreshContext = createContext({ tick: 0, lastRefresh: null });

const REFRESH_INTERVAL_MS = 60 * 1000; // 60 secondes

export function AutoRefreshProvider({ children, intervalMs = REFRESH_INTERVAL_MS }) {
  const [tick, setTick] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
        setLastRefresh(new Date());
      }, intervalMs);
    };
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Démarrage initial
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      start();
    }

    // Pause/reprise sur changement de visibilité
    const handleVisibility = () => {
      if (typeof document !== 'undefined') {
        if (document.visibilityState === 'visible') start();
        else stop();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      stop();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [intervalMs]);

  return (
    <AutoRefreshContext.Provider value={{ tick, lastRefresh }}>
      {children}
    </AutoRefreshContext.Provider>
  );
}

export function useAutoRefresh() {
  return useContext(AutoRefreshContext);
}
