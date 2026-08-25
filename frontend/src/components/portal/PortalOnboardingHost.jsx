import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { NeriaCorpPortalModal } from './NeriaCorpPortalModal';

/**
 * Vérifie l'état d'onboarding portail et affiche la modale si nécessaire.
 */
export function PortalOnboardingHost() {
  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await api.neriacorp.onboardingStatus();
        if (cancelled) return;
        setStatus(response.data);
        if (response.data?.show_modal) {
          setOpen(true);
        }
      } catch {
        /* silencieux — pas bloquant */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!status?.show_modal && !open) return null;

  return (
    <NeriaCorpPortalModal
      open={open}
      status={status}
      onClose={() => setOpen(false)}
      onLinked={() => setStatus((prev) => ({ ...prev, show_modal: false, portal_linked: true }))}
    />
  );
}

export default PortalOnboardingHost;
