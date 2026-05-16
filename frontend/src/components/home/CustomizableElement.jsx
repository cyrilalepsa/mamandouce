// Composant pour élément personnalisable (logo, avatar, greeting, pageName)
// - Déplaçable (drag & drop) pour Premium
// - Redimensionnable (slider au clic) pour Premium
// - Supprimable (appui long 3s) pour tous

import { useState, useRef, useEffect } from 'react';
import { X, Move, Minus, Plus } from 'lucide-react';

// Durée de l'appui long pour suppression (3 secondes)
const LONG_PRESS_DURATION = 1000;

// Composant wrapper pour élément personnalisable
export function CustomizableElement({
  elementKey,
  customConfig = { visible: true, position: { x: 0, y: 0 }, scale: 1 },
  isPremium = false,
  onUpdate,
  onHide,
  children,
  className = '',
  minScale = 0.5,
  maxScale = 2,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [position, setPosition] = useState(customConfig.position || { x: 0, y: 0 });
  const [scale, setScale] = useState(customConfig.scale || 1);
  
  const elementRef = useRef(null);
  const longPressTimer = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialElementPos = useRef({ x: 0, y: 0 });

  // Synchroniser avec la config externe
  useEffect(() => {
    if (customConfig.position) {
      setPosition(customConfig.position);
    }
    if (customConfig.scale !== undefined) {
      setScale(customConfig.scale);
    }
  }, [customConfig]);

  // Si élément masqué, ne rien afficher
  if (!customConfig.visible) {
    return null;
  }

  // Gestion de l'appui long (3s) pour suppression
  const handleLongPressStart = (e) => {
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(100);
      setShowDeleteBtn(true);
      setShowControls(false);
    }, LONG_PRESS_DURATION);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Clic simple pour afficher les contrôles (Premium seulement)
  const handleClick = (e) => {
    e.stopPropagation();
    if (showDeleteBtn) {
      // Cacher le bouton suppression si on clique ailleurs
      setShowDeleteBtn(false);
      return;
    }
    if (isPremium) {
      setShowControls(!showControls);
    }
  };

  // Suppression de l'élément
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onHide) {
      onHide(elementKey);
    }
    setShowDeleteBtn(false);
  };

  // Drag & Drop (Premium seulement)
  const handleDragStart = (e) => {
    if (!isPremium) return;
    e.stopPropagation();
    setIsDragging(true);
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    dragStartPos.current = { x: clientX, y: clientY };
    initialElementPos.current = { ...position };
  };

  const handleDragMove = (e) => {
    if (!isDragging || !isPremium) return;
    e.stopPropagation();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    
    setPosition({
      x: initialElementPos.current.x + deltaX,
      y: initialElementPos.current.y + deltaY
    });
  };

  const handleDragEnd = () => {
    if (!isPremium) return;
    setIsDragging(false);
    
    // Sauvegarder la nouvelle position
    if (onUpdate) {
      onUpdate(elementKey, { position });
    }
  };

  // Redimensionnement (Premium seulement)
  const handleScaleChange = (newScale) => {
    if (!isPremium) return;
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
    setScale(clampedScale);
    
    if (onUpdate) {
      onUpdate(elementKey, { scale: clampedScale });
    }
  };

  // Fermer les contrôles en cliquant ailleurs
  const handleClickOutside = () => {
    setShowControls(false);
    setShowDeleteBtn(false);
  };

  return (
    <div
      ref={elementRef}
      className={`
        relative inline-block select-none transition-transform
        ${isDragging ? 'cursor-grabbing z-50' : isPremium ? 'cursor-grab' : ''}
        ${className}
      `}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        transformOrigin: 'center center',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onClick={handleClick}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
      onTouchMove={(e) => {
        handleLongPressEnd();
        handleDragMove(e);
      }}
      onMouseDown={(e) => {
        handleLongPressStart(e);
        if (isPremium && showControls) {
          handleDragStart(e);
        }
      }}
      onMouseUp={() => {
        handleLongPressEnd();
        handleDragEnd();
      }}
      onMouseMove={handleDragMove}
      onMouseLeave={() => {
        handleLongPressEnd();
        handleDragEnd();
      }}
      onContextMenu={(e) => e.preventDefault()}
      data-customizable-element={elementKey}
    >
      {/* Contenu de l'élément */}
      {children}
      
      {/* Bouton suppression (apparaît après appui long 3s) */}
      {showDeleteBtn && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-50 animate-in zoom-in duration-200"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      )}
      
      {/* Contrôles Premium (apparaît au clic) */}
      {showControls && isPremium && (
        <div 
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-slate-200 z-50 animate-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Indicateur de déplacement */}
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
            <Move className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500">Glisser</span>
          </div>
          
          {/* Contrôle de taille */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScaleChange(scale - 0.1)}
              className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
              disabled={scale <= minScale}
            >
              <Minus className="w-3 h-3 text-slate-600" />
            </button>
            <span className="text-[10px] text-slate-500 w-8 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleScaleChange(scale + 0.1)}
              className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
              disabled={scale >= maxScale}
            >
              <Plus className="w-3 h-3 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomizableElement;
