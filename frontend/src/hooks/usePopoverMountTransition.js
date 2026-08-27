import { useEffect, useState } from 'react';

/**
 * Keeps popover mounted briefly on close so exit transitions can run.
 */
export function usePopoverMountTransition(isOpen, { exitMs = 150 } = {}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      let outerFrame = 0;
      const innerFrame = requestAnimationFrame(() => {
        outerFrame = requestAnimationFrame(() => setIsShown(true));
      });
      return () => {
        cancelAnimationFrame(innerFrame);
        if (outerFrame) cancelAnimationFrame(outerFrame);
      };
    }

    setIsShown(false);
    const timer = window.setTimeout(() => setShouldRender(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [isOpen, exitMs]);

  return { shouldRender, isShown };
}
