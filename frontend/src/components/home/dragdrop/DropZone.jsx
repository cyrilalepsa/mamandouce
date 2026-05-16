import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, X, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { useTheme } from '../../../contexts/ThemeContext';

import { ITEM_ICONS, ITEM_NAMES, ITEM_TRANSLATION_KEYS, ITEM_STYLES, ITEM_ROUTES, GROUP_COLORS } from './constants';

// Composant pour un item draggable
export function DropZone({ onDrop, isActive, children }) {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('itemId');
    if (draggedItemId) {
      onDrop?.(draggedItemId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        min-h-[100px] rounded-2xl border-2 border-dashed
        transition-all duration-200
        ${isActive 
          ? 'border-pink-400 bg-pink-50/50' 
          : 'border-slate-200 bg-slate-50/30'
        }
      `}
    >
      {children}
    </div>
  );
}

