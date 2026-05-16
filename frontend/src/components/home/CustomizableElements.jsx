/**
 * CustomizableElements.jsx
 * Éléments personnalisables pour utilisateurs Premium
 * Extraits de CustomizableHome.jsx pour améliorer la maintenabilité
 */

import { useState, useRef } from 'react';
import { X, Move, Minus, Plus } from 'lucide-react';
import { Card } from '../ui/card';
import {
  PreconceptionSection,
  PregnancySection,
  BabyPreparationSection,
  PostpartumSection,
  ServicesSection,
  FaqBabySection,
  SolidaritySection
} from './NavigationSections';

// Durée de l'appui long pour suppression (2 secondes)
const LONG_PRESS_DURATION = 1000;

// Composant d'élément personnalisable pour pages utilisateur (Premium: drag & resize)
export function CustomizableUserElement({
  elementKey,
  customConfig = { visible: true, position: { x: 0, y: 0 }, scale: 1 },
  isPremium = false,
  freeMovementEnabled = false,
  pageId,
  onUpdate,
  onHide,
  children,
  className = '',
}) {
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(customConfig.position || { x: 0, y: 0 });
  const [scale, setScale] = useState(customConfig.scale || 1);
  
  const longPressTimer = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialElementPos = useRef({ x: 0, y: 0 });
  
  // Le déplacement libre n'est actif que si Premium ET freeMovementEnabled
  const canFreeMove = isPremium && freeMovementEnabled;
  
  // Si élément masqué, ne rien afficher
  if (!customConfig.visible) return null;

  // Appui long pour suppression
  const handleLongPressStart = (e) => {
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(100);
      setShowDeleteBtn(true);
      setShowControls(false);
    }, LONG_PRESS_DURATION);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  // Clic pour afficher contrôles Premium (uniquement si déplacement libre activé)
  const handleClick = (e) => {
    e.stopPropagation();
    if (showDeleteBtn) {
      setShowDeleteBtn(false);
      return;
    }
    if (canFreeMove) {
      setShowControls(!showControls);
    }
  };

  // Suppression
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onHide) onHide(pageId, elementKey);
    setShowDeleteBtn(false);
  };

  // Drag (uniquement si déplacement libre activé)
  const handleDragStart = (e) => {
    if (!canFreeMove || !showControls) return;
    e.stopPropagation();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
    initialElementPos.current = { ...position };
  };

  const handleDragMove = (e) => {
    if (!isDragging || !canFreeMove) return;
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
    if (!canFreeMove || !isDragging) return;
    setIsDragging(false);
    if (onUpdate) onUpdate(pageId, elementKey, { position });
  };

  // Redimensionnement (uniquement si déplacement libre activé)
  const handleScaleChange = (newScale) => {
    if (!canFreeMove) return;
    const clampedScale = Math.max(0.5, Math.min(2, newScale));
    setScale(clampedScale);
    if (onUpdate) onUpdate(pageId, elementKey, { scale: clampedScale });
  };

  return (
    <div
      className={`relative inline-block select-none transition-transform ${isDragging ? 'cursor-grabbing z-50' : canFreeMove ? 'cursor-grab' : ''} ${className}`}
      style={{
        transform: canFreeMove ? `translate(${position.x}px, ${position.y}px) scale(${scale})` : undefined,
        transformOrigin: 'center center',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onClick={handleClick}
      onTouchStart={handleLongPressStart}
      onTouchEnd={() => { handleLongPressEnd(); handleDragEnd(); }}
      onTouchMove={(e) => { handleLongPressEnd(); handleDragMove(e); }}
      onMouseDown={(e) => { handleLongPressStart(e); if (canFreeMove && showControls) handleDragStart(e); }}
      onMouseUp={() => { handleLongPressEnd(); handleDragEnd(); }}
      onMouseMove={handleDragMove}
      onMouseLeave={() => { handleLongPressEnd(); handleDragEnd(); }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
      
      {/* Bouton suppression (après appui long) */}
      {showDeleteBtn && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-50 animate-in zoom-in duration-200"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      )}
      
      {/* Contrôles Premium (uniquement si déplacement libre activé) */}
      {showControls && canFreeMove && (
        <div 
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-slate-200 z-50 animate-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
            <Move className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500">Glisser</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScaleChange(scale - 0.1)}
              className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
            >
              <Minus className="w-3 h-3 text-slate-600" />
            </button>
            <span className="text-[10px] text-slate-500 w-8 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => handleScaleChange(scale + 0.1)}
              className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Carte de section pour pages utilisateur (avec suppression par appui long)
export function UserSectionCard({ item, onRemove, pregnancyProfile, hasPregnancyProfile, t }) {
  const [isShaking, setIsShaking] = useState(false);
  const longPressTimer = useRef(null);
  
  // Durée de l'appui long pour suppression (3 secondes)
  const LONG_PRESS_DURATION_SECTION = 1000;
  
  const SECTION_COMPONENTS = {
    'preconception': PreconceptionSection,
    'pregnancy': PregnancySection,
    'baby-preparation': BabyPreparationSection,
    'postpartum': PostpartumSection,
    'services': ServicesSection,
    'faq-baby': FaqBabySection,
    'solidarity': SolidaritySection,
  };
  
  const SECTION_META = {
    'preconception': { bgGradient: 'from-amber-50/80 to-yellow-50/80', borderColor: 'border-amber-200/50' },
    'pregnancy': { bgGradient: 'from-pink-50/80 to-rose-50/80', borderColor: 'border-pink-200/50' },
    'baby-preparation': { bgGradient: 'from-purple-50/80 to-violet-50/80', borderColor: 'border-purple-200/50' },
    'postpartum': { bgGradient: 'from-rose-50/80 to-pink-50/80', borderColor: 'border-rose-200/50' },
    'services': { bgGradient: 'from-slate-50/80 to-gray-50/80', borderColor: 'border-slate-200/50' },
    'faq-baby': { bgGradient: 'from-amber-50/80 to-yellow-50/80', borderColor: 'border-amber-200/50' },
    'solidarity': { bgGradient: 'from-purple-50/80 to-pink-50/80', borderColor: 'border-purple-200/50' },
  };
  
  const meta = SECTION_META[item.id];
  const SectionComponent = SECTION_COMPONENTS[item.id];
  
  if (!meta || !SectionComponent) return null;
  
  const sectionProps = item.id === 'pregnancy' ? { hasPregnancyProfile, pregnancyProfile } : {};

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsShaking(true);
      if (navigator.vibrate) navigator.vibrate(100);
    }, LONG_PRESS_DURATION_SECTION);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsShaking(false);
    onRemove(item.id);
  };

  const handleClickOutside = () => {
    if (isShaking) setIsShaking(false);
  };
  
  return (
    <div 
      className={`relative transition-all duration-300 ${isShaking ? 'animate-wiggle' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClickOutside}
    >
      {isShaking && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
      
      <Card className={`relative overflow-hidden bg-gradient-to-r ${meta.bgGradient} rounded-2xl border ${meta.borderColor} shadow-sm ${isShaking ? 'ring-2 ring-red-300' : ''}`}>
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>
        <div className="px-3 py-2">
          <SectionComponent {...sectionProps} />
        </div>
      </Card>
    </div>
  );
}
