import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, X, ChevronRight, GripVertical } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

// Icônes pour les items
const ITEM_ICONS = {
  'preconception': '✨',
  'pregnancy': '🤰',
  'baby-preparation': '🎁',
  'postpartum': '💕',
  'services': '⚙️',
  'cycle-tracking': '📅',
  'fertility-calculator': '📊',
  'preconception-tips': '💡',
  'food-scanner': '📷',
  'food-library': '🍎',
  'favorites': '❤️',
  'history': '📜',
  'baby-names': '👶',
  'tips-evolution': '📖',
  'medical-appointments': '🩺',
  'pregnancy-tracking': '📈',
  'reminders': '🔔',
  'parental-leave': '⚖️',
  'maternity-bag': '👜',
  'birth-list': '📝',
  'preparation-tips': '💝',
  'postpartum-appointments': '🏥',
  'postpartum-difficulties': '⚠️',
  'postpartum-breastfeeding': '💗',
  'postpartum-formula': '🍼',
  'postpartum-diapers': '💧',
  'postpartum-babywearing': '🤱',
  'chatbot': '🤖',
  'caf': '🏛️',
  'ameli': '🏥',
  'mairie': '📍',
  'videos': '🎬',
};

const ITEM_NAMES = {
  'preconception': 'Préconception',
  'pregnancy': 'Grossesse',
  'baby-preparation': 'Préparation bébé',
  'postpartum': 'Post-partum',
  'services': 'Services',
  'cycle-tracking': 'Suivi de cycles',
  'fertility-calculator': 'Calculateur fertilité',
  'preconception-tips': 'Préparation et conseils',
  'food-scanner': 'Scanner',
  'food-library': 'Bibliothèque',
  'favorites': 'Favoris',
  'history': 'Historique',
  'baby-names': 'Prénoms',
  'tips-evolution': 'Conseils',
  'medical-appointments': 'RDV médicaux',
  'pregnancy-tracking': 'Suivi grossesse',
  'reminders': 'Rappels',
  'parental-leave': 'Congés parentaux',
  'maternity-bag': 'Valise maternité',
  'birth-list': 'Liste de naissance',
  'preparation-tips': 'Conseils préparation',
  'postpartum-appointments': 'RDV post-partum',
  'postpartum-difficulties': 'Difficultés courantes',
  'postpartum-breastfeeding': 'Allaitement',
  'postpartum-formula': 'Biberon',
  'postpartum-diapers': 'Couches',
  'postpartum-babywearing': 'Portage bébé',
  'chatbot': 'Assistant IA',
  'caf': 'CAF',
  'ameli': 'Ameli',
  'mairie': 'Mairie proche',
  'videos': 'Vidéos',
};

// Routes pour chaque item
const ITEM_ROUTES = {
  'preconception': '/section/preconception',
  'pregnancy': '/section/pregnancy',
  'baby-preparation': '/section/baby-preparation',
  'postpartum': '/postpartum',
  'services': '/section/services',
  'cycle-tracking': '/cycle-tracking',
  'fertility-calculator': '/fertility-calculator',
  'preconception-tips': '/preconception-tips',
  'food-scanner': '/scanner',
  'food-library': '/food-library',
  'favorites': '/favorites',
  'history': '/history',
  'baby-names': '/baby-names',
  'tips-evolution': '/tips',
  'medical-appointments': '/medical',
  'pregnancy-tracking': '/tracking',
  'reminders': '/reminders',
  'parental-leave': '/parental-leave',
  'maternity-bag': '/maternity-bag',
  'birth-list': '/birth-list',
  'preparation-tips': '/tips',
  'postpartum-appointments': '/postpartum?section=appointments',
  'postpartum-difficulties': '/postpartum?section=difficulties',
  'postpartum-breastfeeding': '/postpartum?section=breastfeeding',
  'postpartum-formula': '/postpartum?section=formula',
  'postpartum-diapers': '/postpartum?section=diapers',
  'postpartum-babywearing': '/postpartum?section=babywearing',
  'chatbot': '/chatbot',
  'caf': 'https://www.caf.fr',
  'ameli': 'https://www.ameli.fr',
  'mairie': '/mairie',
  'videos': '/videos',
};

// Composant pour un item draggable
export function DraggableItem({ 
  item, 
  onDragStart, 
  onDragEnd, 
  onDrop, 
  isDragging,
  isDropTarget,
  onRemove,
  onLongPress,
  showDeleteButton = false
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const [showDelete, setShowDelete] = useState(showDeleteButton);
  
  const icon = ITEM_ICONS[item.id] || '📄';
  const name = ITEM_NAMES[item.id] || item.id;
  const route = ITEM_ROUTES[item.id];

  // Synchroniser avec la prop externe
  useEffect(() => {
    setShowDelete(showDeleteButton);
  }, [showDeleteButton]);

  const handleTouchStart = (e) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      // Après appui long, montrer le bouton supprimer
      setShowDelete(true);
      onLongPress?.(item);
    }, 500);
  };

  const handleTouchEnd = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Gérer le clic pour naviguer (seulement si pas de long press)
  const handleClick = (e) => {
    // Ne pas naviguer si on est en mode suppression ou si c'était un long press
    if (showDelete || isLongPress.current) {
      if (showDelete) setShowDelete(false);
      return;
    }
    
    if (route) {
      // Liens externes
      if (route.startsWith('http')) {
        window.open(route, '_blank');
      } else {
        navigate(route);
      }
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('itemId', item.id);
    e.dataTransfer.setData('itemType', 'item');
    onDragStart?.(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('itemId');
    if (draggedItemId && draggedItemId !== item.id) {
      onDrop?.(draggedItemId, item.id);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={() => clearTimeout(longPressTimer.current)}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => clearTimeout(longPressTimer.current)}
      onClick={handleClick}
      className={`
        relative bg-white rounded-2xl p-3 shadow-sm border
        cursor-pointer
        transition-all duration-200
        hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isDropTarget ? 'ring-2 ring-pink-400 scale-105 bg-pink-50' : 'border-slate-100'}
        ${showDelete ? 'animate-wiggle' : ''}
      `}
    >
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
      
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-slate-300" />
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-slate-700 truncate">{name}</span>
      </div>
    </div>
  );
}

// Composant pour un groupe (dossier)
export function ItemGroup({ 
  group, 
  onOpen, 
  onRename, 
  onDelete,
  onRemoveItem,
  onDrop,
  isDropTarget
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);

  const handleRename = () => {
    if (editName.trim() && editName !== group.name) {
      onRename?.(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('itemId');
    const draggedType = e.dataTransfer.getData('itemType');
    if (draggedItemId && draggedType === 'item') {
      onDrop?.(draggedItemId, group.id);
    }
  };

  // Afficher les 4 premiers items en miniature
  const previewItems = group.items.slice(0, 4);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative bg-gradient-to-br from-slate-50 to-slate-100 
        rounded-2xl p-3 shadow-sm border cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${isDropTarget ? 'ring-2 ring-purple-400 scale-105 bg-purple-50' : 'border-slate-200'}
      `}
      onClick={() => onOpen?.(group)}
    >
      {/* Bouton supprimer groupe */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(group.id);
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-red-600 transition-colors"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </button>

      {/* Grille de miniatures (style iOS) */}
      <div className="grid grid-cols-2 gap-1 mb-2">
        {previewItems.map((item, index) => (
          <div 
            key={item.id} 
            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-inner"
          >
            {ITEM_ICONS[item.id] || '📌'}
          </div>
        ))}
        {previewItems.length < 4 && Array(4 - previewItems.length).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8 bg-slate-50 rounded-lg"></div>
        ))}
      </div>

      {/* Nom du groupe */}
      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          className="text-xs h-6 text-center"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p 
          className="text-xs font-medium text-slate-600 text-center truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {group.name}
        </p>
      )}

      {/* Badge nombre d'items */}
      <span className="absolute top-1 left-1 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
        {group.items.length}
      </span>
    </div>
  );
}

// Popup pour voir le contenu d'un groupe ouvert
export function GroupContentPopup({ group, onClose, onRemoveItem, t }) {
  if (!group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div 
        className="relative bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-2xl border border-white/50 mx-4 max-w-sm w-full max-h-[70vh] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(243,232,255,0.9) 100%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-700">{group.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Liste des items */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {group.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{ITEM_ICONS[item.id] || '📌'}</span>
                <span className="font-medium text-slate-700">
                  {ITEM_NAMES[item.id] || item.id}
                </span>
              </div>
              <button
                onClick={() => onRemoveItem?.(item.id)}
                className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400 text-center mt-4">
          {t('home.dragOutToRemove', 'Cliquez sur X pour retirer du groupe')}
        </p>
      </div>
    </div>
  );
}

// Zone de drop pour créer un groupe
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

export default { DraggableItem, ItemGroup, GroupContentPopup, DropZone };
