/**
 * useSwipeNavigation.js
 * Hook personnalisé pour gérer la navigation par swipe horizontal
 * Extrait de CustomizableHome.jsx pour améliorer la maintenabilité
 */

import { useState, useRef, useCallback } from 'react';

/**
 * Hook pour gérer le swipe fluide qui suit le doigt
 * @param {Object} options - Options de configuration
 * @param {number} options.currentPageIndex - Index de la page actuelle
 * @param {number} options.totalPages - Nombre total de pages
 * @param {boolean} options.isDefaultPage - Si on est sur la page par défaut
 * @param {Function} options.onPageChange - Callback pour changer de page
 * @returns {Object} - États et handlers pour le swipe
 */
export function useSwipeNavigation({ currentPageIndex, totalPages, isDefaultPage, onPageChange }) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const threshold = 50; // Distance minimum pour valider un swipe

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  }, []);

  const onTouchMove = useCallback((e) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Calculer l'offset en temps réel pour suivre le doigt
    if (touchStart !== null) {
      const diff = currentTouch - touchStart;
      
      // Appliquer une résistance élastique aux bords
      let limitedDiff = diff;
      if (isDefaultPage && diff < 0) {
        // Sur page principale, glisser vers la gauche (aller à droite)
        limitedDiff = Math.max(diff, -window.innerWidth * 0.4);
      } else if (!isDefaultPage && diff > 0) {
        // Sur page utilisateur, glisser vers la droite (aller à gauche)
        limitedDiff = Math.min(diff, window.innerWidth * 0.4);
      } else {
        // Résistance élastique si on swipe dans le mauvais sens
        limitedDiff = diff * 0.2;
      }
      
      setSwipeOffset(limitedDiff);
    }
  }, [touchStart, isDefaultPage]);

  const onTouchEnd = useCallback(() => {
    setIsSwiping(false);
    setSwipeOffset(0);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    
    if (distance > threshold && currentPageIndex < totalPages - 1) {
      onPageChange(currentPageIndex + 1);
    } else if (distance < -threshold && currentPageIndex > 0) {
      onPageChange(currentPageIndex - 1);
    }
  }, [touchStart, touchEnd, currentPageIndex, totalPages, onPageChange, threshold]);

  return {
    // États
    swipeOffset,
    isSwiping,
    // Handlers pour les événements touch
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd
    }
  };
}

export default useSwipeNavigation;
