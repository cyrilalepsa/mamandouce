/**
 * HomeModals.jsx
 * Composants modaux pour la page d'accueil
 * Extrait de CustomizableHome.jsx pour améliorer la maintenabilité
 */

import { Trash2, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/input';

/**
 * Popup de confirmation de suppression de page
 */
export function DeletePageConfirmModal({ isVisible, onClose, onConfirm }) {
  const { t } = useTranslation();
  
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Modal */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-xs w-full mx-6 bg-white rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Icône */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #fce7f3 0%, #fecdd3 100%)'
          }}
        >
          <Trash2 className="w-7 h-7 text-rose-400" />
        </div>
        
        {/* Message */}
        <h3 className="text-lg font-bold text-center text-slate-700 mb-2">
          {t('home.deletePageConfirm', 'Supprimer cette page ?')}
        </h3>
        <p className="text-center text-slate-500 text-sm mb-6">
          {t('home.deletePageConfirmDesc', 'Êtes-vous sûr de vouloir supprimer cette page ?')}
        </p>
        
        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 text-slate-600 font-semibold text-base hover:bg-slate-200 transition-all active:scale-95"
          >
            {t('common.no', 'Non')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
              boxShadow: '0 4px 15px rgba(236,72,153,0.3)'
            }}
          >
            {t('common.yes', 'Oui')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Couleurs disponibles pour les groupes
const GROUP_COLORS = [
  '#fde68a', // Jaune
  '#fecdd3', // Rose
  '#bbf7d0', // Vert
  '#bfdbfe', // Bleu
  '#ddd6fe', // Violet
  '#fed7aa', // Orange
  '#99f6e4', // Turquoise
  '#fca5a5', // Rouge clair
];

/**
 * Popup de création de groupe (saisie du nom + couleur)
 */
export function GroupNameModal({ 
  isVisible, 
  groupName, 
  groupColor,
  onGroupNameChange, 
  onGroupColorChange,
  onConfirm, 
  onCancel 
}) {
  const { t } = useTranslation();
  
  if (!isVisible) return null;
  
  // Couleur par défaut si non définie
  const selectedColor = groupColor || GROUP_COLORS[0];

  return (
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      onClick={onCancel}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
    >
      {/* Overlay doux */}
      <div className="absolute inset-0 bg-pink-100/40 backdrop-blur-md"></div>
      
      {/* Modal nuage */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-xs w-full select-none"
        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Effet nuage */}
        <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/60 rounded-full blur-2xl"></div>
        <div className="absolute -top-2 -right-6 w-14 h-14 bg-purple-100/60 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-3 left-1/2 w-20 h-14 bg-blue-100/50 rounded-full blur-2xl"></div>
        
        {/* Contenu */}
        <div 
          className="relative rounded-[28px] p-5 shadow-[0_8px_40px_rgba(147,51,234,0.15)] border border-white/60"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(243,232,255,0.9) 50%, rgba(239,246,255,0.9) 100%)'
          }}
        >
          {/* Icône avec couleur sélectionnée */}
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${selectedColor}99 0%, ${selectedColor} 100%)`
            }}
          >
            <FolderOpen className="w-6 h-6 text-slate-700" />
          </div>
          
          {/* Titre */}
          <h3 className="text-base font-bold text-center text-slate-700 mb-3">
            {t('home.groupNamePrompt', 'Nom du groupe')}
          </h3>
          
          {/* Input - placeholder si vide */}
          <Input
            type="text"
            value={groupName}
            onChange={(e) => onGroupNameChange(e.target.value)}
            placeholder="(optionnel)"
            className="w-full mb-3 rounded-xl border-purple-200 bg-white/80 text-center font-medium placeholder:text-slate-400 placeholder:font-normal"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
          />
          
          {/* Sélecteur de couleur */}
          <div className="flex justify-center gap-2 mb-4">
            {GROUP_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onGroupColorChange?.(color)}
                className={`w-7 h-7 rounded-full transition-all ${
                  selectedColor === color 
                    ? 'ring-2 ring-offset-2 ring-purple-400 scale-110' 
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: color,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(0,0,0,0.1)'
                }}
              />
            ))}
          </div>
          
          {/* Boutons avec effet bombé 3D */}
          <div className="flex gap-3">
            {/* Bouton Annuler */}
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-2xl text-slate-600 font-semibold text-sm transition-all active:scale-95 relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                boxShadow: '0 4px 15px rgba(148, 163, 184, 0.3), inset 0 -3px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(203, 213, 225, 0.5)'
              }}
            >
              <span className="relative z-10">{t('common.cancel', 'Annuler')}</span>
              <div 
                className="absolute top-0 left-1 right-1 h-[45%] rounded-full pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 100%)' }}
              />
            </button>
            {/* Bouton OK */}
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-2xl text-white font-semibold text-sm transition-all active:scale-95 relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #c4b5fd 0%, #a78bfa 50%, #8b5cf6 100%)',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4), inset 0 -3px 8px rgba(0,0,0,0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}
            >
              <span className="relative z-10">OK</span>
              <div 
                className="absolute top-0 left-1 right-1 h-[45%] rounded-full pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)' }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Popup pour créer une nouvelle page
 */
export function CreatePageModal({ isVisible, onClose, onConfirm }) {
  const { t } = useTranslation();
  
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-[32px] p-6 shadow-2xl mx-6 max-w-xs w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">✨</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">
            {t('home.createPage', 'Créer une page')}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {t('home.createPageDesc', 'Créez votre page personnalisée')}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-all active:scale-95"
            >
              {t('common.cancel', 'Annuler')}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-lg shadow-pink-500/25 transition-all active:scale-95"
            >
              {t('common.create', 'Créer')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeletePageConfirmModal;
