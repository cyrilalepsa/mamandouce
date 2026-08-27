import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Shared back navigation: onBack > backPath > history back.
 */
export function useBackNavigation({ onBack, backPath } = {}) {
  const navigate = useNavigate();

  return useCallback(() => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    if (backPath) {
      navigate(backPath);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  }, [backPath, navigate, onBack]);
}
