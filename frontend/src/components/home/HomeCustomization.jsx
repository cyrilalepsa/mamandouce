import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Pencil, Check, Trash2, RotateCcw, Sparkles, Crown, GripVertical } from 'lucide-react';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';
import { useSubscription } from '../SubscriptionGate';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

// Bulles de pagination (comme sur smartphone)
export function PageDots({ pages, currentIndex, onPageChange, isEditMode, onAddPage }) {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {pages.map((page, index) => (
        <button
          key={page.id}
          onClick={() => onPageChange(index)}
          className={`transition-all duration-300 ${
            currentIndex === index
              ? 'w-6 h-2 bg-pink-500 rounded-full'
              : 'w-2 h-2 bg-slate-300 rounded-full hover:bg-slate-400'
          }`}
          title={page.name}
        />
      ))}
      
      {/* Bouton ajouter une page */}
      {isEditMode && (
        <button
          onClick={onAddPage}
          className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all ml-2"
          title={t('home.addPage', 'Ajouter une page')}
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </button>
      )}
    </div>
  );
}

// Header de la page avec nom éditable
export function PageHeader({ page, isEditMode, onRename, onDelete, isDefault }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(page.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (name.trim()) {
      onRename(page.id, name.trim());
    }
    setIsEditing(false);
  };

  if (!isEditMode || isDefault) {
    return page.isDefault ? null : (
      <div className="text-center mb-4">
        <span className="text-lg font-bold text-slate-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {page.name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-40 text-center rounded-full"
            maxLength={20}
          />
          <Button
            onClick={handleSave}
            size="sm"
            className="rounded-full bg-green-500 hover:bg-green-600 p-2"
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {page.name}
          </span>
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="ghost"
            className="rounded-full p-1"
          >
            <Pencil className="w-4 h-4 text-slate-400" />
          </Button>
          {!isDefault && (
            <Button
              onClick={() => onDelete(page.id)}
              size="sm"
              variant="ghost"
              className="rounded-full p-1 text-red-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Bannière tutoriel pour découvrir la fonctionnalité
export function LayoutTutorialBanner({ onDismiss, onStartEdit }) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-4 text-white shadow-lg animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">
            {t('home.customizeTitle', 'Personnalisez votre accueil !')}
          </h3>
          <p className="text-sm text-white/90 mb-3">
            {t('home.customizeDescription', 'Appuyez longuement sur un élément pour le déplacer, créez vos propres pages et organisez votre espace comme sur votre smartphone.')}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={onStartEdit}
              className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-4 py-1 text-sm font-semibold"
            >
              {t('home.tryNow', 'Essayer')}
            </Button>
            <Button
              onClick={onDismiss}
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-4 py-1 text-sm"
            >
              {t('common.later', 'Plus tard')}
            </Button>
          </div>
        </div>
        <button onClick={onDismiss} className="text-white/60 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Bouton mode édition flottant
export function EditModeButton({ isEditMode, onToggle }) {
  const { t } = useTranslation();
  
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
        isEditMode 
          ? 'bg-green-500 hover:bg-green-600 scale-110' 
          : 'bg-purple-500 hover:bg-purple-600'
      }`}
      title={isEditMode ? t('home.saveChanges', 'Enregistrer') : t('home.editLayout', 'Personnaliser')}
    >
      {isEditMode ? (
        <Check className="w-6 h-6 text-white" />
      ) : (
        <Pencil className="w-5 h-5 text-white" />
      )}
    </button>
  );
}

// Bouton réinitialiser
export function ResetLayoutButton({ onReset }) {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleReset = () => {
    onReset();
    setShowConfirm(false);
  };
  
  if (showConfirm) {
    return (
      <div className="fixed bottom-24 left-4 z-40 bg-white rounded-2xl shadow-lg p-3 animate-fade-in">
        <p className="text-sm text-slate-600 mb-2">{t('home.confirmReset', 'Réinitialiser la disposition ?')}</p>
        <div className="flex gap-2">
          <Button onClick={handleReset} size="sm" className="bg-red-500 hover:bg-red-600 rounded-full">
            {t('common.yes', 'Oui')}
          </Button>
          <Button onClick={() => setShowConfirm(false)} size="sm" variant="outline" className="rounded-full">
            {t('common.no', 'Non')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="fixed bottom-24 left-4 z-40 w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 shadow-lg flex items-center justify-center transition-all"
      title={t('home.resetLayout', 'Réinitialiser')}
    >
      <RotateCcw className="w-5 h-5 text-slate-600" />
    </button>
  );
}

// Wrapper pour les éléments déplaçables avec appui long
export function DraggableItem({ children, itemId, isEditMode, onLongPress, isDragging }) {
  const longPressTimer = useRef(null);
  const [isPressed, setIsPressed] = useState(false);
  
  const handleTouchStart = (e) => {
    if (!isEditMode) {
      longPressTimer.current = setTimeout(() => {
        setIsPressed(true);
        onLongPress?.(itemId);
        // Vibration feedback si disponible
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500); // 500ms pour appui long
    }
  };
  
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsPressed(false);
  };
  
  const handleMouseDown = (e) => {
    if (!isEditMode) {
      longPressTimer.current = setTimeout(() => {
        setIsPressed(true);
        onLongPress?.(itemId);
      }, 500);
    }
  };
  
  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsPressed(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative transition-all duration-200 ${
        isEditMode ? 'animate-wiggle' : ''
      } ${isDragging ? 'opacity-50 scale-105' : ''} ${isPressed ? 'scale-95' : ''}`}
    >
      {/* Indicateur de drag en mode édition */}
      {isEditMode && (
        <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
          <GripVertical className="w-3 h-3 text-white" />
        </div>
      )}
      {children}
    </div>
  );
}

// Badge Premium pour les fonctionnalités Phase 2
export function PremiumFeatureBadge({ feature }) {
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  
  if (isPremium) return null;
  
  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
      <div className="text-center text-white p-4">
        <Crown className="w-8 h-8 mx-auto mb-2 text-amber-400" />
        <p className="text-sm font-semibold">{t('premium.feature', 'Fonctionnalité Premium')}</p>
      </div>
    </div>
  );
}

// Animation CSS pour le mode édition (wiggle)
export const editModeStyles = `
  @keyframes wiggle {
    0%, 100% { transform: rotate(-1deg); }
    50% { transform: rotate(1deg); }
  }
  
  .animate-wiggle {
    animation: wiggle 0.3s ease-in-out infinite;
  }
`;
