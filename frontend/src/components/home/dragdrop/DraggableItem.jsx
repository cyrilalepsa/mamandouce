import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, X, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { useTheme } from '../../../contexts/ThemeContext';

import { ITEM_ICONS, ITEM_NAMES, ITEM_TRANSLATION_KEYS, ITEM_STYLES, ITEM_ROUTES, GROUP_COLORS } from './constants';

// Composant pour un item draggable
export function DraggableItem({ 
  item, 
  index = 0,
  totalItems = 1,
  onDragStart, 
  onDragEnd, 
  onDrop, 
  isDragging,
  isDropTarget,
  onRemove,
  onLongPress,
  showDeleteButton = false,
  // Props pour les pages utilisateur
  isUserPage = false,
  canDrag = false,
  onHidePopup,
  // Callback direct pour créer un groupe (drag sur autre élément)
  onDropOnItem,
  // Callback pour ajouter à un groupe existant
  onAddToGroup
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const longPressTimer = useRef(null);
  const isLongPressRef = useRef(false);
  const isDraggingRef = useRef(false);
  const touchStartTime = useRef(0);
  const [showDelete, setShowDelete] = useState(showDeleteButton);
  
  // Couleur du texte conditionnelle pour le mode sombre
  const textColorClass = isDarkMode ? 'text-black' : 'text-slate-700';
  
  // États pour le déplacement dans la grille (pages utilisateur uniquement)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  
  // Durée de l'appui long (1 seconde)
  const LONG_PRESS_DURATION = 1000;
  // Seuil de mouvement pour considérer comme déplacement (en pixels)
  const MOVE_THRESHOLD = 10;
  
  const icon = ITEM_ICONS[item.id] || '📌';
  // Utiliser la traduction si disponible, sinon le nom statique
  const translationKey = ITEM_TRANSLATION_KEYS[item.id];
  const name = translationKey ? t(translationKey, ITEM_NAMES[item.id] || item.id) : (ITEM_NAMES[item.id] || item.id);
  const route = ITEM_ROUTES[item.id];
  const itemStyle = ITEM_STYLES[item.id] || ITEM_STYLES['default'];
  
  // Debug en développement - à retirer en production
  if (!ITEM_STYLES[item.id]) {
    console.warn(`DraggableItem: Style manquant pour item.id="${item.id}". Utilisation du style par défaut.`);
  }

  // Synchroniser avec la prop externe
  useEffect(() => {
    setShowDelete(showDeleteButton);
  }, [showDeleteButton]);

  // Nettoyer les timers au démontage
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const handleTouchStart = (e) => {
    // Empêcher le comportement par défaut pour éviter les conflits
    e.stopPropagation();
    
    isLongPressRef.current = false;
    isDraggingRef.current = false;
    hasMoved.current = false;
    touchStartTime.current = Date.now();
    
    // Stocker la position de départ du toucher
    const touch = e.touches[0];
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    setDragOffset({ x: 0, y: 0 });
    
    // Timer pour l'appui long (1 seconde)
    longPressTimer.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsLongPressActive(true);
      
      // Vibration pour indiquer que l'appui long est activé
      if (navigator.vibrate) navigator.vibrate(50);
      
      // Si pas de mouvement après 1s, afficher la popup (duplication ou suppression selon la page)
      if (!hasMoved.current) {
        onLongPress?.(item);
      }
    }, LONG_PRESS_DURATION);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartPos.current.x;
    const deltaY = touch.clientY - dragStartPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Si on bouge au-delà du seuil (réduit à 5px pour plus de réactivité)
    if (distance > 5) {
      hasMoved.current = true;
      
      // Si l'appui long est actif ET sur une page utilisateur (déplacement autorisé)
      if (isLongPressRef.current && isUserPage && canDrag) {
        // STOPPER la propagation pour empêcher le swipe parent
        e.stopPropagation();
        e.preventDefault();
        
        // Masquer la popup car on déplace
        onHidePopup?.();
        
        isDraggingRef.current = true;
        setIsDraggingState(true);
        
        // Mettre à jour l'offset de déplacement (visuel pendant le drag)
        setDragOffset({ x: deltaX, y: deltaY });
      } else if (!isLongPressRef.current) {
        // Mouvement avant 1s = annuler le long press (c'est un scroll/swipe)
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    // Nettoyer le timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Si on était en train de déplacer sur une page utilisateur
    if (isDraggingRef.current && isUserPage && hasMoved.current) {
      e.stopPropagation();
      e.preventDefault();
      
      // Vérifier si on relâche sur un autre élément ou groupe
      const touch = e.changedTouches[0];
      const elementsAtPoint = document.elementsFromPoint(touch.clientX, touch.clientY);
      
      for (const el of elementsAtPoint) {
        // Vérifier si c'est un groupe
        const targetGroup = el.closest('[data-draggable="group"]');
        if (targetGroup) {
          const groupId = targetGroup.getAttribute('data-group-id');
          if (groupId && onAddToGroup) {
            console.log('Adding to group:', item.id, '→', groupId);
            onAddToGroup(item.id, groupId);
            break;
          }
        }
        
        // Vérifier si c'est un autre item (pour créer un nouveau groupe)
        const targetDraggable = el.closest('[data-draggable="true"]');
        if (targetDraggable && targetDraggable !== e.currentTarget) {
          const targetItemId = targetDraggable.getAttribute('data-item-id');
          if (targetItemId && targetItemId !== item.id && onDropOnItem) {
            console.log('Creating group:', item.id, '+', targetItemId);
            onDropOnItem(item.id, targetItemId);
            break;
          }
        }
      }
    }
    
    // Réinitialiser les états
    isDraggingRef.current = false;
    setIsDraggingState(false);
    setIsLongPressActive(false);
    setDragOffset({ x: 0, y: 0 });
    
    // Si on a glissé après un appui long, ne pas traiter comme un clic
    if (hasMoved.current && isLongPressRef.current) {
      e.preventDefault();
    }
  };

  const handleClick = (e) => {
    // Si c'était un appui long avec mouvement, ne pas naviguer
    if (isLongPressRef.current && hasMoved.current) {
      return;
    }
    
    // Si on montre le bouton supprimer, le cacher
    if (showDelete) {
      setShowDelete(false);
      return;
    }
    
    // Naviguer vers la route de l'item (uniquement sur tap court sans appui long)
    if (route && !isLongPressRef.current) {
      navigate(route);
    }
  };

  return (
    <div
      data-draggable="true"
      data-item-id={item.id}
      data-testid={`draggable-item-${item.id}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      className={`
        relative rounded-3xl p-4
        ${isDraggingState ? 'cursor-grabbing' : 'cursor-pointer active:scale-[0.97]'}
        ${isLongPressActive && !isDraggingState ? 'scale-105' : ''}
        ${!isDraggingState ? 'transition-all duration-200' : ''} select-none
        ${isDropTarget ? 'ring-2 ring-pink-400 scale-105' : ''}
        ${showDelete ? 'animate-wiggle' : ''}
      `}
      style={{ 
        WebkitUserSelect: 'none', 
        WebkitTouchCallout: 'none',
        // Appliquer le transform pendant le drag (suivre le doigt)
        transform: isDraggingState 
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.05)` 
          : undefined,
        transformOrigin: 'center center',
        // ===== STYLES "BOMBÉ" GARANTIS - toujours coloré =====
        background: itemStyle?.gradient || 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
        boxShadow: isDraggingState 
          ? '0 20px 40px rgba(0,0,0,0.25), ' + (itemStyle?.shadow || '0 8px 25px rgba(252, 211, 77, 0.35)')
          : (itemStyle?.shadow || '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)'),
        border: `1px solid ${itemStyle?.border || 'rgba(251, 191, 36, 0.3)'}`,
        // Taille de la carte
        width: '100%',
        minHeight: '90px',
        // Z-index
        zIndex: isDraggingState ? 100 : 1,
        // Opacité
        opacity: 1,
        // Touch action pour éviter les conflits
        touchAction: isLongPressActive ? 'none' : 'manipulation',
        // Overflow visible pour les badges
        overflow: 'visible',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Voile blanc supprimé */}
      
      {/* Bouton supprimer - visible seulement après appui long */}
      {onRemove && showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-red-600 transition-colors animate-pulse"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      )}
      
      {/* Contenu de la carte */}
      <div className="relative flex flex-col items-center justify-center gap-1 z-10">
        <span className="text-3xl drop-shadow-sm">{icon}</span>
        <span className={`text-xs font-semibold ${textColorClass} text-center leading-tight drop-shadow-sm`}>{name}</span>
      </div>
    </div>
  );
}

// Composant pour un groupe (dossier)
