/**
 * useLongPress.js
 * Hook personnalisé pour gérer les appuis longs (2 secondes)
 * Extrait de CustomizableHome.jsx pour améliorer la maintenabilité
 */

import { useRef, useCallback, useEffect } from 'react';

// Durée de l'appui long pour suppression (2 secondes)
const LONG_PRESS_DURATION = 1000;

/**
 * Hook pour gérer l'appui long sur une page utilisateur
 * @param {Object} options - Options de configuration
 * @param {Object} options.currentPage - Page actuelle
 * @param {boolean} options.isDefaultPage - Si on est sur la page par défaut
 * @param {Function} options.onLongPress - Callback appelé après l'appui long
 * @returns {Object} - Handlers pour les événements d'appui long
 */
export function useLongPress({ currentPage, isDefaultPage, onLongPress }) {
  const longPressTimer = useRef(null);

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Appui long sur page utilisateur = afficher popup de suppression
  const handleLongPressStart = useCallback((e) => {
    if (!currentPage || currentPage.isDefault || isDefaultPage) return;
    
    // Vérifier si on a cliqué sur une zone vide (pas sur un élément interactif)
    const target = e.target;
    const isInteractiveElement = target.closest('button') || 
                                  target.closest('a') ||
                                  target.closest('input') ||
                                  target.closest('[data-draggable]') ||
                                  target.closest('[role="button"]');
    
    if (isInteractiveElement) return;
    
    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress();
      }
    }, LONG_PRESS_DURATION);
  }, [currentPage, isDefaultPage, onLongPress]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  return {
    longPressHandlers: {
      onMouseDown: handleLongPressStart,
      onMouseUp: handleLongPressEnd,
      onMouseLeave: handleLongPressEnd,
      onTouchStartCapture: handleLongPressStart,
      onTouchEndCapture: handleLongPressEnd
    }
  };
}

export default useLongPress;
