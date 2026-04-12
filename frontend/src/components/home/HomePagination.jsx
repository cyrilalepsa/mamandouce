/**
 * HomePagination.jsx
 * Composants de pagination pour la page d'accueil (bulles de navigation)
 * Extraits de CustomizableHome.jsx pour améliorer la maintenabilité
 */

import { useState, useRef } from 'react';
import { Home, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

// Bulles de pagination centrées (en bas : + | Home | bulles rondes colorées pastel)
export function PageDots({ pages, currentIndex, onPageChange, onSetAsHome, onCreatePage, defaultPageId }) {
  const { t } = useTranslation();
  const currentPage = pages[currentIndex];
  const isCurrentPageHome = currentPage?.id === defaultPageId;
  
  // Séparer page socle et pages utilisateur
  const soclePage = pages.find(p => p.isDefault);
  const userPages = pages.filter(p => !p.isDefault);
  const socleIndex = pages.findIndex(p => p.isDefault);
  
  // État pour le long press sur Home
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const LONG_PRESS_DURATION = 1000;
  
  // S'il n'y a pas de pages, ne pas afficher
  if (!pages || pages.length === 0) {
    return null;
  }

  // Trouver l'index de la page par défaut
  const defaultPageIndex = pages.findIndex(p => p.id === defaultPageId);

  // Handlers pour le bouton Home
  const handleHomeTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      // Long press = définir comme page par défaut
      onSetAsHome?.();
    }, LONG_PRESS_DURATION);
  };

  const handleHomeTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Si ce n'était pas un long press, c'est un tap = naviguer vers la page par défaut
    if (!isLongPress.current) {
      if (defaultPageIndex !== -1 && defaultPageIndex !== currentIndex) {
        onPageChange(defaultPageIndex);
      }
    }
  };

  const handleHomeTouchMove = () => {
    // Annuler le long press si mouvement
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Utiliser un Portal pour que le composant soit en position fixe par rapport au viewport
  // Pagination centrée juste au-dessus de la navigation en bas
  return createPortal(
    <div 
      id="page-dots"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2.5 py-2 px-4"
      style={{
        /* Fond BLANC OPAQUE, pas de blur */
        background: '#FFFFFF',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        /* NEUMORPHISM CHAMALLOW 3D EXACT */
        boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
        borderRadius: '20px',
      }}
      data-testid="page-dots"
      data-source="HomePagination"
    >
      {/* Bouton + pour créer une page */}
      <button
        onClick={onCreatePage}
        className="w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:scale-110 active:scale-95 transition-all"
        title={t('home.createPage', 'Créer une page')}
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={3} />
      </button>

      {/* Icône Home - Tap = aller à la page par défaut, Long press = définir comme page par défaut */}
      <button
        onTouchStart={handleHomeTouchStart}
        onTouchEnd={handleHomeTouchEnd}
        onTouchMove={handleHomeTouchMove}
        onMouseDown={handleHomeTouchStart}
        onMouseUp={handleHomeTouchEnd}
        onMouseLeave={() => {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }}
        className={`transition-all select-none ${
          isCurrentPageHome
            ? 'text-pink-500'
            : currentIndex === defaultPageIndex
            ? 'text-slate-600'
            : 'text-slate-400 hover:text-slate-500'
        }`}
        title={t('home.homeButtonHint', 'Tap: aller à l\'accueil • Appui long: définir cette page comme accueil')}
        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      >
        <Home className="w-4 h-4" />
      </button>
      
      {/* Bulle ronde pour la page Socle */}
      {soclePage && (
        <button
          onClick={() => onPageChange(socleIndex)}
          className={`relative transition-all duration-300 rounded-full ${
            currentIndex === socleIndex
              ? 'w-3 h-3 shadow-sm'
              : 'w-2.5 h-2.5 opacity-70 hover:opacity-100'
          }`}
          style={{ backgroundColor: '#fecdd3' }}
          title={t('home.soclePage', 'Page principale')}
        >
          {soclePage.id === defaultPageId && currentIndex !== socleIndex && (
            <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-rose-400 rounded-full"></span>
          )}
        </button>
      )}
      
      {/* Bulles rondes colorées pour les pages utilisateur */}
      {userPages.map((page) => {
        const pageIndex = pages.findIndex(p => p.id === page.id);
        const pageColor = page.color || '#c7d2fe';
        return (
          <button
            key={page.id}
            onClick={() => onPageChange(pageIndex)}
            className={`relative transition-all duration-300 rounded-full ${
              currentIndex === pageIndex
                ? 'w-3 h-3 shadow-sm'
                : 'w-2.5 h-2.5 opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: pageColor }}
            title={page.name || t('home.unnamedPage', 'Page sans nom')}
          >
            {page.id === defaultPageId && currentIndex !== pageIndex && (
              <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-rose-400 rounded-full"></span>
            )}
          </button>
        );
      })}
    </div>,
    document.body
  );
}
