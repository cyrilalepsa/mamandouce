import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, X, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { useTheme } from '../../../contexts/ThemeContext';

import { ITEM_ICONS, ITEM_NAMES, ITEM_TRANSLATION_KEYS, ITEM_STYLES, ITEM_ROUTES, GROUP_COLORS } from './constants';

// Composant pour un item draggable
export function GroupContentPopup({ group, onClose, onRemoveItem, onChangeColor, onRename, t }) {
  const navigate = useNavigate();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editedName, setEditedName] = useState(group?.name || '');
  const longPressTimer = useRef(null);
  const nameInputRef = useRef(null);
  
  // Durée de l'appui long pour suppression (1 seconde)
  const LONG_PRESS_DURATION = 1000;

  // Mettre à jour editedName quand le groupe change
  useState(() => {
    setEditedName(group?.name || '');
  }, [group?.name]);

  if (!group) return null;
  
  // Couleur actuelle du groupe
  const currentColor = group.color || '#fde68a';

  const handleItemClick = (item) => {
    // Si on est en mode suppression, ne pas naviguer
    if (itemToDelete) {
      setItemToDelete(null);
      return;
    }
    
    // Naviguer vers le contenu de l'item
    const route = ITEM_ROUTES[item.id];
    if (route) {
      onClose();
      navigate(route);
    }
  };

  const handleLongPressStart = (item) => {
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(100);
      setItemToDelete(item.id);
    }, LONG_PRESS_DURATION);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleRemoveItem = (itemId) => {
    onRemoveItem?.(itemId);
    setItemToDelete(null);
  };
  
  const handleColorChange = (color) => {
    if (onChangeColor) {
      onChangeColor(group.id, color);
    }
    setShowColorPicker(false);
  };
  
  // Sauvegarder le nom quand on quitte le champ
  const handleSaveName = () => {
    if (onRename && editedName !== group.name) {
      onRename(group.id, editedName.trim());
    }
  };

  // Style de carte pour chaque item (style bombé)
  const getItemStyle = (itemId) => {
    const style = ITEM_STYLES[itemId] || ITEM_STYLES['default'];
    return style;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Conteneur principal - Fond GRIS TRANSPARENT */}
      <div 
        className="relative w-full max-w-[300px] rounded-[28px] p-5"
        style={{
          background: 'rgba(60, 60, 67, 0.45)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'blur(40px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bulle de couleur en haut à droite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(!showColorPicker);
          }}
          className="absolute top-4 right-4 w-5 h-5 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ 
            backgroundColor: currentColor,
            boxShadow: `0 2px 6px ${currentColor}55`
          }}
        />
        
        {/* Sélecteur de couleur */}
        {showColorPicker && (
          <div 
            className="absolute top-11 right-4 p-2 rounded-2xl shadow-lg flex gap-1.5 flex-wrap max-w-[140px] z-10"
            style={{ background: 'rgba(255,255,255,0.9)' }}
          >
            {GROUP_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-5 h-5 rounded-full transition-all ${
                  currentColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* Champ de nom visible */}
        <div className="mb-4 pr-8">
          <input
            ref={nameInputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveName();
                nameInputRef.current?.blur();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-base font-semibold text-white bg-transparent border-b border-white/40 focus:border-white/70 outline-none pb-1 transition-colors placeholder-white/50"
            placeholder={t('home.groupName', 'Nom du groupe')}
            style={{ caretColor: 'white' }}
          />
        </div>

        {/* Grille des cartes */}
        <div className="grid grid-cols-3 gap-2.5 justify-items-center mb-4">
          {group.items.map((item) => {
            const itemStyle = getItemStyle(item.id);
            const isDeleting = itemToDelete === item.id;
            
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onTouchStart={() => handleLongPressStart(item)}
                onTouchEnd={handleLongPressEnd}
                onTouchMove={handleLongPressEnd}
                className={`
                  flex flex-col items-center gap-1.5 cursor-pointer
                  transition-all duration-200 select-none
                  ${isDeleting ? 'animate-wiggle' : 'active:scale-95'}
                `}
                style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
              >
                {/* Icône avec style bombé */}
                <div 
                  className="relative w-[60px] h-[60px] rounded-[16px] flex items-center justify-center"
                  style={{
                    background: itemStyle?.gradient || 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                    boxShadow: itemStyle?.shadow || '0 4px 12px rgba(0,0,0,0.15)',
                    border: `1px solid ${itemStyle?.border || 'rgba(251, 191, 36, 0.3)'}`
                  }}
                >
                  {/* Voile blanc supprimé */}
                  <span className="text-[22px] relative z-10">{ITEM_ICONS[item.id] || '📌'}</span>
                  
                  {/* Bouton supprimer */}
                  {isDeleting && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-20"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                
                {/* Nom de l'item */}
                <span className="text-white text-[11px] text-center font-medium leading-tight w-[70px] truncate">
                  {ITEM_NAMES[item.id] || item.id}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bouton Fermer - Fond semi-transparent */}
        <button
          onClick={onClose}
          className="w-full p-2.5 rounded-2xl transition-all active:scale-[0.97]"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <span className="font-medium text-white/90 text-sm">
            {t('common.close', 'Fermer')}
          </span>
        </button>

        {/* Instructions */}
        <p className="text-white/50 text-[10px] text-center mt-3">
          {itemToDelete 
            ? t('home.tapToRemove', 'Tapez sur X pour retirer')
            : t('home.longPressToDelete', 'Appui long (1s) pour supprimer')
          }
        </p>
      </div>
    </div>
  );
}

// Zone de drop pour créer un groupe
