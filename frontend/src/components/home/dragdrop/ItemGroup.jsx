import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, X, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { useTheme } from '../../../contexts/ThemeContext';

import { ITEM_ICONS, ITEM_NAMES, ITEM_TRANSLATION_KEYS, ITEM_STYLES, ITEM_ROUTES, GROUP_COLORS } from './constants';

// Composant pour un item draggable
export function ItemGroup({ 
  group, 
  onOpen, 
  onRename, 
  onDelete,
  onRemoveItem,
  onDrop,
  isDropTarget,
  hasSelectedItem = false,
  onAddSelectedItem
}) {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [showDelete, setShowDelete] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  
  // Couleur du texte conditionnelle pour le mode sombre
  const textColorClass = isDarkMode ? 'text-black' : 'text-slate-700';
  
  // Durée de l'appui long pour suppression (3 secondes)
  const LONG_PRESS_DURATION = 1000;

  const handleTouchStart = (e) => {
    e.stopPropagation(); // Empêcher le déclenchement de la suppression de page
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(100);
      setShowDelete(true);
    }, LONG_PRESS_DURATION); // 1 seconde
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();
    clearTimeout(longPressTimer.current);
  };

  const handleClick = () => {
    if (isLongPress.current) {
      return;
    }
    
    // Si on a un item sélectionné, l'ajouter au groupe
    if (hasSelectedItem) {
      onAddSelectedItem?.(group);
      return;
    }
    
    // Si on montre le bouton supprimer, le cacher
    if (showDelete) {
      setShowDelete(false);
      return;
    }
    
    // Ouvrir le groupe
    onOpen?.(group);
  };

  const handleRename = () => {
    if (editName.trim() && editName !== group.name) {
      onRename?.(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  // Afficher les 4 premiers items en miniature
  const previewItems = group.items.slice(0, 4);
  
  // Couleur du groupe (avec fallback sur jaune)
  const groupColor = group.color || '#fde68a';
  
  // Générer les couleurs dérivées pour l'effet bombé
  const getGradientColors = (baseColor) => {
    // Créer une version plus claire et plus foncée pour le gradient
    return {
      light: `${baseColor}99`, // 60% opacity
      base: baseColor,
      dark: `${baseColor}dd`   // 87% opacity
    };
  };
  
  const colors = getGradientColors(groupColor);

  return (
    <div
      data-draggable="group"
      data-group-id={group.id}
      data-testid={`item-group-${group.id}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      className={`
        relative rounded-3xl p-3 cursor-pointer
        transition-all duration-200 select-none overflow-visible
        ${isDropTarget ? 'ring-2 ring-purple-400 scale-105' : ''}
        ${showDelete ? 'animate-wiggle' : ''}
      `}
      style={{ 
        WebkitUserSelect: 'none', 
        WebkitTouchCallout: 'none',
        // Style bombé avec la couleur du groupe
        background: `linear-gradient(145deg, ${colors.light} 0%, ${colors.base} 50%, ${colors.dark} 100%)`,
        boxShadow: `0 8px 25px ${groupColor}55, inset 0 -4px 12px rgba(0,0,0,0.08)`,
        border: `1px solid ${groupColor}44`,
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Voile blanc supprimé */}
      
      {/* Bouton supprimer groupe - visible uniquement après appui long */}
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(group.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-red-600 transition-colors animate-pulse"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      )}

      {/* Badge nombre d'items */}
      <div 
        className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center shadow text-[10px] font-bold text-white z-10"
        style={{ backgroundColor: '#8b5cf6' }}
      >
        {group.items.length}
      </div>

      {/* Grille de miniatures (style iOS) */}
      <div className="relative z-10 grid grid-cols-2 gap-1 mb-2">
        {previewItems.map((item, index) => (
          <div 
            key={item.id} 
            className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center text-sm shadow-inner backdrop-blur-sm"
          >
            {ITEM_ICONS[item.id] || '📌'}
          </div>
        ))}
        {previewItems.length < 4 && Array(4 - previewItems.length).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8 bg-white/40 rounded-lg"></div>
        ))}
      </div>

      {/* Nom du groupe (affiché uniquement si non vide) */}
      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          className="relative z-10 text-xs h-6 text-center bg-white/80"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : group.name ? (
        <p 
          className={`relative z-10 text-xs font-semibold ${textColorClass} text-center truncate drop-shadow-sm`}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {group.name}
        </p>
      ) : null}
    </div>
  );
}

// Popup pour voir le contenu d'un groupe ouvert - Style iOS Folder
